import type { Metadata } from 'next'
import '../globals.css'
import { FONT_VARIABLES } from '@/lib/fonts'
import RootHead, { RootGtmNoScript } from '@/components/RootHead'
import ClientProviders from '@/components/ClientProviders'

/**
 * Root layout for the admin app.
 *
 * The admin tree owns its own <html> because the public site's root layout now
 * lives at app/[lang]/layout.tsx, where it can read the locale segment (see the
 * comment there). Admin is Spanish-only and noindex, so `lang` is fixed.
 */
export const metadata: Metadata = {
  title: 'Diamond Spa — Administración',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${FONT_VARIABLES}`} suppressHydrationWarning>
      <head>
        <RootHead />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        <RootGtmNoScript />
        <div className="admin-shell min-h-screen bg-[#001524] text-[#cfe5fa] font-body antialiased pt-0">
          {children}
        </div>
        <ClientProviders />
      </body>
    </html>
  )
}
