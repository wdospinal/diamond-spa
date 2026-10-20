import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { BASE_URL, buildAlternates, buildOpenGraph, faqJsonLd, localBusinessJsonLd } from '@/lib/seo'
import { SPA_DIRECTIONS, SPA_GOOGLE_MAPS_URL, SPA_PHONES, randomWhatsAppUrl } from '@/lib/spa'
import { formatCop, getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'
import { serviceHref } from '@/lib/routes'
import { formatRating, getHomeContent, type HomeContent } from '@/lib/home-content'
import { getPlaceDetailsLive, getPlaceRating, type LivePlaceDetails } from '@/lib/google-places'
import type { ResolvedFaqCategory } from '@/lib/faqs'
import { mergeLandingMetadata } from '@/lib/landing-meta'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import { FaqSection } from '@/components/FaqSection'
import { LandingTeam } from '@/components/landing-blocks/LandingTeam'
import { LandingFacilities } from '@/components/landing-blocks/LandingFacilities'
import { HomeReviewsReal } from '@/components/home/HomeReviewsReal'
import {
  HomeFacts,
  HomeGuide,
  HomeHub,
  HomeLocation,
  HomeVideosSection,
} from '@/components/home/HomeSections'

// Same ISR cadence this page always had. The rating is read through the same
// cached Google Places helper the home uses, with the committed snapshot as the
// fallback when no API key is configured.
export const revalidate = 3600

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }]
}

const PATH = '/spa-el-poblado'

const SECTION_LABEL = 'font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-4 block'
const SECTION_H2 = 'font-headline text-4xl md:text-5xl text-on-surface'

/** One rating for the whole page: visible stars, metadata and JSON-LD all read it. */
function ratingOf(place: LivePlaceDetails): { value: string; count: number } {
  if (place.rating && place.userRatingCount) {
    return { value: place.rating.toFixed(1), count: place.userRatingCount }
  }
  return getPlaceRating()
}

const WHATSAPP_MESSAGE = {
  en: 'Hello, I would like to book a session at Diamond Spa in El Poblado.',
  es: 'Hola, quisiera reservar una sesión en Diamond Spa El Poblado.',
} as const

// ─── Copy ─────────────────────────────────────────────────────────────────────

function getPageContent(locale: Locale, rating: { value: string; count: number }) {
  const es = locale === 'es'
  const r = formatRating(rating.value, locale)
  const money = (n: number) => (es ? formatCop(n) : `$${n.toLocaleString('en-US')} COP`)

  const p = (id: string, minutes: number | null) => getServicePrice(id, minutes)
  const relaxing30 = p('relaxing', 30)
  const relaxing60 = p('relaxing', 60)
  const relaxing90 = p('relaxing', 90)
  const deep30 = p('deep-tissue', 30)
  const deep60 = p('deep-tissue', 60)
  const sports30 = p('sports', 30)
  const sports60 = p('sports', 60)
  const duo60 = p('duo', 60)
  const hydra = p('hidrafacial', null)
  const massageFrom = Math.min(...[relaxing30, deep30, sports30].filter((n): n is number => typeof n === 'number'))
  const fromPrice = Number.isFinite(massageFrom) ? massageFrom : 120000

  const meta = es
    ? {
        title: 'Spa en El Poblado, Medellín: Masajes y Faciales | Diamond Spa',
        description: `Spa en El Poblado: masajes, limpieza facial y depilación en cabinas privadas, a 10 min a pie de Parque Lleras. ${r} en Google (${rating.count} reseñas). Reserva en línea.`,
        imageAlt: 'Cabina privada de Diamond Spa en El Poblado, Medellín',
      }
    : {
        title: `Massage & Spa in El Poblado, Medellín – ${r}★ | Diamond Spa`,
        description: `Professional massage, facials & hair removal in El Poblado, 10-min walk from Parque Lleras. ${r}★ on Google, private rooms, English-speaking team. Book online.`,
        imageAlt: 'Private treatment room at Diamond Spa in El Poblado, Medellín',
      }

  const hero = es
    ? {
        label: 'El Poblado, Medellín',
        h1: 'Spa en El Poblado, Medellín',
        body: 'Diamond Spa es un spa boutique en la Carrera 43C, cerca de la Calle 10, en El Poblado: a 10 minutos caminando del Parque Lleras y a 8–10 minutos de la estación Poblado del metro. Masajes, faciales y depilación, siempre en cabinas privadas, con especialistas certificadas y un equipo que habla español e inglés.',
        book: 'Reservar una sesión',
        whatsapp: 'Escribir por WhatsApp',
        ratingLabel: 'reseñas en Google',
      }
    : {
        label: 'El Poblado, Medellín',
        h1: 'Massage & Spa in El Poblado, Medellín',
        body: 'Diamond Spa is a boutique spa on Carrera 43C, by Calle 10 in El Poblado: a 10-minute walk from Parque Lleras and 8–10 minutes on foot from Poblado metro station. Massages, facials and hair removal, always in private rooms, with certified specialists and a team that speaks English and Spanish.',
        book: 'Book a session',
        whatsapp: 'Message us on WhatsApp',
        ratingLabel: 'Google reviews',
      }

  const facts = es
    ? [
        { value: `${r} ★`, label: `Calificación en Google Maps · ${rating.count} reseñas` },
        { value: '10 min', label: 'Caminando hasta el Parque Lleras' },
        { value: '8–10 min', label: 'Caminando desde la estación Poblado del metro' },
        { value: money(fromPrice), label: 'Desde, masaje de 30 minutos en cabina privada' },
      ]
    : [
        { value: `${r} ★`, label: `Google Maps rating · ${rating.count} reviews` },
        { value: '10 min', label: 'Walk to Parque Lleras' },
        { value: '8–10 min', label: 'Walk from Poblado metro station' },
        { value: money(fromPrice), label: 'From, 30-minute massage in a private room' },
      ]

  const why = {
    title: es ? 'Por qué elegir Diamond Spa en El Poblado' : 'Why Diamond Spa works for El Poblado',
    points: es
      ? [
          { icon: 'directions_walk', title: 'A pie desde Lleras', body: 'Estamos en la Carrera 43C, cerca de la Calle 10: a 10 minutos caminando del Parque Lleras y a 8–10 minutos de la estación Poblado del metro.' },
          { icon: 'lock', title: 'Cabinas privadas', body: 'Cada tratamiento se hace en una cabina cerrada y privada, incluida una suite para dos si vienes en pareja.' },
          { icon: 'verified', title: 'Especialistas certificadas', body: 'Nuestras especialistas están certificadas en cosmetología y en terapia de masaje.' },
          { icon: 'language', title: 'Atención en español e inglés', body: 'El equipo habla español e inglés, así que puedes explicar qué necesitas y reservar sin barreras de idioma.' },
        ]
      : [
          { icon: 'directions_walk', title: 'Walk from Lleras', body: 'We are on Carrera 43C, by Calle 10: a 10-minute walk from Parque Lleras and 8–10 minutes from Poblado metro station.' },
          { icon: 'lock', title: 'Private rooms', body: 'Every treatment takes place in a closed private room, including a suite for two if you come as a couple.' },
          { icon: 'verified', title: 'Certified specialists', body: 'Our specialists are certified in cosmetology and massage therapy.' },
          { icon: 'language', title: 'English and Spanish', body: 'The team speaks English and Spanish, so you can explain what you need and book without a language barrier.' },
        ],
  }

  const services = {
    label: es ? 'Servicios' : 'Services',
    title: es ? 'Masajes y faciales en nuestro spa de El Poblado' : 'Massages and facials at our El Poblado spa',
    intro: es
      ? 'Precios publicados y sesiones de 30, 60 o 90 minutos. Todos los masajes incluyen la cabina privada.'
      : 'Published prices and 30, 60 or 90-minute sessions. Every massage includes the private room.',
    fromLabel: es ? 'Desde' : 'From',
    viewLabel: es ? 'Ver detalles' : 'View details',
    cards: (
      [
        {
          id: 'relaxing',
          desc: es
            ? 'Movimientos suaves y rítmicos para soltar la tensión después de un día de caminar o trabajar.'
            : 'Slow, rhythmic strokes to release tension after a long day of walking or working.',
          price: relaxing30,
          meta: es ? '30 min' : '30 min',
        },
        {
          id: 'deep-tissue',
          desc: es
            ? 'Presión firme y dirigida para nudos musculares y tensión crónica en espalda, cuello y hombros.'
            : 'Firm, targeted pressure for muscle knots and chronic tension in the back, neck and shoulders.',
          price: deep30,
          meta: '30 min',
        },
        {
          id: 'sports',
          desc: es
            ? 'Recuperación y movilidad para quienes entrenan, corren o pasan muchas horas sentados.'
            : 'Recovery and mobility work for people who train, run or sit for long hours.',
          price: sports30,
          meta: '30 min',
        },
        {
          id: 'duo',
          desc: es
            ? 'Masaje en pareja en nuestra suite para dos, con dos terapeutas y dos camillas.'
            : 'Couples massage in our suite for two, with two therapists and two tables.',
          price: p('duo', 30),
          meta: '30 min',
        },
        {
          id: 'hidrafacial',
          desc: es
            ? 'Limpieza, exfoliación e hidratación facial con fórmulas de grado profesional.'
            : 'Facial cleansing, exfoliation and hydration with professional-grade formulas.',
          price: hydra,
          meta: '',
        },
      ] as const
    ).flatMap(card => {
      const svc = getServiceById(card.id)
      if (!svc) return []
      return [
        {
          id: card.id,
          name: serviceDisplayName(svc, locale),
          desc: card.desc,
          href: serviceHref(svc, locale),
          price: card.price ? `${money(card.price)}${card.meta ? ` · ${card.meta}` : ''}` : undefined,
        },
      ]
    }),
    more: [
      { href: es ? '/es/masajes' : '/en/massage-medellin', label: es ? 'Masajes en Medellín' : 'Massage in Medellín' },
      { href: `/${locale}/limpieza-facial-medellin`, label: es ? 'Limpieza facial en Medellín' : 'Facial cleansing in Medellín' },
      { href: `/${locale}/depilacion-medellin`, label: es ? 'Depilación en Medellín' : 'Hair removal in Medellín' },
    ],
    seeAll: es ? 'Ver todos los servicios y precios' : 'See all services and prices',
    seeAllHref: `/${locale}/services`,
  }

  const videos = {
    title: es ? 'Mira una sesión en nuestro spa de El Poblado' : 'Watch a session at our El Poblado spa',
    intro: es
      ? 'Grabaciones reales hechas en nuestras cabinas de la Carrera 43C. Toca un video para reproducirlo.'
      : 'Real footage recorded in our private rooms on Carrera 43C. Tap a video to play it.',
  }

  const facilities = {
    label: es ? 'Instalaciones' : 'Facilities',
    title: es ? 'Por dentro de nuestro spa en El Poblado' : 'Inside our El Poblado spa',
    subtitle: es
      ? 'Fotos reales de nuestras salas en la Carrera 43C: luz cálida, camillas profesionales y una suite para dos.'
      : 'Real photos of our rooms on Carrera 43C: warm light, professional massage tables and a suite for two.',
  }

  const guide = {
    label: es ? 'Guía' : 'Guide',
    title: es ? 'Cómo elegir un spa en El Poblado' : 'How to choose a spa in El Poblado',
    intro: es
      ? 'En El Poblado hay muchos lugares que ofrecen masajes y no todos son el mismo tipo de negocio. Cuatro comprobaciones rápidas antes de reservar, en cualquier spa.'
      : 'El Poblado has many places offering massage, and they are not all the same kind of business. Four quick checks before you book, at any spa.',
    items: es
      ? [
          { title: 'Mira qué vende realmente el lugar', body: 'Un spa terapéutico publica su carta de servicios con duraciones y precios: masaje relajante, descontracturante, deportivo, facial. Si solo ves fotos y un número de WhatsApp, pide más información antes de ir.' },
          { title: 'Confirma que es un negocio profesional', body: 'Busca el perfil en Google Maps: dirección real, fotos del local, horario y reseñas firmadas por clientes. Pregunta también por la formación de las terapeutas.' },
          { title: 'Compara el precio completo', body: `Pregunta si el precio cubre el tiempo íntegro de la sesión y la cabina privada. Aquí un masaje empieza en ${money(fromPrice)} por 30 minutos${relaxing60 ? ` y el relajante de 60 minutos cuesta ${money(relaxing60)}` : ''}, sin cargos adicionales por cabina.` },
          { title: 'Piensa en el trayecto', body: 'El tráfico de El Poblado se complica a ciertas horas. Elegir un spa al que puedas llegar a pie desde Lleras o desde la estación Poblado del metro te ahorra tiempo y reservas más fácil.' },
        ]
      : [
          { title: 'Look at what the place actually sells', body: 'A therapeutic spa publishes its menu with durations and prices: relaxing, deep tissue, sports massage, facials. If all you see is photos and a WhatsApp number, ask for more detail before you go.' },
          { title: 'Confirm it is a professional business', body: 'Find the listing on Google Maps: real address, photos of the premises, opening hours and reviews signed by clients. Ask about the therapists’ training too.' },
          { title: 'Compare the full price', body: `Ask whether the price covers the whole session time and the private room. Here a massage starts at ${money(fromPrice)} for 30 minutes${relaxing60 ? ` and the 60-minute relaxing massage is ${money(relaxing60)}` : ''}, with no extra room charge.` },
          { title: 'Think about the trip', body: 'El Poblado traffic gets heavy at certain hours. A spa you can reach on foot from Lleras or from Poblado metro station saves time and makes booking easier.' },
        ],
    moreLabel: es ? 'Ver todos los servicios y precios' : 'See all services and prices',
    moreHref: `/${locale}/services`,
  }

  const reviews = {
    ...getHomeContent(locale, rating).reviews,
    title: es ? 'Lo que dicen nuestros clientes del spa en El Poblado' : 'What clients say about our El Poblado spa',
    intro: es
      ? 'Reseñas de nuestro perfil de Google Maps, con el nombre que cada cliente eligió para publicarlas.'
      : 'Reviews from our Google Maps profile, shown under the name each client chose to publish them.',
  }

  const location = {
    label: es ? 'Cómo llegar' : 'Getting here',
    title: es ? 'Cómo llegar a Diamond Spa en El Poblado' : 'How to get to Diamond Spa in El Poblado',
    directions: [
      es ? 'A 10 minutos caminando del Parque Lleras' : '10-minute walk from Parque Lleras',
      es ? 'A 8–10 minutos caminando de la estación Poblado del metro' : '8–10 minute walk from Poblado metro station',
      SPA_DIRECTIONS.driving[locale],
      SPA_DIRECTIONS.parking[locale],
      SPA_DIRECTIONS.airport[locale],
    ] as HomeContent['location']['directions'],
  }

  const hubTitle = es ? 'Más de Diamond Spa en Medellín' : 'More from Diamond Spa in Medellín'

  const phone = SPA_PHONES[1].display

  const faqs: { question: string; answer: string }[] = es
    ? [
        {
          question: '¿Dónde queda Diamond Spa en El Poblado?',
          answer: 'Estamos en la Carrera 43C #10-42, El Poblado, Medellín, cerca de la Calle 10. Queda a unos 10 minutos caminando del Parque Lleras y a 8–10 minutos caminando de la estación Poblado del metro; también puedes llegar en taxi o en carro.',
        },
        {
          question: '¿Cuánto cuesta un masaje en El Poblado?',
          answer: `En Diamond Spa un masaje empieza en ${money(fromPrice)} por 30 minutos${relaxing60 ? `. El masaje relajante de 60 minutos cuesta ${money(relaxing60)}` : ''}${relaxing90 ? ` y el de 90 minutos ${money(relaxing90)}` : ''}${deep60 ? `. El deep tissue de 60 minutos cuesta ${money(deep60)}` : ''}${sports60 ? ` y el masaje deportivo de 60 minutos ${money(sports60)}` : ''}${duo60 ? `. El masaje en pareja de 60 minutos cuesta ${money(duo60)}` : ''}. El precio incluye la cabina privada y todo el tiempo de la sesión.`,
        },
        {
          question: '¿Cómo elijo un buen spa en El Poblado?',
          answer: 'Revisa que publique su carta de servicios con duraciones y precios, que tenga un perfil verificable en Google Maps con reseñas firmadas, que atienda en cabinas privadas y que informe la formación de sus terapeutas. También conviene que puedas llegar fácil a pie o en metro.',
        },
        {
          question: '¿Diamond Spa es un spa profesional? ¿Ofrecen servicios sexuales?',
          answer: 'Diamond Spa es un spa profesional de masajes terapéuticos y de relajación, faciales y depilación, con especialistas certificadas. No ofrecemos servicios sexuales ni atendemos solicitudes de ese tipo.',
        },
        {
          question: '¿Atienden a hombres y mujeres?',
          answer: 'Sí. Todos los servicios están disponibles para hombres y mujeres, en cabinas privadas y en un ambiente profesional y discreto.',
        },
        {
          question: '¿Tienen masaje en pareja en El Poblado?',
          answer: `Sí. Tenemos una suite para dos con dos camillas${duo60 ? `; el masaje en pareja de 60 minutos cuesta ${money(duo60)}` : ''}. Reserva con anticipación, sobre todo en fines de semana.`,
        },
        {
          question: '¿Hablan inglés?',
          answer: 'Sí. Nuestro equipo habla español e inglés, y puedes reservar en línea en cualquiera de los dos idiomas.',
        },
        {
          question: '¿Hay parqueo cerca de Diamond Spa?',
          answer: 'Sí. Hay zona de parqueo frente al local y parqueadero en la misma cuadra.',
        },
        {
          question: '¿Hay que reservar con anticipación?',
          answer: `Recomendamos reservar para asegurar tu horario. Puedes hacerlo en línea desde esta página o escribirnos por WhatsApp al ${phone}. Abrimos de lunes a sábado de 10:00 a. m. a 10:00 p. m. y los domingos de 10:00 a. m. a 7:00 p. m.`,
        },
      ]
    : [
        {
          question: 'Where is Diamond Spa in El Poblado?',
          answer: 'We are at Carrera 43C #10-42, El Poblado, Medellín, by Calle 10. It is about a 10-minute walk from Parque Lleras and 8–10 minutes on foot from Poblado metro station; you can also arrive by taxi or car.',
        },
        {
          question: 'How much does a massage cost in El Poblado?',
          answer: `At Diamond Spa a massage starts at ${money(fromPrice)} for 30 minutes${relaxing60 ? `. The 60-minute relaxing massage is ${money(relaxing60)}` : ''}${relaxing90 ? ` and the 90-minute one is ${money(relaxing90)}` : ''}${deep60 ? `. Deep tissue for 60 minutes is ${money(deep60)}` : ''}${sports60 ? ` and the 60-minute sports massage is ${money(sports60)}` : ''}${duo60 ? `. A 60-minute couples massage is ${money(duo60)}` : ''}. The price includes the private room and the full session time.`,
        },
        {
          question: 'How do I choose a good spa in El Poblado?',
          answer: 'Check that it publishes a menu with durations and prices, has a verifiable Google Maps listing with reviews signed by clients, works in private rooms and states its therapists’ training. It also helps if you can get there easily on foot or by metro.',
        },
        {
          question: 'Is Diamond Spa a professional spa? Do you offer sexual services?',
          answer: 'Diamond Spa is a professional spa offering therapeutic and relaxation massage, facials and hair removal with certified specialists. We do not offer sexual services and we do not accept requests for them.',
        },
        {
          question: 'Do you welcome both men and women?',
          answer: 'Yes. Every service is available to men and women, in private rooms and in a professional, discreet environment.',
        },
        {
          question: 'Do you offer couples massage in El Poblado?',
          answer: `Yes. We have a suite for two with two massage tables${duo60 ? `; a 60-minute couples massage is ${money(duo60)}` : ''}. Book ahead, especially on weekends.`,
        },
        {
          question: 'Do you speak English?',
          answer: 'Yes. Our team speaks English and Spanish, and you can book online in either language.',
        },
        {
          question: 'Is there parking near Diamond Spa?',
          answer: 'Yes. There is parking in front of the premises and a parking lot on the same block.',
        },
        {
          question: 'Do I need to book in advance?',
          answer: `We recommend booking to secure your time slot. You can book online from this page or message us on WhatsApp at ${phone}. We are open Monday to Saturday 10:00 am to 10:00 pm and Sundays 10:00 am to 7:00 pm.`,
        },
      ]

  const faqSection = {
    label: es ? 'Preguntas frecuentes' : 'FAQ',
    title: es ? 'Preguntas frecuentes sobre nuestro spa en El Poblado' : 'Frequently asked questions about our El Poblado spa',
    intro: es
      ? 'Precios, cómo llegar y cómo reservar, en pocas líneas.'
      : 'Prices, how to get here and how to book, in a few lines.',
    categoryLabel: es ? 'Spa en El Poblado' : 'Spa in El Poblado',
  }

  const cta = {
    title: es ? 'Reserva tu sesión en El Poblado' : 'Book your session in El Poblado',
    body: es
      ? 'Elige tu masaje o tratamiento, reserva en línea y recibe las indicaciones de llegada. También puedes escribirnos por WhatsApp.'
      : 'Choose your massage or treatment, book online and get arrival directions. You can also message us on WhatsApp.',
  }

  const breadcrumb = es ? 'Spa en El Poblado' : 'Spa in El Poblado'

  return {
    meta, hero, facts, why, services, videos, facilities, guide, reviews, location,
    hubTitle, faqs, faqSection, cta, breadcrumb,
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : 'es'
  const rating = ratingOf(await getPlaceDetailsLive())
  const { meta } = getPageContent(locale, rating)
  return mergeLandingMetadata(
    PATH,
    locale,
    { title: meta.title, description: meta.description },
    {
      alternates: buildAlternates(PATH, locale),
      openGraph: buildOpenGraph({
        title: meta.title,
        description: meta.description,
        path: PATH,
        locale,
        imageAlt: meta.imageAlt,
      }),
    },
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SpaElPobladoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const es = locale === 'es'

  const place = await getPlaceDetailsLive()
  const rating = ratingOf(place)
  const c = getPageContent(locale, rating)
  const home = getHomeContent(locale, rating)

  // Reuse the home's building blocks, but with El Poblado-specific headings and
  // directions so the two pages never repeat each other's text.
  const pageContent: HomeContent = {
    ...home,
    facts: c.facts,
    videos: { ...home.videos, title: c.videos.title, intro: c.videos.intro },
    guide: c.guide,
    location: { ...home.location, label: c.location.label, title: c.location.title, directions: c.location.directions },
    hub: {
      ...home.hub,
      title: c.hubTitle,
      groups: home.hub.groups
        .map(g => ({ ...g, links: g.links.filter(l => l.href !== `/${locale}${PATH}`) }))
        .filter(g => g.links.length > 0),
    },
  }

  const faqCategories: ResolvedFaqCategory[] = [
    { id: 'discovery', icon: 'location_on', label: c.faqSection.categoryLabel, items: c.faqs },
  ]

  const whatsappUrl = randomWhatsAppUrl(WHATSAPP_MESSAGE[locale])

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: es ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: c.breadcrumb, item: `${BASE_URL}/${locale}${PATH}` },
    ],
  }

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale, { rating })} />
      <JsonLd data={faqJsonLd(c.faqs)} />
      <JsonLd data={breadcrumbJsonLd} />
      <LandingHead path={PATH} locale={locale} />

      <main>
        {/* Hero */}
        <section className="px-6 md:px-12 pt-32 pb-20 bg-surface">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{c.hero.label}</p>
              <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
                {c.hero.h1}
              </h1>
              <p className="text-secondary font-body text-lg leading-relaxed font-light max-w-2xl mb-8">{c.hero.body}</p>
              <a
                href={SPA_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 mb-10 group"
              >
                <span className="flex gap-0.5" role="img" aria-label={es ? `${formatRating(rating.value, locale)} estrellas de 5` : `${rating.value} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                  ))}
                </span>
                <span className="font-label text-on-surface text-xs tracking-wider group-hover:text-primary transition-colors">
                  {formatRating(rating.value, locale)} · {rating.count} {c.hero.ratingLabel}
                </span>
              </a>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/${locale}/book`}
                  className="inline-flex items-center justify-center gap-3 bg-primary text-on-primary px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-all duration-300"
                >
                  {c.hero.book}
                  <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-surface-container-high transition-all duration-300"
                >
                  {c.hero.whatsapp}
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-outline-variant/20">
                <Image
                  src="/home/hero-cabina.webp"
                  alt={c.meta.imageAlt}
                  fill
                  priority
                  quality={70}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <HomeFacts content={pageContent} />

        {/* Why */}
        <section className="py-28 px-6 md:px-12 bg-surface">
          <div className="max-w-screen-2xl mx-auto">
            <h2 className={`${SECTION_H2} max-w-3xl mb-16`}>{c.why.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.why.points.map(point => (
                <div key={point.title} className="bg-surface-container ring-1 ring-outline-variant/10 rounded-sm p-8">
                  <span className="material-symbols-outlined text-primary text-3xl mb-5 block" aria-hidden="true">{point.icon}</span>
                  <h3 className="font-headline text-xl text-on-surface mb-3">{point.title}</h3>
                  <p className="font-body text-secondary text-sm leading-relaxed">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services with real prices */}
        <section className="py-28 px-6 md:px-12 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto">
            <div className="max-w-3xl mb-16">
              <span className={SECTION_LABEL}>{c.services.label}</span>
              <h2 className={SECTION_H2}>{c.services.title}</h2>
              <p className="mt-4 font-body text-secondary leading-relaxed font-light">{c.services.intro}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.services.cards.map(card => (
                <article
                  key={card.id}
                  className="flex flex-col gap-4 bg-surface-container ring-1 ring-outline-variant/10 rounded-sm p-8"
                >
                  <h3 className="font-headline text-2xl text-on-surface">
                    <Link href={card.href} className="hover:text-primary transition-colors">{card.name}</Link>
                  </h3>
                  <p className="flex-1 font-body text-secondary text-sm leading-relaxed">{card.desc}</p>
                  {card.price && (
                    <p className="font-label text-xs tracking-wider text-on-surface">
                      <span className="text-outline">{c.services.fromLabel} </span>
                      {card.price}
                    </p>
                  )}
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all"
                  >
                    {c.services.viewLabel}
                    <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">chevron_right</span>
                  </Link>
                </article>
              ))}
            </div>
            <ul className="mt-10 flex flex-wrap gap-3">
              {c.services.more.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-wider text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                href={c.services.seeAllHref}
                className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
              >
                {c.services.seeAll}
                <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <HomeVideosSection content={pageContent} />

        <LandingFacilities
          locale={locale}
          images={home.facilities.images}
          label={c.facilities.label}
          title={c.facilities.title}
          subtitle={c.facilities.subtitle}
          unoptimized={false}
        />

        <LandingTeam locale={locale} source="spa-el-poblado" />

        <HomeGuide content={pageContent} />

        <HomeReviewsReal locale={locale} place={place} rating={rating} copy={c.reviews} />

        <FaqSection
          categories={faqCategories}
          title={c.faqSection.title}
          label={c.faqSection.label}
          intro={c.faqSection.intro}
          className="py-28 px-6 md:px-12 bg-surface-container-low"
        />

        <HomeLocation locale={locale} content={pageContent} />

        <HomeHub content={pageContent} />

        {/* Closing CTA */}
        <section className="py-32 px-6 md:px-12 bg-surface-container-lowest text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">{c.cta.title}</h2>
            <p className="font-body text-secondary leading-relaxed font-light mb-10 max-w-xl mx-auto">{c.cta.body}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/book`}
                className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
              >
                {c.hero.book}
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
              >
                {c.hero.whatsapp}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
