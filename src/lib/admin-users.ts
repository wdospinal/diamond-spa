/**
 * Cuentas del panel de administración con contraseña hasheada y correo
 * asociado. Las cuentas iniciales se crean en Supabase mediante la migración
 * 0009_seed_admin_users.sql.
 *
 * Backend, en el mismo orden que el resto de stores: Supabase (tabla
 * `admin_users`, ver supabase/migrations/0008_admin_users.sql) → Vercel KV
 * (hash `admin_users`) → data/admin-users.json.
 */

import { createHmac, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbInsert, sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>

const FILE = join(process.cwd(), 'data', 'admin-users.json')
const HASH_KEY = 'admin_users'
const KEYLEN = 64

/** Ventana de validez del código enviado por correo. */
export const CODE_TTL_MS = 10 * 60 * 1000
/** Intentos fallidos antes de invalidar el código y obligar a pedir otro. */
export const CODE_MAX_ATTEMPTS = 5

export interface AdminUser {
  username: string
  email: string | null
  passwordHash: string | null
  isSuperadmin: boolean
  pendingEmail: string | null
  codeHash: string | null
  /** Epoch ms. */
  codeExpiresAt: number | null
  codeAttempts: number
}

function emptyUser(username: string): AdminUser {
  return {
    username,
    email: null,
    passwordHash: null,
    isSuperadmin: false,
    pendingEmail: null,
    codeHash: null,
    codeExpiresAt: null,
    codeAttempts: 0,
  }
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Reglas para nombres que puedan usarse sin ambigüedad en el login. */
export function usernameProblem(username: string): string | null {
  const name = normalizeUsername(username)
  if (name.length < 2 || name.length > 32) {
    return 'El usuario debe tener entre 2 y 32 caracteres.'
  }
  if (!/^[a-z0-9._-]+$/.test(name)) {
    return 'Usa solo letras minúsculas, números, punto, guion o guion bajo.'
  }
  return null
}

// ─── Contraseñas ─────────────────────────────────────────────────────────────

/** Deriva `scrypt$<salt>$<hash>`. El salt es nuevo en cada llamada. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password.normalize('NFKC'), salt, KEYLEN)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hex] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hex) return false
  let expected: Buffer
  try {
    expected = Buffer.from(hex, 'hex')
  } catch {
    return false
  }
  if (expected.length !== KEYLEN) return false
  const derived = await scrypt(password.normalize('NFKC'), salt, KEYLEN)
  return timingSafeEqual(derived, expected)
}

/** Reglas mínimas de la contraseña nueva. Devuelve el motivo o null si pasa. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (password.length > 200) return 'La contraseña es demasiado larga.'
  if (!/[a-zA-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra.'
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número.'
  return null
}

// ─── Códigos de verificación ─────────────────────────────────────────────────

/** Código de 6 dígitos con entropía criptográfica (no Math.random). */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * El código se guarda hasheado y ligado al usuario, de modo que un volcado de
 * la tabla no permite completar el cambio y un código de una cuenta no sirve
 * en otra.
 */
export function hashCode(username: string, code: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'dev-only-change-admin-session-secret'
  return createHmac('sha256', secret).update(`${username}:${code}`).digest('base64url')
}

export function codeMatches(username: string, code: string, stored: string | null): boolean {
  if (!stored) return false
  const expected = hashCode(username, code.trim())
  if (expected.length !== stored.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(stored))
  } catch {
    return false
  }
}

export function isValidEmail(email: string): boolean {
  // Deliberadamente laxa: el correo se verifica de verdad recibiendo el código.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254
}

// ─── Persistencia ────────────────────────────────────────────────────────────

type Row = {
  username: string
  email: string | null
  password_hash: string | null
  is_superadmin?: boolean | null
  pending_email: string | null
  code_hash: string | null
  code_expires_at: string | null
  code_attempts: number | null
}

function fromRow(row: Row): AdminUser {
  const exp = row.code_expires_at ? Date.parse(row.code_expires_at) : NaN
  return {
    username: row.username,
    email: row.email ?? null,
    passwordHash: row.password_hash ?? null,
    isSuperadmin: row.is_superadmin === true,
    pendingEmail: row.pending_email ?? null,
    codeHash: row.code_hash ?? null,
    codeExpiresAt: Number.isNaN(exp) ? null : exp,
    codeAttempts: row.code_attempts ?? 0,
  }
}

function toRow(user: AdminUser): Row & { updated_at: string } {
  return {
    username: user.username,
    email: user.email,
    password_hash: user.passwordHash,
    is_superadmin: user.isSuperadmin,
    pending_email: user.pendingEmail,
    code_hash: user.codeHash,
    code_expires_at: user.codeExpiresAt ? new Date(user.codeExpiresAt).toISOString() : null,
    code_attempts: user.codeAttempts,
    updated_at: new Date().toISOString(),
  }
}

async function readFileUsers(): Promise<Record<string, AdminUser>> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    const users = data as Record<string, AdminUser>
    return Object.fromEntries(
      Object.entries(users).map(([username, user]) => [
        username,
        { ...user, isSuperadmin: user.isSuperadmin === true },
      ]),
    )
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function saveFileUsers(users: Record<string, AdminUser>): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(users, null, 2), 'utf8')
}

/**
 * ¿El error dice que la tabla todavía no existe (migraciones admin sin
 * correr)? Se separa de un fallo real de la base porque «la tabla no existe»
 * significa inequívocamente «no hay ninguna cuenta», mientras que una caída de
 * Supabase no dice nada y debe seguir rechazando el acceso.
 *
 * Avisa por consola siempre: sin este log, el síntoma es un 401 mudo en todos
 * los logins y la causa real queda invisible.
 */
export function isMissingTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  const missing =
    msg.includes('PGRST205') || msg.includes("Could not find the table 'public.admin_users'")
  if (missing) {
    console.error(
      'admin_users no existe: corre las migraciones 0008, 0009 y 0010 en Supabase. ' +
        'Hasta entonces NADIE puede entrar al panel.',
    )
  }
  return missing
}

export async function getAdminUser(username: string): Promise<AdminUser | null> {
  const name = normalizeUsername(username)
  if (!name) return null

  if (supabaseConfigured()) {
    try {
      const rows = await sbSelect<Row>('admin_users', `username=eq.${encodeURIComponent(name)}&limit=1`)
      return rows[0] ? fromRow(rows[0]) : null
    } catch (err) {
      if (isMissingTableError(err)) return null
      throw err
    }
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['HGET', HASH_KEY, name])
    if (typeof raw !== 'string') return null
    try {
      const user = JSON.parse(raw) as AdminUser
      return { ...user, isSuperadmin: user.isSuperadmin === true }
    } catch {
      return null
    }
  }
  return (await readFileUsers())[name] ?? null
}

export async function saveAdminUser(user: AdminUser): Promise<void> {
  if (supabaseConfigured()) {
    await sbUpsert('admin_users', toRow(user))
    return
  }
  if (kvConfigured()) {
    await kvCommand(['HSET', HASH_KEY, user.username, JSON.stringify(user)])
    return
  }
  const users = await readFileUsers()
  users[user.username] = user
  await saveFileUsers(users)
}

function isDuplicateUsernameError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('23505') || message.includes('409')
}

/**
 * Crea una cuenta normal sin sobrescribir una existente. Devuelve false cuando
 * el usuario ya existe, incluso ante una carrera entre dos solicitudes.
 */
export async function createAdminUser(
  username: string,
  passwordHash: string,
): Promise<boolean> {
  const name = normalizeUsername(username)
  const user = { ...emptyUser(name), passwordHash }

  if (supabaseConfigured()) {
    try {
      if (await getAdminUser(name)) return false
      await sbInsert('admin_users', toRow(user))
      return true
    } catch (err) {
      if (isDuplicateUsernameError(err)) return false
      throw err
    }
  }
  if (kvConfigured()) {
    const inserted = await kvCommand(['HSETNX', HASH_KEY, name, JSON.stringify(user)])
    return Number(inserted) === 1
  }
  const users = await readFileUsers()
  if (users[name]) return false
  users[name] = user
  await saveFileUsers(users)
  return true
}

/** El privilegio se consulta en el store para que una revocación sea inmediata. */
export async function isAdminSuperadmin(username: string): Promise<boolean> {
  return (await getAdminUser(username))?.isSuperadmin === true
}

/** Lee la fila, o devuelve una vacía en memoria si la cuenta aún no existe. */
export async function getOrCreateAdminUser(username: string): Promise<AdminUser> {
  const name = normalizeUsername(username)
  return (await getAdminUser(name)) ?? emptyUser(name)
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Todas las cuentas. Son un puñado, así que leerlas enteras no es problema. */
async function readAllAdminUsers(): Promise<AdminUser[]> {
  if (supabaseConfigured()) {
    try {
      return (await sbSelect<Row>('admin_users', 'select=*')).map(fromRow)
    } catch (err) {
      if (isMissingTableError(err)) return []
      throw err
    }
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['HGETALL', HASH_KEY])
    const all: AdminUser[] = []
    if (Array.isArray(raw)) {
      // HGETALL devuelve [campo, valor, campo, valor, …]
      for (let i = 1; i < raw.length; i += 2) {
        if (typeof raw[i] !== 'string') continue
        try {
          const user = JSON.parse(raw[i] as string) as AdminUser
          all.push({ ...user, isSuperadmin: user.isSuperadmin === true })
        } catch {}
      }
    } else if (raw && typeof raw === 'object') {
      for (const value of Object.values(raw as Record<string, unknown>)) {
        if (typeof value !== 'string') continue
        try {
          const user = JSON.parse(value) as AdminUser
          all.push({ ...user, isSuperadmin: user.isSuperadmin === true })
        } catch {}
      }
    }
    return all
  }
  return Object.values(await readFileUsers())
}

/**
 * Busca por el correo ya verificado. Solo lo tienen las cuentas que pasaron por
 * el cambio de contraseña, que es justo lo que hace fiable entrar con él.
 *
 * El correo se guarda ya en minúsculas (ver la ruta de confirmación), así que
 * basta comparar en minúsculas. Deliberadamente NO se usa `ilike` en Supabase:
 * el guion bajo, corriente en las direcciones, es un comodín en LIKE y podría
 * emparejar la fila de otra persona.
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const target = normalizeEmail(email)
  if (!target) return null

  if (supabaseConfigured()) {
    try {
      const rows = await sbSelect<Row>(
        'admin_users',
        `email=eq.${encodeURIComponent(target)}&limit=1`,
      )
      return rows[0] ? fromRow(rows[0]) : null
    } catch (err) {
      if (isMissingTableError(err)) return null
      throw err
    }
  }
  return (await readAllAdminUsers()).find(u => normalizeEmail(u.email ?? '') === target) ?? null
}

/**
 * Correo ya asociado a otra cuenta. Evita que dos personas compartan buzón y,
 * con él, la posibilidad de recuperar la cuenta ajena.
 */
export async function emailTakenBy(email: string, exceptUsername: string): Promise<string | null> {
  const target = normalizeEmail(email)
  const name = normalizeUsername(exceptUsername)
  const all = await readAllAdminUsers()
  const clash = all.find(u => u.username !== name && normalizeEmail(u.email ?? '') === target)
  return clash?.username ?? null
}

export interface AdminAccountSummary {
  username: string
  /** Correo verificado, o null si todavía no asoció ninguno. */
  email: string | null
  isSuperadmin: boolean
  /** false = la cuenta no tiene una contraseña utilizable. */
  hasOwnPassword: boolean
  /** Correo a la espera de un código sin usar, si hay un cambio a medias. */
  pendingEmail: string | null
}

/** Todas las cuentas persistidas. No devuelve hashes de contraseña ni de código. */
export async function listAdminAccounts(): Promise<AdminAccountSummary[]> {
  const accounts = (await readAllAdminUsers()).map(user => ({
    username: user.username,
    email: user.email,
    isSuperadmin: user.isSuperadmin,
    hasOwnPassword: Boolean(user.passwordHash),
    // Un código caducado no cuenta como cambio en curso.
    pendingEmail: user.codeExpiresAt && user.codeExpiresAt > Date.now() ? user.pendingEmail : null,
  }))

  return accounts.sort((a, b) => a.username.localeCompare(b.username, 'es'))
}
