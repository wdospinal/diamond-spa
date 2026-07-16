import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, Locale, getDict } from '@/lib/i18n'
import { getLandingByPath } from '@/lib/landing-store'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'
import { mergeLandingMetadata } from '@/lib/landing-meta'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import LandingSemInit from '@/components/LandingSemInit'

// Import Landing Blocks
import { LandingHeader } from '@/components/landing-blocks/LandingHeader'
import { LandingHero } from '@/components/landing-blocks/LandingHero'
import { LandingTrustBar } from '@/components/landing-blocks/LandingTrustBar'
import { LandingServices } from '@/components/landing-blocks/LandingServices'
import { LandingWhyUs } from '@/components/landing-blocks/LandingWhyUs'
import { LandingGallery } from '@/components/landing-blocks/LandingGallery'
import { LandingTestimonials } from '@/components/landing-blocks/LandingTestimonials'
import { LandingLocation } from '@/components/landing-blocks/LandingLocation'
import { LandingFAQ } from '@/components/landing-blocks/LandingFAQ'
import { LandingFinalCTA } from '@/components/landing-blocks/LandingFinalCTA'
import { LandingFooter } from '@/components/landing-blocks/LandingFooter'
import { LandingTeam } from '@/components/landing-blocks/LandingTeam'
import { LandingFacilities } from '@/components/landing-blocks/LandingFacilities'
import { LandingBookingModal } from '@/components/landing-blocks/LandingBookingModal'

export const revalidate = 3600

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const path = `/l/${slug}`
  
  const landing = await getLandingByPath(path)
  if (!landing || !landing.content) return {}

  const seoData = landing.seo[locale] || landing.seo['es']
  const title = seoData?.metaTitle || landing.content.hero.h1
  const description = seoData?.metaDescription || landing.content.hero.subtitle

  return mergeLandingMetadata(
    path,
    locale,
    { title, description },
    {
      alternates: buildAlternates(path, locale),
      openGraph: buildOpenGraph({ title, description, path, locale }),
    }
  )
}

export default async function DynamicLandingPage({ params }: Props) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const path = `/l/${slug}`

  const landing = await getLandingByPath(path)
  if (!landing || !landing.content) notFound()

  const { sem, seo } = landing
  // Resolve locale-aware content: prefer content_en when locale=en and it exists,
  // fall back to content (Spanish) so existing landings never break.
  const content = (locale === 'en' && landing.content_en)
    ? landing.content_en
    : landing.content
  const seoData = seo[locale] || seo['es']
  const t = getDict(locale).book

  const phoneText = content.finalCta.phoneText || "+57 313 838 3838"
  const allowedServiceIds = content.services?.serviceIds

  return (
    <>
      <LandingSemInit triggerKey={sem.semTriggerKey} triggerValue={sem.semTriggerValue} hideChrome={sem.hideChrome} />
      <LandingHead path={path} locale={locale} />
      {seoData?.jsonLd && <JsonLd data={JSON.parse(seoData.jsonLd)} />}

      {/* 
        This div is necessary to reset global styles if the global layout is hiding things.
        The global layout script adds .is-ads to <html>, and global nav/footer might hide.
        We provide our own navigation. 
      */}
      <div className="landing-page-container bg-surface min-h-screen flex flex-col font-body">
        
        <LandingHeader phoneText={phoneText} locale={locale} />
        
        <main className="flex-1">
          <LandingHero {...content.hero} locale={locale} />
          
          <LandingTrustBar {...content.trustBar} />
          
          <LandingServices {...content.services} locale={locale} />
          
          <LandingWhyUs {...content.whyUs} />

          <LandingTeam locale={locale} />
          
          <LandingFacilities locale={locale} />
          
          {content.gallery && content.gallery.images && (
            <LandingGallery 
              images={content.gallery.images} 
              title={content.gallery.title}
              subtitle={content.gallery.subtitle}
            />
          )}
          
          {content.testimonials && (
            <LandingTestimonials {...content.testimonials} />
          )}
          
          <LandingLocation {...content.location} locale={locale} />
          
          {content.faqs && content.faqs.items && content.faqs.items.length > 0 && (
            <LandingFAQ {...content.faqs} />
          )}
          
          <LandingFinalCTA {...content.finalCta} locale={locale} />
        </main>

        <LandingFooter 
          phoneText={phoneText} 
          address={content.location.address}
          hours={content.location.hours}
          locale={locale}
        />

        {/* Booking Modal — opens when #reservar is in the URL */}
        <LandingBookingModal 
          locale={locale}
          t={t}
          allowedServiceIds={allowedServiceIds}
        />

      </div>
    </>
  )
}
