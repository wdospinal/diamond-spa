/**
 * Catálogo del chat de la pauta (español): servicios, precios y utilidades.
 *
 * Los precios son una copia de los del sitio (services.ts). Están aquí, en un
 * solo lugar, para que los textos del chat y la lista de precios no se
 * desalineen entre sí.
 */
import { toE164 } from './user-data'

export type Cat = 'masajes' | 'faciales' | 'depilacion'
export type Price = { label: string; value: number }
export type Svc = {
  id: string
  cat: Cat
  /** Nombre completo, el que se guarda en el lead y va a WhatsApp. */
  name: string
  /** Nombre corto para botones: "Reservar Relajante". */
  short: string
  /** Una línea que dice qué es. */
  blurb: string
  durMin: number
  prices: Price[]
}

export const CATS: { id: Cat; label: string }[] = [
  { id: 'masajes', label: 'Masajes' },
  { id: 'faciales', label: 'Faciales' },
  { id: 'depilacion', label: 'Depilación' },
]

const massage = (id: string, name: string, short: string, blurb: string, durMin: number, p: [number, number, number]): Svc => ({
  id, cat: 'masajes', name, short, blurb, durMin,
  prices: [
    { label: '30 min', value: p[0] },
    { label: '60 min', value: p[1] },
    { label: '90 min', value: p[2] },
  ],
})
const facial = (id: string, name: string, short: string, durMin: number, value: number): Svc => ({
  id, cat: 'faciales', name, short, blurb: '', durMin, prices: [{ label: `${durMin} min`, value }],
})
const wax = (id: string, name: string, short: string, durMin: number, cera: number, maquina: number): Svc => ({
  id, cat: 'depilacion', name, short, blurb: '', durMin,
  prices: [{ label: 'Cera', value: cera }, { label: 'Máquina', value: maquina }],
})

export const SVCS: Svc[] = [
  massage('relaxing', 'Masaje Relajante', 'Relajante', 'Movimientos largos y suaves para bajar el estrés', 60, [120000, 200000, 260000]),
  massage('deep-tissue', 'Tejido Profundo', 'Tejido Profundo', 'Presión lenta y firme sobre nudos y tensión crónica', 60, [130000, 220000, 280000]),
  massage('sports', 'Masaje Deportivo', 'Deportivo', 'Descontracturante con pistola de percusión y estiramientos asistidos', 60, [140000, 240000, 300000]),
  massage('hot-stones', 'Piedras Volcánicas', 'Piedras volcánicas', 'Piedras de basalto calientes sobre puntos clave', 75, [130000, 220000, 280000]),
  massage('four-hands', '4 Manos', '4 Manos', 'Dos terapeutas a la vez, en sincronía; recomendado desde 60 min', 60, [230000, 350000, 480000]),
  massage('duo', 'Duo Masaje', 'Duo', 'Dos personas, misma sala, dos terapeutas; el precio es para los dos con la misma técnica', 60, [220000, 380000, 500000]),
  massage('sensitive', 'Masaje Sensitivo', 'Sensitivo', 'Cuerpo completo, suave y lento', 60, [130000, 220000, 280000]),
  facial('hidrafacial', 'HydraFacial', 'HydraFacial', 90, 350000),
  facial('lf-profunda', 'Limpieza Facial Profunda', 'Limpieza Profunda', 60, 250000),
  facial('hidratacion', 'Hidratación Facial', 'Hidratación', 45, 200000),
  facial('lf-espalda', 'Limpieza de Espalda', 'Limpieza de Espalda', 60, 200000),
  facial('lf-basica', 'Limpieza Facial Básica', 'Limpieza Básica', 45, 150000),
  wax('dep-axila', 'Axila', 'Axila', 20, 30000, 20000),
  wax('dep-bikini', 'Zona Íntima', 'Zona íntima', 30, 80000, 60000),
  wax('dep-m-pierna', 'Media Pierna', 'Media pierna', 30, 100000, 70000),
  wax('dep-pierna', 'Pierna Completa', 'Pierna completa', 45, 150000, 85000),
  wax('dep-pecho', 'Pecho', 'Pecho', 30, 80000, 50000),
  wax('dep-espalda', 'Espalda', 'Espalda', 30, 60000, 40000),
  wax('dep-perianal', 'Zona Perianal', 'Zona perianal', 30, 65000, 45000),
  wax('dep-full', 'Cuerpo Completo', 'Cuerpo completo', 120, 400000, 250000),
]

/** Técnicas que se pueden elegir en un Duo Masaje (el 4 Manos y el Duo no aplican). */
export const DUO_TECHNIQUES = ['relaxing', 'deep-tissue', 'sports', 'hot-stones', 'sensitive']

export type Locale = 'es' | 'en'

export const CATS_EN: { id: Cat; label: string }[] = [
  { id: 'masajes', label: 'Massages' },
  { id: 'faciales', label: 'Facials' },
  { id: 'depilacion', label: 'Hair removal' },
]

/** Categorías con la etiqueta en el idioma del chat. */
export const catsFor = (locale: Locale = 'es') => (locale === 'en' ? CATS_EN : CATS)

/**
 * Nombres en inglés (los mismos que usa la página de reserva en inglés, salvo
 * la zona íntima). Los precios, las duraciones y los identificadores no cambian.
 */
const EN: Record<string, { name: string; short: string; blurb: string }> = {
  relaxing: { name: 'Relaxing Massage', short: 'Relaxing', blurb: 'Long, gentle strokes to ease stress' },
  'deep-tissue': { name: 'Deep Tissue', short: 'Deep Tissue', blurb: 'Slow, firm pressure on knots and chronic tension' },
  sports: { name: 'Sports Massage', short: 'Sports', blurb: 'Muscle release with a percussion gun and assisted stretching' },
  'hot-stones': { name: 'Volcanic Stones', short: 'Volcanic stones', blurb: 'Heated basalt stones on key points' },
  'four-hands': { name: 'Four Hands', short: 'Four Hands', blurb: 'Two therapists at once, in sync; recommended from 60 min' },
  duo: { name: 'Duo Massage', short: 'Duo', blurb: 'Two people, same room, two therapists; the price is for both with the same technique' },
  sensitive: { name: 'Sensitive Massage', short: 'Sensitive', blurb: 'Full body, gentle and slow' },
  hidrafacial: { name: 'HydraFacial', short: 'HydraFacial', blurb: '' },
  'lf-profunda': { name: 'Deep Facial Cleansing', short: 'Deep Cleansing', blurb: '' },
  hidratacion: { name: 'Facial Hydration', short: 'Hydration', blurb: '' },
  'lf-espalda': { name: 'Back Cleansing', short: 'Back Cleansing', blurb: '' },
  'lf-basica': { name: 'Basic Facial Cleansing', short: 'Basic Cleansing', blurb: '' },
  'dep-axila': { name: 'Underarm', short: 'Underarm', blurb: '' },
  'dep-bikini': { name: 'Intimate Area', short: 'Intimate area', blurb: '' },
  'dep-m-pierna': { name: 'Half Leg', short: 'Half leg', blurb: '' },
  'dep-pierna': { name: 'Full Leg', short: 'Full leg', blurb: '' },
  'dep-pecho': { name: 'Chest', short: 'Chest', blurb: '' },
  'dep-espalda': { name: 'Back', short: 'Back', blurb: '' },
  'dep-perianal': { name: 'Perianal Area', short: 'Perianal area', blurb: '' },
  'dep-full': { name: 'Full Body', short: 'Full body', blurb: '' },
}

const PRICE_LABEL_EN: Record<string, string> = { Cera: 'Wax', 'Máquina': 'Machine' }

/** Copia del servicio con los textos en el idioma pedido (el español es el original). */
export function localizeSvc(s: Svc, locale: Locale = 'es'): Svc {
  if (locale !== 'en') return s
  const t = EN[s.id]
  if (!t) throw new Error(`Falta la traducción al inglés del servicio: ${s.id}`)
  return {
    ...s,
    name: t.name,
    short: t.short,
    blurb: t.blurb,
    prices: s.prices.map(p => ({ ...p, label: PRICE_LABEL_EN[p.label] ?? p.label })),
  }
}

export function svcById(id: string, locale: Locale = 'es'): Svc {
  const s = SVCS.find(x => x.id === id)
  if (!s) throw new Error(`Servicio del chat desconocido: ${id}`)
  return localizeSvc(s, locale)
}

export function svcsOf(cat: Cat, locale: Locale = 'es') {
  return SVCS.filter(s => s.cat === cat).map(s => localizeSvc(s, locale))
}

/** 200000 → "$200.000" (sin depender de la configuración regional del navegador). */
export function money(n: number) {
  return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Precio de un servicio por duración (30, 60, 90), por "wax" / "machine", o el primero. */
export function priceOf(id: string, key?: 30 | 60 | 90 | 'wax' | 'machine'): number {
  const s = svcById(id)
  let p: Price | undefined
  if (key === undefined) p = s.prices[0]
  else if (key === 'wax') p = s.prices.find(x => x.label === 'Cera')
  else if (key === 'machine') p = s.prices.find(x => x.label === 'Máquina')
  else p = s.prices.find(x => x.label === `${key} min`)
  if (!p) throw new Error(`Precio no encontrado: ${id} ${key}`)
  return p.value
}

/** Atajo para los textos: m('relaxing', 60) → "$200.000". */
export const m = (id: string, key?: 30 | 60 | 90 | 'wax' | 'machine') => money(priceOf(id, key))

/** Minutos de una opción: "60 min" → 60; la depilación usa la duración de la zona. */
export function optionMinutes(s: Svc, optIdx: number): number {
  const n = s.prices[optIdx]?.label.match(/(\d+)\s*min/i)?.[1]
  return n ? Number(n) : s.durMin
}

/** Deja el celular en dígitos, sin el 57 repetido cuando se escribe completo en Colombia. */
export function phoneDigits(code: string, raw: string) {
  let digits = raw.replace(/\D/g, '')
  if (code === '+57' && digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2)
  return digits
}

/**
 * Celular completo: en Colombia, 10 dígitos que empiezan por 3; en otros
 * países, un número que Google Ads pueda reconocer (E.164 válido). Con un
 * número incompleto el evento saldría sin teléfono.
 */
export function validChatPhone(code: string, raw: string): boolean {
  const digits = phoneDigits(code, raw)
  if (code === '+57') return /^3\d{9}$/.test(digits)
  return toE164(`${code}${digits}`) !== null
}
