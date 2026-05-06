'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Locale } from '@/lib/i18n'
import { SPA_GOOGLE_REVIEW_URL } from '@/lib/spa'

interface PlaceReview {
  relativePublishTimeDescription: string
  rating: number
  text?: { text: string }
  authorAttribution: {
    displayName: string
    photoUri: string
  }
  isStatic?: true
}

function GoogleLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Google" role="img">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
      <meta itemProp="ratingValue" content={String(rating)} />
      <meta itemProp="bestRating" content="5" />
      {[1, 2, 3, 4, 5].map(n => {
        const filled = rating >= n
        const half = !filled && rating >= n - 0.5
        return (
          <span
            key={n}
            className={`material-symbols-outlined text-sm ${filled || half ? 'text-primary' : 'text-outline/30'}`}
            style={{ fontVariationSettings: half ? "'FILL' 0" : "'FILL' 1" }}
            aria-hidden
          >
            star
          </span>
        )
      })}
    </div>
  )
}

function AuthorAvatar({ name, photoUri }: { name: string; photoUri: string }) {
  if (photoUri) {
    return (
      <Image
        src={photoUri}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="h-11 w-11 rounded-full object-cover ring-2 ring-outline/10"
        aria-hidden
      />
    )
  }
  const initials = name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20 shrink-0"
      aria-hidden
    >
      <span className="font-label text-primary text-xs font-semibold tracking-wider">{initials}</span>
    </div>
  )
}

interface ReviewsGridProps {
  reviews: PlaceReview[]
  reviewUrl: string
  leaveReviewLabel: string
  locale: Locale
}

const INITIAL_VISIBLE = 9

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function ReviewsGrid({ reviews, reviewUrl, leaveReviewLabel, locale }: ReviewsGridProps) {
  const [shuffled] = useState(() => shuffle(reviews))
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? shuffled : shuffled.slice(0, INITIAL_VISIBLE)
  const hasMore = shuffled.length > INITIAL_VISIBLE
  const hiddenCount = shuffled.length - INITIAL_VISIBLE

  const showMoreLabel = locale === 'es'
    ? `Ver ${hiddenCount} reseña${hiddenCount !== 1 ? 's' : ''} más`
    : `Show ${hiddenCount} more review${hiddenCount !== 1 ? 's' : ''}`

  return (
    <div itemScope itemType="https://schema.org/LocalBusiness">
      <meta itemProp="name" content="Diamond Spa" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((review, i) => (
          <div
            key={i}
            className="group bg-surface-container-low hover:bg-surface-container p-7 flex flex-col gap-5 relative transition-colors duration-200"
            itemScope
            itemType="https://schema.org/Review"
            itemProp="review"
          >
            <meta itemProp="datePublished" content={review.relativePublishTimeDescription} />

            {/* Top row: stars + Google badge */}
            <div className="flex items-start justify-between">
              <StarRating rating={review.rating} />
              {!review.isStatic && (
                <a
                  href={SPA_GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on Google"
                  title="Review from Google"
                  className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                >
                  <GoogleLogo className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Review text */}
            {review.text?.text && (
              <p
                className="font-body text-secondary text-sm leading-relaxed flex-1 line-clamp-6 group-hover:line-clamp-none transition-all"
                itemProp="reviewBody"
              >
                {review.text.text}
              </p>
            )}

            {/* Author */}
            <div
              className="flex items-center gap-3 pt-3 border-t border-outline/10"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <AuthorAvatar
                name={review.authorAttribution.displayName}
                photoUri={review.authorAttribution.photoUri}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="font-label text-on-surface text-xs tracking-widest truncate"
                  itemProp="name"
                >
                  {review.authorAttribution.displayName}
                </span>
                <span className="font-body text-outline text-xs">
                  {review.relativePublishTimeDescription}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {hasMore && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-outline/30 text-on-surface font-label tracking-widest text-xs uppercase hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">
              {showAll ? 'expand_less' : 'expand_more'}
            </span>
            {showAll
              ? (locale === 'es' ? 'Ver menos' : 'Show less')
              : showMoreLabel}
          </button>
        )}

        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-label tracking-widest text-xs uppercase hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-base">rate_review</span>
          {leaveReviewLabel}
        </a>
      </div>
    </div>
  )
}
