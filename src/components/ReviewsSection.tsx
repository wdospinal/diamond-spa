import Image from 'next/image'
import { getDict, type Locale } from '@/lib/i18n'
import {
  SPA_ADDRESS,
  SPA_GEO,
  SPA_GOOGLE_PLACES_ID,
  SPA_GOOGLE_REVIEW_URL,
  SPA_NAME_FULL,
  SPA_PHONES,
} from '@/lib/spa'

interface PlaceReview {
  relativePublishTimeDescription: string
  rating: number
  text?: { text: string }
  authorAttribution: {
    displayName: string
    photoUri: string
  }
}

interface PlaceDetails {
  rating?: number
  userRatingCount?: number
  reviews?: PlaceReview[]
  displayName?: { text: string; languageCode: string }
  shortFormattedAddress?: string
  internationalPhoneNumber?: string
  primaryTypeDisplayName?: { text: string }
  googleMapsUri?: string
}

async function fetchPlaceDetails(): Promise<PlaceDetails> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return {}
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${SPA_GOOGLE_PLACES_ID}`,
      {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask':
            'rating,userRatingCount,reviews,displayName,shortFormattedAddress,internationalPhoneNumber,primaryTypeDisplayName,googleMapsUri',
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return {}
    const data = await res.json()
    return data as PlaceDetails
  } catch {
    return {}
  }
}

function GoogleLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google"
      role="img"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
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

  const hasReviews = !!place.reviews && place.reviews.length > 0
  const spaName = place.displayName?.text ?? SPA_NAME_FULL
  const spaCategory = place.primaryTypeDisplayName?.text
  const spaAddress = place.shortFormattedAddress ?? SPA_ADDRESS.full
  const spaPhone = place.internationalPhoneNumber ?? SPA_PHONES[0].display
  const mapsUri =
    place.googleMapsUri ??
    `https://www.google.com/maps/search/?api=1&query=${SPA_GEO.latitude},${SPA_GEO.longitude}`

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
                <span className="font-label text-outline text-xs tracking-widest inline-flex items-center gap-1.5">
                  {t.basedOn} {place.userRatingCount?.toLocaleString()}
                  <GoogleLogo className="h-3.5 w-3.5" />
                  {t.googleReviews}
                </span>
              </div>
            </div>
          )}
        </div>

        {hasReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {place.reviews!.map((review, i) => (
              <div key={i} className="bg-surface-container-low p-8 flex flex-col gap-4 relative">
                <a
                  href={SPA_GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on Google"
                  title="Review from Google"
                  className="absolute top-4 right-4 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <GoogleLogo className="h-5 w-5" />
                </a>
                <div className="flex items-center gap-4 pr-8">
                  <Image
                    src={review.authorAttribution.photoUri}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full object-cover"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-on-surface text-xs tracking-widest">{review.authorAttribution.displayName}</span>
                    <span className="font-body text-outline text-xs">{review.relativePublishTimeDescription}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                {review.text?.text && (
                  <p className="font-body text-secondary text-sm leading-relaxed line-clamp-5">{review.text.text}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low p-8 md:p-12 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl shrink-0">rate_review</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-2xl md:text-3xl text-on-surface">{t.beFirstTitle}</h3>
                <p className="font-body text-secondary text-sm md:text-base leading-relaxed max-w-2xl">{t.beFirstBody}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-outline/10 pt-6">
              <div className="flex flex-col gap-1">
                <span className="font-label text-outline text-[10px] tracking-widest uppercase">{spaCategory ?? t.reviewsLabel}</span>
                <span className="font-headline text-base text-on-surface">{spaName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label text-outline text-[10px] tracking-widest uppercase">{t.addressLabel}</span>
                <span className="font-body text-on-surface text-sm">{spaAddress}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label text-outline text-[10px] tracking-widest uppercase">{t.phoneLabel}</span>
                <span className="font-body text-on-surface text-sm">{spaPhone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={SPA_GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label tracking-widest text-xs uppercase hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">rate_review</span>
                {t.leaveReview}
              </a>
              <a
                href={mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-outline/30 text-on-surface font-label tracking-widest text-xs uppercase hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">map</span>
                {t.viewOnMaps}
              </a>
            </div>
          </div>
        )}

        {hasReviews && (
          <div className="mt-12 flex justify-center">
            <a
              href={SPA_GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label tracking-widest text-xs uppercase hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">rate_review</span>
              {t.leaveReview}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
