import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SpecialDatePage, specialDateMetadata } from '@/components/special-dates/SpecialDatePage'
import { SPECIAL_DATES, getSpecialDate } from '@/lib/special-dates'

export const revalidate = 86400

export async function generateStaticParams() {
  return SPECIAL_DATES.map(d => ({ lang: 'en', occasion: d.slug.en }))
}

type Params = { params: Promise<{ lang: string; occasion: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, occasion } = await params
  const d = lang === 'en' ? getSpecialDate(occasion, 'en') : undefined
  return d ? specialDateMetadata(d, 'en') : {}
}

export default async function Page({ params }: Params) {
  const { lang, occasion } = await params
  const d = lang === 'en' ? getSpecialDate(occasion, 'en') : undefined
  if (!d) notFound()
  return <SpecialDatePage d={d} locale="en" />
}
