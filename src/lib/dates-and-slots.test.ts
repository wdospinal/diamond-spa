/**
 * Bogotá dates, booking time slots and the chat calendar grid. Every booking
 * and cash entry is filed under a Bogotá day, so an off-by-one here moves money
 * and appointments to the wrong date.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bogotaDay, monthStart, shiftDay } from '@/lib/bogota'
import { parseTimeSlot } from '@/lib/parse-time-slot'
import { daySlots, fmtTime, monthCells } from '@/lib/chat-slots'

// ─── Bogotá day ──────────────────────────────────────────────────────────────

test('bogotaDay files late-evening UTC-5 moments under the local day', () => {
  // 8 PM in Bogotá on Oct 13 is already Oct 14 in UTC.
  assert.equal(bogotaDay(new Date('2026-10-14T01:00:00Z')), '2026-10-13')
  assert.equal(bogotaDay(new Date('2026-10-14T05:00:00Z')), '2026-10-14')
  // New Year's Eve across the year boundary.
  assert.equal(bogotaDay(new Date('2027-01-01T04:59:59Z')), '2026-12-31')
})

test('shiftDay crosses month, year and leap-day boundaries', () => {
  assert.equal(shiftDay('2026-10-31', 1), '2026-11-01')
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31')
  assert.equal(shiftDay('2028-02-28', 1), '2028-02-29')
  assert.equal(shiftDay('2027-02-28', 1), '2027-03-01')
  assert.equal(shiftDay('2026-03-15', -30), '2026-02-13')
  assert.equal(shiftDay('2026-03-15', 0), '2026-03-15')
})

test('monthStart', () => {
  assert.equal(monthStart('2026-10-13'), '2026-10-01')
  assert.equal(monthStart('2026-12-31'), '2026-12-01')
})

// ─── Time slots ──────────────────────────────────────────────────────────────

test('parseTimeSlot reads 12-hour slots into 24-hour time', () => {
  assert.deepEqual(parseTimeSlot('10:30 AM'), { h: 10, m: 30 })
  assert.deepEqual(parseTimeSlot('12:00 PM'), { h: 12, m: 0 })
  assert.deepEqual(parseTimeSlot('12:30 AM'), { h: 0, m: 30 })
  assert.deepEqual(parseTimeSlot('9:00 pm'), { h: 21, m: 0 })
  assert.deepEqual(parseTimeSlot('7:15PM'), { h: 19, m: 15 })
})

test('parseTimeSlot rejects anything that is not a slot', () => {
  for (const s of ['', 'Por confirmar', '10:00', '25:00', '10 AM', '10:0 AM', ' 10:00 AM', '10:00 AM ']) {
    // '25:00' has no AM/PM so it is rejected by the pattern, not by range.
    assert.equal(parseTimeSlot(s), null, JSON.stringify(s))
  }
})

test('fmtTime and parseTimeSlot round-trip every half hour of the day', () => {
  for (let t = 0; t < 24 * 60; t += 30) {
    const { h, m } = parseTimeSlot(fmtTime(t))!
    assert.equal(h * 60 + m, t, fmtTime(t))
  }
})

// ─── Chat calendar ───────────────────────────────────────────────────────────

// 2026-10-12 is a Monday, 2026-10-18 a Sunday (month index 9 = October).
test('weekday slots run 10:30 AM–9:30 PM every 30 min for sessions up to an hour', () => {
  const slots = daySlots(2026, 9, 12, 60)
  assert.equal(slots[0], '10:30 AM')
  assert.equal(slots.at(-1), '9:30 PM')
  assert.equal(slots.length, 23)
})

test('longer sessions get hourly slots', () => {
  const slots = daySlots(2026, 9, 12, 90)
  assert.equal(slots[0], '10:30 AM')
  assert.equal(slots[1], '11:30 AM')
  assert.equal(slots.length, 12)
})

test('Sunday closes earlier (last slot 6:30 PM)', () => {
  const slots = daySlots(2026, 9, 18, 60)
  assert.equal(slots[0], '10:30 AM')
  assert.equal(slots.at(-1), '6:30 PM')
})

test('every generated slot is accepted by the booking API parser', () => {
  for (const dur of [30, 60, 90]) {
    for (const s of daySlots(2026, 9, 12, dur)) assert.ok(parseTimeSlot(s), s)
  }
})

test('monthCells pads to whole weeks starting on Sunday', () => {
  // October 2026 starts on a Thursday (4 leading blanks) and has 31 days.
  const cells = monthCells(2026, 9)
  assert.equal(cells.length % 7, 0)
  assert.deepEqual(cells.slice(0, 5), [null, null, null, null, 1])
  assert.equal(cells.filter(c => c !== null).length, 31)

  // February 2027 starts on a Monday and has 28 days.
  const feb = monthCells(2027, 1)
  assert.equal(feb[0], null)
  assert.equal(feb[1], 1)
  assert.equal(feb.filter(c => c !== null).length, 28)
})
