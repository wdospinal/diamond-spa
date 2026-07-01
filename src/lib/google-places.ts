import { SPA_RATING } from './spa'
import placeDetails from './place-details.json'

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

/**
 * Place details snapshot from the Google Places API, stored in
 * place-details.json. Re-fetch and update the file to refresh reviews/rating.
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
