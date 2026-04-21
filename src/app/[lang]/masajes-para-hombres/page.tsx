import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS } from '@/lib/spa'

export const dynamic = 'force-static'

const ES_FAQS = [
  {
    question: '¿Hacen masajes para hombres en Medellín?',
    answer: `Sí, en Diamond Spa ofrecemos masajes exclusivos para hombres en El Poblado, Medellín: relajante, deep tissue, deportivo, 4 manos y más. Nuestro ambiente es privado y discreto, con entrada independiente y citas escalonadas.`,
  },
  {
    question: '¿Cuánto cuesta un masaje para hombres en Medellín?',
    answer: 'Los masajes para hombres en Diamond Spa comienzan desde $120.000 COP por 30 minutos. Las sesiones de 60 y 90 minutos tienen precios desde $200.000 y $260.000 COP respectivamente.',
  },
  {
    question: '¿Dónde están ubicados?',
    answer: `Estamos en ${SPA_ADDRESS.full} — a 5 minutos del Parque El Poblado. Contamos con zona de parqueo frente al local.`,
  },
  {
    question: '¿Necesito reservar con anticipación?',
    answer: 'Sí, recomendamos reservar online con anticipación para garantizar disponibilidad. Las instrucciones de llegada privadas se envían 24 horas antes de tu cita.',
  },
  {
    question: '¿Los masajes son solo para hombres?',
    answer: 'Diamond Spa es un spa para hombres y mujeres en Medellín. Todos nuestros servicios están disponibles para ambos géneros en un entorno profesional y discreto.',
  },
]

const EN_FAQS = [
  {
    question: 'Do you offer massages for men in Medellín?',
    answer: `Yes, Diamond Spa offers exclusive massages for men in El Poblado, Medellín: relaxing, deep tissue, sports, 4-hands and more. Our environment is private and discreet, with a private entrance and staggered appointments.`,
  },
  {
    question: 'How much does a massage for men cost in Medellín?',
    answer: 'Massages for men at Diamond Spa start from $120,000 COP for 30 minutes. 60 and 90-minute sessions are priced from $200,000 and $260,000 COP respectively.',
  },
  {
    question: 'Where are you located?',
    answer: `We are at ${SPA_ADDRESS.full} — 5 minutes from Parque El Poblado. Parking is available in front of the premises.`,
  },
  {
    question: 'Do I need to book in advance?',
    answer: 'Yes, we recommend booking online in advance to guarantee availability. Private arrival instructions are sent 24 hours before your appointment.',
  },
  {
    question: 'Are massages only for men?',
    answer: 'Diamond Spa is a spa for men and women in Medellín. All our services are available to both genders in a professional and discreet environment.',
  },
]

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const title = locale === 'en'
    ? 'Massages for Men in Medellín — Diamond Spa El Poblado'
    : 'Masajes para Hombres en Medellín — Diamond Spa El Poblado'
  const description = locale === 'en'
    ? 'Relaxing, deep tissue, sports and 4-hands massages for men in El Poblado, Medellín. Private and professional environment. From $120,000 COP.'
    : 'Masajes relajantes, deep tissue, deportivos y de 4 manos para hombres en El Poblado, Medellín. Ambiente privado y profesional. Desde $120.000 COP.'
  return {
    title,
    description,
    alternates: buildAlternates('/masajes-para-hombres'),
    openGraph: buildOpenGraph({ title, description, path: '/masajes-para-hombres', locale, imageAlt: 'Masajes para Hombres en Medellín — Diamond Spa' }),
  }
}

const FEATURED_MASSAGES = [
  { id: 'relaxing',    es: 'Masaje Relajante',       en: 'Relaxing Massage',    descEs: 'Reduce el cortisol e induce relajación profunda. Ideal para descomprimir después de jornadas exigentes.', descEn: 'Reduces cortisol and induces deep relaxation. Ideal for decompressing after demanding days.' },
  { id: 'deep-tissue', es: 'Masaje Deep Tissue',     en: 'Deep Tissue Massage', descEs: 'Liberación dirigida para tensión muscular crónica y recuperación atlética. Técnicas de alta presión.', descEn: 'Targeted release for chronic muscle tension and athletic recovery. High-pressure techniques.' },
  { id: 'sports',      es: 'Masaje Deportivo',       en: 'Sports Massage',      descEs: 'Diseñado para deportistas y personas activas. Mejora el rendimiento y acelera la recuperación.', descEn: 'Designed for athletes and active people. Improves performance and speeds recovery.' },
  { id: 'four-hands',  es: 'Masaje 4 Manos',         en: '4-Hands Massage',     descEs: 'Dos terapeutas trabajando en sincronía. Una experiencia de relajación sin comparación.', descEn: 'Two therapists working in sync. An unparalleled relaxation experience.' },
]

export default function MasajesParaHombresPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const isEs = locale === 'es'

  const faqs = isEs ? ES_FAQS : EN_FAQS

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">
            {isEs ? 'El Poblado, Medellín' : 'El Poblado, Medellín'}
          </p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
            {isEs ? 'Masajes para Hombres en Medellín' : 'Massages for Men in Medellín'}
          </h1>
          <p className="text-slate-400 font-body text-lg leading-relaxed max-w-2xl mb-8">
            {isEs
              ? 'Diamond Spa ofrece masajes terapéuticos y de relajación para hombres en El Poblado, Medellín. Nuestro equipo de especialistas combina técnicas clínicas con un entorno de lujo privado — sin aromas florales, sin ruido. Solo recuperación profunda. Personal bilingüe, entrada privada y citas escalonadas para total anonimato.'
              : 'Diamond Spa offers therapeutic and relaxation massages for men in El Poblado, Medellín. Our team of specialists combines clinical techniques with a private luxury environment — no floral scents, no noise. Just deep recovery. Bilingual staff, private entrance, and staggered appointments for complete anonymity.'}
          </p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {isEs ? 'Reservar Masaje' : 'Book a Massage'}
          </Link>
        </section>

        {/* Featured massages */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {isEs ? 'Nuestros Masajes para Hombres' : 'Our Massages for Men'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_MASSAGES.map((m) => (
              <div key={m.id} className="bg-surface-container p-8 flex flex-col gap-4">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">
                  {isEs ? m.es : m.en}
                </h3>
                <p className="text-slate-400 font-body text-sm leading-relaxed flex-1">
                  {isEs ? m.descEs : m.descEn}
                </p>
                <div className="flex gap-4 mt-2">
                  <Link
                    href={`/${locale}/services/${m.id}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {isEs ? 'Ver detalles' : 'View details'}
                  </Link>
                  <Link
                    href={`/${locale}/book?service=${m.id}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {isEs ? 'Reservar' : 'Book'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={`/${locale}/services`}
              className="text-slate-400 hover:text-primary font-label text-sm tracking-widest uppercase transition-colors"
            >
              {isEs ? 'Ver todos los servicios →' : 'View all services →'}
            </Link>
          </div>
        </section>

        {/* Why Diamond Spa */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {isEs ? '¿Por qué Diamond Spa?' : 'Why Diamond Spa?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'lock',
                titleEs: 'Discreción Absoluta',
                titleEn: 'Absolute Discretion',
                bodyEs: 'Entrada privada y citas escalonadas. Nunca te encontrarás con otro cliente.',
                bodyEn: 'Private entrance and staggered appointments. You will never encounter another client.',
              },
              {
                icon: 'verified_user',
                titleEs: 'Personal Profesional',
                titleEn: 'Professional Staff',
                bodyEs: 'Especialistas certificados en técnicas terapéuticas y cosméticas de alto nivel.',
                bodyEn: 'Certified specialists in high-level therapeutic and cosmetic techniques.',
              },
              {
                icon: 'language',
                titleEs: 'Bilingüe',
                titleEn: 'Bilingual',
                bodyEs: 'Personal de habla inglesa. Atendemos con la misma excelencia en cualquier idioma.',
                bodyEn: 'English-speaking staff. We serve with the same excellence in any language.',
              },
            ].map((p) => (
              <div key={p.icon} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{p.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">
                  {isEs ? p.titleEs : p.titleEn}
                </h3>
                <p className="text-slate-400 font-body text-sm leading-relaxed">
                  {isEs ? p.bodyEs : p.bodyEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                  {faq.question}
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-400 font-body text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-container p-12 text-center">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">
            {isEs ? 'Acceso Exclusivo' : 'Exclusive Access'}
          </p>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-6">
            {isEs ? 'Reserva tu Masaje Hoy' : 'Book Your Massage Today'}
          </h2>
          <p className="text-slate-400 font-body text-sm mb-8 max-w-md mx-auto">
            {isEs
              ? 'Instrucciones de llegada privadas enviadas 24 horas antes de tu cita.'
              : 'Private arrival instructions sent 24 hours before your session.'}
          </p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {isEs ? 'Reservar Masaje' : 'Book a Massage'}
          </Link>
        </section>

      </main>
    </>
  )
}
