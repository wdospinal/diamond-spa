'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'

interface NavLink {
  label: string
  href: string
}

const WHATSAPP_CONTACT = `https://wa.me/573145484227?text=Hola%2C%20quisiera%20hablar%20con%20la%20recepcionista%20de%20Diamond%20Spa.`

export default function MobileMenuClient({
  locale,
  links,
  bookLabel,
  contactLabel,
}: {
  locale: Locale
  links: NavLink[]
  bookLabel: string
  contactLabel: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  function switchedPath(targetLocale: Locale) {
    if (!pathname) return `/${targetLocale}`
    const stripped = pathname.replace(/^\/(en|es)/, '') || '/'
    return `/${targetLocale}${stripped}`
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden text-primary"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 right-0 z-40 bg-surface-container-low px-6 pb-8 pt-4 flex flex-col gap-6">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-on-surface font-label text-sm tracking-widest uppercase"
            >
              {label}
            </Link>
          ))}
          {/* Locale switcher */}
          <div className="flex gap-2">
            {(['es', 'en'] as Locale[]).map(l => (
              <Link
                key={l}
                href={switchedPath(l)}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-1.5 font-label text-xs uppercase tracking-widest border transition-all ${
                  locale === l ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-outline'
                }`}
              >
                {l}
              </Link>
            ))}
          </div>
          <a
            href={WHATSAPP_CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="w-fit border border-primary/40 text-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase"
          >
            {contactLabel}
          </a>
          <Link
            href={`/${locale}/book`}
            onClick={() => setMenuOpen(false)}
            className="w-fit bg-primary text-on-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase"
          >
            {bookLabel}
          </Link>
        </div>
      )}
    </>
  )
}
