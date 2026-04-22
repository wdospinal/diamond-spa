'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '')
  if (!id) return
  // Retry a few times to handle static pages where the DOM may not be fully
  // painted when this first runs (e.g. a direct link with a hash).
  let attempts = 0
  const tryScroll = () => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ block: 'start', behavior: 'auto' })
      return
    }
    if (++attempts < 10) setTimeout(tryScroll, 50)
  }
  tryScroll()
}

/**
 * Scrolls to the element matching `window.location.hash` on:
 *  - direct loads / shared links (e.g. /es/services#service-card-sports)
 *  - client-side navigation that sets a hash
 *  - hash changes within the same page
 */
export function ScrollToHash() {
  const pathname = usePathname()

  // Fires on client-side navigation (pathname or hash change)
  useEffect(() => {
    scrollToHash(window.location.hash)
  }, [pathname])

  // Fires on direct load and on hash-only changes (e.g. browser forward/back)
  useEffect(() => {
    // Initial page load with a hash
    if (window.location.hash) scrollToHash(window.location.hash)

    const onHashChange = () => scrollToHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return null
}
