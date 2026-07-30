'use client'

/**
 * First-party funnel tracking.
 *
 * The funnel used to be fed exclusively by a Vercel Analytics Drain, which
 * requires a Pro plan and a drain secret. That left the dashboard empty
 * whenever the drain was not configured, so stage hits are now also posted
 * straight to our own /api/funnel-hit. The drain receiver stays in place — both
 * writers land in the same store and dedupe on (day, stage, session).
 *
 * Privacy: the only thing sent is a random session id kept in sessionStorage
 * (gone when the tab closes) plus the stage name. No IP, no fingerprint, no
 * cross-tab or cross-visit identity. Honours a declined cookie banner.
 */

import { EVENT_NAME_TO_STAGE, type FunnelStageKey } from '@/lib/funnel-stages'

const SESSION_KEY = 'diamond_funnel_session'
const CONSENT_KEY = 'diamond_cookie_consent'

/** Stages already sent this session — saves a round-trip per repeat hit. */
const sentThisSession = new Set<string>()

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id =
      typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    // Private mode / storage disabled — no stable id, so skip tracking entirely.
    return ''
  }
}

function consentDeclined(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'declined'
  } catch {
    return false
  }
}

/** Admin traffic must never count toward the funnel (mirrors the drain's filter). */
function isAdminPath(path: string): boolean {
  return path.replace(/^\/(es|en)(?=\/|$)/, '').startsWith('/admin')
}

/**
 * Record that the current session reached `stage`. Fire-and-forget: never
 * throws, never blocks, and repeats within a session are dropped client-side.
 */
export function trackFunnelStage(stage: FunnelStageKey): void {
  if (typeof window === 'undefined') return
  try {
    if (consentDeclined() || isAdminPath(window.location.pathname)) return
    if (sentThisSession.has(stage)) return

    const id = sessionId()
    if (!id) return
    sentThisSession.add(stage)

    const body = JSON.stringify({ stage, sessionId: id })
    // sendBeacon survives the page unload that follows an outbound WhatsApp
    // click; fetch+keepalive is the fallback where it is unavailable.
    if (typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon('/api/funnel-hit', new Blob([body], { type: 'application/json' }))
      if (ok) return
    }
    void fetch('/api/funnel-hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Never let analytics crash the app.
  }
}

/** Maps a custom analytics event to its funnel stage, when it has one. */
export function trackFunnelEvent(eventName: string): void {
  const stage = EVENT_NAME_TO_STAGE[eventName]
  if (stage) trackFunnelStage(stage)
}
