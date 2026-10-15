import { SPA_RATING, SPA_GOOGLE_PLACES_ID } from './spa'
import placeDetails from './place-details.json' with { type: 'json' }

export interface PlaceReview {
  relativePublishTimeDescription: string
  publishTime?: string
  rating: number
  text?: { text: string; languageCode?: string }
  originalText?: { text: string; languageCode?: string }
  authorAttribution: {
    displayName: string
    photoUri: string
    uri?: string
  }
  isStatic?: true
}

export interface PlaceDetails {
  rating?: number
  userRatingCount?: number
  reviews?: PlaceReview[]
  displayName?: { text: string; languageCode: string }
  shortFormattedAddress?: string
  internationalPhoneNumber?: string
  primaryTypeDisplayName?: { text: string }
  googleMapsUri?: string
  /** ISO date of the last time the snapshot was refreshed. */
  fetchedAt?: string
}

export interface LivePlaceDetails extends PlaceDetails {
  /** true when the data came from the Places API on this render, false for the snapshot. */
  live: boolean
}

const FIELD_MASK = [
  'rating',
  'userRatingCount',
  'reviews',
  'displayName',
  'shortFormattedAddress',
  'internationalPhoneNumber',
  'primaryTypeDisplayName',
  'googleMapsUri',
].join(',')

/**
 * Place details snapshot from the Google Places API, stored in
 * place-details.json. Re-fetch (scripts/fetch-place-details.mjs) to refresh.
 */
export function getPlaceDetails(): PlaceDetails {
  return placeDetails as PlaceDetails
}

/** Returns the snapshot rating + count, falling back to SPA_RATING. */
export function getPlaceRating(): { value: string; count: number } {
  const place = getPlaceDetails()
  if (place.rating && place.userRatingCount) {
    return {
      value: place.rating.toFixed(1),
      count: place.userRatingCount,
    }
  }
  return { value: SPA_RATING.value, count: SPA_RATING.count }
}

/**
 * Live Google Places data (rating, review count, latest reviews) with a safe
 * fallback to the committed snapshot. Uses the Next.js fetch cache so the API
 * is hit at most once per `revalidateSeconds`, never per request.
 *
 * Requires GOOGLE_PLACES_API_KEY in the server environment. Without it, or if
 * the API fails, the snapshot is returned (live: false) and nothing breaks.
 */
export async function getPlaceDetailsLive(
  revalidateSeconds = 86400,
): Promise<LivePlaceDetails> {
  const snapshot: LivePlaceDetails = { ...getPlaceDetails(), live: false }
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return snapshot

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${SPA_GOOGLE_PLACES_ID}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        next: { revalidate: revalidateSeconds },
      },
    )
    if (!res.ok) return snapshot

    const data = (await res.json()) as PlaceDetails
    // Sanity check: never replace a good snapshot with an empty payload.
    if (!data.rating || !data.userRatingCount) return snapshot

    return {
      ...snapshot,
      ...data,
      reviews: data.reviews?.length ? data.reviews : snapshot.reviews,
      fetchedAt: new Date().toISOString().slice(0, 10),
      live: true,
    }
  } catch {
    return snapshot
  }
}

/** Preferred review text: the author's original wording, then Google's text. */
export function getReviewText(review: PlaceReview): string {
  return (review.originalText?.text ?? review.text?.text ?? '').trim()
}

const SPANISH_HINTS = /\b(el|la|los|las|un|una|que|muy|con|para|por|excelente|servicio|atenci[oó]n|masaje|lugar|recomiendo|gracias|bueno|buena|mejor)\b/gi

/**
 * Language of the review as written by its author. Uses the API's
 * `languageCode` when present; the committed snapshot has none, so fall back
 * to a small Spanish stop-word heuristic (default: English).
 */
export function getReviewLanguage(review: PlaceReview): 'es' | 'en' {
  const code = (review.originalText?.languageCode ?? review.text?.languageCode ?? '').toLowerCase()
  if (code.startsWith('es')) return 'es'
  if (code.startsWith('en')) return 'en'
  const hits = getReviewText(review).match(SPANISH_HINTS)?.length ?? 0
  return hits >= 3 ? 'es' : 'en'
}
