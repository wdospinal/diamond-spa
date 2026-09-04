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
            const roleText = locale === 'es' ? therapist.es.role : therapist.en.role
            const specialtyText = locale === 'es' ? therapist.es.specialty : therapist.en.specialty
            const bookLabel = locale === 'es' ? 'Reservar' : 'Book'

            return (
              <a
                key={therapist.name}
                href="#reservar"
                className="shrink-0 w-[60vw] sm:w-[40vw] md:w-auto snap-center group transition-transform duration-300 block"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-container/50 ring-1 ring-outline/10 mb-4 shadow-sm">
                  <Image
                    src={webpSrc}
                    alt={locale === 'es'
                      ? `${therapist.name}, terapeuta de Diamond Spa`
                      : `${therapist.name}, therapist at Diamond Spa`}
                    fill
                    sizes="(max-width: 768px) 60vw, 20vw"
                    className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 md:group-hover:scale-105"
                    unoptimized
                  />

                  <div className="absolute top-3 right-3">
                    <div className="bg-surface/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-outline/10">
                      <span
                        className="material-symbols-outlined text-primary block"
                        style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* CTA visible sobre la foto — la gente ya intenta tocar la imagen
                      (confirmado en Clarity), así que ahora sí hace algo. Siempre visible,
                      no solo en :hover — la mayoría del tráfico es táctil/móvil, sin hover. */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-primary text-on-primary text-[11px] font-label uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                      {bookLabel} →
                    </span>
                  </div>
                </div>

                <div className="text-center md:text-left px-1 md:px-0">
                  <h3 className="font-serif text-xl md:text-lg text-on-surface mb-1 tracking-tight">{therapist.name}</h3>
                  <p className="font-label text-primary text-xs md:text-[11px] tracking-wider uppercase opacity-90">{roleText}</p>
                  <p className="text-secondary text-xs mt-0.5 font-body">{specialtyText}</p>
                </div>
              </a>
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
