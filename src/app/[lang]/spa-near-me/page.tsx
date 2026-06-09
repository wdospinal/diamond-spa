import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, BASE_URL, BUSINESS, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import {
  SPA_ADDRESS,
  SPA_HOURS,
  SPA_PHONES,
  SPA_RATING,
  SPA_GOOGLE_REVIEW_URL,
  SPA_GOOGLE_MAPS_URL,
  SPA_WHATSAPP_GREETING,
  SPA_MAP_EMBED_SRC,
  randomWhatsAppUrl,
} from '@/lib/spa'
import { SERVICES, formatCop, getServiceSlug, type ServiceDef, type DurationMinutes } from '@/lib/services'
import { STATIC_REVIEWS } from '@/lib/reviews'
import { ReviewsGrid } from '@/components/ReviewsGrid'
import MapEmbed from '@/components/MapEmbed'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'en'
  const isEn = locale === 'en'

  const title = isEn
    ? 'Spa Near Me in Medellín — Diamond Spa El Poblado'
    : 'Spa Cerca de Mí en Medellín — Diamond Spa El Poblado'
  const description = isEn
    ? 'Looking for a luxury spa near you in Medellín? Diamond Spa is located in El Poblado, offering massages, facials, and hair removal in private rooms. Rated 4.9 ★ on Google.'
    : '¿Buscas un spa de lujo cerca de ti en Medellín? Diamond Spa está en El Poblado, con masajes, faciales y depilación en salas privadas. Calificado 4.9 ★ en Google.'

  return {
    title,
    description,
    alternates: buildAlternates('/spa-near-me', locale),
    openGraph: buildOpenGraph({ title, description, path: '/spa-near-me', locale }),
  }
}

const serviceList = SERVICES as unknown as ServiceDef[]
const top3 = (cat: ServiceDef['categoryId']) => serviceList.filter(s => s.categoryId === cat).slice(0, 3)
const FEATURED_MASSAGES = top3('massages')
const FEATURED_FACIALS  = top3('facials')
const FEATURED_HAIR     = top3('hair-removal')

function ServicePrice({ service, locale }: { service: ServiceDef; locale: Locale }) {
  if (service.pricingModel === 'flat') {
    const s = service as ServiceDef & { pricingModel: 'flat'; price: number }
    return <span>{formatCop(s.price)}</span>
  }
  if (service.pricingModel === 'duration') {
    const s = service as ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }
    return <span>{locale === 'en' ? 'from ' : 'desde '}{formatCop(s.prices[30])}</span>
  }
  const s = service as ServiceDef & { pricingModel: 'wax-machine'; waxPrice: number; machinePrice: number }
  return <span>{locale === 'en' ? 'from ' : 'desde '}{formatCop(Math.min(s.waxPrice, s.machinePrice))}</span>
}

const FAQ_EN = [
  {
    q: 'Where is Diamond Spa located?',
    a: `We are at ${SPA_ADDRESS.full}. We are located in El Poblado, Medellín — a few minutes drive from Parque El Poblado. Parking is available in front of the premises and on the same block.`,
  },
  {
    q: 'What types of services do you offer?',
    a: 'We offer exclusive massages (relaxing, deep tissue, four-hands, duo, volcanic stones, sports, sensitive), facials & skin care (HydraFacial, deep cleansing, hydration), and professional hair removal (underarm, bikini, half leg, full leg, chest, back, full body) — all in private rooms.',
  },
  {
    q: 'Do you speak English?',
    a: 'Yes, our staff is bilingual. You can book, consult, and receive your treatment entirely in English.',
  },
  {
    q: 'Do you accept walk-ins?',
    a: 'We recommend booking in advance to guarantee your preferred time slot. You can book online or via WhatsApp.',
  },
  {
    q: 'What are your opening hours?',
    a: `Monday – Saturday: 10:00 AM – 10:00 PM. Sunday: 10:00 AM – 7:00 PM.`,
  },
  {
    q: 'Is there parking available?',
    a: 'Yes, parking is available in front of the premises and in the same block. We are also easily reachable on foot from El Poblado metro cable and Parque El Poblado.',
  },
  {
    q: 'How far are you from the airport?',
    a: 'We are approximately 25 minutes from Olaya Herrera Airport (EOH) and about 40 minutes from José María Córdova International Airport (MDE) depending on traffic.',
  },
  {
    q: 'What is included in the four-hands massage?',
    a: 'The four-hands massage is a unique experience where two therapists work simultaneously in perfect synchrony. The dual stimulation allows your mind to fully surrender and reach a depth of relaxation impossible with a single therapist.',
  },
  {
    q: 'How do I book an appointment?',
    a: 'You can book instantly through our online booking form or contact us directly on WhatsApp. We confirm appointments within minutes.',
  },
]

const FAQ_ES = [
  {
    q: '¿Dónde está ubicado Diamond Spa?',
    a: `Estamos en ${SPA_ADDRESS.full}. Ubicados en El Poblado, Medellín — a pocos minutos en carro desde el Parque El Poblado. Hay parqueo disponible frente al local y en la misma cuadra.`,
  },
  {
    q: '¿Qué servicios ofrecen?',
    a: 'Ofrecemos masajes exclusivos (relajante, deep tissue, cuatro manos, duo, piedras volcánicas, deportivo, sensitivo), faciales y cuidado de la piel (Hidrafacial, limpieza profunda, hidratación), y depilación profesional (axila, bikini, media pierna, pierna completa, pecho, espalda, cuerpo completo) — todo en salas privadas.',
  },
  {
    q: '¿Hablan inglés?',
    a: 'Sí, nuestro personal es bilingüe. Pueden recibir toda la atención y el tratamiento completamente en inglés.',
  },
  {
    q: '¿Aceptan clientes sin cita previa?',
    a: 'Recomendamos reservar con anticipación para garantizar el horario deseado. Pueden hacerlo en línea o por WhatsApp.',
  },
  {
    q: '¿Cuál es su horario de atención?',
    a: 'Lunes – Sábado: 10:00 AM – 10:00 PM. Domingo: 10:00 AM – 7:00 PM.',
  },
  {
    q: '¿Hay parqueadero disponible?',
    a: 'Sí, hay parqueo disponible frente al local y en la misma cuadra. También somos accesibles a pie desde El Poblado y el Parque El Poblado.',
  },
  {
    q: '¿A cuánto queda del aeropuerto?',
    a: 'Estamos a aproximadamente 25 minutos del Aeropuerto Olaya Herrera (EOH) y a unos 40 minutos del Aeropuerto Internacional José María Córdova (MDE) según el tráfico.',
  },
  {
    q: '¿Qué incluye el masaje de cuatro manos?',
    a: 'El masaje de cuatro manos es una experiencia única donde dos terapeutas trabajan simultáneamente en perfecta sincronía. La estimulación dual permite que la mente se rinda completamente, alcanzando un nivel de relajación imposible con un solo terapeuta.',
  },
  {
    q: '¿Cómo puedo hacer una reserva?',
    a: 'Puede reservar directamente desde nuestro formulario en línea o contactarnos por WhatsApp. Confirmamos citas en minutos.',
  },
]

export default async function SpaNearMePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const isEn = locale === 'en'
  const faq = isEn ? FAQ_EN : FAQ_ES
  const whatsappUrl = randomWhatsAppUrl(SPA_WHATSAPP_GREETING[locale])

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEn ? 'Spa Near Me' : 'Spa Cerca de Mí', item: `${BASE_URL}/${locale}/spa-near-me` },
    ],
  }

  const serviceCardClass = 'bg-surface-container-low p-7 flex flex-col gap-3 hover:bg-surface-container transition-colors'

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={faqJsonLd(faq.map(({ q, a }) => ({ question: q, answer: a })))} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Hero */}
      <header className="pt-40 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-5 block">
            El Poblado, Medellín
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-tight max-w-4xl">
            {isEn ? 'Luxury Spa Near You in Medellín' : 'Spa de Lujo Cerca de Ti en Medellín'}
          </h1>
          <p className="mt-8 text-on-surface-variant text-lg max-w-xl font-light leading-relaxed">
            {isEn
              ? `Private rooms, bilingual staff, and expert therapists — in the heart of El Poblado. Rated ${SPA_RATING.value} ★ by ${SPA_RATING.count}+ clients on Google.`
              : `Salas privadas, personal bilingüe y terapeutas expertos — en el corazón de El Poblado. Calificado ${SPA_RATING.value} ★ por más de ${SPA_RATING.count} clientes en Google.`}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/book`}
              className="bg-primary text-on-primary px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all w-fit"
            >
              {isEn ? 'Book Now' : 'Reservar Ahora'}
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-outline-variant text-on-surface px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-surface-container transition-all w-fit"
            >
              {isEn ? 'WhatsApp Us' : 'Escríbenos por WhatsApp'}
            </a>
          </div>
        </div>
      </header>

      {/* Location + Map */}
      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">
            {isEn ? 'Location' : 'Ubicación'}
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Address details */}
            <div>
              <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-8">
                {isEn ? 'Find Us' : 'Encuéntranos'}
              </h2>
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: '20px' }}>location_on</span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">{isEn ? 'Address' : 'Dirección'}</p>
                    <p className="font-body text-on-surface text-sm">{SPA_ADDRESS.full}</p>
                  </div>
                </div>
                {SPA_HOURS.map(h => (
                  <div key={h.opens} className="flex gap-4">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: '20px' }}>schedule</span>
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">
                        {isEn ? h.days.en : h.days.es}
                      </p>
                      <p className="font-body text-on-surface text-sm">{h.display}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: '20px' }}>call</span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">{isEn ? 'Phone / WhatsApp' : 'Teléfono / WhatsApp'}</p>
                    {SPA_PHONES.map(({ display, wa }) => (
                      <a key={wa} href={`tel:+${wa}`} className="block font-body text-on-surface text-sm hover:text-primary transition-colors">{display}</a>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: '20px' }}>local_parking</span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">{isEn ? 'Parking' : 'Parqueo'}</p>
                    <p className="font-body text-on-surface text-sm">
                      {isEn ? 'Available in front and on the same block' : 'Disponible frente al local y en la misma cuadra'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: '20px' }}>flight</span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">{isEn ? 'From airport' : 'Desde el aeropuerto'}</p>
                    <p className="font-body text-on-surface text-sm">
                      {isEn ? '25 min from Olaya Herrera Airport' : '25 min desde el Aeropuerto Olaya Herrera'}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={SPA_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 border border-outline-variant text-on-surface px-8 py-3 font-label text-xs uppercase tracking-widest hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">open_in_new</span>
                {isEn ? 'Open in Google Maps' : 'Abrir en Google Maps'}
              </a>
            </div>

            {/* Map */}
            <MapEmbed
              src={SPA_MAP_EMBED_SRC}
              title={isEn ? 'Diamond Spa location in El Poblado, Medellín' : 'Ubicación de Diamond Spa en El Poblado, Medellín'}
              height={440}
            />
          </div>
        </div>
      </section>

      {/* Services — 3 per category */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">
            {isEn ? 'Services' : 'Servicios'}
          </span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface font-light mb-4">
            {isEn ? 'What we offer' : 'Lo que ofrecemos'}
          </h2>
          <p className="text-on-surface-variant text-base font-light leading-relaxed max-w-2xl mb-16">
            {isEn
              ? 'All treatments take place in private, soundproofed rooms. No crowds, no waiting areas — just you and your therapist.'
              : 'Todos los tratamientos se realizan en salas privadas e insonorizadas. Sin aglomeraciones, sin salas de espera — solo usted y su terapeuta.'}
          </p>

          {/* Massages */}
          <div className="mb-16">
            <h3 className="font-headline text-2xl text-on-surface mb-1">
              {isEn ? 'Exclusive Massages' : 'Masajes Exclusivos'}
            </h3>
            <div className="w-10 h-px bg-primary mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURED_MASSAGES.map(s => (
                <div key={s.id} className={serviceCardClass}>
                  <h4 className="font-headline text-xl text-on-surface">{isEn ? s.name.en : s.name.es}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed flex-1">{isEn ? s.shortDesc.en : s.shortDesc.es}</p>
                  <p className="font-label text-primary text-xs"><ServicePrice service={s} locale={locale} /></p>
                  <Link href={`/${locale}/services/${getServiceSlug(s, locale)}`} className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors">
                    {isEn ? 'Learn more →' : 'Ver más →'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Facials */}
          <div className="mb-16">
            <h3 className="font-headline text-2xl text-on-surface mb-1">
              {isEn ? 'Facials & Skin Care' : 'Faciales y Cuidado de la Piel'}
            </h3>
            <div className="w-10 h-px bg-primary mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURED_FACIALS.map(s => (
                <div key={s.id} className={serviceCardClass}>
                  <h4 className="font-headline text-xl text-on-surface">{isEn ? s.name.en : s.name.es}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed flex-1">{isEn ? s.shortDesc.en : s.shortDesc.es}</p>
                  <p className="font-label text-primary text-xs"><ServicePrice service={s} locale={locale} /></p>
                  <Link href={`/${locale}/services/${getServiceSlug(s, locale)}`} className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors">
                    {isEn ? 'Learn more →' : 'Ver más →'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Hair Removal */}
          <div className="mb-10">
            <h3 className="font-headline text-2xl text-on-surface mb-1">
              {isEn ? 'Hair Removal' : 'Depilación'}
            </h3>
            <div className="w-10 h-px bg-primary mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURED_HAIR.map(s => (
                <div key={s.id} className={serviceCardClass}>
                  <h4 className="font-headline text-xl text-on-surface">{isEn ? s.name.en : s.name.es}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed flex-1">{isEn ? s.shortDesc.en : s.shortDesc.es}</p>
                  <p className="font-label text-primary text-xs"><ServicePrice service={s} locale={locale} /></p>
                  <Link href={`/${locale}/services/${getServiceSlug(s, locale)}`} className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors">
                    {isEn ? 'Learn more →' : 'Ver más →'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Link href={`/${locale}/services`} className="border border-outline-variant text-on-surface px-10 py-4 font-label text-xs uppercase tracking-[0.2em] hover:bg-surface-container transition-all">
              {isEn ? 'View all services' : 'Ver todos los servicios'}
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">
            {isEn ? 'Client Reviews' : 'Reseñas de Clientes'}
          </span>
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-16">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface font-light">
              {isEn ? 'What clients say' : 'Lo que dicen los clientes'}
            </h2>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-headline text-5xl text-primary leading-none">{SPA_RATING.value}</span>
              <div className="flex flex-col gap-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                  ))}
                </div>
                <span className="font-label text-outline text-xs tracking-widest">
                  {SPA_RATING.count}+ {isEn ? 'Google reviews' : 'reseñas en Google'}
                </span>
              </div>
            </div>
          </div>
          <ReviewsGrid
            reviews={STATIC_REVIEWS}
            reviewUrl={SPA_GOOGLE_REVIEW_URL}
            leaveReviewLabel={isEn ? 'Leave a review' : 'Dejar una reseña'}
            locale={locale}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">FAQ</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface font-light mb-16">
            {isEn ? 'Frequently asked questions' : 'Preguntas frecuentes'}
          </h2>
          <div className="flex flex-col divide-y divide-outline-variant/15">
            {faq.map(({ q, a }) => (
              <details key={q} className="group py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <summary className="flex items-start justify-between gap-6 font-headline text-lg text-on-surface font-light leading-snug select-none">
                  {q}
                  <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 group-open:rotate-180 transition-transform" aria-hidden="true">expand_more</span>
                </summary>
                <p className="mt-4 font-body text-secondary text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-surface-container-lowest text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">
            {isEn ? 'Ready to recover?' : '¿Listo para recuperarte?'}
          </h2>
          <p className="text-outline mb-12 uppercase tracking-widest text-xs font-label">
            {isEn ? `${SPA_ADDRESS.neighborhood} · ${SPA_ADDRESS.city}` : `${SPA_ADDRESS.neighborhood} · ${SPA_ADDRESS.city}`}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              {isEn ? 'Book a Session' : 'Reservar Sesión'}
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-outline-variant text-on-surface px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all"
            >
              {isEn ? 'Chat on WhatsApp' : 'Chatear por WhatsApp'}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
