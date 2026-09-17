/**
 * /masajes-para-mujeres/embarazadas
 * ──────────────────────────────────
 * ⚠️  DO NOT LINK, PUBLISH, OR ADD TO NAV/SITEMAP UNTIL CONFIRMED:
 * Diamond Spa has a therapist certified in prenatal massage technique.
 * Prenatal massage has real contraindications (first trimester, specific
 * pressure points/positioning) — this is a safety claim, not just SEO copy.
 * See planning conversation (Sept 2026), keyword cluster ~70 vol/mo.
 *
 * Until confirmed, this route exists locally only and is intentionally
 * NOT registered in known-pages.ts or sitemap.ts.
 *
 * Booking CTA deliberately routes to WhatsApp, not the instant wizard —
 * trimester/suitability needs a human check before confirming a slot.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, BASE_URL, faqJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { SPA_WHATSAPP_GREETING, randomWhatsAppUrl } from '@/lib/spa'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const dynamic = 'force-static'

const SEO = {
  metaTitle: {
    es: 'Masaje para Mujeres Embarazadas en Medellín | Diamond Spa',
    en: 'Prenatal Massage for Pregnant Women in Medellín | Diamond Spa',
  },
  metaDescription: {
    es: 'Masaje prenatal relajante y seguro para mujeres embarazadas en Medellín. Técnica especializada para aliviar molestias del embarazo. Agenda tu cita.',
    en: 'Safe, relaxing prenatal massage for pregnant women in Medellín. Specialized technique to ease pregnancy discomfort. Schedule your visit.',
  },
  h1: {
    es: 'Masaje para Mujeres Embarazadas en Medellín',
    en: 'Prenatal Massage for Pregnant Women in Medellín',
  },
  keywords: 'masaje para mujeres embarazadas, masaje a mujer embarazada, masajes mujeres embarazadas, masaje relajante para mujeres embarazadas, masajes para mujeres gestantes',
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  return mergeLandingMetadata(
    '/masajes-para-mujeres/embarazadas',
    locale,
    { title: SEO.metaTitle[locale], description: SEO.metaDescription[locale] },
    {
      alternates: buildAlternates('/masajes-para-mujeres/embarazadas', locale),
      openGraph: buildOpenGraph({ title: SEO.metaTitle[locale], description: SEO.metaDescription[locale], path: '/masajes-para-mujeres/embarazadas', locale }),
      keywords: SEO.keywords,
      robots: { index: false, follow: false }, // safety gate — flip once certification is confirmed
    },
  )
}

const FAQS_ES = [
  { question: '¿Es seguro un masaje durante el embarazo?', answer: 'Sí, cuando lo realiza una terapeuta con formación específica en masaje prenatal y se evalúa primero el trimestre y el estado de salud. Por eso confirmamos estos detalles por WhatsApp antes de agendar.' },
  { question: '¿En qué trimestre puedo recibir el masaje?', answer: 'Generalmente se recomienda a partir del segundo trimestre. Escríbenos y te confirmamos según tu caso específico antes de reservar.' },
  { question: '¿Qué diferencia tiene con un masaje relajante normal?', answer: 'Usa posiciones y presión adaptadas al embarazo, evitando puntos de presión no recomendados. La sesión se ajusta a tu comodidad en cada momento.' },
]
const FAQS_EN = [
  { question: 'Is massage safe during pregnancy?', answer: 'Yes, when performed by a therapist trained specifically in prenatal technique, after checking your trimester and health first. That\u2019s why we confirm these details over WhatsApp before booking.' },
  { question: 'Which trimester can I get the massage in?', answer: 'It\u2019s generally recommended from the second trimester onward. Message us and we\u2019ll confirm based on your specific case before booking.' },
  { question: 'How is it different from a regular relaxing massage?', answer: 'It uses pregnancy-adapted positioning and pressure, avoiding pressure points that aren\u2019t recommended. The session adjusts to your comfort throughout.' },
]

export default async function EmbarazadasPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const isEn = locale === 'en'
  const faqs = isEn ? FAQS_EN : FAQS_ES
  const waUrl = randomWhatsAppUrl(SPA_WHATSAPP_GREETING[locale])

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEn ? 'For women' : 'Para Mujeres', item: `${BASE_URL}/${locale}/masajes-para-mujeres` },
      { '@type': 'ListItem', position: 3, name: SEO.h1[locale], item: `${BASE_URL}/${locale}/masajes-para-mujeres/embarazadas` },
    ],
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />

      <div className="pt-32 pb-0 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <Link href={`/${locale}/masajes-para-mujeres`} className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors">
            {isEn ? '← Back to Massages for Women' : '← Volver a Masajes para Mujeres'}
          </Link>
        </div>
      </div>

      <header className="pt-12 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-5 block">
            {isEn ? 'For Women' : 'Para Mujeres'}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-tight mb-10">
            {SEO.h1[locale]}
          </h1>
          <p className="font-body text-xl md:text-2xl text-secondary leading-relaxed font-light">
            {isEn
              ? 'A gentle, pregnancy-adapted massage designed to ease the discomfort of carrying a baby — with your safety confirmed before you book.'
              : 'Un masaje suave y adaptado al embarazo, pensado para aliviar las molestias de llevar a tu bebé — confirmando tu seguridad antes de reservar.'}
          </p>
        </div>
      </header>

      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-3xl mx-auto space-y-6 font-body text-secondary leading-relaxed">
          <p>
            {isEn
              ? 'Pregnancy brings real physical strain: swollen ankles, lower back tension, disrupted sleep. A properly adapted prenatal massage can ease that discomfort — but it only works when the therapist knows exactly which positions and pressure points to avoid.'
              : 'El embarazo trae tensión física real: tobillos hinchados, tensión lumbar, sueño interrumpido. Un masaje prenatal bien adaptado puede aliviar esas molestias — pero solo funciona cuando la terapeuta sabe exactamente qué posiciones y puntos de presión evitar.'}
          </p>
          <p>
            {isEn
              ? 'That\u2019s why we don\u2019t take this booking online like a regular massage. Message us on WhatsApp first — we\u2019ll ask about your trimester and how you\u2019re feeling, then confirm the right session for you.'
              : 'Por eso no reservamos esta sesión en línea como un masaje regular. Escríbenos primero por WhatsApp — te preguntamos por tu trimestre y cómo te sientes, y así confirmamos la sesión ideal para ti.'}
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-label text-outline text-xs uppercase tracking-widest mb-8">
            {isEn ? 'Frequently asked questions' : 'Preguntas frecuentes'}
          </h2>
          <div className="space-y-8">
            {faqs.map(f => (
              <div key={f.question}>
                <h3 className="font-headline text-xl text-on-surface mb-2">{f.question}</h3>
                <p className="font-body text-secondary leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-5 items-start">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary px-10 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            {isEn ? 'Ask us on WhatsApp' : 'Escríbenos por WhatsApp'}
          </a>
          <Link
            href={`/${locale}/masajes-para-mujeres`}
            className="border border-outline-variant text-on-surface px-10 py-5 font-label text-xs uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all"
          >
            {isEn ? '← Back to Massages for Women' : '← Volver a Masajes para Mujeres'}
          </Link>
        </div>
      </section>
    </>
  )
}
