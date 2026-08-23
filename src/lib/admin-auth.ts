/**
 * Validación de credenciales del panel: primero la fila en base de datos
 * (contraseña ya cambiada por la usuaria), y solo si no existe, la contraseña
 * inicial del entorno.
 *
 * Va aparte de admin-session.ts a propósito: aquel lo importan una docena de
 * rutas que solo necesitan leer la cookie, y no deben arrastrar el store
 * (fs/promises, fetch a Supabase) por ello.
 */

import { seedAccountMatches } from '@/lib/admin-session'
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
    // Un fallo del store no debe degradar a la contraseña inicial: si la
    // usuaria ya cambió la suya, aceptar la del entorno sería un retroceso
    // silencioso de seguridad. Mejor rechazar el intento.
    console.error('admin-auth: no se pudo leer la cuenta', err)
    return null
  }

  if (stored?.passwordHash) {
    return (await verifyPasswordHash(password, stored.passwordHash)) ? name : null
  }

  return seedAccountMatches(name, password) ? name : null
}
