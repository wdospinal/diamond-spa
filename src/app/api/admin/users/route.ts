import { NextRequest, NextResponse } from 'next/server'
import { currentAdminUser } from '@/lib/admin-guard'
import {
  createAdminUser,
  hashPassword,
  isAdminSuperadmin,
  normalizeUsername,
  passwordProblem,
  usernameProblem,
} from '@/lib/admin-users'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const actor = await currentAdminUser()
  if (!actor) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // El rol no vive en la cookie: se vuelve a consultar para que una
    // revocación en Supabase tenga efecto sin esperar a que caduque la sesión.
    if (!(await isAdminSuperadmin(actor))) {
      return NextResponse.json({ error: 'Se requiere acceso de superadmin.' }, { status: 403 })
    }

    const limit = await rateLimit('admin-user-create', `${actor}:${clientIp(req)}`, 10, 900)
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'Demasiadas cuentas creadas. Espera unos minutos.')
    }

    let body: { username?: unknown; temporaryPassword?: unknown }
    try {
      body = (await req.json()) as { username?: unknown; temporaryPassword?: unknown }
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const username = normalizeUsername(typeof body.username === 'string' ? body.username : '')
    const temporaryPassword =
      typeof body.temporaryPassword === 'string' ? body.temporaryPassword : ''

    const invalidUsername = usernameProblem(username)
    if (invalidUsername) {
      return NextResponse.json({ error: invalidUsername }, { status: 400 })
    }
    const invalidPassword = passwordProblem(temporaryPassword)
    if (invalidPassword) {
      return NextResponse.json({ error: invalidPassword }, { status: 400 })
    }

    const created = await createAdminUser(username, await hashPassword(temporaryPassword))
    if (!created) {
      return NextResponse.json({ error: 'Ese usuario ya existe.' }, { status: 409 })
    }

    return NextResponse.json({ ok: true, username }, { status: 201 })
  } catch (err) {
    console.error('admin user creation failed', err)
    return NextResponse.json({ error: 'No se pudo crear el usuario.' }, { status: 500 })
  }
}
