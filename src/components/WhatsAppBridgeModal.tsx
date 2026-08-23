'use client'

import { useEffect, useState, useRef } from 'react'
import { randomWhatsAppUrl } from '@/lib/phones'
import { pushEvent } from '@/lib/gtm'
import { EVENTS, trackEvent } from '@/lib/events'

interface WhatsAppBridgeDetail {
  text?: string
  source?: string
}

const COUNTRY_CODES = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
]

const I18N_TEXTS = {
  es: {
    badge: 'Recepción en Línea',
    title: 'Conectar con Recepción',
    subtitle: 'Te transferimos de inmediato por WhatsApp con nuestra recepcionista privada para brindarte atención personalizada.',
    label: 'Tu número de WhatsApp',
    placeholder: '312 345 6789',
    privacy: '🔒 Tu número solo se usa para confirmar tu atención privada.',
    button: 'Iniciar Chat en WhatsApp',
    skip: 'Continuar directo a WhatsApp sin registrar número →',
    close: 'Cerrar ventana',
  },
  en: {
    badge: 'Live Receptionist',
    title: 'Connect with Reception',
    subtitle: 'We will immediately connect you via WhatsApp with our private concierge for personalized assistance.',
    label: 'Your WhatsApp Number',
    placeholder: '312 345 6789',
    privacy: '🔒 Your number is only used to confirm your private appointment.',
    button: 'Start Chat on WhatsApp',
    skip: 'Continue directly to WhatsApp without entering a number →',
    close: 'Close window',
  },
}

export function openWhatsAppBridge(detail?: WhatsAppBridgeDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('open-whatsapp-bridge', { detail }))
}

export default function WhatsAppBridgeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+57')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customText, setCustomText] = useState<string | undefined>(undefined)
  const [source, setSource] = useState<string>('site')
  const [locale, setLocale] = useState<'es' | 'en'>('es')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<WhatsAppBridgeDetail>
      const isEn = window.location.pathname.startsWith('/en')
      setLocale(isEn ? 'en' : 'es')
      // If English, default country code to +1 if not set yet, otherwise +57
      setCountryCode(prev => (isEn && prev === '+57' ? '+1' : prev))
      setCustomText(customEvent.detail?.text)
      setSource(customEvent.detail?.source || 'site')
      setIsOpen(true)
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    }

    window.addEventListener('open-whatsapp-bridge', handleOpen)
    return () => {
      window.removeEventListener('open-whatsapp-bridge', handleOpen)
    }
  }, [])

  const closeModal = () => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    const cleanNumber = phone.replace(/\D/g, '')
    const fullPhone = cleanNumber ? `${countryCode}${cleanNumber}` : ''

    // Read attribution parameters from sessionStorage or URL
    let gclid = ''
    let adgroup = ''
    let campaign = ''
    let isAds = false

    try {
      const p = new URLSearchParams(window.location.search)
      gclid = p.get('gclid') || sessionStorage.getItem('gclid') || ''
      adgroup = p.get('adgroup') || sessionStorage.getItem('sem_adgroup') || ''
      campaign = p.get('utm_campaign') || sessionStorage.getItem('sem_campaign') || ''
      if (gclid || adgroup || campaign || sessionStorage.getItem('sem_trigger_key')) {
        isAds = true
      }
    } catch {
      /* ignore */
    }

    // Analytics tracking
    trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source })
    pushEvent('whatsapp_click', {
      source,
      button: 'bridge_modal',
      locale,
      ...(gclid ? { gclid } : {}),
      ...(adgroup ? { adgroup } : {}),
      ...(campaign ? { campaign } : {}),
    })
    if (isAds) {
      pushEvent('whatsapp_lead_ads', {
        source,
        button: 'bridge_modal',
        locale,
        ...(gclid ? { gclid } : {}),
        ...(adgroup ? { adgroup } : {}),
      })
    }

    // Save the lead to the backend asynchronously with keepalive — even
    // without a phone number, so the gclid/adgroup attribution isn't lost
    // when the visitor uses the "skip" link. Only skip entirely when there's
    // truly nothing worth keeping (no phone AND no ads attribution at all) —
    // otherwise this would fill the Kanban with blank, unactionable cards
    // for fully organic visitors who also skipped the phone step.
    if (fullPhone || isAds) {
      try {
        const body = JSON.stringify({
          phone: fullPhone || undefined,
          gclid: gclid || undefined,
          adgroup: adgroup || undefined,
          campaign: campaign || undefined,
          source: isAds ? 'ads' : 'organic',
          locale,
        })

        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/whatsapp-lead', new Blob([body], { type: 'application/json' }))
        } else {
          fetch('/api/whatsapp-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {
        /* silent */
      }
    }

    // Determine the WhatsApp text message
    let message = customText
    if (!message) {
      if (isAds) {
        message = locale === 'en'
          ? 'Hello, I saw your Google ad and would like more information to book.'
          : 'Hola, vi su anuncio en Google y me gustaría más información para reservar.'
      } else {
        message = locale === 'en'
          ? 'Hello, I would like to book an appointment with reception.'
          : 'Hola, me gustaría agendar una cita con recepción.'
      }
    }

    // Instantly open WhatsApp
    window.open(randomWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
    setIsSubmitting(false)
    closeModal()
  }

  const handleSkip = () => {
    handleConnect()
  }

  if (!isOpen) return null
  const t = I18N_TEXTS[locale] || I18N_TEXTS.es

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md bg-[#001524] border border-[#a5cce6]/25 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-on-surface animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Luxury Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 bg-[#a5cce6]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#f0bd8d]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Header with Live Concierge Status */}
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/15">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34d399]" />
            </span>
            <span className="font-label text-[11px] uppercase tracking-[0.2em] text-[#34d399] font-semibold">
              {t.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label={t.close}
            className="text-on-surface/50 hover:text-on-surface text-xl p-1 -mr-2 leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Title and Value Proposition */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-headline text-2xl sm:text-3xl text-on-surface tracking-tight">
            {t.title}
          </h3>
          <p className="font-body text-xs sm:text-sm text-secondary leading-relaxed font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Fast Input Form */}
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <div>
            <label htmlFor="wa-bridge-phone" className="block font-label text-[10px] uppercase tracking-widest text-[#a5cce6] mb-1.5 font-medium">
              {t.label}
            </label>
            <div className="flex rounded-lg border border-outline-variant/30 bg-[#071d2d]/80 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                aria-label="Country code"
                className="bg-transparent text-xs font-label text-on-surface px-3 py-3.5 border-r border-outline-variant/30 outline-none cursor-pointer hover:bg-white/5 transition-colors"
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code} className="bg-[#0b2131] text-on-surface">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                ref={inputRef}
                id="wa-bridge-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-transparent px-3.5 py-3.5 text-sm font-body text-on-surface placeholder:text-on-surface/30 outline-none"
              />
            </div>
            <p className="text-[10px] text-outline mt-1.5 font-body">
              {t.privacy}
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#25D366] hover:bg-[#22bf5b] text-[#001524] font-label font-bold text-xs uppercase tracking-[0.18em] py-4 px-6 rounded-lg shadow-lg hover:shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2.5 mt-1 active:scale-[0.98]"
          >
            <span>{t.button}</span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </form>

        {/* Discreet Non-obstructive Escape Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-label text-outline/80 hover:text-primary transition-colors underline underline-offset-4 tracking-wider"
          >
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  )
}
