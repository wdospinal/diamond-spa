'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { LOCALES_DISPLAY_ORDER } from '@/lib/constants'
import { IMG_LOGOTIPO, IMG_LOGOTIPO_WEBP } from '@/lib/images'
import { randomWhatsAppUrl } from '@/lib/phones'
import { SPA_PHONES, SPA_WHATSAPP_GREETING, SPA_GOOGLE_MAPS_URL } from '@/lib/spa'
import { EVENTS, trackEvent } from '@/lib/events'

interface NavLink {
  label: string
  href: string
  desc: string
  icon: string
}

export default function MobileMenuClient({
  locale,
  links,
  bookLabel,
  contactLabel,
  quickLabels,
}: {
  locale: Locale
  links: NavLink[]
  bookLabel: string
  contactLabel: string
  quickLabels: { reception: string; call: string; directions: string }
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const waGreeting = SPA_WHATSAPP_GREETING[locale]
  const close = () => setMenuOpen(false)

  // Portal target is only available after mount (avoids SSR `document` access).
  useEffect(() => setMounted(true), [])

  // Lock body scroll + close on Escape while the panel is open.
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function switchedPath(targetLocale: Locale) {
    if (!pathname) return `/${targetLocale}`
    const stripped = pathname.replace(/^\/(en|es)/, '') || '/'
    return `/${targetLocale}${stripped}`
  }

  const LOCALE_LABELS: Record<Locale, { switchTo: string }> = {
    en: { switchTo: 'Switch to English' },
    es: { switchTo: 'Cambiar a español' },
  }
  const localeSwitcherLabel = locale === 'es' ? 'Cambiar idioma' : 'Change language'
  const toggleMenuLabel = locale === 'es' ? 'Abrir menú' : 'Open menu'
  const closeMenuLabel = locale === 'es' ? 'Cerrar menú' : 'Close menu'
  const mobileNavLabel = locale === 'es' ? 'Menú móvil' : 'Mobile menu'
  const homeLinkLabel = locale === 'es' ? 'Diamond Spa — Ir al inicio' : 'Diamond Spa — Go to home'

  function openReception() {
    trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source: 'mobile-menu' })
    close()
    window.open(randomWhatsAppUrl(waGreeting), '_blank', 'noopener,noreferrer')
  }

  const quickActionClass =
    'flex flex-col items-center gap-2 py-3.5 px-2 rounded-[16px] border border-primary/[0.16] ' +
    'text-on-surface active:bg-primary/[0.06] transition-colors'

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className="md:hidden text-primary"
        onClick={() => setMenuOpen(true)}
        aria-label={toggleMenuLabel}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
      >
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>

      {/* Full-screen menu panel — portaled to <body> so it escapes the nav's
          z-50 stacking context and covers everything (e.g. the cookie banner). */}
      {menuOpen && mounted && createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={mobileNavLabel}
          className="mobile-menu-panel md:hidden fixed inset-0 z-[60] flex flex-col bg-surface-container"
        >
          {/* Header: logo · language toggle + close */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <Link
              href={`/${locale}`}
              onClick={close}
              aria-label={homeLinkLabel}
              className="flex items-center gap-2.5"
            >
              <picture>
                <source srcSet={IMG_LOGOTIPO}      type="image/avif" />
                <source srcSet={IMG_LOGOTIPO_WEBP} type="image/webp" />
                <Image
                  src={IMG_LOGOTIPO_WEBP}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 object-contain"
                  aria-hidden="true"
                  unoptimized
                />
              </picture>
              <span className="font-headline text-lg text-primary tracking-tight">Diamond Spa</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Language pill */}
              <div
                className="inline-flex items-center rounded-[999px] bg-primary/[0.1] p-1"
                role="group"
                aria-label={localeSwitcherLabel}
              >
                {LOCALES_DISPLAY_ORDER.map(l => {
                  const isCurrent = locale === l
                  return (
                    <Link
                      key={l}
                      href={switchedPath(l)}
                      onClick={close}
                      hrefLang={l}
                      lang={l}
                      aria-label={LOCALE_LABELS[l].switchTo}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={`px-3.5 py-1.5 rounded-[999px] font-label text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isCurrent ? 'bg-primary text-on-primary' : 'text-on-surface/60'
                      }`}
                    >
                      {l}
                    </Link>
                  )
                })}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={close}
                aria-label={closeMenuLabel}
                className="flex size-9 items-center justify-center rounded-[999px] bg-primary/[0.1] text-on-surface"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>
          </div>

          {/* Navigation tiles */}
          <nav aria-label={mobileNavLabel} className="flex-1 overflow-y-auto px-5 pt-6">
            <ul className="flex flex-col gap-3">
              {links.map(({ label, href, desc, icon }, i) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={active ? 'page' : undefined}
                      style={{ animationDelay: `${i * 55}ms` }}
                      className={`mobile-menu-item flex items-center gap-4 p-4 rounded-[18px] border transition-colors ${
                        active
                          ? 'bg-primary/[0.12] border-primary/30'
                          : 'bg-primary/[0.06] border-transparent active:bg-primary/[0.1]'
                      }`}
                    >
                      <span className="flex-none flex size-[46px] items-center justify-center rounded-[13px] bg-primary/[0.12]">
                        <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">{icon}</span>
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-label text-[15px] font-medium uppercase tracking-[0.1em] text-on-surface">
                          {label}
                        </span>
                        <span className="text-[12px] tracking-[0.02em] text-outline">{desc}</span>
                      </span>
                      <span className="material-symbols-outlined ml-auto text-outline" aria-hidden="true">chevron_right</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer: quick actions + primary CTA */}
          <div className="flex flex-col gap-4 px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-3 gap-2.5">
              <button type="button" onClick={openReception} aria-label={contactLabel} className={quickActionClass}>
                <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">support_agent</span>
                <span className="text-[11.5px] font-medium tracking-[0.04em]">{quickLabels.reception}</span>
              </button>

              <a
                href={`tel:+${SPA_PHONES[0].wa}`}
                onClick={() => {
                  trackEvent(EVENTS.PHONE_CLICKED, { platform: 'phone', source: 'mobile-menu' })
                  close()
                }}
                className={quickActionClass}
              >
                <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">phone</span>
                <span className="text-[11.5px] font-medium tracking-[0.04em]">{quickLabels.call}</span>
              </a>

              <a
                href={SPA_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className={quickActionClass}
              >
                <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">directions</span>
                <span className="text-[11.5px] font-medium tracking-[0.04em]">{quickLabels.directions}</span>
              </a>
            </div>

            <Link
              href={`/${locale}/book`}
              onClick={close}
              className="flex w-full items-center justify-center gap-3 rounded-[14px] bg-primary py-[18px] font-label text-xs font-bold uppercase tracking-[0.18em] text-on-primary transition-colors hover:bg-primary-fixed"
            >
              {bookLabel}
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
