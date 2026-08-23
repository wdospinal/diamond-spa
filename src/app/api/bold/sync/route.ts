import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { parseBoldClosing } from '@/lib/bold-parser'
import { saveClosings } from '@/lib/bold-store'
import { fetchMessages, imapConfigured } from '@/lib/imap'
import { decodeHeaderValue, parseMessage } from '@/lib/mime'
import type { BoldClosing } from '@/lib/bold-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const DEFAULT_LOOKBACK_DAYS = 5

/**
 * Doble puerta: el cron de Vercel manda `Authorization: Bearer $CRON_SECRET`,
 * y el botón "Sincronizar ahora" del panel manda la cookie de sesión de admin.
 */
async function authorize(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth === `Bearer ${secret}`) return true
  return verifySessionToken((await cookies()).get(adminCookieName())?.value)
}

/**
 * Lee el buzón por IMAP, parsea los correos de cierre de Bold y los guarda.
 *
 * Query:
 *  - `?since=YYYY-MM-DD` desde cuándo buscar (por defecto, 5 días atrás).
 *  - `?before=YYYY-MM-DD` techo del rango, exclusivo. Junto con `since` define
 *    la ventana del barrido histórico: sin techo, un buzón con más correos que
 *    `limit` devolvería siempre los mismos más recientes y los meses viejos no
 *    entrarían nunca.
 *  - `?limit=N` tope de correos por corrida (por defecto 50, máx 500).
 *  - `?dry=1` parsea y devuelve sin escribir nada.
 *
 * Si en la respuesta `matched` es mayor que `scanned`, la ventana se quedó
 * corta: hay correos más antiguos sin leer y hay que estrecharla (o subir el
 * tope).
 */
async function sync(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!imapConfigured()) {
    return NextResponse.json(
      { error: 'IMAP no configurado. Falta BOLD_IMAP_HOST / BOLD_IMAP_USER / BOLD_IMAP_PASSWORD.' },
      { status: 503 },
    )
  }

  const { searchParams } = req.nextUrl
  const sinceParam = searchParams.get('since') ?? ''
  const since = DAY_RE.test(sinceParam)
    ? new Date(`${sinceParam}T00:00:00Z`)
    : new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 86_400_000)
  const beforeParam = searchParams.get('before') ?? ''
  const before = DAY_RE.test(beforeParam) ? new Date(`${beforeParam}T00:00:00Z`) : undefined
  const limit = Number(searchParams.get('limit') ?? 50)
  const dry = searchParams.get('dry') === '1'

  const errors: string[] = []
  let matched = 0
  let messages: Awaited<ReturnType<typeof fetchMessages>>['messages'] = []
  try {
    const result = await fetchMessages({
      from: process.env.BOLD_SENDER ?? 'no-responder@bold.co',
      since,
      before,
      limit: Number.isFinite(limit) ? limit : 50,
    })
    matched = result.matched
    messages = result.messages
  } catch (e: unknown) {
    return NextResponse.json({ error: `IMAP: ${(e as Error).message}` }, { status: 502 })
  }

  const closings: BoldClosing[] = []
  // Bold manda más cosas que cierres al mismo remitente (avisos de pago,
  // comunicaciones comerciales). Que un correo no sea un cierre es lo normal,
  // no un fallo, así que va aparte de `errors` — y con el asunto, que es lo
  // único que permite distinguir "no era un cierre" de "el cierre cambió de
  // formato y dejamos de reconocerlo".
  const ignored: { messageId: string; subject: string; date: string }[] = []
  for (const msg of messages) {
    try {
      const { text } = parseMessage(msg.raw)
      const receivedAt = msg.date ? new Date(msg.date) : undefined
      const closing = parseBoldClosing(text, { messageId: msg.messageId, receivedAt, source: 'imap' })
      if (closing) closings.push(closing)
      else ignored.push({ messageId: msg.messageId, subject: decodeHeaderValue(msg.subject), date: msg.date })
    } catch (e: unknown) {
      errors.push(`${msg.messageId}: ${(e as Error).message}`)
    }
  }

  const saved = dry ? { inserted: 0, skipped: 0 } : await saveClosings(closings)

  return NextResponse.json({
    dry,
    since: since.toISOString().slice(0, 10),
    ...(before ? { before: before.toISOString().slice(0, 10) } : {}),
    matched,
    scanned: messages.length,
    // La ventana dejó correos sin leer: hay que estrecharla o subir el tope.
    ...(matched > messages.length ? { truncated: true } : {}),
    parsed: closings.length,
    inserted: saved.inserted,
    skipped: saved.skipped,
    ignoredCount: ignored.length,
    errors,
    ...(dry ? { closings, ignored } : {}),
  })
}

/** El cron de Vercel invoca la ruta con GET. */
export const GET = sync
/** El panel la invoca con POST. */
export const POST = sync
