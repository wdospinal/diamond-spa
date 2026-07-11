/**
 * landing-meta.ts
 * ──────────────
 * Server-side utilities that merge the admin-managed landing config with the
 * hardcoded metadata in each page. Import this in generateMetadata() to let
 * the admin override titles, descriptions and JSON-LD without touching code.
 *
 * USAGE (in any page's generateMetadata):
 *
 *   import { mergeLandingMetadata } from '@/lib/landing-meta'
 *
 *   export async function generateMetadata({ params }) {
 *     const { lang } = await params
 *     const locale = isLocale(lang) ? lang : 'es'
 *     const fallback = {
 *       title: 'Hardcoded title',
 *       description: 'Hardcoded description',
 *     }
 *     return mergeLandingMetadata('/my-page', locale, fallback, {
 *       alternates: buildAlternates('/my-page', locale),
 *       openGraph: buildOpenGraph({ ... }),
 *     })
 *   }
 */

import type { Metadata } from 'next'
import { getLandingByPath } from '@/lib/landing-store'

export interface FallbackMeta {
  title: string
  description: string
}

/**
 * Reads the admin landing config for `path` and merges it over `fallback`.
 * Fields present in the admin config override the hardcoded values.
 * Fields NOT set in the admin config fall back to the hardcoded values.
 *
 * @param path        URL path without locale prefix, e.g. '/massage-medellin'
 * @param locale      'es' | 'en'
 * @param fallback    Hardcoded title & description (always shown if no config)
 * @param extra       Any extra Metadata fields (alternates, openGraph, etc.)
 *                    These are merged last and can reference the resolved title/desc
 */
export async function mergeLandingMetadata(
  path: string,
  locale: 'es' | 'en',
  fallback: FallbackMeta,
  extra?: Omit<Metadata, 'title' | 'description'>,
): Promise<Metadata> {
  const config = await getLandingByPath(path)
  const localeData = config?.seo[locale]

  const title       = localeData?.metaTitle?.trim()       || fallback.title
  const description = localeData?.metaDescription?.trim() || fallback.description

  return {
    title,
    description,
    ...extra,
  }
}

/**
 * Returns the raw JSON-LD string stored in the admin for a given path/locale,
 * or null if none is configured. The caller decides how to inject it.
 */
export async function getAdminJsonLd(
  path: string,
  locale: 'es' | 'en',
): Promise<string | null> {
  const config = await getLandingByPath(path)
  const raw = config?.seo[locale]?.jsonLd?.trim()
  return raw || null
}

/**
 * Returns the SEM config for a given path, or null if not configured.
 * Used by server components to pass the SEM trigger down to the
 * LandingSemInit client component.
 */
export async function getAdminSemConfig(path: string) {
  const config = await getLandingByPath(path)
  if (!config) return null
  return {
    hideChrome:      config.sem.hideChrome,
    triggerKey:      config.sem.semTriggerKey,
    triggerValue:    config.sem.semTriggerValue,
  }
}
