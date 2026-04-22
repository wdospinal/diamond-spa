import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = (isLocale(params.lang) ? params.lang : 'es') as Locale
  const { metaTitle: title, metaDesc: description, ogImageAlt: imageAlt } = getDict(locale).masajesParaHombres
  return {
    title,
    description,
    alternates: buildAlternates('/masajes-para-hombres'),
    openGraph: buildOpenGraph({ title, description, path: '/masajes-para-hombres', locale, imageAlt }),
  }
}

export default function MasajesParaHombresPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const p = getDict(locale).masajesParaHombres

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(p.faqs)) }}
      />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">

        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">
            {p.heroLabel}
          </p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">
            {p.heroTitle}
          </h1>
          <p className="text-slate-400 font-body text-lg leading-relaxed max-w-2xl mb-8">
            {p.heroBody}
          </p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
          >
            {p.bookMassage}
          </Link>
        </section>

        {/* Featured massages */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {p.featuredTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {p.featuredMassages.map((m) => (
              <div key={m.id} className="bg-surface-container p-8 flex flex-col gap-4">
                <h3 className="font-headline text-xl text-on-surface tracking-tighter">
                  {m.title}
                </h3>
                <p className="text-slate-400 font-body text-sm leading-relaxed flex-1">
                  {m.description}
                </p>
                <div className="flex gap-4 mt-2">
                  <Link
                    href={`/${locale}/services/${m.id}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {p.viewDetails}
                  </Link>
                  <Link
                    href={`/${locale}/book?service=${m.id}`}
                    className="text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                  >
                    {p.book}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={`/${locale}/services`}
              className="text-slate-400 hover:text-primary font-label text-sm tracking-widest uppercase transition-colors"
            >
              {p.viewAllServices}
            </Link>
          </div>
        </section>

        {/* Why Diamond Spa */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {p.whyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {p.pillars.map((pillar) => (
              <div key={pillar.icon} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{pillar.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">
                  {pillar.title}
                </h3>
                <p className="text-slate-400 font-body text-sm leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10">
            {p.faqTitle}
          </h2>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {p.faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                  {faq.question}
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-400 font-body text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-container p-12 text-center">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">
            {p.ctaLabel}
          </p>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-6">
            {p.ctaTitle}
          </h2>
          <p className="text-slate-400 font-body text-sm mb-8 max-w-md mx-auto">
            {p.ctaBody}
          </p>
          <Link
            href={`/${locale}/book`}
            className="inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-10 py-4 hover:opacity-90 transition-opacity"
          >
            {p.bookMassage}
          </Link>
        </section>

      </main>
    </>
  )
}
