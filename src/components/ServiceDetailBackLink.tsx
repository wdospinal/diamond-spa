'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { SERVICE_DETAIL_FROM_MASAJES, SERVICE_DETAIL_FROM_QUERY } from '@/lib/service-detail-nav'

type Props = {
  locale: Locale
  backToServices: string
  backToMenMassages: string
  className?: string
}

export function ServiceDetailBackLink({ locale, backToServices, backToMenMassages, className }: Props) {
  const from = useSearchParams().get(SERVICE_DETAIL_FROM_QUERY)
  const toMen = from === SERVICE_DETAIL_FROM_MASAJES
  const href = toMen ? `/${locale}/${SERVICE_DETAIL_FROM_MASAJES}` : `/${locale}/services`
  const label = toMen ? backToMenMassages : backToServices
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}
