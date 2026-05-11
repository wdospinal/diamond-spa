'use client'

import { randomWhatsAppUrl } from '@/lib/phones'

type WhatsAppLinkProps = {
  text: string
  children: React.ReactNode
  className?: string
} & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'onClick' | 'children' | 'className'
>

export default function WhatsAppLink({
  text,
  children,
  className,
  ...rest
}: WhatsAppLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    window.open(randomWhatsAppUrl(text), '_blank', 'noopener,noreferrer')
  }
  return (
    <a
      href="#"
      role="button"
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children}
    </a>
  )
}
