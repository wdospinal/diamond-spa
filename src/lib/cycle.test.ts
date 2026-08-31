/**
 * Pruebas de los períodos contables.
 *
 *   yarn test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  cycleLabelFor,
  cycleRange,
  cycleRangeLabel,
  normalizeStartDay,
  shiftCycle,
} from '@/lib/cycle'

test('corte 25: agosto va del 25 de julio al 24 de agosto', () => {
  assert.deepEqual(cycleRange('2026-08', 25), { from: '2026-07-25', to: '2026-08-24' })
})

test('corte 25: el período cruza el cambio de año', () => {
  assert.deepEqual(cycleRange('2026-01', 25), { from: '2025-12-25', to: '2026-01-24' })
})

test('corte 1: el período es el mes natural', () => {
  assert.deepEqual(cycleRange('2026-08', 1), { from: '2026-08-01', to: '2026-08-31' })
  assert.deepEqual(cycleRange('2026-02', 1), { from: '2026-02-01', to: '2026-02-28' })
})

test('a qué período pertenece cada día, con corte 25', () => {
  // El día del corte ya cuenta para el período siguiente.
  assert.equal(cycleLabelFor('2026-07-24', 25), '2026-07')
  assert.equal(cycleLabelFor('2026-07-25', 25), '2026-08')
  assert.equal(cycleLabelFor('2026-08-24', 25), '2026-08')
  assert.equal(cycleLabelFor('2026-08-25', 25), '2026-09')
  // Fin de año.
  assert.equal(cycleLabelFor('2026-12-25', 25), '2027-01')
})

test('el rango y la pertenencia son coherentes entre sí', () => {
  // Todo día dentro del rango de un período debe mapear a ese período.
  for (const startDay of [1, 5, 15, 25, 28]) {
    for (const label of ['2026-01', '2026-02', '2026-08', '2026-12']) {
      const { from, to } = cycleRange(label, startDay)
      assert.equal(cycleLabelFor(from, startDay), label, `${label} corte ${startDay}: inicio`)
      assert.equal(cycleLabelFor(to, startDay), label, `${label} corte ${startDay}: fin`)
    }
  }
})

test('los períodos consecutivos no dejan huecos ni se solapan', () => {
  for (const startDay of [1, 25, 28]) {
    const a = cycleRange('2026-08', startDay)
    const b = cycleRange(shiftCycle('2026-08', 1), startDay)
    const diaSiguiente = new Date(`${a.to}T12:00:00Z`)
    diaSiguiente.setUTCDate(diaSiguiente.getUTCDate() + 1)
    assert.equal(b.from, diaSiguiente.toISOString().slice(0, 10), `corte ${startDay}`)
  }
})

test('el día de corte se recorta a un rango seguro', () => {
  // 29, 30 y 31 no existen en febrero: se recortan a 28.
  assert.equal(normalizeStartDay(31), 28)
  assert.equal(normalizeStartDay(0), 1)
  assert.equal(normalizeStartDay(-5), 1)
  assert.equal(normalizeStartDay('25'), 25)
  assert.equal(normalizeStartDay('no es un número'), 25)
  assert.equal(normalizeStartDay(undefined), 25)
})

test('la etiqueta del rango se lee sin ambigüedad', () => {
  assert.equal(cycleRangeLabel('2026-08', 25), '25 jul – 24 ago')
  assert.equal(cycleRangeLabel('2026-08', 1), '1 ago – 31 ago')
})
