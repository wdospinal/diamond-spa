import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { BASE_URL, BUSINESS, buildAlternates, buildOpenGraph, faqJsonLd, localBusinessJsonLd } from '@/lib/seo'
import { formatCop } from '@/lib/services'
import {
  PLANS,
  PLANES_PATH,
  getPlan,
  itemLabels,
  planBookHref,
  planBooksOnline,
  planExtraLabels,
  planHonoreePrice,
  planMinutes,
  planPath,
  planPersons,
  planPrice,
} from '@/lib/planes'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import WhatsAppLink from '@/components/WhatsAppLink'
import { FaqSection } from '@/components/FaqSection'
import { LocationSection } from '@/components/LocationSection'
import { PlanCard } from '@/components/planes/PlanCard'
import { planUi } from '@/components/planes/plan-ui'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const revalidate = 3600

type Params = { params: Promise<{ lang: string; plan: string }> }

export async function generateStaticParams() {
  return PLANS.flatMap(p => [
    { lang: 'es', plan: p.slug },
    { lang: 'en', plan: p.slug },
  ])
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, plan: slug } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const p = getPlan(slug)
  if (!p) return {}
  const path = planPath(p)
  const title = `${p.headline[locale]} | Diamond Spa`
  const description = `${p.tagline[locale]} ${formatCop(planPrice(p))} ${planUi[locale].priceUnit(p)}. El Poblado, Medellín.`
  return mergeLandingMetadata(
    path,
    locale,
    { title, description },
    {
      alternates: buildAlternates(path, locale),
      openGraph: buildOpenGraph({ title, description, path, locale }),
    },
  )
}

const btnPrimary =
  'bg-primary text-on-primary font-label text-xs tracking-widest uppercase px-6 py-4 hover:opacity-90 transition-opacity text-center'
const btnSecondary =
  'border border-outline-variant text-on-surface font-label text-xs tracking-widest uppercase px-6 py-4 hover:bg-surface-container-high transition-colors text-center'

export default async function PlanPage({ params }: Params) {
  const { lang, plan: slug } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const p = getPlan(slug)
  if (!p) notFound()
  const t = planUi[locale]
  const path = planPath(p)
  const name = p.name[locale]
  const min = planMinutes(p)
  const persons = planPersons(p)
  const honoreePrice = planHonoreePrice(p)
  const faqs = p.faqs[locale]
  // Same audience first (other group plans for a group plan), then the rest.
  const others = [
    ...PLANS.filter(o => o.audience === p.audience && o.slug !== p.slug),
    ...PLANS.filter(o => o.audience !== p.audience),
  ].slice(0, 3)

  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name,
    url: `${BASE_URL}/${locale}${path}`,
    description: p.tagline[locale],
    price: planPrice(p),
    priceCurrency: 'COP',
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'HealthAndBeautyBusiness', name: BUSINESS.name, url: BUSINESS.url },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.home, item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t.hub, item: `${BASE_URL}/${locale}${PLANES_PATH}` },
      { '@type': 'ListItem', position: 3, name, item: `${BASE_URL}/${locale}${path}` },
    ],
  }

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale)} />
      <JsonLd data={offerJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />
      <LandingHead path={path} locale={locale} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <Link
          href={`/${locale}${PLANES_PATH}`}
          className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          {t.back}
        </Link>

        <section className="mt-12 mb-20 grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          <div>
            <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{p.occasion[locale]}</p>
            <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">{p.headline[locale]}</h1>
            <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">{p.intro[locale]}</p>
            <span className="font-label text-on-surface text-[10px] uppercase tracking-widest block mb-3">{t.idealFor}</span>
            <ul className="flex flex-wrap gap-3">
              {p.idealFor.map(i => (
                <li key={i.es} className="border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-widest uppercase text-on-surface">
                  {i[locale]}
                </li>
              ))}
            </ul>
          </div>

          <aside className="bg-surface-container border border-outline-variant/20 p-8 flex flex-col gap-5">
            <h2 className="font-headline text-2xl text-on-surface tracking-tighter">{name}</h2>
            <p className="flex flex-wrap gap-x-5 gap-y-2 font-label text-secondary text-xs tracking-widest">
              {min !== undefined && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">schedule</span>
                  {p.sessions ? t.sessions(p.sessions, min) : t.duration(min)}
                </span>
              )}
              {persons && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">person</span>
                  {t.persons(persons)}
                </span>
              )}
            </p>

            <div className="border-t border-outline-variant/20 pt-5">
              <span className="font-label text-on-surface text-[10px] uppercase tracking-widest block mb-3">
                {p.honoreeItems ? t.eachGuest : t.includes}
              </span>
              <ul className="flex flex-col gap-2">
                {[...itemLabels(p.items, locale), ...planExtraLabels(p, locale)].map(label => (
                  <li key={label} className="flex items-start gap-2 font-body text-secondary text-sm">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {p.honoreeItems && p.honoreeLabel && honoreePrice !== undefined && (
              <div className="border-t border-outline-variant/20 pt-5">
                <span className="font-label text-on-surface text-[10px] uppercase tracking-widest block mb-3">{p.honoreeLabel[locale]}</span>
                <p className="flex items-baseline justify-between gap-4 font-body text-secondary text-sm">
                  <span>{itemLabels(p.honoreeItems, locale).join(' + ')}</span>
                  <span className="font-headline text-on-surface text-lg tabular-nums">{formatCop(honoreePrice)}</span>
                </p>
              </div>
            )}

            <p className="border-t border-outline-variant/20 pt-5 flex items-baseline justify-between gap-4">
              <span className="font-headline text-primary text-3xl tabular-nums">{formatCop(planPrice(p))}</span>
              <span className="font-label text-outline text-[10px] uppercase tracking-widest">{t.priceUnit(p)}</span>
            </p>
            <p className="text-zinc-500 font-body text-xs leading-relaxed">{p.minPeople ? t.groupNote : t.priceNote}</p>

            <div className="flex flex-col gap-3">
              {planBooksOnline(p) ? (
                <Link href={planBookHref(p, locale)} className={btnPrimary}>
                  {t.book}
                </Link>
              ) : (
                <WhatsAppLink text={t.waText(name)} source={`planes-${p.slug}`} className={btnPrimary}>
                  {t.whatsapp}
                </WhatsAppLink>
              )}
              <WhatsAppLink text={t.giftText(name)} source={`planes-${p.slug}`} className={btnSecondary}>
                {t.gift}
              </WhatsAppLink>
            </div>
          </aside>
        </section>

        <FaqSection
          categories={[{ id: 'booking', icon: 'spa', label: t.faqLabel, items: faqs }]}
          title={t.faqTitle(name)}
          className="mb-20"
        />

        <section>
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-8">{t.otherPlans}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {others.map(o => (
              <PlanCard key={o.slug} plan={o} locale={locale} />
            ))}
          </div>
        </section>
      </main>

      <LocationSection locale={locale} />
    </>
  )
}
