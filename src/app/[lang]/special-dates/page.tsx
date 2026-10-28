import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SpecialDatesHub, specialDatesHubMetadata } from '@/components/special-dates/SpecialDatesHub'

// The catalog is ordered by the next date to come round, so rebuild daily.
export const revalidate = 86400

// English twin of /es/fechas-especiales; /es/special-dates 308s there (next.config.mjs).
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return lang === 'en' ? specialDatesHubMetadata('en') : {}
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (lang !== 'en') notFound()
  return <SpecialDatesHub locale="en" />
}
