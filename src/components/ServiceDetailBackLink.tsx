'use client'

import { Suspense } from 'react'
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

function BackLinkInner({ locale, backToServices, backToMenMassages, backToHome, className }: Props) {
  const { get } = useSearchParams()
  const from = get(SERVICE_DETAIL_FROM_QUERY)
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

export function ServiceDetailBackLink(props: Props) {
  return (
    <Suspense fallback={<Link href={`/${props.locale}/services`} className={props.className}>{props.backToServices}</Link>}>
      <BackLinkInner {...props} />
    </Suspense>
  )
}
