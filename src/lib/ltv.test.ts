/**
 * Pruebas del cálculo de LTV por cliente.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs --test src/lib/ltv.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { BookingRecord } from '@/lib/booking-types'
import { computeLtv, formatPhone, normalizePhone } from '@/lib/ltv'

let seq = 0
function booking(over: Partial<BookingRecord>): BookingRecord {
  seq += 1
  return {
    id: `b${seq}`,
    createdAt: '2026-08-01T10:00:00.000Z',
    dateKey: '2026-08-01',
    timeSlot: '10:00',
    scheduledAt: '2026-08-01T15:00:00.000Z',
    serviceId: 'relaxing',
    serviceName: 'Masaje Relajante',
    durationMinutes: 60,
    priceCop: 150000,
    price: 40,
    duration: '60 min',
    name: 'Carlos',
    phone: '3001234567',
    status: 'completed',
    paymentStatus: 'paid',
    ...over,
  }
}

test('normalizePhone: mismo número escrito distinto da la misma llave', () => {
  const variants = ['3001234567', '+57 300 123 4567', '57-300-123-4567', '(300) 123 4567', '0057 3001234567']
  for (const v of variants) assert.equal(normalizePhone(v), '573001234567', v)
})

test('normalizePhone: extranjero queda en dígitos y basura da vacío', () => {
  assert.equal(normalizePhone('+1 (305) 555-1234'), '13055551234')
  assert.equal(normalizePhone(''), '')
  assert.equal(normalizePhone('Sin teléfono'), '')
  assert.equal(normalizePhone('4441234'), '')
  assert.equal(normalizePhone(undefined), '')
})

test('formatPhone', () => {
  assert.equal(formatPhone('573001234567'), '+57 300 123 4567')
  assert.equal(formatPhone('13055551234'), '+13055551234')
  assert.equal(formatPhone(''), 'Sin teléfono')
})

test('sin reservas: todo en cero', () => {
  const r = computeLtv([])
  assert.equal(r.customers.length, 0)
  assert.equal(r.summary.clients, 0)
  assert.equal(r.summary.repeatRate, 0)
  assert.equal(r.summary.avgLtvCop, 0)
  assert.equal(r.summary.avgDaysBetween, null)
  assert.equal(r.quality.length, 0)
})

test('solo cuentan los servicios pagados (completed)', () => {
  const r = computeLtv([
    booking({ status: 'pending' }),
    booking({ status: 'contacted' }),
    booking({ status: 'arrived' }),
    booking({ status: 'cancelled' }),
    booking({ status: 'completed', priceCop: 200000 }),
  ])
  assert.equal(r.summary.clients, 1)
  assert.equal(r.customers[0].totalCop, 200000)
  assert.equal(r.customers[0].services, 1)
})

test('cliente que repite: suma, visitas y días entre visitas', () => {
  const r = computeLtv([
    booking({ phone: '3001234567', dateKey: '2026-08-01', priceCop: 150000 }),
    booking({ phone: '+57 300 123 4567', dateKey: '2026-08-31', priceCop: 180000 }),
    booking({ phone: '573001234567', dateKey: '2026-09-30', priceCop: 120000 }),
  ])
  assert.equal(r.customers.length, 1)
  const c = r.customers[0]
  assert.equal(c.visits, 3)
  assert.equal(c.isRepeat, true)
  assert.equal(c.totalCop, 450000)
  assert.equal(c.avgTicketCop, 150000)
  assert.equal(c.firstVisit, '2026-08-01')
  assert.equal(c.lastVisit, '2026-09-30')
  assert.equal(c.avgDaysBetween, 30)
  assert.equal(c.history[0].dateKey, '2026-09-30')
  assert.equal(r.summary.repeatClients, 1)
  assert.equal(r.summary.repeatRate, 1)
  assert.equal(r.summary.avgDaysBetween, 30)
})

test('dos servicios el mismo día son una visita, no un cliente que repite', () => {
  const r = computeLtv([
    booking({ dateKey: '2026-08-01', priceCop: 150000 }),
    booking({ dateKey: '2026-08-01', priceCop: 60000 }),
  ])
  const c = r.customers[0]
  assert.equal(c.visits, 1)
  assert.equal(c.services, 2)
  assert.equal(c.isRepeat, false)
  assert.equal(c.totalCop, 210000)
  assert.equal(c.avgDaysBetween, null)
  assert.equal(r.summary.repeatClients, 0)
})

test('resumen mezclando clientes de una vez y recurrentes', () => {
  const r = computeLtv([
    // Ana vuelve: 2 visitas, 300.000
    booking({ phone: '3110000001', name: 'Ana', dateKey: '2026-08-01', priceCop: 150000 }),
    booking({ phone: '3110000001', name: 'Ana', dateKey: '2026-08-21', priceCop: 150000 }),
    // Beto y Chucho vienen una vez: 100.000 y 200.000
    booking({ phone: '3110000002', name: 'Beto', priceCop: 100000 }),
    booking({ phone: '3110000003', name: 'Chucho', priceCop: 200000 }),
  ])
  const s = r.summary
  assert.equal(s.clients, 3)
  assert.equal(s.repeatClients, 1)
  assert.equal(Math.round(s.repeatRate * 1000), 333)
  assert.equal(s.totalCop, 600000)
  assert.equal(s.repeatCop, 300000)
  assert.equal(s.repeatShare, 0.5)
  assert.equal(s.avgLtvCop, 200000)
  assert.equal(s.avgLtvRepeatCop, 300000)
  assert.equal(s.avgLtvOneTimeCop, 150000)
  assert.equal(s.avgVisitsRepeat, 2)
  assert.equal(s.avgDaysBetween, 20)
  // Orden: mayor LTV primero (empate Ana/Chucho: más visitas primero)
  assert.deepEqual(r.customers.map(c => c.name), ['Ana', 'Chucho', 'Beto'])
})

test('calidad de datos: sin precio, precio en miles, sin teléfono, pago pendiente', () => {
  const r = computeLtv([
    booking({ id: 'a', priceCop: 0 }),
    booking({ id: 'b', phone: '3110000002', priceCop: 120 }),
    booking({ id: 'c', phone: '', priceCop: 150000 }),
    booking({ id: 'd', phone: '3110000004', paymentStatus: 'pending' }),
    booking({ id: 'e', phone: '3110000005' }), // limpio
    booking({ id: 'f', phone: '3110000006', status: 'cancelled', priceCop: 0 }), // no cuenta
  ])
  const byId = Object.fromEntries(r.quality.map(q => [q.id, q.issues]))
  assert.deepEqual(byId.a, ['sin_precio'])
  assert.deepEqual(byId.b, ['precio_sospechoso'])
  assert.deepEqual(byId.c, ['sin_telefono'])
  assert.deepEqual(byId.d, ['pago_pendiente'])
  assert.equal(byId.e, undefined)
  assert.equal(byId.f, undefined)
})

test('sin teléfono: no se asigna a un cliente pero el dinero se reporta aparte', () => {
  const r = computeLtv([
    booking({ phone: '', priceCop: 150000 }),
    booking({ phone: 'N/A', priceCop: 100000 }),
    booking({ phone: '3110000002', priceCop: 80000 }),
  ])
  assert.equal(r.summary.clients, 1)
  assert.equal(r.summary.unassignedCount, 2)
  assert.equal(r.summary.unassignedCop, 250000)
  assert.equal(r.summary.totalCop, 80000)
})

test('un servicio sin precio marca al cliente para revisión y no infla el ticket', () => {
  const r = computeLtv([
    booking({ dateKey: '2026-08-01', priceCop: 150000 }),
    booking({ dateKey: '2026-09-01', priceCop: 0 }),
  ])
  const c = r.customers[0]
  assert.equal(c.visits, 2)
  assert.equal(c.totalCop, 150000)
  assert.equal(c.avgTicketCop, 150000)
  assert.equal(c.needsReview, true)
})

test('el nombre prefiere uno real sobre "Lead WhatsApp"', () => {
  const r = computeLtv([
    booking({ name: 'Lead WhatsApp (Recepción Directa)', dateKey: '2026-09-01' }),
    booking({ name: 'Jorge Pérez', dateKey: '2026-08-01' }),
  ])
  assert.equal(r.customers[0].name, 'Jorge Pérez')
})

test('precio como texto numérico (viene así del PATCH) se lee bien', () => {
  const r = computeLtv([booking({ priceCop: '150000' as unknown as number })])
  assert.equal(r.customers[0].totalCop, 150000)
})
