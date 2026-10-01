import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { IMG_HERO_LOCATION } from '@/lib/images'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd } from '@/lib/seo'
import { ReviewsSection } from '@/components/ReviewsSection'
import { JsonLd } from '@/components/JsonLd'
import { LocationSection } from '@/components/LocationSection'
import { SPA_ADDRESS } from '@/lib/spa'
import SemTracker from '@/components/SemTracker'

export const revalidate = 3600

// Pre-render both locales at build time; ISR revalidates every hour.
export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'es'
  const t = getDict(locale)
  const { metaTitle: title, metaDesc: description } = t.location
  return {
    title,
    description,
    alternates: buildAlternates('/location', locale),
    openGraph: buildOpenGraph({ title, description, path: '/location', locale, imageAlt: `Diamond Spa — ${SPA_ADDRESS.full}` }),
  }
}

export default async function LocationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const t = getDict(locale).location

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale)} />
      <SemTracker />
      {/* HERO */}
      <header className="relative pt-12 md:pt-16 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* priority={true} emits <link rel="preload" fetchpriority="high"> in <head>
              so the browser discovers the image at HTML-parse time, not after JS. */}
          <Image
            src={IMG_HERO_LOCATION}
            alt={locale === 'es'
              ? `Ubicación de Diamond Spa en ${SPA_ADDRESS.full}, El Poblado, Medellín`
              : `Location of Diamond Spa at ${SPA_ADDRESS.full}, El Poblado, Medellín`}
            fill
            priority
            fetchPriority="high"
            quality={65}
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">
            {t.titleParts[0]}<br /><span className="italic text-primary">{t.titleParts[1]}</span>
          </h1>
        </div>
      </header>

      {/* ADDRESS + MAP */}
      <LocationSection locale={locale} />

      {/* REVIEWS — streamed independently so the page renders immediately */}
      <Suspense fallback={
        <section className="py-24 px-6 md:px-12 bg-surface">
          <div className="max-w-screen-2xl mx-auto">
            <div className="h-8 w-32 bg-surface-container-high animate-pulse rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(num => (
                <div key={num} className="bg-surface-container-low p-8 h-48 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </section>
      }>
        <ReviewsSection locale={locale} />
      </Suspense>

      {/* HOURS */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{t.hoursLabel}</span>
            <div className="flex flex-col gap-0">
              {t.hours.map(({ day, time }, i) => (
                <div key={day} className={`flex justify-between items-center py-6 ${i < t.hours.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                  <span className="font-body text-secondary text-sm">{day}</span>
                  <span className="font-label text-on-surface text-sm tracking-widest">{time}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-body text-xs text-outline leading-relaxed">{t.hoursNote}</p>
          </div>
          <div className="bg-surface-container-high p-10 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-6 block" aria-hidden="true">lock</span>
              <h3 className="font-headline text-2xl text-on-surface mb-5">{t.privateTitle}</h3>
              <p className="font-body text-secondary leading-relaxed text-sm mb-8">{t.privateBody1}</p>
            </div>
            <Link href={`/${locale}/book`} className="mt-10 w-fit bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {t.reserveDirections}
            </Link>
          </div>
        </div>
      </section>

      {/* TRANSPORT */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-12 block">{t.transportLabel}</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {t.transport.map(({ icon, label, detail }, i) => (
              <div key={label} className={`flex gap-6 items-start p-10 hover:bg-surface-container-high transition-colors duration-300 ${i < t.transport.length - 1 ? 'md:border-r border-outline-variant/10' : ''}`}>
                <span className="material-symbols-outlined text-primary text-2xl shrink-0" aria-hidden="true">{icon}</span>
                <div>
                  <h4 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase mb-2">{label}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">{t.ctaTitle}</h2>
          <p className="font-body text-secondary text-sm mb-12 leading-relaxed">{t.ctaBody}</p>
          <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
            {t.bookVisit}
          </Link>
        </div>
      </section>
    </>
  )
}
