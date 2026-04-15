'use client'

import { randomWhatsAppUrl } from '@/lib/phones'

export default function WhatsAppLink({
  text,
  children,
  className,
}: {
  text: string
  children: React.ReactNode
  className?: string
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    window.open(randomWhatsAppUrl(text), '_blank', 'noopener,noreferrer')
  }
  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
