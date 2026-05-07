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
export const IMG_ABOUT_HERO       = '/filo.png'

// ─── Home page ────────────────────────────────────────────────────────────────

/** Luxury boutique spa interior — warm, dim light */
export const IMG_BOUTIQUE         = u('1571896349842-33c89424de2d')

// ─── About / Philosophy page ──────────────────────────────────────────────────

export const IMG_STONE            = '/maquina.jpeg'
export const IMG_LOUNGE           = '/masaje.jpeg'

// ─── History / Story page ─────────────────────────────────────────────────────

/** Dark moody spa — hero background for story page */
export const IMG_HISTORY_HERO     = u('1596178060810-72c088fb981a')
/** Upscale spa interior — founding story section */
export const IMG_HISTORY_INTERIOR = u('1571896349842-33c89424de2d')

// ─── Team portraits ───────────────────────────────────────────────────────────

export const IMG_THERAPISTS = [
  '/therapists/daniela.png',  // Daniela Salina
  '/therapists/sary.png',     // Sary Paez
  '/therapists/camila.png',   // Camila Mazo
  '/therapists/valeria.png',  // Valeria
]
