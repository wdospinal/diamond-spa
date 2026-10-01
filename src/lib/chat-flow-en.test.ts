/**
 * El chat de la pauta en inglés: misma estructura y mismos precios que el
 * español, sin palabras en español y sin términos que Google Ads pueda leer
 * como contenido sexual.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CATS, SVCS, catsFor, optionMinutes, svcById, svcsOf } from '@/lib/chat-catalog'
import * as es from '@/lib/chat-flow-es'
import * as en from '@/lib/chat-flow-en'
import { flowFor } from '@/lib/chat-flow'
import { UI } from '@/lib/chat-ui'
import type { Doubt, Follow } from '@/lib/chat-flow-es'

/** Forma de los botones, sin el texto de la etiqueta (que cambia de idioma). */
const followShape = (f: Follow[]) =>
  JSON.stringify(f.map(x => (x.k === 'catalog' ? { k: x.k, cat: x.cat, custom: !!x.label } : x)))
const money = (t: string) => t.match(/\$\d{1,3}(?:\.\d{3})*/g) ?? []

type Answer = { where: string; texts: string[]; follow: Follow[] }

/** Todas las respuestas de un idioma, en el mismo orden, para compararlas de a pares. */
function everyAnswer(flow: { GENERAL: (Doubt & { id: string })[]; BRANCHES: typeof es.BRANCHES }): Answer[] {
  const out: Answer[] = []
  for (const g of flow.GENERAL) out.push({ where: g.id, texts: [g.label, ...g.answer], follow: g.follow })
  for (const [cat, b] of Object.entries(flow.BRANCHES)) {
    for (const o of b.help ?? []) out.push({ where: `${cat} · ayuda · ${o.label}`, texts: [o.label, ...o.reply], follow: o.follow })
    for (const d of b.doubts) out.push({ where: `${cat} · duda · ${d.label}`, texts: [d.label, ...d.answer], follow: d.follow })
    if (b.direct) out.push({ where: `${cat} · directo`, texts: b.direct.reply, follow: b.direct.follow })
  }
  return out
}

/** Todo texto que el chat en inglés puede mostrar o mandar. */
function allEnglishTexts(): string[] {
  const res = en.RES
  return [
    ...en.GREETING,
    en.ASK_MENU, en.ASK_GENERAL, en.ASK_DOUBT, en.ASK_BACK, en.DELICATE_LABEL, en.ASK_DELICATE, en.HELP_DELICATE_LABEL,
    ...everyAnswer(en).flatMap(a => a.texts),
    ...Object.values(en.MASSAGE_ABOUT).flat(),
    ...Object.values(en.BRANCHES).flatMap(b => [b.intro, b.helpLabel, b.helpAsk ?? '', b.catalogLabel, b.catalogIntro]),
    ...Object.values(en.BRANCHES).flatMap(b => (b.helpGroups ?? []).flatMap(g => [g.label, g.ask])),
    res.askContinue, res.continueMassage, res.moreMassages, res.askPeople, res.askPlan, res.askCat, res.askSvc,
    res.askMinutes, res.askWax, res.askDate, res.askTime, res.noSlots, res.askNameReserve, res.askNameAdvisor,
    res.askPhone('Sam'), res.askPhone(''), res.badPhone, ...res.group, ...res.duoIntro, res.duoSecond, res.duoDiffPrice,
    res.duoPriceTbc, res.duoNote, res.sameIntro, res.distinctIntro, res.distinctSecond, res.togetherNote, res.doneHelp,
    res.advisorDone('Sam'), res.advisorDone(''),
  ]
}

test('el inglés tiene la misma estructura que el español: dudas generales, ramas y botones', () => {
  assert.equal(en.GENERAL.length, es.GENERAL.length)
  en.GENERAL.forEach((g, i) => {
    const r = es.GENERAL[i]
    assert.equal(g.id, r.id)
    assert.equal(g.icon, r.icon, g.id)
    assert.equal(!!g.bare, !!r.bare, g.id)
    assert.equal(g.answer.length, r.answer.length, `${g.id}: burbujas`)
    assert.equal(followShape(g.follow), followShape(r.follow), `${g.id}: botones`)
  })
  assert.deepEqual(Object.keys(en.BRANCHES), Object.keys(es.BRANCHES))
  for (const cat of Object.keys(es.BRANCHES) as (keyof typeof es.BRANCHES)[]) {
    const a = en.BRANCHES[cat]
    const r = es.BRANCHES[cat]
    assert.equal(a.help?.length, r.help?.length, `${cat}: opciones de ayuda`)
    assert.equal(a.doubts.length, r.doubts.length, `${cat}: dudas`)
    assert.deepEqual((a.helpGroups ?? []).map(g => [g.id, g.icon]), (r.helpGroups ?? []).map(g => [g.id, g.icon]), `${cat}: temas`)
    ;(r.help ?? []).forEach((o, i) => {
      const x = a.help![i]
      assert.equal(x.group, o.group, `${cat} ayuda ${i}: tema`)
      assert.equal(x.reply.length, o.reply.length, `${cat} ayuda ${i}: burbujas`)
      assert.equal(followShape(x.follow), followShape(o.follow), `${cat} ayuda ${i}: botones`)
    })
    r.doubts.forEach((d, i) => {
      const x = a.doubts[i]
      assert.equal(!!x.delicate, !!d.delicate, `${cat} duda ${i}: delicada`)
      assert.equal(x.answer.length, d.answer.length, `${cat} duda ${i}: burbujas`)
      assert.equal(followShape(x.follow), followShape(d.follow), `${cat} duda ${i}: botones`)
    })
  }
  assert.deepEqual(Object.keys(en.MASSAGE_ABOUT), Object.keys(es.MASSAGE_ABOUT))
  for (const k of Object.keys(es.MASSAGE_ABOUT)) assert.equal(en.MASSAGE_ABOUT[k].length, es.MASSAGE_ABOUT[k].length, k)
  assert.deepEqual(Object.keys(en.RES), Object.keys(es.RES))
  assert.equal(en.GREETING.length, es.GREETING.length)
})

test('cada respuesta en inglés dice las mismas cifras que la del español', () => {
  const a = everyAnswer(en)
  const r = everyAnswer(es)
  assert.equal(a.length, r.length)
  a.forEach((x, i) => {
    assert.deepEqual(money(x.texts.join(' ')), money(r[i].texts.join(' ')), `${x.where}: precios`)
  })
  for (const k of Object.keys(es.MASSAGE_ABOUT)) {
    assert.deepEqual(money(en.MASSAGE_ABOUT[k].join(' ')), money(es.MASSAGE_ABOUT[k].join(' ')), `MASSAGE_ABOUT ${k}`)
  }
})

test('el catálogo en inglés tiene los mismos precios, duraciones y categorías', () => {
  assert.deepEqual(catsFor('en').map(c => c.id), CATS.map(c => c.id))
  assert.equal(catsFor('es'), CATS)
  const names = new Set<string>()
  for (const s of SVCS) {
    const e = svcById(s.id, 'en')
    assert.ok(e.name && e.short, s.id)
    assert.ok(!/[áéíóúñ]/i.test(`${e.name} ${e.short} ${e.blurb}`), `${s.id}: texto en español`)
    assert.deepEqual(e.prices.map(p => p.value), s.prices.map(p => p.value), s.id)
    assert.equal(e.durMin, s.durMin)
    s.prices.forEach((_, i) => assert.equal(optionMinutes(e, i), optionMinutes(s, i), `${s.id} opción ${i}`))
    if (s.cat === 'depilacion') assert.deepEqual(e.prices.map(p => p.label), ['Wax', 'Machine'], s.id)
    assert.ok(!names.has(e.name), `nombre repetido: ${e.name}`)
    names.add(e.name)
  }
  assert.equal(svcsOf('masajes', 'en').length, svcsOf('masajes', 'es').length)
  // el español queda intacto
  assert.equal(svcById('dep-bikini').short, 'Zona íntima')
  assert.equal(svcById('relaxing', 'es').name, 'Masaje Relajante')
})

test('flowFor elige el idioma de la página', () => {
  assert.equal(flowFor('en').GREETING, en.GREETING)
  assert.equal(flowFor('es').GREETING, es.GREETING)
})

test('no queda español en los textos del chat en inglés', () => {
  const ALLOWED = /Medellín|Daviplata|Nequi|El Poblado|Parque Lleras|Parque El Poblado|Cra 43C/g
  for (const t of allEnglishTexts()) {
    const clean = t.replace(ALLOWED, '')
    assert.ok(!/[áéíóúñ¿¡]/i.test(clean), `acentos o signos en español: ${t}`)
    assert.ok(!/\b(recepci[oó]n|masaje|cabina|terapeuta|asesora|precio|reservar|depilaci[oó]n|facial es)\b/i.test(clean), `palabra en español: ${t}`)
  }
})

test('en inglés: sin términos que Google Ads pueda leer como contenido sexual', () => {
  // Política de Google Ads: prohíbe "intimate massage" y textos que sugieran intención sexual.
  for (const t of allEnglishTexts()) {
    assert.ok(
      !/erection|sexual|sexy|sensual|erotic|happy ending|intimate massage|tantr|nuru|naked|arous|stimulat|sensory|the senses|body rub|escort|companion|romantic|couples?\b|massage parlou?r/i.test(t),
      t,
    )
  }
})

test('en inglés: la pauta es para hombres (sin temas de mujeres en masajes y faciales) y las terapeutas son mujeres', () => {
  const ABOUT = Object.values(en.MASSAGE_ABOUT).flat()
  const nonWax = everyAnswer(en).filter(a => !a.where.startsWith('depilacion')).flatMap(a => a.texts)
  for (const t of [...nonWax, ...ABOUT, en.RES.askPlan, ...en.RES.group]) {
    assert.ok(!/pregnan|gestation|period\b|menstru|cramp|brazilian|bikini|stretch marks|fluid retention|heavy legs/i.test(t), t)
  }
  for (const t of allEnglishTexts()) {
    assert.ok(!/\b(male|men'?s?|man) (therapists?|masseurs?)\b|\bmasseurs?\b|\bhe\b|\bhis\b|\bhim\b/i.test(t), t)
  }
})

test('en inglés: no se pide propina, la factura se pide en caja y no hay anticipo', () => {
  const tip = en.GENERAL.find(g => g.id === 'propina')!.answer.join(' ')
  assert.match(tip, /don't ask for tips/i)
  assert.ok(!/\d+\s*%/.test(tip), tip)
  const pay = en.GENERAL.find(g => g.id === 'pagos')!.answer.join(' ')
  assert.match(pay, /invoice/i)
  assert.match(pay, /register/i)
  assert.match(pay, /deposit/i)
  assert.match(pay, /dollars/i)
})

test('en inglés: el Duo con técnicas distintas no promete el precio fijo: lo confirma recepción', () => {
  const duoTalk = everyAnswer(en).filter(a => /picks? (your|their) technique|pick your technique/i.test(a.texts.join(' ')))
  assert.ok(duoTalk.length >= 2)
  for (const a of duoTalk) assert.match(a.texts.join(' '), /price (changes|differs)|differs from the Duo/i, a.where)
  assert.match(en.MASSAGE_ABOUT.duo.join(' '), /price changes/)
  assert.match(en.RES.duoDiffPrice, /price differs/)
  assert.match(svcById('duo', 'en').blurb, /same technique/)
})

test('en inglés: las zonas de depilación no se llaman Bikini', () => {
  const dep = svcById('dep-bikini', 'en')
  assert.ok(!/bikini/i.test(`${dep.name} ${dep.short}`))
  for (const t of allEnglishTexts()) assert.ok(!/bikini/i.test(t), t)
})

test('los textos de la interfaz tienen las mismas claves en los dos idiomas y ninguno queda vacío', () => {
  assert.deepEqual(Object.keys(UI.en).sort(), Object.keys(UI.es).sort())
  for (const [k, v] of Object.entries(UI.en)) {
    const s = UI.es[k as keyof typeof UI.es]
    assert.equal(typeof v, typeof s, k)
    if (typeof v === 'string') assert.ok(v.length > 0, k)
  }
  assert.equal(UI.en.defaultCountryCode, '+1')
  assert.equal(UI.es.defaultCountryCode, '+57')
  assert.equal(UI.en.months.length, 12)
  assert.equal(UI.en.weekdays.length, 7)
})

test('la interfaz en inglés no deja español, y la del español no cambió', () => {
  const samples = (ui: typeof UI.en) => [
    ...Object.values(ui).filter((v): v is string => typeof v === 'string'),
    ...ui.months,
    ui.reserveSvc('X'), ui.okSvc('X'), ui.noted('A', 'B', '$1'), ui.notedNoPrice('A', 'B'), ui.person(2), ui.reserveDone('Sam'), ui.reserveDone(''),
    ui.duoPartsTbc('A', 'B'), ui.duoParts('A', 'B', '$1'), ui.duoTechParts('A', 'B'), ...ui.soloParts('A', 'B', '$1'),
    ...ui.sameRows('A', 'B', '$1'), ui.samePart('A', 'B', '$1'), ui.distinctPart(1, 'A', 'B', '$1'), ui.dateLine('X'), ui.timeLine('X'),
    ui.leadDirect('X'), ui.nameSentence('Sam'), ui.msgInterest('X'),
  ]
  for (const t of samples(UI.en)) {
    assert.ok(!/[áéíóúñ¿¡]/i.test(t), t)
    assert.ok(!/\b(reservar|recepci[oó]n|asesora|persona|somos|hola|precio)\b/i.test(t), t)
  }
  // el español sigue diciendo lo de siempre
  assert.equal(UI.es.talkAdvisor, 'Hablar con una asesora')
  assert.equal(UI.es.writeDirect, 'Escribir directo a WhatsApp')
  assert.equal(UI.es.reserveSvc('Relajante'), 'Reservar Relajante')
  assert.equal(UI.es.greetingOrganic, 'Hola, me gustaría agendar una cita con recepción.')
  assert.equal(UI.es.noted('Masaje Relajante', '60 min', '$200.000'), 'Anotado: Masaje Relajante · 60 min · $200.000')
})
