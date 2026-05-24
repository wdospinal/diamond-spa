'use client'
/**
 * Activates the Material Symbols Outlined icon font after hydration.
 *
 * Strategy:
 *  1. layout.tsx adds <link rel="preload" as="style"> to the <head> at
 *     SSR time — the browser starts downloading the font CSS immediately
 *     when the HTML is parsed (no waiting for JS).
 *  2. This component fires on mount and promotes that preload link to a
 *     full stylesheet in one DOM mutation, with no extra network request.
 *  3. Falls back to creating a fresh <link> if no preload is found.
 *
 * The icon font is subset to only the icons used in this project
 * (~35–40 KB vs the full variable font at ~3,852 KB).
 * All icon names are maintained in @/lib/material-symbols.ts.
 */

import { useEffect } from 'react'
import { MATERIAL_SYMBOLS_HREF } from '@/lib/material-symbols'

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    // Already applied — nothing to do (handles StrictMode double-invoke / HMR)
    if (document.querySelector(`link[rel="stylesheet"][href="${MATERIAL_SYMBOLS_HREF}"]`)) return

    // Promote the SSR preload link to a stylesheet — zero extra round-trip
    const preloaded = document.querySelector(
      `link[rel="preload"][href="${MATERIAL_SYMBOLS_HREF}"]`
    ) as HTMLLinkElement | null
    if (preloaded) {
      preloaded.rel = 'stylesheet'
      return
    }

    // Fallback: create a new stylesheet link (e.g. on pages without the preload)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = MATERIAL_SYMBOLS_HREF
    document.head.appendChild(link)
  }, [])

  return null
}
