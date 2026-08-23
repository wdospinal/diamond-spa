/**
 * Cliente IMAP mínimo sobre TLS — sin dependencias npm, mismo criterio que
 * kv.ts y supabase.ts. Solo implementa lo justo para leer los correos de cierre
 * de Bold del buzón de Hostinger: LOGIN → SELECT → UID SEARCH → UID FETCH.
 *
 * Solo lectura: se usa BODY.PEEK[] para no marcar los correos como leídos, y
 * nunca se borra ni se mueve nada del buzón.
 *
 * El protocolo es de líneas terminadas en CRLF, salvo por los "literales":
 * una línea que termina en `{1234}` va seguida de exactamente 1234 bytes
 * crudos que pueden contener CRLF e incluso algo que parezca el fin del
 * comando. Por eso la lectura no busca el tag a ciegas: salta los literales
 * contando bytes, y de paso los va guardando (son los mensajes completos).
 */

import { connect, type TLSSocket } from 'tls'

export interface ImapConn {
  host: string
  port: number
  user: string
  pass: string
}

export function imapEnv(): ImapConn | null {
  const host = process.env.BOLD_IMAP_HOST?.trim()
  const user = process.env.BOLD_IMAP_USER?.trim()
  const pass = process.env.BOLD_IMAP_PASSWORD
  if (!host || !user || !pass) return null
  return { host, port: Number(process.env.BOLD_IMAP_PORT ?? 993) || 993, user, pass }
}

export function imapConfigured(): boolean {
  return imapEnv() !== null
}

export interface FetchedMessage {
  /** Header `Message-ID`, o `imap:<host>:<uid>` si el correo no trae uno. */
  messageId: string
  /** Header `Date` tal cual (sin parsear). */
  date: string
  subject: string
  /** Mensaje RFC 822 completo, en latin1 — para pasar a parseMessage(). */
  raw: string
}

const CRLF = '\r\n'
const MONTHS_IMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Fecha en el formato que exige IMAP SEARCH: 01-Aug-2026. */
export function imapDate(d: Date): string {
  return `${String(d.getUTCDate()).padStart(2, '0')}-${MONTHS_IMAP[d.getUTCMonth()]}-${d.getUTCFullYear()}`
}

/**
 * Conversación con el servidor. Mantiene el buffer acumulado y resuelve cada
 * comando cuando aparece su línea de cierre (`tag OK|NO|BAD`).
 */
class ImapSession {
  private buffer = Buffer.alloc(0)
  private tagSeq = 0
  private pending: { tag: string; resolve: (v: string) => void; reject: (e: Error) => void } | null = null
  /** Literales del comando en curso, en orden de aparición. */
  private literals: string[] = []

  private socket: TLSSocket

  constructor(socket: TLSSocket) {
    this.socket = socket
    socket.on('data', (chunk: Buffer | string) => {
      this.buffer = Buffer.concat([
        this.buffer,
        typeof chunk === 'string' ? Buffer.from(chunk, 'latin1') : chunk,
      ])
      this.drain()
    })
  }

  /** ¿Está completa la respuesta del comando en curso? Si sí, la entrega. */
  private drain(): void {
    if (!this.pending) return
    const text = this.buffer.toString('latin1')
    let pos = 0
    const literals: string[] = []

    for (;;) {
      const eol = text.indexOf(CRLF, pos)
      if (eol === -1) return // falta la línea completa
      const line = text.slice(pos, eol)

      const literal = /\{(\d+)\}$/.exec(line)
      if (literal) {
        const size = Number(literal[1])
        const start = eol + CRLF.length
        if (text.length < start + size) return // falta el literal completo
        literals.push(text.slice(start, start + size))
        pos = start + size
        continue
      }

      if (line.startsWith(`${this.pending.tag} `)) {
        const status = line.slice(this.pending.tag.length + 1, this.pending.tag.length + 4).toUpperCase()
        const { resolve, reject } = this.pending
        this.pending = null
        this.literals = literals
        // latin1 es 1 byte por carácter, así que el offset de texto es el de bytes.
        this.buffer = this.buffer.subarray(eol + CRLF.length)
        if (status.startsWith('OK')) resolve(text.slice(0, eol))
        // La respuesta puede traer la contraseña en el eco del comando, así que
        // se reporta solo el estado y la línea final, nunca lo enviado.
        else reject(new Error(`IMAP ${line.trim()}`))
        return
      }

      pos = eol + CRLF.length
    }
  }

  /** Descarta el saludo inicial del servidor (`* OK …`). */
  waitGreeting(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const finish = (fn: () => void) => {
        clearTimeout(timer)
        this.socket.off('data', check)
        fn()
      }
      const check = () => {
        const i = this.buffer.indexOf(CRLF)
        if (i !== -1) {
          finish(() => {
            this.buffer = this.buffer.subarray(i + CRLF.length)
            resolve()
          })
        }
      }
      const timer = setTimeout(() => finish(() => reject(new Error('IMAP: sin saludo del servidor'))), timeoutMs)
      this.socket.on('data', check)
      check()
    })
  }

  async run(command: string, timeoutMs: number): Promise<{ response: string; literals: string[] }> {
    const tag = `A${String(++this.tagSeq).padStart(3, '0')}`
    const response = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null
        reject(new Error(`IMAP: tiempo agotado en ${command.split(' ')[0]}`))
      }, timeoutMs)
      this.pending = {
        tag,
        resolve: v => { clearTimeout(timer); resolve(v) },
        reject: e => { clearTimeout(timer); reject(e) },
      }
      this.socket.write(`${tag} ${command}${CRLF}`)
      this.drain()
    })
    return { response, literals: this.literals }
  }
}

function quote(s: string): string {
  return `"${s.replace(/[\\"]/g, m => `\\${m}`)}"`
}

export interface FetchOptions {
  /** Remitente por el que filtra el SEARCH. */
  from: string
  /** Solo correos recibidos desde esta fecha (inclusive). */
  since: Date
  /** Tope de correos a descargar en una corrida. Los más recientes primero. */
  limit?: number
  /** Timeout por comando. */
  timeoutMs?: number
  mailbox?: string
}

/**
 * Descarga los correos que coinciden con el filtro. Cierra siempre el socket.
 */
export async function fetchMessages(opts: FetchOptions): Promise<FetchedMessage[]> {
  const conn = imapEnv()
  if (!conn) throw new Error('IMAP no configurado (BOLD_IMAP_HOST / _USER / _PASSWORD)')

  const timeoutMs = opts.timeoutMs ?? 20_000
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500)

  const socket = await new Promise<TLSSocket>((resolve, reject) => {
    const s = connect({ host: conn.host, port: conn.port, servername: conn.host }, () => resolve(s))
    s.setTimeout(timeoutMs, () => s.destroy(new Error('IMAP: conexión sin respuesta')))
    s.once('error', reject)
  })

  // Tras conectar, un 'error' sin listener tumbaría el proceso: se absorbe y se
  // deja que el timeout de cada comando corte la operación.
  socket.on('error', () => {})

  try {
    const session = new ImapSession(socket)
    await session.waitGreeting(timeoutMs)
    await session.run(`LOGIN ${quote(conn.user)} ${quote(conn.pass)}`, timeoutMs)
    await session.run(`EXAMINE ${quote(opts.mailbox ?? 'INBOX')}`, timeoutMs)

    const search = await session.run(
      `UID SEARCH FROM ${quote(opts.from)} SINCE ${imapDate(opts.since)}`,
      timeoutMs,
    )
    const uids = (/^\* SEARCH([\d ]*)/m.exec(search.response)?.[1] ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (uids.length === 0) {
      await session.run('LOGOUT', timeoutMs).catch(() => {})
      return []
    }

    // Los más recientes primero: si hay que truncar, se prefiere lo nuevo.
    const wanted = uids.slice(-limit)
    const fetched = await session.run(`UID FETCH ${wanted.join(',')} (BODY.PEEK[])`, timeoutMs)
    await session.run('LOGOUT', timeoutMs).catch(() => {})

    return fetched.literals.map((raw, i) => {
      const head = raw.slice(0, raw.search(/\r?\n\r?\n/) + 1 || raw.length).replace(/\r?\n[ \t]+/g, ' ')
      const pick = (name: string) =>
        new RegExp(`^${name}:\\s*(.*)$`, 'im').exec(head)?.[1]?.trim() ?? ''
      return {
        messageId: pick('Message-ID') || `imap:${conn.host}:${wanted[i] ?? i}`,
        date: pick('Date'),
        subject: pick('Subject'),
        raw,
      }
    })
  } finally {
    socket.destroy()
  }
}
