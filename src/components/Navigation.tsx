import Image from 'next/image'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { getDict, type Locale } from '@/lib/i18n'
import MobileMenuClient from '@/components/MobileMenuClient'
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

  const otherLocale: Locale = locale === 'es' ? 'en' : 'es'

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

        {/* Desktop links */}
        <div className="hidden md:flex gap-10 items-center">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-slate-400 hover:text-primary font-label text-xs tracking-widest uppercase transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs + locale switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Locale switcher */}
          <div className="flex items-center border border-outline-variant/20">
            {(['es', 'en'] as Locale[]).map(l => (
              <Link
                key={l}
                href={`/${l}`}
                className={`px-2.5 py-1.5 font-label text-[10px] uppercase tracking-widest transition-all ${
                  locale === l ? 'bg-primary text-on-primary' : 'text-outline hover:text-primary'
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

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
