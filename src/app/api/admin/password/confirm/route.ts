/**
 * Paso 2 del cambio de contraseña: con el código recibido por correo, se
 * guarda la contraseña nueva y el correo queda asociado a la cuenta.
 *
 * A partir de aquí la contraseña del entorno (ADMIN_USERS/ADMIN_PASSWORD) deja
 * de valer para esta cuenta: verifyAdminCredentials prefiere siempre el hash.
 */

import { NextRequest, NextResponse } from 'next/server'
import { currentAdminUser } from '@/lib/admin-guard'
import {
  CODE_MAX_ATTEMPTS,
  codeMatches,
  getAdminUser,
  hashPassword,
  normalizeEmail,
  passwordProblem,
  saveAdminUser,
} from '@/lib/admin-users'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const username = await currentAdminUser()
  if (!username) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // El contador por cuenta de abajo es el límite real; este corta el ruido
  // antes de tocar el store.
  const limit = await rateLimit('admin-pwd-confirm', `${username}:${clientIp(req)}`, 20, 900)
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, 'Demasiados intentos. Espera unos minutos.')
  }

  let body: { code?: string; newPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'El código son 6 dígitos.' }, { status: 400 })
  }
  const problem = passwordProblem(newPassword)
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 })
  }

  try {
    const user = await getAdminUser(username)
    if (!user?.codeHash || !user.pendingEmail) {
      return NextResponse.json(
        { error: 'No hay ningún cambio en curso. Pide un código nuevo.' },
        { status: 400 },
      )
    }
    if (!user.codeExpiresAt || Date.now() > user.codeExpiresAt) {
      user.codeHash = null
      user.pendingEmail = null
      user.codeExpiresAt = null
      user.codeAttempts = 0
      await saveAdminUser(user)
      return NextResponse.json({ error: 'El código caducó. Pide uno nuevo.' }, { status: 400 })
    }

    if (!codeMatches(username, code, user.codeHash)) {
      user.codeAttempts += 1
      const left = CODE_MAX_ATTEMPTS - user.codeAttempts
      const burned = user.codeAttempts >= CODE_MAX_ATTEMPTS
      if (burned) {
        // Quemar el código tras N fallos: 6 dígitos se agotan a fuerza bruta
        // en minutos si se permiten intentos ilimitados.
        user.codeHash = null
        user.pendingEmail = null
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

    user.email = normalizeEmail(user.pendingEmail)
    user.passwordHash = await hashPassword(newPassword)
    user.pendingEmail = null
    user.codeHash = null
    user.codeExpiresAt = null
    user.codeAttempts = 0
    await saveAdminUser(user)

    return NextResponse.json({ ok: true, email: user.email })
  } catch (err) {
    console.error('admin password confirm failed', err)
    return NextResponse.json({ error: 'No se pudo guardar la contraseña.' }, { status: 500 })
  }
}
