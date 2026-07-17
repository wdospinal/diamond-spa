'use client'

import { useEffect } from 'react'

/**
 * SemTracker — lightweight client component for non-landing pages.
 * When a user arrives via ?utm_source=ads, stores the UTM params in
 * sessionStorage so BookClient can attribute the booking correctly,
 * even if the user navigates from /services or /location before booking.
 */
export default function SemTracker() {
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      const source = p.get('utm_source')
      if (source === 'ads') {
        sessionStorage.setItem('sem_trigger_key', 'utm_source')
        sessionStorage.setItem('sem_trigger_value', 'ads')
        const campaign = p.get('utm_campaign')
        if (campaign) sessionStorage.setItem('sem_campaign', campaign)
        const adgroup = p.get('adgroup') || p.get('utm_content')
        if (adgroup) sessionStorage.setItem('sem_adgroup', adgroup)
      }
      // Always persist gclid if present — needed for offline conversion import in Google Ads
      const gclid = p.get('gclid')
      if (gclid) sessionStorage.setItem('gclid', gclid)
    } catch {
      // sessionStorage not available (private mode with storage blocked)
    }
  }, [])

  return null
}
