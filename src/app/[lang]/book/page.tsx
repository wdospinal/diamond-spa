import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import BookClient from '@/components/BookClient'

export default function BookPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  return <BookClient locale={params.lang} />
}
