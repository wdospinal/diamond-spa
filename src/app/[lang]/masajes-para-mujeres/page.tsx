import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { getMassageServices, serviceDisplayName, serviceShortDesc } from '@/lib/services'
import { SERVICE_DETAIL_FROM_QUERY } from '@/lib/service-detail-nav'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_PHONES, SPA_RATING } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const FROM_MUJERES = 'masajes-para-mujeres'

const content = {
  en: {
    metaTitle: 'Massages for Women in Medellín — Diamond Spa El Poblado',
    metaDesc:
      `Exclusive massages for women in El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} Google reviews. Relaxing, deep tissue, 4-hands & more. Private rooms, certified therapists. From $120,000 COP — book now.`,
    ogImageAlt: 'Massages for Women in Medellín — Diamond Spa',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Massages for Women in Medellín',
    heroBody:
      'Diamond Spa offers exclusive massages for women in El Poblado, Medellín. A quiet luxury environment with certified female therapists, private rooms, and staggered appointments for total privacy. Relaxing, deep tissue, 4-hands and more — all designed to deliver real results in a professional, discreet setting.',
    bookMassage: 'Book a Massage',
    featuredTitle: 'Our Massages for Women',
    viewDetails: 'View details',
    book: 'Book',
    viewAllServices: 'View all services →',
    whyTitle: 'Why Diamond Spa?',
    pillars: [
      { icon: 'lock', title: 'Total Privacy', body: 'Private rooms, staggered appointments, and a discreet entrance ensure your session is exclusively yours.' },
      { icon: 'verified_user', title: 'Certified Therapists', body: 'Our team holds professional credentials with 5+ years of experience in therapeutic bodywork.' },
      { icon: 'spa', title: 'Quiet Luxury', body: 'A calm, elegant environment designed for deep recovery — no noise, no unnecessary stimulation.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'Do you offer massages for women in Medellín?',
        answer: `Yes, Diamond Spa offers exclusive massages for women in El Poblado, Medellín: relaxing, deep tissue, sports, 4-hands and more. Our environment is private and discreet, with a private entrance and staggered appointments.`,
      },
      {
        question: 'How much does a massage for women cost in Medellín?',
        answer: 'Massages for women at Diamond Spa start from $120,000 COP for 30 minutes. 60 and 90-minute sessions are priced from $200,000 and $260,000 COP respectively.',
      },
      {
        question: 'Is Diamond Spa comfortable for women?',
        answer: 'Diamond Spa was designed to provide total comfort and privacy. We have certified female therapists, private rooms, and a quiet luxury environment created specifically for professional therapeutic treatments.',
      },
      {
        question: 'Where are you located?',
        answer: `We are at ${SPA_ADDRESS.full} — 5 minutes from Parque El Poblado. Parking is available in front of the premises.`,
      },
      {
        question: 'Do I need to book in advance?',
        answer: `Yes, we recommend booking online in advance to guarantee availability. You can also write to us on WhatsApp ${SPA_PHONES[1].display} to make the reservation.`,
      },
    ],
    ctaTitle: 'Book Your Massage Today',
    ctaBody: 'Private arrival instructions sent 24 hours before your session.',
  },
  es: {
    metaTitle: 'Masajes para Mujeres en Medellín — Diamond Spa El Poblado',
    metaDesc:
      `Masajes exclusivos para mujeres en El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas en Google. Relajante, deep tissue, 4 manos y más. Cabinas privadas, terapeutas certificadas. Desde $120.000 COP — reserva ahora.`,
    ogImageAlt: 'Masajes para Mujeres en Medellín — Diamond Spa',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Masajes para Mujeres en Medellín',
    heroBody:
      'Diamond Spa ofrece masajes exclusivos para mujeres en El Poblado, Medellín. Un entorno de lujo silencioso con terapeutas femeninas certificadas, cabinas privadas y citas escalonadas para total privacidad. Masaje relajante, deep tissue, 4 manos y mucho más — diseñados para entregar resultados reales en un ambiente profesional y discreto.',
    bookMassage: 'Reservar Masaje',
    featuredTitle: 'Nuestros Masajes para Mujeres',
    viewDetails: 'Ver detalles',
    book: 'Reservar',
    viewAllServices: 'Ver todos los servicios →',
    whyTitle: '¿Por qué Diamond Spa?',
    pillars: [
      { icon: 'lock', title: 'Total Privacidad', body: 'Cabinas privadas, citas escalonadas y entrada discreta para que tu sesión sea exclusivamente tuya.' },
      { icon: 'verified_user', title: 'Terapeutas Certificadas', body: 'Nuestro equipo cuenta con credenciales profesionales y más de 5 años de experiencia en trabajo corporal terapéutico.' },
      { icon: 'spa', title: 'Lujo Silencioso', body: 'Un ambiente tranquilo y elegante diseñado para la recuperación profunda — sin ruido, sin estimulación innecesaria.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Hacen masajes para mujeres en Medellín?',
        answer: `Sí, en Diamond Spa ofrecemos masajes exclusivos para mujeres en El Poblado, Medellín: relajante, deep tissue, deportivo, 4 manos y más. Nuestro ambiente es privado y discreto, con entrada independiente y citas escalonadas.`,
      },
      {
        question: '¿Cuánto cuesta un masaje para mujeres en Medellín?',
        answer: 'Los masajes para mujeres en Diamond Spa comienzan desde $120.000 COP por 30 minutos. Las sesiones de 60 y 90 minutos tienen precios desde $200.000 y $260.000 COP respectivamente.',
      },
      {
        question: '¿Es Diamond Spa cómodo para mujeres?',
        answer: 'Diamond Spa fue diseñado para brindar total comodidad y privacidad. Contamos con terapeutas femeninas certificadas, cabinas privadas y un ambiente de lujo silencioso creado específicamente para tratamientos terapéuticos profesionales.',
      },
      {
        question: '¿Dónde están ubicados?',
        answer: `Estamos en ${SPA_ADDRESS.full} — a 5 minutos del Parque El Poblado. Contamos con zona de parqueo frente al local.`,
      },
      {
        question: '¿Necesito reservar con anticipación?',
        answer: `Sí, recomendamos reservar online con anticipación para garantizar disponibilidad. También puedes escribir al WhatsApp ${SPA_PHONES[1].display} para realizar la reserva.`,
      },
    ],
    ctaTitle: 'Reserva tu Masaje Hoy',
    ctaBody: 'Instrucciones de llegada privadas enviadas 24 horas antes de tu cita.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/masajes-para-mujeres'),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/masajes-para-mujeres', locale, imageAlt: c.ogImageAlt }),
  }
}

export default async function MasajesParaMujeresPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const c = content[locale]
  const massageServices = getMassageServices()

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={faqJsonLd([...c.faqs])} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">
            {c.heroLabel}
          </p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
            {c.h1}
          </h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">
            {c.heroBody}
          </p>
          <Link
            href={`/${locale}/book?service=relaxing`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookMassage}
          </Link>
        </section>

        {/* Massages grid */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {c.featuredTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {massageServices.map((m) => (
              <div key={m.id} className="bg-surface-container p-8 flex flex-col gap-4">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">
                  {serviceDisplayName(m, locale)}
                </h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">
                  {serviceShortDesc(m, locale)}
                </p>
                <div className="flex gap-4 mt-2">
                  <Link
                    href={`/${locale}/services/${m.id}?${SERVICE_DETAIL_FROM_QUERY}=${FROM_MUJERES}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {c.viewDetails}
                  </Link>
                  <Link
                    href={`/${locale}/book?service=${m.id}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {c.book}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={`/${locale}/services`}
              className="text-zinc-400 hover:text-primary font-label text-sm tracking-widest uppercase transition-colors"
            >
              {c.viewAllServices}
            </Link>
          </div>
        </section>

        {/* Why Diamond Spa */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {c.whyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.pillars.map((pillar) => (
              <div key={pillar.icon} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{pillar.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">
                  {pillar.title}
                </h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {c.faqTitle}
          </h2>
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
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-6">
            {c.ctaTitle}
          </h2>
          <p className="text-zinc-400 font-body text-sm mb-8 max-w-md mx-auto">
            {c.ctaBody}
          </p>
          <Link
            href={`/${locale}/book?service=relaxing`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookMassage}
          </Link>
        </section>

      </main>
    </>
  )
}
