import type { UserData } from '@/lib/user-data'

/**
 * GTM dataLayer helper.
 *
 * Pushes events to window.dataLayer instead of calling window.gtag() directly.
 * This is the correct pattern when using Google Tag Manager because:
 *  - dataLayer is initialized by the GTM snippet BEFORE any tags fire.
 *  - gtag() is only available after GA4/Google Ads tags have loaded.
 *  - GTM reads the dataLayer internally and routes events to the right tags.
 *
 * Usage:
 *   pushEvent('booking_click', { source: 'hero', campaign: 'masajes_ads' })
 */
export function pushEvent(
  eventName: string,
  params: Record<string, string | number | boolean | UserData> = {},
): void {
  if (typeof window === 'undefined') return
  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).dataLayer.push({ event: eventName, ...params })
  if (typeof (window as any).gtag === 'function') {
    // user_data (teléfono) es solo para la etiqueta de Google Ads en GTM;
    // nunca se replica como parámetro de evento en gtag/GA4.
    const { user_data: _omit, ...analyticsParams } = params
    try {
      ;(window as any).gtag('event', eventName, analyticsParams)
    } catch {
      // ignore
    }
  }
}
