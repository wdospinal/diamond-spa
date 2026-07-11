import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { readFunnel } from '@/lib/funnel-store'
import { FUNNEL_STAGES } from '@/lib/funnel-stages'
import { readBookings } from '@/lib/bookings-store'

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

  // -- Inject Actual Bookings data for the final phase --
  const allBookings = await readBookings()
  const fromDate = new Date(`${from}T00:00:00Z`)
  const toDate = new Date(`${to}T23:59:59Z`)
  
  let paidCount = 0
  let createdCount = 0
  let revenueUsd = 0
  let revenueCop = 0
  
  const byDayPaid: Record<string, number> = {}
  
  for (const b of allBookings) {
    const bDate = new Date(b.createdAt)
    if (bDate >= fromDate && bDate <= toDate) {
      createdCount++
      if (b.paymentStatus === 'paid' && b.status !== 'cancelled') {
        paidCount++
        revenueUsd += b.price || 0
        revenueCop += b.priceCop || 0
        
        const bDay = b.createdAt.slice(0, 10)
        byDayPaid[bDay] = (byDayPaid[bDay] || 0) + 1
      }
    }
  }

  for (const d of days) {
    if (!byDay[d]) byDay[d] = {}
    byDay[d]['pagos_confirmados'] = byDayPaid[d] || 0
  }

  // Ensure 'visit' and 'booking_submit' are at least createdCount so the funnel isn't empty
  totals['visit'] = Math.max(totals['visit'] ?? 0, createdCount)
  totals['booking_submit'] = Math.max(totals['booking_submit'] ?? 0, createdCount)
  // Ensure intermediate steps aren't smaller than the end steps to make the funnel visually logical
  totals['booking_start'] = Math.max(totals['booking_start'] ?? 0, totals['booking_submit'])
  totals['service_view'] = Math.max(totals['service_view'] ?? 0, totals['booking_start'])

  const top = totals[FUNNEL_STAGES[0].key] || 0
  let prev = 0
  const stages: any[] = FUNNEL_STAGES.map((s, idx) => {
    const count = totals[s.key] ?? 0
    const pctOfTop = top > 0 ? count / top : 0
    const pctOfPrev = idx === 0 ? 1 : prev > 0 ? count / prev : 0
    prev = count
    return { key: s.key, label: s.label, phase: s.phase, color: s.color, count, pctOfTop, pctOfPrev }
  })
  
  // Inject the final synthesized stage
  stages.push({
    key: 'pagos_confirmados',
    label: 'Pagos Confirmados',
    phase: 'Retención',
    color: '#34d399',
    count: paidCount,
    pctOfTop: top > 0 ? paidCount / top : 0,
    pctOfPrev: prev > 0 ? paidCount / prev : 0,
    revenueUsd,
    revenueCop
  })

  return NextResponse.json({ from, to, days, stages, byDay })
}
