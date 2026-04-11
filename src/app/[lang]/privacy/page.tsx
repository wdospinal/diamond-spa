import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
import type { Metadata } from 'next'
import LegalArticle from '@/components/LegalArticle'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const { metaTitle: title, metaDesc: description } = getDict(locale).legal.privacy
  return {
    title,
    description,
    alternates: buildAlternates('/privacy'),
    openGraph: buildOpenGraph({ title, description, path: '/privacy', locale }),
  }
}

export default function PrivacyPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).legal.privacy
  return <LegalArticle title={t.title} paragraphs={t.body} />
}
