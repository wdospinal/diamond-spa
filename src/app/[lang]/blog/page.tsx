import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { readPublishedPosts, type BlogCategory } from '@/lib/blog-store'
import { buildOpenGraph } from '@/lib/seo'
import { BASE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<BlogCategory, { es: string; en: string }> = {
  bienestar: { es: 'Bienestar', en: 'Wellness' },
  novedades: { es: 'Novedades', en: 'News' },
  servicios:  { es: 'Servicios', en: 'Services' },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'es'
  const isEn = locale === 'en'

  const title = isEn
    ? 'Blog — Wellness Tips & News | Diamond Spa Medellín'
    : 'Blog — Consejos de Bienestar y Novedades | Diamond Spa Medellín'
  const description = isEn
    ? 'Discover expert wellness articles, spa news, and self-care tips from Diamond Spa in El Poblado, Medellín.'
    : 'Descubre artículos de bienestar, novedades del spa y consejos de autocuidado de Diamond Spa en El Poblado, Medellín.'

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        es: `${BASE_URL}/es/blog`,
        en: `${BASE_URL}/en/blog`,
        'x-default': `${BASE_URL}/es/blog`,
      },
    },
    openGraph: buildOpenGraph({ title, description, path: '/blog', locale }),
  }
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const isEn = locale === 'en'

  const posts = await readPublishedPosts(locale)

  const CATEGORIES: { id: BlogCategory | 'all'; label: string }[] = [
    { id: 'all',       label: isEn ? 'All'      : 'Todos'     },
    { id: 'bienestar', label: isEn ? 'Wellness' : 'Bienestar' },
    { id: 'novedades', label: isEn ? 'News'     : 'Novedades' },
    { id: 'servicios', label: isEn ? 'Services' : 'Servicios' },
  ]

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[color:var(--color-surface-container)] to-[color:var(--color-surface)]" />
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-primary) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            Diamond Spa — El Poblado
          </p>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-none mb-6">
            {isEn ? 'Wellness' : 'Bienestar'}{' '}
            <span className="text-primary italic">{isEn ? 'Blog' : '& Blog'}</span>
          </h1>
          <p className="text-on-surface/60 text-lg max-w-xl leading-relaxed">
            {isEn
              ? 'Expert tips, spa insights, and self-care guides from our therapists.'
              : 'Consejos expertos, reflexiones sobre el spa y guías de autocuidado de nuestros terapeutas.'}
          </p>
        </div>
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 pb-32">

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap mb-14">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.id === 'all' ? `/${locale}/blog` : `/${locale}/blog?cat=${cat.id}`}
              className="px-5 py-2 font-label text-[10px] tracking-[0.2em] uppercase border border-outline-variant/30 text-on-surface/50 hover:border-primary hover:text-primary transition-all duration-200"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-label text-sm tracking-widest uppercase text-on-surface/30">
              {isEn ? 'No articles published yet.' : 'Aún no hay artículos publicados.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const title   = isEn ? (post.title.en   ?? post.title.es)   : post.title.es
              const excerpt = isEn ? (post.excerpt.en ?? post.excerpt.es) : post.excerpt.es
              const catLabel = CATEGORY_LABELS[post.category]?.[locale] ?? post.category
              const date = new Date(post.publishedAt).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'es-CO',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )

              return (
                <article
                  key={post.id}
                  className="group flex flex-col bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Cover */}
                  {post.coverUrl ? (
                    <Link href={`/${locale}/blog/${post.slug}`} className="block overflow-hidden h-52 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>
                  ) : (
                    <div className="h-52 shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary/30" aria-hidden="true">spa</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-label text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 px-2 py-0.5">
                        {catLabel}
                      </span>
                      <time className="font-label text-[10px] text-on-surface/30 ml-auto">
                        {date}
                      </time>
                    </div>

                    {/* Title */}
                    <Link href={`/${locale}/blog/${post.slug}`} className="block flex-1">
                      <h2 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors duration-200 leading-tight mb-3">
                        {title}
                      </h2>
                      <p className="text-on-surface/50 text-sm leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                    </Link>

                    {/* CTA */}
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="mt-6 inline-flex items-center gap-2 font-label text-[10px] tracking-[0.2em] uppercase text-primary/60 hover:text-primary transition-colors"
                    >
                      {isEn ? 'Read more' : 'Leer más'}
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
