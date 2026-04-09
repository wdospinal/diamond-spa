import { NextRequest, NextResponse } from 'next/server'
import {
  adminCookieMaxAge,
  adminCookieName,
  signSession,
  verifyAdminPassword,
} from '@/lib/admin-session'

export async function POST(req: NextRequest) {
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
