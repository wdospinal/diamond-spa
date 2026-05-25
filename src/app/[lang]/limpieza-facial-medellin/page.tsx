import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_RATING } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const content = {
  en: {
    metaTitle: 'Facial Cleansing in Medellín — Deep, HydraFacial & Basic | Diamond Spa El Poblado',
    metaDesc:
      `Facial cleansing in El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reviews. Deep ($250k), HydraFacial ($350k) & basic ($150k). Certified cosmetologists — book now.`,
    heroLabel: 'Facials · El Poblado, Medellín',
    h1: 'Facial Cleansing in Medellín',
    heroBody:
      'Diamond Spa offers professional facial cleansing treatments in El Poblado, Medellín. Our certified cosmetologists use medical-grade products to deeply cleanse, exfoliate, and hydrate your skin. From express facials to HydraFacial treatments.',
    bookCta: 'Book a Facial',
    benefitsTitle: 'Benefits of Professional Facial Cleansing',
    benefits: [
      { icon: 'water_drop', title: 'Deep Hydration', body: 'Professional formulas penetrate deeper than at-home products, restoring moisture balance at a cellular level.' },
      { icon: 'filter_vintage', title: 'Pore Cleansing', body: 'Remove blackheads, sebum, and impurities with clinical extraction techniques.' },
      { icon: 'brightness_high', title: 'Luminous Skin', body: 'Medical-grade exfoliation removes dead cells, revealing brighter, smoother skin immediately after the session.' },
      { icon: 'shield', title: 'Skin Protection', body: 'Strengthen your skin barrier and reduce sensitivity caused by urban pollution, sun exposure, and shaving.' },
    ],
    treatmentsTitle: 'Our Facial Treatments',
    treatments: [
      { name: 'HydraFacial', desc: 'Our most advanced facial treatment. 3-step process: deep cleanse, gentle acid exfoliation, and intense hydration with hyaluronic acid and antioxidants.', href: '/hydrafacial-medellin' },
      { name: 'Deep Facial Cleanse', desc: 'Manual and mechanical extraction of impurities, blackheads, and excess sebum. Ideal for oily or congested skin.', href: '/services/limpieza-facial-profunda' },
      { name: 'Basic Facial Cleanse', desc: 'A quick yet effective cleanse and hydration session. Perfect for regular maintenance or as part of a spa day.', href: '/services/limpieza-facial-basica' },
    ],
    processTitle: 'Our Process',
    steps: [
      { step: '01', title: 'Skin Analysis', body: 'We assess your skin type and condition to personalise the treatment.' },
      { step: '02', title: 'Deep Cleanse', body: 'Removal of makeup residue, sebum, and surface impurities.' },
      { step: '03', title: 'Exfoliation', body: 'Gentle enzymatic or mechanical exfoliation to remove dead cells.' },
      { step: '04', title: 'Treatment', body: 'Targeted serums and masks selected for your skin concerns.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'Where can I get a professional facial cleansing in Medellín?',
        answer: `Diamond Spa offers professional facial cleansing at ${SPA_ADDRESS.full}, El Poblado, Medellín. We use medical-grade products and certified cosmetologists.`,
      },
      {
        question: 'What is HydraFacial and is it available in Medellín?',
        answer:
          'HydraFacial is a medical-grade facial treatment that combines deep cleansing, exfoliation, extraction, and hydration in one session. Diamond Spa offers HydraFacial in Medellín at El Poblado.',
      },
      {
        question: 'How much does a facial cleansing cost in Medellín?',
        answer:
          'Facial treatments at Diamond Spa vary by type. Express facials start from approximately $80,000 COP. Deep facial cleansing and HydraFacial sessions are priced according to the specific treatment. Contact us for a personalised quote.',
      },
      {
        question: 'How often should I get a professional facial cleansing?',
        answer:
          'We recommend a professional facial cleansing every 4–6 weeks for optimal results. For HydraFacial, monthly sessions maintain healthy, glowing skin.',
      },
      {
        question: 'Do you offer facial treatments for men in Medellín?',
        answer:
          'Yes. Diamond Spa provides facial treatments for both men and women in El Poblado. Our facials are particularly effective for men dealing with irritation from shaving and urban pollution.',
      },
    ],
    ctaTitle: 'Book Your Facial Today',
    ctaBody: 'Professional facial treatments by certified cosmetologists. Private room, exclusive environment.',
  },
  es: {
    metaTitle: 'Limpieza Facial en Medellín — Profunda, HydraFacial y Básica | Diamond Spa El Poblado',
    metaDesc:
      `Limpieza facial en El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas. Profunda ($250k), HydraFacial ($350k) y básica ($150k). Cosmetólogas certificadas — reserva.`,
    heroLabel: 'Faciales · El Poblado, Medellín',
    h1: 'Limpieza Facial en Medellín',
    heroBody:
      'Diamond Spa ofrece tratamientos profesionales de limpieza facial en El Poblado, Medellín. Nuestras cosmetólogas certificadas usan productos de grado médico para limpiar, exfoliar e hidratar tu piel en profundidad. Desde faciales express hasta tratamientos HydraFacial.',
    bookCta: 'Reservar un Facial',
    benefitsTitle: 'Beneficios de la Limpieza Facial Profesional',
    benefits: [
      { icon: 'water_drop', title: 'Hidratación Profunda', body: 'Las fórmulas profesionales penetran más que los productos caseros, restaurando el equilibrio de humedad a nivel celular.' },
      { icon: 'filter_vintage', title: 'Limpieza de Poros', body: 'Elimina puntos negros, sebo e impurezas con técnicas de extracción clínica.' },
      { icon: 'brightness_high', title: 'Piel Luminosa', body: 'La exfoliación de grado médico elimina células muertas, revelando una piel más luminosa e inmediatamente después de la sesión.' },
      { icon: 'shield', title: 'Protección de la Piel', body: 'Fortalece la barrera cutánea y reduce la sensibilidad causada por contaminación urbana, exposición solar y afeitado.' },
    ],
    treatmentsTitle: 'Nuestros Tratamientos Faciales',
    treatments: [
      { name: 'HydraFacial', desc: 'Nuestro tratamiento facial más avanzado. Proceso de 3 pasos: limpieza profunda, exfoliación suave con ácidos e hidratación intensa con ácido hialurónico y antioxidantes.', href: '/hydrafacial-medellin' },
      { name: 'Limpieza Facial Profunda', desc: 'Extracción manual y mecánica de impurezas, puntos negros y exceso de sebo. Ideal para pieles grasas o congestionadas.', href: '/services/limpieza-facial-profunda' },
      { name: 'Limpieza Facial Básica', desc: 'Una sesión de limpieza e hidratación rápida pero efectiva. Perfecta para mantenimiento regular o como parte de un día de spa.', href: '/services/limpieza-facial-basica' },
    ],
    processTitle: 'Nuestro Proceso',
    steps: [
      { step: '01', title: 'Análisis de Piel', body: 'Evaluamos tu tipo y condición de piel para personalizar el tratamiento.' },
      { step: '02', title: 'Limpieza Profunda', body: 'Remoción de residuos de maquillaje, sebo e impurezas superficiales.' },
      { step: '03', title: 'Exfoliación', body: 'Exfoliación enzimática o mecánica suave para eliminar células muertas.' },
      { step: '04', title: 'Tratamiento', body: 'Sueros y mascarillas específicas seleccionadas para tus preocupaciones cutáneas.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Dónde puedo hacerme una limpieza facial profesional en Medellín?',
        answer: `Diamond Spa ofrece limpiezas faciales profesionales en ${SPA_ADDRESS.full}, El Poblado, Medellín. Usamos productos de grado médico y cosmetólogas certificadas.`,
      },
      {
        question: '¿Qué es HydraFacial y está disponible en Medellín?',
        answer:
          'HydraFacial es un tratamiento facial de grado médico que combina limpieza profunda, exfoliación, extracción e hidratación en una sola sesión. Diamond Spa ofrece HydraFacial en Medellín, en El Poblado.',
      },
      {
        question: '¿Cuánto cuesta una limpieza facial en Medellín?',
        answer:
          'Los tratamientos faciales en Diamond Spa varían según el tipo. Los faciales express comienzan desde aproximadamente $80.000 COP. La limpieza facial profunda y el HydraFacial tienen precios según el tratamiento específico. Contáctanos para una cotización personalizada.',
      },
      {
        question: '¿Con qué frecuencia debo hacerme una limpieza facial profesional?',
        answer:
          'Recomendamos una limpieza facial profesional cada 4-6 semanas para resultados óptimos. Para HydraFacial, sesiones mensuales mantienen una piel sana y radiante.',
      },
      {
        question: '¿Ofrecen tratamientos faciales para hombres en Medellín?',
        answer:
          'Sí. Diamond Spa brinda tratamientos faciales para hombres y mujeres en El Poblado. Nuestros faciales son especialmente efectivos para hombres que sufren de irritación por afeitado y contaminación urbana.',
      },
    ],
    ctaTitle: 'Reserva tu Facial Hoy',
    ctaBody: 'Tratamientos faciales profesionales por cosmetólogas certificadas. Cabina privada, ambiente exclusivo.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/limpieza-facial-medellin', locale),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/limpieza-facial-medellin', locale }),
  }
}

export default async function LimpiezaFacialPage({ params }: { params: Promise<{ lang: string }> }) {
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
            href={`/${locale}/book?service=limpieza-facial-profunda`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
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

        {/* Treatments */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.treatmentsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.treatments.map((t) => (
              <div key={t.name} className="bg-surface-container p-8 flex flex-col gap-3">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">{t.name}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{t.desc}</p>
                <Link
                  href={`/${locale}${t.href}`}
                  className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                >
                  {locale === 'es' ? 'Ver detalles →' : 'View details →'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.processTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {c.steps.map((s) => (
              <div key={s.step} className="flex flex-col gap-3">
                <span className="font-label text-primary text-2xl font-bold">{s.step}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase">{s.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{s.body}</p>
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
            href={`/${locale}/book?service=limpieza-facial-profunda`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

      </main>
    </>
  )
}
