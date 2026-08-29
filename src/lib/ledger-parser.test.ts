/**
 * Pruebas del parser contra los mensajes REALES del grupo.
 *
 * El fixture `__fixtures__/whatsapp-chat.txt` es el export literal del chat, sin
 * editar: si mañana el equipo empieza a escribir distinto, se pega el export
 * nuevo y estas pruebas dicen qué dejó de reconocerse.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs \
 *        --test src/lib/ledger-parser.test.ts
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { parseLedgerText, normalize } from '@/lib/ledger-parser'

/** Quita el prefijo «[fecha, hora] Autor:» y el marcador de adjunto del export. */
function captions(): string[] {
  const raw = readFileSync(join(import.meta.dirname, '__fixtures__', 'whatsapp-chat.txt'), 'utf8')
  return raw
    .split('\n')
    .map(l => l.replace(/^\[[^\]]+\]\s*[^:]+:\s*/, ''))
    .map(l => l.replace(/<image omitted>/gi, '').replace(/\[Forwarded\]/gi, '').trim())
    .filter(Boolean)
}

test('normalize quita tildes y colapsa espacios', () => {
  assert.equal(normalize('  Depilación   CUERPO Completo '), 'depilacion cuerpo completo')
  assert.equal(normalize('Angélica'), 'angelica')
})

test('ingresos con monto en el texto', () => {
  const e = parseLedgerText('220.000 masaje sensitivo 1 hora Ana')
  assert.equal(e.kind, 'income')
  assert.equal(e.categoryId, 'service')
  assert.equal(e.amountCop, 220_000)
  assert.equal(e.amountSource, 'text')
  assert.equal(e.serviceId, 'sensitive')
  assert.equal(e.durationMinutes, 60)
  assert.equal(e.therapist, 'Ana Maria')
  assert.equal(e.confidence, 'high')
})

test('la duración no se confunde con el monto', () => {
  const e = parseLedgerText('Relajante 90min')
  assert.equal(e.durationMinutes, 90)
  // 260.000 es el precio de catálogo, solo una sugerencia: confianza baja.
  assert.equal(e.amountSource, 'catalog')
  assert.equal(e.confidence, 'low')
})

test('«Relajante 30 minutos Sary 120.000» saca duración, terapeuta y monto', () => {
  const e = parseLedgerText('Relajante 30 minutos Sary 120.000')
  assert.equal(e.durationMinutes, 30)
  assert.equal(e.therapist, 'Sary Paez')
  assert.equal(e.amountCop, 120_000)
  assert.equal(e.amountSource, 'text')
})

test('cantidad: «4 relajantes 1 hora»', () => {
  const e = parseLedgerText('4 relajantes 1 hora')
  assert.equal(e.quantity, 4)
  assert.equal(e.durationMinutes, 60)
  assert.equal(e.serviceId, 'relaxing')
  // 4 × $200.000 de catálogo.
  assert.equal(e.amountCop, 800_000)
})

test('TRAMPA: comisión a la terapeuta es egreso aunque nombre un servicio', () => {
  const a = parseLedgerText('Pago 20% masaje relajante Angelica')
  assert.equal(a.kind, 'expense')
  assert.equal(a.categoryId, 'commission')
  assert.equal(a.therapist, 'Angélica')

  const b = parseLedgerText('Pago porcentaje Nicol masaje piedras calientes 90 minutos')
  assert.equal(b.kind, 'expense')
  assert.equal(b.categoryId, 'commission')

  const c = parseLedgerText('Pago comisión envolvente premium Daniela')
  assert.equal(c.kind, 'expense')
  assert.equal(c.categoryId, 'commission')
})

test('TRAMPA: «Pago servicios Diamond spa» es ingreso, no egreso', () => {
  const e = parseLedgerText('Pago servicios Diamond spa')
  assert.equal(e.kind, 'income')
})

test('la propina que recibe el spa es ingreso; la que se paga, egreso', () => {
  const recibida = parseLedgerText('Depilación cuerpo completo Dani 50 tip')
  assert.equal(recibida.kind, 'income')
  assert.equal(recibida.serviceId, 'depilacion-cuerpo-completo')

  const pagada = parseLedgerText('Pago 50k tip Daniela')
  assert.equal(pagada.kind, 'expense')
  assert.equal(pagada.categoryId, 'commission')
  assert.equal(pagada.amountCop, 50_000)
})

test('egresos por categoría', () => {
  const casos: [string, string][] = [
    ['Arriendo del spa', 'rent'],
    ['Pago ads meta 20 dias', 'marketing'],
    ['Abono a publicidad Google coper', 'marketing'],
    ['Pago 1.500.000 publicidad', 'marketing'],
    ['Internet', 'utilities'],
    ['Compra insumos aseo D1', 'supplies'],
    ['Abono tablet 220.000', 'equipment'],
    ['Pago almuerzo spa', 'food'],
    ['Pago Sary', 'payroll'],
    ['Pago Daniela', 'payroll'],
    ['Restante de pago Sarira', 'payroll'],
  ]
  for (const [texto, categoria] of casos) {
    const e = parseLedgerText(texto)
    assert.equal(e.kind, 'expense', `«${texto}» debería ser egreso`)
    assert.equal(e.categoryId, categoria, `«${texto}» → ${categoria}`)
  }
})

test('montos en distintos formatos', () => {
  assert.equal(parseLedgerText('329.500').amountCop, 329_500)
  assert.equal(parseLedgerText('Pago 1.500.000 publicidad').amountCop, 1_500_000)
  assert.equal(parseLedgerText('469.283 Tablet deberia llegar el sabado').amountCop, 469_283)
  assert.equal(parseLedgerText('Los otros 20k llegaron pero no se los tomó foto 💎').amountCop, 20_000)
  assert.equal(parseLedgerText('450.000 envolvente premium Daniela').amountCop, 450_000)
})

test('servicios que no están en el catálogo se reconocen igual', () => {
  const e = parseLedgerText('450.000 envolvente premium Daniela')
  assert.equal(e.kind, 'income')
  assert.equal(e.serviceId, null, 'no existe en services.ts')
  assert.equal(e.serviceLabel, 'Envolvente premium')

  assert.equal(parseLedgerText('Mixto 1 hr').serviceLabel, 'Mixto')
  assert.equal(parseLedgerText('Sublime y dm cuerpo completo').kind, 'income')
})

test('lo que no se entiende queda en null, no inventa', () => {
  const e = parseLedgerText('Esto de que')
  assert.equal(e.kind, null)
  assert.equal(e.amountCop, null)
  assert.equal(e.confidence, 'low')
})

test('ninguna línea real del chat rompe el parser', () => {
  const lineas = captions()
  assert.ok(lineas.length >= 30, `el fixture trae ${lineas.length} líneas`)
  for (const linea of lineas) {
    assert.doesNotThrow(() => parseLedgerText(linea), `rompió con: ${linea}`)
  }
})

test('cobertura sobre el chat real: la mayoría queda clasificada', () => {
  const lineas = captions()
  const clasificadas = lineas.filter(l => parseLedgerText(l).kind !== null)
  const cobertura = clasificadas.length / lineas.length
  // Referencia de hoy: 30/31. Si baja de 0.8 es que se rompió una regla.
  assert.ok(cobertura >= 0.8, `cobertura ${(cobertura * 100).toFixed(0)}% (${clasificadas.length}/${lineas.length})`)
})
