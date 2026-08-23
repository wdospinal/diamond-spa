/**
 * Extracción mínima del cuerpo de un correo RFC 822 — sin dependencias, igual
 * criterio que kv.ts / supabase.ts. Solo cubre lo necesario para leer los
 * correos de cierre de Bold: cabeceras, multipart, quoted-printable, base64 y
 * las dos codificaciones de caracteres que aparecen en la práctica.
 *
 * El correo entra como string en latin1 (un byte = un carácter), que es como lo
 * entrega el cliente IMAP: así los offsets no se corrompen y la decodificación
 * a UTF-8 se hace al final, ya conocida la codificación de cada parte.
 */

export interface ParsedMessage {
  headers: Record<string, string>
  /** Mejor cuerpo textual encontrado, ya decodificado a UTF-8. */
  text: string
  /** true si el texto proviene de una parte text/html. */
  isHtml: boolean
}

function decodeBytes(latin1: string, charset: string): string {
  const cs = charset.toLowerCase()
  if (cs.includes('utf-8') || cs.includes('utf8')) return Buffer.from(latin1, 'latin1').toString('utf8')
  return latin1 // iso-8859-1 / windows-1252: latin1 ya es correcto para nuestro caso
}

function decodeQuotedPrintable(s: string): string {
  return s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function decodeTransfer(body: string, encoding: string): string {
  const enc = encoding.toLowerCase().trim()
  if (enc === 'base64') return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('latin1')
  if (enc === 'quoted-printable') return decodeQuotedPrintable(body)
  return body
}

/** Decodifica encoded-words RFC 2047 (`=?UTF-8?B?…?=`) en cabeceras. */
export function decodeHeaderValue(value: string): string {
  return value.replace(/=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g, (_, charset: string, enc: string, data: string) => {
    const bytes = enc.toUpperCase() === 'B'
      ? Buffer.from(data, 'base64').toString('latin1')
      : decodeQuotedPrintable(data.replace(/_/g, ' '))
    return decodeBytes(bytes, charset)
  })
}

function splitHeaders(raw: string): { headers: Record<string, string>; body: string } {
  const sep = raw.search(/\r?\n\r?\n/)
  const head = sep === -1 ? raw : raw.slice(0, sep)
  const body = sep === -1 ? '' : raw.slice(sep).replace(/^\r?\n\r?\n/, '')

  const headers: Record<string, string> = {}
  // Desdoblar cabeceras continuadas (líneas que empiezan por espacio o tab).
  for (const line of head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) headers[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim()
  }
  return { headers, body }
}

function paramOf(headerValue: string, name: string): string {
  const m = new RegExp(`${name}\\s*=\\s*"?([^";]+)"?`, 'i').exec(headerValue)
  return m ? m[1].trim() : ''
}

/** Recorre el árbol MIME y devuelve la mejor parte textual. */
function pickBody(raw: string): { text: string; isHtml: boolean } {
  const { headers, body } = splitHeaders(raw)
  const contentType = headers['content-type'] ?? 'text/plain'
  const type = contentType.split(';')[0].trim().toLowerCase()

  if (type.startsWith('multipart/')) {
    const boundary = paramOf(contentType, 'boundary')
    if (!boundary) return { text: '', isHtml: false }
    const parts = body.split(new RegExp(`--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(--)?\\r?\\n?`))
    let html: string | null = null
    for (const part of parts) {
      if (!part || !part.includes(':')) continue
      const found = pickBody(part)
      if (!found.text.trim()) continue
      // text/plain gana; el HTML se guarda por si no hay alternativa en texto.
      if (!found.isHtml) return found
      if (html === null) html = found.text
    }
    return html === null ? { text: '', isHtml: false } : { text: html, isHtml: true }
  }

  if (!type.startsWith('text/')) return { text: '', isHtml: false }

  const decoded = decodeTransfer(body, headers['content-transfer-encoding'] ?? '')
  return {
    text: decodeBytes(decoded, paramOf(contentType, 'charset') || 'utf-8'),
    isHtml: type === 'text/html',
  }
}

/** Cabeceras + mejor cuerpo textual de un mensaje RFC 822 completo. */
export function parseMessage(raw: string): ParsedMessage {
  const { headers } = splitHeaders(raw)
  const { text, isHtml } = pickBody(raw)
  return { headers, text, isHtml }
}
