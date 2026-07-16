/**
 * LandingJsonLd — Server Component
 * ──────────────────────────────────
 * Reads the admin-configured JSON-LD for a page and injects it as a
 * <script type="application/ld+json"> alongside any hardcoded JSON-LD.
 *
 * USAGE (in a page's JSX, next to existing <JsonLd> calls):
 *
 *   <LandingJsonLd path="/massage-medellin" locale={locale} />
 *
 * If the admin hasn't configured a JSON-LD for this page, renders nothing.
 */

import { getAdminJsonLd } from '@/lib/landing-meta'

interface Props {
  /** URL path without locale prefix. Must match what is stored in the admin. */
  path: string
  locale: 'es' | 'en'
}

export default async function LandingJsonLd({ path, locale }: Props) {
  const raw = await getAdminJsonLd(path, locale)
  if (!raw) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: raw.replace(/</g, '\\u003c'),
      }}
    />
  )
}
