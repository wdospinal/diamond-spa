'use client'

import Image from 'next/image'
import { useState } from 'react'
import { THERAPISTS } from '@/lib/i18n'
import { IMG_THERAPISTS_WEBP } from '@/lib/images'
import type { Locale } from '@/lib/i18n'
import { EVENTS, trackEvent } from '@/lib/events'

// Las terapeutas en la portada, justo bajo el H1 (landing de pauta en inglés).
// Igual que en la sección de equipo: al tocar la foto se abre la ficha con su
// especialidad y el botón de reservar. Ese clic envía el mismo evento y los
// mismos datos que ya enviaba LandingTeam (source 'landing'): nada nuevo que medir.
export function LandingTherapistShowcase({ locale = 'en', bookHref = '#reservar' }: { locale?: Locale; bookHref?: string }) {
  // Solo una ficha abierta a la vez — tocar otra cierra la anterior.
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null)
  const isEs = locale === 'es'

  return (
    <div id="therapists" className="scroll-mt-20 mb-7">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#C9A876] mb-3">
        {isEs ? 'Conoce a tus terapeutas' : 'Meet your therapists'}
      </p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-6 -mx-6 px-6 pb-2 md:justify-center [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {THERAPISTS.map((t, i) => {
          const src = IMG_THERAPISTS_WEBP[i]
          if (!src) return null
          const info = isEs ? t.es : t.en
          const isRevealed = revealedIdx === i
          const toggle = () => setRevealedIdx(isRevealed ? null : i)
          return (
            <figure key={t.id} className="snap-start shrink-0 w-[40%] min-w-[132px] max-w-[168px]">
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isRevealed}
                aria-label={t.name}
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle()
                  }
                }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/15 bg-white/5 cursor-pointer"
              >
                <Image
                  src={src}
                  alt={`${t.name}, ${info.role}`}
                  fill
                  sizes="168px"
                  loading={i < 3 ? 'eager' : 'lazy'}
                  className={`object-cover transition-all duration-500 ${isRevealed ? 'scale-110 blur-[2px] opacity-40' : ''}`}
                />
                {!isRevealed && (
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/55 text-white px-2 py-0.5 rounded-full">
                    {isEs ? 'Ver perfil' : 'View profile'}
                  </span>
                )}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center px-2.5 bg-black/60 transition-opacity duration-300 ${
                    isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <span className="font-serif text-[15px] text-white leading-tight mb-1">{t.name}</span>
                  <span className="text-[10.5px] text-[#C9A876] mb-1.5">{info.years}</span>
                  <span className="text-[10.5px] text-white/85 leading-snug mb-3 line-clamp-4">{info.specialty}</span>
                  <a
                    href={bookHref}
                    tabIndex={isRevealed ? 0 : -1}
                    onClick={(e) => {
                      // Sin esto el clic también cerraría la ficha
                      e.stopPropagation()
                      trackEvent(EVENTS.THERAPIST_BOOK_CLICKED, {
                        therapist_id: t.id,
                        therapist_name: t.name,
                        position: i + 1,
                        source: 'landing',
                        locale,
                      })
                    }}
                    className="inline-flex items-center gap-1 bg-[#C9A876] text-[#0a1628] text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full"
                  >
                    {isEs ? 'Reservar' : 'Book'} →
                  </a>
                </div>
              </div>
              <figcaption className="mt-1.5 text-left">
                <span className="block text-[13px] text-white leading-tight">{t.name.split(' ')[0]}</span>
                <span className="block text-[10.5px] text-white/55 leading-tight">{info.years}</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
      <p className="text-[12px] text-white/60 mt-2">
        {isEs ? 'Cosmetólogas y masajistas certificadas · Cabinas privadas' : 'Certified cosmetologists & massage therapists · Private rooms'}
      </p>
    </div>
  )
}
