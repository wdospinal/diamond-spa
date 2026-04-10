import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { SERVICES, formatCop, getServiceById, type DurationMinutes } from '@/lib/services'

const DURATIONS: DurationMinutes[] = [30, 60, 90]

export async function generateStaticParams() {
  return SERVICES.map(s => ({ serviceId: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; serviceId: string }
}): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const service = getServiceById(params.serviceId)
  if (!service) return {}
  const name = locale === 'en' ? service.name.en : service.name.es
  const desc = locale === 'en' ? service.shortDesc.en : service.shortDesc.es
  return {
    title: `${name} — Diamond Spa Medellín`,
    description: desc,
  }
}

export default function ServiceDetailPage({
  params,
}: {
  params: { lang: string; serviceId: string }
}) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const service = getServiceById(params.serviceId)
  if (!service) notFound()

  const t = getDict(locale).services
  const name = locale === 'en' ? service.name.en : service.name.es
  const description = locale === 'en' ? service.description.en : service.description.es

  return (
    <>
      {/* Back link */}
      <div className="pt-32 pb-0 px-6 md:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <Link
            href={`/${locale}/services`}
            className="font-label text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            {t.backToServices}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <header className="pt-12 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-5 block">
            {locale === 'en' ? service.category.en : service.category.es}
          </span>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-tight mb-10">
            {name}
          </h1>
          <p className="font-body text-xl md:text-2xl text-secondary leading-relaxed font-light">
            {description}
          </p>
        </div>
      </header>

      {/* Pricing */}
      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-outline tracking-widest uppercase text-xs mb-8 block">
            {t.detailPricingLabel}
          </span>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {DURATIONS.map(min => (
              <div key={min} className="bg-surface p-6 md:p-8 flex flex-col gap-3">
                <span className="font-label text-outline text-[10px] uppercase tracking-widest">
                  {min === 30 ? t.tableCol30 : min === 60 ? t.tableCol60 : t.tableCol90}
                </span>
                <span className="font-headline text-primary text-2xl md:text-3xl tabular-nums">
                  {formatCop(service.prices[min])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-5 items-start">
          <Link
            href={`/${locale}/book?service=${service.id}`}
            className="bg-primary text-on-primary px-10 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            {t.bookThisService}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="border border-outline-variant text-on-surface px-10 py-5 font-label text-xs uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all"
          >
            {t.backToServices}
          </Link>
        </div>
      </section>
    </>
  )
}
