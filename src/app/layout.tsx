import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Diamond Spa — The Midnight Sanctuary',
  description:
    'Precision recovery and mental clarity designed exclusively for the modern professional. Experience unparalleled discretion in the heart of the city.',
  keywords: 'luxury spa, men spa, massage, facial, deep tissue, relaxation, diamond spa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
