import Image from 'next/image'
import { getDict, type Locale } from '@/lib/i18n'
import { SPA_GOOGLE_PLACES_ID } from '@/lib/spa'

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
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${SPA_GOOGLE_PLACES_ID}&fields=rating,user_ratings_total,reviews&key=${key}&language=es`,
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
          <span
            key={n}
            className={`material-symbols-outlined text-sm ${filled || half ? 'text-primary' : 'text-outline/30'}`}
            style={{ fontVariationSettings: half ? "'FILL' 0" : "'FILL' 1" }}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

export async function ReviewsSection({ locale }: { locale: Locale }) {
  const place = await fetchPlaceDetails()
  const t = getDict(locale).location

  return (
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
  )
}
