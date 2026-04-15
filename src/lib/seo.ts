import type { Metadata } from 'next'

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://diamondspa.com.co'

/** Public path to the default OG share image (1200×630). */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`

export const SITE_NAME = 'Diamond Spa Medellín'

// ─── hreflang + canonical ─────────────────────────────────────────────────────

/**
 * Builds the `alternates` block for Next.js Metadata.
 * Canonical always points to the Spanish (default) version.
 *
 * @param path  The path after the locale segment, e.g. '/services' or ''
 */
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
  /** The path after the locale segment, e.g. '/services' */
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
  name: 'Diamond Spa',
  telephone: '+573054541635',
  email: 'book@diamondspa.com.co',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: DEFAULT_OG_IMAGE,
  address: {
    streetAddress: 'Cra 43C #10-42',
    addressLocality: 'El Poblado',
    addressRegion: 'Antioquia',
    postalCode: '050021',
    addressCountry: 'CO',
  },
  geo: {
    latitude: 6.2072,
    longitude: -75.5680,
  },
  hours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '22:00',
    },
    {
      dayOfWeek: ['Sunday'],
      opens: '10:00',
      closes: '18:00',
    },
  ],
} as const

// ─── JSON-LD helpers ──────────────────────────────────────────────────────────

/** LocalBusiness / HealthAndBeautyBusiness schema */
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
