import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE = 'admin_session'
const MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'dev-only-change-admin-session-secret'
}

export function signSession(expMs: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs }), 'utf8').toString('base64url')
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  try {
    if (sig.length !== expected.length) return false
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  } catch {
    return false
  }
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp: number }
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}

export function adminCookieName() {
  return COOKIE
}

export function adminCookieMaxAge() {
  return MAX_AGE_SEC
}

export function verifyAdminPassword(username: string, password: string): boolean {
  const u = process.env.ADMIN_USERNAME ?? 'admin'
  const p = process.env.ADMIN_PASSWORD ?? ''
  if (!p) {
    console.warn('ADMIN_PASSWORD is not set — admin login disabled')
    return false
  }
  return username === u && password === p
}
