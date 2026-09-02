'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { type AdminRole, type AdminSection, canAccessSection } from '@/lib/admin-roles'

// Qué rol ve cada sección se decide en SECTION_ROLES (src/lib/admin-roles.ts).
const NAV_ITEMS: { href: AdminSection; icon: string; label: string }[] = [
  { href: '/admin',          icon: 'dashboard',      label: 'Inicio'      },
  { href: '/admin/bookings', icon: 'calendar_month', label: 'Reservas'    },
  { href: '/admin/blog',     icon: 'article',        label: 'Blog'        },
  { href: '/admin/landings', icon: 'rocket_launch',  label: 'Landings'    },
  { href: '/admin/funnel',   icon: 'filter_alt',     label: 'Embudo'      },
  { href: '/admin/bold',     icon: 'payments',       label: 'Ventas Bold' },
  { href: '/admin/caja',     icon: 'account_balance_wallet', label: 'Caja' },
]

const DRAWER_ITEMS = [
  { href: '/admin/account',  icon: 'person',   label: 'Mi cuenta'     },
  { href: '/admin/settings', icon: 'settings', label: 'Configuración' },
]

function navLinkClass(isActive: boolean, isCollapsed: boolean) {
  return `flex items-center gap-3 px-4 py-3 min-h-11 rounded transition-all duration-200 ${
    isCollapsed ? 'lg:justify-center lg:px-0' : ''
  } ${
    isActive
      ? 'bg-primary/10 text-primary border border-primary/20'
      : 'text-on-surface/70 hover:bg-surface-variant hover:text-on-surface'
  }`
}

// Collapsed rail: the label stays in the accessibility tree (sr-only is out of
// flow, so it doesn't take space) and `title` gives sighted users a tooltip.
function navLabelClass(isCollapsed: boolean) {
  return `font-label text-sm tracking-wide ${isCollapsed ? 'lg:sr-only' : ''}`
}

function isNavActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
}


export default function Sidebar({
  role,
  isCollapsed,
  isHydrated,
  onToggleCollapsed,
}: {
  role: AdminRole
  isCollapsed: boolean
  isHydrated: boolean
  onToggleCollapsed: () => void
}) {
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
          lg:max-w-none lg:z-40 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isHydrated ? 'lg:transition-[width,transform,visibility]' : ''}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full max-lg:invisible lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div
          className={`flex items-start justify-between gap-2 p-6 border-b border-outline-variant/20 ${
            isCollapsed ? 'lg:justify-center lg:px-2 lg:py-4' : ''
          }`}
        >
          <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
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
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="admin-nav"
            aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            className={`hidden lg:flex h-11 w-11 shrink-0 items-center justify-center rounded text-on-surface/60 hover:bg-surface-variant hover:text-primary transition-colors ${
              isCollapsed ? '' : '-mr-2 -mt-1'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 ${
            isCollapsed ? 'lg:px-2' : ''
          }`}
        >
          {NAV_ITEMS.filter(item => canAccessSection(role, item.href)).map((item) => {
            const isActive = isNavActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={navLinkClass(isActive, isCollapsed)}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                <span className={navLabelClass(isCollapsed)}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Account, app settings, logout */}
        <div
          className={`p-4 border-t border-outline-variant/20 flex flex-col gap-2 ${
            isCollapsed ? 'lg:px-2' : ''
          }`}
        >
          {DRAWER_ITEMS.map((item) => {
            const isActive = isNavActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={navLinkClass(isActive, isCollapsed)}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                <span className={navLabelClass(isCollapsed)}>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 min-h-11 rounded text-error/80 hover:bg-error/10 hover:text-error transition-all duration-200 ${
              isCollapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            <span className={`${navLabelClass(isCollapsed)} uppercase`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
