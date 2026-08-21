/**
 * patch-oferta-masajes-whyus.mjs
 *
 * Actualiza SOLO los pillars de la sección "¿Por qué elegirnos?" de la landing
 * /l/oferta-masajes en Supabase.
 *
 * - NO toca el contenido en inglés (content_en)
 * - NO toca SEO, SEM, ni ninguna otra sección
 * - Hace un backup del objeto actual en consola antes de guardar
 *
 * Uso: node scripts/patch-oferta-masajes-whyus.mjs
 */

import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Leer .env.local ────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const envText = await readFile(envPath, 'utf8')

function parseEnv(text) {
  const env = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    env[key] = val
  }
  return env
}

const env = parseEnv(envText)
const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/, '')
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

// ── 1. Obtener el registro actual ──────────────────────────────────────────────
console.log('🔍 Buscando la landing /l/oferta-masajes en Supabase...')

const getRes = await fetch(`${SUPABASE_URL}/rest/v1/landings?select=id,data`, {
  headers: HEADERS,
})

if (!getRes.ok) {
  console.error('❌ Error al leer la tabla landings:', getRes.status, await getRes.text())
  process.exit(1)
}

const rows = await getRes.json()
const target = rows.find(r => r.data?.path === '/l/oferta-masajes')

if (!target) {
  console.error('❌ No se encontró ninguna landing con path "/l/oferta-masajes"')
  console.log('Paths disponibles:', rows.map(r => r.data?.path))
  process.exit(1)
}

const { id, data: currentData } = target
console.log(`✅ Encontrada. ID: ${id}`)
console.log('\n📋 BACKUP — whyUs actual (antes del cambio):')
console.log(JSON.stringify(currentData.content?.whyUs, null, 2))

// ── 2. Definir los nuevos pillars ──────────────────────────────────────────────
const newPillars = [
  {
    icon: '',
    title: 'Formación Certificada',
    body: 'Cada terapeuta de Diamond Spa es cosmetóloga o masoterapeuta certificada, con formación técnica verificable. Trabajamos con protocolos profesionales en cada sesión, no con improvisación.',
  },
  {
    icon: '',
    title: 'Enfoque Terapéutico',
    body: 'Nuestro trabajo se centra en técnicas de relajación muscular y bienestar físico real — el mismo rigor que encontrarías en un spa de bienestar reconocido, aplicado a cada cita.',
  },
  {
    icon: '',
    title: 'Ambiente Profesional',
    body: 'Cabinas privadas pensadas para tu comodidad, con el mismo estándar de respeto y profesionalismo en cada sesión, sin excepción.',
  },
]

// ── 3. Construir el nuevo objeto data tocando SOLO whyUs.pillars ───────────────
const updatedData = {
  ...currentData,
  content: {
    ...currentData.content,
    whyUs: {
      ...currentData.content?.whyUs,
      pillars: newPillars,
    },
  },
  updatedAt: new Date().toISOString(),
}

console.log('\n🆕 Nuevos pillars que se van a guardar:')
console.log(JSON.stringify(updatedData.content.whyUs, null, 2))

// ── 4. Guardar en Supabase ─────────────────────────────────────────────────────
console.log('\n💾 Guardando en Supabase...')

const patchRes = await fetch(
  `${SUPABASE_URL}/rest/v1/landings?id=eq.${id}`,
  {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ data: updatedData }),
  }
)

if (!patchRes.ok) {
  console.error('❌ Error al actualizar:', patchRes.status, await patchRes.text())
  process.exit(1)
}

const result = await patchRes.json()
console.log('\n✅ ¡Guardado exitosamente!')
console.log('Registro actualizado:', result?.[0]?.id ?? id)
console.log('\n🔁 Recuerda hacer revalidate de la página o esperar el cache (revalidate = 3600s)')
