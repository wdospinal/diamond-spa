'use client'

import Image from 'next/image'
import { useState } from 'react'

interface TherapistCardProps {
  avifSrc: string
  webpSrc: string
  alt: string
  name: string
  role: string
  years: string
}

export function TherapistCard({ avifSrc, webpSrc, alt, name, role, years }: TherapistCardProps) {
  const [active, setActive] = useState(false)

  return (
    <div className="group">
      <div
        className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10 cursor-pointer"
        onClick={() => setActive(v => !v)}
      >
        <picture>
          <source srcSet={avifSrc} type="image/avif" />
          <source srcSet={webpSrc} type="image/webp" />
          <Image
            src={webpSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-[filter,opacity] duration-700 ${
              active
                ? 'opacity-100 grayscale-0'
                : 'opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0'
            }`}
            unoptimized
          />
        </picture>
      </div>
      <h4 className="font-headline text-xl text-on-surface mb-1">{name}</h4>
      <p className="font-label text-primary text-xs tracking-widest uppercase">{role}</p>
      <p className="font-body text-secondary text-xs mt-1">{years}</p>
    </div>
  )
}
