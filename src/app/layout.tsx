import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import ReactDOM from 'react-dom'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CookieConsent from '@/components/CookieConsent'
import MaterialSymbolsLoader from '@/components/MaterialSymbolsLoader'
import { MATERIAL_SYMBOLS_HREF } from '@/lib/material-symbols'

/**
 * next/font/google self-hosts both fonts from /_next/static/media/ (same origin,
 * no extra DNS). display:'swap' + fallback array triggers Next.js automatic
 * font-metric overrides (@font-face size-adjust / ascent-override / descent-override)
 * so the fallback font matches the web font metrics → zero layout shift on swap.
 */
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  // Fallback hints used by Next.js to compute metric overrides for CLS=0
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
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
  /**
   * ReactDOM.preload / preconnect are React 18 APIs that emit resource hints
   * into the earliest possible HTTP response flush — before the component tree
   * is serialised. This breaks the "critical request chain":
   *   HTML → (discover link) → fonts.googleapis.com CSS → fonts.gstatic.com woff2
   * by starting those connections at the same time as the HTML download.
   */
  ReactDOM.preconnect('https://fonts.googleapis.com')
  ReactDOM.preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' } as never)
  ReactDOM.preload(MATERIAL_SYMBOLS_HREF, { as: 'style' } as never)

  return (
    <html lang="es" className={`dark ${playfairDisplay.variable} ${manrope.variable}`}>
      <head>
        {/*
          ReactDOM.preconnect / preload above emit the Google Fonts hints
          earlier (in the first HTTP flush) than a static <link> in JSX.
          Keeping only the DNS-prefetch tags here for secondary CDNs.
        */}
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
