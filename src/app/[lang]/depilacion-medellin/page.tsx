import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { SERVICES, formatCop } from '@/lib/services'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_ADDRESS, SPA_PHONES, SPA_RATING } from '@/lib/spa'
import { JsonLd } from '@/components/JsonLd'

export const dynamic = 'force-static'

const hairRemovalServices = (SERVICES as unknown as { id: string; name: { en: string; es: string }; shortDesc: { en: string; es: string }; waxPrice: number; machinePrice: number; categoryId: string }[]).filter(s => s.categoryId === 'hair-removal')

const content = {
  en: {
    metaTitle: 'Hair Removal in Medellín — Wax & Machine | Diamond Spa El Poblado',
    metaDesc:
      `Hair removal in El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reviews. Wax & machine: legs, bikini, underarm, back & full body. From $20,000 COP — book now.`,
    ogImageAlt: 'Hair Removal in Medellín — Diamond Spa',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Hair Removal in Medellín',
    heroBody:
      'Diamond Spa offers professional hair removal in El Poblado, Medellín. Available with hot wax or electric machine, performed by certified cosmetologists in private rooms. From underarms to full body, with the highest hygiene standards.',
    bookCta: 'Book Hair Removal',
    methodsTitle: 'Hair Removal Methods',
    methods: [
      {
        icon: 'local_fire_department',
        title: 'Hot Wax',
        body: 'Warm wax adheres precisely to the hair, removing it from the root for long-lasting results of 3–4 weeks. Ideal for most skin types and areas.',
      },
      {
        icon: 'electric_bolt',
        title: 'Electric Machine',
        body: 'Gentler approach for sensitive skin and delicate areas. The machine pulls hair efficiently with minimal irritation — perfect for frequent treatments.',
      },
    ],
    servicesTitle: 'Our Hair Removal Services',
    waxLabel: 'Wax',
    machineLabel: 'Machine',
    whyTitle: 'Why Diamond Spa?',
    pillars: [
      { icon: 'verified_user', title: 'Certified Cosmetologists', body: 'All treatments are performed by professionally certified cosmetologists with expertise in hair removal techniques.' },
      { icon: 'lock', title: 'Private Rooms', body: 'Every session takes place in a dedicated private room. Discretion and comfort are our priority.' },
      { icon: 'cleaning_services', title: 'Strict Hygiene', body: 'Single-use wax applicators, sterilised tools, and medical-grade hygiene protocols on every treatment.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        question: 'Where can I get professional hair removal in Medellín?',
        answer: `Diamond Spa offers professional hair removal at ${SPA_ADDRESS.full}. We use hot wax and electric machine with certified cosmetologists.`,
      },
      {
        question: 'How much does hair removal cost in Medellín?',
        answer: 'Hair removal prices at Diamond Spa start from $20,000 COP (underarm with machine) and go up to $400,000 COP (full body with wax). See the full price table above.',
      },
      {
        question: 'Is wax or machine hair removal better?',
        answer: 'Wax provides longer-lasting results (3–4 weeks) and is ideal for most areas. Machine is gentler on sensitive skin and delicate zones. Our cosmetologists advise you based on your skin type and the area being treated.',
      },
      {
        question: 'Do you offer hair removal for both men and women?',
        answer: 'Yes, Diamond Spa offers hair removal for men and women. We have services for chest, back, and full body that are very popular with men, as well as bikini, legs, and underarms for women.',
      },
      {
        question: 'Do I need to book an appointment?',
        answer: `Yes, we recommend booking online in advance to guarantee availability. You can also write to us on WhatsApp ${SPA_PHONES[1].display} to make the reservation.`,
      },
    ],
    ctaTitle: 'Book Your Hair Removal Today',
    ctaBody: 'Professional results in a private, hygienic environment. Certified cosmetologists at El Poblado.',
  },
  es: {
    metaTitle: 'Depilación en Medellín — Cera y Máquina | Diamond Spa El Poblado',
    metaDesc:
      `Depilación en El Poblado, Medellín. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas. Cera y máquina: piernas, bikini, axilas, espalda y cuerpo completo. Desde $20.000 COP — reserva.`,
    ogImageAlt: 'Depilación en Medellín — Diamond Spa',
    heroLabel: 'El Poblado, Medellín',
    h1: 'Depilación en Medellín',
    heroBody:
      'Diamond Spa ofrece depilación profesional en El Poblado, Medellín. Disponible con cera caliente o máquina eléctrica, por cosmetólogas certificadas en cabinas privadas. Desde axilas hasta cuerpo completo, con los más altos estándares de higiene.',
    bookCta: 'Reservar Depilación',
    methodsTitle: 'Métodos de Depilación',
    methods: [
      {
        icon: 'local_fire_department',
        title: 'Cera Caliente',
        body: 'La cera caliente se adhiere con precisión al vello, removiéndolo desde la raíz para resultados duraderos de 3–4 semanas. Ideal para la mayoría de tipos de piel y zonas.',
      },
      {
        icon: 'electric_bolt',
        title: 'Máquina Eléctrica',
        body: 'Enfoque más suave para pieles sensibles y zonas delicadas. La máquina extrae el vello eficientemente con mínima irritación — perfecta para tratamientos frecuentes.',
      },
    ],
    servicesTitle: 'Nuestros Servicios de Depilación',
    waxLabel: 'Cera',
    machineLabel: 'Máquina',
    whyTitle: '¿Por qué Diamond Spa?',
    pillars: [
      { icon: 'verified_user', title: 'Cosmetólogas Certificadas', body: 'Todos los tratamientos son realizados por cosmetólogas profesionalmente certificadas con experiencia en técnicas de depilación.' },
      { icon: 'lock', title: 'Cabinas Privadas', body: 'Cada sesión tiene lugar en una cabina privada dedicada. La discreción y el confort son nuestra prioridad.' },
      { icon: 'cleaning_services', title: 'Higiene Estricta', body: 'Aplicadores de cera de uso único, instrumentos esterilizados y protocolos de higiene de grado médico en cada tratamiento.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      {
        question: '¿Dónde hacen depilación profesional en Medellín?',
        answer: `Diamond Spa ofrece depilación profesional en ${SPA_ADDRESS.full}. Usamos cera caliente y máquina eléctrica con cosmetólogas certificadas.`,
      },
      {
        question: '¿Cuánto cuesta la depilación en Medellín?',
        answer: 'Los precios de depilación en Diamond Spa comienzan desde $20.000 COP (axilas con máquina) hasta $400.000 COP (cuerpo completo con cera). Ver la tabla completa de precios arriba.',
      },
      {
        question: '¿Qué es mejor: cera o máquina?',
        answer: 'La cera ofrece resultados más duraderos (3-4 semanas) y es ideal para la mayoría de zonas. La máquina es más suave para pieles sensibles y zonas delicadas. Nuestras cosmetólogas te asesoran según tu tipo de piel y la zona a tratar.',
      },
      {
        question: '¿Hacen depilación para hombres y mujeres?',
        answer: 'Sí, Diamond Spa ofrece depilación para hombres y mujeres. Tenemos servicios de pecho, espalda y cuerpo completo muy solicitados por hombres, además de bikini, piernas y axilas para mujeres.',
      },
      {
        question: '¿Necesito cita previa?',
        answer: `Sí, recomendamos reservar online con anticipación para garantizar disponibilidad. También puedes escribir al WhatsApp ${SPA_PHONES[1].display} para realizar la reserva.`,
      },
    ],
    ctaTitle: 'Reserva tu Depilación Hoy',
    ctaBody: 'Resultados profesionales en un entorno privado e higiénico. Cosmetólogas certificadas en El Poblado.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: buildAlternates('/depilacion-medellin', locale),
    openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: '/depilacion-medellin', locale, imageAlt: c.ogImageAlt }),
  }
}

export default async function DepilacionMedellinPage({ params }: { params: Promise<{ lang: string }> }) {
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
            href={`/${locale}/book?service=depilacion-axila`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

        {/* Methods */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.methodsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.methods.map((m) => (
              <div key={m.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{m.icon}</span>
                <h3 className="font-headline text-xl text-on-surface tracking-tighter mb-3">{m.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services table */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.servicesTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-3 pr-6 font-label text-on-surface text-xs tracking-widest uppercase">
                    {locale === 'es' ? 'Zona' : 'Area'}
                  </th>
                  <th className="text-right py-3 pr-6 font-label text-on-surface text-xs tracking-widest uppercase">{c.waxLabel}</th>
                  <th className="text-right py-3 font-label text-on-surface text-xs tracking-widest uppercase">{c.machineLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {hairRemovalServices.map((s) => (
                  <tr key={s.id} className="group hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 pr-6 text-on-surface">
                      <Link
                        href={`/${locale}/services/${s.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {s.name[locale]}
                      </Link>
                    </td>
                    <td className="py-4 pr-6 text-zinc-400 text-right">{formatCop(s.waxPrice)}</td>
                    <td className="py-4 text-zinc-400 text-right">{formatCop(s.machinePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Diamond Spa */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.pillars.map((p) => (
              <div key={p.icon} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{p.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">{p.title}</h3>
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
            href={`/${locale}/book?service=depilacion-axila`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {c.bookCta}
          </Link>
        </section>

      </main>
    </>
  )
}
