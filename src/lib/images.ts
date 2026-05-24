/**
 * Central image registry — single source of truth for all image URLs.
 * Unsplash images are free under the Unsplash License: https://unsplash.com/license
 *
 * Accessibility note: alt text is intentionally NOT stored here because
 * it must be locale-aware and context-aware (depends on the surrounding
 * copy and where the image appears). Always supply a meaningful, bilingual
 * `alt` at the call site for every `<Image>` element. Use empty `alt=""`
 * together with `aria-hidden="true"` only when the image is purely
 * decorative and already conveyed by adjacent text (e.g. the logo next
 * to "Diamond Spa", or hero background images).
 */

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// ─── Local public assets ──────────────────────────────────────────────────────

export const IMG_HERO_HOME        = '/diamond-wallpaper.webp'
export const IMG_LOGO             = '/logo.webp'
export const IMG_LOGOTIPO         = '/logotipo.webp'
export const IMG_DEEP_TISSUE      = '/depilacion.webp'
export const IMG_RELAXATION       = '/relaxation.webp'
export const IMG_FACIAL           = '/skin.webp'
export const IMG_ABOUT_HERO       = '/filo.webp'

// ─── Home page ────────────────────────────────────────────────────────────────

/** Luxury boutique spa interior — warm, dim light */
export const IMG_BOUTIQUE         = u('1571896349842-33c89424de2d')

// ─── About / Philosophy page ──────────────────────────────────────────────────

export const IMG_STONE            = '/maquina.webp'
export const IMG_LOUNGE           = '/masaje.webp'

// ─── History / Story page ─────────────────────────────────────────────────────

/** Dark moody spa — hero background for story page */
export const IMG_HISTORY_HERO     = u('1596178060810-72c088fb981a')
/** Upscale spa interior — founding story section */
export const IMG_HISTORY_INTERIOR = u('1571896349842-33c89424de2d')

// ─── Team portraits ───────────────────────────────────────────────────────────

export const IMG_THERAPISTS = [
  '/therapists/daniela.webp',  // Daniela Salina
  '/therapists/sary.webp',     // Sary Paez
  '/therapists/camila.webp',   // Camila Mazo
  '/therapists/valeria.webp',  // Valeria
]
