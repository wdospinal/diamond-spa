import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, faqJsonLd, localBusinessJsonLd } from '@/lib/seo'
import { getHomeFaqItems, type ResolvedFaqCategory } from '@/lib/faqs'
import { getHomeContent } from '@/lib/home-content'
import { getPlaceDetailsLive, getPlaceRating, type LivePlaceDetails } from '@/lib/google-places'
import { LandingTeam } from '@/components/landing-blocks/LandingTeam'
import { LandingFacilities } from '@/components/landing-blocks/LandingFacilities'
import { FaqSection } from '@/components/FaqSection'
import { HomeReviewsReal } from '@/components/home/HomeReviewsReal'
import {
  HomeCta,
  HomeFacts,
  HomeGuide,
  HomeHero,
  HomeHub,
  HomeLocation,
  HomeServices,
  HomeVideosSection,
} from '@/components/home/HomeSections'
import { JsonLd } from '@/components/JsonLd'

// Same as every other content page: prerender (ISR) instead of rendering on each request.
export const dynamic = 'force-static'
export const revalidate = 36000

// Prerender both locales at build time — without this the homepage is the only
// page served on-demand (first visitor after each deploy pays the render cost).
export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }]
}

/**
 * One rating for the whole page — visible stars, metadata and JSON-LD all read
 * it. Live from Google Places when GOOGLE_PLACES_API_KEY is set (cached by
 * Next for a day), otherwise the committed snapshot.
 */
function ratingOf(place: LivePlaceDetails): { value: string; count: number } {
  if (place.rating && place.userRatingCount) {
    return { value: place.rating.toFixed(1), count: place.userRatingCount }
  }
  return getPlaceRating()
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : 'es'
  const rating = ratingOf(await getPlaceDetailsLive())
  // The homepage owns "spa medellín" and the brand "Diamond Spa". It
  // deliberately does NOT target "para hombres" or "massage": Search Console
  // showed the homepage ranking (at 5-9) for those while the pages built for
  // them — /masajes-para-hombres and /en/massage-medellin — got almost no
  // impressions. One page per query group; the home links out to them instead.
  const { meta } = getHomeContent(locale, rating)
  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates('', locale),
    openGraph: buildOpenGraph({
      title: meta.title,
      description: meta.description,
      path: '',
      locale,
      imageAlt: meta.imageAlt,
    }),
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale

  const place = await getPlaceDetailsLive()
  const rating = ratingOf(place)
  const content = getHomeContent(locale, rating)

  const faqItems = getHomeFaqItems(locale)
  const faqCategories: ResolvedFaqCategory[] = [
    { id: 'discovery', icon: 'manage_search', label: content.faq.categoryLabel, items: faqItems },
  ]

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale, { rating })} />
      <JsonLd data={faqJsonLd(faqItems)} />
      <HomeHero locale={locale} rating={rating} content={content} />
      <HomeFacts content={content} />
      <HomeServices content={content} />
      <HomeVideosSection content={content} />
      {/* Same facilities gallery used by the paid landing pages, fed with
          real, optimized photos of our rooms. */}
      <LandingFacilities
        locale={locale}
        images={content.facilities.images}
        label={content.facilities.label}
        title={content.facilities.title}
        subtitle={content.facilities.subtitle}
        unoptimized={false}
      />
      {/* Same "Talento Diamond" block used by the landing pages — the team is
          the strongest trust signal we have, so it runs before the reviews. */}
      <LandingTeam locale={locale} />
      <HomeGuide content={content} />
      <HomeReviewsReal locale={locale} place={place} rating={rating} copy={content.reviews} />
      <FaqSection
        categories={faqCategories}
        title={content.faq.title}
        label={content.faq.label}
        intro={content.faq.intro}
        className="py-28 px-6 md:px-12 bg-surface-container-low"
      />
      <HomeLocation locale={locale} content={content} />
      <HomeHub content={content} />
      <HomeCta locale={locale} />
    </>
  )
}
