import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_PHONES } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const content = {
  en: {
    metaTitle: 'Best Massage in Medellín Near You ⭐ 5.0 — El Poblado | Diamond Spa',
    metaDesc:
      'Massage near El Poblado, Medellín. ⭐ 5.0 · 90 Google reviews. Relaxing, deep tissue, sports & 4-hands. Private rooms, bilingual staff. From $120,000 COP — book online.',
    heroLabel: 'Massage · El Poblado, Medellín',
    h1: 'Massage in Medellín',
    heroBody:
      'Diamond Spa is Medellín\'s premier massage destination in El Poblado. If you\'re searching for a massage near you in El Poblado or Medellín\'s city center, we\'re minutes away from Parque El Poblado. Therapeutic and relaxation massages for men and women in a private, professional environment with bilingual staff.',
    bookCta: 'Book a Massage',
    ratingBadge: '⭐ 4.9 · 90 Google reviews',
    massagesTitle: 'Our Massages in Medellín',
    massages: [
      {
        name: 'Relaxing Massage',
        desc: 'Long, gentle strokes to release built-up tension and restore a deep sense of calm. Ideal for stress relief and mental reset.',
        price: 'From $120,000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/relaxing',
      },
      {
        name: 'Deep Tissue Massage',
        desc: 'Slow, firm pressure targeting deep muscle layers. Perfect for chronic pain, posture issues, and athletic recovery.',
        price: 'From $130,000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/deep-tissue',
      },
      {
        name: 'Sports Massage',
        desc: 'Technique-focused bodywork for active people. Enhances performance, prevents injury, and speeds up recovery.',
        price: 'From $130,000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/sports',
      },
      {
        name: '4-Hands Massage',
        desc: 'Two therapists working in synchrony. Double the coverage, double the relaxation. A truly immersive experience.',
        price: 'From $220,000 COP',
        durations: '60 / 90 min',
        href: '/services/four-hands',
      },
    ],
    whyTitle: 'Why Diamond Spa for Massages in Medellín?',
    whyPoints: [
      { icon: 'verified_user', title: 'Certified Therapists', body: 'All our massage therapists hold professional credentials with 5+ years of experience in therapeutic bodywork.' },
      { icon: 'lock', title: 'Private Rooms', body: 'Every session takes place in a dedicated private room. No shared spaces, no noise interruptions.' },
      { icon: 'language', title: 'Bilingual Service', body: 'Our team speaks Spanish and English. Perfect for travellers and expats in Medellín.' },
      { icon: 'location_on', title: 'El Poblado Location', body: 'Located in El Poblado — Medellín\'s most vibrant neighborhood. Easy access, parking available.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'Where can I get a massage in Medellín?',
        answer: `Diamond Spa offers professional massages in El Poblado, Medellín at ${SPA_ADDRESS.full}. We are minutes from Parque El Poblado with parking available.`,
      },
      {
        question: 'How much does a massage cost in Medellín?',
        answer:
          'Massages at Diamond Spa Medellín start from $120,000 COP for a 30-minute relaxing massage. 60-minute sessions start from $200,000 COP and 90-minute sessions from $260,000 COP. Deep tissue and sports massages are priced from $130,000 COP for 30 minutes.',
      },
      {
        question: 'Is Diamond Spa a good massage place in Medellín?',
        answer:
          'Diamond Spa has a 5.0 Google rating from 31 reviews — making it one of the top-rated massage spas in Medellín. We specialise in therapeutic bodywork in a private, exclusive environment.',
      },
      {
        question: 'Do you offer massages near El Poblado?',
        answer: `Yes. Diamond Spa is located in El Poblado at ${SPA_ADDRESS.full}. We are 5 minutes from Parque El Poblado and the Aguacatala metro station.`,
      },
      {
        question: 'Do I need to book a massage in Medellín in advance?',
        answer: `Yes, booking in advance is recommended to guarantee your preferred time. Book online or contact us via WhatsApp at ${SPA_PHONES[0].display}.`,
      },
    ],
    ctaTitle: 'Book Your Massage in Medellín',
    ctaBody: 'Private arrival instructions sent 24 hours before your session.',
  },
  es: {
    metaTitle: 'Masaje en Medellín — Relajante y Deep Tissue | Diamond Spa El Poblado',
    metaDesc:
      'El mejor masaje en Medellín, El Poblado. ⭐ 4.9 · 90 reseñas en Google. Relajante, deep tissue, deportivo y 4 manos. Cabinas privadas, personal bilingüe. Desde $120.000 COP.',
    heroLabel: 'Masajes · El Poblado, Medellín',
    h1: 'Masajes en Medellín',
    heroBody:
      'Diamond Spa es el destino de masajes premium de Medellín en El Poblado. Ofrecemos masajes terapéuticos y de relajación para hombres y mujeres en un ambiente privado y profesional. Personal bilingüe, cabinas privadas y citas escalonadas para total discreción.',
    bookCta: 'Reservar un Masaje',
    ratingBadge: '⭐ 4.9 · 90 reseñas en Google',
    massagesTitle: 'Nuestros Masajes en Medellín',
    massages: [
      {
        name: 'Masaje Relajante',
        desc: 'Movimientos largos y suaves para liberar la tensión acumulada y restaurar una profunda sensación de calma. Ideal para alivio del estrés.',
        price: 'Desde $120.000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/relaxing',
      },
      {
        name: 'Deep Tissue',
        desc: 'Presión lenta y firme sobre las capas musculares profundas. Perfecto para dolor crónico, problemas posturales y recuperación atlética.',
        price: 'Desde $130.000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/deep-tissue',
      },
      {
        name: 'Masaje Deportivo',
        desc: 'Trabajo corporal enfocado para personas activas. Mejora el rendimiento, previene lesiones y acelera la recuperación.',
        price: 'Desde $130.000 COP',
        durations: '30 / 60 / 90 min',
        href: '/services/sports',
      },
      {
        name: '4 Manos',
        desc: 'Dos terapeutas trabajando en sincronía. El doble de cobertura, el doble de relajación. Una experiencia verdaderamente inmersiva.',
        price: 'Desde $220.000 COP',
        durations: '60 / 90 min',
        href: '/services/four-hands',
      },
    ],
    whyTitle: '¿Por qué Diamond Spa para masajes en Medellín?',
    whyPoints: [
      { icon: 'verified_user', title: 'Terapeutas Certificados', body: 'Todas nuestras masoterapeutas tienen credenciales profesionales con 5+ años de experiencia en trabajo corporal terapéutico.' },
      { icon: 'lock', title: 'Cabinas Privadas', body: 'Cada sesión se realiza en una cabina privada dedicada. Sin espacios compartidos, sin interrupciones.' },
      { icon: 'language', title: 'Servicio Bilingüe', body: 'Nuestro equipo habla español e inglés. Perfecto para viajeros y expats en Medellín.' },
      { icon: 'location_on', title: 'Ubicación El Poblado', body: 'Ubicados en El Poblado — el barrio más vibrante de Medellín. Fácil acceso, parqueo disponible.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Dónde puedo conseguir un masaje en Medellín?',
        answer: `Diamond Spa ofrece masajes profesionales en El Poblado, Medellín en ${SPA_ADDRESS.full}. Estamos a minutos del Parque El Poblado con parqueadero disponible.`,
      },
      {
        question: '¿Cuánto cuesta un masaje en Medellín?',
        answer:
          'Los masajes en Diamond Spa Medellín comienzan desde $120.000 COP por un masaje relajante de 30 minutos. Las sesiones de 60 minutos comienzan desde $200.000 COP y las de 90 minutos desde $260.000 COP. Los masajes deep tissue y deportivo tienen precio desde $130.000 COP por 30 minutos.',
      },
      {
        question: '¿Es Diamond Spa un buen lugar para masajes en Medellín?',
        answer:
          'Diamond Spa tiene una calificación de 5.0 en Google con 31 reseñas — uno de los spas de masajes mejor valorados en Medellín. Nos especializamos en trabajo corporal terapéutico en un ambiente privado y exclusivo.',
      },
      {
        question: '¿Ofrecen masajes cerca de El Poblado?',
        answer: `Sí. Diamond Spa está ubicado en El Poblado en ${SPA_ADDRESS.full}. Estamos a 5 minutos del Parque El Poblado y la estación de metro Aguacatala.`,
      },
      {
        question: '¿Hay que reservar un masaje en Medellín con anticipación?',
        answer: `Sí, recomendamos reservar con anticipación para garantizar tu horario preferido. Reserva online o contáctanos por WhatsApp al ${SPA_PHONES[0].display}.`,
      },
    ],
    ctaTitle: 'Reserva tu Masaje en Medellín',
    ctaBody: 'Instrucciones de llegada privadas enviadas 24 horas antes de tu sesión.',
  },
} as const

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = (isLocale(params.lang) ? params.lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/massage-medellin'),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/massage-medellin', locale }),
  }
}

export default function MassageMedellinPage({ params }: { params: { lang: string } }) {
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
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-6">{c.heroBody}</p>
          <div className="flex items-center gap-2 mb-8">
            <span className="font-label text-primary text-sm">{c.ratingBadge}</span>
          </div>
          <Link
            href={`/${locale}/book?service=relaxing`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

        {/* Massages */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.massagesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.massages.map((m) => (
              <div key={m.name} className="bg-surface-container p-8 flex flex-col gap-3">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">{m.name}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{m.desc}</p>
                <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                  <span className="font-label text-primary text-xs tracking-widest">{m.price}</span>
                  <span className="font-label text-outline text-xs tracking-widest">{m.durations}</span>
                </div>
                <Link
                  href={`/${locale}${m.href}`}
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

        {/* Why Diamond Spa */}
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
            href={`/${locale}/book?service=relaxing`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

      </main>
    </>
  )
}
