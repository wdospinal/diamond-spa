import type { Metadata } from 'next'
import '../globals.css'
import { isLocale, type Locale } from '@/lib/i18n'
import { BASE_URL } from '@/lib/seo'
import { FONT_VARIABLES } from '@/lib/fonts'
import RootHead, { RootGtmNoScript } from '@/components/RootHead'
import ClientProviders from '@/components/ClientProviders'
import SemAntiFouc from '@/components/SemAntiFouc'
import GlobalFloatingWhatsApp from '@/components/GlobalFloatingWhatsApp'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SemTracker from '@/components/SemTracker'
import { readAllLandings } from '@/lib/landing-store'

/**
 * Root layout for the public site.
 *
 * This owns <html> so that `lang` can follow the [lang] segment. It used to
 * live in app/layout.tsx, one level *above* [lang], which meant every English
 * page shipped `<html lang="es">` and only an inner <div lang="en"> disagreed —
 * we were telling Google the whole document was Spanish on all ~30 /en URLs.
 * A layout above [lang] can never see the locale: params stop at the segment
 * that declares them, and reading it from headers() would opt the entire tree
 * into dynamic rendering and cost us static generation sitewide.
 *
 * Splitting the roots is what makes the attribute correct while every page
 * stays prerendered. The admin tree has its own root layout for the same
 * reason (app/admin/layout.tsx).
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Diamond Spa — Spa for Men and Women in Medellín',
  description:
    'Masajes para hombres y mujeres en El Poblado, Medellín. Deep tissue, relajante, deportivo, faciales y depilación. Desde $120.000 COP.',
  keywords: 'spa medellin, masajes medellin, masajes para hombres en medellin, masajes medellin para hombres, spa para hombres medellin, masajes el poblado, spa el poblado, diamond spa, masajes de lujo, medellin antioquia, masaje relajante medellin, masaje deportivo medellin, deep tissue medellin, depilacion masculina medellin, spa para mujeres medellin',
  icons: {
    icon: '/favicon.png',       // 69 KB — optimized
    apple: '/apple-icon.png',   // 18 KB (180×180) — down from 538 KB
  },
}

export default async function SiteRootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : 'es'

  const landings = await readAllLandings()
  const disabledPaths = landings
    .filter(l => l.sem && l.sem.showFloatingWa === false)
    .map(l => l.path)

  return (
    <html lang={locale} className={`dark ${FONT_VARIABLES}`} suppressHydrationWarning>
      <head>
        <RootHead />
        {/*
          Anti-FOUC SEM script — runs synchronously before first paint.
          Inyectado vía SemAntiFouc (useServerInsertedHTML) para evitar el aviso
          de React 19 "Encountered a script tag while rendering React component",
          que en Next.js 16.2+ se dispara incluso con un <script> crudo en este
          Server Component. Default trigger: ?utm_source=ads (configurable por
          página desde el admin).
        */}
        <SemAntiFouc />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        <RootGtmNoScript />

        <SemTracker />
        <Navigation locale={locale} />
        <main className="pt-24 md:pt-28">{children}</main>
        <Footer locale={locale} />

        <ClientProviders />
        <GlobalFloatingWhatsApp disabledPaths={disabledPaths} />
      </body>
    </html>
  )
}
