'use client'
/**
 * Lazy-load Google Maps iframe using IntersectionObserver.
 *
 * Problem: an always-rendered Maps iframe loads ~200 KB of Google Maps JS
 * on every /location page visit, blocking the main thread and hurting TBT.
 *
 * Solution: render a lightweight placeholder until the element scrolls into
 * the viewport, then swap in the real iframe. Google Maps JS only downloads
 * when the user actually reaches the map — zero cost for users who never scroll.
 */

import { useEffect, useRef, useState } from 'react'

interface MapEmbedProps {
  src: string
  title: string
  height?: number
  style?: React.CSSProperties
}

export default function MapEmbed({ src, title, height = 460, style }: MapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      // Start loading 200px before the map enters the viewport so there's
      // no visible delay when the user scrolls to it.
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ height }} className="w-full overflow-hidden">
      {isVisible ? (
        <iframe
          src={src}
          width="100%"
          height={height}
          style={{ border: 0, ...style }}
          allowFullScreen
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
          aria-label={title}
        />
      ) : (
        /* Skeleton placeholder — same dimensions as the iframe */
        <div
          className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center gap-4"
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined text-primary/40"
            style={{ fontSize: '48px' }}
          >
            map
          </span>
          <span className="font-label text-outline/50 text-xs tracking-widest uppercase">
            Cargando mapa…
          </span>
        </div>
      )}
    </div>
  )
}
