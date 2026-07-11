'use client'

import Image from 'next/image'
import { GoogleReviewBadge } from '@/components/GoogleReviewBadge'

function trackAdsClick(source: string, serviceSlug?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag("event", "booking_click", {
      event_category: "engagement",
      event_label: serviceSlug ?? "general",
      source,
      campaign: "nucleo_hombres",
    })
  }
}

export function LandingHero({
  h1,
  subtitle,
  bgImage,
  primaryCtaText,
  secondaryCtaText,
  locale = 'es',
}: {
  h1: string
  subtitle: string
  bgImage: string
  primaryCtaText: string
  secondaryCtaText: string
  locale?: 'es' | 'en'
}) {
  const trust = {
    certified: locale === 'en' ? 'Certified therapists'  : 'Terapeutas certificadas',
    private:   locale === 'en' ? 'Private rooms'         : 'Salas privadas',
    location:  locale === 'en' ? 'El Poblado, Medellín'  : 'El Poblado, Medellín',
  }
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-16 bg-[#0a1628] text-white overflow-hidden">
      {/* Background Image — Next.js Image with priority for LCP optimization */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src={bgImage}
          alt={h1}
          fill
          priority
          fetchPriority="high"
          quality={70}
          sizes="100vw"
          className="object-cover"
          unoptimized={bgImage.startsWith('https://images.unsplash.com')}
        />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">

        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
          {h1}
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
          {subtitle}
        </p>

        <div className="mb-6 flex justify-center">
          <GoogleReviewBadge locale={locale} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <a
            href="#reservar"
            onClick={() => trackAdsClick('hero')}
            className="inline-flex items-center justify-center gap-2 bg-[#C9A876] text-[#0a1628] font-medium px-8 py-3 rounded-full hover:bg-[#dbb98c] transition-colors"
          >
            <span className="material-symbols-outlined">event</span>
            {primaryCtaText}
          </a>
          <a
            href="#servicios"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            {secondaryCtaText}
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            {trust.certified}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">privacy_tip</span>
            {trust.private}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {trust.location}
          </span>
        </div>
      </div>
    </section>
  )
}
