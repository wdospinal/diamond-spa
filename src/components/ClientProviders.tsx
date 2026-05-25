'use client'

/**
 * Client-only providers loaded lazily after hydration.
 *
 * Using `next/dynamic` + `ssr: false` inside a Client Component is valid and
 * moves these modules out of the critical JS bundle into a separate lazy chunk,
 * saving ~28 KiB of unused JavaScript on initial page load.
 *
 * Why each is deferred:
 * - CookieConsent   → always renders null on first paint (reads localStorage in
 *                     useEffect), so no UX impact from deferring.
 * - Analytics       → Vercel already injects its script lazily; the React
 *                     wrapper is dead weight in the critical path.
 * - SpeedInsights   → same reasoning as Analytics.
 */
import dynamic from 'next/dynamic'

const Analytics     = dynamic(() => import('@vercel/analytics/react').then(m => ({ default: m.Analytics })),         { ssr: false })
const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(m => ({ default: m.SpeedInsights })), { ssr: false })
const CookieConsent = dynamic(() => import('@/components/CookieConsent'),                                            { ssr: false })

export default function ClientProviders() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <CookieConsent />
    </>
  )
}
