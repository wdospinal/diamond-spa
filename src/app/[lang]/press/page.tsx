import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
import type { Metadata } from 'next'
import LegalArticle from '@/components/LegalArticle'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const { metaTitle: title, metaDesc: description } = getDict(locale).legal.press
  return {
    title,
    description,
    alternates: buildAlternates('/press'),
    openGraph: buildOpenGraph({ title, description, path: '/press', locale }),
  }
}

export default function PressPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).legal.press
  return <LegalArticle title={t.title} paragraphs={t.body} />
}
