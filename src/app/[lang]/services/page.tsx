import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { SERVICES, formatCop, type DurationMinutes } from '@/lib/services'

const DURATIONS: DurationMinutes[] = [30, 60, 90]

function serviceDisplayName(s: (typeof SERVICES)[number], locale: Locale) {
  return locale === 'en' ? s.name.en : s.name.es
}
function serviceShortDesc(s: (typeof SERVICES)[number], locale: Locale) {
  return locale === 'en' ? s.shortDesc.en : s.shortDesc.es
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  return { title: t.services.metaTitle, description: t.services.metaDesc }
}

export default function ServicesPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).services

  return (
    <>
      {/* HERO */}
      <header className="pt-40 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-5 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">{t.title}</h1>
          <p className="mt-8 text-on-surface-variant text-lg max-w-xl font-light leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      {/* Services grid */}
      <section className="py-12 px-6 md:px-12 bg-surface pb-24">
        <div className="max-w-screen-2xl mx-auto">
          <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest mb-10">{t.pricingNote}</p>

          <div className="divide-y divide-outline-variant/15">
            {SERVICES.map((service, idx) => {
              const name = serviceDisplayName(service, locale)
              const shortDesc = serviceShortDesc(service, locale)
              const isEven = idx % 2 === 0

              return (
                <div
                  key={service.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-6 py-10 items-center ${isEven ? 'bg-surface' : 'bg-surface-container-low/40'}`}
                >
                  {/* Index + name */}
                  <div className="md:col-span-4 flex items-start gap-4">
                    <span className="font-headline text-outline/25 text-3xl leading-none mt-0.5 shrink-0 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="font-headline text-xl md:text-2xl text-on-surface leading-tight">{name}</h2>
                      {/* Description hidden on mobile, visible md+ */}
                      <p className="hidden md:block mt-2 font-body text-sm text-secondary leading-relaxed max-w-xs">
                        {shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="md:col-span-5 grid grid-cols-3 gap-3">
                    {DURATIONS.map(min => (
                      <div key={min} className="flex flex-col">
                        <span className="font-label text-outline text-[10px] uppercase tracking-widest mb-1">
                          {min === 30 ? t.tableCol30 : min === 60 ? t.tableCol60 : t.tableCol90}
                        </span>
                        <span className="font-body text-on-surface tabular-nums text-sm">
                          {formatCop(service.prices[min])}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions — identical width & height */}
                  <div className="md:col-span-3 flex w-full flex-col gap-3 sm:flex-row md:flex-col">
                    <Link
                      href={`/${locale}/book?service=${service.id}`}
                      className="inline-flex min-h-[3rem] w-full flex-1 items-center justify-center border border-transparent bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-[0.15em] text-on-primary transition-all hover:bg-white sm:min-w-0 md:w-full md:flex-none"
                    >
                      {t.bookSession}
                    </Link>
                    <Link
                      href={`/${locale}/services/${service.id}`}
                      className="inline-flex min-h-[3rem] w-full flex-1 items-center justify-center border border-outline-variant/50 px-6 py-3 font-label text-xs font-bold uppercase tracking-[0.15em] text-secondary transition-all hover:border-primary hover:text-on-surface sm:min-w-0 md:w-full md:flex-none"
                    >
                      {t.learnMore}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 bg-surface-container-lowest text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">{t.ctaTitle}</h2>
          <p className="text-outline mb-12 uppercase tracking-widest text-xs font-label">{t.ctaSub}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              {t.reserveNow}
            </Link>
            <Link href={`/${locale}/book`} className="border border-outline-variant text-on-surface px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all">
              {t.inquireMembership}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
