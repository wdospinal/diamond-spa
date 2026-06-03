/**
 * Central registry of all custom analytics event names and their payloads.
 * Call trackEvent() anywhere in client code — it delegates to Vercel Analytics.
 *
 * Naming convention: noun_verb  (e.g. "service_clicked", "booking_submitted")
 */

import { track } from '@vercel/analytics'

// ─── Event names ─────────────────────────────────────────────────────────────

export const EVENTS = {
  // Booking funnel
  BOOKING_SERVICE_SELECTED:    'booking_service_selected',
  BOOKING_DURATION_SELECTED:   'booking_duration_selected',
  BOOKING_HAIR_METHOD_SELECTED:'booking_hair_method_selected',
  BOOKING_DATE_SELECTED:       'booking_date_selected',
  BOOKING_TIME_SELECTED:       'booking_time_selected',
  BOOKING_SUBMITTED:           'booking_submitted',
  BOOKING_ANOTHER_CLICKED:     'booking_another_clicked',

  // Service discovery
  SERVICE_CARD_CLICKED:        'service_card_clicked',
  SERVICE_DETAIL_VIEWED:       'service_detail_viewed',

  // Social / contact
  WHATSAPP_CLICKED:            'whatsapp_clicked',
  INSTAGRAM_CLICKED:           'instagram_clicked',
  TIKTOK_CLICKED:              'tiktok_clicked',
  EMAIL_CLICKED:                'email_clicked',
  PHONE_CLICKED:               'phone_clicked',
  GOOGLE_REVIEW_CLICKED:       'google_review_clicked',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

// ─── Track helper ─────────────────────────────────────────────────────────────

type Primitive = string | number | boolean

export function trackEvent(
  name: EventName,
  payload?: Record<string, Primitive>,
): void {
  try {
    track(name, payload)
  } catch {
    // Never let analytics crash the app
  }
}
