import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { parseBoldClosing } from '@/lib/bold-parser'
import { readClosings, saveClosings } from '@/lib/bold-store'
import {
  cycleComparison,
  cycleLabelFor,
  cycleRange,
  DEFAULT_CYCLE_START_DAY,
  shiftCycle,
} from '@/lib/cycle'
import type { BoldClosing } from '@/lib/bold-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function bogotaToday(): string {
  return BOGOTA_DAY.format(new Date())
}

export interface BoldMonth {
  month: string // YYYY-MM
  grossCop: number
  closingCop: number
  transactions: number
  refundsCop: number
  refundCount: number
  closings: number
}

/** Totales de un día natural (varios turnos/cierres se suman). */
export interface BoldDay {
  day: string // YYYY-MM-DD
  grossCop: number
  closingCop: number
  transactions: number
  refundsCop: number
  refundCount: number
  closings: number
}

function emptyMonth(month: string): BoldMonth {
  return { month, grossCop: 0, closingCop: 0, transactions: 0, refundsCop: 0, refundCount: 0, closings: 0 }
}

function emptyDay(day: string): BoldDay {
  return { day, grossCop: 0, closingCop: 0, transactions: 0, refundsCop: 0, refundCount: 0, closings: 0 }
}

function accumulate(acc: BoldMonth | BoldDay, c: BoldClosing): void {
  acc.grossCop += c.grossCop
  acc.closingCop += c.closingCop
  acc.transactions += c.transactions
  acc.refundsCop += c.refundsCop
  acc.refundCount += c.refundCount
  acc.closings += 1
}

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

/**
 * Resumen mensual de los cierres de Bold. Admin-only, igual que /api/funnel.
 *
 * Query: ?months=N (por defecto 12, máx 36), y opcionalmente
 * ?from=YYYY-MM-DD&to=YYYY-MM-DD para filtrar el heatmap y la tabla.
 * Devuelve la serie mensual completa
 * (con los meses sin ventas en cero, para que la línea de crecimiento no salte),
 * el mes actual, el anterior, y la comparación "a la misma altura del mes"
 * (MTD) — comparar un mes a medias contra uno completo engaña.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const monthsParam = Number(req.nextUrl.searchParams.get('months') ?? 12)
  const monthCount = Math.min(Math.max(Number.isFinite(monthsParam) ? monthsParam : 12, 2), 36)

  const today = bogotaToday()
  const requestedFrom = req.nextUrl.searchParams.get('from')
  const requestedTo = req.nextUrl.searchParams.get('to')
  const dayPattern = /^\d{4}-\d{2}-\d{2}$/
  const hasCustomRange = requestedFrom !== null || requestedTo !== null
  if (
    hasCustomRange &&
    (!requestedFrom ||
      !requestedTo ||
      !dayPattern.test(requestedFrom) ||
      !dayPattern.test(requestedTo) ||
      requestedFrom > requestedTo ||
      requestedTo > today)
  ) {
    return NextResponse.json({ error: 'Rango de fechas inválido' }, { status: 400 })
  }

  const cycleStartDay = DEFAULT_CYCLE_START_DAY
  const cycle = cycleComparison(today, cycleStartDay)
  const currentMonth = cycle.currentLabel
  const previousMonth = cycle.previousLabel
  const currentCycle = cycle.current
  const previousCycle = cycle.previous
  const elapsedDays = cycle.elapsedDays
  const previousComparableTo = cycle.previousComparableTo
  const firstMonth = shiftCycle(currentMonth, -(monthCount - 1))
  const firstCycleStart = cycleRange(firstMonth, cycleStartDay).from
  const rangeStart = requestedFrom ?? firstCycleStart
  const rangeEnd = requestedTo ?? today
  // Los KPIs por ciclo aún necesitan los períodos aunque el filtro
  // personalizado empiece después.
  const readFrom = rangeStart < firstCycleStart ? rangeStart : firstCycleStart

  const closings = await readClosings(readFrom)

  const byMonth = new Map<string, BoldMonth>()
  const byDay = new Map<string, BoldDay>()
  for (let i = 0; i < monthCount; i++) {
    const m = shiftCycle(firstMonth, i)
    byMonth.set(m, emptyMonth(m))
  }
  for (const c of closings) {
    const monthAcc = byMonth.get(cycleLabelFor(c.day, cycleStartDay))
    if (monthAcc) accumulate(monthAcc, c)

    if (c.day < rangeStart || c.day > rangeEnd) continue
    let dayAcc = byDay.get(c.day)
    if (!dayAcc) {
      dayAcc = emptyDay(c.day)
      byDay.set(c.day, dayAcc)
    }
    accumulate(dayAcc, c)
  }

  // Comparación justa: mismos días transcurridos dentro de cada ciclo.
  const comparisonCurrent = emptyMonth(currentMonth)
  const comparisonPrevious = emptyMonth(previousMonth)
  for (const c of closings) {
    if (c.day >= currentCycle.from && c.day <= today) accumulate(comparisonCurrent, c)
    else if (c.day >= previousCycle.from && c.day <= previousComparableTo) {
      accumulate(comparisonPrevious, c)
    }
  }

  return NextResponse.json({
    today,
    cycleStartDay,
    currentMonth,
    previousMonth,
    currentCycle,
    previousCycle,
    rangeStart,
    rangeEnd,
    months: [...byMonth.values()],
    current: byMonth.get(currentMonth) ?? emptyMonth(currentMonth),
    previous: byMonth.get(previousMonth) ?? emptyMonth(previousMonth),
    comparison: {
      elapsedDays,
      currentTo: today,
      previousTo: previousComparableTo,
      current: comparisonCurrent,
      previous: comparisonPrevious,
    },
    // Historial de cierres del rango (mes seleccionado o filtro Desde/Hasta).
    days: closings.filter(c => c.day >= rangeStart && c.day <= rangeEnd),
    // Totales por día del rango (heatmap de intensidad).
    daily: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
  })
}

/**
 * Carga manual de respaldo: se pega el texto (o el HTML) de un correo de Bold.
 * Usa el mismo parser que el sync por IMAP, así que el resultado es idéntico;
 * el id sintético hace que pegar dos veces el mismo correo no duplique nada.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const raw = (body as { text?: unknown })?.text
  const text = typeof raw === 'string' ? raw : ''
  if (!text.trim()) {
    return NextResponse.json({ error: 'Pega el contenido del correo.' }, { status: 400 })
  }

  const closing = parseBoldClosing(text, { source: 'manual' })
  if (!closing) {
    return NextResponse.json(
      { error: 'No reconocí un cierre de Bold en ese texto. Debe incluir "Ventas exitosas" y las líneas "Desde"/"Hasta".' },
      { status: 422 },
    )
  }

  const { inserted, skipped } = await saveClosings([closing])
  return NextResponse.json({ closing, inserted, skipped })
}
