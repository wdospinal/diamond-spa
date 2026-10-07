import Image from 'next/image'
import { THERAPISTS } from '@/lib/i18n'
import { IMG_THERAPISTS_WEBP } from '@/lib/images'

// Vista rápida de las terapeutas (landing de pauta en inglés, v1). La duda
// principal de quien llega es "¿quién me va a atender?", así que las caras van
// antes de los servicios y llevan a la sección completa del equipo (#therapists).
// Fotos pequeñas (44 px) con lazy load; sin eventos de analítica nuevos.
export function LandingTherapistPeek({ locale = 'en' }: { locale?: 'es' | 'en' }) {
  const isEs = locale === 'es'
  const firstNames = THERAPISTS.map((t) => t.name.split(' ')[0])
  return (
    <a href="#therapists" className="block bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="max-w-screen-xl mx-auto px-4 py-3.5 flex items-center justify-center gap-3">
        <div className="flex -space-x-3 shrink-0">
          {IMG_THERAPISTS_WEBP.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={THERAPISTS[i]?.name ?? 'Therapist'}
              width={44}
              height={44}
              sizes="44px"
              loading="lazy"
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ))}
        </div>
        <div className="text-left leading-tight">
          <p className="text-[13px] font-semibold text-[#0a1628]">{isEs ? 'Conoce a tus terapeutas' : 'Meet your therapists'}</p>
          <p className="text-[11.5px] text-gray-500">
            {firstNames.join(', ')} · {isEs ? 'Certificadas, +5 años' : 'Certified, 5+ years'}{' '}
            <span className="underline underline-offset-2">{isEs ? 'Ver perfiles' : 'See profiles'}</span>
          </p>
        </div>
      </div>
    </a>
  )
}
