/**
 * Paso 1 de «olvidé mi contraseña»: sin sesión, se escribe el usuario o el
 * correo y mandamos un código de 6 dígitos al correo YA verificado de esa
 * cuenta.
 *
 * Nunca se envía a un correo escrito por quien pide el código: solo al que la
 * cuenta confirmó en su día. De lo contrario esta ruta sería una puerta de
 * entrada abierta a cualquiera que sepa un nombre de usuario.
 *
 * La respuesta es siempre la misma exista o no la cuenta — si distinguiera,
 * serviría para enumerar usuarios y correos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { emailConfigured, sendEmail } from '@/lib/email'
import type { AdminUser } from '@/lib/admin-users'
import {
  CODE_TTL_MS,
  generateCode,
  getAdminUser,
  getAdminUserByEmail,
  hashCode,
  isMissingTableError,
  normalizeUsername,
  resetCodeScope,
  saveAdminUser,
} from '@/lib/admin-users'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'

function codeEmailHtml(username: string, code: string): string {
  return `<div style="font-family:sans-serif;color:#1a1a1a;max-width:480px">
  <h2 style="color:#0a2438;margin-bottom:4px">Recuperar tu contraseña</h2>
  <p style="color:#555;font-size:14px;margin-top:0">
    Panel de administración de Diamond Spa — cuenta <strong>${username}</strong>.
  </p>
  <p style="font-size:14px;color:#333">Tu código para poner una contraseña nueva es:</p>
  <p style="font-size:34px;letter-spacing:10px;font-weight:bold;color:#0a2438;margin:20px 0">${code}</p>
  <p style="font-size:13px;color:#666">
    Caduca en ${Math.round(CODE_TTL_MS / 60000)} minutos. Si no fuiste tú quien lo pidió,
    ignora este correo y avisa: tu contraseña no ha cambiado.
  </p>
</div>`
}

/** Busca la cuenta por usuario o por correo verificado. */
async function findAccount(identifier: string): Promise<AdminUser | null> {
  const id = normalizeUsername(identifier)
  if (!id) return null
  return id.includes('@') ? getAdminUserByEmail(id) : getAdminUser(id)
}

export async function POST(req: NextRequest) {
  // Sin freno esto es un enviador de correo gratuito contra cualquier buzón
  // que ya esté en el store.
  const limit = await rateLimit('admin-pwd-forgot', clientIp(req), 5, 900)
  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, 'Demasiados envíos. Espera unos minutos.')
  }

  let body: { identifier?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : ''
  if (!identifier) {
    return NextResponse.json({ error: 'Escribe tu usuario o tu correo.' }, { status: 400 })
  }

  // Este sí se puede contar: no depende de que la cuenta exista.
  if (!emailConfigured()) {
    return NextResponse.json(
      { error: 'El envío de correo no está configurado (RESEND_API_KEY).' },
      { status: 503 },
    )
  }

  // Respuesta única, se encuentre o no la cuenta.
  const ok = NextResponse.json({ ok: true, expiresInMinutes: Math.round(CODE_TTL_MS / 60000) })

  try {
    const user = await findAccount(identifier)
    if (!user?.email) return ok

    const code = generateCode()
    const sent = await sendEmail({
      to: user.email,
      subject: 'Código para recuperar tu contraseña — Diamond Spa',
      html: codeEmailHtml(user.username, code),
    })
    // El código solo se guarda si el correo salió: si no, nadie podría usarlo.
    if (!sent) return ok

    user.codeHash = hashCode(resetCodeScope(user.username), code)
    user.codeExpiresAt = Date.now() + CODE_TTL_MS
    user.codeAttempts = 0
    // Un cambio de correo a medias queda anulado: los dos flujos comparten
    // estos campos y no pueden convivir.
    user.pendingEmail = null
    await saveAdminUser(user)

    return ok
  } catch (err) {
    console.error('admin password forgot failed', err)
    if (isMissingTableError(err)) {
      return NextResponse.json(
        { error: 'Falta la tabla admin_users. Corre la migración 0008 en Supabase.' },
        { status: 503 },
      )
    }
    // Tampoco aquí se distingue: un 500 solo en cuentas existentes las delata.
    return ok
  }
}
