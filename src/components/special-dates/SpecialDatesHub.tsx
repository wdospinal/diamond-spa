import Link from 'next/link'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n'
import { BASE_URL, buildOpenGraph, localBusinessJsonLd, specialDatesAlternates } from '@/lib/seo'
import { formatCop } from '@/lib/services'
import {
  nextOccurrence,
  planPrice,
  specialDatePath,
  specialDatesByUpcoming,
  specialDatesPath,
} from '@/lib/special-dates'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import WhatsAppLink from '@/components/WhatsAppLink'
import { mergeLandingMetadata } from '@/lib/landing-meta'

const content = {
  en: {
    metaTitle: 'Spa Gifts for Special Dates in Medellín | Diamond Spa El Poblado',
    metaDesc:
      "Spa gift ideas for Valentine's, Mother's Day, Father's Day, Love & Friendship and more in Medellín. Massages and facials in private rooms in El Poblado, with open dates.",
    heroLabel: 'Special dates · Medellín',
    h1: 'Spa gifts for every special date in Medellín',
    heroBody:
      'Pick the occasion and see the plans we recommend for it, with current prices. Book a date, or give it as a gift with an open date and a personal message.',
    chips: ['Private rooms in El Poblado', 'Open-date gifts', 'Help on WhatsApp'],
    whatsappCta: 'Ask on WhatsApp',
    whatsappText: 'Hi! I would like to give a Diamond Spa plan as a gift for a special date.',
    howTitle: 'How giving a spa plan works',
    how: [
      { icon: 'spa', title: 'Choose the plan', body: 'Each occasion lists plans built from our massages and facials, priced as they are today.' },
      { icon: 'chat_bubble', title: 'Write to us', body: 'On WhatsApp we confirm the plan, payment and the message you want to include.' },
      { icon: 'event_available', title: 'They pick the day', body: 'Book a fixed date or leave it open so the recipient schedules when it suits them.' },
    ],
    catalogTitle: 'Choose the occasion',
    catalogBody: 'Sorted by the next date coming up.',
    next: 'Next',
    from: 'From',
    seePlans: 'See plans',
  },
  es: {
    metaTitle: 'Regalos de Spa para Fechas Especiales en Medellín | Diamond Spa',
    metaDesc:
      'Ideas de regalo de spa para San Valentín, Día de la Madre, Día del Padre, Amor y Amistad y más en Medellín. Masajes y faciales en cabina privada en El Poblado, con fecha abierta.',
    heroLabel: 'Fechas especiales · Medellín',
    h1: 'Regalos de spa para cada fecha especial en Medellín',
    heroBody:
      'Elige la ocasión y mira los planes que recomendamos para ella, con precios actualizados. Reserva una fecha o regálalo con fecha abierta y una dedicatoria.',
    chips: ['Cabinas privadas en El Poblado', 'Regalos con fecha abierta', 'Asesoría por WhatsApp'],
    whatsappCta: 'Escríbenos por WhatsApp',
    whatsappText: '¡Hola! Quiero regalar un plan de Diamond Spa para una fecha especial.',
    howTitle: 'Cómo funciona regalar un plan de spa',
    how: [
      { icon: 'spa', title: 'Elige el plan', body: 'Cada ocasión tiene planes armados con nuestros masajes y faciales, con el precio de hoy.' },
      { icon: 'chat_bubble', title: 'Escríbenos', body: 'Por WhatsApp confirmamos el plan, el pago y la dedicatoria que quieres incluir.' },
      { icon: 'event_available', title: 'Elige el día', body: 'Reserva una fecha fija o déjala abierta para que la persona agende cuando le quede bien.' },
    ],
    catalogTitle: 'Elige la ocasión',
    catalogBody: 'Ordenadas por la fecha más próxima.',
    next: 'Próxima',
    from: 'Desde',
    seePlans: 'Ver planes',
  },
} as const

/**
 * Hub for /es/fechas-especiales and /en/special-dates. Each locale has its own
 * route folder (the section name is translated); both render this.
 */
export function specialDatesHubMetadata(locale: Locale): Promise<Metadata> {
  const c = content[locale]
  const path = specialDatesPath(locale)
  return mergeLandingMetadata(
    path,
    locale,
    { title: c.metaTitle, description: c.metaDesc },
    {
      alternates: specialDatesAlternates(locale),
      openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path, locale }),
    },
  )
}

export function SpecialDatesHub({ locale }: { locale: Locale }) {
  const c = content[locale]
  const path = specialDatesPath(locale)
  const dates = specialDatesByUpcoming()
  const dateFmt = new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', timeZone: 'UTC' })

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.h1,
    itemListElement: dates.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: d.name[locale],
      url: `${BASE_URL}/${locale}${specialDatePath(d, locale)}`,
    })),
  }

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale)} />
      <JsonLd data={itemListJsonLd} />
      <LandingHead path={path} locale={locale} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6 max-w-4xl">
            {c.h1}
          </h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">{c.heroBody}</p>
          <ul className="flex flex-wrap gap-3 mb-10">
            {c.chips.map(chip => (
              <li key={chip} className="border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-widest text-secondary">
                {chip}
              </li>
            ))}
          </ul>
          <WhatsAppLink
            text={c.whatsappText}
            source="fechas-especiales"
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {c.whatsappCta}
          </WhatsAppLink>
        </section>

        {/* Occasions */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-2">{c.catalogTitle}</h2>
          <p className="text-zinc-400 font-body text-sm mb-10">{c.catalogBody}</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dates.map((d, i) => {
              const from = Math.min(...d.plans.map(planPrice))
              return (
                <li key={d.slug.es}>
                  <Link
                    href={`/${locale}${specialDatePath(d, locale)}`}
                    className="group bg-surface-container p-8 flex flex-col gap-4 h-full hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">{d.icon}</span>
                      {i === 0 && (
                        <span className="font-label text-[10px] uppercase tracking-widest bg-primary text-on-primary px-3 py-1">
                          {c.next}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl text-on-surface tracking-tighter group-hover:text-primary transition-colors">
                        {d.name[locale]}
                      </h3>
                      <p className="font-label text-outline text-xs tracking-widest uppercase mt-2">
                        {d.when[locale]}
                        {d.rule.kind === 'nth-weekday' && ` · ${dateFmt.format(nextOccurrence(d))}`}
                      </p>
                    </div>
                    <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{d.tagline[locale]}</p>
                    <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
                      <span className="font-label text-primary text-xs tracking-widest">{c.from} {formatCop(from)}</span>
                      <span className="font-label text-on-surface text-xs tracking-widest uppercase">{c.seePlans} →</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{c.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.how.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-3">
                <span className="font-label text-outline text-xs tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">{step.icon}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase">{step.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  )
}
