/**
 * The customer booking flow, end to end through the real route handler, against
 * a throwaway JSON store. This is the one request that turns a visitor into a
 * customer, so the two-phase capture, dedup and validation are pinned here.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Route modules read their env at import time: point every backend at a temp
// file and switch off anything that would reach the network.
const dir = mkdtempSync(join(tmpdir(), 'diamond-bookings-'))
process.env.BOOKINGS_FILE = join(dir, 'bookings.json')
process.env.PUSH_FILE = join(dir, 'push.json')
for (const k of [
  'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN',
  'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'NEXT_PUBLIC_COP_PER_USD', 'COP_PER_USD',
]) delete process.env[k]

// Silence the "SMS not sent — Twilio env vars missing" notice for each booking.
const quiet = console.log
console.log = (...a: unknown[]) => { if (!String(a[0]).includes('SMS not sent')) quiet(...a) }

const { POST } = await import('@/app/api/bookings/route')
const { NextRequest } = await import('next/server')
const { sortBookingsForAdmin, bookingDisplayName } = await import('@/lib/booking-types')
type BookingRecord = import('@/lib/booking-types').BookingRecord

after(() => rmSync(dir, { recursive: true, force: true }))

let ipCounter = 0
/** Each call gets its own IP unless one is given, so the 5-per-10-min limit only bites where tested. */
function book(body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return POST(new NextRequest('https://diamondspa.com.co/api/bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
}

function stored(): BookingRecord[] {
  return JSON.parse(readFileSync(process.env.BOOKINGS_FILE!, 'utf8'))
}

let phoneCounter = 3000000000
const phone = () => `+57 ${++phoneCounter}`

const FULL = { serviceId: 'relaxing', durationMinutes: 60, name: 'Ana Gómez', year: 2030, monthIndex: 0, day: 5, timeSlot: '10:00 AM' }

// ─── Happy paths ─────────────────────────────────────────────────────────────

test('a complete booking is stored with the list price and a Bogotá timestamp', async () => {
  const p = phone()
  const res = await book({ ...FULL, phone: p, email: ' ana@example.com ', requests: ' Presión suave ', locale: 'es' })
  assert.equal(res.status, 200)
  const { ok, id } = await res.json()
  assert.equal(ok, true)

  const row = stored().find(b => b.id === id)!
  assert.equal(row.dateKey, '2030-01-05')
  assert.equal(row.timeSlot, '10:00 AM')
  assert.equal(row.scheduledAt, '2030-01-05T15:00:00.000Z', '10 AM in Bogotá is 15:00 UTC')
  assert.equal(row.serviceName, 'Relajante')
  assert.equal(row.priceCop, 200_000)
  assert.equal(row.price, 200_000 / 4100, 'USD at the default rate')
  assert.equal(row.duration, '60 min')
  assert.equal(row.email, 'ana@example.com')
  assert.equal(row.requests, 'Presión suave')
  assert.equal(row.status, 'pending')
  assert.equal(row.paymentStatus, 'pending')
  assert.equal(row.source, 'organic')
  assert.ok(row.createdAt)
})

test('English bookings store the English service name', async () => {
  const res = await book({ ...FULL, phone: phone(), locale: 'en' })
  const { id } = await res.json()
  assert.equal(stored().find(b => b.id === id)!.serviceName, 'Relaxing massage')
})

test('Google Ads attribution is stored for ads traffic', async () => {
  const { id } = await (await book({ ...FULL, phone: phone(), source: 'ads', gclid: 'Cj0KCQ', adgroup: 'masajes-hombres' })).json()
  const row = stored().find(b => b.id === id)!
  assert.equal(row.source, 'ads')
  assert.equal(row.gclid, 'Cj0KCQ')
  assert.equal(row.adgroup, 'masajes-hombres')
})

test('unknown sources fall back to organic and empty attribution is not stored', async () => {
  const { id } = await (await book({ ...FULL, phone: phone(), source: 'weird', gclid: '' })).json()
  const row = stored().find(b => b.id === id)!
  assert.equal(row.source, 'organic')
  assert.equal('gclid' in row, false)
  assert.equal('adgroup' in row, false)
})

test('two-phase capture: the lead is created without a slot, then completed in place', async () => {
  const p = phone()
  const lead = await (await book({ serviceId: 'relaxing', durationMinutes: 90, name: 'Luis', phone: p })).json()
  let row = stored().find(b => b.id === lead.id)!
  assert.equal(row.timeSlot, 'Por confirmar')

  const done = await (await book({ ...FULL, durationMinutes: 90, phone: p, id: lead.id, timeSlot: '4:00 PM' })).json()
  assert.equal(done.id, lead.id, 'phase 2 updates the same row')
  const rows = stored().filter(b => b.phone === p)
  assert.equal(rows.length, 1, 'no duplicate row')
  row = rows[0]
  assert.equal(row.timeSlot, '4:00 PM')
  assert.equal(row.scheduledAt, '2030-01-05T21:00:00.000Z')
})

test('a double tap on "Continue" reuses the lead created seconds before', async () => {
  const p = phone()
  const a = await (await book({ serviceId: 'relaxing', durationMinutes: 60, name: 'Sara', phone: p })).json()
  const b = await (await book({ serviceId: 'relaxing', durationMinutes: 60, name: 'Sara', phone: p })).json()
  assert.equal(b.id, a.id)
  assert.equal(b.deduped, true)
  assert.equal(stored().filter(r => r.phone === p).length, 1)
})

test('phase 2 with an unknown id still saves the booking instead of losing it', async () => {
  const p = phone()
  const res = await book({ ...FULL, phone: p, id: 'no-such-id' })
  assert.equal(res.status, 200)
  assert.equal(stored().filter(r => r.phone === p).length, 1)
})

test('hair removal is priced by method and legacy first/last names are joined', async () => {
  const wax = await (await book({ serviceId: 'depilacion-axila', hairMethod: 'wax', firstName: 'Ana', lastName: 'Ruiz', phone: phone() })).json()
  const row = stored().find(b => b.id === wax.id)!
  assert.equal(row.hairMethod, 'wax')
  assert.equal(row.duration, 'wax')
  assert.equal(row.durationMinutes, null)
  assert.equal(row.name, 'Ana Ruiz')
  assert.ok(row.priceCop > 0)
})

// ─── Validation ──────────────────────────────────────────────────────────────

test('rejects requests the form can never produce', async () => {
  const cases: [unknown, string][] = [
    ['{not json', 'Invalid JSON'],
    [{ ...FULL, phone: phone(), serviceId: 'nope' }, 'Invalid service'],
    [{ ...FULL, phone: phone(), durationMinutes: 45 }, 'Invalid duration — must be 30, 60, or 90'],
    [{ ...FULL, phone: phone(), durationMinutes: undefined }, 'Invalid duration — must be 30, 60, or 90'],
    [{ serviceId: 'depilacion-axila', name: 'A', phone: phone() }, 'Invalid service/duration combination'],
    [{ ...FULL, phone: '' }, 'Missing contact fields'],
    [{ ...FULL, name: '  ', phone: phone() }, 'Missing contact fields'],
    [{ ...FULL, phone: phone(), year: 1999 }, 'Invalid year'],
    [{ ...FULL, phone: phone(), monthIndex: 12 }, 'Invalid month'],
    [{ ...FULL, phone: phone(), day: 0 }, 'Invalid day'],
    [{ ...FULL, phone: phone(), day: 32 }, 'Invalid day'],
    [{ ...FULL, phone: phone(), timeSlot: '25:00' }, 'Invalid time'],
  ]
  const before = stored().length
  for (const [body, error] of cases) {
    const res = await book(body)
    assert.equal(res.status, 400, JSON.stringify(body))
    assert.deepEqual(await res.json(), { error }, JSON.stringify(body))
  }
  assert.equal(stored().length, before, 'nothing is written for a rejected request')
})

test('one client can book at most 5 times per 10 minutes', async () => {
  const ip = '203.0.113.50'
  const statuses = []
  for (let i = 0; i < 6; i++) statuses.push((await book({ ...FULL, phone: phone() }, ip)).status)
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429])
  const blocked = await book({ ...FULL, phone: phone() }, ip)
  assert.ok(Number(blocked.headers.get('Retry-After')) >= 1)
})

// ─── Admin list order ────────────────────────────────────────────────────────

test('admin list: newest day first, and within a day the latest time first (by clock, not text)', () => {
  const at = (dateKey: string, timeSlot: string) => ({ id: `${dateKey} ${timeSlot}`, dateKey, timeSlot }) as BookingRecord
  const sorted = sortBookingsForAdmin([
    at('2026-10-13', '9:00 AM'),
    at('2026-10-13', '2:00 PM'),
    at('2026-10-14', '10:30 AM'),
    at('2026-10-13', '10:00 AM'),
    at('2026-10-13', '12:00 PM'),
    at('2026-10-13', 'Por confirmar'),
  ]).map(b => b.id)
  assert.deepEqual(sorted, [
    '2026-10-14 10:30 AM',
    '2026-10-13 Por confirmar', // unconfirmed leads stay on top of their day
    '2026-10-13 2:00 PM',
    '2026-10-13 12:00 PM',
    '2026-10-13 10:00 AM',
    '2026-10-13 9:00 AM',
  ])
})

test('bookingDisplayName prefers the single name field and never returns blank', () => {
  assert.equal(bookingDisplayName({ name: ' Ana ' } as BookingRecord), 'Ana')
  assert.equal(bookingDisplayName({ name: '', firstName: 'Ana', lastName: 'Ruiz' } as BookingRecord), 'Ana Ruiz')
  assert.equal(bookingDisplayName({} as BookingRecord), 'Desconocido')
  assert.equal(bookingDisplayName(null), 'Desconocido')
})
