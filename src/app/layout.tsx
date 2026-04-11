import type { Metadata } from 'next'
import { Manrope, Noto_Serif } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const notoSerif = Noto_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
  display: 'optional',
})

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'optional',
})

export const metadata: Metadata = {
  title: 'Diamond Spa — Spa for Men and Women in Medellín',
  description:
    'Diamond Spa Massages, ubicado en El Poblado, Medellín, Antioquia. Recuperación y bienestar de lujo para el profesional moderno. Reserva tu cita en Cra 43C #10-42, El Poblado.',
  keywords: 'spa medellin, masajes medellin, masajes el poblado, spa el poblado, diamond spa, masajes de lujo, medellin antioquia',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* display=block: glyphs invisible until font ready — eliminates icon-font CLS */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
