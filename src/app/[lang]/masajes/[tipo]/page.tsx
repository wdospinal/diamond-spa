import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ServiceDetailTracker } from '@/components/ServiceDetailTracker'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { formatCop, getServiceById, serviceShortDesc, type DurationMinutes, type ServiceDef } from '@/lib/services'
import { DURATION_MINUTES } from '@/lib/constants'
import { BASE_URL, X_DEFAULT_LOCALE, buildOpenGraph, BUSINESS, faqJsonLd } from '@/lib/seo'
import { serviceFaqs } from '@/lib/service-seo'
import { MASAJES_TYPE_SEO, getMasajeTypeBySlug, slugForMasajeType } from '@/lib/masajes-category'
import { JsonLd } from '@/components/JsonLd'
import { FaqSection } from '@/components/FaqSection'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return (['en', 'es'] as const).flatMap(locale =>
    MASAJES_TYPE_SEO.map(entry => {
      const service = getServiceById(entry.serviceId)
      if (!service) return null
      return { lang: locale, tipo: slugForMasajeType(entry, locale, service) }
    }).filter((p): p is { lang: 'en' | 'es'; tipo: string } => p !== null),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; tipo: string }>
}): Promise<Metadata> {
  const { lang, tipo } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const entry = getMasajeTypeBySlug(tipo, locale)
  if (!entry) return {}
  const service = getServiceById(entry.serviceId)
  if (!service) return {}

  const name = locale === 'en' ? service.name.en : service.name.es
  const esSlug = entry.slugEs
  const enSlug = service.slugEn

  return mergeLandingMetadata(
    `/masajes/${tipo}`,
    locale,
    { title: entry.metaTitle[locale], description: entry.metaDescription[locale] },
    {
      alternates: {
        canonical: `${BASE_URL}/${locale}/masajes/${tipo}`,
        languages: {
          es: `${BASE_URL}/es/masajes/${esSlug}`,
          en: `${BASE_URL}/en/masajes/${enSlug}`,
          'x-default': `${BASE_URL}/${X_DEFAULT_LOCALE}/masajes/${X_DEFAULT_LOCALE === 'en' ? enSlug : esSlug}`,
        },
      },
      openGraph: buildOpenGraph({
        title: entry.metaTitle[locale],
        description: entry.metaDescription[locale],
        path: `/masajes/${tipo}`,
        locale,
        imageAlt: `${name} — Diamond Spa`,
      }),
      keywords: entry.keywords,
    },
  )
}

export default async function MasajeTipoPage({
  params,
}: {
  params: Promise<{ lang: string; tipo: string }>
}) {
  const { lang, tipo } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const entry = getMasajeTypeBySlug(tipo, locale)
  if (!entry) notFound()
  const service = getServiceById(entry.serviceId)
  if (!service) notFound()

  const t = getDict(locale).services
  const isEn = locale === 'en'
  const backFallbackClass =
    'font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors'
  const backCtaClass =
    'border border-outline-variant text-on-surface px-10 py-5 font-label text-xs uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all'
  const name = entry.h1[locale]
  const description = locale === 'en' ? service.description.en : service.description.es
  const slug = tipo
  const faqs = serviceFaqs(service, locale)

  const related = MASAJES_TYPE_SEO.filter(e => e.serviceId !== entry.serviceId).slice(0, 4)

  const servicePrice: number =
    service.pricingModel === 'flat' ? (service as ServiceDef & { pricingModel: 'flat'; price: number }).price
    : service.pricingModel === 'wax-machine' ? (service as ServiceDef & { pricingModel: 'wax-machine'; waxPrice: number; machinePrice: number }).waxPrice
    : (service as ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }).prices[60]

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'HealthAndBeautyBusiness', name: BUSINESS.name, url: BUSINESS.url },
    areaServed: { '@type': 'City', name: 'Medellín', addressCountry: 'CO' },
    offers: { '@type': 'Offer', priceCurrency: 'COP', price: servicePrice, availability: 'https://schema.org/InStock' },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isEn ? 'Massages' : 'Masajes', item: `${BASE_URL}/${locale}/masajes` },
      { '@type': 'ListItem', position: 3, name, item: `${BASE_URL}/${locale}/masajes/${slug}` },
    ],
  }

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd(faqs)} />
      <ServiceDetailTracker serviceId={service.id} serviceName={name} locale={locale} />

      <div className="pt-32 pb-0 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <Link href={`/${locale}/masajes`} className={backFallbackClass}>
            {isEn ? '← Back to Massages' : '← Volver a Masajes'}
          </Link>
        </div>
      </div>

      <header className="pt-12 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-5 block">
            {isEn ? service.category.en : service.category.es}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-tight mb-10">
            {name}
          </h1>
          <p className="font-body text-xl md:text-2xl text-secondary leading-relaxed font-light">
            {entry.intro[locale]}
          </p>
        </div>
      </header>

      {/* Benefits + "is this for you?" — the content block that actually
          resolves the visitor's real question before asking them to book. */}
      <section className="py-16 px-6 md:px-12 bg-surface">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-label text-outline text-xs uppercase tracking-widest mb-6">
              {isEn ? 'What this massage does for you' : 'Qué hace este masaje por ti'}
            </h2>
            <ul className="space-y-4">
              {entry.benefits[locale].map(b => (
                <li key={b} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5" aria-hidden="true">check_circle</span>
                  <span className="font-body text-secondary leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container border border-outline-variant/20 p-8 flex flex-col justify-center">
            <span className="font-label text-primary text-[10px] uppercase tracking-[0.2em] mb-3 block">
              {isEn ? 'Is this for you?' : '¿Es para ti?'}
            </span>
            <p className="font-body text-on-surface text-lg leading-relaxed">
              {entry.idealFor[locale]}
            </p>
            <Link
              href={`/${locale}/book?service=${service.id}&duration=60`}
              className="mt-6 inline-flex w-fit items-center gap-2 bg-primary text-on-primary px-8 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
            >
              {t.bookThisService}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing — all 7 massage types use duration-based pricing */}
      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-outline tracking-widest uppercase text-xs mb-8 block">
            {t.detailPricingLabel}
          </span>
          <div className="flex flex-col divide-y divide-outline-variant/20 md:hidden">
            {DURATION_MINUTES.map(min => (
              <div key={min} className="flex items-center justify-between py-4">
                <span className="font-label text-outline text-xs uppercase tracking-widest">
                  {min === 30 ? t.tableCol30 : min === 60 ? t.tableCol60 : t.tableCol90}
                </span>
                <span className="font-headline text-primary text-xl tabular-nums">
                  {formatCop((service as ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }).prices[min])}
                </span>
              </div>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-3 gap-8">
            {DURATION_MINUTES.map(min => (
              <div key={min} className="bg-surface p-8 flex flex-col gap-3">
                <span className="font-label text-outline text-[10px] uppercase tracking-widest">
                  {min === 30 ? t.tableCol30 : min === 60 ? t.tableCol60 : t.tableCol90}
                </span>
                <span className="font-headline text-primary text-3xl tabular-nums">
                  {formatCop((service as ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }).prices[min])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection
        categories={[{ id: 'booking', icon: 'spa', label: isEn ? 'Frequently asked questions' : 'Preguntas frecuentes', items: faqs }]}
        title={isEn ? `${name}: common questions` : `${name}: preguntas frecuentes`}
        className="py-20 px-6 md:px-12 bg-surface"
      />

      {/* Related massage types — internal links between the 7 siblings */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-label text-outline text-xs uppercase tracking-widest mb-8">
            {isEn ? 'Other massages you might like' : 'Otros masajes que te pueden interesar'}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-outline-variant/20">
            {related.map(r => {
              const rService = getServiceById(r.serviceId)
              if (!rService) return null
              const rSlug = slugForMasajeType(r, locale, rService)
              return (
                <li key={r.serviceId} className="bg-surface-container-low">
                  <Link
                    href={`/${locale}/masajes/${rSlug}`}
                    className="group flex flex-col gap-2 p-8 hover:bg-surface-container-high transition-colors"
                  >
                    <span className="font-headline text-on-surface text-xl group-hover:text-primary transition-colors">
                      {r.h1[locale]}
                    </span>
                    <span className="font-body text-secondary text-sm leading-relaxed">
                      {serviceShortDesc(rService, locale)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-5 items-start">
          <Link
            href={`/${locale}/book?service=${service.id}&duration=60`}
            className="bg-primary text-on-primary px-10 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            {t.bookThisService}
          </Link>
          <Link href={`/${locale}/masajes`} className={backCtaClass}>
            {isEn ? '← Back to Massages' : '← Volver a Masajes'}
          </Link>
        </div>
      </section>
    </>
  )
}
