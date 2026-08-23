/**
 * Paso 1 del cambio de contraseña: la usuaria autenticada indica su correo y
 * su contraseña actual, y le mandamos un código de 6 dígitos a ese buzón.
 *
 * El correo no queda asociado a la cuenta aquí — solo como `pendingEmail`. Se
 * confirma en /api/admin/password/confirm al acertar el código, que es lo
 * único que prueba que el buzón es suyo.
 */

import { NextRequest, NextResponse } from 'next/server'
import { currentAdminUser } from '@/lib/admin-guard'
import { verifyAdminCredentials } from '@/lib/admin-auth'
import { emailConfigured, sendEmail } from '@/lib/email'
import {
  CODE_TTL_MS,
  emailTakenBy,
  generateCode,
  getOrCreateAdminUser,
  hashCode,
  isValidEmail,
  saveAdminUser,
} from '@/lib/admin-users'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

function codeEmailHtml(username: string, code: string): string {
  return `<div style="font-family:sans-serif;color:#1a1a1a;max-width:480px">
  <h2 style="color:#0a2438;margin-bottom:4px">Cambio de contraseña</h2>
  <p style="color:#555;font-size:14px;margin-top:0">
    Panel de administración de Diamond Spa — cuenta <strong>${username}</strong>.
  </p>
  <p style="font-size:14px;color:#333">Tu código de verificación es:</p>
  <p style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#0a2438;margin:20px 0">${code}</p>
  <p style="font-size:13px;color:#666">
    Caduca en ${Math.round(CODE_TTL_MS / 60000)} minutos. Si no fuiste tú quien lo pidió,
    ignora este correo y avisa: tu contraseña no ha cambiado.
  </p>
</div>`
}

export async function POST(req: NextRequest) {
  const username = await currentAdminUser()
  if (!username) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Sin freno, esta ruta es un enviador de correo gratuito y un oráculo para
  // adivinar la contraseña actual.
  const limit = await rateLimit('admin-pwd-request', `${username}:${clientIp(req)}`, 5, 900)
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, 'Demasiados envíos. Espera unos minutos.')
  }

  let body: { email?: string; currentPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  }

  // La cookie sola no basta: pedir la contraseña actual evita que una sesión
  // abierta en un equipo compartido baste para secuestrar la cuenta.
  if (!(await verifyAdminCredentials(username, currentPassword))) {
    return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 401 })
  }

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: 'El envío de correo no está configurado (RESEND_API_KEY).' },
      { status: 503 },
    )
  }

  try {
    const clash = await emailTakenBy(email, username)
    if (clash) {
      return NextResponse.json(
        { error: 'Ese correo ya está asociado a otra cuenta.' },
        { status: 409 },
      )
    }

    const code = generateCode()
    const user = await getOrCreateAdminUser(username)
    user.pendingEmail = email
    user.codeHash = hashCode(username, code)
    user.codeExpiresAt = Date.now() + CODE_TTL_MS
    user.codeAttempts = 0

    // El correo se envía ANTES de guardar: si Resend falla, no dejamos un
    // código vivo que nadie puede recibir.
    const sent = await sendEmail({
      to: email,
      subject: `Código para cambiar tu contraseña — Diamond Spa`,
      html: codeEmailHtml(username, code),
    })
    if (!sent) {
      return NextResponse.json(
        { error: 'No se pudo enviar el correo. Revisa la dirección e inténtalo de nuevo.' },
        { status: 502 },
      )
    }

    await saveAdminUser(user)
    return NextResponse.json({ ok: true, email, expiresInMinutes: Math.round(CODE_TTL_MS / 60000) })
  } catch (err) {
    console.error('admin password request failed', err)
    return NextResponse.json({ error: 'No se pudo iniciar el cambio.' }, { status: 500 })
  }
}
