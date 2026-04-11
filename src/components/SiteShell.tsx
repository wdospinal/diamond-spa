'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'

function localeFromPathname(pathname: string | null): Locale {
  if (!pathname) return DEFAULT_LOCALE
  const first = pathname.split('/').filter(Boolean)[0]
  return isLocale(first) ? first : DEFAULT_LOCALE
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }
  const locale = localeFromPathname(pathname ?? null)
  return (
    <>
      <Navigation locale={locale} />
      <main className="pt-24 md:pt-28">{children}</main>
      <Footer locale={locale} />
    </>
  )
}
