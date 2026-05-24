import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
import type { Metadata } from 'next'
import LegalArticle from '@/components/LegalArticle'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'es'
  const { metaTitle: title, metaDesc: description } = getDict(locale).legal.terms
  return {
    title,
    description,
    alternates: buildAlternates('/terms'),
    openGraph: buildOpenGraph({ title, description, path: '/terms', locale }),
  }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const t = getDict(locale).legal.terms
  return <LegalArticle title={t.title} paragraphs={t.body} />
}
