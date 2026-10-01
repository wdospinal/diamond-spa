/**
 * El chat de la pauta: precios alineados con el sitio, botones que apuntan a
 * servicios que existen y celular completo antes de reservar.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SERVICES } from '@/lib/services'
import { CATS, DUO_TECHNIQUES, SVCS, money, optionMinutes, phoneDigits, priceOf, svcById, validChatPhone } from '@/lib/chat-catalog'
import { BRANCHES, GENERAL, MASSAGE_ABOUT, RES, type Follow } from '@/lib/chat-flow-es'
import { availableSlots, daySlots } from '@/lib/chat-slots'

// id del chat → id del sitio (services.ts)
const SITE_ID: Record<string, string> = {
  'lf-profunda': 'limpieza-facial-profunda',
  'lf-basica': 'limpieza-facial-basica',
  hidratacion: 'hidratacion-facial',
  'lf-espalda': 'limpieza-espalda',
  'dep-axila': 'depilacion-axila',
  'dep-bikini': 'depilacion-bikini',
  'dep-m-pierna': 'depilacion-media-pierna',
  'dep-pierna': 'depilacion-pierna-completa',
  'dep-pecho': 'depilacion-pecho',
  'dep-espalda': 'depilacion-espalda',
  'dep-perianal': 'depilacion-zona-perianal',
  'dep-full': 'depilacion-cuerpo-completo',
}

test('los precios del chat son los mismos que los del sitio', () => {
  for (const s of SVCS) {
    const site = SERVICES.find(x => x.id === (SITE_ID[s.id] ?? s.id))
    assert.ok(site, `el sitio no tiene ${s.id}`)
    if (site.pricingModel === 'duration') {
      assert.deepEqual(
        s.prices.map(p => p.value),
        [site.prices[30], site.prices[60], site.prices[90]],
        `precios de ${s.id}`,
      )
    } else if (site.pricingModel === 'flat') {
      assert.deepEqual(s.prices.map(p => p.value), [site.price], `precio de ${s.id}`)
    } else {
      assert.deepEqual(s.prices.map(p => p.value), [site.waxPrice, site.machinePrice], `precios de ${s.id}`)
    }
  }
})

test('el dinero se escribe con puntos, sin depender del navegador', () => {
  assert.equal(money(200000), '$200.000')
  assert.equal(money(1250000), '$1.250.000')
  assert.equal(money(20000), '$20.000')
  assert.equal(priceOf('relaxing', 60), 200000)
  assert.equal(priceOf('dep-pierna', 'machine'), 85000)
  assert.equal(optionMinutes(svcById('relaxing'), 2), 90)
  assert.equal(optionMinutes(svcById('dep-pierna'), 0), 45)
})

test('todos los botones "Reservar X" apuntan a un servicio que existe', () => {
  const follows: Follow[] = []
  for (const g of GENERAL) follows.push(...g.follow)
  for (const b of Object.values(BRANCHES)) {
    for (const o of b.help ?? []) follows.push(...o.follow)
    for (const d of b.doubts) follows.push(...d.follow)
    follows.push(...(b.direct?.follow ?? []))
  }
  const reserves = follows.filter((f): f is Extract<Follow, { k: 'reserve' }> => f.k === 'reserve' && !!f.svc)
  assert.ok(reserves.length > 20)
  for (const f of reserves) assert.doesNotThrow(() => svcById(f.svc!), `servicio ${f.svc}`)
})

test('cada categoría tiene rama, servicios y dudas', () => {
  for (const c of CATS) {
    const doubts = BRANCHES[c.id].doubts
    assert.ok(doubts.filter(d => !d.delicate).length >= 6, c.id)
    assert.ok(doubts.some(d => d.delicate), `${c.id} sin "cosas que da pena preguntar"`)
    assert.ok(SVCS.some(s => s.cat === c.id), c.id)
  }
  assert.equal(GENERAL.length, 10)
})

test('"Ayúdame a elegir" existe en las tres categorías, dividido por temas, con problemas variados y una salida a reservar', () => {
  const min: Record<string, number> = { masajes: 20, faciales: 12, depilacion: 8 }
  for (const c of CATS) {
    const b = BRANCHES[c.id]
    assert.ok(b.help && b.helpAsk && b.helpGroups, `${c.id} sin lista de ayuda por temas`)
    assert.ok(b.help.length >= min[c.id], `${c.id}: ${b.help.length} opciones de ayuda`)
    assert.equal(new Set(b.help.map(o => o.label)).size, b.help.length, `${c.id}: opciones repetidas`)
    const groupIds = b.helpGroups.map(g => g.id)
    assert.equal(new Set(groupIds).size, groupIds.length, `${c.id}: temas repetidos`)
    assert.ok(groupIds.includes('pena'), `${c.id} sin "Cosas que me da pena contar"`)
    for (const g of b.helpGroups) {
      assert.ok(b.help.some(o => o.group === g.id), `${c.id}: el tema ${g.id} no tiene problemas`)
      assert.ok(g.ask.length > 0)
    }
    for (const o of b.help) {
      assert.ok(o.group && groupIds.includes(o.group), `${c.id} · ${o.label}: sin tema válido`)
      assert.ok(o.reply.length >= 1, `${c.id} · ${o.label}: sin respuesta`)
      assert.ok(o.follow.some(f => f.k === 'reserve' || f.k === 'catalog'), `${c.id} · ${o.label}: sin salida a reservar`)
    }
    // los temas delicados son varios en cada categoría
    assert.ok(b.help.filter(o => o.group === 'pena').length >= 3, `${c.id}: pocas cosas que dan pena`)
  }
})

test('los siete masajes aparecen como solución de al menos dos problemas de "Ayúdame a elegir"', () => {
  const reservas = new Map<string, number>()
  for (const o of BRANCHES.masajes.help ?? []) {
    for (const f of o.follow) if (f.k === 'reserve' && f.svc) reservas.set(f.svc, (reservas.get(f.svc) ?? 0) + 1)
  }
  for (const s of SVCS.filter(x => x.cat === 'masajes')) {
    assert.ok((reservas.get(s.id) ?? 0) >= 2, `${s.id}: solo en ${reservas.get(s.id) ?? 0} problemas`)
  }
})

test('cada masaje tiene su descripción al elegirlo en la reserva, con precios del catálogo', () => {
  const masajes = SVCS.filter(s => s.cat === 'masajes')
  for (const s of masajes) {
    const about = MASSAGE_ABOUT[s.id]
    assert.ok(about && about.length >= 2, `${s.id} sin descripción`)
    // el texto menciona el precio de 60 min tal como está en el catálogo
    assert.ok(about.join(' ').includes(money(priceOf(s.id, 60))), `${s.id}: falta el precio de 60 min`)
  }
  for (const id of Object.keys(MASSAGE_ABOUT)) assert.equal(svcById(id).cat, 'masajes', id)
  const texts = Object.values(MASSAGE_ABOUT).flat().join(' ')
  assert.ok(!/terapeutas? hombres?|romántic|final feliz/i.test(texts))
})

test('las técnicas del Duo existen y son masajes de una sola terapeuta', () => {
  for (const id of DUO_TECHNIQUES) {
    assert.equal(svcById(id).cat, 'masajes')
    assert.ok(!['duo', 'four-hands'].includes(id))
  }
})

test('celular: en Colombia, 10 dígitos que empiezan por 3', () => {
  assert.equal(validChatPhone('+57', '312 345 6789'), true)
  assert.equal(validChatPhone('+57', '3123456789'), true)
  assert.equal(validChatPhone('+57', '573123456789'), true)
  assert.equal(phoneDigits('+57', '573123456789'), '3123456789')
  assert.equal(validChatPhone('+57', '3123456'), false)
  assert.equal(validChatPhone('+57', '2123456789'), false)
  assert.equal(validChatPhone('+57', ''), false)
})

test('celular de otros países: solo si Google Ads lo puede reconocer', () => {
  assert.equal(validChatPhone('+1', '305 555 0123'), true)
  assert.equal(validChatPhone('+34', '612 345 678'), true)
  assert.equal(validChatPhone('+1', '123'), false)
  assert.equal(validChatPhone('+34', '61234'), false)
})

test('las horas siguen la lógica de siempre: 30 min después de abrir hasta 30 min antes de cerrar', () => {
  // 2030-01-07 es lunes: abre 10:00, cierra 22:00; sesiones de hasta 60 min, cada 30 min
  const lunes = daySlots(2030, 0, 7, 60)
  assert.equal(lunes[0], '10:30 AM')
  assert.equal(lunes[lunes.length - 1], '9:30 PM')
  // más de 60 min, cada 60 min
  assert.deepEqual(daySlots(2030, 0, 7, 90).slice(0, 3), ['10:30 AM', '11:30 AM', '12:30 PM'])
  // domingo cierra 19:00
  const domingo = daySlots(2030, 0, 6, 60)
  assert.equal(domingo[domingo.length - 1], '6:30 PM')
  // un día lejano no pierde horas por "margen del mismo día"
  assert.equal(availableSlots(2030, 0, 7, 60).length, lunes.length)
})

test('dentro de una rama, ningún botón "Reservar X" ofrece un servicio de otra categoría', () => {
  for (const [cat, b] of Object.entries(BRANCHES)) {
    const follows: Follow[] = [
      ...(b.help ?? []).flatMap(o => o.follow),
      ...b.doubts.flatMap(d => d.follow),
      ...(b.direct?.follow ?? []),
    ]
    for (const f of follows) {
      if (f.k === 'reserve' && f.svc) assert.equal(svcById(f.svc).cat, cat, `${f.svc} aparece en la rama ${cat}`)
      if (f.k === 'reserveCat' || f.k === 'catalog') assert.equal(f.cat, cat, `${f.k} ${f.cat} aparece en la rama ${cat}`)
    }
  }
})

/** Todas las respuestas del chat con sus botones, para revisar el contenido en bloque. */
function everyAnswer() {
  const out: { where: string; texts: string[]; follow: Follow[] }[] = []
  for (const g of GENERAL) out.push({ where: g.label, texts: [g.label, ...g.answer], follow: g.follow })
  for (const [cat, b] of Object.entries(BRANCHES)) {
    for (const o of b.help ?? []) out.push({ where: `${cat} · ${o.label}`, texts: [o.label, ...o.reply], follow: o.follow })
    for (const d of b.doubts) out.push({ where: `${cat} · ${d.label}`, texts: [d.label, ...d.answer], follow: d.follow })
    if (b.direct) out.push({ where: `${cat} · directo`, texts: b.direct.reply, follow: b.direct.follow })
  }
  return out
}

test('donde se ofrece hablar con un asesor también se ofrece reservar', () => {
  for (const a of everyAnswer()) {
    if (a.follow.some(f => f.k === 'advisor')) {
      assert.ok(a.follow.some(f => f.k === 'reserve'), `${a.where}: tiene asesor pero no "reservar"`)
    }
  }
})

test('el chat no menciona terapeutas hombres ni suena romántico', () => {
  const texts = [...everyAnswer().flatMap(a => a.texts), RES.askPlan, ...RES.group]
  for (const t of texts) {
    assert.ok(!/terapeutas? hombres?|romántic|qué buen plan|qué plan/i.test(t), t)
  }
})

test('la pauta es para hombres: masajes y faciales no traen temas de mujeres (periodo, embarazo, estrías…)', () => {
  // La depilación se deja completa a propósito (incluye zona íntima, brasileña y regla).
  const ABOUT = Object.values(MASSAGE_ABOUT).flat()
  const texts = [...everyAnswer().filter(a => !a.where.startsWith('depilacion')).flatMap(a => a.texts), ...ABOUT, RES.askPlan, ...RES.group]
  for (const t of texts) {
    assert.ok(!/embaraz|gestan|periodo|regla\b|menstru|cólico|bikini|brasile|estría|retención de líquidos|piernas pesadas/i.test(t), t)
  }
})

test('términos que Google Ads puede leer como contenido sexual no aparecen en ningún texto del chat', () => {
  // Política de Google Ads: prohíbe "masaje íntimo" y textos que sugieran intención sexual.
  const ABOUT = Object.values(MASSAGE_ABOUT).flat()
  const texts = [...everyAnswer().flatMap(a => a.texts), ...ABOUT, RES.askPlan, ...RES.group]
  for (const t of texts) {
    assert.ok(!/erecci|sexual|sexy|sensual|erótic|final feliz|happy ending|masaje íntimo|íntimo|tantr|nuru|desnud|\bingle\b|envolvente|estimul|sensorial|los sentidos/i.test(t), t)
  }
})

test('todo el personal del chat va en femenino, no se pide propina y la factura se pide en caja', () => {
  const texts = [
    ...everyAnswer().flatMap(a => a.texts),
    ...Object.values(MASSAGE_ABOUT).flat(),
    RES.askPlan,
    ...RES.group,
    RES.askNameAdvisor,
    RES.advisorDone('Ana'),
  ]
  for (const t of texts) {
    assert.ok(!/\basesor\b|\basistente\b|\bnuestro asesor|\bel asesor|\bun asesor/i.test(t), t)
  }
  const propina = GENERAL.find(g => g.id === 'propina')!.answer.join(' ')
  assert.match(propina, /no pedimos propina/i)
  assert.ok(!/\d+\s*%/.test(propina), propina)
  const pagos = GENERAL.find(g => g.id === 'pagos')!.answer.join(' ')
  assert.match(pagos, /factura/i)
  assert.match(pagos, /caja/i)
  assert.ok(!/al reservar/i.test(pagos), pagos)
})

test('el Duo con técnicas distintas no promete el precio fijo del Duo: lo confirma recepción', () => {
  const duoTalk = everyAnswer().filter(a => /cada uno escoge su técnica/.test(a.texts.join(' ')))
  assert.ok(duoTalk.length >= 2)
  for (const a of duoTalk) assert.match(a.texts.join(' '), /el precio (cambia|es diferente)/, a.where)
  assert.match(MASSAGE_ABOUT.duo.join(' '), /precio cambia/)
  assert.match(RES.duoDiffPrice, /precio es diferente/)
  assert.match(SVCS.find(s => s.id === 'duo')!.blurb, /misma técnica/)
})

test('la zona íntima ya no se llama Bikini en el chat', () => {
  const dep = svcById('dep-bikini')
  assert.ok(!/bikini/i.test(`${dep.name} ${dep.short}`))
  for (const a of everyAnswer()) for (const t of a.texts) assert.ok(!/bikini/i.test(t), t)
})
