/**
 * Bookable session durations in minutes.
 *
 * Single source of truth used by:
 *  - Services pricing tables (`prices: Record<DurationMinutes, number>`)
 *  - Booking flow duration picker
 *  - Service detail pages
 */
export const DURATION_MINUTES = [30, 60, 90] as const

export type DurationMinutes = (typeof DURATION_MINUTES)[number]
