import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd } from '@/lib/seo'
import { ReviewsSection } from '@/components/ReviewsSection'
import { PHONES } from '@/lib/phones'
import { SPA_ADDRESS, SPA_EMAIL } from '@/lib/spa'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  const { metaTitle: title, metaDesc: description } = t.location
  return {
    title,
    description,
    alternates: buildAlternates('/location'),
    openGraph: buildOpenGraph({ title, description, path: '/location', locale, imageAlt: 'Diamond Spa — Cra 43C #10-42, El Poblado, Medellín' }),
  }
}

export default function LocationPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).location

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      {/* HERO */}
      <header className="pt-12 md:pt-16 pb-20 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">
            {t.titleParts[0]}<br /><span className="italic text-primary">{t.titleParts[1]}</span>
          </h1>
        </div>
      </header>

      {/* ADDRESS + MAP */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <div className="mb-12">
              <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">{SPA_ADDRESS.street}</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic mt-4">{SPA_ADDRESS.neighborhood}</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic">{SPA_ADDRESS.city}, {SPA_ADDRESS.region}</p>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              {PHONES.map(({ display, wa }) => (
                <div key={wa} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">phone</span>
                  <span className="font-body text-secondary text-sm tracking-widest">{display}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-body text-secondary text-sm tracking-widest">{SPA_EMAIL}</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              <span className="material-symbols-outlined text-base">directions</span>
              {t.getDirections}
            </a>
          </div>
          <div className="min-h-[460px] overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia&output=embed&z=16"
              width="100%"
              height="460"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diamond Spa location"
            />
          </div>
        </div>
      </section>

      {/* REVIEWS — streamed independently so the page renders immediately */}
      <Suspense fallback={
        <section className="py-24 px-6 md:px-12 bg-surface">
          <div className="max-w-screen-2xl mx-auto">
            <div className="h-8 w-32 bg-surface-container-high animate-pulse rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-low p-8 h-48 animate-pulse rounded" />
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
              <span className="material-symbols-outlined text-primary text-3xl mb-6 block">lock</span>
              <h3 className="font-headline text-2xl text-on-surface mb-5">{t.privateTitle}</h3>
              <p className="font-body text-secondary leading-relaxed text-sm mb-8">{t.privateBody1}</p>
              <p className="font-body text-secondary leading-relaxed text-sm">{t.privateBody2}</p>
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
                <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
                <div>
                  <h4 className="font-label font-bold text-on-surface text-xs tracking-widest uppercase mb-2">{label}</h4>
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
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{t.ctaLabel}</span>
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
