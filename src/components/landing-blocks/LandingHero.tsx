'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { GoogleReviewBadge } from '@/components/GoogleReviewBadge'
import { pushEvent } from '@/lib/gtm'

// ─── DTR inner component (requires Suspense because of useSearchParams) ────────
function HeroContent({
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
  const searchParams = useSearchParams()
  const adgroup = searchParams?.get('adgroup') ?? ''

  // ── DTR Logic — replace H1/subtitle based on ?adgroup= ──────────────────────
  let displayH1 = h1
  let displaySubtitle = subtitle

  if (locale === 'es') {
    if (adgroup === 'spa') {
      displayH1 = 'Spa Exclusivo para Hombres en Medellín'
      displaySubtitle = 'El mejor spa para caballeros en El Poblado. Terapeutas certificadas, masajes e instalaciones de lujo.'
    } else if (adgroup === 'masajes') {
      displayH1 = 'Masajes para Hombres en Medellín'
      displaySubtitle = 'Desde $120.000 · Terapeutas certificadas · Masajes relajantes y tejido profundo en El Poblado.'
    }
  } else if (locale === 'en') {
    if (adgroup === 'medellin') {
      displayH1 = 'Massage Therapy in Medellín, El Poblado'
      displaySubtitle = 'Premium massages in El Poblado. Certified therapists, private rooms, and deep tissue specialists.'
    } else if (adgroup === 'men') {
      displayH1 = 'Exclusive Massages for Men in Medellín'
      displaySubtitle = 'The ultimate spa for men. Relaxing massages, certified therapists, and luxury private rooms.'
    }
  }

  // ── Track booking_click with full attribution (campaign + adgroup) ───────────
  function trackAdsClick(source: string) {
    const campaign = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('sem_campaign')
      : null
    const payload: Record<string, string> = {
      event_label: 'general',
      source,
    }
    if (campaign) payload.campaign = campaign
    if (adgroup)  payload.adgroup  = adgroup

    pushEvent('booking_click', payload)
  }

  const trust = {
    certified: locale === 'en' ? 'Certified therapists' : 'Terapeutas certificadas',
    private:   locale === 'en' ? 'Private rooms'        : 'Salas privadas',
    location:  locale === 'en' ? 'El Poblado, Medellín' : 'El Poblado, Medellín',
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
          {displayH1}
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
          {displaySubtitle}
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

// ─── Public export — wraps HeroContent in Suspense (required by useSearchParams) ─
export function LandingHero(props: {
  h1: string
  subtitle: string
  bgImage: string
  primaryCtaText: string
  secondaryCtaText: string
  locale?: 'es' | 'en'
}) {
  return (
    <Suspense fallback={
      // Show static hero while params resolve — keeps LCP paint fast
      <section className="relative min-h-[85vh] flex items-center justify-center pt-16 bg-[#0a1628] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={props.bgImage}
            alt={props.h1}
            fill
            priority
            fetchPriority="high"
            quality={70}
            sizes="100vw"
            className="object-cover"
            unoptimized={props.bgImage.startsWith('https://images.unsplash.com')}
          />
        </div>
        <div className="relative z-20 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">{props.h1}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">{props.subtitle}</p>
        </div>
      </section>
    }>
      <HeroContent {...props} />
    </Suspense>
  )
}
