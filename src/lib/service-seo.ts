/**
 * Search copy for the /services/[serviceId] detail pages.
 *
 * Search Console kept these pages in "Crawled - currently not indexed": each
 * one shipped ~220 words, a title like "Axila — Diamond Spa Medellín" and a
 * one-line description, so Google saw 20 near-empty templates. Everything here
 * is derived from the service data and `./spa` (price, durations, address,
 * hours) so each page gets unique, factual copy without hand-writing 40 pages.
 * Never add claims that aren't backed by those sources.
 */

import { DURATION_MINUTES, formatCop, type ServiceDef } from './services'
import { SPA_ADDRESS, SPA_DIRECTIONS, SPA_HOURS, SPA_PHONES, SPA_RATING } from './spa'

type Locale = 'en' | 'es'
type Faq = { question: string; answer: string }

/** Lowest price the service can be booked for. */
export function serviceFromPrice(s: ServiceDef): number {
  if (s.pricingModel === 'duration') return Math.min(...DURATION_MINUTES.map(m => s.prices[m]))
  if (s.pricingModel === 'flat') return s.price
  return Math.min(s.waxPrice, s.machinePrice)
}

/**
 * Descriptive name a person would actually search for. The catalogue names are
 * menu labels ("Axila", "Deportivo", "Four hands") that only make sense inside
 * their category heading.
 */
export function serviceSearchName(s: ServiceDef, locale: Locale): string {
  const name = s.name[locale]
  if (s.categoryId === 'massages') {
    if (locale === 'en') return /massage/i.test(name) ? name : `${name} massage`
    if (/masaje/i.test(name)) return name
    // "Con Piedras Volcánicas" reads as a continuation of "Masaje"
    return `Masaje ${name.replace(/^Con /, 'con ')}`
  }
  if (s.categoryId === 'hair-removal') {
    return locale === 'en' ? `${name} hair removal` : `Depilación de ${name.toLowerCase()}`
  }
  return name
}

export function serviceSeoTitle(s: ServiceDef, locale: Locale): string {
  const name = serviceSearchName(s, locale)
  const from = formatCop(serviceFromPrice(s))
  return locale === 'en'
    ? `${name} in Medellín from ${from} | Diamond Spa`
    : `${name} en Medellín desde ${from} | Diamond Spa`
}

export function serviceSeoDescription(s: ServiceDef, locale: Locale): string {
  const from = formatCop(serviceFromPrice(s))
  const lead = s.shortDesc[locale].replace(/[.\s]+$/, '')
  return locale === 'en'
    ? `${lead}. From ${from} in El Poblado, Medellín. ⭐ ${SPA_RATING.value} · private cabin, no prepayment. Book online.`
    : `${lead}. Desde ${from} en El Poblado, Medellín. ⭐ ${SPA_RATING.value} · cabina privada, sin pago anticipado. Reserva en línea.`
}

/** Spanish article for the search name ("la depilación", "el masaje"). */
function esArticle(name: string): 'la' | 'el' {
  return /^(depilación|limpieza|hidratación)/i.test(name) ? 'la' : 'el'
}

/** Mid-sentence form: lowercase, except brand names like HydraFacial. */
function inline(s: ServiceDef, name: string): string {
  return s.categoryId === 'facials' && /hydra|hidra/i.test(name) ? name : name.toLowerCase()
}

function priceAnswer(s: ServiceDef, locale: Locale, name: string): string {
  if (s.pricingModel === 'duration') {
    const [p30, p60, p90] = DURATION_MINUTES.map(m => formatCop(s.prices[m]))
    return locale === 'en'
      ? `The ${inline(s, name)} at Diamond Spa costs ${p30} for 30 minutes, ${p60} for 60 minutes and ${p90} for 90 minutes. The price includes the private cabin and the full session time.`
      : `${esArticle(name) === 'la' ? 'La' : 'El'} ${inline(s, name)} en Diamond Spa cuesta ${p30} por 30 minutos, ${p60} por 60 minutos y ${p90} por 90 minutos. El precio incluye la cabina privada y el tiempo completo de la sesión.`
  }
  if (s.pricingModel === 'flat') {
    return locale === 'en'
      ? `${name} at Diamond Spa costs ${formatCop(s.price)} per session, in a private cabin in El Poblado.`
      : `${esArticle(name) === 'la' ? 'La' : 'El'} ${inline(s, name)} en Diamond Spa cuesta ${formatCop(s.price)} por sesión, en cabina privada en El Poblado.`
  }
  return locale === 'en'
    ? `${name} costs ${formatCop(s.waxPrice)} with wax and ${formatCop(s.machinePrice)} with machine. You choose the method when you book.`
    : `La ${inline(s, name)} cuesta ${formatCop(s.waxPrice)} con cera y ${formatCop(s.machinePrice)} con máquina. Eliges el método al reservar.`
}

export function serviceFaqs(s: ServiceDef, locale: Locale): Faq[] {
  const name = serviceSearchName(s, locale)
  const [week, sunday] = SPA_HOURS
  const hours = locale === 'en'
    ? `${week.days.en} ${week.display}, ${sunday.days.en} ${sunday.display}`
    : `${week.days.es} ${week.display}, ${sunday.days.es} ${sunday.display}`

  const faqs: Faq[] = [
    {
      question: locale === 'en'
        ? `How much does ${inline(s, name)} cost in Medellín?`
        : `¿Cuánto cuesta ${esArticle(name)} ${inline(s, name)} en Medellín?`,
      answer: priceAnswer(s, locale, name),
    },
  ]

  if (s.pricingModel === 'duration') {
    faqs.push({
      question: locale === 'en' ? 'How long is the session?' : '¿Cuánto dura la sesión?',
      answer: locale === 'en'
        ? `You can book 30, 60 or 90 minutes. 60 minutes is the most requested length; 90 minutes gives the therapist time to work the whole body without rushing.`
        : `Puedes reservar 30, 60 o 90 minutos. La sesión de 60 minutos es la más pedida; la de 90 minutos le da a la terapeuta tiempo de trabajar todo el cuerpo sin prisa.`,
    })
  }

  faqs.push(
    {
      question: locale === 'en' ? `Where can I get ${inline(s, name)} in Medellín?` : `¿Dónde hacerme ${esArticle(name)} ${inline(s, name)} en Medellín?`,
      answer: locale === 'en'
        ? `At Diamond Spa, ${SPA_ADDRESS.full}. ${SPA_DIRECTIONS.driving.en}; ${SPA_DIRECTIONS.parking.en.toLowerCase()}. Opening hours: ${hours}.`
        : `En Diamond Spa, ${SPA_ADDRESS.full}. ${SPA_DIRECTIONS.driving.es}; ${SPA_DIRECTIONS.parking.es.toLowerCase()}. Horario: ${hours}.`,
    },
    {
      question: locale === 'en' ? 'Do I have to pay in advance to book?' : '¿Tengo que pagar por adelantado para reservar?',
      answer: locale === 'en'
        ? `No. Booking online is free and there is no prepayment — you pay at the spa when you arrive. You can also book on WhatsApp at ${SPA_PHONES[0].display}.`
        : `No. Reservar en línea es gratis y no hay pago anticipado: pagas directamente en el spa al llegar. También puedes reservar por WhatsApp al ${SPA_PHONES[0].display}.`,
    },
  )

  return faqs
}
