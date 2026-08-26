/**
 * Paso 2 de «olvidé mi contraseña»: con el código recibido en el correo de la
 * cuenta se guarda la contraseña nueva, sin sesión previa.
 *
 * No inicia sesión al terminar: quien acaba de cambiarla vuelve al login y la
 * usa, que es la prueba de que quedó como esperaba.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  CODE_MAX_ATTEMPTS,
  codeMatches,
  getAdminUser,
  getAdminUserByEmail,
  hashPassword,
  isMissingTableError,
  normalizeUsername,
  passwordProblem,
  resetCodeScope,
  saveAdminUser,
} from '@/lib/admin-users'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

const INVALID = 'El código no es válido o caducó. Pide uno nuevo.'

export async function POST(req: NextRequest) {
  const limit = await rateLimit('admin-pwd-reset', clientIp(req), 20, 900)
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, 'Demasiados intentos. Espera unos minutos.')
  }

  let body: { identifier?: string; code?: string; newPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : ''
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!identifier) {
    return NextResponse.json({ error: 'Escribe tu usuario o tu correo.' }, { status: 400 })
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'El código son 6 dígitos.' }, { status: 400 })
  }
  const problem = passwordProblem(newPassword)
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 })
  }

  try {
    const id = normalizeUsername(identifier)
    const user = id.includes('@') ? await getAdminUserByEmail(id) : await getAdminUser(id)

    // Un mensaje único para «no existe», «no pidió código» y «caducó»: los tres
    // se ven igual desde fuera y así no delatan qué cuentas existen.
    if (!user?.codeHash || !user.codeExpiresAt || Date.now() > user.codeExpiresAt) {
      if (user?.codeHash) {
        user.codeHash = null
        user.codeExpiresAt = null
        user.codeAttempts = 0
        await saveAdminUser(user)
      }
      return NextResponse.json({ error: INVALID }, { status: 400 })
    }

    if (!codeMatches(resetCodeScope(user.username), code, user.codeHash)) {
      user.codeAttempts += 1
      const left = CODE_MAX_ATTEMPTS - user.codeAttempts
      const burned = user.codeAttempts >= CODE_MAX_ATTEMPTS
      if (burned) {
        // 6 dígitos se agotan a fuerza bruta en minutos con intentos ilimitados.
        user.codeHash = null
        user.codeExpiresAt = null
        user.codeAttempts = 0
      }
      await saveAdminUser(user)
      return NextResponse.json(
        {
          error: burned
            ? 'Código incorrecto demasiadas veces. Pide uno nuevo.'
            : `Código incorrecto. Te queda${left === 1 ? '' : 'n'} ${left} intento${left === 1 ? '' : 's'}.`,
        },
        { status: 400 },
      )
    }

    user.passwordHash = await hashPassword(newPassword)
    user.codeHash = null
    user.codeExpiresAt = null
    user.codeAttempts = 0
    await saveAdminUser(user)

    return NextResponse.json({ ok: true, username: user.username })
  } catch (err) {
    console.error('admin password reset failed', err)
    if (isMissingTableError(err)) {
      return NextResponse.json(
        { error: 'Falta la tabla admin_users. Corre la migración 0008 en Supabase.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'No se pudo guardar la contraseña.' }, { status: 500 })
  }
}
