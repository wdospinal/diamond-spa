import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CookieConsent from '@/components/CookieConsent'
import MaterialSymbolsLoader from '@/components/MaterialSymbolsLoader'
import { MATERIAL_SYMBOLS_HREF } from '@/lib/material-symbols'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Diamond Spa — Spa for Men and Women in Medellín',
  description:
    'Masajes para hombres y mujeres en El Poblado, Medellín. Deep tissue, relajante, deportivo, faciales y depilación. Desde $120.000 COP.',
  keywords: 'spa medellin, masajes medellin, masajes para hombres en medellin, masajes medellin para hombres, spa para hombres medellin, masajes el poblado, spa el poblado, diamond spa, masajes de lujo, medellin antioquia, masaje relajante medellin, masaje deportivo medellin, deep tissue medellin, depilacion masculina medellin, spa para mujeres medellin',
  icons: {
    icon: '/favicon.png',       // 69 KB — optimized
    apple: '/apple-icon.png',   // 18 KB (180×180) — down from 538 KB
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${playfairDisplay.variable} ${manrope.variable}`}>
      <head>
        {/* Warm connections for Google Fonts (Material Symbols + face fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/*
          Preload Material Symbols CSS at HTML-parse time so the icon font starts
          downloading immediately — not after JS hydration (saves ~3-5 s on mobile).
          MaterialSymbolsLoader promotes this preload to a stylesheet on mount.
        */}
        <link rel="preload" as="style" href={MATERIAL_SYMBOLS_HREF} />

        {/* DNS prefetch for third-party image/resource CDNs */}
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        {children}
        {/* Loads icon font after hydration — never blocks rendering */}
        <MaterialSymbolsLoader />
        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  )
}
