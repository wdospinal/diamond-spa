import { Manrope, Playfair_Display, Roboto } from 'next/font/google'

/**
 * Shared by every root layout.
 *
 * The site tree (`app/[lang]`) and the admin tree (`app/admin`) each own their
 * own <html> element now — the site needs `lang` to follow the locale segment,
 * which a layout above [lang] could never see. next/font must be called at
 * module scope, so the font instances live here and both roots import them;
 * that also keeps a single set of self-hosted font files in the build instead
 * of one per root.
 *
 * next/font/google self-hosts from /_next/static/media/ (same origin, no extra
 * DNS lookup, 1-year immutable cache). display:'swap' + fallback array triggers
 * Next.js automatic font-metric overrides (size-adjust / ascent-override /
 * descent-override) so the fallback font matches the web font metrics → CLS=0.
 *
 * Material Symbols Outlined is self-hosted via @font-face in globals.css
 * (public/fonts/material-symbols-outlined.woff2) — no Google Fonts round-trip,
 * 1-year immutable cache, eliminates the googleapis→gstatic network chain.
 */
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  // Fallback hints used by Next.js to compute metric overrides for CLS=0
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
})

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
})

/**
 * Roboto (variable) is used only inside the admin shell (.admin-shell in
 * globals.css). Its larger x-height and wider apertures read better than
 * Manrope in dense dashboard UI: tables, forms and long numbers.
 */
export const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
})

/** Every font variable, for the className on <html>. */
export const FONT_VARIABLES = `${playfairDisplay.variable} ${manrope.variable} ${roboto.variable}`
