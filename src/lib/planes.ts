import type { Locale } from '@/lib/i18n'
import { getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'
import { BASE_EXTRAS, EXTRA_LABELS, FLAT_MINUTES, type PlanExtra, type PlanItem } from '@/lib/special-dates'

/**
 * Named spa plans (/es/planes, /en/planes): one plan per audience × occasion.
 *
 * Like the special-date plans, every plan is built from real SERVICES ids so
 * its price follows services.ts. Extras are only the ones the spa confirmed
 * (PlanExtra). Nothing here promises a service we don't sell.
 *
 * `price` overrides the catalogue sum once the spa sets a package price
 * (e.g. a discount on a bono). Until then the page shows the catalogue sum.
 */

type L = Record<Locale, string>

export type PlanAudience = 'el' | 'grupo' | 'pareja' | 'bono'

export type Plan = {
  /** Same slug in both locales: /es/planes/<slug> ↔ /en/planes/<slug>. */
  slug: string
  audience: PlanAudience
  icon: string
  /** The plan's own name, e.g. "Ritual del Caballero". */
  name: L
  /** The occasion and keyword, used in the H1 and <title>. */
  headline: L
  occasion: L
  tagline: L
  intro: L
  idealFor: L[]
  /** What one person gets (for a group plan: each guest). */
  items: PlanItem[]
  /** Group plans: what the guest of honour gets instead of `items`. */
  honoreeItems?: PlanItem[]
  honoreeLabel?: L
  /** Bonos: how many times `items` is included. */
  sessions?: number
  extras?: PlanExtra[]
  /** Group plans: minimum number of people. */
  minPeople?: number
  /** Fixed package price in COP for one person (or the pair, for a couples plan). */
  price?: number
  faqs: Record<Locale, { question: string; answer: string }[]>
}

const AUDIENCES: Record<PlanAudience, { title: L; intro: L }> = {
  el: {
    title: { es: 'Para él', en: 'For him' },
    intro: {
      es: 'Rituales individuales pensados para hombres: recuperación, espalda y piel.',
      en: 'Individual rituals designed for men: recovery, back and skin.',
    },
  },
  grupo: {
    title: { es: 'En grupo', en: 'For groups' },
    intro: {
      es: 'Despedidas, cumpleaños y planes con amigos. Organizamos los turnos según las cabinas disponibles.',
      en: 'Bachelor parties, birthdays and plans with friends. We schedule the sessions around the rooms available.',
    },
  },
  pareja: {
    title: { es: 'En pareja', en: 'For couples' },
    intro: {
      es: 'Dos personas en la misma cabina privada, cada una con su terapeuta.',
      en: 'Two people in the same private room, each with their own therapist.',
    },
  },
  bono: {
    title: { es: 'Bonos de sesiones', en: 'Session bundles' },
    intro: {
      es: 'Varias sesiones del mismo masaje para mantener el cuerpo al día.',
      en: 'Several sessions of the same massage to keep your body in shape.',
    },
  },
}

export const PLAN_AUDIENCE_ORDER: PlanAudience[] = ['el', 'grupo', 'pareja', 'bono']

export function planAudience(a: PlanAudience) {
  return AUDIENCES[a]
}

const groupFaqs: Record<Locale, { question: string; answer: string }[]> = {
  es: [
    {
      question: '¿Cuántas personas pueden venir?',
      answer:
        'El plan es para grupos desde 3 personas. Según el tamaño del grupo organizamos los turnos en nuestras cabinas privadas; escríbenos por WhatsApp con la fecha y el número de personas y te armamos la propuesta.',
    },
    {
      question: '¿Cada persona puede elegir otro masaje?',
      answer:
        'Sí. El precio del plan es con el masaje indicado; si alguien prefiere otro, se ajusta al valor de ese masaje en nuestra carta.',
    },
  ],
  en: [
    {
      question: 'How many people can come?',
      answer:
        'The plan is for groups of 3 or more. Depending on the group size we schedule the sessions across our private rooms; message us on WhatsApp with the date and the number of people and we send you a proposal.',
    },
    {
      question: 'Can each person choose a different massage?',
      answer:
        'Yes. The plan price is for the massage listed; if someone prefers another one, it is adjusted to that massage’s price on our menu.',
    },
  ],
}

const sharedFaqs: Record<Locale, { question: string; answer: string }[]> = {
  es: [
    {
      question: '¿Dónde queda Diamond Spa?',
      answer:
        'En El Poblado, Medellín (Carrera 43C, cerca de la Calle 10), a 10 minutos caminando del Parque Lleras. Todas las sesiones son en cabina privada.',
    },
    {
      question: '¿Puedo regalar este plan?',
      answer:
        'Sí. Escríbenos por WhatsApp, pagas el plan y te enviamos la confirmación para entregarla; la persona agenda después según disponibilidad.',
    },
  ],
  en: [
    {
      question: 'Where is Diamond Spa?',
      answer:
        'In El Poblado, Medellín (Carrera 43C, near Calle 10), a 10-minute walk from Parque Lleras. Every session is in a private room.',
    },
    {
      question: 'Can I give this plan as a gift?',
      answer:
        'Yes. Message us on WhatsApp, pay for the plan and we send you a confirmation to hand over; the recipient books later, subject to availability.',
    },
  ],
}

export const PLANS: Plan[] = [
  // ── Para él ────────────────────────────────────────────────────────────────
  {
    slug: 'ritual-del-caballero',
    audience: 'el',
    icon: 'spa',
    name: { es: 'Ritual del Caballero', en: 'The Gentleman’s Ritual' },
    headline: { es: 'Ritual del Caballero: masaje y facial para hombres en Medellín', en: 'The Gentleman’s Ritual: massage and facial for men in Medellín' },
    occasion: { es: 'Para él · masaje + facial', en: 'For him · massage + facial' },
    tagline: {
      es: 'Deep Tissue para la espalda y limpieza facial profunda, en una sola visita.',
      en: 'Deep tissue for the back and a deep facial cleanse, in one visit.',
    },
    intro: {
      es: 'Dos horas para soltar la tensión de cuello y espalda y dejar la piel limpia. Es el plan para el hombre que llega al spa por primera vez o que quiere un mantenimiento completo, en cabina privada en El Poblado.',
      en: 'Two hours to release neck and back tension and leave your skin clean. The plan for a man’s first spa visit, or for a complete tune-up, in a private room in El Poblado.',
    },
    idealFor: [
      { es: 'Primera vez en un spa', en: 'A first spa visit' },
      { es: 'Tensión en cuello y espalda', en: 'Neck and back tension' },
      { es: 'Regalo para él', en: 'A gift for him' },
    ],
    items: [{ serviceId: 'deep-tissue', minutes: 60 }, { serviceId: 'limpieza-facial-profunda' }],
    extras: ['craniofacial', 'reflexology'],
    faqs: {
      es: [
        {
          question: '¿Qué incluye el Ritual del Caballero?',
          answer:
            'Un masaje Deep Tissue de 60 minutos y una limpieza facial profunda, además de bebida de bienvenida, aromaterapia, musicoterapia, masaje cráneo facial y reflexología.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'What does the Gentleman’s Ritual include?',
          answer:
            'A 60-minute deep tissue massage and a deep facial cleanse, plus a welcome drink, aromatherapy, music therapy, a craniofacial massage and reflexology.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: 'recuperacion-deportiva',
    audience: 'el',
    icon: 'self_improvement',
    name: { es: 'Recuperación Deportiva', en: 'Sports Recovery' },
    headline: { es: 'Recuperación Deportiva: masaje después de entrenar en Medellín', en: 'Sports Recovery: post-workout massage in Medellín' },
    occasion: { es: 'Para él · después de entrenar', en: 'For him · after training' },
    tagline: {
      es: '90 minutos de masaje deportivo con percusión y estiramientos asistidos.',
      en: '90 minutes of sports massage with percussion and assisted stretching.',
    },
    intro: {
      es: 'Para después de un partido, una carrera, el gimnasio o una ruta en bici. Combinamos terapia manual fuerte, pistola de percusión y estiramientos asistidos para soltar la fatiga y ayudar a prevenir lesiones.',
      en: 'For after a match, a race, the gym or a bike ride. We combine firm manual therapy, a percussion gun and assisted stretching to release fatigue and help prevent injuries.',
    },
    idealFor: [
      { es: 'Fútbol, running y ciclismo', en: 'Football, running and cycling' },
      { es: 'Piernas cargadas', en: 'Heavy, tired legs' },
      { es: 'Mantenimiento muscular', en: 'Muscle maintenance' },
    ],
    items: [{ serviceId: 'sports', minutes: 90 }],
    extras: ['reflexology'],
    faqs: {
      es: [
        {
          question: '¿Cuándo es mejor hacerse el masaje deportivo?',
          answer:
            'Entre 24 y 48 horas después de un esfuerzo fuerte, o como mantenimiento semanal si entrenas seguido. Cuéntanos al reservar qué deporte haces y en qué zona sientes la carga.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'When is the best time for a sports massage?',
          answer:
            '24 to 48 hours after a hard effort, or as weekly maintenance if you train often. Tell us when you book which sport you do and where you feel the load.',
        },
        ...sharedFaqs.en,
      ],
    },
  },

  // ── En grupo ───────────────────────────────────────────────────────────────
  {
    slug: 'despedida-de-soltero',
    audience: 'grupo',
    icon: 'star',
    name: { es: 'Despedida de Soltero', en: 'Bachelor Party' },
    headline: { es: 'Despedida de Soltero en spa: plan para grupos en Medellín', en: 'Spa bachelor party: group plan in Medellín' },
    occasion: { es: 'En grupo · despedida', en: 'Group · bachelor party' },
    tagline: {
      es: 'Masaje relajante para el grupo y masaje a 4 manos para el novio.',
      en: 'A relaxing massage for the group and a four-hands massage for the groom.',
    },
    intro: {
      es: 'Un plan distinto para despedir al novio: masaje para todo el grupo en cabinas privadas en El Poblado, y una experiencia a 4 manos para él. Organizamos los turnos para que el grupo llegue junto y salga renovado.',
      en: 'A different way to send off the groom: a massage for the whole group in private rooms in El Poblado, and a four-hands experience for him. We schedule the sessions so the group arrives together and leaves renewed.',
    },
    idealFor: [
      { es: 'Despedida de soltero', en: 'Bachelor parties' },
      { es: 'Grupos desde 3 personas', en: 'Groups of 3 or more' },
      { es: 'Antes de la boda', en: 'The days before the wedding' },
    ],
    items: [{ serviceId: 'relaxing', minutes: 60 }],
    honoreeItems: [{ serviceId: 'four-hands', minutes: 60 }],
    honoreeLabel: { es: 'El novio', en: 'The groom' },
    minPeople: 3,
    extras: ['wine'],
    faqs: {
      es: [
        {
          question: '¿Cómo se organiza una despedida de soltero en Diamond Spa?',
          answer:
            'Escríbenos por WhatsApp con la fecha y el número de personas. Cada invitado recibe un masaje relajante de 60 minutos y el novio un masaje a 4 manos de 60 minutos; organizamos los turnos según las cabinas disponibles.',
        },
        ...groupFaqs.es,
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'How is a bachelor party organised at Diamond Spa?',
          answer:
            'Message us on WhatsApp with the date and the number of people. Each guest gets a 60-minute relaxing massage and the groom a 60-minute four-hands massage; we schedule the sessions around the rooms available.',
        },
        ...groupFaqs.en,
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: 'tercer-tiempo',
    audience: 'grupo',
    icon: 'local_fire_department',
    name: { es: 'Tercer Tiempo', en: 'Third Half' },
    headline: { es: 'Tercer Tiempo: spa para amigos en Medellín', en: 'Third Half: spa for friends in Medellín' },
    occasion: { es: 'En grupo · amigos', en: 'Group · friends' },
    tagline: {
      es: 'Masaje deportivo de 60 minutos para el parche, después del partido o la ruta.',
      en: 'A 60-minute sports massage for the crew, after the match or the ride.',
    },
    intro: {
      es: 'El plan para el grupo de amigos que juega fútbol, corre o sale a rodar: cada uno recibe un masaje deportivo en cabina privada, y nos encargamos de los turnos para que vengan juntos.',
      en: 'The plan for the group of friends who play football, run or ride: each one gets a sports massage in a private room, and we take care of the schedule so you come together.',
    },
    idealFor: [
      { es: 'Equipos y grupos de amigos', en: 'Teams and groups of friends' },
      { es: 'Después del partido', en: 'After the match' },
      { es: 'Viajes de amigos a Medellín', en: 'Friends’ trips to Medellín' },
    ],
    items: [{ serviceId: 'sports', minutes: 60 }],
    minPeople: 3,
    faqs: {
      es: [
        {
          question: '¿Qué incluye el plan Tercer Tiempo?',
          answer:
            'Un masaje deportivo de 60 minutos por persona, con terapia manual fuerte, pistola de percusión y estiramientos asistidos, más bebida de bienvenida, aromaterapia y musicoterapia.',
        },
        ...groupFaqs.es,
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'What does the Third Half plan include?',
          answer:
            'A 60-minute sports massage per person, with firm manual therapy, a percussion gun and assisted stretching, plus a welcome drink, aromatherapy and music therapy.',
        },
        ...groupFaqs.en,
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: 'cumpleanos',
    audience: 'grupo',
    icon: 'event',
    name: { es: 'Cumpleaños Diamond', en: 'Diamond Birthday' },
    headline: { es: 'Cumpleaños en spa: plan para celebrar en Medellín', en: 'Spa birthday: a plan to celebrate in Medellín' },
    occasion: { es: 'En grupo · cumpleaños', en: 'Group · birthday' },
    tagline: {
      es: 'Masaje relajante para los invitados y piedras volcánicas para el cumpleañero.',
      en: 'A relaxing massage for the guests and volcanic stones for the birthday person.',
    },
    intro: {
      es: 'Celebra con tus amigos en cabinas privadas en El Poblado: cada invitado recibe un masaje relajante y el cumpleañero un masaje con piedras volcánicas, con copa de vino para brindar.',
      en: 'Celebrate with your friends in private rooms in El Poblado: each guest gets a relaxing massage and the birthday person a volcanic stone massage, with a glass of wine to toast.',
    },
    idealFor: [
      { es: 'Cumpleaños con amigos', en: 'Birthdays with friends' },
      { es: 'Grupos desde 3 personas', en: 'Groups of 3 or more' },
      { es: 'Celebraciones tranquilas', en: 'Low-key celebrations' },
    ],
    items: [{ serviceId: 'relaxing', minutes: 60 }],
    honoreeItems: [{ serviceId: 'hot-stones', minutes: 60 }],
    honoreeLabel: { es: 'El cumpleañero', en: 'The birthday person' },
    minPeople: 3,
    extras: ['wine'],
    faqs: {
      es: [
        {
          question: '¿Cómo reservo un cumpleaños en el spa?',
          answer:
            'Escríbenos por WhatsApp con la fecha y el número de invitados. Cada uno recibe un masaje relajante de 60 minutos y el cumpleañero un masaje con piedras volcánicas de 60 minutos.',
        },
        ...groupFaqs.es,
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'How do I book a birthday at the spa?',
          answer:
            'Message us on WhatsApp with the date and the number of guests. Each guest gets a 60-minute relaxing massage and the birthday person a 60-minute volcanic stone massage.',
        },
        ...groupFaqs.en,
        ...sharedFaqs.en,
      ],
    },
  },

  // ── En pareja ──────────────────────────────────────────────────────────────
  {
    slug: 'escape-en-pareja',
    audience: 'pareja',
    icon: 'self_care',
    name: { es: 'Escape en Pareja', en: 'Couples Escape' },
    headline: { es: 'Escape en Pareja: spa para parejas en Medellín', en: 'Couples Escape: spa for couples in Medellín' },
    occasion: { es: 'En pareja · aniversario o cita', en: 'Couples · anniversary or date' },
    tagline: {
      es: 'Masaje Duo de 90 minutos en la misma cabina, con copa de vino.',
      en: 'A 90-minute Duo massage in the same room, with a glass of wine.',
    },
    intro: {
      es: 'Un día de spa en pareja en El Poblado: noventa minutos para desconectarse juntos, los dos en la misma cabina privada, cada uno con su terapeuta, con masaje cráneo facial, reflexología y una copa de vino. Para un aniversario, una cita o simplemente porque sí.',
      en: 'Ninety minutes to switch off together: both of you in the same private room, each with your own therapist, with a craniofacial massage, reflexology and a glass of wine. For an anniversary, a date or just because.',
    },
    idealFor: [
      { es: 'Aniversarios', en: 'Anniversaries' },
      { es: 'Una cita distinta', en: 'A different kind of date' },
      { es: 'Parejas de viaje en Medellín', en: 'Couples travelling in Medellín' },
    ],
    items: [{ serviceId: 'duo', minutes: 90 }],
    extras: ['craniofacial', 'reflexology', 'wine'],
    faqs: {
      es: [
        {
          question: '¿El precio es por persona o por pareja?',
          answer: 'Por pareja: el masaje Duo es una sola reserva para dos personas, cada una con su terapeuta.',
        },
        {
          question: '¿Cómo es un día de spa en pareja en Diamond Spa?',
          answer:
            'Llegan juntos, reciben la bebida de bienvenida y pasan a la misma cabina privada, cada uno con su terapeuta. Si buscan algo más corto, el plan Pausa en Pareja es la versión de 60 minutos.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'Is the price per person or per couple?',
          answer: 'Per couple: the Duo massage is one booking for two people, each with their own therapist.',
        },
        ...sharedFaqs.en,
      ],
    },
  },

  {
    slug: 'pausa-en-pareja',
    audience: 'pareja',
    icon: 'self_care',
    name: { es: 'Pausa en Pareja', en: 'Couples Pause' },
    headline: { es: 'Pausa en Pareja: spa para parejas a buen precio en Medellín', en: 'Couples Pause: an affordable couples spa in Medellín' },
    occasion: { es: 'En pareja · 60 minutos', en: 'Couples · 60 minutes' },
    tagline: {
      es: 'Masaje Duo de 60 minutos en la misma cabina, con copa de vino. La opción más económica para dos.',
      en: 'A 60-minute Duo massage in the same room, with a glass of wine. The most affordable option for two.',
    },
    intro: {
      es: 'El plan de spa para parejas más económico de Diamond Spa: una hora de masaje Duo, los dos en la misma cabina privada en El Poblado, cada uno con su terapeuta, con aromaterapia, musicoterapia y una copa de vino.',
      en: 'Diamond Spa’s most affordable couples plan: one hour of Duo massage, both of you in the same private room in El Poblado, each with your own therapist, with aromatherapy, music therapy and a glass of wine.',
    },
    idealFor: [
      { es: 'Una cita entre semana', en: 'A weekday date' },
      { es: 'Primera vez en pareja', en: 'A first couples visit' },
      { es: 'Presupuesto ajustado', en: 'A tighter budget' },
    ],
    items: [{ serviceId: 'duo', minutes: 60 }],
    extras: ['wine'],
    faqs: {
      es: [
        {
          question: '¿Cuál es el plan de spa para parejas más económico?',
          answer: 'Pausa en Pareja: un masaje Duo de 60 minutos para dos personas, con copa de vino. El precio es por pareja.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'What is the most affordable couples plan?',
          answer: 'Couples Pause: a 60-minute Duo massage for two, with a glass of wine. The price is per couple.',
        },
        ...sharedFaqs.en,
      ],
    },
  },

  // ── Bonos ──────────────────────────────────────────────────────────────────
  {
    slug: 'bono-4-relajantes',
    audience: 'bono',
    icon: 'calendar_month',
    name: { es: 'Bono Mensual Relax', en: 'Monthly Relax Bundle' },
    headline: { es: 'Bono de 4 masajes relajantes en Medellín', en: 'Bundle of 4 relaxing massages in Medellín' },
    occasion: { es: 'Bono · 4 sesiones', en: 'Bundle · 4 sessions' },
    tagline: {
      es: 'Cuatro masajes relajantes de 60 minutos: uno por semana durante un mes.',
      en: 'Four 60-minute relaxing massages: one a week for a month.',
    },
    intro: {
      es: 'Para quien quiere convertir el masaje en hábito: cuatro sesiones de masaje relajante de 60 minutos para usar a tu ritmo, idealmente una por semana.',
      en: 'For anyone who wants to make massage a habit: four 60-minute relaxing massages to use at your own pace, ideally one a week.',
    },
    idealFor: [
      { es: 'Estrés del trabajo', en: 'Work stress' },
      { es: 'Dormir mejor', en: 'Sleeping better' },
      { es: 'Constancia', en: 'Building a routine' },
    ],
    items: [{ serviceId: 'relaxing', minutes: 60 }],
    sessions: 4,
    faqs: {
      es: [
        {
          question: '¿Cuánto tiempo tengo para usar las sesiones?',
          answer: 'Te confirmamos la vigencia del bono por WhatsApp al momento de comprarlo.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'How long do I have to use the sessions?',
          answer: 'We confirm how long the bundle is valid on WhatsApp when you buy it.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
  {
    slug: 'bono-5-deep-tissue',
    audience: 'bono',
    icon: 'calendar_month',
    name: { es: 'Bono Espalda Libre', en: 'Free Back Bundle' },
    headline: { es: 'Bono de 5 masajes Deep Tissue en Medellín', en: 'Bundle of 5 deep tissue massages in Medellín' },
    occasion: { es: 'Bono · 5 sesiones', en: 'Bundle · 5 sessions' },
    tagline: {
      es: 'Cinco sesiones de Deep Tissue de 60 minutos para contracturas que vuelven.',
      en: 'Five 60-minute deep tissue sessions for knots that keep coming back.',
    },
    intro: {
      es: 'Las contracturas crónicas de cuello y espalda no se van en una sola sesión. Este bono reúne cinco masajes Deep Tissue de 60 minutos para trabajar la zona con constancia.',
      en: 'Chronic neck and back knots don’t go away in one session. This bundle brings together five 60-minute deep tissue massages to work the area consistently.',
    },
    idealFor: [
      { es: 'Contracturas crónicas', en: 'Chronic knots' },
      { es: 'Trabajo de escritorio', en: 'Desk work' },
      { es: 'Postura', en: 'Posture' },
    ],
    items: [{ serviceId: 'deep-tissue', minutes: 60 }],
    sessions: 5,
    faqs: {
      es: [
        {
          question: '¿Cada cuánto debo hacer las sesiones?',
          answer:
            'Para contracturas crónicas suele recomendarse una sesión por semana. Te ayudamos a agendarlas por WhatsApp; la vigencia del bono te la confirmamos al comprarlo.',
        },
        ...sharedFaqs.es,
      ],
      en: [
        {
          question: 'How often should I come?',
          answer:
            'For chronic knots, one session a week is usually recommended. We help you schedule them on WhatsApp and confirm how long the bundle is valid when you buy it.',
        },
        ...sharedFaqs.en,
      ],
    },
  },
]

export function getPlan(slug: string): Plan | undefined {
  return PLANS.find(p => p.slug === slug)
}

export function plansByAudience(a: PlanAudience): Plan[] {
  return PLANS.filter(p => p.audience === a)
}

function itemsPrice(items: PlanItem[]): number {
  return items.reduce((sum, i) => sum + (getServicePrice(i.serviceId, i.minutes ?? null) ?? 0), 0)
}

/** Price for one person (a guest, in a group plan), the pair (couples) or the whole bundle. */
export function planPrice(p: Plan): number {
  return p.price ?? itemsPrice(p.items) * (p.sessions ?? 1)
}

/** Group plans: what the guest of honour's session costs. */
export function planHonoreePrice(p: Plan): number | undefined {
  return p.honoreeItems ? itemsPrice(p.honoreeItems) : undefined
}

/** Minutes of one visit, or undefined when a service's length isn't known. */
export function planMinutes(p: Plan, items: PlanItem[] = p.items): number | undefined {
  let total = 0
  for (const i of items) {
    const min = i.minutes ?? FLAT_MINUTES[i.serviceId]
    if (min === undefined) return undefined
    total += min
  }
  return total
}

export function planPersons(p: Plan): string | undefined {
  if (p.audience === 'pareja') return '2'
  if (p.minPeople) return `${p.minPeople}+`
  return '1'
}

export function itemLabels(items: PlanItem[], locale: Locale): string[] {
  return items.map(i => {
    const s = getServiceById(i.serviceId)
    const name = s ? serviceDisplayName(s, locale) : i.serviceId
    return i.minutes ? `${name} ${i.minutes} min` : name
  })
}

export function planExtraLabels(p: Plan, locale: Locale): string[] {
  return [...BASE_EXTRAS, ...(p.extras ?? [])].map(e => EXTRA_LABELS[e][locale])
}

/** Individual plans book online; groups and bundles are arranged on WhatsApp. */
export function planBooksOnline(p: Plan): boolean {
  return (p.audience === 'el' || p.audience === 'pareja') && p.items.length === 1
}

export function planBookHref(p: Plan, locale: Locale): string {
  const first = p.items[0]
  const duration = first.minutes ? `&duration=${first.minutes}` : ''
  return `/${locale}/book?service=${first.serviceId}${duration}`
}

export const PLANES_PATH = '/planes'

export function planPath(p: Plan): string {
  return `${PLANES_PATH}/${p.slug}`
}
