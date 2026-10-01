/**
 * Calendario y horas del chat de la pauta.
 *
 * Es la misma lógica que ya usaba el chat: horas desde 30 min después de
 * abrir hasta 30 min antes de cerrar, cada 30 min en sesiones de hasta 60 min
 * y cada 60 min en las más largas; el mismo día, solo horas con 30 min de
 * margen (hora de Bogotá). No mira la duración contra el cierre: se deja así
 * por ahora.
 */
import { SPA_HOURS } from './spa'

const EDGE = 30
const LEAD = 30
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function openingFor(weekday: number) {
  const name = DAYS_EN[weekday]
  const b = SPA_HOURS.find(h => (h.dayOfWeek as readonly string[]).includes(name)) ?? SPA_HOURS[0]
  return { o: toMin(b.opens), c: toMin(b.closes) }
}

export function fmtTime(t: number) {
  const h24 = Math.floor(t / 60)
  const m = t % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

export function daySlots(y: number, mo: number, d: number, dur: number) {
  const { o, c } = openingFor(new Date(y, mo, d).getDay())
  const step = dur <= 60 ? 30 : 60
  const out: string[] = []
  for (let m = o + EDGE; m <= c - EDGE; m += step) out.push(fmtTime(m))
  return out
}

/** Fecha y hora actuales en Bogotá. `mo` va de 0 a 11 y `min` son minutos desde medianoche. */
export function bogotaNow() {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const g = (t: string) => Number(p.find(x => x.type === t)?.value ?? 0)
  const hr = g('hour') % 24
  return { y: g('year'), mo: g('month') - 1, d: g('day'), min: hr * 60 + g('minute') }
}

function slotMinutes(s: string) {
  const m = s.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)
  if (!m) return 0
  return ((Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0)) * 60 + Number(m[2])
}

export function availableSlots(y: number, mo: number, d: number, dur: number) {
  const all = daySlots(y, mo, d, dur)
  const now = bogotaNow()
  const today = y === now.y && mo === now.mo && d === now.d
  return today ? all.filter(t => slotMinutes(t) >= now.min + LEAD) : all
}

export function monthCells(y: number, mo: number) {
  const first = new Date(y, mo, 1).getDay()
  const total = new Date(y, mo + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/** Un día está bloqueado si ya pasó o si hoy ya no quedan horas. */
export function dayBlocked(y: number, mo: number, d: number, dur: number) {
  const now = bogotaNow()
  const cell = y * 10000 + mo * 100 + d
  const today = now.y * 10000 + now.mo * 100 + now.d
  if (cell < today) return true
  if (cell > today) return false
  return availableSlots(y, mo, d, dur).length === 0
}
