import { SPA_GOOGLE_MAPS_URL, SPA_INSTAGRAM, SPA_RATING, SPA_TIKTOK } from '@/lib/spa'
import { InstagramIcon, TikTokIcon } from './LandingProofStrip'

// Cierre de la sección de reseñas (landing de pauta en inglés, v1): todas las
// reseñas en Google + redes sociales. Enlaces simples, sin eventos nuevos.
export function LandingSocialFollow() {
  return (
    <div className="bg-surface pb-16 -mt-8">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={SPA_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-center border border-outline-variant/40 text-on-surface text-sm px-5 py-3 rounded-full hover:border-primary transition-colors"
        >
          See all {SPA_RATING.count} reviews on Google · {SPA_RATING.value} ★
        </a>
        <a
          href={SPA_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline-variant/40 text-on-surface text-sm px-5 py-3 rounded-full hover:border-primary transition-colors"
        >
          <InstagramIcon /> Instagram
        </a>
        <a
          href={SPA_TIKTOK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline-variant/40 text-on-surface text-sm px-5 py-3 rounded-full hover:border-primary transition-colors"
        >
          <TikTokIcon /> TikTok
        </a>
      </div>
    </div>
  )
}
