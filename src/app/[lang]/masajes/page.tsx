import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { isLocale, type Locale } from '@/lib/i18n'
import { serviceShortDesc, getServiceById } from '@/lib/services'
import { MASAJES_HUB_SEO, MASAJES_TYPE_SEO, slugForMasajeType } from '@/lib/masajes-category'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const dynamic = 'force-static'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const { metaTitle: title, metaDescription: description } = MASAJES_HUB_SEO
  return mergeLandingMetadata(
    '/masajes',
    locale,
    { title: title[locale], description: description[locale] },
    {
      alternates: buildAlternates('/masajes', locale),
      openGraph: buildOpenGraph({ title: title[locale], description: description[locale], path: '/masajes', locale }),
    },
  )
}

export default async function MasajesHubPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const isEn = locale === 'en'

  return (
    <>
      {/* HERO */}
      <header className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[color:var(--color-surface-container)] to-[color:var(--color-surface)]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            Diamond Spa — El Poblado
          </p>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-none mb-6">
            {MASAJES_HUB_SEO.h1[locale]}
          </h1>
          <p className="text-on-surface/60 text-lg max-w-xl leading-relaxed">
            {isEn
              ? 'Seven techniques, one goal: giving your body exactly the relief it needs.'
              : 'Siete técnicas, un solo objetivo: darle a tu cuerpo exactamente el alivio que necesita.'}
          </p>
        </div>
      </header>

      {/* Audience shortcuts */}
      <section className="px-6 md:px-12 pb-4">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-3">
          <Link
            href={`/${locale}/masajes-para-hombres`}
            className="px-5 py-2.5 font-label text-[10px] tracking-[0.2em] uppercase border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-all duration-200"
          >
            {isEn ? 'Massages for men' : 'Masajes para hombres'}
          </Link>
          <Link
            href={`/${locale}/masajes-para-mujeres`}
            className="px-5 py-2.5 font-label text-[10px] tracking-[0.2em] uppercase border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-all duration-200"
          >
            {isEn ? 'For women' : 'Para Mujeres'}
          </Link>
        </div>
      </section>

      {/* Type grid */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 pb-32 pt-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MASAJES_TYPE_SEO.map(entry => {
            const service = getServiceById(entry.serviceId)
            if (!service) return null
            const slug = slugForMasajeType(entry, locale, service)
            return (
              <article
                key={entry.serviceId}
                className="group flex flex-col bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 p-6"
              >
                <Link href={`/${locale}/masajes/${slug}`} className="flex flex-col flex-1">
                  <h2 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors duration-200 leading-tight mb-3">
                    {entry.h1[locale]}
                  </h2>
                  <p className="text-on-surface/50 text-sm leading-relaxed flex-1">
                    {serviceShortDesc(service, locale)}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-label text-[10px] tracking-[0.2em] uppercase text-primary/60 group-hover:text-primary transition-colors">
                    {isEn ? 'View details' : 'Ver detalles'}
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </span>
                </Link>
              </article>
            )
          })}
        </div>
      </main>
    </>
  )
}
