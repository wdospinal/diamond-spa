'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { label: 'Services',  href: '/services'  },
  { label: 'Sanctuary', href: '/about'     },
  { label: 'Location',  href: '/location'  },
]

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center px-6 md:px-12 py-5 w-full max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-headline tracking-tighter text-primary">
          Diamond Spa
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-10 items-center">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? 'text-primary border-b border-primary pb-0.5 font-label text-xs tracking-widest uppercase transition-colors'
                    : 'text-slate-400 hover:text-primary font-label text-xs tracking-widest uppercase transition-colors duration-200'
                }
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/book"
            className="hidden md:block bg-primary text-on-primary px-7 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-white transition-all duration-300"
          >
            Book Now
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-low px-6 pb-8 pt-4 flex flex-col gap-6">
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
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="w-fit bg-primary text-on-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}
