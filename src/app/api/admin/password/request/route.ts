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
  isMissingTableError,
  isValidEmail,
  saveAdminUser,
} from '@/lib/admin-users'
import { kvConfigured } from '@/lib/kv'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { supabaseConfigured } from '@/lib/supabase'

/** Dónde se persisten las cuentas: lo primero que hay que mirar si el cambio falla. */
function storageLabel(): string {
  if (supabaseConfigured()) return 'Supabase (tabla public.admin_users)'
  if (kvConfigured()) return 'Vercel KV / Upstash (hash admin_users)'
  return 'archivo local data/admin-users.json'
}

function sanitizeDetail(raw: string): string {
  return raw
    .replace(/Bearer\s+\S+/gi, 'Bearer [redactado]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[jwt]')
    .slice(0, 400)
}

function nodeCode(err: unknown): string {
  if (typeof err === 'object' && err && 'code' in err && typeof err.code === 'string') {
    return err.code
  }
  return ''
}

/** Mensaje accionable para el panel: paso, almacén y causa. */
function diagnoseFailure(err: unknown, step: string): { error: string; status: number } {
  const raw = err instanceof Error ? err.message : String(err)
  const fsCode = nodeCode(err)
  const backend = storageLabel()
  const detail = sanitizeDetail(raw)

  if (isMissingTableError(err)) {
    return {
      status: 503,
      error:
        `Falta la tabla public.admin_users en Supabase. Corre las migraciones 0008, 0009 y 0010. ` +
        `Paso: ${step}. Detalle: ${detail}`,
    }
  }

  if (
    raw.includes('PGRST204') ||
    /Could not find the '.+' column/i.test(raw) ||
    /column .+ does not exist/i.test(raw)
  ) {
    return {
      status: 503,
      error:
        `La tabla admin_users existe pero le falta una columna. Corre las migraciones 0008–0010 ` +
        `(0010 si falta is_superadmin). Paso: ${step}. Almacén: ${backend}. Detalle: ${detail}`,
    }
  }

  if (raw.includes('PGRST125') || raw.includes('Invalid path')) {
    return {
      status: 503,
      error:
        `SUPABASE_URL está mal formado (PGRST125). Debe ser https://xxxx.supabase.co, sin /rest/v1. ` +
        `Paso: ${step}. Detalle: ${detail}`,
    }
  }

  if (raw.includes('Invalid API key') || (raw.includes('401') && /jwt/i.test(raw))) {
    return {
      status: 503,
      error:
        `SUPABASE_SERVICE_ROLE_KEY inválida o no autorizada. Paso: ${step}. Detalle: ${detail}`,
    }
  }

  if (raw.includes('Supabase not configured')) {
    return {
      status: 503,
      error: `Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Paso: ${step}.`,
    }
  }

  if (raw.includes('KV not configured') || raw.startsWith('KV ')) {
    return {
      status: 503,
      error:
        `Fallo en Vercel KV. Revisa KV_REST_API_URL y KV_REST_API_TOKEN. ` +
        `Paso: ${step}. Detalle: ${detail}`,
    }
  }

  if (fsCode === 'EACCES' || fsCode === 'ENOENT' || raw.includes('EACCES') || raw.includes('ENOENT')) {
    return {
      status: 500,
      error:
        `No se pudo leer o escribir data/admin-users.json (${fsCode || 'filesystem'}). ` +
        `En Vercel el disco es efímero: configura Supabase. Paso: ${step}. Detalle: ${detail}`,
    }
  }

  return {
    status: 500,
    error:
      `No se pudo iniciar el cambio en el paso «${step}». Almacén: ${backend}. Causa: ${detail}`,
  }
}

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

  let step = 'comprobar si el correo ya está asociado'
  try {
    const clash = await emailTakenBy(email, username)
    if (clash) {
      return NextResponse.json(
        { error: 'Ese correo ya está asociado a otra cuenta.' },
        { status: 409 },
      )
    }

    const code = generateCode()
    step = 'leer la cuenta de administración'
    const user = await getOrCreateAdminUser(username)
    user.pendingEmail = email
    user.codeHash = hashCode(username, code)
    user.codeExpiresAt = Date.now() + CODE_TTL_MS
    user.codeAttempts = 0

    // El correo se envía ANTES de guardar: si Resend falla, no dejamos un
    // código vivo que nadie puede recibir.
    step = 'enviar el código por correo (Resend)'
    const sent = await sendEmail({
      to: email,
      subject: `Código para cambiar tu contraseña — Diamond Spa`,
      html: codeEmailHtml(username, code),
    })
    if (!sent) {
      return NextResponse.json(
        {
          error:
            'No se pudo enviar el correo con Resend. Revisa RESEND_API_KEY y que el dominio de reserva@zanacode.com esté verificado. La dirección de destino también puede estar rechazada.',
        },
        { status: 502 },
      )
    }

    step = 'guardar el código pendiente en admin_users'
    await saveAdminUser(user)
    return NextResponse.json({ ok: true, email, expiresInMinutes: Math.round(CODE_TTL_MS / 60000) })
  } catch (err) {
    console.error('admin password request failed', { step, err })
    const { error, status } = diagnoseFailure(err, step)
    return NextResponse.json({ error }, { status })
  }
}
