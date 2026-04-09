import type { BookingRecord } from '@/lib/booking-types'
import type { LedgerEntry } from '@/lib/ledger-types'

/** Today's calendar date in America/Bogota as YYYY-MM-DD */
export function todayKeyBogota(now = new Date()): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { y, m, d }
}

function ymdToKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Monday-based week: Monday 00:00 .. Sunday, using UTC calendar math on Y-M-D (stable for Colombia, no DST). */
function mondayKeyOfWeekContaining(dateKey: string): string {
  const { y, m, d } = parseKey(dateKey)
  const utc = Date.UTC(y, m - 1, d)
  const dow = new Date(utc).getUTCDay() // 0 Sun .. 6 Sat
  const mondayOffset = (dow + 6) % 7
  const mondayUtc = Date.UTC(y, m - 1, d - mondayOffset)
  const dt = new Date(mondayUtc)
  return ymdToKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

function addDaysToKey(key: string, days: number): string {
  const { y, m, d } = parseKey(key)
  const ms = Date.UTC(y, m - 1, d + days)
  const dt = new Date(ms)
  return ymdToKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

function keyCompare(a: string, b: string): number {
  return a.localeCompare(b)
}

export function computeIncomeStats(bookings: BookingRecord[], now = new Date()) {
  const todayKey = todayKeyBogota(now)
  const weekStart = mondayKeyOfWeekContaining(todayKey)
  const weekEnd = addDaysToKey(weekStart, 6)
  const { y: cy, m: cm } = parseKey(todayKey)
  const monthPrefix = `${cy}-${String(cm).padStart(2, '0')}`

  let today = 0
  let week = 0
  let month = 0

  for (const b of bookings) {
    const k = b.dateKey
    if (k === todayKey) today += b.price
    if (keyCompare(k, weekStart) >= 0 && keyCompare(k, weekEnd) <= 0) week += b.price
    if (k.startsWith(monthPrefix)) month += b.price
  }

  return { today, week, month, currency: 'USD' as const }
}

export type PeriodMoney = {
  sessionsIncome: number
  otherIncome: number
  expenses: number
  totalIncome: number
  net: number
}

export function computeDashboardStats(
  bookings: BookingRecord[],
  ledger: LedgerEntry[],
  now = new Date()
): { today: PeriodMoney; week: PeriodMoney; month: PeriodMoney; currency: 'USD' } {
  const b = computeIncomeStats(bookings, now)
  const todayKey = todayKeyBogota(now)
  const weekStart = mondayKeyOfWeekContaining(todayKey)
  const weekEnd = addDaysToKey(weekStart, 6)
  const { y: cy, m: cm } = parseKey(todayKey)
  const monthPrefix = `${cy}-${String(cm).padStart(2, '0')}`

  let tIn = 0,
    tEx = 0,
    wIn = 0,
    wEx = 0,
    mIn = 0,
    mEx = 0

  for (const e of ledger) {
    const k = e.dateKey
    const a = e.amount
    if (e.kind === 'income') {
      if (k === todayKey) tIn += a
      if (keyCompare(k, weekStart) >= 0 && keyCompare(k, weekEnd) <= 0) wIn += a
      if (k.startsWith(monthPrefix)) mIn += a
    } else {
      if (k === todayKey) tEx += a
      if (keyCompare(k, weekStart) >= 0 && keyCompare(k, weekEnd) <= 0) wEx += a
      if (k.startsWith(monthPrefix)) mEx += a
    }
  }

  const pack = (sessions: number, oIn: number, ex: number): PeriodMoney => {
    const totalIncome = sessions + oIn
    return {
      sessionsIncome: sessions,
      otherIncome: oIn,
      expenses: ex,
      totalIncome,
      net: totalIncome - ex,
    }
  }

  return {
    today: pack(b.today, tIn, tEx),
    week: pack(b.week, wIn, wEx),
    month: pack(b.month, mIn, mEx),
    currency: 'USD',
  }
}
