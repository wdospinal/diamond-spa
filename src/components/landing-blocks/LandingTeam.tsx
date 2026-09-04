'use client'

import Image from 'next/image'
import { useState } from 'react'
import { THERAPISTS } from '@/lib/i18n'
import { IMG_THERAPISTS_WEBP } from '@/lib/images'
import type { Locale } from '@/lib/i18n'

const TEAM_GRID_CLASS =
  'flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

export function LandingTeam({ locale }: { locale: Locale }) {
  const label = locale === 'es' ? 'Talento Diamond' : 'Diamond Talent'
  const title = locale === 'es' ? 'Las manos que te cuidan' : 'The hands that take care of you'
  const subtitle = locale === 'es'
    ? 'Cosmetólogas certificadas con años de experiencia en el corazón de El Poblado.'
    : 'Certified cosmetologists with years of experience in the heart of El Poblado.'

  const [activeIdx, setActiveIdx] = useState(0)
  // Solo una tarjeta puede estar "abierta" a la vez — tocar otra cierra la anterior.
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null)

  return (
    <section className="py-24 bg-surface-container-lowest text-on-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4 block">
            {label}
          </span>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-4">
            {title}
          </h2>
          <div className="h-px w-12 bg-primary mx-auto mb-4" />
          <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed font-body">
            {subtitle}
          </p>
        </div>

        {/* Carousel on mobile, 3-column grid on desktop */}
        <div
          className={TEAM_GRID_CLASS}
          onScroll={(e) => {
            if (window.innerWidth < 768) {
              const el = e.currentTarget
              const idx = Math.round(el.scrollLeft / (el.scrollWidth / THERAPISTS.length))
              setActiveIdx(idx)
            }
          }}
        >
          {THERAPISTS.map((therapist, i) => {
            const webpSrc = IMG_THERAPISTS_WEBP[i]
            const specialtyText = locale === 'es' ? therapist.es.specialty : therapist.en.specialty
            const bookLabel = locale === 'es' ? 'Reservar' : 'Book'
            const isRevealed = revealedIdx === i

            return (
              <div
                key={therapist.name}
                className="shrink-0 w-[60vw] sm:w-[40vw] md:w-auto snap-center"
              >
                <button
                  type="button"
                  onClick={() => setRevealedIdx(isRevealed ? null : i)}
                  aria-expanded={isRevealed}
                  aria-label={therapist.name}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-container/50 ring-1 ring-outline/10 shadow-sm block text-left cursor-pointer"
                >
                  <Image
                    src={webpSrc}
                    alt={locale === 'es'
                      ? `${therapist.name}, terapeuta de Diamond Spa`
                      : `${therapist.name}, therapist at Diamond Spa`}
                    fill
                    sizes="(max-width: 768px) 60vw, 20vw"
                    className={`object-cover transition-all duration-500 ease-out ${
                      isRevealed ? 'scale-110 blur-[2px] opacity-50' : 'opacity-90'
                    }`}
                    unoptimized
                  />

                  {/* Insignia verificado — se desvanece al revelar, para no competir con el panel */}
                  <div className={`absolute top-3 right-3 transition-opacity duration-200 ${isRevealed ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-surface/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-outline/10">
                      <span
                        className="material-symbols-outlined text-primary block"
                        style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                  </div>

                  {/* Gradiente base + nombre — visible por defecto, se apaga al revelar */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent transition-opacity duration-200 ${isRevealed ? 'opacity-0' : 'opacity-100'}`} />
                  <div className={`absolute bottom-3 left-3 right-3 transition-opacity duration-150 ${isRevealed ? 'opacity-0' : 'opacity-100'}`}>
                    <h3 className="font-serif text-lg text-white tracking-tight drop-shadow-sm">{therapist.name}</h3>
                  </div>

                  {/* Panel revelado — cubre la foto entera con nombre, especialidad y CTA */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center text-center px-5 bg-black/55 transition-opacity duration-300 ${
                      isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <h3 className={`font-serif text-xl text-white mb-2 tracking-tight transition-all duration-300 delay-75 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                      {therapist.name}
                    </h3>
                    <p className={`text-white/90 text-sm font-body leading-relaxed mb-5 transition-all duration-300 delay-100 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                      {specialtyText}
                    </p>
                    <a
                      href="#reservar"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1.5 bg-primary text-on-primary text-xs font-label uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg hover:bg-primary/90 active:scale-95 transition-all duration-300 delay-150 ${
                        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      {bookLabel} →
                    </a>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex md:hidden justify-center gap-2 mt-2">
          {THERAPISTS.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-outline/20'
              }`}
            />
          ))}
        </div>

        <p className="text-outline text-xs text-center mt-12 tracking-wide font-body">
          {locale === 'es'
            ? '100% del equipo con certificación profesional · El Poblado, Medellín'
            : '100% professionally certified team · El Poblado, Medellín'}
        </p>
      </div>
    </section>
  )
}
