/**
 * One-time import of existing data into Supabase.
 *
 * Sources (merged, deduped by id/endpoint):
 *   - Local JSON files in data/ (bookings.json, posts.json, landings.json, push-subs.json)
 *   - Vercel KV / Upstash, when KV_REST_API_* / UPSTASH_REDIS_REST_* are set
 *     (this is where production data lives today)
 *
 * Prerequisites:
 *   1. Run supabase/migrations/0001_init.sql in the Supabase SQL editor.
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Usage:  node scripts/migrate-to-supabase.mjs
 *
 * Safe to re-run: everything is upserted on the primary key.
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

const ROOT = process.cwd()

// ─── Load .env.local (no dotenv dependency) ──────────────────────────────────

try {
  const env = await readFile(join(ROOT, '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
} catch {
  /* no .env.local — rely on the shell env */
}

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).')
  process.exit(1)
}

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function readJsonFile(name) {
  try {
    const data = JSON.parse(await readFile(join(ROOT, 'data', name), 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function readKvList(key) {
  if (!KV_URL || !KV_TOKEN) return []
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['LRANGE', key, 0, -1]),
  })
  if (!res.ok) throw new Error(`KV LRANGE ${key} failed: ${res.status} ${await res.text()}`)
  const { result } = await res.json()
  if (!Array.isArray(result)) return []
  const rows = []
  for (const item of result) {
    if (typeof item === 'string') {
      try { rows.push(JSON.parse(item)) } catch { /* skip malformed */ }
    } else if (item && typeof item === 'object') {
      rows.push(item)
    }
  }
  return rows
}

/** File + KV merged, later sources win, deduped by `keyField`. */
async function collect(fileName, kvKey, keyField) {
  const merged = new Map()
  for (const row of [...await readJsonFile(fileName), ...await readKvList(kvKey)]) {
    if (row && row[keyField]) merged.set(row[keyField], row)
  }
  return [...merged.values()]
}

async function upsert(table, rows) {
  if (rows.length === 0) {
    console.log(`  ${table}: nothing to import`)
    return
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`Upsert into ${table} failed: ${res.status} ${await res.text()}`)
  console.log(`  ${table}: upserted ${rows.length} row(s)`)
}

// ─── Bookings (camelCase record → snake_case columns) ───────────────────────

function bookingToRow(b) {
  return {
    id: b.id,
    created_at: b.createdAt,
    date_key: b.dateKey,
    time_slot: b.timeSlot,
    scheduled_at: b.scheduledAt,
    service_id: b.serviceId,
    service_name: b.serviceName,
    duration_minutes: b.durationMinutes ?? null,
    hair_method: b.hairMethod ?? null,
    price_cop: b.priceCop,
    price_usd: b.price,
    duration: b.duration,
    name: b.name ?? null,
    first_name: b.firstName ?? null,
    last_name: b.lastName ?? null,
    email: b.email ?? null,
    phone: b.phone,
    requests: b.requests ?? null,
    status: b.status ?? null,
    payment_status: b.paymentStatus ?? null,
    source: b.source ?? null,
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log(`Importing into ${SUPABASE_URL} (KV source: ${KV_URL ? 'yes' : 'no'})…`)

const bookings = await collect('bookings.json', 'bookings', 'id')
await upsert('bookings', bookings.map(bookingToRow))

const posts = await collect('posts.json', 'blog:posts', 'id')
await upsert('blog_posts', posts.map(p => ({ id: p.id, data: p })))

const landings = await collect('landings.json', 'landings:pages', 'id')
await upsert('landings', landings.map(p => ({ id: p.id, data: p })))

const subs = await collect('push-subs.json', 'push_subscriptions', 'endpoint')
await upsert('push_subscriptions', subs.map(s => ({ endpoint: s.endpoint, data: s })))

console.log('Done.')
