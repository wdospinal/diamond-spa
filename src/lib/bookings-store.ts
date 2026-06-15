import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import type { BookingRecord } from '@/lib/booking-types'
import { kvCommand, kvConfigured, kvPipeline } from '@/lib/kv'

/**
 * Bookings persistence.
 *
 *  - Production: a Redis list `bookings` in Vercel KV / Upstash (durable across
 *    deploys — Vercel's filesystem is ephemeral, so the JSON file is not safe in
 *    production). Each entry is one JSON-encoded BookingRecord, appended in order.
 *  - Local/dev fallback: data/bookings.json (used when no KV env vars are set).
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
  if (kvConfigured()) {
    await ensureMigrated()
    await kvCommand(['RPUSH', LIST_KEY, JSON.stringify(row)])
  } else {
    await appendFileBooking(row)
  }
  return row
}
