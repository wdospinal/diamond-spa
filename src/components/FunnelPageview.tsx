'use client'

/**
 * Feeds the top of the sales funnel ("Visitas al sitio").
 *
 * Renders nothing — it just reports the first pageview of each browsing
 * session to /api/funnel-hit. Only one `visit` hit per session is recorded
 * (trackFunnelStage dedupes), so this deliberately does NOT re-fire on every
 * client-side route change: the funnel counts unique sessions, not pageviews.
 */

import { useEffect } from 'react'
import { trackFunnelStage } from '@/lib/funnel-client'

export default function FunnelPageview() {
  useEffect(() => {
    trackFunnelStage('visit')
  }, [])

  return null
}
