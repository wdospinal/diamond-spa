import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_PHONES, SPA_RATING } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const content = {
  en: {
    metaTitle: 'Spa Day in Medellín — Relaxation Packages | Diamond Spa El Poblado',
    metaDesc:
      `Treat yourself to a full spa day in Medellín, El Poblado. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} Google reviews. Massage + facial packages. Private rooms, bilingual staff. Book now.`,
    heroLabel: 'El Poblado, Medellín',
    h1: 'Spa Day in Medellín',
    heroBody:
      'Dedicate an entire day to your wellbeing at Diamond Spa, El Poblado. Combine a therapeutic massage with a professional facial treatment in one seamless, private session. Ideal for self-care days, couple experiences, or gifting.',
    bookCta: 'Book Your Spa Day',
    packagesTitle: 'Spa Day Packages',
    packages: [
      {
        name: 'Essential Day',
        desc: 'Relaxing massage (60 min) + Express facial (30 min). The perfect introduction to full-body restoration.',
        price: 'From $330,000 COP',
        duration: '1.5 hours',
      },
      {
        name: 'Diamond Day',
        desc: 'Deep tissue massage (90 min) + HydraFacial treatment (60 min). Our most comprehensive recovery experience.',
        price: 'From $540,000 COP',
        duration: '2.5 hours',
      },
      {
        name: 'Serenity Day',
        desc: 'Relaxing massage (60 min) + Deep Facial Cleanse (60 min). Stress relief from head to skin.',
        price: 'From $400,000 COP',
        duration: '2 hours',
      },
    ],
    whatToExpectTitle: 'What to Expect',
    steps: [
      { icon: 'calendar_month', title: 'Book Online', body: 'Select your package and preferred time. Confirmation is immediate.' },
      { icon: 'door_front', title: 'Private Arrival', body: 'Discreet entrance. No waiting room. Your room is prepared exclusively for you.' },
      { icon: 'spa', title: 'Your Session', body: 'Seamless transitions between treatments by our certified specialists.' },
      { icon: 'self_improvement', title: 'Leave Renewed', body: 'Take your time. No rush. Leave feeling balanced in body and mind.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'What is included in a spa day at Diamond Spa?',
        answer:
          'Each spa day package combines at least one massage and one facial treatment in a private room. All packages include robes, personal attention, and a quiet, exclusive environment.',
      },
      {
        question: 'How much does a spa day cost in Medellín?',
        answer:
          'Diamond Spa spa day packages start from $330,000 COP for the Essential Day (1.5 hours). Our most complete package, the Diamond Day, starts from $540,000 COP for 2.5 hours of treatments.',
      },
      {
        question: 'Do you offer spa days for couples?',
        answer:
          'Yes. We can arrange simultaneous or sequential treatments for couples. Contact our receptionist via WhatsApp to coordinate couple bookings.',
      },
      {
        question: 'Where is Diamond Spa located?',
        answer: `We are at ${SPA_ADDRESS.full} — minutes from Parque El Poblado. Parking available in front of the premises.`,
      },
      {
        question: 'Can I book a spa day as a gift?',
        answer:
          'Absolutely. Contact us via WhatsApp and we will arrange a gift booking. You can specify the date or leave it open for the recipient to choose.',
      },
    ],
    ctaTitle: 'Reserve Your Spa Day',
    ctaBody: 'Private arrival instructions sent 24 hours in advance. We look forward to welcoming you.',
  },
  es: {
    metaTitle: 'Día de Spa en Medellín — Paquetes Relajantes | Diamond Spa El Poblado',
    metaDesc:
      `Día de spa en Medellín, El Poblado. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas. Masaje + facial en un paquete. Cabinas privadas, personal bilingüe. Reserva ahora.`,
    heroLabel: 'El Poblado, Medellín',
    h1: 'Día de Spa en Medellín',
    heroBody:
      'Dedica un día completo a tu bienestar en Diamond Spa, El Poblado. Combina un masaje terapéutico con un tratamiento facial profesional en una experiencia continua y privada. Ideal para días de autocuidado, experiencias en pareja o como regalo.',
    bookCta: 'Reservar mi Día de Spa',
    packagesTitle: 'Paquetes de Día de Spa',
    packages: [
      {
        name: 'Día Esencial',
        desc: 'Masaje relajante (60 min) + Facial express (30 min). La introducción perfecta a la restauración completa del cuerpo.',
        price: 'Desde $330.000 COP',
        duration: '1.5 horas',
      },
      {
        name: 'Día Diamond',
        desc: 'Masaje Deep Tissue (90 min) + HydraFacial (60 min). Nuestra experiencia de recuperación más completa.',
        price: 'Desde $540.000 COP',
        duration: '2.5 horas',
      },
      {
        name: 'Día Serenidad',
        desc: 'Masaje relajante (60 min) + Limpieza Facial Profunda (60 min). Alivio del estrés de cabeza a piel.',
        price: 'Desde $400.000 COP',
        duration: '2 horas',
      },
    ],
    whatToExpectTitle: 'Qué esperar',
    steps: [
      { icon: 'calendar_month', title: 'Reserva Online', body: 'Elige tu paquete y horario preferido. La confirmación es inmediata.' },
      { icon: 'door_front', title: 'Llegada Privada', body: 'Entrada discreta. Sin sala de espera. Tu cabina preparada exclusivamente para ti.' },
      { icon: 'spa', title: 'Tu Sesión', body: 'Transiciones fluidas entre tratamientos por nuestras especialistas certificadas.' },
      { icon: 'self_improvement', title: 'Sal Renovado', body: 'Sin prisa. Sal sintiéndote equilibrado en cuerpo y mente.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Qué incluye el día de spa en Diamond Spa?',
        answer:
          'Cada paquete combina al menos un masaje y un tratamiento facial en cabina privada. Todos los paquetes incluyen atención personalizada y un entorno tranquilo y exclusivo.',
      },
      {
        question: '¿Cuánto cuesta un día de spa en Medellín?',
        answer:
          'Los paquetes de día de spa en Diamond Spa comienzan desde $330.000 COP para el Día Esencial (1.5 horas). Nuestro paquete más completo, el Día Diamond, comienza desde $540.000 COP por 2.5 horas de tratamientos.',
      },
      {
        question: '¿Ofrecen días de spa para parejas?',
        answer:
          'Sí. Podemos coordinar tratamientos simultáneos o consecutivos para parejas. Contáctanos por WhatsApp para organizar una reserva en pareja.',
      },
      {
        question: '¿Dónde está ubicado Diamond Spa?',
        answer: `Estamos en ${SPA_ADDRESS.full} — a minutos del Parque El Poblado. Parqueadero disponible frente al local.`,
      },
      {
        question: '¿Puedo reservar un día de spa como regalo?',
        answer:
          'Por supuesto. Escríbenos por WhatsApp y organizamos una reserva de regalo. Puedes especificar la fecha o dejarla abierta para que el destinatario elija.',
      },
    ],
    ctaTitle: 'Reserva tu Día de Spa',
    ctaBody: 'Instrucciones de llegada privadas enviadas 24 horas antes. Te esperamos.',
  },
} as const

const FAQS_SCHEMA_EN = [
  { question: 'What is included in a spa day at Diamond Spa?', answer: 'Each spa day package combines at least one massage and one facial treatment in a private room. All packages include robes, personal attention, and a quiet, exclusive environment.' },
  { question: 'How much does a spa day cost in Medellín?', answer: 'Diamond Spa spa day packages start from $330,000 COP for the Essential Day (1.5 hours). Our most complete package, the Diamond Day, starts from $540,000 COP for 2.5 hours of treatments.' },
  { question: 'Do you offer spa days for couples?', answer: 'Yes. We can arrange simultaneous or sequential treatments for couples. Contact our receptionist via WhatsApp to coordinate couple bookings.' },
  { question: 'Where is Diamond Spa located?', answer: `We are at ${SPA_ADDRESS.full} — minutes from Parque El Poblado. Parking available in front of the premises.` },
  { question: 'Can I book a spa day as a gift?', answer: 'Absolutely. Contact us via WhatsApp and we will arrange a gift booking. You can specify the date or leave it open for the recipient to choose.' },
]

const FAQS_SCHEMA_ES = [
  { question: '¿Qué incluye el día de spa en Diamond Spa?', answer: 'Cada paquete combina al menos un masaje y un tratamiento facial en cabina privada. Todos los paquetes incluyen atención personalizada y un entorno tranquilo y exclusivo.' },
  { question: '¿Cuánto cuesta un día de spa en Medellín?', answer: 'Los paquetes de día de spa en Diamond Spa comienzan desde $330.000 COP para el Día Esencial (1.5 horas). Nuestro paquete más completo, el Día Diamond, comienza desde $540.000 COP por 2.5 horas de tratamientos.' },
  { question: '¿Ofrecen días de spa para parejas?', answer: 'Sí. Podemos coordinar tratamientos simultáneos o consecutivos para parejas. Contáctanos por WhatsApp para organizar una reserva en pareja.' },
  { question: '¿Dónde está ubicado Diamond Spa?', answer: `Estamos en ${SPA_ADDRESS.full} — a minutos del Parque El Poblado. Parqueadero disponible frente al local.` },
  { question: '¿Puedo reservar un día de spa como regalo?', answer: 'Por supuesto. Escríbenos por WhatsApp y organizamos una reserva de regalo. Puedes especificar la fecha o dejarla abierta para que el destinatario elija.' },
]

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/dia-de-spa'),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/dia-de-spa', locale }),
  }
}

export default async function DiaDeSpaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const c = content[locale]
  const faqs = locale === 'en' ? FAQS_SCHEMA_EN : FAQS_SCHEMA_ES

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
            {c.h1}
          </h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">{c.heroBody}</p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

        {/* Packages */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {c.packagesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.packages.map((pkg) => (
              <div key={pkg.name} className="bg-surface-container p-8 flex flex-col gap-4">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">{pkg.name}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{pkg.desc}</p>
                <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
                  <span className="font-label text-primary text-xs tracking-widest">{pkg.price}</span>
                  <span className="font-label text-outline text-xs tracking-widest">{pkg.duration}</span>
                </div>
                <Link
                  href={`/${locale}/book`}
                  className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                >
                  {c.bookCta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* What to Expect */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {c.whatToExpectTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {c.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-3">
                <span className="font-label text-outline text-xs tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">{step.icon}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase">{step.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{step.body}</p>
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
