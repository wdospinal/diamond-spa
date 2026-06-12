/**
 * Central image registry — single source of truth for all image URLs.
 * Unsplash images are free under the Unsplash License: https://unsplash.com/license
 *
 * ─── Format strategy ──────────────────────────────────────────────────────────
 *
 * All local images are stored as both .avif AND .webp in /public.
 *
 * AVIF is the primary source (avg. 67% smaller than WebP at equal quality).
 * Browser support detection works in two layers:
 *
 *  Layer 1 — Next.js <Image> component (automatic, zero code needed):
 *    next.config.mjs  →  images.formats: ['image/avif', 'image/webp']
 *    Next.js reads the AVIF source, checks the request's Accept header, then
 *    serves AVIF to supporting browsers (≈96% of users) and WebP to the rest.
 *    All conversions are cached on the CDN edge after the first request.
 *
 *  Layer 2 — Raw <picture> element (for images served outside Next.js Image):
 *    <picture>
 *      <source srcSet="/foo.avif" type="image/avif" />
 *      <source srcSet="/foo.webp" type="image/webp" />
 *      <img    src="/foo.webp"    alt="..." />
 *    </picture>
 *    The browser picks the first <source> whose type it supports.
 *    .webp fallbacks remain in /public for this use case.
 *
 * Accessibility note: alt text is intentionally NOT stored here because
 * it must be locale-aware and context-aware. Always supply a meaningful,
 * bilingual `alt` at the call site. Use alt="" + aria-hidden="true" only
 * for purely decorative images already conveyed by adjacent text.
 */

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// ─── Local public assets (AVIF primary, WebP fallback kept alongside) ─────────

export const IMG_HERO_HOME        = '/diamond-wallpaper.avif'
export const IMG_LOGO             = '/logo.avif'
export const IMG_LOGOTIPO         = '/logotipo.avif'
export const IMG_DEEP_TISSUE      = '/depilacion.avif'
export const IMG_RELAXATION       = '/relaxation.avif'
export const IMG_FACIAL           = '/skin.avif'
export const IMG_ABOUT_HERO       = '/filo.avif'

// WebP fallbacks — used by <picture> srcSet for browsers without AVIF support
export const IMG_HERO_HOME_WEBP   = '/diamond-wallpaper.webp'
export const IMG_LOGOTIPO_WEBP    = '/logotipo.webp'
export const IMG_DEEP_TISSUE_WEBP = '/depilacion.webp'
export const IMG_RELAXATION_WEBP  = '/relaxation.webp'
export const IMG_FACIAL_WEBP      = '/skin.webp'
export const IMG_ABOUT_HERO_WEBP  = '/filo.webp'

// ─── Home page ────────────────────────────────────────────────────────────────

/** Luxury boutique spa interior — warm, dim light */
export const IMG_BOUTIQUE         = u('1571896349842-33c89424de2d')

// ─── About / Philosophy page ──────────────────────────────────────────────────

export const IMG_STONE            = '/maquina.avif'
export const IMG_LOUNGE           = '/masaje.avif'

// ─── History / Story page ─────────────────────────────────────────────────────

/** Diamond Spa waiting room — hero background for story page */
export const IMG_HISTORY_HERO     = '/diamond-wallpaper.avif'
/** Diamond Spa interior (Google Maps photo) — founding story section */
export const IMG_HISTORY_INTERIOR = '/history-interior-1.jpg'

// ─── Team portraits ───────────────────────────────────────────────────────────

export const IMG_THERAPISTS = [
  '/therapists/daniela.avif',  // Daniela Salina
  '/therapists/sary.avif',     // Sary Paez
  '/therapists/camila.avif',   // Camila Mazo
  '/therapists/juliana.avif',  // Juliana Piedrahita Roldán
  '/therapists/sheila.avif',   // Sheila
]

// WebP fallbacks for therapist <picture> elements
export const IMG_THERAPISTS_WEBP = [
  '/therapists/daniela.webp',
  '/therapists/sary.webp',
  '/therapists/camila.webp',
  '/therapists/juliana.webp',
  '/therapists/sheila.webp',
]
