'use client'

import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getDict, type Locale } from '@/lib/i18n'

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const WHATSAPP_NUMBER = '573145484227'
const WHATSAPP_CONTACT = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20hablar%20con%20la%20recepcionista%20de%20Diamond%20Spa.`

function useLocale(): Locale {
  const pathname = usePathname()
  return pathname?.startsWith('/en') ? 'en' : 'es'
}

export default function Navigation() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = getDict(locale).nav
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: t.services,  href: `/${locale}/services`  },
    { label: t.aboutUs, href: `/${locale}/about`     },
    { label: t.location,  href: `/${locale}/location`  },
  ]

  // Build locale-switched URL: swap /en/ ↔ /es/
  function switchedPath(targetLocale: Locale) {
    if (!pathname) return `/${targetLocale}`
    const stripped = pathname.replace(/^\/(en|es)/, '') || '/'
    return `/${targetLocale}${stripped}`
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logotipo.png" alt="" className="h-14 w-auto" aria-hidden />
          <span
            className={`${playfairDisplay.className} text-xl md:text-2xl text-primary tracking-tight`}
          >
            Diamond Spa
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-10 items-center">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={active
                  ? 'text-primary border-b border-primary pb-0.5 font-label text-xs tracking-widest uppercase transition-colors'
                  : 'text-slate-400 hover:text-primary font-label text-xs tracking-widest uppercase transition-colors duration-200'
                }>
                {label}
              </Link>
            )
          })}
        </div>

        {/* CTAs + locale switcher */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <div className="hidden md:flex items-center border border-outline-variant/20">
            {(['es', 'en'] as Locale[]).map(l => (
              <Link key={l} href={switchedPath(l)}
                className={`px-2.5 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all ${locale === l ? 'bg-primary text-on-primary' : 'text-outline hover:text-primary'}`}>
                {l}
              </Link>
            ))}
          </div>

          <a href={WHATSAPP_CONTACT} target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 border border-primary/40 text-primary px-5 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-primary hover:text-on-primary transition-all duration-300">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            {t.contactReceptionist}
          </a>
          <Link href={`/${locale}/book`}
            className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-7 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-white transition-all duration-300">
            {t.bookNow}
          </Link>

          {/* Mobile hamburger */}
          <button className="md:hidden text-primary" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-low px-6 pb-8 pt-4 flex flex-col gap-6">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-on-surface font-label text-sm tracking-widest uppercase">{label}</Link>
          ))}
          {/* Mobile locale switcher */}
          <div className="flex gap-2">
            {(['es', 'en'] as Locale[]).map(l => (
              <Link key={l} href={switchedPath(l)} onClick={() => setMenuOpen(false)}
                className={`px-3 py-1.5 font-label text-xs uppercase tracking-widest border transition-all ${locale === l ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 text-outline'}`}>
                {l}
              </Link>
            ))}
          </div>
          <a href={WHATSAPP_CONTACT} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
            className="w-fit border border-primary/40 text-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase">
            {t.contactReceptionist}
          </a>
          <Link href={`/${locale}/book`} onClick={() => setMenuOpen(false)}
            className="w-fit bg-primary text-on-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase">
            {t.bookNow}
          </Link>
        </div>
      )}
    </nav>
  )
}
