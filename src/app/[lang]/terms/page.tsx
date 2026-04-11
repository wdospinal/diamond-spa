import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LegalArticle from '@/components/LegalArticle'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const { metaTitle: title, metaDesc: description } = getDict(locale).legal.terms
  return {
    title,
    description,
    alternates: buildAlternates('/terms'),
    openGraph: buildOpenGraph({ title, description, path: '/terms', locale }),
  }
}

export default function TermsPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).legal.terms
  return <LegalArticle title={t.title} paragraphs={t.body} />
}
