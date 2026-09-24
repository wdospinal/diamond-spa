import type { Locale } from '@/lib/i18n'
import { SPA_ADDRESS, SPA_GOOGLE_MAPS_URL, SPA_RATING } from '@/lib/spa'

/**
 * Trust signals competitors lead with (reviews, certified staff), using only
 * facts we can back: the live Google rating constant, private cabin, pay on
 * arrival, and the address.
 */
export function ServiceTrustStrip({ locale }: { locale: Locale }) {
  const items = [
    {
      icon: 'star',
      text: locale === 'en'
        ? `${SPA_RATING.value} on Google · ${SPA_RATING.count} reviews`
        : `${SPA_RATING.value} en Google · ${SPA_RATING.count} reseñas`,
      href: SPA_GOOGLE_MAPS_URL,
    },
    { icon: 'verified', text: locale === 'en' ? 'Certified cosmetologists' : 'Cosmetólogas certificadas' },
    { icon: 'lock', text: locale === 'en' ? 'Private cabin' : 'Cabina privada' },
    { icon: 'payments', text: locale === 'en' ? 'No prepayment — pay at the spa' : 'Sin pago anticipado' },
    { icon: 'location_on', text: `${SPA_ADDRESS.neighborhood}, ${SPA_ADDRESS.city}` },
  ]
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {items.map(item => {
        const inner = (
          <>
            <span
              className="material-symbols-outlined text-primary text-base"
              style={item.icon === 'star' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            {item.text}
          </>
        )
        return (
          <li key={item.icon} className="font-label text-secondary text-xs tracking-wide">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">{inner}</a>
            ) : (
              <span className="flex items-center gap-2">{inner}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
