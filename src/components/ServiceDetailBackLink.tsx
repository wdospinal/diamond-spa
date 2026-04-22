'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { SERVICE_DETAIL_FROM_MASAJES, SERVICE_DETAIL_FROM_HOME, SERVICE_DETAIL_FROM_QUERY } from '@/lib/service-detail-nav'

type Props = {
  locale: Locale
  backToServices: string
  backToMenMassages: string
  backToHome: string
  className?: string
}

export function ServiceDetailBackLink({ locale, backToServices, backToMenMassages, backToHome, className }: Props) {
  const from = useSearchParams().get(SERVICE_DETAIL_FROM_QUERY)
  if (from === SERVICE_DETAIL_FROM_MASAJES) {
    return (
      <Link href={`/${locale}/${SERVICE_DETAIL_FROM_MASAJES}`} className={className}>
        {backToMenMassages}
      </Link>
    )
  }
  if (from === SERVICE_DETAIL_FROM_HOME) {
    return (
      <Link href={`/${locale}`} className={className}>
        {backToHome}
      </Link>
    )
  }
  return (
    <Link href={`/${locale}/services`} className={className}>
      {backToServices}
    </Link>
  )
}
