'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }
  return (
    <>
      <Navigation />
      <main className="pt-24 md:pt-28">{children}</main>
      <Footer />
    </>
  )
}
