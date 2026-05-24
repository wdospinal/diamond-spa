'use client'
/**
 * Loads Material Symbols Outlined asynchronously after the page is interactive
 * so it never blocks the critical rendering path.
 *
 * The font is subset to only the 19 icons used in this project
 * (icon_names= param) — ~30 KB vs the full variable font at ~3,852 KB.
 *
 * Icons used: arrow_forward, check_circle, chevron_left, chevron_right,
 * directions, expand_less, expand_more, location_on, lock, mail, map,
 * open_in_new, phone, psychology, rate_review, schedule, star,
 * support_agent, verified
 */

import { useEffect } from 'react'

const MATERIAL_SYMBOLS_HREF =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0..1,0' +
  '&icon_names=arrow_forward,check_circle,chevron_left,chevron_right,directions,expand_less,expand_more,' +
  'location_on,lock,mail,map,open_in_new,phone,psychology,rate_review,schedule,star,support_agent,verified' +
  '&display=block'

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    // Skip if already injected (StrictMode double-invoke, HMR, etc.)
    if (document.querySelector(`link[href="${MATERIAL_SYMBOLS_HREF}"]`)) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = MATERIAL_SYMBOLS_HREF
    document.head.appendChild(link)
  }, [])

  return null
}
