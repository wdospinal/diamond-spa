import Image from 'next/image'
import { THERAPISTS } from '@/lib/i18n'
import { IMG_THERAPISTS_WEBP } from '@/lib/images'

// Prueba EN: las terapeutas en la portada, justo bajo el H1. Lo primero que la
// gente quiere saber es quién la va a atender. Fotos pequeñas (sizes 120 px);
// las 3 primeras cargan de una, el resto en lazy. Sin eventos nuevos.
export function LandingTherapistShowcase() {
  return (
    <div id="therapists" className="scroll-mt-20 mb-7">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#C9A876] mb-3">Meet your therapists</p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-6 -mx-6 px-6 pb-2 md:justify-center [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {THERAPISTS.map((t, i) => {
          const src = IMG_THERAPISTS_WEBP[i]
          if (!src) return null
          return (
            <figure key={t.id} className="snap-start shrink-0 w-[30%] min-w-[104px] max-w-[132px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/15 bg-white/5">
                <Image
                  src={src}
                  alt={`${t.name}, ${t.en.role}`}
                  fill
                  sizes="132px"
                  loading={i < 3 ? 'eager' : 'lazy'}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-1.5 text-left">
                <span className="block text-[13px] text-white leading-tight">{t.name.split(' ')[0]}</span>
                <span className="block text-[10.5px] text-white/55 leading-tight">{t.en.years}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
      <p className="text-[12px] text-white/60 mt-2">Certified cosmetologists &amp; massage therapists · Private rooms</p>
    </div>
  )
}
