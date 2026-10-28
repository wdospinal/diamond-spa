/**
 * Valor de vida del cliente (LTV) a partir de las reservas del admin.
 *
 * Reglas (para que las cifras sean comparables mes a mes):
 *  - Cliente = teléfono normalizado. Mismo número escrito distinto (+57 300…,
 *    300…, 57300…) cuenta como una sola persona.
 *  - Solo cuentan los servicios en etapa "4. Servicio Pagado" (`completed`).
 *  - LTV = suma de `priceCop` de esos servicios.
 *  - Visita = un día distinto con servicio pagado. Dos servicios el mismo día
 *    son una sola visita (no es que el cliente "volvió").
 *  - Cliente que repite = 2 o más visitas.
 *
 * Funciones puras, sin acceso a red ni a disco: se usan igual en el panel y
 * en las pruebas.
 */

import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'

/** Un precio menor a esto casi seguro se digitó en miles ($120 en vez de $120.000). */
export const SUSPICIOUS_PRICE_BELOW = 1000

export type DataIssue = 'sin_precio' | 'precio_sospechoso' | 'sin_telefono' | 'pago_pendiente'

export const DATA_ISSUE_LABELS: Record<DataIssue, string> = {
  sin_precio: 'Sin precio',
  precio_sospechoso: 'Precio sospechoso (¿en miles?)',
  sin_telefono: 'Sin teléfono',
  pago_pendiente: 'Pago sin marcar como pagado',
}

export type CustomerService = {
  id: string
  dateKey: string
  serviceName: string
  priceCop: number
}

export type Customer = {
  /** Teléfono normalizado (solo dígitos, con 57 para móviles colombianos). */
  key: string
  name: string
  /** Visitas = días distintos con servicio pagado. */
  visits: number
  /** Servicios pagados (puede ser mayor que las visitas). */
  services: number
  totalCop: number
  /** Total / servicios con precio. 0 si ninguno tiene precio. */
  avgTicketCop: number
  firstVisit: string
  lastVisit: string
  /** Promedio de días entre visitas consecutivas; null si solo vino una vez. */
  avgDaysBetween: number | null
  isRepeat: boolean
  /** Algún servicio sin precio o con precio sospechoso: el total está incompleto. */
  needsReview: boolean
  /** Más reciente primero. */
  history: CustomerService[]
}

export type DataQualityRow = {
  id: string
  dateKey: string
  name: string
  phone: string
  serviceName: string
  priceCop: number
  issues: DataIssue[]
}

export type LtvSummary = {
  /** Clientes con al menos un servicio pagado y teléfono válido. */
  clients: number
  repeatClients: number
  /** repeatClients / clients (0–1). */
  repeatRate: number
  totalCop: number
  repeatCop: number
  /** repeatCop / totalCop (0–1). */
  repeatShare: number
  avgLtvCop: number
  avgLtvRepeatCop: number
  avgLtvOneTimeCop: number
  /** Visitas promedio de quienes repiten. */
  avgVisitsRepeat: number
  /** Días promedio entre visitas (todas las separaciones de todos los clientes). */
  avgDaysBetween: number | null
  /** Servicios pagados que no se pueden asignar a un cliente (sin teléfono). */
  unassignedCount: number
  unassignedCop: number
}

export type LtvReport = {
  /** Mayor LTV primero. */
  customers: Customer[]
  summary: LtvSummary
  /** Servicios pagados que hay que corregir antes de confiar en las cifras. */
  quality: DataQualityRow[]
}

/**
 * Solo dígitos. Un móvil colombiano de 10 dígitos (3xx…) se lleva a 57 + número;
 * así "300 123 4567", "+57 300 123 4567" y "573001234567" son la misma persona.
 * Devuelve '' si no parece un teléfono.
 */
export function normalizePhone(raw: unknown): string {
  if (typeof raw !== 'string' && typeof raw !== 'number') return ''
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`
  if (digits.length < 8 || digits.length > 15) return ''
  return digits
}

/** "+57 300 123 4567" para móviles colombianos; "+dígitos" para el resto. */
export function formatPhone(key: string): string {
  if (!key) return 'Sin teléfono'
  if (key.length === 12 && key.startsWith('57')) {
    return `+57 ${key.slice(2, 5)} ${key.slice(5, 8)} ${key.slice(8)}`
  }
  return `+${key}`
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

/** Día de la sesión; si dateKey no sirve, el día en que se creó el registro. */
function bookingDay(b: BookingRecord): string {
  if (typeof b.dateKey === 'string' && DAY_RE.test(b.dateKey)) return b.dateKey
  const created = typeof b.createdAt === 'string' ? b.createdAt.slice(0, 10) : ''
  return DAY_RE.test(created) ? created : ''
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/** Precio utilizable: número finito y positivo; si no, 0. */
function cleanPrice(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : (value as number)
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0
}

function issuesFor(b: BookingRecord, key: string): DataIssue[] {
  const issues: DataIssue[] = []
  const price = cleanPrice(b.priceCop)
  if (price === 0) issues.push('sin_precio')
  else if (price < SUSPICIOUS_PRICE_BELOW) issues.push('precio_sospechoso')
  if (!key) issues.push('sin_telefono')
  if (b.paymentStatus === 'pending') issues.push('pago_pendiente')
  return issues
}

/** Nombres de WhatsApp sin nombre real ("Lead WhatsApp (Recepción Directa)"). */
const PLACEHOLDER_NAME = /^lead\s+(de\s+)?whatsapp/i

function pickName(newestFirst: BookingRecord[]): string {
  for (const b of newestFirst) {
    const name = bookingDisplayName(b)
    if (name !== 'Desconocido' && !PLACEHOLDER_NAME.test(name)) return name
  }
  return bookingDisplayName(newestFirst[0])
}

function round(n: number): number {
  return Math.round(n)
}

export function computeLtv(bookings: readonly BookingRecord[]): LtvReport {
  const groups = new Map<string, BookingRecord[]>()
  const quality: DataQualityRow[] = []
  let unassignedCount = 0
  let unassignedCop = 0

  for (const b of bookings) {
    if (b.status !== 'completed') continue
    const key = normalizePhone(b.phone)

    const issues = issuesFor(b, key)
    if (issues.length > 0) {
      quality.push({
        id: b.id,
        dateKey: bookingDay(b),
        name: bookingDisplayName(b),
        phone: formatPhone(key) === 'Sin teléfono' ? (b.phone || '').trim() : formatPhone(key),
        serviceName: b.serviceName,
        priceCop: cleanPrice(b.priceCop),
        issues,
      })
    }

    if (!key) {
      unassignedCount += 1
      unassignedCop += cleanPrice(b.priceCop)
      continue
    }
    const list = groups.get(key)
    if (list) list.push(b)
    else groups.set(key, [b])
  }

  const customers: Customer[] = []
  let gapSum = 0
  let gapCount = 0

  for (const [key, list] of groups) {
    const newestFirst = [...list].sort(
      (a, b) =>
        bookingDay(b).localeCompare(bookingDay(a)) ||
        (b.createdAt || '').localeCompare(a.createdAt || ''),
    )

    const days = [...new Set(newestFirst.map(bookingDay).filter(Boolean))].sort()
    const gaps: number[] = []
    for (let i = 1; i < days.length; i += 1) gaps.push(daysBetween(days[i - 1], days[i]))
    gapSum += gaps.reduce((s, g) => s + g, 0)
    gapCount += gaps.length

    let totalCop = 0
    let priced = 0
    let needsReview = false
    for (const b of list) {
      const price = cleanPrice(b.priceCop)
      totalCop += price
      if (price > 0) priced += 1
      if (price < SUSPICIOUS_PRICE_BELOW) needsReview = true
    }

    const visits = Math.max(days.length, 1)
    customers.push({
      key,
      name: pickName(newestFirst),
      visits,
      services: list.length,
      totalCop,
      avgTicketCop: priced > 0 ? round(totalCop / priced) : 0,
      firstVisit: days[0] ?? '',
      lastVisit: days[days.length - 1] ?? '',
      avgDaysBetween: gaps.length > 0 ? round(gaps.reduce((s, g) => s + g, 0) / gaps.length) : null,
      isRepeat: visits >= 2,
      needsReview,
      history: newestFirst.map(b => ({
        id: b.id,
        dateKey: bookingDay(b),
        serviceName: b.serviceName,
        priceCop: cleanPrice(b.priceCop),
      })),
    })
  }

  customers.sort(
    (a, b) =>
      b.totalCop - a.totalCop ||
      b.visits - a.visits ||
      b.lastVisit.localeCompare(a.lastVisit),
  )
  quality.sort((a, b) => b.dateKey.localeCompare(a.dateKey))

  const repeaters = customers.filter(c => c.isRepeat)
  const oneTime = customers.filter(c => !c.isRepeat)
  const totalCop = customers.reduce((s, c) => s + c.totalCop, 0)
  const repeatCop = repeaters.reduce((s, c) => s + c.totalCop, 0)
  const oneTimeCop = totalCop - repeatCop

  const summary: LtvSummary = {
    clients: customers.length,
    repeatClients: repeaters.length,
    repeatRate: customers.length > 0 ? repeaters.length / customers.length : 0,
    totalCop,
    repeatCop,
    repeatShare: totalCop > 0 ? repeatCop / totalCop : 0,
    avgLtvCop: customers.length > 0 ? round(totalCop / customers.length) : 0,
    avgLtvRepeatCop: repeaters.length > 0 ? round(repeatCop / repeaters.length) : 0,
    avgLtvOneTimeCop: oneTime.length > 0 ? round(oneTimeCop / oneTime.length) : 0,
    avgVisitsRepeat:
      repeaters.length > 0
        ? Math.round((repeaters.reduce((s, c) => s + c.visits, 0) / repeaters.length) * 10) / 10
        : 0,
    avgDaysBetween: gapCount > 0 ? round(gapSum / gapCount) : null,
    unassignedCount,
    unassignedCop,
  }

  return { customers, summary, quality }
}
