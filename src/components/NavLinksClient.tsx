'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'

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
              className={`relative font-label text-xs tracking-widest uppercase transition-colors duration-200 group ${
                active ? 'text-primary' : 'text-outline hover:text-primary'
              }`}
            >
              {label}
              {/* Active underline indicator */}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${
                  active ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          )
        })}
      </div>

      {/* Locale switcher — preserves current path */}
      <div className="flex items-center border border-outline-variant/20">
        {(['es', 'en'] as Locale[]).map(l => (
          <Link
            key={l}
            href={switchedPath(l)}
            className={`px-2.5 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all ${
              locale === l
                ? 'bg-primary text-on-primary'
                : 'text-outline hover:text-primary'
            }`}
          >
            {l}
          </Link>
        ))}
      </div>
    </>
  )
}
