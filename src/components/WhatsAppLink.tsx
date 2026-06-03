'use client'

import { randomWhatsAppUrl } from '@/lib/phones'
import { EVENTS, trackEvent } from '@/lib/events'

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
        window.open(randomWhatsAppUrl(text), '_blank', 'noopener,noreferrer')
      }}
      className={className}
      {...rest}
    >
      {children}
    </button>
  )
}
