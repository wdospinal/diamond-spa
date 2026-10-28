'use client'

/**
 * Registro anónimo de lo que hace la gente dentro del chat de la pauta.
 *
 * Qué se envía: un id de sesión aleatorio (sessionStorage: se borra al cerrar la
 * pestaña), el nombre del evento y, si aplica, una etiqueta que ya existe en el
 * chat (la duda tocada, el servicio, la fecha). NUNCA el nombre ni el teléfono
 * que la persona escribe, ni ningún texto libre; el servidor rechaza todo lo que
 * no esté en las listas de lib/chat-events.ts. Sin IP, sin huella del navegador.
 * Respeta el banner de cookies: si la persona lo rechazó, no se envía nada.
 *
 * Los eventos se juntan y salen en lotes cortos para no abrir una petición por
 * clic; al cerrar la pestaña o salir a WhatsApp se envía lo pendiente con
 * sendBeacon, que sobrevive a la navegación.
 */

import type { ChatEv, ChatNode, ChatScope, ChatSessionMeta } from '@/lib/chat-events'

const SESSION_KEY = 'diamond_chat_session'
const SEQ_KEY = 'diamond_chat_seq'
const CONSENT_KEY = 'diamond_cookie_consent'
const FLUSH_MS = 1500
const ENDPOINT = '/api/chat-hit'

interface Queued {
  seq: number
  ev: ChatEv
  k?: string
  cat?: ChatScope
  node?: ChatNode
}

let queue: Queued[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let meta: Pick<ChatSessionMeta, 'lang' | 'ads' | 'adg'> = { lang: 'es', ads: false, adg: null }
let memSeq = 0
let memId = ''
let listening = false

function declined(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'declined'
  } catch {
    return false
  }
}

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id =
      typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    // Sin sessionStorage (modo privado): un id solo en memoria sirve para esta carga.
    if (!memId) memId = `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
    return memId
  }
}

/** Número de orden del evento dentro de la sesión; sobrevive a cerrar y reabrir el chat. */
function nextSeq(): number {
  try {
    const n = (parseInt(sessionStorage.getItem(SEQ_KEY) ?? '0', 10) || 0) + 1
    sessionStorage.setItem(SEQ_KEY, String(n))
    return n
  } catch {
    memSeq += 1
    return memSeq
  }
}

function flush(): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (queue.length === 0) return
  const events = queue.splice(0, queue.length)
  try {
    const body = JSON.stringify({
      sessionId: sessionId(),
      meta: {
        ...meta,
        dev: typeof window !== 'undefined' && window.innerWidth < 640 ? 'm' : 'd',
      },
      events,
    })
    if (typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // La analítica nunca debe romper el chat.
  }
}

function listen(): void {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

/** Datos de la sesión que acompañan a los eventos: idioma, si vino de anuncio y el grupo. */
export function setChatMeta(m: { lang: 'es' | 'en'; ads: boolean; adg?: string }): void {
  meta = { lang: m.lang, ads: m.ads, adg: m.adg || null }
}

/** Eventos que se envían de inmediato porque suelen ir seguidos de salir de la página. */
const URGENT = new Set<ChatEv>(['close', 'wa_direct', 'wa_after_reserve', 'advisor_sent', 'reserve_saved', 'reserve_failed'])

export function trackChat(ev: ChatEv, p?: { k?: string; cat?: ChatScope | null; node?: ChatNode | null }): void {
  if (typeof window === 'undefined') return
  try {
    if (declined()) return
    if (window.location.pathname.replace(/^\/(es|en)(?=\/|$)/, '').startsWith('/admin')) return
    listen()
    queue.push({
      seq: nextSeq(),
      ev,
      ...(p?.k ? { k: p.k } : {}),
      ...(p?.cat ? { cat: p.cat } : {}),
      ...(p?.node ? { node: p.node } : {}),
    })
    if (URGENT.has(ev) || queue.length >= 20) return flush()
    if (!timer) timer = setTimeout(flush, FLUSH_MS)
  } catch {
    // Nunca romper el chat por la analítica.
  }
}
