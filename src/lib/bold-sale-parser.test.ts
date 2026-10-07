import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseBoldSale } from '@/lib/bold-sale-parser'

// Texto tal como lo deja parseMessage() a partir de un correo real.
const REAL = `  Pagos   Transacción aprobada    COP  $ 233.200  Diamond spa 2026/10/04 20:03:26

Carrera 43c # 10 - 42, Medellín. 3052263648 admin@diamondspa.com.co

MID 19904887 Terminal 9L00W462 ID Transacción Bold CPH037KMBI6H

Código de autorización 214267 AID A0000000031010 App label Visa Prepaid Metodo de cobro    Datáfono   Medio de pago                ***0634 Cuotas 1 Cuenta Crédito Firma

Subtotal $ 233.200    $  Propina $ 0 Total COP $ 233.200

 Total  $ 233.200
Pago sin contacto`

test('parses a real Bold purchase email', () => {
  const sale = parseBoldSale(REAL, { messageId: '<abc@bold.co>', receivedAt: new Date('2026-10-05T01:06:34Z') })
  assert.ok(sale)
  assert.equal(sale.id, 'CPH037KMBI6H')
  assert.equal(sale.day, '2026-10-04')
  assert.equal(sale.occurredAt, '2026-10-05T01:03:26.000Z')
  assert.equal(sale.subtotalCop, 233_200)
  assert.equal(sale.tipCop, 0)
  assert.equal(sale.totalCop, 233_200)
  assert.equal(sale.cardLabel, 'Visa Prepaid')
  assert.equal(sale.last4, '0634')
  assert.equal(sale.messageId, '<abc@bold.co>')
})

test('parses the pasted Gmail layout with a tip', () => {
  const text = `Transacción aprobada
COP $ 358.000
Diamond spa
2026/10/06 21:58:04
ID Transacción Bold\tCPE2HPGI16CH
App label\tMastercard
Metodo de cobro\tDatáfono
Medio de pago\tMastercard ***6350
Subtotal\t$ 348.000
Propina\t$ 10.000
Total\t$ 358.000`
  const sale = parseBoldSale(text)
  assert.ok(sale)
  assert.equal(sale.id, 'CPE2HPGI16CH')
  assert.equal(sale.day, '2026-10-06')
  assert.equal(sale.subtotalCop, 348_000)
  assert.equal(sale.tipCop, 10_000)
  assert.equal(sale.totalCop, 358_000)
  assert.equal(sale.cardLabel, 'Mastercard')
  assert.equal(sale.last4, '6350')
})

test('a purchase just before midnight UTC stays on the Bogotá day', () => {
  const sale = parseBoldSale(REAL.replace('2026/10/04 20:03:26', '2026/10/04 23:59:00'))
  assert.equal(sale?.day, '2026-10-04')
})

test('ignores Bold closing emails and unrelated text', () => {
  assert.equal(parseBoldSale('¡Tienes un nuevo cierre de ventas! Ventas exitosas: $127.200 Desde 19 de agosto'), null)
  assert.equal(parseBoldSale(''), null)
})
