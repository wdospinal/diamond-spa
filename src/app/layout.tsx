import type { Metadata } from 'next'
import { Manrope, Playfair_Display } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import Script from 'next/script'
import GlobalFloatingWhatsApp from '@/components/GlobalFloatingWhatsApp'
import { readAllLandings } from '@/lib/landing-store'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const landings = await readAllLandings()
  const disabledPaths = landings
    .filter(l => l.sem && l.sem.showFloatingWa === false)
    .map(l => l.path)

  return (
    <html lang="es" className={`dark ${playfairDisplay.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* DNS prefetch for lazy-loaded third-party content */}
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a1628" />

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W3WCSFP4');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/*
          Anti-FOUC SEM script — runs synchronously before first paint.
          Must be a raw <script> in this Server Component <head>, NOT next/script
          with beforeInteractive: that Client Component re-renders a <script> on
          the client and triggers React 19's "Encountered a script tag" warning.
          Default trigger: ?utm_source=ads (configurable per-page from the admin).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var p = new URLSearchParams(window.location.search);
    if (sessionStorage.getItem('sem_hide_chrome') === 'false') return;
    var k = sessionStorage.getItem('sem_trigger_key') || 'utm_source';
    var v = sessionStorage.getItem('sem_trigger_value') || 'ads';
    if (p.get(k) === v) document.documentElement.classList.add('is-ads');
  } catch(e) {}
})();`,
          }}
        />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W3WCSFP4"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {children}
        <ClientProviders />

        <GlobalFloatingWhatsApp disabledPaths={disabledPaths} />
      </body>
    </html>
  )
}
