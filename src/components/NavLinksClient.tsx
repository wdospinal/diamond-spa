'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { LOCALES_DISPLAY_ORDER } from '@/lib/constants'

import { getLocalizedPath } from '@/lib/routes'

interface NavLink {
  label: string
  href: string | null   // null = dropdown-only trigger (e.g. "Más"), not a real page
  children?: { label: string; href: string }[]
}

// Timing per UX research consensus (Baymard, NN/g): a short open-delay stops
// dropdowns flashing open when a cursor just passes over the bar, and a
// longer close-delay survives the "diagonal problem" — moving the cursor
// down-and-across into the panel instead of straight down.
const OPEN_DELAY_MS = 120
const CLOSE_DELAY_MS = 300

export default function NavLinksClient({
  links,
  locale,
}: {
  links: NavLink[]
  locale: Locale
}) {
  const pathname = usePathname()
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  function scheduleOpen(idx: number) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setOpenIdx(idx), OPEN_DELAY_MS)
  }

  function scheduleClose() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenIdx(null), CLOSE_DELAY_MS)
  }

  // Click elsewhere, or Escape, closes whatever's open — standard dropdown hygiene.
  useEffect(() => {
    if (openIdx === null) return
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        clearTimers()
        setOpenIdx(null)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') { clearTimers(); setOpenIdx(null) }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [openIdx])

  useEffect(() => () => clearTimers(), [])

  function switchedPath(targetLocale: Locale) {
    return getLocalizedPath(pathname, targetLocale)
  }

  function isActive(href: string | null) {
    if (!pathname || !href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const LOCALE_LABELS: Record<Locale, { name: string; switchTo: string }> = {
    en: { name: 'English', switchTo: 'Switch to English' },
    es: { name: 'Español', switchTo: 'Cambiar a español' },
  }
  const localeSwitcherLabel = locale === 'es' ? 'Cambiar idioma' : 'Change language'

  return (
    <>
      {/* Nav links */}
      <div className="hidden md:flex gap-10 items-center" ref={navRef}>
        {links.map(({ label, href, children }, idx) => {
          const active = isActive(href)
          const hasChildren = !!children?.length
          const isOpen = openIdx === idx
          const triggerClass = `relative font-label text-xs tracking-widest uppercase transition-colors duration-200 inline-flex items-center gap-1 ${
            active || isOpen ? 'text-primary' : 'text-outline hover:text-primary'
          }`
          const underline = (
            <span
              aria-hidden="true"
              className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${
                active ? 'w-full' : isOpen ? 'w-full' : 'w-0'
              }`}
            />
          )
          const chevron = hasChildren && (
            <span
              className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              expand_more
            </span>
          )

          return (
            <div
              key={label}
              className="relative"
              onMouseEnter={() => hasChildren && scheduleOpen(idx)}
              onMouseLeave={() => hasChildren && scheduleClose()}
            >
              {href ? (
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  aria-haspopup={hasChildren ? 'true' : undefined}
                  aria-expanded={hasChildren ? isOpen : undefined}
                  onClick={() => hasChildren && setOpenIdx(isOpen ? null : idx)}
                  className={triggerClass}
                >
                  {label}{chevron}{underline}
                </Link>
              ) : (
                // Pure dropdown trigger (e.g. "Más") — not a real page, so no <Link>.
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className={triggerClass}
                >
                  {label}{chevron}{underline}
                </button>
              )}

              {hasChildren && (
                // pt-3 bridges the gap to the trigger; the open/close TIMING
                // (not just this bridge) is what actually survives the
                // diagonal mouse path into the panel.
                <div
                  role="menu"
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 z-50 ${
                    isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                  }`}
                >
                  <div className="min-w-[190px] bg-surface border border-outline-variant/20 shadow-xl py-2">
                    {children!.map(c => (
                      <Link
                        key={c.href}
                        href={c.href}
                        role="menuitem"
                        onClick={() => setOpenIdx(null)}
                        className="block px-5 py-2.5 font-label text-[11px] tracking-widest uppercase text-outline hover:text-primary hover:bg-surface-container-low transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Locale switcher — desktop only; on mobile it lives inside the menu panel */}
      <div
        className="hidden md:flex items-center border border-outline-variant/20"
        role="group"
        aria-label={localeSwitcherLabel}
      >
        {LOCALES_DISPLAY_ORDER.map(l => {
          const isCurrent = locale === l
          return (
            <Link
              key={l}
              href={switchedPath(l)}
              hrefLang={l}
              lang={l}
              aria-label={LOCALE_LABELS[l].switchTo}
              aria-current={isCurrent ? 'true' : undefined}
              className={`px-2.5 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all ${
                isCurrent
                  ? 'bg-primary text-on-primary'
                  : 'text-outline hover:text-primary'
              }`}
            >
              {l}
            </Link>
          )
        })}
      </div>
    </>
  )
}
