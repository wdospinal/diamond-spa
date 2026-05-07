/**
 * English day names indexed by `Date.prototype.getDay()` (0 = Sunday … 6 = Saturday).
 *
 * Used to look up the matching schedule entry in `SPA_HOURS` when computing
 * available booking slots.
 */
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export type DayName = (typeof DAY_NAMES)[number]
