/**
 * Hora de conversión del feed de Google Ads (Data Manager / carga por archivo).
 *
 * Google exige "YYYY-MM-DD HH:mm:ss ±HHmm". Antes el feed armaba la hora con
 * `getHours()` (zona del SERVIDOR) y le pegaba "-0500" fijo: en Vercel el
 * servidor corre en UTC, así que cada conversión salía 5 horas adelantada
 * (una cita de las 4:00 PM en Medellín viajaba como "21:00:00 -0500").
 *
 * Aquí la hora se calcula siempre en America/Bogota (UTC-5 todo el año, sin
 * horario de verano), sin depender de la zona del servidor ni de ICU.
 */

/** Colombia es UTC-5 todo el año. */
const BOGOTA_OFFSET_MINUTES = -5 * 60
const BOGOTA_OFFSET_LABEL = '-0500'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * ISO (UTC) -> "YYYY-MM-DD HH:mm:ss -0500" en hora de Bogotá.
 *
 * - Fecha inválida -> '' (la fila se manda sin hora y Google la rechaza en vez
 *   de aceptar una hora inventada).
 * - Google rechaza conversiones con fecha futura: si la hora cae después de
 *   `now` (p. ej. una cita marcada como completada antes de tiempo) se envía
 *   `now`.
 */
export function formatConversionTimeBogota(isoDate: string, now: Date = new Date()): string {
  const t = new Date(isoDate).getTime()
  if (Number.isNaN(t)) return ''
  const clamped = Math.min(t, now.getTime())
  const local = new Date(clamped + BOGOTA_OFFSET_MINUTES * 60_000)
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ` +
    `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())} ` +
    BOGOTA_OFFSET_LABEL
  )
}

type BookingTimes = { createdAt?: string; scheduledAt?: string }

const validMs = (iso: string | undefined): number | null => {
  if (!iso) return null
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? null : t
}

/**
 * Hora de la conversión "Lead Cualificado".
 *
 * Se envía con la hora en que se CREÓ la reserva (minutos después del clic),
 * no con la de la cita: así Google recibe la señal de calidad cuando ocurre y
 * no días después. Si falta `createdAt`, cae a la hora de la cita.
 */
export function qualifiedConversionTime(b: BookingTimes, now: Date = new Date()): string {
  return formatConversionTimeBogota(b.createdAt || b.scheduledAt || '', now)
}

/**
 * Hora de la conversión "Reserva Confirmada Offline".
 *
 * Es la hora de la cita (cuando se prestó el servicio), pero nunca anterior a
 * la creación de la reserva: una cita registrada a posteriori (p. ej. la
 * recepción la anota horas después) quedaría antes del clic y Google la
 * rechazaría con "conversión anterior al clic".
 */
export function convertedConversionTime(b: BookingTimes, now: Date = new Date()): string {
  const scheduled = validMs(b.scheduledAt)
  const created = validMs(b.createdAt)
  if (scheduled === null && created === null) return ''
  const t = Math.max(scheduled ?? -Infinity, created ?? -Infinity)
  return formatConversionTimeBogota(new Date(t).toISOString(), now)
}


// ─── Congelar lo que Google ya recibió ──────────────────────────────────────
//
// Data Manager relee el archivo completo cada día (converted.csv a las 10:44
// hora de Bogotá, qualified.csv de madrugada, ~03:29) y evita duplicados por
// Transaction ID. Lo que NO está garantizado es qué hace
// Google si una fila con un Transaction ID ya importado llega con OTRA hora.
// Para no averiguarlo en producción, las reservas creadas antes del arreglo
// siguen saliendo EXACTAMENTE igual que antes (hora UTC con etiqueta -0500,
// misma hora para calificado y confirmada); la hora de Bogotá solo se usa en
// reservas nuevas, que Google nunca ha visto.

/**
 * Reservas creadas ANTES de este instante conservan el formato anterior.
 *
 * Debe ser mayor o igual a la hora de la última corrida de Data Manager que
 * ocurra antes de desplegar este cambio, de CUALQUIERA de las dos conexiones.
 * Si el despliegue se atrasa más allá de una corrida, hay que subir este valor
 * a la hora de esa corrida (+1 minuto).
 *
 * Verificado en Data Manager el 5-nov-2026 antes del despliegue:
 *  - converted.csv: corre a las 10:44 de Bogotá; la última fue el 5-nov a las
 *    10:44 (= 15:44 UTC).
 *  - qualified.csv: corre entre las 03:00 y las 04:00 de Bogotá; la última fue
 *    el 5-nov a las 04:20 (= 09:20 UTC).
 * El corte de abajo (15:45 UTC) es mayor que las dos.
 */
export const ADS_FEED_TIME_FIX_FROM = '2026-11-05T15:45:00.000Z'

/** Formato anterior: la hora UTC del servidor con la etiqueta "-0500" fija. */
function legacyUtcLabeledTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} -0500`
  )
}

/**
 * Hora de cada etapa del feed para una reserva.
 *
 * - Reserva anterior al corte (o sin fecha de creación, que no se puede
 *   demostrar nueva): formato anterior, sin recortes, idéntico byte a byte.
 * - Reserva nueva: hora de Bogotá, calificado = creación, confirmada = cita.
 */
export function feedConversionTimes(
  b: BookingTimes,
  now: Date = new Date(),
): { qualified: string; converted: string } {
  const created = validMs(b.createdAt)
  const isLegacy = created === null || created < new Date(ADS_FEED_TIME_FIX_FROM).getTime()
  if (isLegacy) {
    const t = legacyUtcLabeledTime(b.scheduledAt || b.createdAt || '')
    return { qualified: t, converted: t }
  }
  return {
    qualified: qualifiedConversionTime(b, now),
    converted: convertedConversionTime(b, now),
  }
}