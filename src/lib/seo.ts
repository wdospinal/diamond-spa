import type { Metadata } from 'next'
import {
  SPA_NAME,
  SPA_NAME_FULL,
  SPA_BASE_URL,
  SPA_OG_IMAGE,
  SPA_LOGO,
  SPA_EMAIL,
  SPA_PHONES,
  SPA_ADDRESS,
  SPA_GEO,
  SPA_HOURS,
} from './spa'

export const BASE_URL = SPA_BASE_URL
export const DEFAULT_OG_IMAGE = SPA_OG_IMAGE
export const SITE_NAME = SPA_NAME_FULL

// ─── hreflang + canonical ─────────────────────────────────────────────────────

export function buildAlternates(path: string): Metadata['alternates'] {
  const base = path === '' ? '' : path
  return {
    canonical: `${BASE_URL}/es${base}`,
    languages: {
      es: `${BASE_URL}/es${base}`,
      en: `${BASE_URL}/en${base}`,
      'x-default': `${BASE_URL}/es${base}`,
    },
  }
}

// ─── Open Graph ───────────────────────────────────────────────────────────────

interface OGOptions {
  title: string
  description: string
  path: string
  locale: 'en' | 'es'
  imageAlt?: string
}

export function buildOpenGraph(opts: OGOptions): Metadata['openGraph'] {
  const { title, description, path, locale, imageAlt } = opts
  return {
    type: 'website',
    siteName: SITE_NAME,
    title,
    description,
    url: `${BASE_URL}/${locale}${path}`,
    locale: locale === 'en' ? 'en_US' : 'es_CO',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: imageAlt ?? SITE_NAME,
      },
    ],
  }
}

// ─── Business constants (used in JSON-LD) ─────────────────────────────────────

export const BUSINESS = {
  name: SPA_NAME,
  telephone: SPA_PHONES[0].display,
  email: SPA_EMAIL,
  url: BASE_URL,
  logo: SPA_LOGO,
  image: DEFAULT_OG_IMAGE,
  address: {
    streetAddress: SPA_ADDRESS.street,
    addressLocality: SPA_ADDRESS.neighborhood,
    addressRegion: SPA_ADDRESS.region,
    postalCode: SPA_ADDRESS.postalCode,
    addressCountry: SPA_ADDRESS.country,
  },
  geo: {
    latitude: SPA_GEO.latitude,
    longitude: SPA_GEO.longitude,
  },
  hours: SPA_HOURS.map(h => ({
    dayOfWeek: h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  })),
} as const

// ─── JSON-LD helpers ──────────────────────────────────────────────────────────

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: BUSINESS.name,
    url: BUSINESS.url,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    logo: BUSINESS.logo,
    image: BUSINESS.image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.streetAddress,
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    openingHoursSpecification: BUSINESS.hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: '$$',
    servesCuisine: undefined,
    sameAs: [BUSINESS.url],
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
