/**
 * Fechas en la zona del spa (America/Bogota).
 *
 * Todo lo contable se imputa al día de Bogotá, no al UTC del servidor: un
 * comprobante enviado a las 8 de la noche cae en el día correcto aunque la
 * función corra en otra región. Mismo criterio que usa `/api/bold` para los
 * cierres del datáfono.
 */

// 'fr-CA' da directamente YYYY-MM-DD, que es lo que guardan las tablas.
const DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** YYYY-MM-DD (Bogotá) de la fecha dada, o de ahora. */
export function bogotaDay(date: Date = new Date()): string {
  return DAY.format(date)
}

/** Suma `delta` días a un 'YYYY-MM-DD' y devuelve el 'YYYY-MM-DD' resultante. */
export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/** Primer día del mes al que pertenece `day`. */
export function monthStart(day: string): string {
  return `${day.slice(0, 7)}-01`
}
