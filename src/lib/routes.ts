import { SERVICES } from '@/lib/services'
import { type Locale } from '@/lib/i18n'

/**
 * Given a current pathname and a target locale, returns the properly localized path.
 * This intelligently handles routes where the URL slug itself changes between languages
 * (e.g. /en/services/hydrafacial -> /es/services/hidrafacial).
 */
export function getLocalizedPath(pathname: string | null, targetLocale: Locale): string {
  if (!pathname) return `/${targetLocale}`

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return `/${targetLocale}`

  const baseRoute = segments[1]

  // Handle translated dynamic routes: /services/[slug]
  if (baseRoute === 'services' && segments.length > 2) {
    const slug = segments[2]
    
    // Find matching service across both language slugs
    const service = SERVICES.find(s => s.id === slug || s.slugEn === slug)
    
    if (service) {
      const targetSlug = targetLocale === 'en' ? service.slugEn : service.id
      // Preserve any additional segments after the slug (if they exist)
      const rest = segments.slice(3).join('/')
      return `/${targetLocale}/services/${targetSlug}${rest ? `/${rest}` : ''}`
    }
  }

  // Fallback: Naive replacement for routes that don't change their slug (e.g. /about, /book)
  const stripped = pathname.replace(/^\/(en|es)/, '')
  return `/${targetLocale}${stripped}`
}
