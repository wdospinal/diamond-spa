import { NextRequest, NextResponse } from 'next/server'
import { recordFunnelHits } from '@/lib/funnel-store'
import { FUNNEL_STAGE_KEYS, type FunnelStageKey } from '@/lib/funnel-stages'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * First-party funnel beacon — the counterpart to src/lib/funnel-client.ts.
 *
 * Public by necessity (visitors are anonymous), so it is deliberately narrow:
 * the only accepted input is a known stage key plus an opaque session id, and
 * the day is computed server-side. Nothing here is echoed back, nothing is
 * stored beyond (day, stage, session), and the store dedupes on that triple.
 */

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const STAGES = new Set<string>(FUNNEL_STAGE_KEYS)

/** Generous enough for a real browsing session, tight enough to blunt scripted inflation. */
const LIMIT = 60
const WINDOW_SEC = 60

export async function POST(req: NextRequest) {
  const { ok, retryAfter } = await rateLimit('funnel-hit', clientIp(req), LIMIT, WINDOW_SEC)
  if (!ok) return tooManyRequests(retryAfter)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { stage, sessionId } = (body ?? {}) as { stage?: unknown; sessionId?: unknown }

  if (typeof stage !== 'string' || !STAGES.has(stage)) {
    return NextResponse.json({ error: 'Unknown stage' }, { status: 400 })
  }
  // Cap the length so a client cannot use the id field as free storage.
  if (typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 64) {
    return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 })
  }

  try {
    await recordFunnelHits([
      { day: BOGOTA_DAY.format(new Date()), stage: stage as FunnelStageKey, sessionId },
    ])
  } catch (err) {
    console.error('funnel-hit: store write failed', err)
    return NextResponse.json({ error: 'Store unavailable' }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
