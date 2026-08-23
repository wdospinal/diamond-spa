import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE = 'admin_session'
const MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'dev-only-change-admin-session-secret'
}

export interface AdminSession {
  /** Usuario en minúsculas de la sesión. */
  username: string
  /** Caducidad en epoch ms. */
  exp: number
}

export function signSession(expMs: number, username: string): string {
  const payload = Buffer.from(JSON.stringify({ exp: expMs, u: username }), 'utf8').toString('base64url')
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/**
 * Devuelve la sesión si la firma es válida y no ha caducado, o null. Las
 * cookies emitidas antes de que la sesión llevara usuario no tienen `u`; se
 * resuelven a la cuenta principal para no expulsar a nadie al desplegar.
 */
export function readSessionToken(token: string | undefined): AdminSession | null {
  if (!token || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  try {
    if (sig.length !== expected.length) return null
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown
      u?: unknown
    }
    if (typeof data.exp !== 'number' || Date.now() >= data.exp) return null
    const username =
      typeof data.u === 'string' && data.u
        ? data.u
        : (process.env.ADMIN_USERNAME ?? 'admin').toLowerCase()
    return { username, exp: data.exp }
  } catch {
    return null
  }
}

export function verifySessionToken(token: string | undefined): boolean {
  return readSessionToken(token) !== null
}

export function adminCookieName() {
  return COOKIE
}

export function adminCookieMaxAge() {
  return MAX_AGE_SEC
}

export interface AdminAccount {
  username: string
  password: string
}

/**
 * Cuentas definidas en el entorno. La principal sigue viniendo de
 * ADMIN_USERNAME/ADMIN_PASSWORD; las del equipo, de ADMIN_USERS como pares
 * `usuario:contraseña` separados por comas o saltos de línea.
 *
 * Son la contraseña *inicial*: en cuanto una cuenta guarda la suya en la base
 * de datos (ver admin-users.ts) esta deja de valer para ella.
 */
export function seedAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = []

  const mainPassword = process.env.ADMIN_PASSWORD ?? ''
  if (mainPassword) {
    accounts.push({
      username: (process.env.ADMIN_USERNAME ?? 'admin').toLowerCase(),
      password: mainPassword,
    })
  }

  for (const entry of (process.env.ADMIN_USERS ?? '').split(/[,\n]/)) {
    const sep = entry.indexOf(':')
    if (sep <= 0) continue
    const username = entry.slice(0, sep).trim().toLowerCase()
    const password = entry.slice(sep + 1).trim()
    if (username && password) accounts.push({ username, password })
  }

  return accounts
}

/**
 * ¿Coinciden usuario y contraseña con alguna cuenta del entorno? Compara vía
 * digests HMAC de longitud fija, así ni el tiempo de comparación ni un
 * desajuste temprano de longitud filtran nada de las credenciales, y recorre
 * todas las cuentas sin cortocircuito para no revelar cuál coincidió.
 */
export function seedAccountMatches(username: string, password: string): boolean {
  let ok = false
  for (const account of seedAccounts()) {
    const userOk = safeEqual(username, account.username)
    const passOk = safeEqual(password, account.password)
    if (userOk && passOk) ok = true
  }
  return ok
}

/** Constant-time string compare, tolerant of differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHmac('sha256', secret()).update(a).digest()
  const hb = createHmac('sha256', secret()).update(b).digest()
  return timingSafeEqual(ha, hb)
}
