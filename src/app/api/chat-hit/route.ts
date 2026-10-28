import { NextRequest, NextResponse } from 'next/server'
import { sanitizeBatch } from '@/lib/chat-events'
import { recordChatEvents, type ChatEventRow } from '@/lib/chat-events-store'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Registro de clics del chat de la pauta: contraparte de src/lib/chat-track.ts.
 *
 * Es público (los visitantes son anónimos), así que es estrecho a propósito: solo
 * acepta eventos de la lista cerrada de lib/chat-events.ts con etiquetas que ya
 * existen en el chat. No hay texto libre que guardar, el día lo calcula el
 * servidor y no se almacena IP. Nada de lo recibido se devuelve.
 */

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Una sesión normal envía un lote cada pocos segundos; esto frena scripts, no personas. */
const LIMIT = 40
const WINDOW_SEC = 60

export async function POST(req: NextRequest) {
  const { ok, retryAfter } = await rateLimit('chat-hit', clientIp(req), LIMIT, WINDOW_SEC)
  if (!ok) return tooManyRequests(retryAfter)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const batch = sanitizeBatch(body)
  if (!batch) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const now = new Date()
  const day = BOGOTA_DAY.format(now)
  const createdAt = now.toISOString()
  const rows: ChatEventRow[] = batch.events.map(e => ({
    session_id: batch.sessionId,
    seq: e.seq,
    day,
    created_at: createdAt,
    ev: e.ev,
    k: e.k,
    cat: e.cat,
    node: e.node,
    lang: batch.meta.lang,
    dev: batch.meta.dev,
    ads: batch.meta.ads,
    adg: batch.meta.adg,
  }))

  try {
    await recordChatEvents(rows)
  } catch (err) {
    console.error('chat-hit: store write failed', err)
    return NextResponse.json({ error: 'Store unavailable' }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
