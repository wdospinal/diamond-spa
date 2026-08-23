import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE = 'admin_session'
const MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'dev-only-change-admin-session-secret'
}

export interface AdminSession {
  /** Usuario en minúsculas de la sesión. */
  username: string
  /** Caducidad en epoch ms. */
  exp: number
}

export function signSession(expMs: number, username: string): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs, u: username }), 'utf8').toString('base64url')
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/** Devuelve la sesión si la firma es válida y no ha caducado, o null. */
export function readSessionToken(token: string | undefined): AdminSession | null {
  if (!token || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  try {
    if (sig.length !== expected.length) return null
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown
      u?: unknown
    }
    if (
      typeof data.exp !== 'number' ||
      Date.now() >= data.exp ||
      typeof data.u !== 'string' ||
      !data.u
    ) {
      return null
    }
    return { username: data.u, exp: data.exp }
  } catch {
    return null
  }
}

export function verifySessionToken(token: string | undefined): boolean {
  return readSessionToken(token) !== null
}

export function adminCookieName() {
  return COOKIE
}

export function adminCookieMaxAge() {
  return MAX_AGE_SEC
}
