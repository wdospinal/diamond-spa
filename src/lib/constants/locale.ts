/**
 * Locale identifiers supported by the site.
 *
 * Order matters for the locale switcher UI: Spanish first (primary market),
 * English second.
 */
export type Locale = 'en' | 'es'

export const LOCALES: readonly Locale[] = ['en', 'es'] as const

/** Order used by the locale switcher (ES primary, EN secondary). */
export const LOCALES_DISPLAY_ORDER: readonly Locale[] = ['es', 'en'] as const

export const DEFAULT_LOCALE: Locale = 'es'

export function isLocale(v: unknown): v is Locale {
  return v === 'en' || v === 'es'
}
