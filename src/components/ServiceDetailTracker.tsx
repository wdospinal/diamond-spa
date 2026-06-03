'use client'

import { useEffect } from 'react'
import { EVENTS, trackEvent } from '@/lib/events'

type Props = { serviceId: string; serviceName: string; locale: string }

export function ServiceDetailTracker({ serviceId, serviceName, locale }: Props) {
  useEffect(() => {
    trackEvent(EVENTS.SERVICE_DETAIL_VIEWED, { service_id: serviceId, service_name: serviceName, locale })
  }, [serviceId, serviceName, locale])
  return null
}
