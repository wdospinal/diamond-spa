import { SPA_GOOGLE_MAPS_URL, SPA_INSTAGRAM, SPA_RATING, SPA_TIKTOK } from '@/lib/spa'

// Prueba social para la landing de pauta en inglés (v1 "confianza primero").
// Enlaces simples (sin widgets embebidos ni scripts de terceros) y sin eventos
// de analítica nuevos.

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v3.1c-1.4.1-2.7-.3-3.9-1.1v6.2c0 3.6-2.6 5.9-5.8 5.9A5.6 5.6 0 0 1 5.2 15.4c0-3.4 2.9-5.9 6.4-5.5v3.2c-1.6-.4-3.2.6-3.2 2.3 0 1.4 1.1 2.5 2.5 2.5 1.5 0 2.5-1 2.5-2.9V3h3.2z" />
    </svg>
  )
}

function Stars() {
  return <span className="text-[#F5B301] tracking-tight" aria-hidden="true">★★★★★</span>
}

/** Franja corta bajo el hero: calificación de Google + redes. */
export function LandingProofStrip() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-gray-700">
        <a href={SPA_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0a1628]">
          <Stars />
          <span className="font-semibold">{SPA_RATING.value}</span>
          <span className="text-gray-500 underline underline-offset-4 decoration-gray-300">{SPA_RATING.count} Google reviews</span>
        </a>
        <span className="hidden sm:inline text-gray-300">|</span>
        <div className="flex items-center gap-3 text-gray-600">
          <span className="text-gray-500">Follow us</span>
          <a href={SPA_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Diamond Spa on Instagram" className="hover:text-[#0a1628]"><InstagramIcon /></a>
          <a href={SPA_TIKTOK} target="_blank" rel="noopener noreferrer" aria-label="Diamond Spa on TikTok" className="hover:text-[#0a1628]"><TikTokIcon /></a>
        </div>
      </div>
    </div>
  )
}
