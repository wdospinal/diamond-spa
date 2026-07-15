'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Globe } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const LABELS = {
  en: {
    services: 'Services',
    about: 'About Us',
    location: 'Location',
    bookNow: 'Book Now',
    book: 'Book',
    langName: 'Español'
  },
  es: {
    services: 'Servicios',
    about: 'Nosotros',
    location: 'Ubicación',
    bookNow: 'Reservar Ahora',
    book: 'Reservar',
    langName: 'English'
  }
}

export function LandingHeader({ phoneText, locale = 'es' }: { phoneText: string, locale?: Locale }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const t = LABELS[locale] || LABELS['es']
  
  // Language switcher logic
  const targetLocale = locale === 'es' ? 'en' : 'es'
  const toggleLanguageUrl = pathname ? pathname.replace(`/${locale}/`, `/${targetLocale}/`) : `/${targetLocale}/`

  return (
    <header id="landing-header" className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="font-headline text-xl tracking-tight text-on-surface">
            DIAMOND SPA
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">{t.services}</a>
          <a href="#por-que-nosotros" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">{t.about}</a>
          <a href="#ubicacion" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">{t.location}</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <Link 
            href={toggleLanguageUrl} 
            className="flex items-center gap-1.5 text-zinc-400 hover:text-primary transition-colors text-sm font-label tracking-widest uppercase"
            aria-label={`Switch to ${t.langName}`}
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{t.langName}</span>
            <span className="sm:hidden">{targetLocale.toUpperCase()}</span>
          </Link>

          <a 
            href="#reservar"
            className="bg-[#25D366] text-black font-label text-xs md:text-sm tracking-widest uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">event</span>
            <span className="hidden sm:inline">{t.bookNow}</span>
            <span className="sm:hidden">{t.book}</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-on-surface p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-outline-variant/20 py-4 px-4 flex flex-col gap-4 shadow-xl">
          <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">{t.services}</a>
          <a href="#por-que-nosotros" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">{t.about}</a>
          <a href="#ubicacion" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">{t.location}</a>
        </div>
      )}
    </header>
  )
}
