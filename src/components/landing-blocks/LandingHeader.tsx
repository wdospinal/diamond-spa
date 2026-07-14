'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function LandingHeader({ phoneText }: { phoneText: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header id="landing-header" className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="font-headline text-xl tracking-tight text-on-surface">
            DIAMOND SPA
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Servicios</a>
          <a href="#por-que-nosotros" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Nosotros</a>
          <a href="#ubicacion" className="text-sm font-label uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors">Ubicación</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a 
            href="#reservar"
            className="bg-[#25D366] text-black font-label text-xs md:text-sm tracking-widest uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">event</span>
            <span className="hidden sm:inline">Reservar Ahora</span>
            <span className="sm:hidden">Reservar</span>
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
          <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">Servicios</a>
          <a href="#por-que-nosotros" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">Nosotros</a>
          <a href="#ubicacion" onClick={() => setIsMenuOpen(false)} className="text-sm font-label uppercase tracking-widest text-on-surface hover:text-primary">Ubicación</a>
        </div>
      )}
    </header>
  )
}
