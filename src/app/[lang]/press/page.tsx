import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LegalArticle from '@/components/LegalArticle'
import { getDict, isLocale, type Locale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale).legal.press
  return { title: t.metaTitle, description: t.metaDesc }
}

export default function PressPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).legal.press
  return <LegalArticle title={t.title} paragraphs={t.body} />
}
