import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { LOCALES } from '@/lib/constants/locale'
import BookClient from '@/components/BookClient'

// Pre-render both locale variants at build time — never SSR on demand
export const dynamic = 'force-static'

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }))
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function BookPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale

  // Compute the locale-specific dict on the server so BookClient doesn't
  // need to import the full 39 KB bilingual i18n module at runtime.
  const t = getDict(locale).book

  return (
    <Suspense>
      <BookClient locale={locale} t={t} />
    </Suspense>
  )
}
