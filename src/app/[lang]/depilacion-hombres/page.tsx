import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n'
import { DEPILACION_GENDER_SEO } from '@/lib/depilacion-gender'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'
import { mergeLandingMetadata } from '@/lib/landing-meta'
import DepilacionGenderPage from '@/components/DepilacionGenderPage'

export const dynamic = 'force-static'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const seo = DEPILACION_GENDER_SEO.hombres
  return mergeLandingMetadata(
    '/depilacion-hombres',
    locale,
    { title: seo.metaTitle[locale], description: seo.metaDescription[locale] },
    {
      alternates: buildAlternates('/depilacion-hombres', locale),
      openGraph: buildOpenGraph({ title: seo.metaTitle[locale], description: seo.metaDescription[locale], path: '/depilacion-hombres', locale }),
      keywords: seo.keywords,
    },
  )
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return <DepilacionGenderPage locale={lang as Locale} gender="hombres" />
}
