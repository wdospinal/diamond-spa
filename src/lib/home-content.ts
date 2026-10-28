/**
 * Copy and link data for the home page (/es and /en).
 *
 * Everything that states a number (rating, review count, prices, hours,
 * address) is interpolated from `./spa`, `./services` or the live Google
 * Places rating, so the page can never drift from the rest of the site.
 *
 * SEO scope: the home owns "spa medellín" + the brand "Diamond Spa". Every
 * other keyword appears only as a secondary mention and as the anchor text of a
 * link to the page that owns it (see HOME_HUB) — it does not try to rank for
 * them itself.
 */

import type { Locale } from './i18n'
import {
  SPA_ADDRESS,
  SPA_DIRECTIONS,
  SPA_HOURS,
  SPA_PHONES,
} from './spa'
import {
  formatCop,
  getFacialServices,
  getHairRemovalServices,
  getMassageServices,
  getServiceById,
  getServicePrice,
  serviceDisplayName,
} from './services'
import { serviceHref } from './routes'
import { specialDatesPath } from './special-dates'
import { LANDING_SERVICE_VIDEOS } from './landing-service-videos'

export type HomeLink = { href: string; label: string }

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

function minOf(values: Array<number | undefined>): number | undefined {
  const nums = values.filter(isNum)
  return nums.length ? Math.min(...nums) : undefined
}

/** Display a rating with the locale's decimal separator (4.9 → 4,9 in Spanish). */
export function formatRating(value: string, locale: Locale): string {
  return locale === 'es' ? value.replace('.', ',') : value
}

/** "24 de septiembre de 2026" / "September 24, 2026" from an ISO date. */
export function formatLongDate(iso: string, locale: Locale): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

/** Massage types in the order they are listed on the site. */
const MASSAGE_ORDER = [
  'relaxing',
  'deep-tissue',
  'sports',
  'hot-stones',
  'four-hands',
  'duo',
  'sensitive',
] as const

/** Videos shown on the home, in order. All of them are real footage from the paid landing. */
const VIDEO_ORDER = ['relaxing', 'deep-tissue', 'sports', 'sensitive'] as const

export function getHomeContent(locale: Locale, rating: { value: string; count: number }) {
  const es = locale === 'es'
  const r = formatRating(rating.value, locale)
  const money = (n: number) => (es ? formatCop(n) : `$${n.toLocaleString('en-US')} COP`)

  // ─── Prices (always computed, never typed by hand) ────────────────────────
  const massageFrom =
    minOf(getMassageServices().map(s => getServicePrice(s.id, 30))) ?? 120000
  const facialFrom =
    minOf(getFacialServices().map(s => getServicePrice(s.id, null))) ?? 0
  const hairFrom = minOf(
    getHairRemovalServices().flatMap(s => [
      getServicePrice(s.id, null, 'wax'),
      getServicePrice(s.id, null, 'machine'),
    ]),
  )
  const relax60 = getServicePrice('relaxing', 60)

  const weekdays = SPA_HOURS[0]
  const sunday = SPA_HOURS[1]
  const phone = SPA_PHONES[1]

  // ─── Metadata ─────────────────────────────────────────────────────────────
  const meta = es
    ? {
        title: `Spa en Medellín | Diamond Spa en El Poblado ⭐ ${r}`,
        description: `Diamond Spa: spa en El Poblado, Medellín. Masajes, hidrafacial, limpieza facial y depilación en cabinas privadas. ⭐ ${r} · ${rating.count} reseñas. Desde ${money(massageFrom)}.`,
        imageAlt: 'Cabina privada de Diamond Spa en El Poblado, Medellín',
      }
    : {
        title: `Spa in Medellín | Diamond Spa in El Poblado ⭐ ${r}`,
        description: `Diamond Spa: spa in El Poblado, Medellín. Massages, hydrafacial, facials & waxing in private rooms. ⭐ ${r} · ${rating.count} reviews. From ${money(massageFrom)}.`,
        imageAlt: 'Private treatment room at Diamond Spa in El Poblado, Medellín',
      }

  // ─── Hero ─────────────────────────────────────────────────────────────────
  const hero = es
    ? {
        tagline: 'Spa en El Poblado',
        h1: ['Spa en Medellín', 'Diamond Spa, El Poblado.'] as const,
        body: `Diamond Spa es un spa boutique en El Poblado, Medellín: masajes, hidrafacial, limpiezas faciales y depilación en cabinas privadas, con especialistas certificadas y una calificación de ${r} sobre 5 en Google.`,
        imageAlt:
          'Cabina privada de Diamond Spa en El Poblado, Medellín, con camilla, velas y luz cálida',
      }
    : {
        tagline: 'Spa in El Poblado',
        h1: ['Spa in Medellín', 'Diamond Spa, El Poblado.'] as const,
        body: `Diamond Spa is a boutique spa in El Poblado, Medellín: massages, hydrafacial, facial cleansing and waxing in private rooms, with certified specialists and a ${r} out of 5 rating on Google.`,
        imageAlt:
          'Private treatment room at Diamond Spa in El Poblado, Medellín, with a massage table, candles and warm light',
      }

  // ─── Facts strip ──────────────────────────────────────────────────────────
  const facts = es
    ? [
        { value: `${r} ★`, label: 'Calificación en Google Maps' },
        { value: String(rating.count), label: 'Reseñas de clientes en Google' },
        { value: '10:00–22:00', label: 'Lunes a sábado · domingos 10:00–19:00' },
        { value: 'Certificadas', label: 'Especialistas en masaje y cosmetología, en cabinas privadas' },
      ]
    : [
        { value: `${r} ★`, label: 'Rating on Google Maps' },
        { value: String(rating.count), label: 'Customer reviews on Google' },
        { value: '10am–10pm', label: 'Monday to Saturday · Sundays 10am–7pm' },
        { value: 'Certified', label: 'Massage and cosmetology specialists, in private rooms' },
      ]

  // ─── Services ─────────────────────────────────────────────────────────────
  const massageChips: HomeLink[] = MASSAGE_ORDER.flatMap(id => {
    const svc = getServiceById(id)
    return svc ? [{ href: serviceHref(svc, locale), label: serviceDisplayName(svc, locale) }] : []
  })

  const services = {
    label: es ? 'Servicios' : 'Services',
    title: es
      ? 'Masajes, faciales y depilación en nuestro spa de El Poblado'
      : 'Massages, facials and hair removal at our El Poblado spa',
    intro: es
      ? 'Tres líneas de servicio con el mismo estándar: cabina privada, productos profesionales y especialistas certificadas. Todos los precios están publicados.'
      : 'Three service lines, one standard: private room, professional-grade products and certified specialists. Every price is published.',
    fromLabel: es ? 'Desde' : 'From',
    seeAll: es ? 'Ver todos los servicios y precios' : 'See all services and prices',
    seeAllHref: `/${locale}/services`,
    cards: [
      {
        icon: 'spa',
        title: es ? 'Masajes en Medellín' : 'Massages in Medellín',
        desc: es
          ? 'Relajante, descontracturante, deportivo, con piedras volcánicas, a cuatro manos, en pareja y sensitivo. Sesiones de 30, 60 o 90 minutos en cabina privada.'
          : 'Relaxing, deep tissue, sports, hot stone, four-hands, couples and sensitive massage. 30, 60 or 90-minute sessions in a private room.',
        price: money(massageFrom),
        href: es ? '/es/masajes' : '/en/massage-medellin',
        cta: es ? 'Ver todos los masajes' : 'See all massages',
        chips: massageChips,
      },
      {
        icon: 'water_drop',
        title: es ? 'Hidrafacial y limpieza facial' : 'Hydrafacial and facial cleansing',
        desc: es
          ? 'Hidrafacial, limpieza facial profunda y básica, hidratación facial y limpieza de espalda con fórmulas de grado profesional.'
          : 'Hydrafacial, deep and basic facial cleansing, facial hydration and back cleansing with professional-grade formulas.',
        price: facialFrom ? money(facialFrom) : undefined,
        href: `/${locale}/hydrafacial-medellin`,
        cta: es ? 'Ver hidrafacial' : 'See hydrafacial',
        chips: [
          { href: `/${locale}/hydrafacial-medellin`, label: es ? 'Hidrafacial en Medellín' : 'Hydrafacial in Medellín' },
          { href: `/${locale}/limpieza-facial-medellin`, label: es ? 'Limpieza facial en Medellín' : 'Facial cleansing in Medellín' },
        ],
      },
      {
        icon: 'electric_bolt',
        title: es ? 'Depilación profesional' : 'Professional hair removal',
        desc: es
          ? 'Depilación con cera y con máquina para hombres y mujeres, desde axilas hasta cuerpo completo, en cabina privada.'
          : 'Wax and machine hair removal for men and women, from underarms to full body, in a private room.',
        price: hairFrom ? money(hairFrom) : undefined,
        href: `/${locale}/depilacion-medellin`,
        cta: es ? 'Ver depilación' : 'See hair removal',
        chips: [
          { href: `/${locale}/depilacion-hombres`, label: es ? 'Depilación para hombres' : 'Hair removal for men' },
          { href: `/${locale}/depilacion-mujeres`, label: es ? 'Depilación para mujeres' : 'Hair removal for women' },
        ],
      },
    ],
  }

  // ─── Videos ───────────────────────────────────────────────────────────────
  const videos = {
    label: es ? 'Videos reales' : 'Real footage',
    title: es ? 'Así se vive un masaje en Diamond Spa' : 'What a massage at Diamond Spa looks like',
    intro: es
      ? 'Grabaciones reales hechas en nuestras cabinas de El Poblado. Toca un video para reproducirlo.'
      : 'Real footage recorded in our El Poblado rooms. Tap a video to play it.',
    play: es ? 'Reproducir video' : 'Play video',
    pause: es ? 'Pausar video' : 'Pause video',
    viewMassage: es ? 'Ver este masaje' : 'See this massage',
    items: VIDEO_ORDER.flatMap(id => {
      const svc = getServiceById(id)
      const media = LANDING_SERVICE_VIDEOS[id]
      if (!svc || !media) return []
      const price = getServicePrice(id, 60)
      const name = serviceDisplayName(svc, locale)
      return [
        {
          id,
          name,
          video: media.video,
          poster: media.poster,
          href: serviceHref(svc, locale),
          meta: price ? `60 min · ${money(price)}` : '',
          posterAlt: es
            ? `Fotograma del video del ${name.toLowerCase()} en Diamond Spa`
            : `Still from the ${name.toLowerCase()} video at Diamond Spa`,
        },
      ]
    }),
  }

  // ─── Facilities ───────────────────────────────────────────────────────────
  const facilities = {
    label: es ? 'Instalaciones' : 'Facilities',
    title: es ? 'Cabinas privadas en El Poblado' : 'Private rooms in El Poblado',
    subtitle: es
      ? 'Fotos reales de nuestras salas: luz cálida, camillas profesionales y una suite para dos.'
      : 'Real photos of our rooms: warm light, professional massage tables and a suite for two.',
    images: [
      {
        src: '/home/instalaciones-bienvenida.webp',
        title: { es: 'Sala de bienvenida', en: 'Welcome lounge' },
        alt: {
          es: 'Sala de bienvenida de Diamond Spa con pantalla de chimenea, velas y sillones',
          en: 'Diamond Spa welcome lounge with a fireplace screen, candles and armchairs',
        },
      },
      {
        src: '/home/instalaciones-suite-pareja.webp',
        title: { es: 'Suite para dos', en: 'Suite for two' },
        alt: {
          es: 'Suite para dos de Diamond Spa con dos camillas de masaje y luz cálida',
          en: 'Diamond Spa suite for two with two massage tables and warm light',
        },
      },
      {
        src: '/home/instalaciones-sala-zen.webp',
        title: { es: 'Sala Zen', en: 'Zen room' },
        alt: {
          es: 'Cabina Sala Zen de Diamond Spa con camilla, velas y pared verde',
          en: 'Diamond Spa Zen room with a massage table, candles and a green wall',
        },
      },
      {
        src: '/home/instalaciones-suite-privada.webp',
        title: { es: 'Suite privada', en: 'Private suite' },
        alt: {
          es: 'Suite privada de Diamond Spa con camilla de masaje y arte en la pared',
          en: 'Diamond Spa private suite with a massage table and wall art',
        },
      },
    ],
  }

  // ─── "How to choose a spa" guide ──────────────────────────────────────────
  const guide = {
    label: es ? 'Guía' : 'Guide',
    title: es ? 'Cómo elegir un spa en Medellín' : 'How to choose a spa in Medellín',
    intro: es
      ? 'Medellín tiene muchos spas y centros de masaje, sobre todo en El Poblado. Estos son los criterios que aplicamos nosotros y que te sirven para comparar cualquier lugar.'
      : 'Medellín has plenty of spas and massage centres, especially in El Poblado. These are the criteria we hold ourselves to — and they work for comparing any place.',
    items: es
      ? [
          {
            title: 'Cabinas privadas y especialistas certificadas',
            body: 'Un spa profesional atiende en cabina cerrada y con terapeutas formadas en masaje o cosmetología. Pregunta siempre por su formación: en Diamond Spa nuestras especialistas están certificadas en cosmetología y terapia de masaje.',
          },
          {
            title: 'Reseñas que puedas verificar',
            body: `Busca reseñas con nombre y foto en Google Maps, no testimonios sin fuente. Diamond Spa tiene ${r} sobre 5 con ${rating.count} reseñas de clientes, y puedes leerlas completas en nuestro perfil de Google.`,
          },
          {
            title: 'Precios claros desde el principio',
            body: `Un buen spa publica sus tarifas. Aquí un masaje empieza en ${money(massageFrom)} por 30 minutos${relax60 ? ` y el relajante de 60 minutos cuesta ${money(relax60)}` : ''}; el precio incluye la cabina privada y el tiempo completo de la sesión.`,
          },
          {
            title: 'Ubicación, horario y facilidad para llegar',
            body: `Estamos en ${SPA_ADDRESS.full}, a pocos minutos del Parque El Poblado y a 10 minutos caminando del Parque Lleras, con parqueo frente al local. Abrimos de lunes a sábado hasta las 10:00 p. m. y los domingos hasta las 7:00 p. m.`,
          },
        ]
      : [
          {
            title: 'Private rooms and certified specialists',
            body: 'A professional spa works in a closed room with therapists trained in massage or cosmetology. Always ask about their training: at Diamond Spa our specialists are certified in cosmetology and massage therapy.',
          },
          {
            title: 'Reviews you can verify',
            body: `Look for reviews with a name and photo on Google Maps, not unsourced testimonials. Diamond Spa holds ${r} out of 5 across ${rating.count} customer reviews, and you can read them all on our Google profile.`,
          },
          {
            title: 'Clear prices from the start',
            body: `A good spa publishes its rates. Here a massage starts at ${money(massageFrom)} for 30 minutes${relax60 ? ` and the 60-minute relaxing massage is ${money(relax60)}` : ''}; the price includes the private room and the full session time.`,
          },
          {
            title: 'Location, hours and easy access',
            body: `We are at ${SPA_ADDRESS.full}, a few minutes from Parque El Poblado and a 10-minute walk from Parque Lleras, with parking in front of the building. We open Monday to Saturday until 10:00 pm and on Sundays until 7:00 pm.`,
          },
        ],
    moreLabel: es ? 'Más sobre nuestro spa en El Poblado' : 'More about our spa in El Poblado',
    moreHref: `/${locale}/spa-el-poblado`,
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────
  const reviews = {
    label: es ? 'Opiniones reales' : 'Real reviews',
    title: es ? 'Lo que dicen nuestros clientes en Google' : 'What our clients say on Google',
    intro: es
      ? 'Reseñas de nuestro perfil de Google Maps, con el nombre que cada cliente eligió para publicarlas.'
      : 'Reviews from our Google Maps profile, shown under the name each client chose to publish them.',
    starsLabel: (n: number) => (es ? `${n} estrellas de 5` : `${n} out of 5 stars`),
    countLabel: es ? 'reseñas en Google' : 'Google reviews',
    originalIn: (lang: 'es' | 'en') =>
      lang === 'es' ? (es ? 'Reseña original en español' : 'Original review in Spanish') : es ? 'Reseña original en inglés' : 'Original review in English',
    source: (dateIso?: string, live?: boolean) =>
      dateIso
        ? es
          ? `Datos de Google Maps ${live ? 'actualizados el' : 'al'} ${formatLongDate(dateIso, locale)}.`
          : `Google Maps data ${live ? 'updated on' : 'as of'} ${formatLongDate(dateIso, locale)}.`
        : '',
    ctaTitle: es ? '¿Ya nos visitaste?' : 'Already visited us?',
    ctaBody: es
      ? 'Cuéntanos cómo te fue. Tu reseña en Google ayuda a otras personas a elegir su spa.'
      : 'Tell us how it went. Your Google review helps other people choose their spa.',
    write: es ? 'Escribir una reseña' : 'Write a review',
    readAll: es ? `Ver las ${rating.count} reseñas en Google` : `Read all ${rating.count} reviews on Google`,
  }

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  const faq = {
    label: es ? 'Preguntas frecuentes' : 'FAQ',
    title: es ? 'Preguntas frecuentes sobre spas en Medellín' : 'Frequently asked questions about spas in Medellín',
    intro: es
      ? 'Respuestas rápidas sobre precios, horarios y cómo elegir tu masaje.'
      : 'Quick answers about prices, opening hours and how to choose your massage.',
    categoryLabel: es ? 'Spas en Medellín' : 'Spas in Medellín',
  }

  // ─── Location + map ───────────────────────────────────────────────────────
  const location = {
    label: es ? 'Ubicación' : 'Location',
    title: es ? 'Diamond Spa en El Poblado, Medellín' : 'Diamond Spa in El Poblado, Medellín',
    addressLabel: es ? 'Dirección' : 'Address',
    hoursLabel: es ? 'Horario' : 'Opening hours',
    howLabel: es ? 'Cómo llegar' : 'Getting here',
    phoneLabel: es ? 'Teléfono y WhatsApp' : 'Phone and WhatsApp',
    phone: phone.display,
    phoneHref: `tel:+${phone.wa}`,
    hours: [
      { day: weekdays.days[locale], time: weekdays.display },
      { day: sunday.days[locale], time: sunday.display },
    ],
    directions: [
      SPA_DIRECTIONS.driving[locale],
      SPA_DIRECTIONS.parking[locale],
      SPA_DIRECTIONS.airport[locale],
    ],
    mapTitle: es
      ? 'Mapa de Google con la ubicación de Diamond Spa en El Poblado, Medellín'
      : 'Google map showing the location of Diamond Spa in El Poblado, Medellín',
    directionsCta: es ? 'Cómo llegar en Google Maps' : 'Get directions on Google Maps',
    book: es ? 'Reservar una sesión' : 'Book a session',
  }

  // ─── Internal-link hub ────────────────────────────────────────────────────
  // Anchor text mirrors the target page's own primary keyword, so the home
  // passes authority with a descriptive, non-generic anchor.
  const L = (path: string) => `/${locale}/${path}`
  const hub = {
    label: es ? 'Explora' : 'Explore',
    title: es ? 'Todo sobre Diamond Spa' : 'Everything about Diamond Spa',
    groups: [
      {
        title: es ? 'Masajes' : 'Massages',
        links: [
          { href: es ? '/es/masajes' : '/en/massage-medellin', label: es ? 'Masajes en Medellín' : 'Massage in Medellín' },
          { href: L('masajes-para-hombres'), label: es ? 'Masajes para hombres' : 'Massages for men' },
          { href: L('masajes-para-mujeres'), label: es ? 'Masajes para mujeres' : 'Massages for women' },
          ...(['relaxing', 'deep-tissue', 'sports'] as const).flatMap(id => {
            const svc = getServiceById(id)
            return svc ? [{ href: serviceHref(svc, locale), label: serviceDisplayName(svc, locale) }] : []
          }),
        ] as HomeLink[],
      },
      {
        title: es ? 'Spa y experiencias' : 'Spa and experiences',
        links: [
          { href: L('spa-el-poblado'), label: es ? 'Spa en El Poblado' : 'Spa in El Poblado' },
          { href: L('dia-de-spa'), label: es ? 'Día de spa en Medellín' : 'Spa day in Medellín' },
          { href: `/${locale}${specialDatesPath(locale)}`, label: es ? 'Regalos para fechas especiales' : 'Spa gifts for special dates' },
          ...(es ? [] : [{ href: L('spa-near-me'), label: 'Spa near me' }]),
        ] as HomeLink[],
      },
      {
        title: es ? 'Faciales' : 'Facials',
        links: [
          { href: L('hydrafacial-medellin'), label: es ? 'Hidrafacial en Medellín' : 'Hydrafacial in Medellín' },
          { href: L('limpieza-facial-medellin'), label: es ? 'Limpieza facial en Medellín' : 'Facial cleansing in Medellín' },
        ] as HomeLink[],
      },
      {
        title: es ? 'Depilación' : 'Hair removal',
        links: [
          { href: L('depilacion-medellin'), label: es ? 'Depilación en Medellín' : 'Hair removal in Medellín' },
          { href: L('depilacion-hombres'), label: es ? 'Depilación para hombres' : 'Hair removal for men' },
          { href: L('depilacion-mujeres'), label: es ? 'Depilación para mujeres' : 'Hair removal for women' },
        ] as HomeLink[],
      },
      {
        title: es ? 'Conócenos' : 'About us',
        links: [
          { href: L('about'), label: es ? 'Quiénes somos' : 'About Diamond Spa' },
          { href: L('history'), label: es ? 'Nuestra historia' : 'Our story' },
          { href: L('location'), label: es ? 'Ubicación y cómo llegar' : 'Location and directions' },
          { href: L('press'), label: es ? 'Prensa' : 'Press' },
          { href: L('blog'), label: es ? 'Blog de bienestar' : 'Wellness blog' },
        ] as HomeLink[],
      },
    ],
  }

  return { meta, hero, facts, services, videos, facilities, guide, reviews, faq, location, hub }
}

export type HomeContent = ReturnType<typeof getHomeContent>
