/**
 * Validación de credenciales del panel contra la cuenta persistida.
 *
 * Va aparte de admin-session.ts a propósito: aquel lo importan una docena de
 * rutas que solo necesitan leer la cookie, y no deben arrastrar el store
 * (fs/promises, fetch a Supabase) por ello.
 */

import {
  getAdminUser,
  getAdminUserByEmail,
  normalizeUsername,
  verifyPasswordHash,
} from '@/lib/admin-users'

/**
 * Devuelve el usuario canónico (en minúsculas) si las credenciales son válidas,
 * o null. `identifier` admite el usuario o el correo asociado a la cuenta.
 * Ninguno de los dos distingue mayúsculas; la contraseña sí.
 */
export async function verifyAdminCredentials(
  identifier: string,
  password: string,
): Promise<string | null> {
  const name = normalizeUsername(identifier)
  if (!name || !password) return null

  // Entrar con el correo solo funciona para cuentas que ya lo verificaron, y
  // esas tienen siempre contraseña propia: aquí no hay respaldo del entorno.
  if (name.includes('@')) {
    try {
      const byEmail = await getAdminUserByEmail(name)
      if (!byEmail?.passwordHash) return null
      return (await verifyPasswordHash(password, byEmail.passwordHash)) ? byEmail.username : null
    } catch (err) {
      console.error('admin-auth: no se pudo buscar por correo', err)
      return null
    }
  }

  let stored: Awaited<ReturnType<typeof getAdminUser>> = null
  try {
    stored = await getAdminUser(name)
  } catch (err) {
    console.error('admin-auth: no se pudo leer la cuenta', err)
    return null
  }

  if (!stored?.passwordHash) return null
  return (await verifyPasswordHash(password, stored.passwordHash)) ? name : null
}
