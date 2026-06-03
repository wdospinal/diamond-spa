import Image from 'next/image'
import { getDict, type Locale } from '@/lib/i18n'
import {
  SPA_ADDRESS,
  SPA_GOOGLE_MAPS_URL,
  SPA_GOOGLE_REVIEW_URL,
  SPA_NAME_FULL,
  SPA_PHONES,
} from '@/lib/spa'
import { fetchPlaceDetails, type PlaceReview, type PlaceDetails } from '@/lib/google-places'
import { STATIC_REVIEWS } from '@/lib/reviews'
import { ReviewsGrid } from './ReviewsGrid'

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

function StarRating({ rating, locale = 'en' }: { rating: number; locale?: Locale }) {
  const label = locale === 'es'
    ? `Calificación ${rating.toFixed(1)} de 5`
    : `Rating ${rating.toFixed(1)} out of 5`
  return (
    <div className="flex gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = rating >= n
        const half = !filled && rating >= n - 0.5
        return (
          <span
            key={n}
            className={`material-symbols-outlined text-sm ${filled || half ? 'text-primary' : 'text-outline/30'}`}
            style={{ fontVariationSettings: half ? "'FILL' 0" : "'FILL' 1" }}
            aria-hidden="true"
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

  const apiReviews = place.reviews ?? []
  const apiNames = new Set(apiReviews.map(r => r.authorAttribution.displayName.toLowerCase()))
  const supplemental = STATIC_REVIEWS.filter(
    r => !apiNames.has(r.authorAttribution.displayName.toLowerCase())
  )
  const allReviews = [...apiReviews, ...supplemental]
    .filter(r => r.text?.text && r.text.text.length > 50)
    .sort((a, b) => (b.text?.text?.length ?? 0) - (a.text?.text?.length ?? 0))
  const hasReviews = allReviews.length > 0
  const spaName = place.displayName?.text ?? SPA_NAME_FULL
  const spaCategory = place.primaryTypeDisplayName?.text
  const spaAddress = place.shortFormattedAddress ?? SPA_ADDRESS.full
  const spaPhone = place.internationalPhoneNumber ?? SPA_PHONES[0].display
  const mapsUri = place.googleMapsUri ?? SPA_GOOGLE_MAPS_URL

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
                <StarRating rating={place.rating} locale={locale} />
                <span className="font-label text-outline text-xs tracking-widest inline-flex items-center gap-1.5">
                  {t.basedOn} {place.userRatingCount?.toLocaleString()}
                  <GoogleLogo className="size-3.5" />
                  {t.googleReviews}
                </span>
              </div>
            </div>
          )}
        </div>

        {hasReviews ? (
          <ReviewsGrid
            reviews={allReviews}
            reviewUrl={SPA_GOOGLE_REVIEW_URL}
            leaveReviewLabel={t.leaveReview}
            locale={locale}
          />
        ) : (
          <div className="bg-surface-container-low p-8 md:p-12 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl shrink-0" aria-hidden="true">rate_review</span>
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
                <span className="material-symbols-outlined text-base" aria-hidden="true">rate_review</span>
                {t.leaveReview}
              </a>
              <a
                href={mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-outline/30 text-on-surface font-label tracking-widest text-xs uppercase hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">map</span>
                {t.viewOnMaps}
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
