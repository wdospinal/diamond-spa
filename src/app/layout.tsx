import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CookieConsent from '@/components/CookieConsent'

/**
 * next/font/google self-hosts both fonts from /_next/static/media/ (same origin,
 * no extra DNS lookup, 1-year immutable cache). display:'swap' + fallback array
 * triggers Next.js automatic font-metric overrides (size-adjust / ascent-override /
 * descent-override) so the fallback font matches the web font metrics → CLS=0.
 *
 * Material Symbols Outlined is self-hosted via @font-face in globals.css
 * (public/fonts/material-symbols-outlined.woff2) — no Google Fonts round-trip,
 * 1-year immutable cache, eliminates the googleapis→gstatic network chain.
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
  return (
    <html lang="es" className={`dark ${playfairDisplay.variable} ${manrope.variable}`}>
      <head>
        {/* DNS prefetch for lazy-loaded third-party content */}
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
        <CookieConsent />
      </body>
    </html>
  )
}
