/**
 * Parser del texto libre con que el equipo describe cada comprobante.
 *
 * Los mensajes son los de siempre, sin formato: «Relajante 90min»,
 * «220.000 masaje sensitivo 1 hora Ana», «Arriendo del spa»,
 * «Pago 20% masaje relajante Angelica». La idea NO es adivinarlo todo, sino
 * sacar lo que se pueda con certeza y dejar el resto en `null` para que el bot
 * lo pregunte y quede editable en /admin/caja. Nunca lanza.
 *
 * Dos trampas reales del chat que explican el orden de las reglas:
 *  - «Pago 20% masaje relajante Angelica» es un EGRESO (comisión) aunque
 *    nombre un servicio, así que las reglas de egreso corren antes que el
 *    match de servicio.
 *  - «Pago servicios Diamond spa» es un INGRESO aunque empiece por «Pago»,
 *    por eso la regla de servicios públicos exige las dos palabras juntas.
 */

import { parseCop } from '@/lib/bold-parser'
import { getServicePrice, SERVICES } from '@/lib/services'
import type { ExpenseCategoryId, LedgerKind } from '@/lib/ledger-types'

export interface ParsedEntry {
  kind: LedgerKind | null
  categoryId: string | null
  amountCop: number | null
  /** De dónde salió el monto: del texto, o sugerido por el catálogo de precios. */
  amountSource: 'text' | 'catalog' | null
  serviceId: string | null
  /** Nombre reconocido del servicio; se llena aunque no exista en el catálogo. */
  serviceLabel: string | null
  durationMinutes: number | null
  quantity: number
  therapist: string | null
  confidence: 'high' | 'low'
}

// ─── Normalización ──────────────────────────────────────────────────────────────

/** minúsculas, sin tildes y con los espacios colapsados. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Servicios ──────────────────────────────────────────────────────────────────

/**
 * Alias → id del catálogo. Se buscan como subcadena, así que el plural sale
 * gratis («relajantes» contiene «relajante»). Los más específicos van primero
 * para que «limpieza facial profunda» gane sobre «limpieza facial».
 */
const SERVICE_ALIASES: [alias: string, serviceId: string][] = [
  ['limpieza facial profunda', 'limpieza-facial-profunda'],
  ['limpieza facial basica', 'limpieza-facial-basica'],
  ['limpieza de espalda', 'limpieza-espalda'],
  ['limpieza espalda', 'limpieza-espalda'],
  ['hidratacion facial', 'hidratacion-facial'],
  ['hidrafacial', 'hidrafacial'],
  ['limpieza facial', 'limpieza-facial-basica'],
  ['limpieza', 'limpieza-facial-basica'],
  ['depilacion cuerpo completo', 'depilacion-cuerpo-completo'],
  ['cuerpo completo', 'depilacion-cuerpo-completo'],
  ['pierna completa', 'depilacion-pierna-completa'],
  ['media pierna', 'depilacion-media-pierna'],
  ['zona perianal', 'depilacion-zona-perianal'],
  ['perianal', 'depilacion-zona-perianal'],
  ['depilacion axila', 'depilacion-axila'],
  ['axila', 'depilacion-axila'],
  ['bikini', 'depilacion-bikini'],
  ['depilacion pecho', 'depilacion-pecho'],
  ['depilacion espalda', 'depilacion-espalda'],
  ['piedras volcanicas', 'hot-stones'],
  ['piedras calientes', 'hot-stones'],
  ['piedras', 'hot-stones'],
  ['deep tissue', 'deep-tissue'],
  ['descontracturante', 'deep-tissue'],
  ['4 manos', 'four-hands'],
  ['cuatro manos', 'four-hands'],
  ['deportivo', 'sports'],
  ['sensitivo', 'sensitive'],
  ['sensitiva', 'sensitive'],
  ['relajante', 'relaxing'],
  ['duo', 'duo'],
]

/**
 * Servicios que el equipo vende y nombra en el chat pero que NO están en
 * `services.ts` (la web no los publica). Se reconocen para poder clasificar el
 * movimiento como ingreso; el `serviceId` queda null y el monto siempre entra
 * a mano, porque no hay precio de catálogo con qué sugerirlo.
 */
const OFF_CATALOG_SERVICES: [alias: string, label: string][] = [
  ['envolvente premium', 'Envolvente premium'],
  ['envolvente', 'Envolvente'],
  ['sublime', 'Sublime'],
  ['mixto', 'Mixto'],
  ['exfoliacion', 'Exfoliación'],
]

const SERVICE_NAMES = new Map(SERVICES.map(s => [s.id as string, s.name.es]))

interface ServiceMatch {
  serviceId: string | null
  label: string
  /** Posición donde empezó el alias, para leer la cantidad que lo precede. */
  index: number
}

function matchService(text: string): ServiceMatch | null {
  for (const [alias, serviceId] of SERVICE_ALIASES) {
    const index = text.indexOf(alias)
    if (index !== -1) {
      return { serviceId, label: SERVICE_NAMES.get(serviceId) ?? alias, index }
    }
  }
  for (const [alias, label] of OFF_CATALOG_SERVICES) {
    const index = text.indexOf(alias)
    if (index !== -1) return { serviceId: null, label, index }
  }
  return null
}

// ─── Terapeutas ─────────────────────────────────────────────────────────────────

/**
 * Nombre de pila → nombre para mostrar.
 *
 * A propósito NO sale de `THERAPISTS` (la lista del equipo en la página): el
 * chat nombra a personas que no están publicadas, y si alguien se quita de la
 * web sus movimientos pasados dejarían de reconocerse. La contabilidad necesita
 * su propia lista, que crece agregando una línea aquí.
 * `sarira` es como quedó escrito «Saira» en un mensaje real.
 */
const THERAPIST_ALIASES = new Map<string, string>([
  ['daniela', 'Daniela Salina'],
  ['dani', 'Daniela Salina'],
  ['sary', 'Sary Paez'],
  ['ana', 'Ana Maria'],
  ['sheyla', 'Sheyla Tinoco'],
  ['sheila', 'Sheyla Tinoco'],
  ['tatiana', 'Tatiana'],
  ['saira', 'Saira Bedoya'],
  ['sarira', 'Saira Bedoya'],
  ['nicol', 'Nicol'],
  ['angelica', 'Angélica'],
])

function matchTherapist(text: string): string | null {
  for (const [alias, name] of THERAPIST_ALIASES) {
    if (new RegExp(`\\b${alias}\\b`).test(text)) return name
  }
  return null
}

// ─── Duración y cantidad ────────────────────────────────────────────────────────

/** El catálogo solo cobra 30/60/90, así que se acerca al escalón más cercano. */
function snapDuration(minutes: number): number {
  if (minutes <= 44) return 30
  if (minutes <= 75) return 60
  return 90
}

/**
 * Saca la duración y devuelve el texto SIN ese token: si no se quita, «90min»
 * o «1 hora» se cuelan después como si fueran el monto.
 */
function extractDuration(text: string): { minutes: number | null; rest: string } {
  const mins = /(\d{1,3})\s*(?:minutos|minuto|mins|min)\b/.exec(text)
  if (mins) {
    return { minutes: snapDuration(Number(mins[1])), rest: text.replace(mins[0], ' ') }
  }
  const hours = /(\d{1,2})(?:[.,](\d))?\s*(?:horas|hora|hrs|hr|h)\b/.exec(text)
  if (hours) {
    const value = Number(hours[1]) + (hours[2] ? Number(hours[2]) / 10 : 0)
    return { minutes: snapDuration(Math.round(value * 60)), rest: text.replace(hours[0], ' ') }
  }
  return { minutes: null, rest: text }
}

/** «4 relajantes 1 hora» → 4: un número pegado justo antes del nombre del servicio. */
function extractQuantity(text: string, serviceIndex: number): number {
  const before = text.slice(0, serviceIndex)
  const m = /(\d{1,2})\s+$/.exec(before)
  if (!m) return 1
  const n = Number(m[1])
  return n >= 2 && n <= 20 ? n : 1
}

// ─── Monto ──────────────────────────────────────────────────────────────────────

/**
 * Monto en pesos. Se corre sobre el texto ya sin duración ni porcentajes, en
 * orden de menos a más ambiguo. Los `20k` y los `50 tip` del chat son miles.
 */
function extractAmount(text: string): number | null {
  const clean = text.replace(/\d+\s*(?:%|por ciento)/g, ' ')

  const explicit = /\$\s*([\d][\d.,]*)/.exec(clean)
  if (explicit) {
    const n = parseCop(explicit[1])
    if (Number.isFinite(n) && n > 0) return n
  }

  // Agrupación colombiana: 220.000, 1.500.000, 469.283.
  const grouped = /\b(\d{1,3}(?:\.\d{3})+)\b/.exec(clean)
  if (grouped) return parseCop(grouped[1])

  const kilo = /\b(\d{1,4})\s*k\b/.exec(clean)
  if (kilo) return Number(kilo[1]) * 1000

  const plain = /\b(\d{4,})\b/.exec(clean)
  if (plain) return Number(plain[1])

  // «50 tip» / «30 tip»: las propinas se dicen en miles.
  const tip = /\b(\d{1,3})\s*(?:tip|propina)\b/.exec(clean)
  if (tip) return Number(tip[1]) * 1000

  return null
}

// ─── Clasificación ingreso / egreso ─────────────────────────────────────────────

const EXPENSE_RULES: { re: RegExp; category: ExpenseCategoryId }[] = [
  { re: /\barriendo\b|\balquiler\b|\bcanon\b/, category: 'rent' },
  { re: /\balmuerzo\b|\bdesayuno\b|\bcena\b|\brefrigerio\b|\bcomida\b/, category: 'food' },
  { re: /\bpublicidad\b|\bads\b|\bmeta\b|\bfacebook\b|\bgoogle\b|\bcampana\b|\bcoper\b|\bcopper\b/, category: 'marketing' },
  // «servicios publicos» va junto a propósito: «Pago servicios Diamond spa» es un ingreso.
  { re: /\binternet\b|servicios publicos|\bagua\b|\bluz\b|\benergia\b|\bepm\b|\bgas\b/, category: 'utilities' },
  { re: /\binsumos\b|\baseo\b|\bd1\b|\bexito\b|\bara\b|\bpapeleria\b|\btoallas\b/, category: 'supplies' },
  { re: /\btablet\b|\bcomputador\b|\bcelular\b|\bcamilla\b|\btelevisor\b|\bmueble\b|\bequipo\b/, category: 'equipment' },
  { re: /\bnomina\b|\bsalario\b|\bsueldo\b|\bquincena\b/, category: 'payroll' },
]

const PAYS_OUT = /\bpago\b|\bpagar\b|\babono\b|\bpagamos\b|restante de pago/
const SHARE_OF_SALE = /\bcomision\b|\bporcentaje\b|%|\btip\b|\bpropina\b/
const INCOME_HINT = /\bingreso\b|pago .*\bdiamond\b|\babono cliente\b/

interface Classification {
  kind: LedgerKind | null
  categoryId: string | null
}

function classify(text: string, service: ServiceMatch | null, therapist: string | null): Classification {
  if (INCOME_HINT.test(text)) {
    return { kind: 'income', categoryId: service ? 'service' : 'other' }
  }

  // La comisión/propina que SALE hacia una terapeuta nombra el servicio pero es
  // un egreso; por eso se decide antes de mirar el servicio.
  if (PAYS_OUT.test(text) && SHARE_OF_SALE.test(text)) {
    return { kind: 'expense', categoryId: 'commission' }
  }

  for (const rule of EXPENSE_RULES) {
    if (rule.re.test(text)) return { kind: 'expense', categoryId: rule.category }
  }

  // «Pago Sary», «Restante de pago Sarira»: pagar a una persona, sin servicio.
  if (PAYS_OUT.test(text) && therapist && !service) {
    return { kind: 'expense', categoryId: 'payroll' }
  }

  if (service) return { kind: 'income', categoryId: 'service' }

  if (/\btip\b|\bpropina\b/.test(text)) return { kind: 'income', categoryId: 'tip' }

  return { kind: null, categoryId: null }
}

// ─── API pública ────────────────────────────────────────────────────────────────

/**
 * Interpreta el texto de un comprobante. Lo que no se pueda determinar queda en
 * `null` y con `confidence: 'low'`, que es la señal para que el bot pregunte.
 */
export function parseLedgerText(raw: string): ParsedEntry {
  const text = normalize(raw)
  const empty: ParsedEntry = {
    kind: null, categoryId: null, amountCop: null, amountSource: null,
    serviceId: null, serviceLabel: null, durationMinutes: null, quantity: 1,
    therapist: null, confidence: 'low',
  }
  if (!text) return empty

  const { minutes, rest } = extractDuration(text)
  const service = matchService(text)
  const therapist = matchTherapist(text)
  const { kind, categoryId } = classify(text, service, therapist)
  const quantity = service ? extractQuantity(text, service.index) : 1

  let amountCop = extractAmount(rest)
  let amountSource: ParsedEntry['amountSource'] = amountCop !== null ? 'text' : null

  // Sin monto en el texto, el catálogo puede sugerirlo — pero es solo una
  // sugerencia: quien registra confirma el valor (puede haber descuento).
  if (amountCop === null && kind === 'income' && service?.serviceId) {
    const suggested = getServicePrice(service.serviceId, minutes)
    if (suggested !== undefined) {
      amountCop = suggested * quantity
      amountSource = 'catalog'
    }
  }

  const confidence: ParsedEntry['confidence'] =
    kind !== null && amountSource === 'text' ? 'high' : 'low'

  return {
    kind,
    categoryId,
    amountCop,
    amountSource,
    serviceId: service?.serviceId ?? null,
    serviceLabel: service?.label ?? null,
    durationMinutes: minutes,
    quantity,
    therapist,
    confidence,
  }
}
