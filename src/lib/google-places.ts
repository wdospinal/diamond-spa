import { SPA_GOOGLE_PLACES_ID, SPA_RATING } from './spa'

export interface PlaceReview {
  relativePublishTimeDescription: string
  rating: number
  text?: { text: string }
  authorAttribution: {
    displayName: string
    photoUri: string
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
}

export async function fetchPlaceDetails(): Promise<PlaceDetails> {
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
    return (await res.json()) as PlaceDetails
  } catch {
    return {}
  }
}

/** Returns live rating + count from Google Places, falling back to SPA_RATING. */
export async function fetchPlaceRating(): Promise<{ value: string; count: number }> {
  const place = await fetchPlaceDetails()
  if (place.rating && place.userRatingCount) {
    return {
      value: place.rating.toFixed(1),
      count: place.userRatingCount,
    }
  }
  return { value: SPA_RATING.value, count: SPA_RATING.count }
}
