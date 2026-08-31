/**
 * Períodos contables del spa.
 *
 * La contabilidad no corta el último día del mes: el corte configurado (por
 * defecto el 25) define el período. Así, con corte 25, «agosto 2026» va del
 * 25 de julio al 24 de agosto — el tramo que cae mayoritariamente en agosto.
 *
 * El día de corte se limita a 1–28 a propósito: un corte el 29, 30 o 31 no
 * existe en febrero y produciría rangos inválidos una vez al año.
 *
 * Con corte 1 el período es el mes natural, que es el caso degenerado y hay
 * que tratarlo aparte (no hay «día 0» del mes anterior).
 */

export const DEFAULT_CYCLE_START_DAY = 25
export const MIN_CYCLE_START_DAY = 1
export const MAX_CYCLE_START_DAY = 28

/** Recorta cualquier entrada a un día de corte válido. */
export function normalizeStartDay(value: unknown): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_CYCLE_START_DAY
  return Math.min(Math.max(n, MIN_CYCLE_START_DAY), MAX_CYCLE_START_DAY)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Suma `delta` meses a un 'YYYY-MM'. */
export function shiftCycle(label: string, delta: number): string {
  const total = Number(label.slice(0, 4)) * 12 + (Number(label.slice(5, 7)) - 1) + delta
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`
}

/** Último día natural de un 'YYYY-MM'. */
export function lastDayOfMonth(label: string): string {
  const [y, m] = label.split('-').map(Number)
  return `${label}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`
}

export interface CycleRange {
  /** YYYY-MM-DD inclusive. */
  from: string
  /** YYYY-MM-DD inclusive. */
  to: string
}

/**
 * Rango de fechas del período `label` ('YYYY-MM') con el corte dado.
 *
 * Con corte 25: cycleRange('2026-08', 25) → 2026-07-25 … 2026-08-24.
 * Con corte 1 es el mes natural completo.
 */
export function cycleRange(label: string, startDay: number): CycleRange {
  const day = normalizeStartDay(startDay)
  if (day === 1) return { from: `${label}-01`, to: lastDayOfMonth(label) }
  return {
    from: `${shiftCycle(label, -1)}-${pad(day)}`,
    to: `${label}-${pad(day - 1)}`,
  }
}

/**
 * A qué período pertenece un día 'YYYY-MM-DD'.
 *
 * Con corte 25, el 25 de julio ya cuenta como agosto; el 24 de agosto todavía
 * es agosto.
 */
export function cycleLabelFor(isoDay: string, startDay: number): string {
  const day = normalizeStartDay(startDay)
  const month = isoDay.slice(0, 7)
  if (day === 1) return month
  return Number(isoDay.slice(8, 10)) >= day ? shiftCycle(month, 1) : month
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** «agosto 2026». */
export function cycleName(label: string): string {
  return `${MONTHS[Number(label.slice(5, 7)) - 1]} ${label.slice(0, 4)}`
}

/**
 * «25 jul – 24 ago». Se muestra junto al nombre del período porque, con un
 * corte distinto de 1, el nombre por sí solo es ambiguo.
 */
export function cycleRangeLabel(label: string, startDay: number): string {
  const { from, to } = cycleRange(label, startDay)
  const short = (d: string) =>
    `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1].slice(0, 3)}`
  return `${short(from)} – ${short(to)}`
}
