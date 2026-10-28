/**
 * Convierte los eventos crudos del chat de la pauta en lo que un CRO necesita
 * ver: qué preguntan, qué buscan, dónde se caen y qué hacer con eso.
 *
 * Todo es puro (recibe filas, devuelve cifras) para poder probarlo con sesiones
 * inventadas. No importa nada de servidor.
 */

import type { ChatEventRow } from '@/lib/chat-events-store'
import {
  CHAT_NODES, NODE_LABELS, SCOPE_LABELS, TOPICS, labelIndex, labelKey, svcName, topicOf,
  type ChatNode, type ChatScope, type TopicKey,
} from '@/lib/chat-events'

// ─── Tipos de salida ──────────────────────────────────────────────────────────

export type Outcome = 'reserva' | 'whatsapp' | 'sigue' | 'se_fue'
export type OutcomeCounts = Record<Outcome, number>

export interface Kpis {
  sessions: number
  engaged: number
  asked: number
  reserveStarted: number
  saved: number
  failed: number
  advisorSent: number
  waDirect: number
  waAfterReserve: number
  /** Dejó reserva guardada o pidió que una asesora lo contacte. */
  contacts: number
}

export interface FunnelStep {
  key: string
  label: string
  sessions: number
  pctOfTop: number
  pctOfPrev: number
}

export interface QuestionStat {
  id: string
  kind: 'doubt' | 'help'
  label: string
  scope: ChatScope
  scopeLabel: string
  delicate: boolean
  topic: TopicKey
  topicLabel: string
  sessions: number
  clicks: number
  /** Qué hizo la persona justo después de leer la respuesta (por cada vez que la abrió). */
  outcomes: OutcomeCounts
  /** Lo que el chat responde hoy. */
  answer: string[]
  /** Botones que ofrece esa respuesta. */
  follow: string[]
}

export interface TopicStat {
  key: TopicKey
  label: string
  sessions: number
  clicks: number
  /** Parte de las sesiones que preguntaron algo. */
  share: number
  outcomes: OutcomeCounts
  playbook: string[]
  top: { label: string; sessions: number }[]
}

export interface ScopeStat {
  scope: ChatScope
  label: string
  /** Sesiones que escogieron esta categoría en el menú. */
  chose: number
  help: number
  catalog: number
  doubts: number
  sens: number
  asked: number
  reserveStart: number
}

export interface ServiceStat {
  id: string
  name: string
  info: number
  reserveStart: number
  picked: number
}

export interface CountItem {
  key: string
  label: string
  sessions: number
}

export interface Segment {
  key: string
  label: string
  sessions: number
  engagedRate: number
  askedRate: number
  savedRate: number
}

export interface AdGroupStat {
  adg: string
  sessions: number
  asked: number
  saved: number
  topTopic: string | null
}

export interface Insight {
  id: string
  level: 'alta' | 'media' | 'info'
  title: string
  evidence: string
  action: string
}

export interface ChatAnalytics {
  range: { from: string; to: string; days: number }
  kpis: Kpis
  engagement: FunnelStep[]
  reservation: FunnelStep[]
  firstChoice: CountItem[]
  scopes: ScopeStat[]
  topics: TopicStat[]
  questions: QuestionStat[]
  needs: QuestionStat[]
  delicate: { sessions: number; opened: number }
  services: ServiceStat[]
  options: CountItem[]
  dropoff: CountItem[]
  leftAfter: CountItem[]
  waAfter: CountItem[]
  demand: {
    lead: CountItem[]
    weekday: CountItem[]
    hours: CountItem[]
    noSlots: { events: number; sessions: number; dates: CountItem[] }
    phoneInvalid: { events: number; sessions: number }
  }
  time: { byHour: number[]; byWeekday: number[]; byDay: { day: string; sessions: number; engaged: number; saved: number }[] }
  segments: Segment[]
  adGroups: AdGroupStat[]
  insights: Insight[]
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

const ratio = (n: number, d: number) => (d > 0 ? n / d : 0)
const pctText = (x: number) => `${Math.round(x * 100)}%`
const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const BOGOTA_HOUR = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', hour: 'numeric', hourCycle: 'h23' })

const emptyOutcomes = (): OutcomeCounts => ({ reserva: 0, whatsapp: 0, sigue: 0, se_fue: 0 })

interface Sess {
  id: string
  rows: ChatEventRow[]
  day: string
  openedAt: string
  lang: string
  dev: string
  ads: boolean
  adg: string | null
  evs: Set<string>
}

function groupSessions(rows: ChatEventRow[]): Sess[] {
  const by = new Map<string, ChatEventRow[]>()
  for (const r of rows) {
    const list = by.get(r.session_id)
    if (list) list.push(r)
    else by.set(r.session_id, [r])
  }
  const out: Sess[] = []
  for (const [id, list] of by) {
    list.sort((a, b) => a.seq - b.seq)
    const first = list.find(r => r.ev === 'open') ?? list[0]
    const meta = list.find(r => r.lang) ?? first
    out.push({
      id,
      rows: list,
      day: first.day,
      openedAt: first.created_at,
      lang: meta.lang ?? 'es',
      dev: meta.dev ?? 'd',
      ads: !!meta.ads,
      adg: list.find(r => r.adg)?.adg ?? null,
      evs: new Set(list.map(r => r.ev)),
    })
  }
  return out
}

/** Qué hizo la persona después del evento `i` (las pantallas son consecuencia, no decisión). */
export function nextOutcome(rows: ChatEventRow[], i: number): Outcome {
  for (let j = i + 1; j < rows.length; j++) {
    const r = rows[j]
    switch (r.ev) {
      case 'view':
      case 'no_slots':
        continue
      case 'follow':
        if (r.k === 'reserve' || r.k === 'reserveCat' || r.k === 'people') return 'reserva'
        if (r.k === 'direct' || r.k === 'change' || r.k === 'advisor') return 'whatsapp'
        return 'sigue'
      case 'reserve_start':
      case 'people':
      case 'plan':
      case 'opt_pick':
      case 'day_pick':
      case 'time_pick':
        return 'reserva'
      case 'wa_direct':
      case 'advisor_start':
        return 'whatsapp'
      case 'close':
        return 'se_fue'
      default:
        return 'sigue'
    }
  }
  return 'se_fue'
}

const isQuestion = (ev: string) => ev === 'doubt' || ev === 'help_option'

const hourOf = (iso: string): number => {
  const h = parseInt(BOGOTA_HOUR.format(new Date(iso)), 10)
  return Number.isFinite(h) ? h % 24 : 0
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)
const dowOf = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay()

function top<K, T>(map: Map<K, T>, score: (v: T) => number, n: number): [K, T][] {
  return [...map.entries()].sort((a, b) => score(b[1]) - score(a[1])).slice(0, n)
}

// ─── Cálculo principal ────────────────────────────────────────────────────────

export function analyzeChat(rows: ChatEventRow[], range: { from: string; to: string; days: string[] }): ChatAnalytics {
  const sessions = groupSessions(rows)
  const labels = labelIndex()
  const total = sessions.length

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const count = (pred: (s: Sess) => boolean) => sessions.reduce((n, s) => n + (pred(s) ? 1 : 0), 0)
  const engagedOf = (s: Sess) => s.rows.some(r => r.ev !== 'open' && r.ev !== 'close' && r.ev !== 'view')
  const askedOf = (s: Sess) => s.evs.has('doubt') || s.evs.has('help_option')

  const kpis: Kpis = {
    sessions: total,
    engaged: count(engagedOf),
    asked: count(askedOf),
    reserveStarted: count(s => s.evs.has('reserve_start')),
    saved: count(s => s.evs.has('reserve_saved')),
    failed: count(s => s.evs.has('reserve_failed') && !s.evs.has('reserve_saved')),
    advisorSent: count(s => s.evs.has('advisor_sent')),
    waDirect: count(s => s.evs.has('wa_direct')),
    waAfterReserve: count(s => s.evs.has('wa_after_reserve')),
    contacts: count(s => s.evs.has('reserve_saved') || s.evs.has('advisor_sent')),
  }

  // ── Embudos ─────────────────────────────────────────────────────────────────
  const toSteps = (defs: { key: string; label: string; n: number }[]): FunnelStep[] =>
    defs.map((d, i) => ({
      key: d.key,
      label: d.label,
      sessions: d.n,
      pctOfTop: ratio(d.n, defs[0].n),
      pctOfPrev: i === 0 ? 1 : ratio(d.n, defs[i - 1].n),
    }))

  const engagement = toSteps([
    { key: 'open', label: 'Abrió el chat', n: total },
    { key: 'engaged', label: 'Tocó algo', n: kpis.engaged },
    { key: 'topic', label: 'Eligió una categoría o dudas generales', n: count(s => s.evs.has('menu_cat') || s.evs.has('menu_general')) },
    { key: 'asked', label: 'Preguntó o pidió ayuda para elegir', n: kpis.asked },
    { key: 'reserve', label: 'Inició una reserva', n: kpis.reserveStarted },
    { key: 'saved', label: 'Dejó la reserva guardada', n: kpis.saved },
  ])

  const stageOf = (r: ChatEventRow): number => {
    switch (r.ev) {
      case 'reserve_start': return 1
      case 'opt_pick': return 2
      case 'day_pick': return 3
      case 'time_pick': return 4
      case 'phone_step': return r.k === 'reserve' ? 5 : 0
      case 'reserve_saved': return 6
      default: return 0
    }
  }
  const maxStage = sessions.map(s => s.rows.reduce((m, r) => Math.max(m, stageOf(r)), 0))
  const reached = (n: number) => maxStage.filter(x => x >= n).length
  const reservation = toSteps([
    { key: 'start', label: 'Inició la reserva', n: reached(1) },
    { key: 'opt', label: 'Eligió servicio y duración', n: reached(2) },
    { key: 'day', label: 'Eligió el día', n: reached(3) },
    { key: 'time', label: 'Eligió la hora (le pedimos el nombre)', n: reached(4) },
    { key: 'phone', label: 'Llegó al celular', n: reached(5) },
    { key: 'saved', label: 'Reserva guardada', n: reached(6) },
  ])

  // ── Qué escoge primero y qué busca en cada categoría ───────────────────────
  const firstChoice = new Map<string, number>()
  for (const s of sessions) {
    const r = s.rows.find(x => x.ev === 'menu_cat' || x.ev === 'menu_general')
    if (!r) continue
    const scope = r.ev === 'menu_general' ? 'general' : (r.k as string)
    firstChoice.set(scope, (firstChoice.get(scope) ?? 0) + 1)
  }

  const scopeOrder: ChatScope[] = ['masajes', 'faciales', 'depilacion', 'general']
  const scopes: ScopeStat[] = scopeOrder.map(scope => {
    const has = (pred: (r: ChatEventRow) => boolean) => count(s => s.rows.some(pred))
    return {
      scope,
      label: SCOPE_LABELS[scope],
      chose: has(r => (scope === 'general' ? r.ev === 'menu_general' : r.ev === 'menu_cat' && r.k === scope)),
      help: has(r => r.ev === 'branch_help' && r.cat === scope),
      catalog: has(r => r.ev === 'branch_catalog' && r.cat === scope),
      doubts: has(r => r.ev === 'branch_doubts' && r.cat === scope),
      sens: has(r => r.ev === 'sens_open' && r.cat === scope),
      asked: has(r => isQuestion(r.ev) && r.cat === scope),
      reserveStart: has(r => r.ev === 'reserve_start' && r.cat === scope),
    }
  })

  // ── Preguntas y necesidades ────────────────────────────────────────────────
  interface Acc { ev: string; scope: ChatScope; k: string; sessions: Set<string>; clicks: number; outcomes: OutcomeCounts }
  const qacc = new Map<string, Acc>()
  for (const s of sessions) {
    s.rows.forEach((r, i) => {
      if (!isQuestion(r.ev) || !r.k || !r.cat) return
      const key = `${r.ev}|${r.cat}|${r.k}`
      let a = qacc.get(key)
      if (!a) {
        a = { ev: r.ev, scope: r.cat as ChatScope, k: r.k, sessions: new Set(), clicks: 0, outcomes: emptyOutcomes() }
        qacc.set(key, a)
      }
      a.sessions.add(s.id)
      a.clicks += 1
      a.outcomes[nextOutcome(s.rows, i)] += 1
    })
  }

  const toStat = (a: Acc): QuestionStat => {
    const kind = a.ev === 'doubt' ? 'doubt' : 'help'
    const meta = labels.get(labelKey(kind, a.scope, a.k))
    const delicate = meta?.delicate ?? false
    const topic = topicOf(a.k, delicate)
    return {
      id: `${a.ev}|${a.scope}|${a.k}`,
      kind,
      label: a.k,
      scope: a.scope,
      scopeLabel: SCOPE_LABELS[a.scope],
      delicate,
      topic,
      topicLabel: TOPICS[topic].label,
      sessions: a.sessions.size,
      clicks: a.clicks,
      outcomes: a.outcomes,
      answer: meta?.answer ?? [],
      follow: meta?.follow ?? [],
    }
  }
  const bySessions = (a: QuestionStat, b: QuestionStat) => b.sessions - a.sessions || b.clicks - a.clicks
  const allStats = [...qacc.values()].map(toStat)
  const questions = allStats.filter(q => q.kind === 'doubt').sort(bySessions)
  const needs = allStats.filter(q => q.kind === 'help').sort(bySessions)

  // Temas: una sesión cuenta una vez por tema aunque abra varias preguntas de él.
  const tacc = new Map<TopicKey, { sessions: Set<string>; clicks: number; outcomes: OutcomeCounts; q: Map<string, Set<string>> }>()
  for (const [key, a] of qacc) {
    const st = allStats.find(x => x.id === key)
    if (!st) continue
    let t = tacc.get(st.topic)
    if (!t) {
      t = { sessions: new Set(), clicks: 0, outcomes: emptyOutcomes(), q: new Map() }
      tacc.set(st.topic, t)
    }
    a.sessions.forEach(id => t.sessions.add(id))
    t.clicks += a.clicks
    ;(Object.keys(a.outcomes) as Outcome[]).forEach(o => { t.outcomes[o] += a.outcomes[o] })
    const qs = t.q.get(st.label) ?? new Set<string>()
    a.sessions.forEach(id => qs.add(id))
    t.q.set(st.label, qs)
  }
  const topics: TopicStat[] = [...tacc.entries()]
    .map(([key, t]) => ({
      key,
      label: TOPICS[key].label,
      sessions: t.sessions.size,
      clicks: t.clicks,
      share: ratio(t.sessions.size, kpis.asked),
      outcomes: t.outcomes,
      playbook: TOPICS[key].playbook,
      top: top(t.q, v => v.size, 3).map(([label, v]) => ({ label, sessions: v.size })),
    }))
    .sort((a, b) => b.sessions - a.sessions)

  const delicateSessions = count(s => s.rows.some(r => {
    if (r.ev === 'sens_open') return true
    if (!isQuestion(r.ev) || !r.k || !r.cat) return false
    return labels.get(labelKey(r.ev === 'doubt' ? 'doubt' : 'help', r.cat, r.k))?.delicate === true
  }))
  const delicate = { sessions: delicateSessions, opened: count(s => s.evs.has('sens_open')) }

  // ── Servicios ──────────────────────────────────────────────────────────────
  const svc = new Map<string, { info: Set<string>; start: Set<string>; picked: Set<string> }>()
  const slot = (id: string) => {
    let v = svc.get(id)
    if (!v) { v = { info: new Set(), start: new Set(), picked: new Set() }; svc.set(id, v) }
    return v
  }
  const opts = new Map<string, Set<string>>()
  for (const s of sessions) {
    for (const r of s.rows) {
      if (r.ev === 'svc_info' && r.k) slot(r.k).info.add(s.id)
      else if (r.ev === 'reserve_start' && r.k) slot(r.k).start.add(s.id)
      else if (r.ev === 'opt_pick' && r.k) {
        const [id, label] = r.k.split('|')
        slot(id).picked.add(s.id)
        const key = `${svcName(id)} · ${label}`
        const set = opts.get(key) ?? new Set<string>()
        set.add(s.id)
        opts.set(key, set)
      }
    }
  }
  const services: ServiceStat[] = [...svc.entries()]
    .map(([id, v]) => ({ id, name: svcName(id), info: v.info.size, reserveStart: v.start.size, picked: v.picked.size }))
    .sort((a, b) => Math.max(b.info, b.picked, b.reserveStart) - Math.max(a.info, a.picked, a.reserveStart))
  const options: CountItem[] = top(opts, v => v.size, 10).map(([label, v]) => ({ key: label, label, sessions: v.size }))

  // ── Dónde se van ───────────────────────────────────────────────────────────
  const lost = sessions.filter(s => !s.evs.has('reserve_saved') && !s.evs.has('advisor_sent') && !s.evs.has('wa_direct') && !s.evs.has('wa_after_reserve'))
  const drop = new Map<string, number>()
  const leftAfter = new Map<string, { label: string; scope: ChatScope; n: number }>()
  for (const s of lost) {
    const lastView = [...s.rows].reverse().find(r => r.ev === 'view' && r.k)
    if (lastView?.k) drop.set(lastView.k, (drop.get(lastView.k) ?? 0) + 1)
    const lastQ = [...s.rows].reverse().find(r => isQuestion(r.ev) && r.k && r.cat)
    if (lastQ?.k && lastQ.cat) {
      const key = `${lastQ.cat}|${lastQ.k}`
      const cur = leftAfter.get(key) ?? { label: lastQ.k, scope: lastQ.cat as ChatScope, n: 0 }
      cur.n += 1
      leftAfter.set(key, cur)
    }
  }
  const dropoff: CountItem[] = top(drop, v => v, 8).map(([node, n]) => ({
    key: node,
    label: (CHAT_NODES as readonly string[]).includes(node) ? NODE_LABELS[node as ChatNode] : node,
    sessions: n,
  }))
  const toLeft = (m: Map<string, { label: string; scope: ChatScope; n: number }>): CountItem[] =>
    top(m, v => v.n, 8).map(([key, v]) => ({ key, label: `${v.label} (${SCOPE_LABELS[v.scope]})`, sessions: v.n }))

  const waLeft = new Map<string, { label: string; scope: ChatScope; n: number }>()
  for (const s of sessions) {
    if (!s.evs.has('wa_direct')) continue
    const waIdx = s.rows.findIndex(r => r.ev === 'wa_direct')
    const lastQ = [...s.rows.slice(0, waIdx)].reverse().find(r => isQuestion(r.ev) && r.k && r.cat)
    if (!lastQ?.k || !lastQ.cat) continue
    const key = `${lastQ.cat}|${lastQ.k}`
    const cur = waLeft.get(key) ?? { label: lastQ.k, scope: lastQ.cat as ChatScope, n: 0 }
    cur.n += 1
    waLeft.set(key, cur)
  }

  // ── Demanda de reserva ─────────────────────────────────────────────────────
  const leadBuckets = [
    { key: '0', label: 'Hoy', n: 0 },
    { key: '1', label: 'Mañana', n: 0 },
    { key: '2-3', label: 'En 2 o 3 días', n: 0 },
    { key: '4-7', label: 'En 4 a 7 días', n: 0 },
    { key: '8+', label: 'En más de una semana', n: 0 },
  ]
  const weekday = new Array<number>(7).fill(0)
  const hourPicks = new Map<number, number>()
  const noSlotDates = new Map<string, Set<string>>()
  let noSlotEvents = 0
  let phoneInvalidEvents = 0
  const noSlotSessions = new Set<string>()
  const phoneInvalidSessions = new Set<string>()
  for (const s of sessions) {
    const lastDay = [...s.rows].reverse().find(r => r.ev === 'day_pick' && r.k)
    if (lastDay?.k) {
      const d = dayDiff(lastDay.k, s.day)
      const b = d <= 0 ? 0 : d === 1 ? 1 : d <= 3 ? 2 : d <= 7 ? 3 : 4
      leadBuckets[b].n += 1
      weekday[dowOf(lastDay.k)] += 1
    }
    const lastTime = [...s.rows].reverse().find(r => r.ev === 'time_pick' && r.k)
    if (lastTime?.k) {
      const h = parseInt(lastTime.k.slice(0, 2), 10)
      if (Number.isFinite(h)) hourPicks.set(h, (hourPicks.get(h) ?? 0) + 1)
    }
    for (const r of s.rows) {
      if (r.ev === 'no_slots') {
        noSlotEvents += 1
        noSlotSessions.add(s.id)
        if (r.k) {
          const set = noSlotDates.get(r.k) ?? new Set<string>()
          set.add(s.id)
          noSlotDates.set(r.k, set)
        }
      } else if (r.ev === 'phone_invalid') {
        phoneInvalidEvents += 1
        phoneInvalidSessions.add(s.id)
      }
    }
  }

  // ── Cuándo escriben ────────────────────────────────────────────────────────
  const byHour = new Array<number>(24).fill(0)
  const byWeekday = new Array<number>(7).fill(0)
  const dayStats = new Map<string, { sessions: number; engaged: number; saved: number }>()
  for (const d of range.days) dayStats.set(d, { sessions: 0, engaged: 0, saved: 0 })
  for (const s of sessions) {
    byHour[hourOf(s.openedAt)] += 1
    byWeekday[dowOf(s.day)] += 1
    const d = dayStats.get(s.day)
    if (d) {
      d.sessions += 1
      if (engagedOf(s)) d.engaged += 1
      if (s.evs.has('reserve_saved')) d.saved += 1
    }
  }

  // ── Segmentos ──────────────────────────────────────────────────────────────
  const segment = (key: string, label: string, pred: (s: Sess) => boolean): Segment => {
    const list = sessions.filter(pred)
    return {
      key,
      label,
      sessions: list.length,
      engagedRate: ratio(list.filter(engagedOf).length, list.length),
      askedRate: ratio(list.filter(askedOf).length, list.length),
      savedRate: ratio(list.filter(s => s.evs.has('reserve_saved')).length, list.length),
    }
  }
  const segments = [
    segment('m', 'Celular', s => s.dev === 'm'),
    segment('d', 'Computador', s => s.dev === 'd'),
    segment('ads', 'Llegó de un anuncio', s => s.ads),
    segment('org', 'Entró sin anuncio', s => !s.ads),
    segment('es', 'Español', s => s.lang !== 'en'),
    segment('en', 'Inglés', s => s.lang === 'en'),
  ].filter(x => x.sessions > 0)

  const adg = new Map<string, Sess[]>()
  for (const s of sessions) if (s.adg) adg.set(s.adg, [...(adg.get(s.adg) ?? []), s])
  const adGroups: AdGroupStat[] = top(adg, v => v.length, 8).map(([name, list]) => {
    const tc = new Map<TopicKey, number>()
    for (const s of list) {
      const seen = new Set<TopicKey>()
      for (const r of s.rows) {
        if (!isQuestion(r.ev) || !r.k || !r.cat) continue
        const delicateQ = labels.get(labelKey(r.ev === 'doubt' ? 'doubt' : 'help', r.cat, r.k))?.delicate === true
        seen.add(topicOf(r.k, delicateQ))
      }
      seen.forEach(t => tc.set(t, (tc.get(t) ?? 0) + 1))
    }
    const best = top(tc, v => v, 1)[0]
    return {
      adg: name,
      sessions: list.length,
      asked: list.filter(askedOf).length,
      saved: list.filter(s => s.evs.has('reserve_saved')).length,
      topTopic: best ? TOPICS[best[0]].label : null,
    }
  })

  const result: Omit<ChatAnalytics, 'insights'> = {
    range: { from: range.from, to: range.to, days: range.days.length },
    kpis,
    engagement,
    reservation,
    firstChoice: scopeOrder
      .filter(sc => firstChoice.has(sc))
      .map(sc => ({ key: sc, label: SCOPE_LABELS[sc], sessions: firstChoice.get(sc) ?? 0 })),
    scopes,
    topics,
    questions,
    needs,
    delicate,
    services,
    options,
    dropoff,
    leftAfter: toLeft(leftAfter),
    waAfter: toLeft(waLeft),
    demand: {
      lead: leadBuckets.map(b => ({ key: b.key, label: b.label, sessions: b.n })),
      weekday: WEEKDAYS.map((label, i) => ({ key: String(i), label, sessions: weekday[i] })),
      hours: top(hourPicks, v => v, 8)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([h, n]) => ({ key: String(h), label: `${String(h).padStart(2, '0')}:00`, sessions: n })),
      noSlots: {
        events: noSlotEvents,
        sessions: noSlotSessions.size,
        dates: top(noSlotDates, v => v.size, 5).map(([d, v]) => ({ key: d, label: d, sessions: v.size })),
      },
      phoneInvalid: { events: phoneInvalidEvents, sessions: phoneInvalidSessions.size },
    },
    time: {
      byHour,
      byWeekday,
      byDay: range.days.map(day => ({ day, ...(dayStats.get(day) ?? { sessions: 0, engaged: 0, saved: 0 }) })),
    },
    segments,
    adGroups,
  }
  return { ...result, insights: buildInsights(result) }
}

// ─── Lectura de CRO: qué significan las cifras y qué hacer ────────────────────

/** Mínimo de veces que se abrió una respuesta para opinar sobre ella. */
const MIN_OCC = 5

const occurrences = (o: OutcomeCounts) => o.reserva + o.whatsapp + o.sigue + o.se_fue

export function buildInsights(a: Omit<ChatAnalytics, 'insights'>): Insight[] {
  const out: Insight[] = []
  const k = a.kpis

  if (k.sessions === 0) {
    return [{
      id: 'sin-datos',
      level: 'info',
      title: 'Todavía no hay clics registrados',
      evidence: 'El registro empieza cuando se publica este panel; no hay historial anterior del chat.',
      action: 'Deja que corra unos días con la pauta activa. Con unas 100 sesiones las conclusiones ya son firmes.',
    }]
  }

  if (k.failed > 0) {
    out.push({
      id: 'reservas-no-guardadas',
      level: 'alta',
      title: `${k.failed} reserva${k.failed === 1 ? '' : 's'} no se pudo${k.failed === 1 ? '' : 'n'} guardar`,
      evidence: 'La persona llegó hasta el final, dio su celular y el servidor no guardó la cita (o ya había un registro reciente con ese número).',
      action: 'Revisa los registros de /api/whatsapp-lead. A esas personas se les mostró el botón de WhatsApp con la reserva escrita: confirma en recepción que escribieron.',
    })
  }

  if (k.sessions < 30) {
    out.push({
      id: 'pocos-datos',
      level: 'info',
      title: `Solo ${k.sessions} sesiones: lee las cifras como pistas, no como conclusiones`,
      evidence: 'Con tan pocas conversaciones un solo visitante mueve los porcentajes.',
      action: 'Espera a tener unas 100 sesiones antes de cambiar respuestas o la landing.',
    })
  }

  // Interés: qué hacen al abrir una categoría.
  const intent = a.scopes.filter(s => s.scope !== 'general').reduce(
    (acc, s) => ({ help: acc.help + s.help, catalog: acc.catalog + s.catalog, doubts: acc.doubts + s.doubts }),
    { help: 0, catalog: 0, doubts: 0 },
  )
  const intentTotal = intent.help + intent.catalog + intent.doubts
  if (intentTotal >= 10) {
    if (ratio(intent.catalog, intentTotal) >= 0.5) {
      out.push({
        id: 'busca-precios',
        level: 'info',
        title: `${pctText(ratio(intent.catalog, intentTotal))} entra directo a ver servicios y precios`,
        evidence: `${intent.catalog} de ${intentTotal} entradas a una categoría fueron a "Ver … y precios"; ${intent.help} pidieron ayuda para elegir y ${intent.doubts} abrieron dudas.`,
        action: 'Quien llega comparando precio no necesita una charla: pon precios y duración a la vista en la landing y deja "Reservar" en cada tarjeta, como ya está en el catálogo del chat.',
      })
    } else if (ratio(intent.help + intent.doubts, intentTotal) >= 0.6) {
      out.push({
        id: 'busca-orientacion',
        level: 'info',
        title: `${pctText(ratio(intent.help + intent.doubts, intentTotal))} entra a preguntar o pedir ayuda antes de ver precios`,
        evidence: `${intent.help} pidieron ayuda para elegir y ${intent.doubts} abrieron dudas, frente a ${intent.catalog} que fueron al catálogo.`,
        action: 'La landing no les está resolviendo la decisión. Sube la orientación ("¿cuál es para mí?") a la parte alta y deja el catálogo después.',
      })
    }
  }

  // Tema número uno.
  if (k.asked >= 5 && a.topics.length > 0) {
    const t = a.topics[0]
    out.push({
      id: 'tema-principal',
      level: 'info',
      title: `Lo que más preguntan: ${t.label.toLowerCase()} (${pctText(t.share)} de quienes preguntan)`,
      evidence: `${t.sessions} sesiones. Las preguntas más tocadas de este tema: ${t.top.map(x => `"${x.label}"`).join(', ')}.`,
      action: t.playbook[0] ?? 'Revisa la respuesta del chat para este tema y llévala a la landing.',
    })
  }

  // Respuestas que no cierran o que mandan a WhatsApp.
  const judged = [...a.questions, ...a.needs].filter(q => occurrences(q.outcomes) >= MIN_OCC)
  const leaks = judged
    .filter(q => ratio(q.outcomes.se_fue, occurrences(q.outcomes)) >= 0.5)
    .sort((x, y) => y.outcomes.se_fue - x.outcomes.se_fue)
    .slice(0, 3)
  for (const q of leaks) {
    out.push({
      id: `se-fue-${q.id}`,
      level: 'alta',
      title: `Tras "${q.label}" la mayoría se va (${pctText(ratio(q.outcomes.se_fue, occurrences(q.outcomes)))})`,
      evidence: `${q.scopeLabel}: la respuesta se abrió ${occurrences(q.outcomes)} veces; ${q.outcomes.se_fue} terminaron ahí, ${q.outcomes.reserva} siguieron a reservar y ${q.outcomes.whatsapp} escribieron por WhatsApp.`,
      action: 'Esa respuesta no cierra la duda ni invita a reservar. Reescríbela con un dato concreto (precio, tiempo o garantía) y termina con el botón de reservar el servicio que corresponde.',
    })
  }
  const escalates = judged
    .filter(q => ratio(q.outcomes.whatsapp, occurrences(q.outcomes)) >= 0.4)
    .sort((x, y) => y.outcomes.whatsapp - x.outcomes.whatsapp)
    .slice(0, 2)
  for (const q of escalates) {
    out.push({
      id: `whatsapp-${q.id}`,
      level: 'media',
      title: `"${q.label}" termina en WhatsApp (${pctText(ratio(q.outcomes.whatsapp, occurrences(q.outcomes)))})`,
      evidence: `${q.scopeLabel}: de ${occurrences(q.outcomes)} veces abierta, ${q.outcomes.whatsapp} pidieron hablar con una persona.`,
      action: 'La respuesta deja algo sin resolver. Averigua con recepción qué preguntan en ese chat y agrégalo a la respuesta; así recepción recibe menos preguntas repetidas.',
    })
  }
  const winners = judged
    .filter(q => ratio(q.outcomes.reserva, occurrences(q.outcomes)) >= 0.3)
    .sort((x, y) => ratio(y.outcomes.reserva, occurrences(y.outcomes)) - ratio(x.outcomes.reserva, occurrences(x.outcomes)))
    .slice(0, 2)
  for (const q of winners) {
    out.push({
      id: `convierte-${q.id}`,
      level: 'info',
      title: `"${q.label}" lleva a reservar (${pctText(ratio(q.outcomes.reserva, occurrences(q.outcomes)))})`,
      evidence: `${q.scopeLabel}: de ${occurrences(q.outcomes)} veces abierta, ${q.outcomes.reserva} siguieron a reservar.`,
      action: 'Esta respuesta funciona. Copia su enfoque (qué dice y cómo cierra) en la landing y en las otras respuestas que pierden gente.',
    })
  }

  // Preguntas que da pena hacer.
  if (a.delicate.sessions >= 3 && k.asked > 0 && ratio(a.delicate.sessions, k.asked) >= 0.1) {
    out.push({
      id: 'delicadas',
      level: 'media',
      title: `${a.delicate.sessions} personas tocaron las preguntas que da pena hacer (${pctText(ratio(a.delicate.sessions, k.asked))} de quienes preguntan)`,
      evidence: 'Quien llega a esa lista tiene una barrera emocional, no de información: pena, miedo a que duela o a que sea incómodo.',
      action: TOPICS.confianza.playbook[0],
    })
  }

  // Dónde se rompe la reserva.
  const stepAdvice: Record<string, { title: string; action: string }> = {
    opt: {
      title: 'Empiezan a reservar y no escogen servicio o duración',
      action: 'Quita fricción en esa pantalla: preselecciona la duración más pedida y muestra el precio junto a cada opción.',
    },
    day: {
      title: 'Escogen servicio y no llegan a elegir el día',
      action: 'Muestra primero hoy y mañana con horarios libres, en vez de un calendario vacío.',
    },
    time: {
      title: 'Escogen día y no eligen hora',
      action: 'Revisa si ese día tiene horas disponibles (mira "sin horarios" abajo) y muestra las horas más cercanas de una vez.',
    },
    phone: {
      title: 'Eligen hora y no llegan a dar el celular',
      action: 'Pedir el nombre antes del celular puede estar frenando: hazlo opcional y explica en una línea que el celular es para confirmar la cita.',
    },
    saved: {
      title: 'Llegan al celular y la reserva no se guarda',
      action: 'Revisa errores de teléfono y del servidor: es la fuga más cara, porque la persona ya decidió.',
    },
  }
  const leak = a.reservation
    .slice(1)
    .map((s, i) => ({ s, prev: a.reservation[i] }))
    .filter(x => x.prev.sessions >= MIN_OCC && x.s.pctOfPrev < 0.6)
    .sort((x, y) => x.s.pctOfPrev - y.s.pctOfPrev)[0]
  if (leak) {
    const adv = stepAdvice[leak.s.key]
    out.push({
      id: `fuga-${leak.s.key}`,
      level: leak.s.pctOfPrev < 0.4 ? 'alta' : 'media',
      title: adv.title,
      evidence: `Solo ${pctText(leak.s.pctOfPrev)} pasa de "${leak.prev.label}" a "${leak.s.label}" (${leak.prev.sessions} → ${leak.s.sessions} sesiones).`,
      action: adv.action,
    })
  }

  if (a.demand.phoneInvalid.sessions >= 3) {
    out.push({
      id: 'celular-invalido',
      level: 'media',
      title: `${a.demand.phoneInvalid.sessions} personas se equivocaron al escribir el celular`,
      evidence: `${a.demand.phoneInvalid.events} intentos inválidos. Cada error es una persona a punto de abandonar.`,
      action: 'Revisa el ejemplo del campo y el prefijo por defecto; acepta espacios y guiones y muestra el formato esperado.',
    })
  }
  if (a.demand.noSlots.sessions >= 3) {
    out.push({
      id: 'sin-horarios',
      level: 'media',
      title: `${a.demand.noSlots.sessions} personas escogieron un día sin horarios libres`,
      evidence: `Fechas más repetidas: ${a.demand.noSlots.dates.map(d => d.label).join(', ') || '—'}.`,
      action: 'Es demanda que se pierde: si se repite en un mismo día u hora, abre más cupos o muestra de entrada los días con disponibilidad.',
    })
  }

  // Salida directa a WhatsApp.
  if (k.waDirect >= 5 && ratio(k.waDirect, Math.max(k.engaged, 1)) >= 0.25) {
    const topLeft = a.waAfter.slice(0, 2).map(x => `"${x.label}"`).join(' y ')
    out.push({
      id: 'sale-a-whatsapp',
      level: 'media',
      title: `${pctText(ratio(k.waDirect, Math.max(k.engaged, 1)))} de quienes interactúan salen directo a WhatsApp`,
      evidence: topLeft ? `Antes de irse, lo último que miraban: ${topLeft}.` : 'Prefieren hablar con una persona antes que terminar la reserva en el chat.',
      action: 'No es malo, pero cada salida es una reserva que depende de que recepción responda rápido. Ofrece reservar desde esas respuestas y deja el WhatsApp como segunda opción.',
    })
  }

  // Poco enganche.
  if (k.sessions >= 20 && ratio(k.engaged, k.sessions) < 0.5) {
    out.push({
      id: 'poco-enganche',
      level: 'media',
      title: `Solo ${pctText(ratio(k.engaged, k.sessions))} toca algo después de abrir el chat`,
      evidence: `${k.sessions - k.engaged} de ${k.sessions} sesiones abrieron el chat y lo cerraron sin hacer clic.`,
      action: 'El saludo o el menú inicial no les da una razón para seguir. Prueba un primer mensaje más específico ("¿Quieres ver precios o tienes una duda?") y deja los botones más pedidos arriba.',
    })
  }

  const order = { alta: 0, media: 1, info: 2 } as const
  return out.sort((x, y) => order[x.level] - order[y.level])
}
