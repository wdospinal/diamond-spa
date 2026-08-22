'use client'

import { randomWhatsAppUrl } from '@/lib/phones'
import { EVENTS, trackEvent } from '@/lib/events'
import { pushEvent } from '@/lib/gtm'

type WhatsAppLinkProps = {
  text: string
  source?: string
  children: React.ReactNode
  className?: string
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children' | 'className' | 'type'
>

export default function WhatsAppLink({
  text,
  source = 'site',
  children,
  className,
  ...rest
}: WhatsAppLinkProps) {
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source })
        // Also push to GTM dataLayer for GA4 / Google Ads tracking
        try {
          const p = new URLSearchParams(window.location.search)
          const campaign = p.get('utm_campaign') || sessionStorage.getItem('sem_campaign') || ''
          const adgroup  = p.get('adgroup') || sessionStorage.getItem('sem_adgroup') || ''
          const gclid    = p.get('gclid') || sessionStorage.getItem('gclid') || ''
          
          const payload = {
            source,
            button: 'inline',
            ...(campaign ? { campaign } : {}),
            ...(adgroup  ? { adgroup }  : {}),
            ...(gclid    ? { gclid }    : {}),
          }
          
          pushEvent('whatsapp_click', payload)
          
          if (campaign || adgroup || sessionStorage.getItem('sem_trigger_key')) {
            pushEvent('whatsapp_lead_ads', payload)
          }
        } catch { /* analytics must never crash the app */ }
        window.open(randomWhatsAppUrl(text), '_blank', 'noopener,noreferrer')
      }}
      className={className}
      {...rest}
    >
      {children}
    </button>
  )
}
