import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd } from '@/lib/seo'
import { IMG_HERO_HOME, IMG_DEEP_TISSUE, IMG_FACIAL, IMG_RELAXATION, IMG_BOUTIQUE } from '@/lib/images'
import { getServiceById } from '@/lib/services'
import { SERVICE_DETAIL_FROM_HOME, SERVICE_DETAIL_FROM_QUERY } from '@/lib/service-detail-nav'

export const dynamic = 'force-static'

const DEEP_TISSUE_IMG = IMG_DEEP_TISSUE
const FACIAL_IMG = IMG_FACIAL
const RELAX_IMG = IMG_RELAXATION
const BOUTIQUE_IMG = IMG_BOUTIQUE

const FEATURED_SERVICES = {
  deepTissue: getServiceById('depilacion-cuerpo-completo')!,
  facial: getServiceById('hidrafacial')!,
  sensitive: getServiceById('sensitive')!,
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const title = locale === 'en'
    ? 'Diamond Spa — Spa for Men and Women in Medellín'
    : 'Diamond Spa — Spa para Hombres y Mujeres en Medellín'
  const description = locale === 'en'
    ? 'Massages for men and women in El Poblado, Medellín: relaxing, deep tissue, sports, facials and hair removal. From $120,000 COP — book online.'
    : 'Masajes relajantes, deportivos, deep tissue y faciales para hombres y mujeres en El Poblado, Medellín. Desde $120.000 COP — reserva online.'
  return {
    title,
    description,
    alternates: buildAlternates(''),
    openGraph: buildOpenGraph({ title, description, path: '', locale, imageAlt: 'Diamond Spa — El Poblado, Medellín' }),
  }
}

export default function HomePage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale)
  const h = t.home

  const fromParam = `?${SERVICE_DETAIL_FROM_QUERY}=${SERVICE_DETAIL_FROM_HOME}`
  const deepTissueDesc = locale === 'en' ? FEATURED_SERVICES.deepTissue.shortDesc.en : FEATURED_SERVICES.deepTissue.shortDesc.es
  const facialDesc = locale === 'en' ? FEATURED_SERVICES.facial.shortDesc.en : FEATURED_SERVICES.facial.shortDesc.es
  const relaxDesc = locale === 'en' ? FEATURED_SERVICES.sensitive.shortDesc.en : FEATURED_SERVICES.sensitive.shortDesc.es

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      {/* HERO */}
      <section className="relative min-h-dvh flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMG_HERO_HOME}
            alt={locale === 'es'
              ? 'Interior boutique de Diamond Spa en El Poblado, Medellín, con iluminación cálida y ambiente relajante'
              : 'Boutique interior of Diamond Spa in El Poblado, Medellín, with warm lighting and a relaxing atmosphere'}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/20" />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-12 pt-10 md:pt-14 pb-24">
          <div className="lg:w-2/3 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs">{h.tagline}</span>
            <span className="w-px h-3 bg-outline-variant/40" />
            <span className="inline-flex items-center gap-1 font-label text-outline text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined shrink-0 overflow-visible" style={{ fontSize: '16px', lineHeight: '1' }}>location_on</span>
              Medellín, El Poblado
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface leading-tight mb-8 w-full">
            {h.h1[0]}<br />{h.h1[1]}
          </h1>
          <p className="font-body text-secondary text-lg max-w-xl leading-relaxed font-light mb-12">{h.body}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/book`} className="inline-flex items-center gap-3 bg-primary text-on-primary px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-all duration-300">
              {h.bookSession}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-surface-container-high transition-all duration-300">
              {h.exploreServices}
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* CURATED RESTORATION */}
      <section className="py-28 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{h.section2Title}</h2>
              <p className="mt-4 font-body text-secondary max-w-lg leading-relaxed font-light">{h.section2Body}</p>
              <Link href={`/${locale}/masajes-para-hombres`} className="mt-4 inline-flex items-center gap-1 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all">
                {locale === 'es' ? 'Masajes para hombres en Medellín' : 'Massages for men in Medellín'} <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Deep Tissue */}
            <div className="md:col-span-6 relative group min-h-[480px] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
              <Image
                src={DEEP_TISSUE_IMG}
                alt={locale === 'es'
                  ? 'Sesión de depilación profesional de cuerpo completo en cabina privada de Diamond Spa'
                  : 'Professional full-body hair removal session in a private cabin at Diamond Spa'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover img-hover-color"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 z-10">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.care}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.hairRemovalTitle}</h3>
                <p className="font-body text-secondary text-sm max-w-md leading-relaxed mb-5">{deepTissueDesc}</p>
                <Link href={`/${locale}/services/${FEATURED_SERVICES.deepTissue.id}${fromParam}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                  {h.viewDetails} <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
            {/* Facial */}
            <div className="md:col-span-6 relative group min-h-[480px] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
              <Image
                src={FACIAL_IMG}
                alt={locale === 'es'
                  ? 'Mujer recibiendo un tratamiento facial Hidrafacial para una piel limpia, hidratada y radiante'
                  : 'Woman receiving a Hidrafacial treatment for clean, hydrated and radiant skin'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top img-hover-color"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 z-10">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.treatments}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.facialTitle}</h3>
                <p className="font-body text-secondary text-sm max-w-md leading-relaxed mb-5">{facialDesc}</p>
                <Link href={`/${locale}/services/${FEATURED_SERVICES.facial.id}${fromParam}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                  {h.viewDetails} <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
            {/* Relaxation */}
            <div className="md:col-span-12 relative flex min-h-[480px] items-center overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10 group">
              <Image
                src={RELAX_IMG}
                alt={locale === 'es'
                  ? 'Persona disfrutando de un masaje relajante de aceites esenciales en una camilla de Diamond Spa'
                  : 'Person enjoying a relaxing essential-oil massage on a treatment table at Diamond Spa'}
                fill
                sizes="100vw"
                className="object-cover img-hover-color"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container/70 to-transparent" />
              <div className="relative z-10 px-10 py-10 max-w-2xl">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.relaxLabel}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.relaxTitle}</h3>
                <p className="font-body text-secondary text-sm leading-relaxed mb-5">{relaxDesc}</p>
                <Link href={`/${locale}/services/${FEATURED_SERVICES.sensitive.id}${fromParam}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                  {h.viewDetails} <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERNATIONAL STANDARD */}
      <section className="py-28 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-16">{h.standardTitle}</h2>
            <div className="flex flex-col gap-10">
              {h.features.map(({ icon, title, body }) => (
                <div key={title} className="flex gap-6">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <h4 className="font-label font-bold text-on-surface tracking-widest uppercase text-xs mb-3">{title}</h4>
                    <p className="font-body text-secondary text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
              <Image
                src={BOUTIQUE_IMG}
                alt={locale === 'es'
                  ? 'Espacio boutique de Diamond Spa con decoración minimalista, luz tenue y mobiliario de madera natural'
                  : 'Diamond Spa boutique space with minimalist decor, soft lighting and natural wood furnishings'}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover opacity-80 transition-opacity duration-700 hover:opacity-100"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-surface-container-high/90 p-6 backdrop-blur-sm">
              <p className="font-headline italic text-on-surface text-sm leading-relaxed mb-2">&ldquo;{h.quote}&rdquo;</p>
              <span className="font-label text-tertiary text-xs tracking-widest uppercase">{h.quoteSource}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-12">
            {h.ctaTitle[0]} <span className="italic text-primary">{h.ctaTitle[1]}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {h.reserveSession}
            </Link>
            <Link href={`/${locale}/services`} className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300">
              {h.exploreServices}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
