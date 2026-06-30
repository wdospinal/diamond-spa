import webpush from 'web-push'

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || ''
const vapidPrivate = process.env.VAPID_PRIVATE_KEY?.trim() || ''
const vapidSubject = process.env.VAPID_SUBJECT?.trim() || 'mailto:admin@diamondspa.com'

let attempted = false
let configured = false

/**
 * Configure web-push with the VAPID keys from the environment — lazily and only
 * once. Returns true when push is ready to use.
 *
 * Must be called from request handlers, never at module top level: doing the
 * latter runs `setVapidDetails` during `next build` ("Collecting page data"),
 * where a missing or malformed key crashes the whole build. This never throws —
 * a bad key disables push (with a warning) instead of breaking the build.
 */
export function ensureWebPush(): boolean {
  if (attempted) return configured
  attempted = true
  if (!vapidPublic || !vapidPrivate) return false
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
    configured = true
  } catch (err) {
    console.warn('Web Push deshabilitado: VAPID keys inválidas —', (err as Error).message)
    configured = false
  }
  return configured
}

export { webpush }
