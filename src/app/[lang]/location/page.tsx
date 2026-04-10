import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  return { title: t.location.metaTitle, description: t.location.metaDesc }
}

interface PlaceReview {
  author_name: string
  rating: number
  relative_time_description: string
  text: string
  profile_photo_url: string
}

interface PlaceDetails {
  rating?: number
  user_ratings_total?: number
  reviews?: PlaceReview[]
}

async function fetchPlaceDetails(): Promise<PlaceDetails> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return {}
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJK8Mybqkp4o4RjIhsXLsM2K8&fields=rating,user_ratings_total,reviews&key=${key}&language=es`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return {}
    const data = await res.json()
    return (data.result as PlaceDetails) ?? {}
  } catch {
    return {}
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = rating >= n
        const half = !filled && rating >= n - 0.5
        return (
          <span key={n} className={`material-symbols-outlined text-sm ${filled || half ? 'text-primary' : 'text-outline/30'}`}
            style={{ fontVariationSettings: half ? "'FILL' 0" : "'FILL' 1" }}>
            star
          </span>
        )
      })}
    </div>
  )
}

export default async function LocationPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).location

  const place = await fetchPlaceDetails()

  return (
    <>
      {/* HERO */}
      <header className="pt-12 md:pt-16 pb-20 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">
            {t.titleParts[0]}<br /><span className="italic text-primary">{t.titleParts[1]}</span>
          </h1>
        </div>
      </header>

      {/* ADDRESS + MAP */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <div className="mb-12">
              <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">Cra 43C #10-42</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic mt-4">El Poblado</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic">Medellín, Antioquia</p>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">phone</span>
                <span className="font-body text-secondary text-sm tracking-widest">+57 314 5484227</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-body text-secondary text-sm tracking-widest">mialedasate1@gmail.com</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              <span className="material-symbols-outlined text-base">directions</span>
              {t.getDirections}
            </a>
          </div>
          <div className="min-h-[460px] overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia&output=embed&z=16"
              width="100%"
              height="460"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diamond Spa location"
            />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{t.reviewsLabel}</span>
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-16">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{t.reviewsSubLabel}</h2>
            {place.rating && (
              <div className="flex items-center gap-4 mb-1">
                <span className="font-headline text-6xl text-primary leading-none">{place.rating.toFixed(1)}</span>
                <div className="flex flex-col gap-1.5">
                  <StarRating rating={place.rating} />
                  <span className="font-label text-outline text-xs tracking-widest">
                    {t.basedOn} {place.user_ratings_total?.toLocaleString()} {t.googleReviews}
                  </span>
                </div>
              </div>
            )}
          </div>

          {place.reviews && place.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {place.reviews.map((review, i) => (
                <div key={i} className="bg-surface-container-low p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={review.profile_photo_url}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-cover"
                      aria-hidden
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label text-on-surface text-xs tracking-widest">{review.author_name}</span>
                      <span className="font-body text-outline text-xs">{review.relative_time_description}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.text && (
                    <p className="font-body text-secondary text-sm leading-relaxed line-clamp-5">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-outline text-sm">{t.noReviews}</p>
          )}
        </div>
      </section>

      {/* HOURS */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{t.hoursLabel}</span>
            <div className="flex flex-col gap-0">
              {t.hours.map(({ day, time }, i) => (
                <div key={day} className={`flex justify-between items-center py-6 ${i < t.hours.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                  <span className="font-body text-secondary text-sm">{day}</span>
                  <span className="font-label text-on-surface text-sm tracking-widest">{time}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-body text-xs text-outline leading-relaxed">{t.hoursNote}</p>
          </div>
          <div className="bg-surface-container-high p-10 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-6 block">lock</span>
              <h3 className="font-headline text-2xl text-on-surface mb-5">{t.privateTitle}</h3>
              <p className="font-body text-secondary leading-relaxed text-sm mb-8">{t.privateBody1}</p>
              <p className="font-body text-secondary leading-relaxed text-sm">{t.privateBody2}</p>
            </div>
            <Link href={`/${locale}/book`} className="mt-10 w-fit bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {t.reserveDirections}
            </Link>
          </div>
        </div>
      </section>

      {/* TRANSPORT */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-12 block">{t.transportLabel}</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {t.transport.map(({ icon, label, detail }, i) => (
              <div key={label} className={`flex gap-6 items-start p-10 hover:bg-surface-container-high transition-colors duration-300 ${i < t.transport.length - 1 ? 'md:border-r border-outline-variant/10' : ''}`}>
                <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
                <div>
                  <h4 className="font-label font-bold text-on-surface text-xs tracking-widest uppercase mb-2">{label}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
        <div className="max-w-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{t.ctaLabel}</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">{t.ctaTitle}</h2>
          <p className="font-body text-secondary text-sm mb-12 leading-relaxed">{t.ctaBody}</p>
          <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
            {t.bookVisit}
          </Link>
        </div>
      </section>
    </>
  )
}
