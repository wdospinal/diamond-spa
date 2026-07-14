'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/admin',          icon: 'dashboard',      label: 'Inicio'      },
  { href: '/admin/bookings', icon: 'calendar_month', label: 'Reservas'    },
  { href: '/admin/blog',     icon: 'article',        label: 'Blog'        },
  { href: '/admin/landings', icon: 'rocket_launch',  label: 'Landings'    },
  { href: '/admin/funnel',   icon: 'filter_alt',     label: 'Embudo'      },
  { href: '/admin/settings', icon: 'settings',       label: 'Configuración' },
]


export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-surface-container border-b border-outline-variant/30 sticky top-0 z-50">
        <span className="font-headline text-primary text-xl">Diamond Spa</span>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-on-surface hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">{isMobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface-container border-r border-outline-variant/20
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="p-6 border-b border-outline-variant/20 hidden lg:block">
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-primary mb-1">
            Panel de Control
          </p>
          <h2 className="font-headline text-2xl text-on-surface">Diamond Spa</h2>
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
                className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-error/80 hover:bg-error/10 hover:text-error transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            <span className="font-label text-sm tracking-wide uppercase">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
