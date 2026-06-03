'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { SERVICE_DETAIL_FROM_MASAJES, SERVICE_DETAIL_FROM_HOME, SERVICE_DETAIL_FROM_KEY } from '@/lib/service-detail-nav'

type Props = {
  locale: Locale
  backToServices: string
  backToMenMassages: string
  backToHome: string
  className?: string
}

export function ServiceDetailBackLink({ locale, backToServices, backToMenMassages, backToHome, className }: Props) {
  const [from, setFrom] = useState<string | null>(null)

  useEffect(() => {
    setFrom(sessionStorage.getItem(SERVICE_DETAIL_FROM_KEY))
  }, [])

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
