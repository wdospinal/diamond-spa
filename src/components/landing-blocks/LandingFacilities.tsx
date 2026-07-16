'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Locale } from '@/lib/i18n'

const IMAGES = [
  {
    src: '/images-ads/galeria/galeria1.png',
    title: { es: 'Sala de Bienvenida', en: 'Welcome Lounge' }
  },
  {
    src: '/images-ads/galeria/galeria2.png',
    title: { es: 'Suite Para Dos', en: 'Couples Suite' }
  },
  {
    src: '/images-ads/galeria/galeria3.png',
    title: { es: 'Sala Zen', en: 'Zen Room' }
  },
  {
    src: '/images-ads/galeria/galeria4.png',
    title: { es: 'Suite Privada', en: 'Private Suite' }
  }
]

const GALLERY_GRID_CLASS =
  'flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

export function LandingFacilities({ locale }: { locale: Locale }) {
  const label = locale === 'es' ? 'Nuestras Instalaciones' : 'Our Facilities'
  const title = locale === 'es' ? 'Un espacio diseñado para ti' : 'A space designed for you'
  const subtitle = locale === 'es'
    ? 'Privacidad, confort y lujo en el corazón de El Poblado.'
    : 'Privacy, comfort, and luxury in the heart of El Poblado.'

  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section className="py-24 bg-surface text-on-surface overflow-hidden border-t border-outline/5">
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

        {/* Carousel on mobile, 4-column grid on desktop */}
        <div
          className={GALLERY_GRID_CLASS}
          onScroll={(e) => {
            if (window.innerWidth < 768) {
              const el = e.currentTarget
              const idx = Math.round(el.scrollLeft / (el.scrollWidth / IMAGES.length))
              setActiveIdx(idx)
            }
          }}
        >
          {IMAGES.map((img, i) => {
            const imgTitle = locale === 'es' ? img.title.es : img.title.en

            return (
              <div
                key={i}
                className="shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-center group transition-transform duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container/50 ring-1 ring-outline/10 shadow-sm">
                  <Image
                    src={img.src}
                    alt={imgTitle}
                    fill
                    sizes="(max-width: 768px) 80vw, 25vw"
                    className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 md:group-hover:scale-105"
                    unoptimized
                  />
                  
                  {/* Subtle gradient overlay for better text readability if we decide to put text inside */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001524]/90 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                    <h3 className="font-headline text-xl text-on-surface tracking-wide drop-shadow-md">
                      {imgTitle}
                    </h3>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex md:hidden justify-center gap-2 mt-2">
          {IMAGES.map((_, i) => (
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
      </div>
    </section>
  )
}
