import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import type { BookingRecord } from '@/lib/booking-types'
import { kvCommand, kvConfigured, kvPipeline } from '@/lib/kv'
import { sbInsert, sbSelect, sbUpdate, supabaseConfigured } from '@/lib/supabase'

/**
 * Bookings persistence — backend picked by env, in order of preference:
 *
 *  1. Supabase Postgres table `bookings` (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *     set) — schema in supabase/migrations/0001_init.sql. Import existing data
 *     once with `node scripts/migrate-to-supabase.mjs`.
 *  2. A Redis list `bookings` in Vercel KV / Upstash (durable across deploys —
 *     Vercel's filesystem is ephemeral). Each entry is one JSON-encoded
 *     BookingRecord, appended in order.
 *  3. Local/dev fallback: data/bookings.json.
 *
 * When KV is configured, the legacy data/bookings.json is imported once so
 * previously recorded bookings are preserved (guarded by a `bookings:migrated`
 * flag in KV).
 */

const FILE = process.env.BOOKINGS_FILE ?? join(process.cwd(), 'data', 'bookings.json')
const LIST_KEY = 'bookings'
const MIGRATED_KEY = 'bookings:migrated'

// ─── JSON file backend (local / self-hosted) ────────────────────────────────────

async function readFileBookings(): Promise<BookingRecord[]> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return Array.isArray(data) ? (data as BookingRecord[]) : []
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return []
    throw e
  }
}

async function appendFileBooking(row: BookingRecord): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  const list = await readFileBookings()
  list.push(row)
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
}

// ─── Supabase backend ────────────────────────────────────────────────────────────
// Column names are snake_case in Postgres; BookingRecord stays camelCase in the app.

type BookingRow = {
  id: string
  created_at: string
  date_key: string
  time_slot: string
  scheduled_at: string
  service_id: string
  service_name: string
  duration_minutes: number | null
  hair_method: 'wax' | 'machine' | null
  price_cop: number
  price_usd: number
  duration: string
  name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string
  requests: string | null
  status: BookingRecord['status'] | null
  payment_status: BookingRecord['paymentStatus'] | null
  source: BookingRecord['source'] | null
}

function toRow(b: BookingRecord): BookingRow {
  return {
    id: b.id,
    created_at: b.createdAt,
    date_key: b.dateKey,
    time_slot: b.timeSlot,
    scheduled_at: b.scheduledAt,
    service_id: b.serviceId,
    service_name: b.serviceName,
    duration_minutes: b.durationMinutes,
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

function fromRow(r: BookingRow): BookingRecord {
  return {
    id: r.id,
    createdAt: r.created_at,
    dateKey: r.date_key,
    timeSlot: r.time_slot,
    scheduledAt: r.scheduled_at,
    serviceId: r.service_id,
    serviceName: r.service_name,
    durationMinutes: r.duration_minutes,
    ...(r.hair_method ? { hairMethod: r.hair_method } : {}),
    priceCop: Number(r.price_cop),
    price: Number(r.price_usd),
    duration: r.duration,
    ...(r.name ? { name: r.name } : {}),
    ...(r.first_name ? { firstName: r.first_name } : {}),
    ...(r.last_name ? { lastName: r.last_name } : {}),
    ...(r.email ? { email: r.email } : {}),
    phone: r.phone,
    ...(r.requests ? { requests: r.requests } : {}),
    ...(r.status ? { status: r.status } : {}),
    ...(r.payment_status ? { paymentStatus: r.payment_status } : {}),
    ...(r.source ? { source: r.source } : {}),
  }
}

// ─── KV helpers ──────────────────────────────────────────────────────────────────

function parseRows(raw: unknown): BookingRecord[] {
  if (!Array.isArray(raw)) return []
  const rows: BookingRecord[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      try {
        rows.push(JSON.parse(item) as BookingRecord)
      } catch {
        /* skip malformed entry */
      }
    } else if (item && typeof item === 'object') {
      rows.push(item as BookingRecord)
    }
  }
  return rows
}

let migrated = false
/** One-time import of the legacy JSON file into KV so earlier bookings aren't lost. */
async function ensureMigrated(): Promise<void> {
  if (migrated) return
  if (await kvCommand(['GET', MIGRATED_KEY])) {
    migrated = true
    return
  }
  const legacy = await readFileBookings()
  if (legacy.length > 0) {
    await kvPipeline(legacy.map(b => ['RPUSH', LIST_KEY, JSON.stringify(b)]))
  }
  await kvCommand(['SET', MIGRATED_KEY, '1'])
  migrated = true
}

// ─── Public API ─────────────────────────────────────────────────────────────────

export async function readBookings(): Promise<BookingRecord[]> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<BookingRow>('bookings', 'order=created_at.asc')
    return rows.map(fromRow)
  }
  if (kvConfigured()) {
    await ensureMigrated()
    return parseRows(await kvCommand(['LRANGE', LIST_KEY, 0, -1]))
  }
  return readFileBookings()
}

export async function appendBooking(
  input: Omit<BookingRecord, 'id' | 'createdAt'>,
): Promise<BookingRecord> {
  const row: BookingRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  if (supabaseConfigured()) {
    await sbInsert('bookings', toRow(row))
  } else if (kvConfigured()) {
    await ensureMigrated()
    await kvCommand(['RPUSH', LIST_KEY, JSON.stringify(row)])
  } else {
    await appendFileBooking(row)
  }
  return row
}

export async function updateBooking(id: string, payload: Partial<Pick<BookingRecord, 'status' | 'paymentStatus'>>): Promise<boolean> {
  if (supabaseConfigured()) {
    const patch: Partial<BookingRow> = {}
    if (payload.status !== undefined) patch.status = payload.status
    if (payload.paymentStatus !== undefined) patch.payment_status = payload.paymentStatus
    if (Object.keys(patch).length === 0) return true
    const updated = await sbUpdate('bookings', `id=eq.${id}`, patch)
    return updated.length > 0
  }
  if (kvConfigured()) {
    await ensureMigrated()
    const bookings = await readBookings()
    const idx = bookings.findIndex(b => b.id === id)
    if (idx === -1) return false
    bookings[idx] = { ...bookings[idx], ...payload }
    // KV doesn't have simple LSET for JSON objects natively without replacing entire string.
    // Easiest is to rewrite the list or use LSET if we know index.
    // LSET list index value
    await kvCommand(['LSET', LIST_KEY, idx.toString(), JSON.stringify(bookings[idx])])
    return true
  } else {
    const list = await readFileBookings()
    const b = list.find(x => x.id === id)
    if (!b) return false
    Object.assign(b, payload)
    await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
    return true
  }
}
