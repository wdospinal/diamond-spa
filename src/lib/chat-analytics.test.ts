/**
 * Pruebas del análisis del chat de la pauta con sesiones inventadas.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs --test src/lib/chat-analytics.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeChat, nextOutcome } from '@/lib/chat-analytics'
import type { ChatEventRow } from '@/lib/chat-events-store'

type Ev = [ev: string, k?: string, cat?: string]

const DAY = '2026-10-27'
const RANGE = { from: DAY, to: DAY, days: [DAY] }
const DOUBT = '¿Duele el tejido profundo?'
const PRICES = 'Precios'

function session(id: string, evs: Ev[], over: Partial<ChatEventRow> = {}): ChatEventRow[] {
  return evs.map(([ev, k, cat], i) => ({
    session_id: id,
    seq: i + 1,
    day: DAY,
    created_at: '2026-10-27T15:00:00.000Z', // 10:00 en Bogotá
    ev,
    k: k ?? null,
    cat: cat ?? null,
    node: null,
    lang: 'es',
    dev: 'm',
    ads: true,
    adg: 'masaje relajante',
    ...over,
  }))
}

const ask = (label = DOUBT): Ev[] => [
  ['open'], ['view', 'menu'], ['menu_cat', 'masajes', 'masajes'], ['view', 'branch'],
  ['branch_doubts', undefined, 'masajes'], ['view', 'doubts'],
  ['doubt', label, 'masajes'], ['view', 'answer'],
]

test('sin datos devuelve ceros y un aviso en vez de fallar', () => {
  const a = analyzeChat([], RANGE)
  assert.equal(a.kpis.sessions, 0)
  assert.equal(a.questions.length, 0)
  assert.equal(a.insights.length, 1)
  assert.equal(a.insights[0].id, 'sin-datos')
})

test('nextOutcome ignora pantallas y clasifica la siguiente decisión', () => {
  const r = (evs: Ev[]) => session('s', evs)
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['follow', 'reserve'], ['reserve_start']]), 0), 'reserva')
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['follow', 'direct'], ['wa_direct', 'answer']]), 0), 'whatsapp')
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['follow', 'advisor']]), 0), 'whatsapp')
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['follow', 'menu']]), 0), 'sigue')
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['follow', 'doubt']]), 0), 'sigue')
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer'], ['close']]), 0), 'se_fue')
  // Sin nada después: la persona se fue.
  assert.equal(nextOutcome(r([['doubt', DOUBT, 'masajes'], ['view', 'answer']]), 0), 'se_fue')
})

test('cuenta sesiones, interacción, preguntas y reservas guardadas', () => {
  const rows = [
    ...session('a', [['open']]), // abrió y no tocó nada
    ...session('b', [['open'], ['menu_cat', 'faciales', 'faciales'], ['close']]),
    ...session('c', [...ask(), ['follow', 'reserve'], ['reserve_start', 'relaxing', 'masajes'], ['opt_pick', 'relaxing|60 min', 'masajes'],
      ['day_pick', '2026-10-28'], ['time_pick', '15:00'], ['name_step', 'reserve'], ['phone_step', 'reserve'], ['reserve_saved']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.kpis.sessions, 3)
  assert.equal(a.kpis.engaged, 2)
  assert.equal(a.kpis.asked, 1)
  assert.equal(a.kpis.reserveStarted, 1)
  assert.equal(a.kpis.saved, 1)
  assert.equal(a.kpis.contacts, 1)
  assert.deepEqual(a.engagement.map(s => s.sessions), [3, 2, 2, 1, 1, 1])
  assert.equal(a.engagement[1].pctOfTop, 2 / 3)
})

test('el embudo de reserva cuenta "llegó al menos hasta" cada paso', () => {
  const rows = [
    ...session('a', [['open'], ['reserve_start']]),
    ...session('b', [['open'], ['reserve_start'], ['opt_pick', 'relaxing|60 min']]),
    ...session('c', [['open'], ['reserve_start'], ['opt_pick', 'relaxing|60 min'], ['day_pick', '2026-10-28'], ['time_pick', '10:00'], ['phone_step', 'reserve'], ['reserve_failed']]),
    // Pasos del flujo de asesora no cuentan como reserva.
    ...session('d', [['open'], ['advisor_start', 'advisor'], ['phone_step', 'advisor'], ['advisor_sent', 'advisor']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.deepEqual(a.reservation.map(s => s.sessions), [3, 2, 1, 1, 1, 0])
  assert.equal(a.kpis.failed, 1)
  assert.equal(a.kpis.advisorSent, 1)
  assert.equal(a.kpis.contacts, 1)
})

test('ordena las preguntas por sesiones y reparte lo que hicieron después', () => {
  const rows = [
    // 1 reserva tras leer la respuesta
    ...session('a', [...ask(), ['follow', 'reserve'], ['reserve_start']]),
    // 1 se va
    ...session('b', [...ask(), ['close']]),
    // 1 escribe a WhatsApp
    ...session('c', [...ask(), ['follow', 'direct'], ['wa_direct', 'answer']]),
    // otra pregunta distinta, una sola vez
    ...session('d', [['open'], ['doubt', PRICES, 'general'], ['view', 'answer'], ['follow', 'menu']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.questions[0].label, DOUBT)
  assert.equal(a.questions[0].sessions, 3)
  assert.deepEqual(a.questions[0].outcomes, { reserva: 1, whatsapp: 1, sigue: 0, se_fue: 1 })
  assert.equal(a.questions[0].topic, 'dolor')
  assert.ok(a.questions[0].answer.length > 0, 'incluye la respuesta actual del chat')
  assert.equal(a.questions[1].label, PRICES)
  assert.equal(a.questions[1].scopeLabel, 'Dudas generales')
  assert.equal(a.questions[1].topic, 'precio')
  assert.equal(a.topics[0].key, 'dolor')
  assert.equal(a.topics[0].share, 3 / 4)
})

test('una sesión que abre la misma duda dos veces cuenta una vez en sesiones y dos en clics', () => {
  const rows = session('a', [...ask(), ['follow', 'doubt'], ['view', 'doubts'], ['doubt', DOUBT, 'masajes']])
  const q = analyzeChat(rows, RANGE).questions[0]
  assert.equal(q.sessions, 1)
  assert.equal(q.clicks, 2)
})

test('marca las preguntas que da pena hacer y las cuenta aparte', () => {
  const rows = [
    ...session('a', [['open'], ['menu_cat', 'masajes', 'masajes'], ['branch_doubts', undefined, 'masajes'], ['sens_open', undefined, 'masajes'],
      ['doubt', '¿Es un masaje 100 % profesional?', 'masajes']]),
    ...session('b', [...ask()]),
  ]
  const a = analyzeChat(rows, RANGE)
  const q = a.questions.find(x => x.label.includes('100 %'))
  assert.equal(q?.delicate, true)
  assert.equal(q?.topic, 'confianza')
  assert.equal(a.delicate.sessions, 1)
  assert.equal(a.delicate.opened, 1)
})

test('el punto de abandono es la última pantalla de quienes no dejaron contacto', () => {
  const rows = [
    ...session('a', [['open'], ['view', 'menu'], ['view', 'doubts']]),
    ...session('b', [['open'], ['view', 'menu'], ['view', 'doubts']]),
    ...session('c', [['open'], ['view', 'menu'], ['view', 'phone']]),
    // Este sí dejó la reserva: no cuenta como abandono.
    ...session('d', [['open'], ['view', 'phone'], ['reserve_saved']]),
    // Este salió a WhatsApp por su cuenta: tampoco es abandono.
    ...session('e', [['open'], ['view', 'answer'], ['wa_direct', 'footer']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.deepEqual(a.dropoff.map(d => [d.key, d.sessions]), [['doubts', 2], ['phone', 1]])
  assert.equal(a.dropoff[0].label, 'Lista de dudas')
})

test('muestra qué estaban leyendo antes de irse y antes de ir a WhatsApp', () => {
  const rows = [
    ...session('a', [...ask()]),
    ...session('b', [...ask()]),
    ...session('c', [...ask(), ['wa_direct', 'footer']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.leftAfter[0].sessions, 2)
  assert.ok(a.leftAfter[0].label.includes(DOUBT))
  assert.equal(a.waAfter[0].sessions, 1)
})

test('demanda: anticipación, horas elegidas, días sin horario y celulares inválidos', () => {
  const rows = [
    ...session('a', [['open'], ['day_pick', DAY], ['time_pick', '18:00'], ['phone_invalid'], ['phone_invalid']]),
    ...session('b', [['open'], ['day_pick', '2026-10-28'], ['time_pick', '18:00'], ['no_slots', '2026-10-30']]),
    ...session('c', [['open'], ['day_pick', '2026-11-20'], ['time_pick', '10:00']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.deepEqual(a.demand.lead.map(l => l.sessions), [1, 1, 0, 0, 1])
  assert.deepEqual(a.demand.hours.map(h => [h.label, h.sessions]), [['10:00', 1], ['18:00', 2]])
  assert.equal(a.demand.noSlots.sessions, 1)
  assert.equal(a.demand.phoneInvalid.sessions, 1)
  assert.equal(a.demand.phoneInvalid.events, 2)
  // 2026-10-28 es miércoles
  assert.equal(a.demand.weekday.find(w => w.label === 'Miércoles')?.sessions, 1)
})

test('servicios: los más leídos, los más elegidos y las opciones más pedidas', () => {
  const rows = [
    ...session('a', [['open'], ['svc_info', 'relaxing', 'masajes'], ['opt_pick', 'relaxing|60 min', 'masajes']]),
    ...session('b', [['open'], ['svc_info', 'relaxing', 'masajes'], ['svc_info', 'deep-tissue', 'masajes']]),
    ...session('c', [['open'], ['reserve_start', 'relaxing', 'masajes'], ['opt_pick', 'relaxing|60 min', 'masajes']]),
  ]
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.services[0].id, 'relaxing')
  assert.equal(a.services[0].info, 2)
  assert.equal(a.services[0].picked, 2)
  assert.equal(a.services[0].reserveStart, 1)
  assert.equal(a.options[0].sessions, 2)
})

test('segmentos y grupos de anuncios', () => {
  const rows = [
    ...session('a', [...ask()], { dev: 'm', ads: true, adg: 'relajante' }),
    ...session('b', [['open']], { dev: 'd', ads: false, adg: null }),
  ]
  const a = analyzeChat(rows, RANGE)
  const m = a.segments.find(s => s.key === 'm')
  const d = a.segments.find(s => s.key === 'd')
  assert.equal(m?.sessions, 1)
  assert.equal(m?.engagedRate, 1)
  assert.equal(d?.engagedRate, 0)
  assert.equal(a.adGroups.length, 1)
  assert.equal(a.adGroups[0].adg, 'relajante')
  assert.equal(a.adGroups[0].topTopic, 'Dolor y presión')
})

test('reparte las aperturas por hora de Bogotá y por día', () => {
  const rows = session('a', [['open'], ['menu_cat', 'masajes', 'masajes']])
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.time.byHour[10], 1)
  assert.equal(a.time.byDay[0].sessions, 1)
  assert.equal(a.time.byDay[0].engaged, 1)
  assert.equal(a.time.byDay[0].saved, 0)
})

test('avisa de las respuestas donde la mayoría se va, con datos suficientes', () => {
  const rows = [1, 2, 3, 4, 5, 6].flatMap(n => session(`s${n}`, [...ask(), ['close']]))
  const a = analyzeChat(rows, RANGE)
  const leak = a.insights.find(i => i.id.startsWith('se-fue-'))
  assert.ok(leak, 'debe avisar que tras la duda la gente se va')
  assert.equal(leak.level, 'alta')
  assert.ok(leak.title.includes(DOUBT))
})

test('no opina de una respuesta con pocas aperturas', () => {
  const rows = [1, 2].flatMap(n => session(`s${n}`, [...ask(), ['close']]))
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.insights.some(i => i.id.startsWith('se-fue-')), false)
})

test('avisa con prioridad alta cuando una reserva no se pudo guardar', () => {
  const rows = session('a', [['open'], ['reserve_start'], ['phone_step', 'reserve'], ['reserve_failed']])
  const a = analyzeChat(rows, RANGE)
  assert.equal(a.insights[0].id, 'reservas-no-guardadas')
  assert.equal(a.insights[0].level, 'alta')
})

test('señala el paso donde más se cae la reserva', () => {
  const rows = [
    ...[1, 2, 3, 4, 5, 6].flatMap(n => session(`a${n}`, [['open'], ['reserve_start'], ['opt_pick', 'relaxing|60 min'], ['day_pick', '2026-10-28']])),
    ...[1, 2].flatMap(n => session(`b${n}`, [['open'], ['reserve_start'], ['opt_pick', 'relaxing|60 min'], ['day_pick', '2026-10-28'], ['time_pick', '10:00']])),
  ]
  const a = analyzeChat(rows, RANGE)
  const leak = a.insights.find(i => i.id.startsWith('fuga-'))
  assert.ok(leak)
  assert.equal(leak.id, 'fuga-time')
})

test('ordena los avisos: alta, media, info', () => {
  const rows = [
    ...[1, 2, 3, 4, 5, 6].flatMap(n => session(`s${n}`, [...ask(), ['close']])),
    ...session('f', [['open'], ['reserve_start'], ['phone_step', 'reserve'], ['reserve_failed']]),
  ]
  const levels = analyzeChat(rows, RANGE).insights.map(i => i.level)
  const order = { alta: 0, media: 1, info: 2 }
  assert.deepEqual(levels, [...levels].sort((x, y) => order[x] - order[y]))
})
