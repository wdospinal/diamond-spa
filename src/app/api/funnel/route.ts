import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { readFunnel } from '@/lib/funnel-store'
import { FUNNEL_STAGES } from '@/lib/funnel-stages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

function bogotaToday(): string {
  return BOGOTA_DAY.format(new Date())
}

function shiftDay(day: string, deltaDays: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

/**
 * Admin-only funnel read. Mirrors the auth gate in /api/bookings: a missing or
 * invalid session cookie returns 401 (the dashboard then redirects to login).
 *
 * Query: ?days=N (default 30, max 90) or explicit ?from=YYYY-MM-DD&to=YYYY-MM-DD.
 */
export async function GET(req: NextRequest) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const today = bogotaToday()

  let to = searchParams.get('to') ?? ''
  if (!DAY_RE.test(to)) to = today

  let from = searchParams.get('from') ?? ''
  if (!DAY_RE.test(from)) {
    const raw = parseInt(searchParams.get('days') ?? '30', 10)
    const days = Math.min(Math.max(Number.isFinite(raw) ? raw : 30, 1), 90)
    from = shiftDay(to, -(days - 1))
  }

  const { days, byDay, totals } = await readFunnel(from, to)

  const top = totals[FUNNEL_STAGES[0].key] || 0
  let prev = 0
  const stages = FUNNEL_STAGES.map((s, idx) => {
    const count = totals[s.key] ?? 0
    const pctOfTop = top > 0 ? count / top : 0
    const pctOfPrev = idx === 0 ? 1 : prev > 0 ? count / prev : 0
    prev = count
    return { key: s.key, label: s.label, phase: s.phase, color: s.color, count, pctOfTop, pctOfPrev }
  })

  return NextResponse.json({ from, to, days, stages, byDay })
}
