/**
 * Centralized cross-file constants.
 *
 * Domain-specific constants (services catalog, spa identity, images, etc.)
 * still live in their dedicated `src/lib/<domain>.ts` modules and are
 * re-exported from there. This folder holds the small, low-level primitives
 * that are referenced from many unrelated places.
 */

export { DURATION_MINUTES, type DurationMinutes } from './durations'
export {
  LOCALES,
  LOCALES_DISPLAY_ORDER,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from './locale'
export { DAY_NAMES, type DayName } from './days'
