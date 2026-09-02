'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import type { AdminRole } from '@/lib/admin-roles'

const COLLAPSED_KEY = 'admin:sidebar-collapsed'

export default function AdminShell({
  role,
  children,
}: {
  role: AdminRole
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  // The stored preference is read after mount so the server HTML matches; until
  // then the width/margin transitions stay off so restoring it isn't animated.
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
    setIsHydrated(true)
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed(collapsed => {
      const next = !collapsed
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        role={role}
        isCollapsed={isCollapsed}
        isHydrated={isHydrated}
        onToggleCollapsed={toggleCollapsed}
      />
      <main
        className={`admin-main ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ${
          isHydrated ? 'lg:transition-[margin] lg:duration-300 lg:ease-in-out' : ''
        }`}
      >
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
