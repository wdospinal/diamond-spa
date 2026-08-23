/**
 * Siembra un código de verificación para una cuenta del panel, sin enviar
 * correo. Solo para probar en local, donde el store cae en data/admin-users.json.
 *
 *   node scripts/seed-admin-code.mjs sary sary@ejemplo.com 481902
 */
import { createHmac } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'

const [username, email, code = '481902'] = process.argv.slice(2)
if (!username || !email) {
  console.error('Uso: node scripts/seed-admin-code.mjs <usuario> <correo> [código]')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => /^[A-Z_]+=/.test(l))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
)
const secret = env.ADMIN_SESSION_SECRET ?? 'dev-only-change-admin-session-secret'
const name = username.toLowerCase()

mkdirSync('data', { recursive: true })
const file = 'data/admin-users.json'
const all = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
all[name] = {
  ...(all[name] ?? {}),
  username: name,
  email: all[name]?.email ?? null,
  passwordHash: all[name]?.passwordHash ?? null,
  pendingEmail: email,
  codeHash: createHmac('sha256', secret).update(`${name}:${code}`).digest('base64url'),
  codeExpiresAt: Date.now() + 10 * 60 * 1000,
  codeAttempts: 0,
}
writeFileSync(file, JSON.stringify(all, null, 2))
console.log(`Código ${code} listo para "${name}" (${email}). Caduca en 10 minutos.`)
