'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { LOCALES_DISPLAY_ORDER } from '@/lib/constants'

interface NavLink {
  label: string
  href: string
}

export default function NavLinksClient({
  links,
  locale,
}: {
  links: NavLink[]
  locale: Locale
}) {
  const pathname = usePathname()

  function switchedPath(targetLocale: Locale) {
    if (!pathname) return `/${targetLocale}`
    const stripped = pathname.replace(/^\/(en|es)/, '') || '/'
    return `/${targetLocale}${stripped}`
  }

  function isActive(href: string) {
    if (!pathname) return false
    // Exact match or sub-path (e.g. /es/services/deep-tissue)
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
      <div className="hidden md:flex gap-10 items-center">
        {links.map(({ label, href }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative font-label text-xs tracking-widest uppercase transition-colors duration-200 group ${
                active ? 'text-primary' : 'text-outline hover:text-primary'
              }`}
            >
              {label}
              {/* Active underline indicator */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${
                  active ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
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
