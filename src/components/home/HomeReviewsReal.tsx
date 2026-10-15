import Image from 'next/image'
import type { Locale } from '@/lib/i18n'
import {
  getReviewLanguage,
  getReviewText,
  type LivePlaceDetails,
  type PlaceReview,
} from '@/lib/google-places'
import { formatRating, type HomeContent } from '@/lib/home-content'
import { SPA_GOOGLE_MAPS_URL, SPA_GOOGLE_REVIEW_URL } from '@/lib/spa'

const MAX_REVIEWS = 5

function Stars({ count, label, size = 14 }: { count: number; label: string; size?: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`material-symbols-outlined ${star <= count ? 'text-primary' : 'text-outline-variant/40'}`}
          style={{ fontSize: `${size}px`, fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 opacity-40" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

/** Month + year from the API's ISO publish time, or Google's relative text when the data is live. */
function reviewDate(review: PlaceReview, locale: Locale, live: boolean): string | null {
  if (review.publishTime) {
    const d = new Date(review.publishTime)
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(d)
    }
  }
  // The committed snapshot's "2 months ago" strings go stale, so they are
  // only shown when the data was fetched live on this render cycle.
  return live ? (review.relativePublishTimeDescription ?? null) : null
}

/**
 * Real Google reviews, attributed and shown as written. The rating and count
 * come from the same place object the page uses for its JSON-LD, so what the
 * visitor reads and what crawlers read cannot disagree.
 */
export function HomeReviewsReal({
  locale,
  place,
  rating,
  copy,
}: {
  locale: Locale
  place: LivePlaceDetails
  rating: { value: string; count: number }
  copy: HomeContent['reviews']
}) {
  const reviews = (place.reviews ?? []).filter(r => getReviewText(r)).slice(0, MAX_REVIEWS)
  const source = copy.source(place.fetchedAt, place.live)

  return (
    <section className="bg-surface px-6 py-28 md:px-12">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 block font-label text-xs uppercase tracking-[0.3em] text-tertiary">
              {copy.label}
            </span>
            <h2 className="font-headline text-4xl text-on-surface md:text-5xl">{copy.title}</h2>
            <p className="mt-4 font-body font-light leading-relaxed text-secondary">{copy.intro}</p>
          </div>
          <a
            href={SPA_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-end gap-4 text-right"
          >
            <div>
              <div className="font-headline text-5xl leading-none text-on-surface">
                {formatRating(rating.value, locale)}
              </div>
              <div className="mt-2 flex justify-end">
                <Stars
                  count={Math.round(Number(rating.value))}
                  label={copy.starsLabel(Number(rating.value))}
                  size={16}
                />
              </div>
              <div className="mt-1.5 font-label text-xs tracking-wider text-outline transition-colors group-hover:text-primary">
                {rating.count} {copy.countLabel}
              </div>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map(review => {
            const text = getReviewText(review)
            const lang = getReviewLanguage(review)
            const date = reviewDate(review, locale, place.live)
            const name = review.authorAttribution.displayName
            const author = (
              <span className="font-label text-xs font-bold tracking-wider text-on-surface">{name}</span>
            )
            return (
              <article
                key={`${name}-${text.slice(0, 24)}`}
                className="flex flex-col gap-5 rounded-sm bg-surface-container p-8 ring-1 ring-outline-variant/10"
              >
                <Stars count={review.rating} label={copy.starsLabel(review.rating)} />
                <blockquote className="flex-1">
                  <p className="font-body text-sm italic leading-relaxed text-secondary" lang={lang}>
                    &ldquo;{text}&rdquo;
                  </p>
                </blockquote>
                {lang !== locale && (
                  <p className="font-label text-[11px] uppercase tracking-widest text-outline">
                    {copy.originalIn(lang)}
                  </p>
                )}
                <div className="flex items-center gap-3 border-t border-outline-variant/10 pt-4">
                  {review.authorAttribution.photoUri && (
                    <Image
                      src={review.authorAttribution.photoUri}
                      alt=""
                      aria-hidden="true"
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    {review.authorAttribution.uri ? (
                      <a
                        href={review.authorAttribution.uri}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="hover:text-primary"
                      >
                        {author}
                      </a>
                    ) : (
                      author
                    )}
                    {date && <div className="mt-0.5 font-label text-xs text-outline">{date}</div>}
                  </div>
                  <div className="ml-auto shrink-0">
                    <GoogleMark />
                  </div>
                </div>
              </article>
            )
          })}

          <div className="flex flex-col justify-between gap-6 rounded-sm bg-surface-container-high p-8 ring-1 ring-primary/20">
            <div>
              <h3 className="font-headline text-2xl text-on-surface">{copy.ctaTitle}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-secondary">{copy.ctaBody}</p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <a
                href={SPA_GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] text-on-primary transition-all duration-300 hover:bg-white"
              >
                {copy.write}
                <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">open_in_new</span>
              </a>
              <a
                href={SPA_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-widest text-outline transition-colors hover:text-on-surface"
              >
                {copy.readAll}
                <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">chevron_right</span>
              </a>
            </div>
          </div>
        </div>

        {source && <p className="mt-8 font-label text-xs tracking-wider text-outline">{source}</p>}
      </div>
    </section>
  )
}
