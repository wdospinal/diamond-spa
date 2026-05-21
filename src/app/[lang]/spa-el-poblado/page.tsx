import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_HOURS } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const content = {
  en: {
    metaTitle: 'Spa in El Poblado Medellín — Diamond Spa',
    metaDesc:
      'Best spa in El Poblado, Medellín. ⭐ 4.9 · 90 Google reviews. Massages, facials & hair removal. Private rooms, bilingual staff. From $120,000 COP — book now.',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Spa in El Poblado, Medellín',
    heroBody:
      'Diamond Spa is located in the heart of El Poblado, Medellín\'s most exclusive neighbourhood. We offer massages, facials, and hair removal in a private, calm environment. Bilingual staff, private rooms, and staggered appointments for complete discretion.',
    bookCta: 'Book a Session',
    whyTitle: 'Why El Poblado?',
    whyPoints: [
      { icon: 'location_on', title: 'Central Location', body: 'Minutes from Parque El Poblado, Línea Metro Aguacatala, and all major hotels in the neighbourhood.' },
      { icon: 'local_parking', title: 'Easy Parking', body: 'Parking available directly in front of the premises and in the same block. No parking stress.' },
      { icon: 'lock', title: 'Total Privacy', body: 'Private entrance, staggered appointments, and dedicated rooms for each client. Your session is exclusively yours.' },
      { icon: 'language', title: 'Bilingual Staff', body: 'Our team speaks Spanish and English. Perfect for travellers and expats visiting Medellín.' },
    ],
    servicesTitle: 'Services at Diamond Spa El Poblado',
    services: [
      { name: 'Relaxing Massage', desc: 'Gentle, rhythmic strokes to release tension and restore calm. From $120,000 COP.', href: '/services/relaxing' },
      { name: 'Deep Tissue Massage', desc: 'Targeted pressure to release deep muscle knots and chronic tension. From $130,000 COP.', href: '/services/deep-tissue' },
      { name: 'HydraFacial', desc: 'Medical-grade facial rejuvenation. Deeply cleanses, exfoliates, and hydrates.', href: '/services/hidrafacial' },
      { name: 'Sports Massage', desc: 'Recovery and performance for athletes and active professionals. From $130,000 COP.', href: '/services/sports' },
    ],
    hoursTitle: 'Opening Hours',
    addressTitle: 'Location',
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'Where is Diamond Spa in El Poblado?',
        answer: `Diamond Spa is located at ${SPA_ADDRESS.full}. We are minutes from Parque El Poblado and the Aguacatala metro station.`,
      },
      {
        question: 'What are the best spas in El Poblado, Medellín?',
        answer:
          'Diamond Spa is one of the top-rated spas in El Poblado with a 5.0 Google rating. We specialise in therapeutic massages, HydraFacial, and professional hair removal in a private and exclusive environment.',
      },
      {
        question: 'Do you offer massages in El Poblado for both men and women?',
        answer:
          'Yes. Diamond Spa is a spa for men and women in El Poblado, Medellín. All services are available to both genders in a professional and discreet environment.',
      },
      {
        question: 'Is there parking near Diamond Spa in El Poblado?',
        answer:
          'Yes. Parking is available directly in front of the premises and in the same block. There are also several paid parking lots nearby.',
      },
      {
        question: 'Do you need to book a spa in El Poblado in advance?',
        answer: `Yes, we recommend booking online or via WhatsApp (${SPA_ADDRESS.full}) to guarantee your preferred time slot.`,
      },
    ],
    ctaTitle: 'Book Your Session in El Poblado',
    ctaBody: 'Private arrival instructions sent 24 hours before. We look forward to welcoming you.',
  },
  es: {
    metaTitle: 'Spa en El Poblado Medellín — Diamond Spa',
    metaDesc:
      'El mejor spa en El Poblado, Medellín. ⭐ 4.9 · 90 reseñas en Google. Masajes, faciales y depilación. Cabinas privadas, personal bilingüe. Desde $120.000 COP — reserva ahora.',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Spa en El Poblado, Medellín',
    heroBody:
      'Diamond Spa está ubicado en el corazón de El Poblado, el barrio más exclusivo de Medellín. Ofrecemos masajes, faciales y depilación en un ambiente privado y tranquilo. Personal bilingüe, cabinas privadas y citas escalonadas para total discreción.',
    bookCta: 'Reservar una Cita',
    whyTitle: '¿Por qué El Poblado?',
    whyPoints: [
      { icon: 'location_on', title: 'Ubicación Central', body: 'A minutos del Parque El Poblado, la estación Metro Aguacatala y todos los hoteles principales del barrio.' },
      { icon: 'local_parking', title: 'Parqueo Fácil', body: 'Parqueadero disponible frente al local y en la misma cuadra. Sin estrés por parqueo.' },
      { icon: 'lock', title: 'Total Privacidad', body: 'Entrada privada, citas escalonadas y cabinas dedicadas para cada cliente. Tu sesión es exclusivamente tuya.' },
      { icon: 'language', title: 'Personal Bilingüe', body: 'Nuestro equipo habla español e inglés. Perfecto para viajeros y expats que visitan Medellín.' },
    ],
    servicesTitle: 'Servicios en Diamond Spa El Poblado',
    services: [
      { name: 'Masaje Relajante', desc: 'Movimientos suaves y rítmicos para liberar tensión y restaurar la calma. Desde $120.000 COP.', href: '/services/relaxing' },
      { name: 'Deep Tissue', desc: 'Presión dirigida para liberar nudos musculares profundos y tensión crónica. Desde $130.000 COP.', href: '/services/deep-tissue' },
      { name: 'HydraFacial', desc: 'Rejuvenecimiento facial de grado médico. Limpia, exfolia e hidrata en profundidad.', href: '/services/hidrafacial' },
      { name: 'Masaje Deportivo', desc: 'Recuperación y rendimiento para deportistas y profesionales activos. Desde $130.000 COP.', href: '/services/sports' },
    ],
    hoursTitle: 'Horarios de Atención',
    addressTitle: 'Ubicación',
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Dónde está Diamond Spa en El Poblado?',
        answer: `Diamond Spa está ubicado en ${SPA_ADDRESS.full}. Estamos a minutos del Parque El Poblado y la estación de metro Aguacatala.`,
      },
      {
        question: '¿Cuáles son los mejores spas en El Poblado, Medellín?',
        answer:
          'Diamond Spa es uno de los spas mejor valorados en El Poblado con una calificación de 5.0 en Google. Nos especializamos en masajes terapéuticos, HydraFacial y depilación profesional en un ambiente privado y exclusivo.',
      },
      {
        question: '¿Ofrecen masajes en El Poblado para hombres y mujeres?',
        answer:
          'Sí. Diamond Spa es un spa para hombres y mujeres en El Poblado, Medellín. Todos los servicios están disponibles para ambos géneros en un ambiente profesional y discreto.',
      },
      {
        question: '¿Hay parqueo cerca de Diamond Spa en El Poblado?',
        answer:
          'Sí. Hay parqueadero disponible frente al local y en la misma cuadra. También hay varios parqueaderos pagos en los alrededores.',
      },
      {
        question: '¿Hay que reservar con anticipación en un spa en El Poblado?',
        answer: `Sí, recomendamos reservar online o por WhatsApp para garantizar tu horario preferido.`,
      },
    ],
    ctaTitle: 'Reserva tu Cita en El Poblado',
    ctaBody: 'Instrucciones de llegada privadas enviadas 24 horas antes. Te esperamos.',
  },
} as const

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = (isLocale(params.lang) ? params.lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/spa-el-poblado'),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/spa-el-poblado', locale }),
  }
}

export default function SpaElPobladoPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const c = content[locale]

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={faqJsonLd([...c.faqs])} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
            {c.h1}
          </h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">{c.heroBody}</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="font-label text-primary text-sm">⭐ 5.0</span>
            <span className="font-body text-outline text-sm">· 31 {locale === 'es' ? 'reseñas en Google' : 'Google reviews'}</span>
          </div>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

        {/* Why El Poblado */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.whyPoints.map((p) => (
              <div key={p.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-2xl mb-4 block" aria-hidden="true">{p.icon}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase mb-2">{p.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.servicesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.services.map((svc) => (
              <div key={svc.name} className="bg-surface-container p-8 flex flex-col gap-3">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">{svc.name}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{svc.desc}</p>
                <Link
                  href={`/${locale}${svc.href}`}
                  className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                >
                  {locale === 'es' ? 'Ver detalles →' : 'View details →'}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href={`/${locale}/services`} className="text-zinc-400 hover:text-primary font-label text-sm tracking-widest uppercase transition-colors">
              {locale === 'es' ? 'Ver todos los servicios →' : 'View all services →'}
            </Link>
          </div>
        </section>

        {/* Hours & Address */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container p-8">
            <h2 className="font-headline text-xl text-on-surface tracking-tighter mb-6">{c.hoursTitle}</h2>
            {SPA_HOURS.map((h) => (
              <div key={h.display} className="flex justify-between items-center py-3 border-b border-outline-variant/20 last:border-0">
                <span className="font-label text-outline text-xs tracking-widest uppercase">{h.days[locale]}</span>
                <span className="font-body text-on-surface text-sm">{h.display}</span>
              </div>
            ))}
          </div>
          <div className="bg-surface-container p-8">
            <h2 className="font-headline text-xl text-on-surface tracking-tighter mb-6">{c.addressTitle}</h2>
            <p className="font-body text-on-surface text-sm leading-relaxed mb-4">{SPA_ADDRESS.full}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${SPA_ADDRESS.full}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">map</span>
              {locale === 'es' ? 'Ver en Google Maps →' : 'View on Google Maps →'}
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.faqTitle}</h2>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {c.faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                  {faq.question}
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform" aria-hidden="true">expand_more</span>
                </summary>
                <p className="mt-4 text-zinc-400 font-body text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-container p-12 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-6">{c.ctaTitle}</h2>
          <p className="text-zinc-400 font-body text-sm mb-8 max-w-md mx-auto">{c.ctaBody}</p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

      </main>
    </>
  )
}
