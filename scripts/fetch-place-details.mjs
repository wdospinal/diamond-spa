// Refreshes the Google Places snapshot used by the site at runtime.
// Usage: GOOGLE_PLACES_API_KEY=... node scripts/fetch-place-details.mjs
// (or just `node scripts/fetch-place-details.mjs` — it reads .env.local)
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const PLACE_ID = 'ChIJKzwytpApRI4RjIhtXLsMvK8'
const OUT_FILE = resolve(root, 'src/lib/place-details.json')

let key = process.env.GOOGLE_PLACES_API_KEY
if (!key) {
  try {
    const env = readFileSync(resolve(root, '.env.local'), 'utf8')
    key = env.match(/^GOOGLE_PLACES_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch {}
}
if (!key) {
  console.error('GOOGLE_PLACES_API_KEY not set (env or .env.local)')
  process.exit(1)
}

const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
  headers: {
    'X-Goog-Api-Key': key,
    'X-Goog-FieldMask':
      'rating,userRatingCount,reviews,displayName,shortFormattedAddress,internationalPhoneNumber,primaryTypeDisplayName,googleMapsUri',
  },
})
if (!res.ok) {
  console.error(`Places API request failed: ${res.status} ${await res.text()}`)
  process.exit(1)
}
const place = await res.json()

const snapshot = {
  rating: place.rating,
  userRatingCount: place.userRatingCount,
  displayName: place.displayName,
  shortFormattedAddress: place.shortFormattedAddress,
  internationalPhoneNumber: place.internationalPhoneNumber,
  primaryTypeDisplayName: place.primaryTypeDisplayName,
  googleMapsUri: place.googleMapsUri,
  fetchedAt: new Date().toISOString().slice(0, 10),
  reviews: (place.reviews ?? []).map(r => ({
    relativePublishTimeDescription: r.relativePublishTimeDescription,
    rating: r.rating,
    ...(r.text ? { text: { text: r.text.text } } : {}),
    authorAttribution: {
      displayName: r.authorAttribution.displayName,
      photoUri: r.authorAttribution.photoUri ?? '',
    },
  })),
}

writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + '\n')
console.log(
  `Saved ${snapshot.reviews.length} reviews (rating ${snapshot.rating}, ${snapshot.userRatingCount} ratings) to ${OUT_FILE}`
)
