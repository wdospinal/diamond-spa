'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const WHATSAPP_NUMBER = '573145484227'
const WHATSAPP_BOOK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20me%20gustar%C3%ADa%20reservar%20una%20sesi%C3%B3n%20en%20Diamond%20Spa.`
const WHATSAPP_CONTACT = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20quisiera%20hablar%20con%20la%20recepcionista%20de%20Diamond%20Spa.`

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
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Diamond Spa" className="h-14 w-auto" />
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
        <div className="flex items-center gap-3">
          <a
            href={WHATSAPP_CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 border border-primary/40 text-primary px-5 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-primary hover:text-on-primary transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
            Contact Receptionist
          </a>
          <a
            href={WHATSAPP_BOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-7 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-white transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            Book Now
          </a>

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
          <a
            href={WHATSAPP_CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="w-fit border border-primary/40 text-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase"
          >
            Contact Receptionist
          </a>
          <a
            href={WHATSAPP_BOOK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="w-fit bg-primary text-on-primary px-8 py-3 font-label font-bold tracking-widest text-xs uppercase"
          >
            Book Now
          </a>
        </div>
      )}
    </nav>
  )
}
