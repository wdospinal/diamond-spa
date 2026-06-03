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

// ─── Payload types ────────────────────────────────────────────────────────────

export interface BookingServiceSelectedPayload {
  service_id: string
  service_name: string
  category: string
  locale: string
}

export interface BookingDurationSelectedPayload {
  service_id: string
  duration_minutes: number
}

export interface BookingHairMethodSelectedPayload {
  service_id: string
  method: 'wax' | 'machine'
}

export interface BookingDateSelectedPayload {
  service_id: string
  date: string          // ISO yyyy-MM-dd
}

export interface BookingTimeSelectedPayload {
  service_id: string
  time_slot: string
}

export interface BookingSubmittedPayload {
  service_id: string
  service_name: string
  category: string
  duration_minutes?: number
  hair_method?: string
  price_cop: number
  locale: string
}

export interface ServiceCardClickedPayload {
  service_id: string
  service_name: string
  source: string        // 'home' | 'masajes-para-hombres' | 'masajes-para-mujeres' | 'services'
}

export interface ServiceDetailViewedPayload {
  service_id: string
  service_name: string
  locale: string
}

export interface SocialClickedPayload {
  platform: string      // 'instagram' | 'tiktok' | 'whatsapp' | 'email' | 'phone' | 'google'
  source: string        // where in the page: 'footer' | 'press' | 'contact'
}

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
