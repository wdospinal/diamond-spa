import type { Locale } from '@/lib/i18n'
import { getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'

/**
 * Special-date gift catalog (/es/fechas-especiales, /en/special-dates).
 *
 * Kept free of heavy imports: routes.ts pulls it into the client language
 * switcher. hreflang helpers live in seo.ts.
 *
 * Plans are built from real SERVICES ids, so their prices follow services.ts
 * instead of being typed twice. Anything that is not a service we sell (wine,
 * jacuzzi, decoration…) stays out: these pages must only promise what we do.
 */

type L = Record<Locale, string>

export type PlanItem = { serviceId: string; minutes?: 30 | 60 | 90 }

/** Extras the spa confirmed it includes (Oct 2026). Don't add one we don't offer. */
export type PlanExtra = 'welcome-drink' | 'aromatherapy' | 'music-therapy' | 'craniofacial' | 'reflexology' | 'wine'

const EXTRA_LABELS: Record<PlanExtra, L> = {
  'welcome-drink': { es: 'Bebida de bienvenida', en: 'Welcome drink' },
  aromatherapy: { es: 'Aromaterapia', en: 'Aromatherapy' },
  'music-therapy': { es: 'Musicoterapia', en: 'Music therapy' },
  craniofacial: { es: 'Masaje cráneo facial', en: 'Craniofacial massage' },
  reflexology: { es: 'Reflexología', en: 'Reflexology' },
  wine: { es: 'Copa de vino', en: 'Glass of wine' },
}

/** Every special-date plan comes with these. */
const BASE_EXTRAS: PlanExtra[] = ['welcome-drink', 'aromatherapy', 'music-therapy']

export type SpecialDatePlan = {
  title: L
  items: PlanItem[]
  note: L
  /** Added on top of BASE_EXTRAS. */
  extras?: PlanExtra[]
  /**
   * Fixed special-date price in COP. Until it is set, the plan costs the sum
   * of its services at today's prices.
   */
  price?: number
}

/**
 * Session length of flat-priced services, as listed in service-content.ts.
 * A plan containing a service missing here shows no total time.
 */
const FLAT_MINUTES: Partial<Record<string, number>> = {
  hidrafacial: 90,
  'limpieza-facial-profunda': 60,
  'limpieza-facial-basica': 45,
}

/** When the date falls each year: a fixed day, or the nth weekday of a month. */
type DateRule =
  | { kind: 'fixed'; month: number; day: number }
  | { kind: 'nth-weekday'; month: number; weekday: number; nth: number }

export type SpecialDate = {
  /** Each locale has its own section and slug: /es/fechas-especiales/navidad ↔ /en/special-dates/christmas. */
  slug: L
  /** Describes the photo itself (see specialDateImage); not a keyword list. */
  imageAlt: L
  icon: string
  name: L
  when: L
  rule: DateRule
  /** One line for the hub card. */
  tagline: L
  intro: L
  giftTip: L
  plans: SpecialDatePlan[]
  faqs: Record<Locale, { question: string; answer: string }[]>
}

const SECTION: L = { es: '/fechas-especiales', en: '/special-dates' }

/** Hub path for a locale, without the /<lang> prefix. */
export function specialDatesPath(locale: Locale): string {
  return SECTION[locale]
}

/** Occasion path for a locale, without the /<lang> prefix. */
export function specialDatePath(d: SpecialDate, locale: Locale): string {
  return `${SECTION[locale]}/${d.slug[locale]}`
}

/** Photo size as generated (16:9-ish); the -og.jpg is a 1200×630 crop. */
export const SPECIAL_DATE_IMAGE_SIZE = { width: 1376, height: 768 } as const

/**
 * Image files under /public/fechas-especiales, named after the Spanish slug
 * ("regalo-spa-navidad-medellin") so the filename itself is descriptive.
 */
export function specialDateImage(d: SpecialDate) {
  const base = `/fechas-especiales/regalo-spa-${d.slug.es}-medellin`
  return { avif: `${base}.avif`, webp: `${base}.webp`, og: `${base}-og.jpg` }
}

/** Which locale a top-level section segment ("fechas-especiales" / "special-dates") belongs to. */
export function specialDatesSectionLocale(segment: string): Locale | undefined {
  if (`/${segment}` === SECTION.es) return 'es'
  if (`/${segment}` === SECTION.en) return 'en'
  return undefined
}

const relaxFacial: SpecialDatePlan = {
  title: { es: 'Masaje + Hidrafacial', en: 'Massage + HydraFacial' },
  items: [{ serviceId: 'relaxing', minutes: 60 }, { serviceId: 'hidrafacial' }],
  extras: ['craniofacial', 'wine'],
  note: {
    es: 'Una hora de masaje relajante y un Hidrafacial para salir con la piel luminosa.',
    en: 'An hour of relaxing massage plus a HydraFacial for visibly brighter skin.',
  },
}

const duo60: SpecialDatePlan = {
  title: { es: 'Masaje Duo 60 min', en: 'Duo massage, 60 min' },
  items: [{ serviceId: 'duo', minutes: 60 }],
  extras: ['wine'],
  note: {
    es: 'Dos personas en la misma cabina privada, cada una con su terapeuta.',
    en: 'Two people in the same private room, each with their own therapist.',
  },
}

const duo90: SpecialDatePlan = {
  title: { es: 'Masaje Duo 90 min', en: 'Duo massage, 90 min' },
  items: [{ serviceId: 'duo', minutes: 90 }],
  extras: ['craniofacial', 'reflexology', 'wine'],
  note: {
    es: 'La versión larga del Duo: tiempo de sobra para desconectarse juntos.',
    en: 'The long Duo: plenty of time to switch off together.',
  },
}

const deepBack: SpecialDatePlan = {
  title: { es: 'Deep Tissue + Limpieza de espalda', en: 'Deep tissue + Back cleansing' },
  items: [{ serviceId: 'deep-tissue', minutes: 60 }, { serviceId: 'limpieza-espalda' }],
  extras: ['reflexology'],
  note: {
    es: 'Libera la tensión de cuello y espalda y deja la piel de la espalda limpia.',
    en: 'Releases neck and back tension and leaves the skin on the back clean.',
  },
}

const fourHands60: SpecialDatePlan = {
  title: { es: 'Masaje a 4 Manos 60 min', en: 'Four-hands massage, 60 min' },
  items: [{ serviceId: 'four-hands', minutes: 60 }],
  extras: ['craniofacial'],
  note: {
    es: 'Dos terapeutas sincronizadas: el regalo que se siente distinto desde el primer minuto.',
    en: 'Two therapists in sync: a gift that feels different from the first minute.',
  },
}

const stones60: SpecialDatePlan = {
  title: { es: 'Piedras Volcánicas 60 min', en: 'Volcanic stones, 60 min' },
  items: [{ serviceId: 'hot-stones', minutes: 60 }],
  extras: ['reflexology'],
  note: {
    es: 'Calor profundo que suelta los músculos sin presión fuerte.',
    en: 'Deep warmth that loosens muscles without heavy pressure.',
  },
}

const sharedFaqs: Record<Locale, { question: string; answer: string }[]> = {
  es: [
    {
      question: '¿Puedo regalar el plan sin fijar la fecha?',
      answer:
        'Sí. Escríbenos por WhatsApp, pagas el plan y te enviamos la confirmación para entregarla. La persona agenda después según disponibilidad; te confirmamos la vigencia en el mismo chat.',
    },
    {
      question: '¿Puedo agregar una dedicatoria?',
      answer:
        'Claro. Envíanos el mensaje por WhatsApp y lo incluimos en la confirmación del regalo que le haces llegar a la persona.',
    },
    {
      question: '¿Dónde queda Diamond Spa?',
      answer:
        'Estamos en El Poblado, Medellín, a pocos minutos del Parque El Poblado. Todas las sesiones son en cabina privada.',
    },
  ],
  en: [
    {
      question: 'Can I give the plan without setting a date?',
      answer:
        'Yes. Message us on WhatsApp, pay for the plan and we send you a confirmation to hand over. The recipient books later, subject to availability; we confirm how long it is valid in the same chat.',
    },
    {
      question: 'Can I add a personal message?',
      answer:
        'Of course. Send us the message on WhatsApp and we include it in the gift confirmation you pass on.',
    },
    {
      question: 'Where is Diamond Spa?',
      answer:
        'We are in El Poblado, Medellín, a few minutes from Parque El Poblado. Every session is in a private room.',
    },
  ],
}

export const SPECIAL_DATES: SpecialDate[] = [
  {
    slug: { es: 'dia-del-hombre', en: 'mens-day' },
    imageAlt: {
      es: 'Hombre recibiendo un masaje de tejido profundo en la espalda en una cabina de spa privada',
      en: 'Man receiving a deep tissue back massage in a private spa room',
    },
    icon: 'person',
    name: { es: 'Día del Hombre', en: "Men's Day" },
    when: { es: '19 de noviembre', en: 'November 19' },
    rule: { kind: 'fixed', month: 11, day: 19 },
    tagline: {
      es: 'Masajes de recuperación y cuidado de piel pensados para él.',
      en: 'Recovery massages and skin care chosen with him in mind.',
    },
    intro: {
      es: 'Un regalo práctico y que sí se usa: una hora para soltar la tensión acumulada del trabajo, el gimnasio o el carro. Todos los planes son en cabina privada en El Poblado.',
      en: 'A practical gift that actually gets used: an hour to release the tension built up from work, the gym or the commute. Every plan is in a private room in El Poblado.',
    },
    giftTip: {
      es: 'Si carga tensión en la espalda, el Deep Tissue es la apuesta segura. Si nunca ha ido a un spa, el combo con limpieza de espalda es una buena primera vez; para sorprenderlo, el de 4 Manos.',
      en: 'If he carries tension in his back, deep tissue is the safe bet. If he has never been to a spa, the back-cleansing combo makes a good first visit; to really surprise him, four hands.',
    },
    plans: [
      {
        title: { es: 'Deep Tissue 60 min', en: 'Deep tissue, 60 min' },
        items: [{ serviceId: 'deep-tissue', minutes: 60 }],
        extras: ['craniofacial'],
        note: {
          es: 'Presión profunda para contracturas de espalda y hombros.',
          en: 'Firm pressure for back and shoulder knots.',
        },
      },
      deepBack,
      fourHands60,
    ],
    faqs: {
      es: [
        {
          question: '¿Qué regalar en el Día del Hombre en Medellín?',
          answer:
            'Un masaje de recuperación es de los regalos más útiles: el Deep Tissue para quien carga tensión en la espalda, o el combo con limpieza de espalda para quien quiere probar el spa por primera vez.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: "What to give for Men's Day in Medellín?",
          answer:
            'A recovery massage is one of the most useful gifts: deep tissue for someone who carries tension in the back, or the back-cleansing combo for a first spa visit.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'navidad', en: 'christmas' },
    imageAlt: {
      es: 'Cabina de spa decorada para Navidad con una caja de regalo sobre toallas blancas y velas encendidas',
      en: 'Spa room decorated for Christmas with a gift box on white towels and lit candles',
    },
    icon: 'star',
    name: { es: 'Navidad y fin de año', en: 'Christmas & New Year' },
    when: { es: 'Diciembre', en: 'December' },
    rule: { kind: 'fixed', month: 12, day: 24 },
    tagline: {
      es: 'El regalo de diciembre que no ocupa espacio: tiempo para descansar.',
      en: 'The December gift that takes up no space: time to rest.',
    },
    intro: {
      es: 'Diciembre es el mes más cargado del año. Regala una pausa de verdad, para usar en las vacaciones o para empezar enero con energía.',
      en: 'December is the busiest month of the year. Give a real pause, to use over the holidays or to start January with energy.',
    },
    giftTip: {
      es: 'Para el amigo secreto o un detalle de empresa, la Hidratación Facial es un regalo completo a buen precio. Para la pareja, el Duo.',
      en: 'For a Secret Santa or a company gift, the Facial Hydration is a complete gift at a good price. For your partner, the Duo.',
    },
    plans: [
      {
        title: { es: 'Hidratación Facial', en: 'Facial Hydration' },
        items: [{ serviceId: 'hidratacion-facial' }],
        note: {
          es: 'Devuelve a la piel la hidratación que se lleva el sol de las vacaciones.',
          en: 'Restores the moisture holiday sun takes out of the skin.',
        },
      },
      relaxFacial,
      duo60,
    ],
    faqs: {
      es: [
        {
          question: '¿Sirve como regalo de empresa o amigo secreto?',
          answer:
            'Sí. Si necesitas varios regalos, escríbenos por WhatsApp con la cantidad y te ayudamos a organizarlos.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'Does it work as a company or Secret Santa gift?',
          answer:
            'Yes. If you need several gifts, message us on WhatsApp with how many and we help you organise them.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'san-valentin', en: 'valentines-day' },
    imageAlt: {
      es: 'Cabina para parejas con dos camillas, pétalos de rosa, velas y dos copas de vino para San Valentín',
      en: 'Couples spa room with two massage tables, rose petals, candles and two glasses of wine for Valentine\'s Day',
    },
    icon: 'filter_vintage',
    name: { es: 'San Valentín', en: "Valentine's Day" },
    when: { es: '14 de febrero', en: 'February 14' },
    rule: { kind: 'fixed', month: 2, day: 14 },
    tagline: {
      es: 'Planes en pareja en la misma cabina privada.',
      en: 'Couples plans in the same private room.',
    },
    intro: {
      es: 'Muchos turistas y parejas en Medellín celebran el 14 de febrero. Vivan la experiencia juntos: el masaje Duo es en la misma cabina, cada uno con su terapeuta.',
      en: 'Many visitors and couples in Medellín celebrate February 14. Share the experience: the Duo massage is in the same room, each of you with your own therapist.',
    },
    giftTip: {
      es: 'Reserva con anticipación: las franjas de la tarde del 14 se llenan primero.',
      en: 'Book ahead: afternoon slots on the 14th fill up first.',
    },
    plans: [duo90, duo60, fourHands60],
    faqs: {
      es: [
        {
          question: '¿Podemos estar juntos en la misma cabina?',
          answer:
            'Sí, el masaje Duo es en la misma cabina privada, con una terapeuta para cada persona. Pueden elegir técnicas distintas.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'Can we be in the same room?',
          answer:
            'Yes, the Duo massage is in one private room, with a therapist for each of you. You can choose different techniques.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'dia-de-la-mujer', en: 'womens-day' },
    imageAlt: {
      es: 'Mujer relajada recibiendo un tratamiento facial hidratante en una cabina de spa',
      en: 'Relaxed woman receiving a hydrating facial treatment in a spa room',
    },
    icon: 'face_3',
    name: { es: 'Día de la Mujer', en: "Women's Day" },
    when: { es: '8 de marzo', en: 'March 8' },
    rule: { kind: 'fixed', month: 3, day: 8 },
    tagline: {
      es: 'Cuidado facial y corporal para celebrarla.',
      en: 'Face and body care to celebrate her.',
    },
    intro: {
      es: 'Un regalo que combina descanso y cuidado de la piel. Ideal para celebrarla a ella, o para ir juntas con una amiga.',
      en: 'A gift that combines rest and skin care. Ideal to celebrate her, or to go together with a friend.',
    },
    giftTip: {
      es: 'El combo de masaje + Hidrafacial es el más pedido. Si van dos amigas, el Duo les permite compartir la cabina.',
      en: 'Massage + HydraFacial is the most requested combo. If two friends go together, the Duo lets them share the room.',
    },
    plans: [relaxFacial, stones60, duo60],
    faqs: {
      es: [
        {
          question: '¿Qué regalar el Día de la Mujer en Medellín?',
          answer:
            'Un plan que combine masaje y facial, como masaje relajante + Hidrafacial, es un regalo completo: descanso y una piel visiblemente más luminosa el mismo día.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: "What to give for Women's Day in Medellín?",
          answer:
            'A plan that combines massage and facial, such as relaxing massage + HydraFacial, is a complete gift: rest and visibly brighter skin on the same day.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'dia-de-la-madre', en: 'mothers-day' },
    imageAlt: {
      es: 'Madre e hija en batas blancas compartiendo un té en la sala de descanso de un spa',
      en: 'Mother and daughter in white robes sharing tea in a spa lounge',
    },
    icon: 'self_care',
    name: { es: 'Día de la Madre', en: "Mother's Day" },
    when: { es: 'Segundo domingo de mayo', en: 'Second Sunday of May' },
    rule: { kind: 'nth-weekday', month: 5, weekday: 0, nth: 2 },
    tagline: {
      es: 'Tiempo para ella, o para compartirlo juntas.',
      en: 'Time for her, or to share together.',
    },
    intro: {
      es: 'Regálale lo que más le falta: tiempo para ella. Elige un plan individual o un Duo para compartir la cabina, madre e hija.',
      en: 'Give her what she is most short of: time for herself. Pick a solo plan, or a Duo to share the room, mother and daughter.',
    },
    giftTip: {
      es: 'Mayo es temporada alta: si quieres el fin de semana del Día de la Madre, reserva con dos semanas de anticipación.',
      en: "May is peak season: if you want Mother's Day weekend, book two weeks ahead.",
    },
    plans: [
      {
        title: { es: 'Relajante 90 min', en: 'Relaxing massage, 90 min' },
        items: [{ serviceId: 'relaxing', minutes: 90 }],
        extras: ['craniofacial', 'reflexology'],
        note: {
          es: 'Hora y media sin prisa, cuerpo completo.',
          en: 'An unhurried hour and a half, full body.',
        },
      },
      {
        title: { es: 'Masaje + Limpieza facial profunda', en: 'Massage + Deep facial cleansing' },
        items: [{ serviceId: 'relaxing', minutes: 60 }, { serviceId: 'limpieza-facial-profunda' }],
        extras: ['craniofacial', 'wine'],
        note: {
          es: 'Descanso para el cuerpo y una limpieza profesional para la piel.',
          en: 'Rest for the body and a professional cleanse for the skin.',
        },
      },
      duo60,
    ],
    faqs: {
      es: [
        {
          question: '¿Podemos ir mamá e hija juntas?',
          answer:
            'Sí, con el masaje Duo comparten la misma cabina privada, cada una con su propia terapeuta.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'Can mother and daughter go together?',
          answer:
            'Yes, with the Duo massage you share the same private room, each with your own therapist.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'dia-del-padre', en: 'fathers-day' },
    imageAlt: {
      es: 'Hombre recibiendo un masaje con piedras volcánicas calientes sobre la espalda',
      en: 'Man receiving a hot volcanic stone massage on his back',
    },
    icon: 'self_improvement',
    name: { es: 'Día del Padre', en: "Father's Day" },
    when: { es: 'Tercer domingo de junio', en: 'Third Sunday of June' },
    rule: { kind: 'nth-weekday', month: 6, weekday: 0, nth: 3 },
    tagline: {
      es: 'Un descanso real para papá, lejos de la corbata.',
      en: 'A real break for dad.',
    },
    intro: {
      es: 'Cambia la corbata de siempre por una hora de recuperación. Masajes enfocados en espalda, cuello y piernas.',
      en: 'Swap the usual tie for an hour of recovery. Massages focused on back, neck and legs.',
    },
    giftTip: {
      es: 'Si hace deporte, el Deportivo. Si su espalda sufre en la oficina, el Deep Tissue.',
      en: 'If he plays sports, the sports massage. If his back suffers at the office, deep tissue.',
    },
    plans: [
      {
        title: { es: 'Deportivo 60 min', en: 'Sports massage, 60 min' },
        items: [{ serviceId: 'sports', minutes: 60 }],
        extras: ['reflexology'],
        note: {
          es: 'Recuperación muscular para quien corre, monta bici o entrena.',
          en: 'Muscle recovery for runners, cyclists and gym-goers.',
        },
      },
      deepBack,
      stones60,
    ],
    faqs: {
      es: [
        {
          question: '¿Qué masaje regalar el Día del Padre?',
          answer:
            'Depende de su rutina: el Deportivo para quien entrena, el Deep Tissue para tensión de oficina y las Piedras Volcánicas si prefiere algo más relajante.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: "Which massage to give for Father's Day?",
          answer:
            'It depends on his routine: sports massage if he trains, deep tissue for office tension and volcanic stones if he prefers something more relaxing.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: { es: 'amor-y-amistad', en: 'love-and-friendship' },
    imageAlt: {
      es: 'Dos amigas en batas de spa brindando juntas para celebrar Amor y Amistad',
      en: 'Two friends in spa robes toasting together to celebrate Love and Friendship Day',
    },
    icon: 'local_cafe',
    name: { es: 'Amor y Amistad', en: 'Love & Friendship Day' },
    when: { es: 'Tercer sábado de septiembre', en: 'Third Saturday of September' },
    rule: { kind: 'nth-weekday', month: 9, weekday: 6, nth: 3 },
    tagline: {
      es: 'Planes para dos: pareja, amigos o amigo secreto.',
      en: 'Plans for two: partner, friends or Secret Friend.',
    },
    intro: {
      es: 'En Colombia septiembre es el mes del amor y la amistad. Celébralo con un plan para dos en la misma cabina, o como regalo de amigo secreto.',
      en: 'In Colombia, September is the month of love and friendship. Celebrate with a plan for two in the same room, or as a Secret Friend gift.',
    },
    giftTip: {
      es: 'Para amigo secreto funciona muy bien un plan individual de 60 minutos; para la pareja, el Duo.',
      en: 'For Secret Friend a 60-minute solo plan works well; for your partner, the Duo.',
    },
    plans: [duo60, duo90, stones60],
    faqs: {
      es: [
        {
          question: '¿Sirve como regalo de amigo secreto?',
          answer:
            'Sí. Un masaje individual de 60 minutos es un regalo completo; escríbenos por WhatsApp y lo dejamos con fecha abierta.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'Does it work as a Secret Friend gift?',
          answer:
            'Yes. A 60-minute solo massage is a complete gift; message us on WhatsApp and we leave the date open.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
]

export function getSpecialDate(slug: string, locale: Locale): SpecialDate | undefined {
  return SPECIAL_DATES.find(d => d.slug[locale] === slug)
}

export function planPrice(plan: SpecialDatePlan): number {
  return plan.price ?? plan.items.reduce((sum, i) => sum + (getServicePrice(i.serviceId, i.minutes ?? null) ?? 0), 0)
}

/** The Duo is one booking for two people; everything else is for one. */
export function planPersons(plan: SpecialDatePlan): 1 | 2 {
  return plan.items.some(i => i.serviceId === 'duo') ? 2 : 1
}

/** Total session minutes, or undefined when a service's length isn't known. */
export function planMinutes(plan: SpecialDatePlan): number | undefined {
  let total = 0
  for (const i of plan.items) {
    const min = i.minutes ?? FLAT_MINUTES[i.serviceId]
    if (min === undefined) return undefined
    total += min
  }
  return total
}

/** "Relajante 60 min" — one line per service in the plan. */
export function planServiceLabels(plan: SpecialDatePlan, locale: Locale): string[] {
  return plan.items.map(i => {
    const s = getServiceById(i.serviceId)
    const name = s ? serviceDisplayName(s, locale) : i.serviceId
    return i.minutes ? `${name} ${i.minutes} min` : name
  })
}

/** "Relajante 60 min + Hidrafacial" — what the plan actually contains. */
export function planItemsLabel(plan: SpecialDatePlan, locale: Locale): string {
  return planServiceLabels(plan, locale).join(' + ')
}

export function planExtraLabels(plan: SpecialDatePlan, locale: Locale): string[] {
  return [...BASE_EXTRAS, ...(plan.extras ?? [])].map(e => EXTRA_LABELS[e][locale])
}

/** /book deep link for the plan's first service. */
export function planBookHref(plan: SpecialDatePlan, locale: Locale): string {
  const first = plan.items[0]
  const duration = first.minutes ? `&duration=${first.minutes}` : ''
  return `/${locale}/book?service=${first.serviceId}${duration}`
}

function dateInYear(rule: DateRule, year: number): Date {
  if (rule.kind === 'fixed') return new Date(Date.UTC(year, rule.month - 1, rule.day))
  const first = new Date(Date.UTC(year, rule.month - 1, 1))
  const offset = (rule.weekday - first.getUTCDay() + 7) % 7
  return new Date(Date.UTC(year, rule.month - 1, 1 + offset + (rule.nth - 1) * 7))
}

/** Next time this date comes round, counting today as upcoming. */
export function nextOccurrence(d: SpecialDate, now: Date = new Date()): Date {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const thisYear = dateInYear(d.rule, now.getUTCFullYear())
  return thisYear.getTime() >= today ? thisYear : dateInYear(d.rule, now.getUTCFullYear() + 1)
}

/** Catalog sorted so the next date to come round is first. */
export function specialDatesByUpcoming(now: Date = new Date()): SpecialDate[] {
  return [...SPECIAL_DATES].sort((a, b) => nextOccurrence(a, now).getTime() - nextOccurrence(b, now).getTime())
}
