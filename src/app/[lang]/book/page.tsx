import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import BookClient from '@/components/BookClient'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function BookPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  return <BookClient locale={params.lang} />
}
