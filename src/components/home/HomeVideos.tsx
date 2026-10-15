'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type HomeVideoItem = {
  id: string
  name: string
  video: string
  poster: string
  href: string
  meta: string
  posterAlt: string
}

/**
 * Tap-to-play video: only the light poster loads up front (preload="none"),
 * the MP4 is requested when the visitor taps it. One video plays at a time.
 */
function VideoCard({
  item,
  playing,
  onToggle,
  playLabel,
  pauseLabel,
  viewLabel,
}: {
  item: HomeVideoItem
  playing: boolean
  onToggle: (id: string | null) => void
  playLabel: string
  pauseLabel: string
  viewLabel: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (playing) el.play().catch(() => onToggle(null))
    else el.pause()
    // onToggle is a stable setState wrapper from the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          src={item.video}
          poster={item.poster}
          preload="none"
          playsInline
          muted
          onEnded={() => onToggle(null)}
          aria-label={item.posterAlt}
        />
        <button
          type="button"
          onClick={() => onToggle(playing ? null : item.id)}
          aria-label={`${playing ? pauseLabel : playLabel}: ${item.name}`}
          aria-pressed={playing}
          className={`absolute inset-0 flex items-center justify-center transition-colors ${
            playing ? 'bg-transparent' : 'bg-black/30 hover:bg-black/20'
          }`}
        >
          {!playing && (
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-6" aria-hidden="true">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </button>
      </div>
      <div>
        <h3 className="font-headline text-xl text-on-surface">{item.name}</h3>
        {item.meta && (
          <p className="mt-1 font-label text-xs tracking-wider text-outline">{item.meta}</p>
        )}
        <Link
          href={item.href}
          className="mt-3 inline-flex items-center gap-1 font-label text-xs uppercase tracking-widest text-primary transition-all hover:gap-2"
        >
          {viewLabel}
          <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
        </Link>
      </div>
    </div>
  )
}

export function HomeVideos({
  items,
  playLabel,
  pauseLabel,
  viewLabel,
}: {
  items: HomeVideoItem[]
  playLabel: string
  pauseLabel: string
  viewLabel: string
}) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
      {items.map(item => (
        <VideoCard
          key={item.id}
          item={item}
          playing={playingId === item.id}
          onToggle={setPlayingId}
          playLabel={playLabel}
          pauseLabel={pauseLabel}
          viewLabel={viewLabel}
        />
      ))}
    </div>
  )
}
