/**
 * Central image registry — single source of truth for all image URLs.
 * Unsplash images are free under the Unsplash License: https://unsplash.com/license
 */

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// ─── Local public assets ──────────────────────────────────────────────────────

export const IMG_HERO_HOME        = '/diamond-wallpaper.jpeg'
export const IMG_LOGO             = '/logo.png'
export const IMG_LOGOTIPO         = '/logotipo.png'
export const IMG_DEEP_TISSUE         = '/depilacion.jpeg'
export const IMG_RELAXATION         = '/relaxation.png'
export const IMG_FACIAL         = '/skin.png'

// ─── Home page ────────────────────────────────────────────────────────────────

/** Luxury boutique spa interior — warm, dim light */
export const IMG_BOUTIQUE         = u('1571896349842-33c89424de2d')

// ─── About / Philosophy page ──────────────────────────────────────────────────

/** Serene private treatment room */
export const IMG_ABOUT_HERO       = u('1540555700478-4be289fbecef')
/** Therapist placing hot volcanic stones on back */
export const IMG_STONE            = u('1515377905703-c4788e51af15')
/** Candlelit spa lounge — ambient light */
export const IMG_LOUNGE           = u('1519823551278-64ac92734fb1')

// ─── History / Story page ─────────────────────────────────────────────────────

/** Dark moody spa — hero background for story page */
export const IMG_HISTORY_HERO     = u('1596178060810-72c088fb981a')
/** Upscale spa interior — founding story section */
export const IMG_HISTORY_INTERIOR = u('1571896349842-33c89424de2d')

// ─── Team portraits ───────────────────────────────────────────────────────────

export const IMG_THERAPISTS = [
  u('1438761681033-6461ffad8d80', 400), // Therapist 1
  u('1494790108377-be9c29b29330', 400), // Therapist 2
  u('1507003211169-0a1dd7228f2d', 400), // Therapist 3
] as const
