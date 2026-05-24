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
    metaTitle: 'HydraFacial in Medellín — Diamond Spa El Poblado',
    metaDesc:
      `Professional HydraFacial in El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} Google reviews. Deep cleanse, extraction & vitamin hydration in one session. $350,000 COP — book now.`,
    ogImageAlt: 'HydraFacial in Medellín — Diamond Spa',
    heroLabel: 'Facials · El Poblado, Medellín',
    h1: 'HydraFacial in Medellín',
    heroBody:
      'Diamond Spa offers professional HydraFacial treatments in El Poblado, Medellín. A 3-step medical-grade facial that deeply cleanses, extracts impurities, and infuses your skin with hyaluronic acid and antioxidants — all in one session. Visible results from the very first treatment.',
    bookCta: 'Book HydraFacial',
    processTitle: 'How HydraFacial Works',
    steps: [
      { step: '01', title: 'Cleanse & Exfoliate', body: 'Gentle vortex suction removes dead skin cells and opens pores, preparing the skin for deeper treatment.' },
      { step: '02', title: 'Extract', body: 'Painless automated extraction removes blackheads, sebum, and impurities without manual pressure.' },
      { step: '03', title: 'Hydrate', body: 'Hyaluronic acid, peptides, and antioxidants are infused deep into the skin for lasting glow and firmness.' },
    ],
    benefitsTitle: 'HydraFacial Benefits',
    benefits: [
      { icon: 'water_drop', title: 'Intense Hydration', body: 'Medical-grade hyaluronic acid penetrates deep into the skin, restoring moisture balance at a cellular level.' },
      { icon: 'brightness_high', title: 'Instant Glow', body: 'Visible luminosity and smoothness from the very first session — no downtime required.' },
      { icon: 'filter_vintage', title: 'Pore Cleansing', body: 'Automated extraction removes blackheads and congestion without irritation or redness.' },
      { icon: 'shield', title: 'Anti-aging', body: 'Antioxidants and peptides protect against free radical damage and support collagen production.' },
    ],
    forWhomTitle: 'Who is HydraFacial For?',
    forWhom: [
      { icon: 'face', title: 'Oily & Acne-Prone Skin', body: 'Deep pore cleansing and oil regulation without stripping or irritating the skin.' },
      { icon: 'face_3', title: 'Dry & Dehydrated Skin', body: 'Intensive hydration that restores the skin\'s moisture barrier from within.' },
      { icon: 'person', title: 'Men', body: 'Reduces shaving irritation, ingrown hairs, and urban pollution damage. Suitable for all skin types.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'What is HydraFacial and how does it work?',
        answer: 'HydraFacial is a medical-grade facial treatment that combines deep cleansing, exfoliation, automated extraction, and vitamin infusion in one session. It uses a patented vortex suction technology to remove impurities while simultaneously hydrating the skin.',
      },
      {
        question: 'How much does a HydraFacial cost in Medellín?',
        answer: 'HydraFacial at Diamond Spa costs $350,000 COP per session. This includes deep cleansing, extraction, and hyaluronic acid + antioxidant infusion.',
      },
      {
        question: 'How often should I get a HydraFacial?',
        answer: 'For optimal results, we recommend monthly HydraFacial sessions. After the initial treatment, you can maintain healthy, glowing skin with regular monthly appointments.',
      },
      {
        question: 'Is HydraFacial suitable for men?',
        answer: 'Yes. HydraFacial is highly effective for men, especially to treat shaving irritation, ingrown hairs, enlarged pores, and urban pollution damage. No downtime — you can return to your routine immediately.',
      },
      {
        question: 'Where can I get a HydraFacial in Medellín?',
        answer: `Diamond Spa offers HydraFacial in Medellín at ${SPA_ADDRESS.full}, El Poblado. Book online or write to us on WhatsApp ${SPA_PHONES[1].display}.`,
      },
    ],
    ctaTitle: 'Book Your HydraFacial Today',
    ctaBody: 'Medical-grade results in a private, exclusive environment. Certified cosmetologists at El Poblado.',
  },
  es: {
    metaTitle: 'HydraFacial en Medellín — Diamond Spa El Poblado',
    metaDesc:
      `HydraFacial profesional en El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas en Google. Limpieza profunda, extracción e hidratación con vitaminas en una sesión. $350.000 COP — reserva ahora.`,
    ogImageAlt: 'HydraFacial en Medellín — Diamond Spa',
    heroLabel: 'Faciales · El Poblado, Medellín',
    h1: 'HydraFacial en Medellín',
    heroBody:
      'Diamond Spa ofrece tratamientos HydraFacial profesionales en El Poblado, Medellín. Un facial de grado médico en 3 pasos que limpia profundamente, extrae impurezas e infunde tu piel con ácido hialurónico y antioxidantes — todo en una sola sesión. Resultados visibles desde el primer tratamiento.',
    bookCta: 'Reservar HydraFacial',
    processTitle: 'Cómo Funciona el HydraFacial',
    steps: [
      { step: '01', title: 'Limpiar y Exfoliar', body: 'Una suave succión en vórtice elimina las células muertas y abre los poros, preparando la piel para un tratamiento más profundo.' },
      { step: '02', title: 'Extraer', body: 'Extracción automatizada e indolora que elimina puntos negros, sebo e impurezas sin presión manual.' },
      { step: '03', title: 'Hidratar', body: 'Ácido hialurónico, péptidos y antioxidantes se infunden profundamente en la piel para un brillo y firmeza duraderos.' },
    ],
    benefitsTitle: 'Beneficios del HydraFacial',
    benefits: [
      { icon: 'water_drop', title: 'Hidratación Intensa', body: 'El ácido hialurónico de grado médico penetra profundamente en la piel, restaurando el equilibrio de humedad a nivel celular.' },
      { icon: 'brightness_high', title: 'Brillo Inmediato', body: 'Luminosidad y suavidad visibles desde la primera sesión — sin tiempo de recuperación.' },
      { icon: 'filter_vintage', title: 'Limpieza de Poros', body: 'La extracción automatizada elimina puntos negros y congestión sin irritación ni enrojecimiento.' },
      { icon: 'shield', title: 'Antienvejecimiento', body: 'Los antioxidantes y péptidos protegen contra el daño de los radicales libres y apoyan la producción de colágeno.' },
    ],
    forWhomTitle: '¿Para Quién es el HydraFacial?',
    forWhom: [
      { icon: 'face', title: 'Piel Grasa y con Acné', body: 'Limpieza profunda de poros y regulación del sebo sin resecar ni irritar la piel.' },
      { icon: 'face_3', title: 'Piel Seca y Deshidratada', body: 'Hidratación intensiva que restaura la barrera de humedad de la piel desde adentro.' },
      { icon: 'person', title: 'Hombres', body: 'Reduce la irritación por afeitado, los pelos encarnados y el daño por contaminación urbana. Apto para todo tipo de piel.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Qué es el HydraFacial y cómo funciona?',
        answer: 'HydraFacial es un tratamiento facial de grado médico que combina limpieza profunda, exfoliación, extracción automatizada e infusión de vitaminas en una sola sesión. Usa tecnología de succión en vórtice patentada para eliminar impurezas mientras hidrata simultáneamente la piel.',
      },
      {
        question: '¿Cuánto cuesta un HydraFacial en Medellín?',
        answer: 'El HydraFacial en Diamond Spa tiene un precio de $350.000 COP por sesión. Incluye limpieza profunda, extracción e infusión de ácido hialurónico y antioxidantes.',
      },
      {
        question: '¿Con qué frecuencia debo hacerme un HydraFacial?',
        answer: 'Para resultados óptimos, recomendamos sesiones mensuales de HydraFacial. Después del tratamiento inicial, puedes mantener una piel sana y radiante con citas mensuales regulares.',
      },
      {
        question: '¿El HydraFacial es apto para hombres?',
        answer: 'Sí. El HydraFacial es muy efectivo para hombres, especialmente para tratar la irritación por afeitado, pelos encarnados, poros dilatados y el daño por contaminación urbana. Sin tiempo de recuperación — puedes retomar tu rutina de inmediato.',
      },
      {
        question: '¿Dónde puedo hacerme un HydraFacial en Medellín?',
        answer: `Diamond Spa ofrece HydraFacial en Medellín en ${SPA_ADDRESS.full}, El Poblado. Reserva online o escríbenos al WhatsApp ${SPA_PHONES[1].display}.`,
      },
    ],
    ctaTitle: 'Reserva tu HydraFacial Hoy',
    ctaBody: 'Resultados de grado médico en un entorno privado y exclusivo. Cosmetólogas certificadas en El Poblado.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/hydrafacial-medellin'),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/hydrafacial-medellin', locale, imageAlt: c.ogImageAlt }),
  }
}

export default async function HydraFacialMedellinPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
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
          <Link
            href={`/${locale}/book?service=hidrafacial`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

        {/* Process */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.processTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.steps.map((s) => (
              <div key={s.step} className="flex flex-col gap-3">
                <span className="font-label text-primary text-2xl font-bold">{s.step}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase">{s.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.benefitsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.benefits.map((b) => (
              <div key={b.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-2xl mb-4 block" aria-hidden="true">{b.icon}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase mb-2">{b.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For whom */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.forWhomTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.forWhom.map((f) => (
              <div key={f.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{f.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">{f.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{f.body}</p>
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
            href={`/${locale}/book?service=hidrafacial`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

      </main>
    </>
  )
}
