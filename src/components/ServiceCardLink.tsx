'use client'

import Link from 'next/link'
import { setServiceFrom } from '@/lib/service-detail-nav'
import { EVENTS, trackEvent } from '@/lib/events'

type Props = {
  href: string
  from: string
  serviceId?: string
  serviceName?: string
  className?: string
  'aria-label'?: string
  children: React.ReactNode
}

export function ServiceCardLink({ href, from, serviceId, serviceName, className, 'aria-label': ariaLabel, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        setServiceFrom(from)
        if (serviceId) {
          trackEvent(EVENTS.SERVICE_CARD_CLICKED, { service_id: serviceId, service_name: serviceName ?? '', source: from })
        }
      }}
    >
      {children}
    </Link>
  )
}
