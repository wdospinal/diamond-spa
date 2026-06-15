import { NextRequest, NextResponse } from 'next/server'
import { verifyVercelSignature } from '@/lib/vercel-signature'
import { recordFunnelHits, type FunnelHit } from '@/lib/funnel-store'
import { EVENT_NAME_TO_STAGE } from '@/lib/funnel-stages'

// Needs the Node crypto module + the raw request body (no edge/cache).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vercel Web Analytics Drain receiver.
 *
 * Vercel PUSHES the full event stream (pageviews + custom events) here, signed
 * with `x-vercel-signature` (HMAC-SHA1 of the raw body using the drain secret).
 * We verify the signature, map each event to a funnel stage, and record the
 * session in the aggregate store. Pageviews populate the top of the funnel for
 * free — no client code needed.
 *
 * Drain event shape (schema "vercel.analytics.v2"):
 *   { eventType: "pageview"|"event", eventName?, eventData?, timestamp,
 *     projectId, ownerId, sessionId, deviceId, origin, path }
 */

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// Hosts of the admin app — their traffic must never count toward the funnel.
const ADMIN_HOSTS = new Set(['app.diamondspa.com.co', 'app.localhost'])

type DrainEvent = {
  eventType?: string
  eventName?: string
  timestamp?: number
  path?: string
  origin?: string
  sessionId?: number | string
}

/** Drain delivers either a JSON array or newline-delimited JSON. Handle both. */
function parseEvents(raw: string): DrainEvent[] {
  const trimmed = raw.trim()
  if (!trimmed) return []
  try {
    const parsed = JSON.parse(trimmed) as unknown
    return Array.isArray(parsed) ? (parsed as DrainEvent[]) : [parsed as DrainEvent]
  } catch {
    return trimmed
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .flatMap(l => {
        try {
          return [JSON.parse(l) as DrainEvent]
        } catch {
          return []
        }
      })
  }
}

function isAdminTraffic(e: DrainEvent): boolean {
  if (e.origin) {
    try {
      if (ADMIN_HOSTS.has(new URL(e.origin).hostname)) return true
    } catch {
      /* ignore malformed origin */
    }
  }
  // Direct hits to /admin (or /es/admin, /en/admin) on the main domain.
  const path = (e.path ?? '').replace(/^\/(es|en)(?=\/|$)/, '')
  return path.startsWith('/admin')
}

export async function POST(req: NextRequest) {
  const secret = process.env.VERCEL_DRAIN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Drain not configured' }, { status: 500 })
  }

  const raw = await req.text()
  if (!verifyVercelSignature(raw, req.headers.get('x-vercel-signature'), secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const events = parseEvents(raw)
  const hits: FunnelHit[] = []
  for (const e of events) {
    const sessionId = e.sessionId == null ? '' : String(e.sessionId)
    if (!sessionId || isAdminTraffic(e)) continue

    const ts = typeof e.timestamp === 'number' ? e.timestamp : Date.now()
    const day = BOGOTA_DAY.format(new Date(ts))

    if (e.eventType === 'pageview') {
      hits.push({ day, stage: 'visit', sessionId })
    } else if (e.eventType === 'event' && e.eventName) {
      const stage = EVENT_NAME_TO_STAGE[e.eventName]
      if (stage) hits.push({ day, stage, sessionId })
    }
  }

  try {
    await recordFunnelHits(hits)
  } catch (err) {
    console.error('funnel-drain: store write failed', err)
    return NextResponse.json({ error: 'Store unavailable' }, { status: 503 })
  }

  // Always 200 for valid signatures (incl. empty test deliveries) to keep the drain healthy.
  return NextResponse.json({ ok: true, received: events.length, recorded: hits.length })
}
