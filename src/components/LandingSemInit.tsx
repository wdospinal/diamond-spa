'use client'

import { useEffect } from 'react'

interface Props {
  triggerKey: string
  triggerValue: string
  /**
   * Whether this page should hide nav & footer when the SEM trigger fires.
   * When false, we actively REMOVE .is-ads (even if the inline script added it)
   * and store 'false' in sessionStorage so the next hard navigation also skips it.
   */
  hideChrome: boolean
}

/**
 * LandingSemInit — Client Component
 * ───────────────────────────────────
 * Authoritative client-side controller for the .is-ads CSS class.
 * Runs after hydration and sets the final correct state based on:
 *   1. The current URL params
 *   2. Whether the admin enabled hideChrome for this page
 *
 * Also persists the config to sessionStorage so the inline script in
 * layout.tsx can apply the right state on the NEXT hard navigation
 * to this page (before React even hydrates, avoiding FOUC).
 *
 * hideChrome=true  + trigger in URL  → add .is-ads
 * hideChrome=false + trigger in URL  → FORCE remove .is-ads (admin disabled it)
 * hideChrome=true  + no trigger      → remove .is-ads
 */
export default function LandingSemInit({ triggerKey, triggerValue, hideChrome }: Props) {
  useEffect(() => {
    try {
      const params    = new URLSearchParams(window.location.search)
      const triggered = params.get(triggerKey) === triggerValue
      const shouldHide = hideChrome && triggered

      // Apply the final correct state immediately after hydration.
      // This overrides whatever the inline script may have set.
      document.documentElement.classList.toggle('is-ads', shouldHide)

      // Persist to sessionStorage so the layout.tsx script uses the
      // right settings on the next hard navigation / page reload.
      if (!hideChrome) {
        // Tell the script: this page has disabled SEM mode — don't touch the class.
        sessionStorage.setItem('sem_hide_chrome', 'false')
        // Clear the trigger keys so they don't bleed into other pages.
        sessionStorage.removeItem('sem_trigger_key')
        sessionStorage.removeItem('sem_trigger_value')
        sessionStorage.removeItem('sem_campaign')
      } else {
        // Store the custom trigger config for future hard navigations.
        sessionStorage.removeItem('sem_hide_chrome')
        sessionStorage.setItem('sem_trigger_key',   triggerKey)
        sessionStorage.setItem('sem_trigger_value', triggerValue)
        const utmCampaign = params.get('utm_campaign')
        if (utmCampaign) {
          sessionStorage.setItem('sem_campaign', utmCampaign)
        }
      }
    } catch {
      // sessionStorage unavailable (private browsing with storage blocked, etc.)
    }

    return () => {
      // On unmount (navigating away), remove .is-ads so other pages
      // don't inherit the state from this one.
      try {
        document.documentElement.classList.remove('is-ads')
      } catch { /* ignore */ }
    }
  }, [triggerKey, triggerValue, hideChrome])

  return null
}
