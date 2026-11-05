/**
 * Pruebas de la hora de conversión del feed de Google Ads.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs --test src/lib/ads-feed-time.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import {
  ADS_FEED_TIME_FIX_FROM,
  convertedConversionTime,
  feedConversionTimes,
  formatConversionTimeBogota,
  qualifiedConversionTime,
} from '@/lib/ads-feed-time'

const NOW = new Date('2026-11-10T12:00:00.000Z')

test('cita de las 4:00 PM en Medellín sale como 16:00 -0500 (no 21:00)', () => {
  assert.equal(
    formatConversionTimeBogota('2026-10-29T21:00:00.000Z', NOW),
    '2026-10-29 16:00:00 -0500',
  )
})

test('cruza la medianoche UTC sin cambiar el día de Bogotá de más', () => {
  // 03:30:15 UTC del 2 de noviembre = 10:30:15 PM del 1 de noviembre en Bogotá.
  assert.equal(
    formatConversionTimeBogota('2026-11-02T03:30:15.000Z', NOW),
    '2026-11-01 22:30:15 -0500',
  )
})

test('cruza el año correctamente', () => {
  assert.equal(
    formatConversionTimeBogota('2027-01-01T02:00:00.000Z', new Date('2027-02-01T00:00:00.000Z')),
    '2026-12-31 21:00:00 -0500',
  )
})

test('acepta el formato con offset explícito que usa /api/bookings', () => {
  assert.equal(
    formatConversionTimeBogota('2026-10-29T16:00:00-05:00', NOW),
    '2026-10-29 16:00:00 -0500',
  )
})

test('fecha inválida devuelve cadena vacía', () => {
  assert.equal(formatConversionTimeBogota('no-es-una-fecha', NOW), '')
  assert.equal(formatConversionTimeBogota('', NOW), '')
})

test('una hora futura se recorta a "ahora" (Google rechaza fechas futuras)', () => {
  assert.equal(
    formatConversionTimeBogota('2026-11-20T21:00:00.000Z', NOW),
    '2026-11-10 07:00:00 -0500',
  )
})

test('no depende de la zona horaria del servidor', () => {
  const original = process.env.TZ
  const iso = '2026-10-29T21:00:00.000Z'
  try {
    for (const tz of ['UTC', 'America/Bogota', 'Asia/Tokyo', 'Pacific/Auckland', 'America/New_York']) {
      process.env.TZ = tz
      assert.equal(formatConversionTimeBogota(iso, NOW), '2026-10-29 16:00:00 -0500', `TZ=${tz}`)
    }
  } finally {
    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  }
})

// ─── Qué hora se manda en cada etapa ────────────────────────────────────────

const BOOKING = {
  createdAt: '2026-10-29T15:00:00.000Z', // reserva creada 10:00 AM Bogotá
  scheduledAt: '2026-10-30T21:00:00.000Z', // cita al día siguiente 4:00 PM Bogotá
}

test('calificado se manda con la hora de creación de la reserva, no la de la cita', () => {
  assert.equal(qualifiedConversionTime(BOOKING, NOW), '2026-10-29 10:00:00 -0500')
})

test('calificado cae a la hora de la cita si no hay hora de creación', () => {
  assert.equal(
    qualifiedConversionTime({ scheduledAt: BOOKING.scheduledAt }, NOW),
    '2026-10-30 16:00:00 -0500',
  )
})

test('confirmada se manda con la hora de la cita', () => {
  assert.equal(convertedConversionTime(BOOKING, NOW), '2026-10-30 16:00:00 -0500')
})

test('confirmada nunca es anterior a la creación de la reserva (cita anotada a posteriori)', () => {
  assert.equal(
    convertedConversionTime(
      { createdAt: '2026-10-29T23:00:00.000Z', scheduledAt: '2026-10-29T20:00:00.000Z' },
      NOW,
    ),
    '2026-10-29 18:00:00 -0500',
  )
})

test('confirmada usa lo que haya si falta una de las dos horas', () => {
  assert.equal(
    convertedConversionTime({ scheduledAt: BOOKING.scheduledAt }, NOW),
    '2026-10-30 16:00:00 -0500',
  )
  assert.equal(
    convertedConversionTime({ createdAt: BOOKING.createdAt }, NOW),
    '2026-10-29 10:00:00 -0500',
  )
  assert.equal(convertedConversionTime({}, NOW), '')
  assert.equal(convertedConversionTime({ createdAt: 'x', scheduledAt: 'y' }, NOW), '')
})

test('ninguna etapa manda una hora futura', () => {
  const futura = { createdAt: '2026-11-09T12:00:00.000Z', scheduledAt: '2026-11-20T21:00:00.000Z' }
  assert.equal(convertedConversionTime(futura, NOW), '2026-11-10 07:00:00 -0500')
  assert.equal(qualifiedConversionTime(futura, NOW), '2026-11-09 07:00:00 -0500')
})

// ─── Reservas ya importadas: nada cambia byte a byte ────────────────────────

/** La función ANTERIOR del feed, ejecutada en un proceso con el servidor en UTC (como Vercel). */
function oldFeedTimes(isos: string[]): string[] {
  const script = `
    const isos = JSON.parse(process.argv[1])
    const pad = (n) => String(n).padStart(2, '0')
    function formatConversionTime(isoDate) {
      const d = new Date(isoDate)
      if (isNaN(d.getTime())) return ''
      return (
        d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' -0500'
      )
    }
    console.log(JSON.stringify(isos.map(formatConversionTime)))
  `
  const out = execFileSync(process.execPath, ['-e', script, JSON.stringify(isos)], {
    env: { ...process.env, TZ: 'UTC' },
    encoding: 'utf8',
  })
  return JSON.parse(out)
}

const BEFORE_CUTOFF = '2026-10-01T00:00:00.000Z'

test('reservas anteriores al corte: ambas etapas salen idénticas a la función anterior (servidor UTC)', () => {
  // 400 pares (creación, cita) repartidos de julio a noviembre de 2026.
  const start = Date.parse('2026-07-01T00:00:00.000Z')
  const span = Date.parse('2026-11-05T15:00:00.000Z') - start
  const bookings = Array.from({ length: 400 }, (_, i) => {
    const created = new Date(start + ((i * 7919 * 3600_000) % span))
    const scheduled = new Date(created.getTime() + ((i * 104729) % (10 * 24 * 3600_000)) - 3 * 24 * 3600_000)
    return { createdAt: created.toISOString(), scheduledAt: scheduled.toISOString() }
  })
  const expected = oldFeedTimes(bookings.map((b) => b.scheduledAt || b.createdAt))
  const now = new Date('2026-11-05T14:00:00.000Z')
  bookings.forEach((b, i) => {
    const got = feedConversionTimes(b, now)
    assert.equal(got.converted, expected[i], `confirmada #${i}`)
    assert.equal(got.qualified, expected[i], `calificado #${i}`)
  })
})

test('reserva antigua con cita en el futuro: no se recorta (igual que antes)', () => {
  const b = { createdAt: BEFORE_CUTOFF, scheduledAt: '2027-03-01T21:00:00.000Z' }
  const got = feedConversionTimes(b, NOW)
  assert.equal(got.converted, oldFeedTimes([b.scheduledAt])[0])
  assert.equal(got.converted, '2027-03-01 21:00:00 -0500')
})

test('reserva antigua sin cita usa la creación; sin ninguna fecha, cadena vacía (igual que antes)', () => {
  assert.equal(feedConversionTimes({ createdAt: BEFORE_CUTOFF }, NOW).converted, oldFeedTimes([BEFORE_CUTOFF])[0])
  assert.equal(feedConversionTimes({}, NOW).converted, '')
  assert.equal(feedConversionTimes({ createdAt: BEFORE_CUTOFF, scheduledAt: 'x' }, NOW).converted, '')
})

test('reserva sin fecha de creación se trata como antigua (no se puede demostrar nueva)', () => {
  const got = feedConversionTimes({ scheduledAt: '2026-10-29T21:00:00.000Z' }, NOW)
  assert.equal(got.converted, '2026-10-29 21:00:00 -0500')
  assert.equal(got.qualified, '2026-10-29 21:00:00 -0500')
})

test('el corte es exacto: 1 ms antes = formato anterior, en el instante = hora de Bogotá', () => {
  const cut = Date.parse(ADS_FEED_TIME_FIX_FROM)
  const now = new Date(cut + 7 * 24 * 3600_000)
  const sched = new Date(cut + 24 * 3600_000).toISOString()
  const before = feedConversionTimes({ createdAt: new Date(cut - 1).toISOString(), scheduledAt: sched }, now)
  const at = feedConversionTimes({ createdAt: new Date(cut).toISOString(), scheduledAt: sched }, now)
  // antes: la misma cadena para ambas etapas, en UTC con etiqueta -0500
  assert.equal(before.qualified, before.converted)
  assert.equal(before.converted, oldFeedTimes([sched])[0])
  // en el corte: etapas distintas y en hora de Bogotá
  assert.equal(at.qualified, '2026-11-05 10:45:00 -0500')
  assert.equal(at.converted, formatConversionTimeBogota(sched, now))
  assert.notEqual(at.converted, before.converted)
})

test('reserva nueva: calificado = creación, confirmada = cita, en hora de Bogotá', () => {
  const created = new Date(Date.parse(ADS_FEED_TIME_FIX_FROM) + 3600_000).toISOString() // 11:45 AM Bogotá
  const scheduled = new Date(Date.parse(created) + 26 * 3600_000).toISOString()
  const now = new Date(Date.parse(scheduled) + 3600_000)
  const got = feedConversionTimes({ createdAt: created, scheduledAt: scheduled }, now)
  assert.equal(got.qualified, '2026-11-05 11:45:00 -0500')
  assert.equal(got.converted, '2026-11-06 13:45:00 -0500')
})