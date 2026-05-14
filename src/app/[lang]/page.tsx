import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd } from '@/lib/seo'
import { IMG_HERO_HOME, IMG_DEEP_TISSUE, IMG_FACIAL, IMG_RELAXATION, IMG_BOUTIQUE } from '@/lib/images'
import { getServiceById } from '@/lib/services'
import { SERVICE_DETAIL_FROM_HOME, SERVICE_DETAIL_FROM_QUERY } from '@/lib/service-detail-nav'
import {
  SPA_ADDRESS,
  SPA_GOOGLE_PLACES_ID,
  SPA_GOOGLE_REVIEW_URL,
} from '@/lib/spa'
import { STATIC_REVIEWS } from '@/lib/reviews'

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

const FEATURED_REVIEWS = STATIC_REVIEWS.slice(0, 3)

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const title = locale === 'en'
    ? 'Diamond Spa — Spa for Men and Women in Medellín'
    : 'Diamond Spa — Spa para Hombres y Mujeres en Medellín'
  const description = locale === 'en'
    ? 'Massages & spa for men and women in El Poblado, Medellín. ⭐ 5.0 · 31 Google reviews. Relaxing, deep tissue, sports, facials & hair removal. From $120,000 COP — book online.'
    : 'Masajes y spa para hombres y mujeres en El Poblado, Medellín. ⭐ 5.0 · 31 reseñas en Google. Relajante, deep tissue, deportivo, faciales. Desde $120.000 COP — reserva online.'
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
  const loc = t.location

  const fromParam = `?${SERVICE_DETAIL_FROM_QUERY}=${SERVICE_DETAIL_FROM_HOME}`
  const deepTissueDesc = locale === 'en' ? FEATURED_SERVICES.deepTissue.shortDesc.en : FEATURED_SERVICES.deepTissue.shortDesc.es
  const facialDesc = locale === 'en' ? FEATURED_SERVICES.facial.shortDesc.en : FEATURED_SERVICES.facial.shortDesc.es
  const relaxDesc = locale === 'en' ? FEATURED_SERVICES.sensitive.shortDesc.en : FEATURED_SERVICES.sensitive.shortDesc.es

  const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${SPA_GOOGLE_PLACES_ID}`

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
                <span className="material-symbols-outlined shrink-0 overflow-visible" style={{ fontSize: '16px', lineHeight: '1' }} aria-hidden="true">location_on</span>
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
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </Link>
              <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-surface-container-high transition-all duration-300">
                {h.exploreServices}
              </Link>
            </div>

            {/* Trust signals strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-10 border-t border-outline-variant/20">
              <a
                href={SPA_GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label={locale === 'es' ? '5 estrellas de 5' : '5 out of 5 stars'}
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                  ))}
                </div>
                <span className="font-label text-on-surface text-xs tracking-wider group-hover:text-primary transition-colors">
                  5.0 · 31 {locale === 'es' ? 'reseñas de Google' : 'Google reviews'}
                </span>
              </a>
              <span className="w-px h-3 bg-outline-variant/30 hidden sm:block" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }} aria-hidden="true">schedule</span>
                <span className="font-label text-outline text-xs tracking-wider">
                  {locale === 'es' ? 'Lun–Sáb 10:00–22:00 · Dom 10:00–19:00' : 'Mon–Sat 10:00–10pm · Sun 10:00–7pm'}
                </span>
              </div>
              <span className="w-px h-3 bg-outline-variant/30 hidden md:block" aria-hidden="true" />
              <div className="hidden md:flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }} aria-hidden="true">location_on</span>
                <span className="font-label text-outline text-xs tracking-wider">{SPA_ADDRESS.street}, {SPA_ADDRESS.neighborhood}</span>
              </div>
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
                {locale === 'es' ? 'Masajes para hombres en Medellín' : 'Massages for men in Medellín'} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
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
                  {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
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
                  {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
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
              <div className="relative z-10 p-10 max-w-2xl">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.relaxLabel}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.relaxTitle}</h3>
                <p className="font-body text-secondary text-sm leading-relaxed mb-5">{relaxDesc}</p>
                <Link href={`/${locale}/services/${FEATURED_SERVICES.sensitive.id}${fromParam}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                  {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-28 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-4 block">{h.reviewsLabel}</span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{h.reviewsTitle}</h2>
            </div>
            <div className="flex items-end gap-4 shrink-0">
              <div className="text-right">
                <div className="font-headline text-5xl text-on-surface leading-none">5.0</div>
                <div
                  className="flex gap-0.5 justify-end mt-2"
                  role="img"
                  aria-label={locale === 'es' ? '5 estrellas de 5' : '5 out of 5 stars'}
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                  ))}
                </div>
                <div className="font-label text-outline text-xs mt-1.5 tracking-wider">
                  31 {loc.googleReviews}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {FEATURED_REVIEWS.map((review) => (
              <div
                key={review.authorAttribution.displayName}
                className="bg-surface-container ring-1 ring-outline-variant/10 p-8 rounded-sm flex flex-col gap-6"
              >
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label={locale === 'es' ? '5 estrellas de 5' : '5 out of 5 stars'}
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                  ))}
                </div>
                <p className="font-body text-secondary text-sm leading-relaxed italic line-clamp-5 flex-1">
                  &ldquo;{review.text?.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
                  <Image
                    src={review.authorAttribution.photoUri}
                    alt=""
                    aria-hidden="true"
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-label font-bold text-on-surface text-xs tracking-wider">
                      {review.authorAttribution.displayName}
                    </div>
                    <div className="font-label text-outline text-xs mt-0.5">
                      {review.relativePublishTimeDescription}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <svg viewBox="0 0 24 24" className="size-5 opacity-40" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href={SPA_GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
            >
              {h.viewAllReviews}
              <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* LOCATION TEASER */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Address */}
            <div>
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-6 block">{h.locationLabel}</span>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0" aria-hidden="true">location_on</span>
                <div>
                  <p className="font-label font-bold text-on-surface text-sm tracking-wide mb-1">{SPA_ADDRESS.street}</p>
                  <p className="font-body text-secondary text-sm">{SPA_ADDRESS.neighborhood}, {SPA_ADDRESS.city}</p>
                  <p className="font-body text-secondary text-sm">{SPA_ADDRESS.region}, {SPA_ADDRESS.country}</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all"
                  >
                    {loc.viewOnMaps} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-6 block">{loc.hoursLabel}</span>
              <div className="flex flex-col gap-4">
                {loc.hours.map(({ day, time }) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-base shrink-0" aria-hidden="true">schedule</span>
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <span className="font-label text-on-surface text-xs tracking-wide">{day}</span>
                      <span className="font-label text-outline text-xs">{time}</span>
                    </div>
                  </div>
                ))}
                <p className="font-body text-outline text-xs leading-relaxed mt-2">{loc.hoursNote}</p>
              </div>
            </div>

            {/* Reserve CTA */}
            <div className="flex flex-col justify-between gap-8">
              <div>
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-6 block">{h.openToday}</span>
                <p className="font-body text-secondary text-sm leading-relaxed">{loc.privateBody1}</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  href={`/${locale}/book`}
                  className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300 w-fit"
                >
                  {h.bookSession}
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </Link>
                <Link
                  href={`/${locale}/location`}
                  className="inline-flex items-center gap-1.5 font-label text-outline text-xs tracking-widest uppercase hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">map</span>
                  {loc.getDirections}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERNATIONAL STANDARD */}
      <section className="py-28 px-6 md:px-12 bg-surface hidden">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-16">{h.standardTitle}</h2>
            <div className="flex flex-col gap-10">
              {h.features.map(({ icon, title, body }) => (
                <div key={title} className="flex gap-6">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0" aria-hidden="true">{icon}</span>
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
