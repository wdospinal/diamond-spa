'use client'

import { randomWhatsAppUrl } from '@/lib/phones'

type WhatsAppLinkProps = {
  text: string
  children: React.ReactNode
  className?: string
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'children' | 'className' | 'type'
>

export default function WhatsAppLink({
  text,
  children,
  className,
  ...rest
}: WhatsAppLinkProps) {
  return (
    <button
      type="button"
      onClick={() => window.open(randomWhatsAppUrl(text), '_blank', 'noopener,noreferrer')}
      className={className}
      {...rest}
    >
      {children}
    </button>
  )
}
