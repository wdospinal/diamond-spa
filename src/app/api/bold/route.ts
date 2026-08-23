import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { parseBoldClosing } from '@/lib/bold-parser'
import { readClosings, saveClosings } from '@/lib/bold-store'
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

/** Suma `delta` meses a un 'YYYY-MM' y devuelve el 'YYYY-MM' resultante. */
function shiftMonth(month: string, delta: number): string {
  const y = Number(month.slice(0, 4))
  const m = Number(month.slice(5, 7))
  const total = y * 12 + (m - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
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
 * Query: ?months=N (por defecto 12, máx 36). Devuelve la serie mensual completa
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
  const currentMonth = today.slice(0, 7)
  const dayOfMonth = Number(today.slice(8, 10))
  const firstMonth = shiftMonth(currentMonth, -(monthCount - 1))

  const closings = await readClosings(`${firstMonth}-01`)

  const byMonth = new Map<string, BoldMonth>()
  const byDay = new Map<string, BoldDay>()
  for (let i = 0; i < monthCount; i++) {
    const m = shiftMonth(firstMonth, i)
    byMonth.set(m, emptyMonth(m))
  }
  for (const c of closings) {
    const monthAcc = byMonth.get(c.day.slice(0, 7))
    if (monthAcc) accumulate(monthAcc, c)

    let dayAcc = byDay.get(c.day)
    if (!dayAcc) {
      dayAcc = emptyDay(c.day)
      byDay.set(c.day, dayAcc)
    }
    accumulate(dayAcc, c)
  }

  const previousMonth = shiftMonth(currentMonth, -1)

  // MTD: mismo número de días transcurridos en el mes anterior.
  const mtdCurrent = emptyMonth(currentMonth)
  const mtdPrevious = emptyMonth(previousMonth)
  for (const c of closings) {
    if (Number(c.day.slice(8, 10)) > dayOfMonth) continue
    const m = c.day.slice(0, 7)
    if (m === currentMonth) accumulate(mtdCurrent, c)
    else if (m === previousMonth) accumulate(mtdPrevious, c)
  }

  return NextResponse.json({
    today,
    currentMonth,
    previousMonth,
    months: [...byMonth.values()],
    current: byMonth.get(currentMonth) ?? emptyMonth(currentMonth),
    previous: byMonth.get(previousMonth) ?? emptyMonth(previousMonth),
    mtd: { dayOfMonth, current: mtdCurrent, previous: mtdPrevious },
    // Cierres individuales del mes (tabla de turnos).
    days: closings.filter(c => c.day.startsWith(currentMonth)),
    // Totales por día en todo el rango (heatmap de intensidad).
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
