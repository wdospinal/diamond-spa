import Image from 'next/image'
import Link from 'next/link'
import { getDict, type Locale } from '@/lib/i18n'
import { SPA_WHATSAPP_GREETING } from '@/lib/spa'
import { IMG_LOGOTIPO, IMG_LOGOTIPO_WEBP } from '@/lib/images'
import MobileMenuClient from '@/components/MobileMenuClient'
import NavLinksClient from '@/components/NavLinksClient'
import WhatsAppLink from '@/components/WhatsAppLink'

export default function Navigation({ locale }: { locale: Locale }) {
  const t = getDict(locale).nav
  const waGreeting = SPA_WHATSAPP_GREETING[locale]

  const links = [
    { label: t.services, href: `/${locale}/services` },
    { label: t.aboutUs,  href: `/${locale}/about`    },
    { label: t.location, href: `/${locale}/location` },
  ]

  const homeLinkLabel = locale === 'es'
    ? 'Diamond Spa — Ir al inicio'
    : 'Diamond Spa — Go to home'
  const primaryNavLabel = locale === 'es' ? 'Navegación principal' : 'Primary navigation'

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav" aria-label={primaryNavLabel}>
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

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">

          <WhatsAppLink
            text={waGreeting}
            className="flex items-center gap-2 border border-primary/40 text-primary px-5 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-primary hover:text-on-primary transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">support_agent</span>
            {t.contactReceptionist}
          </WhatsAppLink>
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
        />
      </div>
    </nav>
  )
}
