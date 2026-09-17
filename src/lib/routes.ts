import { SERVICES, getServiceById } from '@/lib/services'
import { getMasajeTypeBySlug, slugForMasajeType } from '@/lib/masajes-category'
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

  // Handle translated dynamic routes: /masajes/[tipo] — ES slugs are keyword-
  // optimized (e.g. "piedras-volcanicas") and differ from the EN slugEn values.
  if (baseRoute === 'masajes' && segments.length > 2) {
    const currentLocale: Locale = segments[0] === 'en' ? 'en' : 'es'
    const slug = segments[2]
    const entry = getMasajeTypeBySlug(slug, currentLocale)

    if (entry) {
      const service = getServiceById(entry.serviceId)
      if (service) {
        const targetSlug = slugForMasajeType(entry, targetLocale, service)
        const rest = segments.slice(3).join('/')
        return `/${targetLocale}/masajes/${targetSlug}${rest ? `/${rest}` : ''}`
      }
    }
  }

  // Fallback: Naive replacement for routes that don't change their slug (e.g. /about, /book)
  const stripped = pathname.replace(/^\/(en|es)/, '')
  return `/${targetLocale}${stripped}`
}
