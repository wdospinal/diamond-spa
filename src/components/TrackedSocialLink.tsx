'use client'

import { EVENTS, trackEvent } from '@/lib/events'
import type { EventName } from '@/lib/events'

const PLATFORM_EVENT: Record<string, EventName> = {
  instagram: EVENTS.INSTAGRAM_CLICKED,
  tiktok:    EVENTS.TIKTOK_CLICKED,
  email:     EVENTS.EMAIL_CLICKED,
  phone:     EVENTS.PHONE_CLICKED,
  google:    EVENTS.GOOGLE_REVIEW_CLICKED,
}

type Props = {
  href: string
  platform: 'instagram' | 'tiktok' | 'email' | 'phone' | 'google'
  source: string
  className?: string
  'aria-label'?: string
  target?: string
  rel?: string
  children: React.ReactNode
}

export function TrackedSocialLink({
  href, platform, source, className, 'aria-label': ariaLabel, target, rel, children,
}: Props) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={className}
      onClick={() => trackEvent(PLATFORM_EVENT[platform], { platform, source })}
    >
      {children}
    </a>
  )
}
