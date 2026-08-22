'use client'

import { randomWhatsAppUrl } from '@/lib/phones'
import { EVENTS, trackEvent } from '@/lib/events'
import { pushEvent } from '@/lib/gtm'

import { openWhatsAppBridge } from '@/components/WhatsAppBridgeModal'

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
        openWhatsAppBridge({ text, source })
      }}
      className={className}
      {...rest}
    >
      {children}
    </button>
  )
}
