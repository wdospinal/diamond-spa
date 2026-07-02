import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { readPublishedPosts, getPostBySlug } from '@/lib/blog-store'
import { BASE_URL } from '@/lib/seo'
import { SPA_NAME_FULL, SPA_LOGO } from '@/lib/spa'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  bienestar: { es: 'Bienestar', en: 'Wellness' },
  novedades: { es: 'Novedades', en: 'News' },
  servicios:  { es: 'Servicios', en: 'Services' },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = isLocale(lang) ? lang : 'es'
  const post = await getPostBySlug(slug)
  if (!post || post.isDraft) return { title: 'Artículo no encontrado | Diamond Spa' }

  const isEn = locale === 'en'
  const title   = (isEn ? post.title.en   : post.title.es)   ?? post.title.es
  const excerpt = (isEn ? post.excerpt.en : post.excerpt.es) ?? post.excerpt.es
  const image   = post.coverUrl ?? `${BASE_URL}/og-default.jpg`
  const canonical = `${BASE_URL}/${locale}/blog/${slug}`

  return {
    title: `${title} | Diamond Spa Medellín`,
    description: excerpt,
    alternates: {
      canonical,
      languages: {
        es: `${BASE_URL}/es/blog/${slug}`,
        en: `${BASE_URL}/en/blog/${slug}`,
        'x-default': `${BASE_URL}/es/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt,
      url: canonical,
      siteName: SPA_NAME_FULL,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const isEn = locale === 'en'

  const post = await getPostBySlug(slug)
  if (!post || post.isDraft) notFound()
  // If this locale isn't published, 404
  if (!post.locales.includes(locale)) notFound()

  const title   = (isEn ? post.title.en   : post.title.es)   ?? post.title.es
  const content = (isEn ? post.content.en : post.content.es) ?? post.content.es
  const catLabel = CATEGORY_LABELS[post.category]?.[locale] ?? post.category

  const date = new Date(post.publishedAt).toLocaleDateString(
    isEn ? 'en-US' : 'es-CO',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  // JSON-LD Article schema
  const canonical = `${BASE_URL}/${locale}/blog/${slug}`
  const image = post.coverUrl ?? `${BASE_URL}/og-default.jpg`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: (isEn ? post.excerpt.en : post.excerpt.es) ?? post.excerpt.es,
    url: canonical,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: SPA_NAME_FULL,
      logo: { '@type': 'ImageObject', url: SPA_LOGO },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        {post.coverUrl ? (
          <div className="relative h-[55vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverUrl}
              alt={title}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-surface)] via-[color:var(--color-surface)]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-surface)]/30 to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-b from-surface-container to-surface" />
        )}
      </div>

      {/* ── ARTICLE ──────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 md:px-8 -mt-32 relative z-10 pb-32">
        {/* Back link */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 font-label text-[10px] tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors mb-10"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
          {isEn ? 'Back to Blog' : 'Volver al Blog'}
        </Link>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <span className="font-label text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 px-2.5 py-1">
            {catLabel}
          </span>
          <time className="font-label text-[10px] text-on-surface/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs" aria-hidden="true">calendar_month</span>
            {date}
          </time>
          <span className="font-label text-[10px] text-on-surface/30 ml-auto">
            {post.authorName}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-headline text-4xl md:text-6xl text-on-surface font-light leading-tight mb-10">
          {title}
        </h1>

        {/* Content */}
        <div className="rich-editor-content max-w-none">
          <div className="tiptap" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* Divider */}
        <div className="my-16 border-t border-outline-variant/20" />

        {/* Author card */}
        <div className="flex items-center gap-4 p-6 bg-surface-container border border-outline-variant/20">
          <div className="w-11 h-11 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="font-headline text-primary text-lg">{post.authorName[0] ?? 'D'}</span>
          </div>
          <div>
            <p className="font-label text-[8px] tracking-[0.2em] uppercase text-on-surface/30 mb-0.5">
              {isEn ? 'Published by' : 'Publicado por'}
            </p>
            <p className="font-label text-sm font-bold text-on-surface uppercase tracking-wider">
              {post.authorName}
            </p>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="ml-auto font-label text-[9px] tracking-[0.2em] uppercase text-on-surface/30 hover:text-primary transition-colors flex items-center gap-1"
          >
            {isEn ? 'More articles' : 'Más artículos'}
            <span className="material-symbols-outlined text-xs" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>

        {/* Book CTA */}
        <div className="mt-10 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
          <p className="font-label text-[10px] tracking-[0.25em] uppercase text-primary mb-3">
            Diamond Spa — El Poblado
          </p>
          <p className="font-headline text-2xl text-on-surface mb-6">
            {isEn ? 'Ready to experience it?' : '¿Lista para vivirlo?'}
          </p>
          <Link
            href={`/${locale}/book`}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 font-label text-xs tracking-widest uppercase hover:bg-white transition-all duration-300"
          >
            {isEn ? 'Book now' : 'Reserva ahora'}
          </Link>
        </div>
      </main>
    </>
  )
}
