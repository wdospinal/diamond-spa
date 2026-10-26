import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SpecialDatePage, specialDateMetadata } from '@/components/special-dates/SpecialDatePage'
import { SPECIAL_DATES, getSpecialDate } from '@/lib/special-dates'

export const revalidate = 86400

export async function generateStaticParams() {
  return SPECIAL_DATES.map(d => ({ lang: 'es', ocasion: d.slug.es }))
}

type Params = { params: Promise<{ lang: string; ocasion: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, ocasion } = await params
  const d = lang === 'es' ? getSpecialDate(ocasion, 'es') : undefined
  return d ? specialDateMetadata(d, 'es') : {}
}

export default async function Page({ params }: Params) {
  const { lang, ocasion } = await params
  const d = lang === 'es' ? getSpecialDate(ocasion, 'es') : undefined
  if (!d) notFound()
  return <SpecialDatePage d={d} locale="es" />
}
