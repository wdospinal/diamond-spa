import Image from 'next/image'
import Link from 'next/link'
import { getDict, type Locale } from '@/lib/i18n'
import { SPA_WHATSAPP_GREETING } from '@/lib/spa'
import { IMG_LOGOTIPO, IMG_LOGOTIPO_WEBP } from '@/lib/images'
import MobileMenuClient from '@/components/MobileMenuClient'
import NavLinksClient from '@/components/NavLinksClient'

export default function Navigation({ locale }: { locale: Locale }) {
  const t = getDict(locale).nav
  const waGreeting = SPA_WHATSAPP_GREETING[locale]

  // TODO: move to i18n dict once the /masajes, /faciales and /depilacion
  // taxonomy is confirmed for launch.
  //
  // Three pillars up front (Masajes, Faciales, Depilación) + a "Más" catch-all
  // for everything secondary — keeps the bar at 4 items instead of 7.
  //
  // Masajes: fully built (hub + 7 type pages + audience pages).
  // Faciales: NO dedicated hub yet — children point to the two existing
  // standalone pages (hydrafacial-medellin, limpieza-facial-medellin) as a
  // bridge until the same keyword/IA work done for Masajes happens here too.
  // Depilación: single existing page, no dropdown needed yet.
  const links = [
    {
      label: locale === 'en' ? 'Massages' : 'Masajes',
      href: `/${locale}/masajes`,
      desc: locale === 'en' ? 'Explore all massage types' : 'Explora todos los tipos de masaje',
      icon: 'self_improvement',
      children: [
        { label: locale === 'en' ? 'All massages' : 'Ver todos', href: `/${locale}/masajes` },
        { label: locale === 'en' ? 'For men' : 'Para Hombres', href: `/${locale}/masajes-para-hombres` },
        { label: locale === 'en' ? 'For women' : 'Para Mujeres', href: `/${locale}/masajes-para-mujeres` },
      ],
    },
    {
      label: locale === 'en' ? 'Facials' : 'Faciales',
      href: null,
      desc: locale === 'en' ? 'Skin care treatments' : 'Tratamientos para el cuidado de la piel',
      icon: 'face',
      children: [
        { label: 'HydraFacial', href: `/${locale}/hydrafacial-medellin` },
        { label: locale === 'en' ? 'Facial Cleansing' : 'Limpieza Facial', href: `/${locale}/limpieza-facial-medellin` },
      ],
    },
    {
      label: locale === 'en' ? 'Hair Removal' : 'Depilación',
      href: `/${locale}/depilacion-medellin`,
      desc: locale === 'en' ? 'Waxing, all zones' : 'Depilación con cera, todas las zonas',
      icon: 'filter_vintage',
      children: [
        { label: locale === 'en' ? 'For men' : 'Para Hombres', href: `/${locale}/depilacion-hombres` },
        { label: locale === 'en' ? 'For women' : 'Para Mujeres', href: `/${locale}/depilacion-mujeres` },
      ],
    },
    {
      label: locale === 'en' ? 'More' : 'Más',
      href: null,
      desc: locale === 'en' ? 'Full catalog, about us, location, blog' : 'Catálogo completo, nosotros, ubicación, blog',
      icon: 'more_horiz',
      children: [
        { label: t.services, href: `/${locale}/services` },
        { label: t.aboutUs,  href: `/${locale}/about`    },
        { label: t.location, href: `/${locale}/location` },
        { label: t.blog,     href: `/${locale}/blog`     },
      ],
    },
  ]

  const homeLinkLabel = locale === 'es'
    ? 'Diamond Spa — Ir al inicio'
    : 'Diamond Spa — Go to home'
  const primaryNavLabel = locale === 'es' ? 'Navegación principal' : 'Primary navigation'

  return (
    <nav id="global-nav" className="fixed top-0 w-full z-50 glass-nav" aria-label={primaryNavLabel}>
      <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-screen-2xl mx-auto">

        {/* Logo — fixed width/height prevents CLS.
             <picture> lets the browser pick AVIF (5 KB) vs WebP (132 KB)
             natively, without the /_next/image proxy round-trip. */}
        <Link href={`/${locale}`} aria-label={homeLinkLabel} className="flex items-center gap-3">
          <picture>
            <source srcSet={IMG_LOGOTIPO}      type="image/avif" />
            <source srcSet={IMG_LOGOTIPO_WEBP} type="image/webp" />
            <Image
              src={IMG_LOGOTIPO_WEBP}
              alt=""
              width={56}
              height={56}
              className="size-14 object-contain"
              priority
              aria-hidden="true"
              unoptimized
            />
          </picture>
          <span className="font-headline text-xl md:text-2xl text-primary tracking-tight">
            Diamond Spa
          </span>
        </Link>

        {/* Desktop links + locale switcher (client — needs usePathname for active state) */}
        <NavLinksClient links={links} locale={locale} />

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Link
            href={`/${locale}/book`}
            className="flex items-center gap-2 bg-primary text-on-primary px-7 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-white transition-all duration-300"
          >
            {t.bookNow}
          </Link>
        </div>

        {/* Mobile hamburger island */}
        <MobileMenuClient
          locale={locale}
          links={links}
          bookLabel={t.bookNow}
          contactLabel={t.contactReceptionist}
          quickLabels={{
            reception:  t.quickReception,
            call:       t.quickCall,
            directions: t.quickDirections,
          }}
        />
      </div>
    </nav>
  )
}
