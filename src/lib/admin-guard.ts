import { cookies } from 'next/headers'
import { adminCookieName, readSessionToken, verifySessionToken } from '@/lib/admin-session'

/** Server-side session check for admin pages. Reading the cookie opts the route out of static rendering. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

/** Usuario de la sesión actual, o null si no hay sesión válida. */
export async function currentAdminUser(): Promise<string | null> {
  const token = (await cookies()).get(adminCookieName())?.value
  return readSessionToken(token)?.username ?? null
}

/**
 * Sanitize a post-login destination. Anything that is not a plain in-app admin
 * path falls back to /admin so a crafted ?next= cannot bounce the admin off-site.
 */
export function safeAdminRedirect(next: string | undefined): string {
  if (!next) return '/admin'
  // Reject protocol-relative (//evil.com) and non-admin targets.
  if (!next.startsWith('/admin') || next.startsWith('//')) return '/admin'
  if (next === '/admin/login' || next.startsWith('/admin/login/')) return '/admin'
  return next
}
