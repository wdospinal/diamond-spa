/**
 * Pruebas del vocabulario de eventos del chat de la pauta: lo que el endpoint
 * público acepta y lo que descarta.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs --test src/lib/chat-events.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CATS, SVCS } from '@/lib/chat-catalog'
import * as es from '@/lib/chat-flow-es'
import * as en from '@/lib/chat-flow-en'
import {
  CHAT_LIMITS, TOPICS, esLabelAt, labelIndex, optKey, sanitizeBatch, slotTo24h, topicOf,
} from '@/lib/chat-events'

const meta = { lang: 'es', dev: 'm', ads: true, adg: 'masaje relajante' }
const batch = (events: unknown[], over: Record<string, unknown> = {}) =>
  ({ sessionId: 'abcdefgh-1234', meta, events, ...over })

test('acepta una duda real y devuelve sus datos', () => {
  const out = sanitizeBatch(batch([{ seq: 1, ev: 'doubt', k: 'Precios', cat: 'general', node: 'general' }]))
  assert.ok(out)
  assert.equal(out.events.length, 1)
  assert.deepEqual(out.events[0], { seq: 1, ev: 'doubt', k: 'Precios', cat: 'general', node: 'general' })
  assert.equal(out.meta.dev, 'm')
  assert.equal(out.meta.ads, true)
  assert.equal(out.meta.adg, 'masaje relajante')
})

test('todas las etiquetas del chat en español son aceptadas con su categoría', () => {
  let seq = 0
  const events: unknown[] = []
  for (const g of es.GENERAL) events.push({ seq: ++seq, ev: 'doubt', k: g.label, cat: 'general' })
  for (const c of CATS) {
    const b = es.BRANCHES[c.id]
    for (const d of b.doubts) events.push({ seq: ++seq, ev: 'doubt', k: d.label, cat: c.id })
    for (const g of b.helpGroups ?? []) events.push({ seq: ++seq, ev: 'help_group', k: g.label, cat: c.id })
    for (const o of b.help ?? []) events.push({ seq: ++seq, ev: 'help_option', k: o.label, cat: c.id })
  }
  let accepted = 0
  for (let i = 0; i < events.length; i += CHAT_LIMITS.batch) {
    const out = sanitizeBatch(batch(events.slice(i, i + CHAT_LIMITS.batch)))
    assert.ok(out)
    accepted += out.events.length
  }
  assert.equal(accepted, events.length, 'alguna etiqueta real fue rechazada')
})

test('rechaza texto libre: una duda inventada o con la categoría equivocada', () => {
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'doubt', k: 'Me llamo Juan 3001234567', cat: 'general' }])), null)
  // La duda existe, pero en otra categoría.
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'doubt', k: '¿Duele la depilación?', cat: 'masajes' }])), null)
  // Sin categoría no se puede validar.
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'doubt', k: 'Precios' }])), null)
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'follow', k: 'cualquier cosa' }])), null)
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'wa_direct', k: 'https://malo.example' }])), null)
})

test('descarta solo el evento malo y conserva los buenos del mismo lote', () => {
  const out = sanitizeBatch(batch([
    { seq: 1, ev: 'open' },
    { seq: 2, ev: 'evento_inventado' },
    { seq: 3, ev: 'doubt', k: 'texto libre', cat: 'general' },
    { seq: 4, ev: 'close', node: 'menu' },
  ]))
  assert.ok(out)
  assert.deepEqual(out.events.map(e => e.ev), ['open', 'close'])
})

test('valida el envío completo: sesión, tamaño del lote y números de orden', () => {
  assert.equal(sanitizeBatch(null), null)
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'open' }], { sessionId: 'corto' })), null)
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'open' }], { sessionId: 'con espacios y simbolos!!' })), null)
  assert.equal(sanitizeBatch(batch([])), null)
  const many = Array.from({ length: CHAT_LIMITS.batch + 1 }, (_, i) => ({ seq: i + 1, ev: 'open' }))
  assert.equal(sanitizeBatch(batch(many)), null)
  assert.equal(sanitizeBatch(batch([{ seq: 0, ev: 'open' }])), null)
  assert.equal(sanitizeBatch(batch([{ seq: 1.5, ev: 'open' }])), null)
  assert.equal(sanitizeBatch(batch([{ seq: CHAT_LIMITS.maxSeq + 1, ev: 'open' }])), null)
})

test('los datos de sesión se acotan: grupo de anuncios sin caracteres raros', () => {
  const ok = sanitizeBatch(batch([{ seq: 1, ev: 'open' }], { meta: { lang: 'en', dev: 'd', ads: false, adg: 'Masaje_Relajante-2' } }))
  assert.ok(ok)
  assert.equal(ok.meta.lang, 'en')
  assert.equal(ok.meta.adg, 'Masaje_Relajante-2')
  const bad = sanitizeBatch(batch([{ seq: 1, ev: 'open' }], { meta: { adg: '<script>alert(1)</script>' } }))
  assert.ok(bad)
  assert.equal(bad.meta.adg, null)
  const long = sanitizeBatch(batch([{ seq: 1, ev: 'open' }], { meta: { adg: 'x'.repeat(80) } }))
  assert.ok(long)
  assert.equal(long.meta.adg, null)
})

test('fechas, horas y opciones de reserva tienen formato cerrado', () => {
  const ok = sanitizeBatch(batch([
    { seq: 1, ev: 'day_pick', k: '2026-10-30' },
    { seq: 2, ev: 'time_pick', k: '14:30' },
    { seq: 3, ev: 'no_slots', k: '2026-10-28' },
    { seq: 4, ev: 'people', k: '2' },
    { seq: 5, ev: 'plan', k: 'duo' },
    { seq: 6, ev: 'reserve_start' },
    { seq: 7, ev: 'reserve_start', k: 'relaxing', cat: 'masajes' },
  ]))
  assert.ok(ok)
  assert.equal(ok.events.length, 7)
  const bad = sanitizeBatch(batch([
    { seq: 1, ev: 'day_pick', k: 'mañana por la tarde' },
    { seq: 2, ev: 'time_pick', k: '3pm' },
    { seq: 3, ev: 'people', k: '7' },
    { seq: 4, ev: 'reserve_start', k: 'masaje-que-no-existe' },
  ]))
  assert.equal(bad, null)
})

test('toda opción de precio del catálogo se acepta como opt_pick', () => {
  const events = SVCS.flatMap(s => s.prices.map(p => ({ ev: 'opt_pick', k: optKey(s.id, p.label), cat: s.cat })))
  assert.ok(events.length > 0)
  for (let i = 0; i < events.length; i += CHAT_LIMITS.batch) {
    const slice = events.slice(i, i + CHAT_LIMITS.batch).map((e, j) => ({ ...e, seq: i + j + 1 }))
    const out = sanitizeBatch(batch(slice))
    assert.ok(out)
    assert.equal(out.events.length, slice.length)
  }
  assert.equal(sanitizeBatch(batch([{ seq: 1, ev: 'opt_pick', k: 'relaxing|gratis' }])), null)
})

test('las listas en inglés tienen la misma forma que las del español (la traducción es por posición)', () => {
  assert.equal(en.GENERAL.length, es.GENERAL.length)
  for (const c of CATS) {
    assert.equal(en.BRANCHES[c.id].doubts.length, es.BRANCHES[c.id].doubts.length, `dudas ${c.id}`)
    assert.equal((en.BRANCHES[c.id].help ?? []).length, (es.BRANCHES[c.id].help ?? []).length, `ayuda ${c.id}`)
    assert.equal((en.BRANCHES[c.id].helpGroups ?? []).length, (es.BRANCHES[c.id].helpGroups ?? []).length, `temas ${c.id}`)
  }
})

test('esLabelAt devuelve la etiqueta en español de la misma posición', () => {
  const item = en.BRANCHES.masajes.doubts[2]
  assert.equal(esLabelAt(en.BRANCHES.masajes.doubts, item, es.BRANCHES.masajes.doubts), es.BRANCHES.masajes.doubts[2].label)
  assert.equal(esLabelAt(en.GENERAL, en.GENERAL[0], es.GENERAL), es.GENERAL[0].label)
  assert.equal(esLabelAt(en.BRANCHES.masajes.doubts, { label: 'no está' }, es.BRANCHES.masajes.doubts), undefined)
  // Con el chat en español es la propia etiqueta.
  assert.equal(esLabelAt(es.GENERAL, es.GENERAL[3], es.GENERAL), es.GENERAL[3].label)
})

test('slotTo24h convierte las horas del chat', () => {
  assert.equal(slotTo24h('9:00 AM'), '09:00')
  assert.equal(slotTo24h('12:00 PM'), '12:00')
  assert.equal(slotTo24h('12:30 AM'), '00:30')
  assert.equal(slotTo24h('2:30 PM'), '14:30')
  assert.equal(slotTo24h('7:00 pm'), '19:00')
  assert.equal(slotTo24h('tarde'), undefined)
})

test('el índice marca cuáles preguntas son de las que da pena hacer', () => {
  const idx = labelIndex()
  const delicate = [...idx.values()].filter(m => m.delicate)
  assert.ok(delicate.length > 5)
  assert.equal(idx.get('doubt|masajes|¿Es un masaje 100 % profesional?')?.delicate, true)
  assert.equal(idx.get('doubt|masajes|¿Duele el tejido profundo?')?.delicate, false)
  assert.ok((idx.get('doubt|general|Precios')?.answer ?? []).length > 0)
})

test('topicOf agrupa las preguntas más comunes por tema', () => {
  assert.equal(topicOf('Precios', false), 'precio')
  assert.equal(topicOf('Pagos y factura', false), 'precio')
  assert.equal(topicOf('Dónde queda', false), 'ubicacion')
  assert.equal(topicOf('Horarios', false), 'ubicacion')
  assert.equal(topicOf('Cambiar mi cita o llegar tarde', false), 'reservar')
  assert.equal(topicOf('¿Duele el tejido profundo?', false), 'dolor')
  assert.equal(topicOf('Aliviar dolor de espalda o contracturas', false), 'dolor')
  assert.equal(topicOf('¿Qué me pongo? ¿Me quito toda la ropa?', false), 'preparacion')
  assert.equal(topicOf('¿Cada cuánto me lo hago?', false), 'frecuencia')
  assert.equal(topicOf('Es mi primera vez y no sé cuál elegir', false), 'primera')
  assert.equal(topicOf('¿Relajante o descontracturante?', false), 'elegir')
  assert.equal(topicOf('Condiciones de salud', false), 'salud')
  // Lo que da pena preguntar siempre es confianza, diga lo que diga la frase.
  assert.equal(topicOf('¿Tengo que bañarme antes?', true), 'confianza')
  assert.equal(topicOf('Otra pregunta', false), 'otros')
})

test('cada tema tiene una guía de qué hacer, salvo "otras"', () => {
  for (const t of Object.values(TOPICS)) {
    if (t.key !== 'otros') assert.ok(t.playbook.length > 0, t.key)
  }
})
