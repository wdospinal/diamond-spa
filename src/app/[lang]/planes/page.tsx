import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { BASE_URL, BUSINESS, buildAlternates, buildOpenGraph, localBusinessJsonLd } from '@/lib/seo'
import { formatCop } from '@/lib/services'
import { PLANS, PLAN_AUDIENCE_ORDER, PLANES_PATH, planAudience, planPath, planPrice, plansByAudience } from '@/lib/planes'
import { specialDatesPath } from '@/lib/special-dates'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import WhatsAppLink from '@/components/WhatsAppLink'
import { LocationSection } from '@/components/LocationSection'
import { PlanCard } from '@/components/planes/PlanCard'
import { planUi } from '@/components/planes/plan-ui'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const t = planUi[locale]
  const title = t.hubMetaTitle
  const description = t.hubMetaDesc(formatCop(Math.min(...PLANS.map(planPrice))))
  return mergeLandingMetadata(
    PLANES_PATH,
    locale,
    { title, description },
    {
      alternates: buildAlternates(PLANES_PATH, locale),
      openGraph: buildOpenGraph({ title, description, path: PLANES_PATH, locale }),
    },
  )
}

export default async function PlanesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const t = planUi[locale]

  const catalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${t.hubH1} — ${BUSINESS.name}`,
    url: `${BASE_URL}/${locale}${PLANES_PATH}`,
    itemListElement: PLANS.map(p => ({
      '@type': 'Offer',
      name: p.name[locale],
      url: `${BASE_URL}/${locale}${planPath(p)}`,
      description: p.tagline[locale],
      price: planPrice(p),
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'HealthAndBeautyBusiness', name: BUSINESS.name, url: BUSINESS.url },
    })),
  }

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale)} />
      <JsonLd data={catalogJsonLd} />
      <LandingHead path={PLANES_PATH} locale={locale} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <section className="mb-16">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{t.hubLabel}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">{t.hubH1}</h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl">{t.hubIntro}</p>
        </section>

        {PLAN_AUDIENCE_ORDER.map(a => {
          const plans = plansByAudience(a)
          if (!plans.length) return null
          const aud = planAudience(a)
          return (
            <section key={a} className="mb-20">
              <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-3">{aud.title[locale]}</h2>
              <p className="text-zinc-400 font-body text-sm leading-relaxed max-w-2xl mb-8">{aud.intro[locale]}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(p => (
                  <PlanCard key={p.slug} plan={p} locale={locale} />
                ))}
              </div>
            </section>
          )
        })}

        <p className="text-zinc-500 font-body text-sm mb-12">{t.priceNote}</p>

        <section className="mb-12 bg-surface-container p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-3">{t.helpTitle}</h2>
            <p className="text-zinc-400 font-body text-sm max-w-xl">{t.helpBody}</p>
          </div>
          <WhatsAppLink
            text={t.helpText}
            source="planes"
            className="shrink-0 bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {t.helpCta}
          </WhatsAppLink>
        </section>

        <Link
          href={`/${locale}${specialDatesPath(locale)}`}
          className="font-label text-primary text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          {t.giftsLink}
        </Link>
      </main>

      <LocationSection locale={locale} />
    </>
  )
}
