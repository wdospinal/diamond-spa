/**
 * Fixed-window rate limiter over the same KV / Upstash REST connection the rest
 * of the app uses (see kv.ts) — no npm dependency, in keeping with this
 * project's minimal-deps rule.
 *
 * Keys are bucketed by window (`rl:<name>:<ip>:<bucket>`) so the counter expires
 * on its own and a rolling EXPIRE can never extend a window indefinitely.
 *
 * Degrades gracefully on purpose:
 *   - no KV configured (local dev) → in-process Map, per-instance only
 *   - KV request fails            → fails OPEN, so a Redis outage can never
 *                                   stop a customer from booking
 */

import { kvConfigured, kvPipeline } from './kv'

export interface RateLimitResult {
  /** False when the caller has exhausted the window and should be rejected. */
  ok: boolean
  /** Requests left in the current window (never negative). */
  remaining: number
  /** Seconds until the window resets — send as the Retry-After header. */
  retryAfter: number
}

/** Fallback counter used when KV is not configured. Not shared across instances. */
const memory = new Map<string, { count: number; resetAt: number }>()

function memoryLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now()
  const hit = memory.get(key)

  if (!hit || hit.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    // Opportunistic sweep so the Map cannot grow without bound in a long-lived dev server.
    if (memory.size > 5000) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
    }
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  hit.count += 1
  const retryAfter = Math.max(1, Math.ceil((hit.resetAt - now) / 1000))
  return {
    ok: hit.count <= limit,
    remaining: Math.max(0, limit - hit.count),
    retryAfter,
  }
}

/**
 * Count one hit against `name`+`id` and report whether it is allowed.
 *
 * @param name    Bucket name, e.g. 'booking' — keeps unrelated limits apart.
 * @param id      Caller identity, normally the client IP from `clientIp()`.
 * @param limit   Max requests permitted per window.
 * @param windowSec Window length in seconds.
 */
export async function rateLimit(
  name: string,
  id: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / (windowSec * 1000))
  const key = `rl:${name}:${id}:${bucket}`

  if (!kvConfigured()) return memoryLimit(key, limit, windowSec)

  const elapsed = (Date.now() % (windowSec * 1000)) / 1000
  const retryAfter = Math.max(1, Math.ceil(windowSec - elapsed))

  try {
    const [count] = await kvPipeline([
      ['INCR', key],
      ['EXPIRE', key, windowSec],
    ])
    const used = Number(count)
    return {
      ok: used <= limit,
      remaining: Math.max(0, limit - used),
      retryAfter,
    }
  } catch (err) {
    // Fail open — availability of the booking flow beats strict enforcement.
    console.error('Rate limit check failed, allowing request:', err)
    return { ok: true, remaining: limit, retryAfter: 0 }
  }
}

/**
 * Best-effort client IP. Vercel always sets x-forwarded-for at the edge; the
 * left-most entry is the real client. Falls back to a constant so a missing
 * header collapses to one shared bucket rather than silently disabling limits.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** 429 response with the conventional Retry-After header. */
export function tooManyRequests(retryAfter: number, msg = 'Too many requests') {
  return new Response(JSON.stringify({ error: msg }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(Math.max(1, retryAfter)),
    },
  })
}
