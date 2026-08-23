'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/admin',          icon: 'dashboard',      label: 'Inicio'      },
  { href: '/admin/bookings', icon: 'calendar_month', label: 'Reservas'    },
  { href: '/admin/blog',     icon: 'article',        label: 'Blog'        },
  { href: '/admin/landings', icon: 'rocket_launch',  label: 'Landings'    },
  { href: '/admin/funnel',   icon: 'filter_alt',     label: 'Embudo'      },
  { href: '/admin/bold',     icon: 'payments',       label: 'Ventas Bold' },
  { href: '/admin/settings', icon: 'settings',       label: 'Configuración' },
]


export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // A tapped link may resolve to the route we are already on, in which case the
  // onClick close still runs — but closing here also covers programmatic pushes.
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileOpen])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    // replace + refresh so the back button and the router cache can't resurrect
    // the authenticated dashboard after the cookie is gone.
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile top bar. Fixed rather than in-flow: the dashboard layout is a
          block container, and a fixed bar keeps the full viewport width. */}
      <header className="admin-topbar lg:hidden fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 bg-surface-container/95 backdrop-blur-sm border-b border-outline-variant/30">
        <Link href="/admin" className="font-headline text-primary text-xl truncate">
          Diamond Spa
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(open => !open)}
          aria-expanded={isMobileOpen}
          aria-controls="admin-nav"
          aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
            {isMobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar. Off-canvas drawer below lg, permanent rail from lg up.
          `invisible` while closed keeps the links out of the tab order; it is
          part of the transition so the slide-out stays visible until it ends. */}
      <aside
        id="admin-nav"
        className={`
          admin-drawer fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface-container
          border-r border-outline-variant/20 flex flex-col
          transition-[transform,visibility] duration-300 ease-in-out
          lg:w-64 lg:max-w-none lg:z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full max-lg:invisible lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-start justify-between gap-2 p-6 border-b border-outline-variant/20">
          <div className="min-w-0">
            <p className="font-label text-[10px] tracking-[0.3em] uppercase text-primary mb-1">
              Panel de Control
            </p>
            <h2 className="font-headline text-2xl text-on-surface truncate">Diamond Spa</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Cerrar menú"
            className="lg:hidden -mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface/60 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            // Match exact for /admin, match prefix for others
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 min-h-11 rounded transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-on-surface/70 hover:bg-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                <span className="font-label text-sm tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 min-h-11 rounded text-error/80 hover:bg-error/10 hover:text-error transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            <span className="font-label text-sm tracking-wide uppercase">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
