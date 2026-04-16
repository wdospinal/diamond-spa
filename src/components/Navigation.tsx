import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { getDict, type Locale } from '@/lib/i18n'
import MobileMenuClient from '@/components/MobileMenuClient'
import NavLinksClient from '@/components/NavLinksClient'
import WhatsAppLink from '@/components/WhatsAppLink'

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  display: 'optional',
})

const WA_TEXT = 'Hola, quisiera hablar con la recepcionista de Diamond Spa.'

export default function Navigation({ locale }: { locale: Locale }) {
  const t = getDict(locale).nav

  const links = [
    { label: t.services, href: `/${locale}/services` },
    { label: t.aboutUs,  href: `/${locale}/about`    },
    { label: t.location, href: `/${locale}/location` },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-screen-2xl mx-auto">

        {/* Logo — fixed width/height prevents CLS */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image
            src="/logotipo.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
            aria-hidden
          />
          <span className={`${playfairDisplay.className} text-xl md:text-2xl text-primary tracking-tight`}>
            Diamond Spa
          </span>
        </Link>

        {/* Desktop links + locale switcher (client — needs usePathname for active state) */}
        <NavLinksClient links={links} locale={locale} />

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">

          <WhatsAppLink
            text={WA_TEXT}
            className="flex items-center gap-2 border border-primary/40 text-primary px-5 py-2.5 font-label font-bold tracking-widest text-xs uppercase hover:bg-primary hover:text-on-primary transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
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
