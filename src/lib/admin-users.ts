/**
 * Cuentas del panel de administración con contraseña propia y correo asociado.
 *
 * Backend, en el mismo orden que el resto de stores: Supabase (tabla
 * `admin_users`, ver supabase/migrations/0008_admin_users.sql) → Vercel KV
 * (hash `admin_users`) → data/admin-users.json.
 *
 * Una cuenta solo existe aquí cuando ya cambió su contraseña. Mientras no haya
 * fila, el login la valida contra ADMIN_USERS/ADMIN_PASSWORD del entorno (ver
 * admin-session.ts), que hacen de contraseña inicial de un solo uso práctico.
 */

import { createHmac, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

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
    pendingEmail: null,
    codeHash: null,
    codeExpiresAt: null,
    codeAttempts: 0,
  }
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
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
    return data as Record<string, AdminUser>
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function saveFileUsers(users: Record<string, AdminUser>): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(users, null, 2), 'utf8')
}

export async function getAdminUser(username: string): Promise<AdminUser | null> {
  const name = normalizeUsername(username)
  if (!name) return null

  if (supabaseConfigured()) {
    const rows = await sbSelect<Row>('admin_users', `username=eq.${encodeURIComponent(name)}&limit=1`)
    return rows[0] ? fromRow(rows[0]) : null
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['HGET', HASH_KEY, name])
    if (typeof raw !== 'string') return null
    try {
      return JSON.parse(raw) as AdminUser
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
    return (await sbSelect<Row>('admin_users', 'select=*')).map(fromRow)
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['HGETALL', HASH_KEY])
    const all: AdminUser[] = []
    if (Array.isArray(raw)) {
      // HGETALL devuelve [campo, valor, campo, valor, …]
      for (let i = 1; i < raw.length; i += 2) {
        if (typeof raw[i] !== 'string') continue
        try {
          all.push(JSON.parse(raw[i] as string) as AdminUser)
        } catch {}
      }
    } else if (raw && typeof raw === 'object') {
      for (const value of Object.values(raw as Record<string, unknown>)) {
        if (typeof value !== 'string') continue
        try {
          all.push(JSON.parse(value) as AdminUser)
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
    const rows = await sbSelect<Row>(
      'admin_users',
      `email=eq.${encodeURIComponent(target)}&limit=1`,
    )
    return rows[0] ? fromRow(rows[0]) : null
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
