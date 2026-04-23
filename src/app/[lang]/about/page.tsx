import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'
import { IMG_ABOUT_HERO, IMG_STONE, IMG_LOUNGE, IMG_THERAPISTS } from '@/lib/images'

const HERO_IMG = IMG_ABOUT_HERO
const STONE_IMG = IMG_STONE
const LOUNGE_IMG = IMG_LOUNGE

const THERAPISTS_IMGS = IMG_THERAPISTS
const THERAPISTS_NAMES = ['Daniela Salina', 'Sary Paez', 'Camila Mazo']

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  const { metaTitle: title, metaDesc: description } = t.about
  return {
    title,
    description,
    alternates: buildAlternates('/about'),
    openGraph: buildOpenGraph({ title, description, path: '/about', locale }),
  }
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).about

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center px-6 md:px-12 overflow-hidden bg-surface">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-24">
          <div className="lg:col-span-7 z-10">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.tagline}</span>
            <h1 className="font-headline text-5xl md:text-8xl text-on-surface leading-tight mb-8">
              {t.titleParts[0]} <span className="italic text-primary">{t.titleParts[1]}</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-secondary max-w-xl leading-relaxed font-light">{t.heroBody}</p>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
              <Image
                src={HERO_IMG}
                alt="Luxury spa interior"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover opacity-80"
                priority
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-56 h-72 bg-surface-container-high hidden lg:flex flex-col justify-end p-7">
              <p className="font-headline text-primary text-2xl mb-3 italic">{t.quietTitle}</p>
              <p className="font-body text-xs text-secondary leading-relaxed">{t.quietBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HERITAGE */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
                <Image
                  src={STONE_IMG}
                  alt="Stone massage"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-60 transition-opacity duration-700 hover:opacity-90"
                />
              </div>
              <div className="relative aspect-square translate-y-8 overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
                <Image
                  src={LOUNGE_IMG}
                  alt="Spa lounge"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-60 transition-opacity duration-700 hover:opacity-90"
                />
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.heritageLabel}</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-8">
              {t.heritageTitle[0]} <span className="italic">{t.heritageTitle[1]}</span>
            </h2>
            <p className="font-body text-secondary mb-6 leading-relaxed text-lg">{t.heritageBody1}</p>
            <p className="font-body text-secondary leading-relaxed text-lg">{t.heritageBody2}</p>
          </div>
        </div>
      </section>

      {/* INTERNATIONAL STANDARD */}
      <section className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto text-center mb-24">
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-6">{t.standardTitle}</h2>
          <div className="h-px w-24 bg-primary mx-auto" />
        </div>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
          {t.pillars.map(({ icon, title, body }) => (
            <div key={title} className="bg-surface p-12 hover:bg-surface-container-low transition-colors duration-500 group">
              <span className="material-symbols-outlined text-4xl text-primary mb-8 block">{icon}</span>
              <h3 className="font-headline text-2xl text-on-surface mb-6">{title}</h3>
              <p className="font-body text-secondary leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-lowest">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.teamLabel}</span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
                {t.teamTitle[0]} <span className="italic">{t.teamTitle[1]}</span>
              </h2>
            </div>
            <p className="font-body text-secondary max-w-sm text-sm leading-relaxed">{t.teamBody}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.therapists.map(({ role }, i) => (
              <div key={i} className="group">
                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
                  <Image
                    src={THERAPISTS_IMGS[i]}
                    alt={THERAPISTS_NAMES[i]}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover opacity-70 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </div>
                <h4 className="font-headline text-xl text-on-surface mb-1">{THERAPISTS_NAMES[i]}</h4>
                <p className="font-label text-primary text-xs tracking-widest uppercase">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-4xl md:text-7xl text-on-surface mb-12">
            {t.ctaTitle[0]} <span className="italic text-primary">{t.ctaTitle[1]}</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {t.requestMembership}
            </Link>
            <Link href={`/${locale}/services`} className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300">
              {t.exploreServices}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
