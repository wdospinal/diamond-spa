import { NextRequest, NextResponse } from 'next/server'
import {
  adminCookieMaxAge,
  adminCookieName,
  signSession,
  verifyAdminPassword,
} from '@/lib/admin-session'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Without a throttle here ADMIN_PASSWORD is guessable at full request rate.
  const limit = await rateLimit('admin-login', clientIp(req), 8, 900)
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, 'Demasiados intentos. Espera unos minutos.')
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!verifyAdminPassword(username, password)) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const exp = Date.now() + adminCookieMaxAge() * 1000
  const token = signSession(exp)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: adminCookieMaxAge(),
  })
  return res
}
