import Link from 'next/link'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n'
import { BASE_URL, BUSINESS, buildOpenGraph, faqJsonLd, specialDatesAlternates } from '@/lib/seo'
import { formatCop } from '@/lib/services'
import {
  type SpecialDate,
  nextOccurrence,
  planBookHref,
  planExtraLabels,
  planItemsLabel,
  planMinutes,
  planPersons,
  planServiceLabels,
  planPrice,
  specialDatePath,
  specialDatesByUpcoming,
  specialDateImage,
  specialDatesPath,
  SPECIAL_DATE_IMAGE_SIZE,
} from '@/lib/special-dates'
import { JsonLd } from '@/components/JsonLd'
import { FaqSection } from '@/components/FaqSection'
import WhatsAppLink from '@/components/WhatsAppLink'
import { mergeLandingMetadata } from '@/lib/landing-meta'

const ui = {
  en: {
    back: '← All special dates',
    label: 'Special dates · Medellín',
    metaTitle: (name: string) => `${name} Spa Gifts in Medellín | Diamond Spa`,
    metaDesc: (name: string, from: string) =>
      `${name} spa plans in Medellín from ${from}. Massages and facials in private rooms in El Poblado — book a date or give it with an open date.`,
    nextDate: 'Next date',
    tipLabel: 'Our tip',
    plansTitle: 'Recommended plans',
    includes: 'This experience includes',
    duration: (min: number) => (min % 60 ? `${Math.floor(min / 60) ? `${Math.floor(min / 60)} h ` : ''}${min % 60} min` : `${min / 60} h`),
    persons: (n: number) => (n === 1 ? '1 person' : `${n} people`),
    book: 'Book',
    gift: 'Give as a gift',
    giftText: (plan: string, occasion: string) => `Hi! I would like to give the plan "${plan}" for ${occasion}.`,
    helpTitle: 'Not sure which one to choose?',
    helpBody: 'Tell us who it is for and your budget, and we suggest the plan that fits best.',
    helpCta: 'Ask on WhatsApp',
    helpText: (occasion: string) => `Hi! I need help choosing a spa gift for ${occasion}.`,
    faqTitle: (name: string) => `${name}: common questions`,
    faqLabel: 'Frequently asked questions',
    otherTitle: 'Other special dates',
    home: 'Home',
    hub: 'Special dates',
  },
  es: {
    back: '← Todas las fechas especiales',
    label: 'Fechas especiales · Medellín',
    metaTitle: (name: string) => `${name}: Regalos de Spa en Medellín | Diamond Spa`,
    metaDesc: (name: string, from: string) =>
      `${name}: planes de spa en Medellín desde ${from}. Cabina privada en El Poblado; reserva una fecha o regálalo con fecha abierta.`,
    nextDate: 'Próxima fecha',
    tipLabel: 'Nuestra recomendación',
    plansTitle: 'Planes recomendados',
    includes: 'Esta experiencia incluye',
    duration: (min: number) => (min % 60 ? `${Math.floor(min / 60) ? `${Math.floor(min / 60)} h ` : ''}${min % 60} min` : `${min / 60} h`),
    persons: (n: number) => (n === 1 ? '1 persona' : `${n} personas`),
    book: 'Reservar',
    gift: 'Regalar',
    giftText: (plan: string, occasion: string) => `¡Hola! Quiero regalar el plan "${plan}" para ${occasion}.`,
    helpTitle: '¿No sabes cuál elegir?',
    helpBody: 'Cuéntanos para quién es y tu presupuesto, y te sugerimos el plan que mejor encaja.',
    helpCta: 'Escríbenos por WhatsApp',
    helpText: (occasion: string) => `¡Hola! Necesito ayuda para elegir un regalo de spa para ${occasion}.`,
    faqTitle: (name: string) => `${name}: preguntas frecuentes`,
    faqLabel: 'Preguntas frecuentes',
    otherTitle: 'Otras fechas especiales',
    home: 'Inicio',
    hub: 'Fechas especiales',
  },
} as const

/** One occasion, rendered by both /es/fechas-especiales/[ocasion] and /en/special-dates/[occasion]. */
export function specialDateMetadata(d: SpecialDate, locale: Locale): Promise<Metadata> {
  const t = ui[locale]
  const path = specialDatePath(d, locale)
  const title = t.metaTitle(d.name[locale])
  const description = t.metaDesc(d.name[locale], formatCop(Math.min(...d.plans.map(planPrice))))
  return mergeLandingMetadata(
    path,
    locale,
    { title, description },
    {
      alternates: specialDatesAlternates(locale, d),
      openGraph: buildOpenGraph({
        title,
        description,
        path,
        locale,
        image: { url: specialDateImage(d).og, width: 1200, height: 630 },
        imageAlt: d.imageAlt[locale],
      }),
      twitter: { card: 'summary_large_image', images: [specialDateImage(d).og] },
    },
  )
}

export function SpecialDatePage({ d, locale }: { d: SpecialDate; locale: Locale }) {
  const t = ui[locale]
  const name = d.name[locale]
  const hub = specialDatesPath(locale)
  const path = specialDatePath(d, locale)
  const faqs = d.faqs[locale]
  const img = specialDateImage(d)
  const others = specialDatesByUpcoming().filter(o => o !== d)
  const dateFmt = new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })

  const offersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${name} — ${BUSINESS.name}`,
    url: `${BASE_URL}/${locale}${path}`,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}${img.webp}`,
      width: SPECIAL_DATE_IMAGE_SIZE.width,
      height: SPECIAL_DATE_IMAGE_SIZE.height,
      caption: d.imageAlt[locale],
    },
    itemListElement: d.plans.map(plan => ({
      '@type': 'Offer',
      name: plan.title[locale],
      description: planItemsLabel(plan, locale),
      price: planPrice(plan),
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'HealthAndBeautyBusiness', name: BUSINESS.name, url: BUSINESS.url },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.home, item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t.hub, item: `${BASE_URL}/${locale}${hub}` },
      { '@type': 'ListItem', position: 3, name, item: `${BASE_URL}/${locale}${path}` },
    ],
  }

  return (
    <>
      <JsonLd data={offersJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <Link
          href={`/${locale}${hub}`}
          className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          {t.back}
        </Link>

        {/* Hero */}
        <section className="mt-12 mb-16 grid md:grid-cols-[2fr_1fr] gap-10 items-start">
          <div>
            <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{t.label}</p>
            <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">{name}</h1>
            <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl">{d.intro[locale]}</p>
          </div>
          <aside className="bg-surface-container border border-outline-variant/20 p-8 flex flex-col gap-5">
            <div>
              <span className="font-label text-outline text-[10px] uppercase tracking-[0.2em] block mb-2">{t.nextDate}</span>
              <p className="font-headline text-on-surface text-xl first-letter:uppercase">{dateFmt.format(nextOccurrence(d))}</p>
            </div>
            <div className="border-t border-outline-variant/20 pt-5">
              <span className="font-label text-primary text-[10px] uppercase tracking-[0.2em] block mb-2">{t.tipLabel}</span>
              <p className="font-body text-secondary text-sm leading-relaxed">{d.giftTip[locale]}</p>
            </div>
          </aside>
        </section>

        {/* LCP image: eager + high priority, with explicit size to avoid layout shift. */}
        <picture className="block mb-16 aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-surface-container">
          <source srcSet={img.avif} type="image/avif" />
          <img
            src={img.webp}
            alt={d.imageAlt[locale]}
            width={SPECIAL_DATE_IMAGE_SIZE.width}
            height={SPECIAL_DATE_IMAGE_SIZE.height}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </picture>

        {/* Plans */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">{t.plansTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {d.plans.map(plan => (
              <article key={plan.title.es} className="bg-surface-container p-8 flex flex-col gap-4">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">{plan.title[locale]}</h3>
                <p className="flex flex-wrap gap-x-5 gap-y-2 font-label text-secondary text-xs tracking-widest">
                  {planMinutes(plan) !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">schedule</span>
                      {t.duration(planMinutes(plan)!)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">person</span>
                    {t.persons(planPersons(plan))}
                  </span>
                </p>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{plan.note[locale]}</p>
                <div className="border-t border-outline-variant/20 pt-4 flex-1">
                  <span className="font-label text-on-surface text-[10px] uppercase tracking-widest block mb-3">{t.includes}</span>
                  <ul className="flex flex-col gap-2">
                    {[...planServiceLabels(plan, locale), ...planExtraLabels(plan, locale)].map(label => (
                      <li key={label} className="flex items-start gap-2 font-body text-secondary text-sm">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="border-t border-outline-variant/20 pt-4 font-headline text-primary text-2xl tabular-nums">
                  {formatCop(planPrice(plan))}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={planBookHref(plan, locale)}
                    className="bg-primary text-on-primary font-label text-xs tracking-widest uppercase px-5 py-3 hover:opacity-90 transition-opacity"
                  >
                    {t.book}
                  </Link>
                  <WhatsAppLink
                    text={t.giftText(plan.title[locale], name)}
                    source={`fechas-especiales-${d.slug.es}`}
                    className="border border-outline-variant text-on-surface font-label text-xs tracking-widest uppercase px-5 py-3 hover:bg-surface-container-high transition-colors"
                  >
                    {t.gift}
                  </WhatsAppLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Help */}
        <section className="mb-20 bg-surface-container p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-3">{t.helpTitle}</h2>
            <p className="text-zinc-400 font-body text-sm max-w-xl">{t.helpBody}</p>
          </div>
          <WhatsAppLink
            text={t.helpText(name)}
            source={`fechas-especiales-${d.slug.es}`}
            className="shrink-0 bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {t.helpCta}
          </WhatsAppLink>
        </section>

        <FaqSection
          categories={[{ id: 'booking', icon: 'spa', label: t.faqLabel, items: faqs }]}
          title={t.faqTitle(name)}
          className="mb-20"
        />

        {/* Other dates */}
        <section>
          <h2 className="font-label text-outline text-xs uppercase tracking-widest mb-8">{t.otherTitle}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/20">
            {others.map(o => (
              <li key={o.slug.es} className="bg-surface">
                <Link
                  href={`/${locale}${specialDatePath(o, locale)}`}
                  className="group flex items-start gap-4 p-6 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">{o.icon}</span>
                  <span className="flex flex-col gap-1">
                    <span className="font-headline text-on-surface text-lg group-hover:text-primary transition-colors">{o.name[locale]}</span>
                    <span className="font-label text-outline text-[11px] uppercase tracking-widest">{o.when[locale]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
