import Link from 'next/link'
import { getDict, type Locale } from '@/lib/i18n'
import { PHONES } from '@/lib/phones'
import { SPA_EMAIL, SPA_INSTAGRAM, SPA_TIKTOK, SPA_WHATSAPP_GREETING } from '@/lib/spa'
import WhatsAppLink from '@/components/WhatsAppLink'
import { IGIcon, WAIcon, MailIcon, TikTokIcon } from '@/components/SocialIcons'
import { TrackedSocialLink } from '@/components/TrackedSocialLink'

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale).footer
  const legal = (slug: 'privacy' | 'terms' | 'press') => `/${locale}/${slug}`

  const instagramLabel = locale === 'es' ? 'Diamond Spa en Instagram' : 'Diamond Spa on Instagram'
  const tiktokLabel = locale === 'es' ? 'Diamond Spa en TikTok' : 'Diamond Spa on TikTok'
  const emailLabel = locale === 'es' ? `Enviar correo a ${SPA_EMAIL}` : `Email ${SPA_EMAIL}`
  const whatsappLabel = locale === 'es' ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'
  const phoneLabel = (display: string) =>
    locale === 'es' ? `Llamar al ${display}` : `Call ${display}`

  return (
    <footer className="bg-surface-container-low py-20 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="text-xl font-headline tracking-tighter text-primary mb-6">Diamond Spa</div>
          <p className="text-secondary font-body text-sm leading-relaxed">{t.tagline}</p>
        </div>

        {/* About us */}
        <div className="flex flex-col gap-3">
          <p className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">{t.aboutUsLabel}</p>
          <Link href={`/${locale}/services`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.services}</Link>
          <Link href={`/${locale}/masajes-para-hombres`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.massagesForMen}</Link>
          <Link href={`/${locale}/masajes-para-mujeres`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.massagesForWomen}</Link>
          <Link href={`/${locale}/depilacion-medellin`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.hairRemoval}</Link>
          <Link href={`/${locale}/limpieza-facial-medellin`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.facials}</Link>
          <Link href={`/${locale}/about`}    className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.philosophy}</Link>
          <Link href={`/${locale}/history`}  className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.heritage}</Link>
          <Link href={`/${locale}/location`} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.location}</Link>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <p className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">{t.legalLabel}</p>
          <Link href={legal('privacy')} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.privacy}</Link>
          <Link href={legal('terms')} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.terms}</Link>
          <Link href={legal('press')} className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200">{t.press}</Link>
          <a
            href={`mailto:${SPA_EMAIL}`}
            aria-label={`${t.contact} — ${SPA_EMAIL}`}
            className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200"
          >
            {t.contact}
          </a>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <p className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">{t.contactLabel}</p>
          <TrackedSocialLink
            href={`mailto:${SPA_EMAIL}`}
            platform="email"
            source="footer"
            aria-label={emailLabel}
            className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200"
          >
            {SPA_EMAIL}
          </TrackedSocialLink>
          {PHONES.map(({ display, wa }) => (
            <TrackedSocialLink
              key={wa}
              href={`tel:+${wa}`}
              platform="phone"
              source="footer"
              aria-label={phoneLabel(display)}
              className="text-secondary hover:text-primary font-body text-sm transition-colors duration-200"
            >
              {display}
            </TrackedSocialLink>
          ))}
          {/* Social icons — all 20×20 SVG for consistent sizing */}
          <div className="flex gap-4 mt-2 items-center">
            <TrackedSocialLink
              href={SPA_INSTAGRAM}
              platform="instagram"
              source="footer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={instagramLabel}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              <IGIcon />
            </TrackedSocialLink>
            <TrackedSocialLink
              href={SPA_TIKTOK}
              platform="tiktok"
              source="footer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tiktokLabel}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              <TikTokIcon />
            </TrackedSocialLink>
            <TrackedSocialLink
              href={`mailto:${SPA_EMAIL}`}
              platform="email"
              source="footer"
              aria-label={emailLabel}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              <MailIcon />
            </TrackedSocialLink>
            <WhatsAppLink
              text={SPA_WHATSAPP_GREETING[locale]}
              source="footer"
              aria-label={whatsappLabel}
              className="text-secondary hover:text-primary transition-colors duration-200"
            >
              <WAIcon />
            </WhatsAppLink>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-secondary font-body text-xs tracking-widest uppercase">{t.copyright}</p>
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8" aria-label={t.legalLabel}>
          <Link href={legal('privacy')} className="text-secondary hover:text-on-surface font-body text-xs tracking-widest uppercase transition-colors">{t.privacy}</Link>
          <Link href={legal('terms')} className="text-secondary hover:text-on-surface font-body text-xs tracking-widest uppercase transition-colors">{t.terms}</Link>
          <Link href={legal('press')} className="text-secondary hover:text-on-surface font-body text-xs tracking-widest uppercase transition-colors">{t.press}</Link>
        </nav>
      </div>
    </footer>
  )
}
