/**
 * Copy for the /services price list, derived from the catalogue.
 *
 * Search Console left /es/services in "Crawled - currently not indexed": the
 * page was a bare list of names and prices with a generic "Servicios y
 * Precios" heading and no text answering the questions people search with
 * ("cuánto cuesta un masaje en Medellín"). Everything here is computed from
 * `services.ts`, so the answers can never drift from the menu. Don't add
 * claims that aren't backed by the catalogue or the FAQs in `faqs.ts`.
 */

import { DURATION_MINUTES, SERVICES, formatCop, type DurationMinutes, type ServiceDef } from './services'
import { serviceSearchName } from './service-seo'

type Locale = 'en' | 'es'
type Faq = { question: string; answer: string }

type DurationService = ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }
type FlatService = ServiceDef & { pricingModel: 'flat'; price: number }
type WaxService = ServiceDef & { pricingModel: 'wax-machine'; waxPrice: number; machinePrice: number }

const all = SERVICES as unknown as ServiceDef[]
const massages = all.filter((s): s is DurationService => s.pricingModel === 'duration')
const facials = all.filter((s): s is FlatService => s.pricingModel === 'flat')
const waxing = all.filter((s): s is WaxService => s.pricingModel === 'wax-machine')

function minBy<T>(items: T[], value: (t: T) => number): T {
  return items.reduce((a, b) => (value(b) < value(a) ? b : a))
}
function maxBy<T>(items: T[], value: (t: T) => number): T {
  return items.reduce((a, b) => (value(b) > value(a) ? b : a))
}

/** Search name in running text: "masaje relajante", "depilación de axila", but "Hidrafacial". */
function inline(s: ServiceDef, locale: Locale): string {
  const name = serviceSearchName(s, locale)
  return /^(hydra|hidra)facial$/i.test(name) ? name : name.toLowerCase()
}

/** Cheapest and dearest massage for each session length. */
function massageRange(min: DurationMinutes) {
  const cheap = minBy(massages, s => s.prices[min])
  const dear = maxBy(massages, s => s.prices[min])
  return { cheap, dear, from: cheap.prices[min], to: dear.prices[min] }
}

export type PriceSummaryCard = { anchor: string; icon: string; title: string; from: string; detail: string }

/** "From" price per category for the summary row at the top of /services. */
export function servicesPriceSummary(locale: Locale): PriceSummaryCard[] {
  const m30 = massageRange(30)
  const m60 = massageRange(60)
  const facial = minBy(facials, s => s.price)
  const machine = minBy(waxing, s => s.machinePrice)
  const wax = minBy(waxing, s => s.waxPrice)
  const en = locale === 'en'
  return [
    {
      anchor: 'masajes',
      icon: 'spa',
      title: en ? 'Massages' : 'Masajes',
      from: formatCop(m30.from),
      detail: en ? `30 min · 60 min from ${formatCop(m60.from)}` : `30 min · 60 min desde ${formatCop(m60.from)}`,
    },
    {
      anchor: 'faciales',
      icon: 'face',
      title: en ? 'Facials' : 'Faciales',
      from: formatCop(facial.price),
      detail: en ? `${facials.length} treatments, one price per session` : `${facials.length} tratamientos, precio por sesión`,
    },
    {
      anchor: 'depilacion',
      icon: 'content_cut',
      title: en ? 'Hair removal' : 'Depilación',
      from: formatCop(machine.machinePrice),
      detail: en ? `Machine · wax from ${formatCop(wax.waxPrice)}` : `Máquina · cera desde ${formatCop(wax.waxPrice)}`,
    },
  ]
}

/** Price questions for /services, answered from the catalogue. */
export function servicesPageFaqs(locale: Locale): Faq[] {
  const [r30, r60, r90] = DURATION_MINUTES.map(massageRange)
  const facialsByPrice = [...facials].sort((a, b) => a.price - b.price)
  const cheapWax = minBy(waxing, s => s.waxPrice)
  const dearWax = maxBy(waxing, s => s.waxPrice)
  const cheapMachine = minBy(waxing, s => s.machinePrice)

  if (locale === 'en') {
    return [
      {
        question: 'How much does a massage cost in Medellín?',
        answer: `At Diamond Spa massages start at ${formatCop(r30.from)} for 30 minutes. A 60-minute session, the most requested length, costs between ${formatCop(r60.from)} (${inline(r60.cheap, 'en')}) and ${formatCop(r60.to)} (${inline(r60.dear, 'en')}), and 90 minutes between ${formatCop(r90.from)} and ${formatCop(r90.to)}.`,
      },
      {
        question: 'What is the cheapest massage?',
        answer: r30.cheap.id === r60.cheap.id
          ? `The ${inline(r30.cheap, 'en')}: ${formatCop(r30.from)} for 30 minutes, or ${formatCop(r60.from)} for a full-body 60-minute session.`
          : `The ${inline(r30.cheap, 'en')}, at ${formatCop(r30.from)} for 30 minutes. If you want a full-body session, the most affordable 60-minute option is the ${inline(r60.cheap, 'en')} at ${formatCop(r60.from)}.`,
      },
      {
        question: 'How much does a facial cost?',
        answer: `Facials are priced per session: ${facialsByPrice.map(s => `${inline(s, 'en')} ${formatCop(s.price)}`).join(', ')}.`,
      },
      {
        question: 'How much does waxing cost?',
        answer: `With wax, from ${formatCop(cheapWax.waxPrice)} (${inline(cheapWax, 'en')}) up to ${formatCop(dearWax.waxPrice)} (${inline(dearWax, 'en')}). By machine it starts at ${formatCop(cheapMachine.machinePrice)}: it is gentler and cheaper, but the result lasts less than with wax. You choose the method when you book.`,
      },
      {
        question: 'Why does the price change with the length of the session?',
        answer: 'You pay for the therapist’s time in the cabin. 30 minutes is enough to focus on one area, such as the back or the legs; 60 minutes covers the whole body; 90 minutes lets the therapist work the whole body without rushing and spend longer on tense areas.',
      },
      {
        question: 'Are the prices final?',
        answer: 'Yes. The prices on this page are the final prices you pay, with no charges added at the counter. They include the private cabin and the full session time. We do not ask for tips; tipping is voluntary.',
      },
      {
        question: 'Do I have to pay in advance?',
        answer: 'No. Booking online is free and you pay at the spa when you arrive.',
      },
    ]
  }

  return [
    {
      question: '¿Cuánto cuesta un masaje en Medellín?',
      answer: `En Diamond Spa los masajes cuestan desde ${formatCop(r30.from)} por 30 minutos. La sesión de 60 minutos, la más pedida, va de ${formatCop(r60.from)} (${inline(r60.cheap, 'es')}) a ${formatCop(r60.to)} (${inline(r60.dear, 'es')}), y la de 90 minutos de ${formatCop(r90.from)} a ${formatCop(r90.to)}.`,
    },
    {
      question: '¿Cuál es el masaje más económico?',
      answer: r30.cheap.id === r60.cheap.id
        ? `El ${inline(r30.cheap, 'es')}: ${formatCop(r30.from)} por 30 minutos, o ${formatCop(r60.from)} por una sesión de cuerpo completo de 60 minutos.`
        : `El ${inline(r30.cheap, 'es')}, por ${formatCop(r30.from)} en 30 minutos. Si quieres una sesión de cuerpo completo, la opción de 60 minutos más económica es el ${inline(r60.cheap, 'es')}, por ${formatCop(r60.from)}.`,
    },
    {
      question: '¿Cuánto cuesta una limpieza facial?',
      answer: `Los faciales tienen un precio por sesión: ${facialsByPrice.map(s => `${inline(s, 'es')} ${formatCop(s.price)}`).join(', ')}.`,
    },
    {
      question: '¿Cuánto cuesta la depilación?',
      answer: `Con cera, desde ${formatCop(cheapWax.waxPrice)} (${inline(cheapWax, 'es')}) hasta ${formatCop(dearWax.waxPrice)} (${inline(dearWax, 'es')}). Con máquina empieza en ${formatCop(cheapMachine.machinePrice)}: es más suave y económica, pero el resultado dura menos que con cera. Eliges el método al reservar.`,
    },
    {
      question: '¿Por qué cambia el precio según la duración?',
      answer: 'Pagas el tiempo de la terapeuta en cabina. 30 minutos alcanzan para trabajar una zona concreta, como la espalda o las piernas; 60 minutos cubren todo el cuerpo; 90 minutos permiten trabajar todo el cuerpo sin prisa y dedicar más tiempo a las zonas con tensión.',
    },
    {
      question: '¿Los precios son finales?',
      answer: 'Sí. Los precios de esta página son el precio final que pagas, sin cargos adicionales en caja. Incluyen la cabina privada y el tiempo completo de la sesión. No pedimos propina; es voluntaria.',
    },
    {
      question: '¿Tengo que pagar por adelantado?',
      answer: 'No. Reservar en línea es gratis y pagas directamente en el spa al llegar.',
    },
  ]
}
