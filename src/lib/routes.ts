import { SERVICES, getServiceById, type ServiceDef } from '@/lib/services'
import { MASAJES_TYPE_SEO, getMasajeTypeBySlug, slugForMasajeType } from '@/lib/masajes-category'
import { type Locale } from '@/lib/i18n'

/**
 * Canonical, locale-prefixed URL of a service's detail page.
 *
 * Massage types moved from /services/[id] to /masajes/[tipo], and EN service
 * pages use English slugs. Links built by hand kept pointing at the old URLs,
 * so every one of them cost Googlebot a 308 hop (Search Console: 17 "Page with
 * redirect", and the waxing/blog pages stuck in "Discovered - currently not
 * indexed"). Always build service links through this.
 */
export function serviceHref(service: ServiceDef | string, locale: Locale): string {
  const svc = typeof service === 'string' ? getServiceById(service) : service
  if (!svc) throw new Error(`serviceHref: unknown service "${service}"`)
  const masaje = MASAJES_TYPE_SEO.find(t => t.serviceId === svc.id)
  if (masaje) return `/${locale}/masajes/${slugForMasajeType(masaje, locale, svc)}`
  return `/${locale}/services/${locale === 'en' ? svc.slugEn : svc.id}`
}

/** True when the service's canonical page lives under /masajes, not /services. */
export function isMasajeService(serviceId: string): boolean {
  return MASAJES_TYPE_SEO.some(t => t.serviceId === serviceId)
}

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

  // Blog posts: a post may be published in one locale only, and EN may use its
  // own slugEn — neither is knowable from the path here. Reusing the slug
  // linked Spanish-only posts to an /en URL that 404s, so switch to the
  // target locale's blog index, which always exists.
  if (baseRoute === 'blog' && segments.length > 2) {
    return segments[0] === targetLocale ? pathname : `/${targetLocale}/blog`
  }

  // Fallback: Naive replacement for routes that don't change their slug (e.g. /about, /book)
  const stripped = pathname.replace(/^\/(en|es)/, '')
  return `/${targetLocale}${stripped}`
}
