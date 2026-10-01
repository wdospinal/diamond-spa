'use client'

/**
 * Chat de la pauta (español e inglés): de las dudas a la reserva.
 *
 * Una recepción en línea que resuelve dudas, ayuda a elegir servicio y arma
 * la reserva (1 o 2 personas, como un carrito). Nombre y celular se piden
 * solo al final, cuando la persona decide reservar o hablar con una asesora.
 * "Escribir directo a WhatsApp" queda fijo al pie, en todas las pantallas.
 *
 * Los textos viven en lib/chat-flow-es.ts y lib/chat-flow-en.ts (se elige con
 * lib/chat-flow.ts), los de la interfaz en lib/chat-ui.ts y los precios en
 * lib/chat-catalog.ts. El idioma lo decide la página (/es o /en).
 */

import { Fragment, useEffect, useRef, useState } from 'react'
import { randomWhatsAppUrl, SPA_GOOGLE_MAPS_URL } from '@/lib/spa'
import { pushEvent } from '@/lib/gtm'
import { userDataFor } from '@/lib/user-data'
import { EVENTS, trackEvent } from '@/lib/events'
import {
  DUO_TECHNIQUES, catsFor, money, optionMinutes, phoneDigits, svcById as baseSvcById, svcsOf as baseSvcsOf, validChatPhone,
  type Cat, type Locale, type Svc,
} from '@/lib/chat-catalog'
import type { Doubt, Follow, IconName } from '@/lib/chat-flow-es'
import { flowFor } from '@/lib/chat-flow'
import { uiFor, type ChatUI } from '@/lib/chat-ui'
import { availableSlots, bogotaNow, dayBlocked, monthCells } from '@/lib/chat-slots'

const BASE_COUNTRY_CODES = [
  { code: '+57', flag: '🇨🇴' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+34', flag: '🇪🇸' },
  { code: '+52', flag: '🇲🇽' },
  { code: '+507', flag: '🇵🇦' },
  { code: '+56', flag: '🇨🇱' },
  { code: '+54', flag: '🇦🇷' },
  { code: '+593', flag: '🇪🇨' },
  { code: '+51', flag: '🇵🇪' },
]


type Msg =
  | { from: 'bot' | 'user'; text: string }
  | { from: 'bot'; kind: 'summary'; rows: string[]; total: string }

type Node =
  | 'intro' | 'menu' | 'general' | 'branch' | 'help' | 'helpGroup' | 'catalog' | 'doubts' | 'answer'
  | 'people' | 'plan' | 'cat' | 'svc' | 'svcInfo' | 'opt' | 'tech' | 'date' | 'time' | 'name' | 'phone'
  | 'group' | 'sending' | 'done'

type Plan = 'solo' | 'duo' | 'same' | 'distinct'
type Line = { svcId: string; name: string; opt: string; price: number; mins: number }
type Kind = 'reserve' | 'advisor' | 'direct' | 'group' | 'change'


// ─── Iconos de línea fina, de un solo color ──────────────────────────────────
const ICONS: Record<IconName, React.ReactNode> = {
  pin: (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  tag: (<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" /><circle cx="7.5" cy="7.5" r=".6" fill="currentColor" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  refresh: (<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></>),
  sparkles: (<><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0Z" /></>),
  users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  user: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  help: (<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></>),
  hand: (<><path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></>),
  leaf: (<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>),
  back: (<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>),
  external: (<><path d="M15 3h6v6M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
  chat: (<><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></>),
}

function ChatIcon({ name, className = 'w-4 h-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} flex-shrink-0`}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

function Chip({
  children, onClick, icon, block = false, ghost = false,
}: {
  children: React.ReactNode
  onClick: () => void
  icon?: IconName
  block?: boolean
  ghost?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-left text-[13px] leading-snug font-body transition-colors active:scale-[0.98] ${
        block ? 'w-full' : ''
      } ${
        ghost
          ? 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
          : 'text-on-surface/90 border border-[#a5cce6]/35 hover:bg-[#a5cce6]/15 hover:border-[#a5cce6]/70'
      }`}
    >
      {icon && <ChatIcon name={icon} className="w-4 h-4 text-[#a5cce6]" />}
      <span>{children}</span>
    </button>
  )
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
const catLabel = (c: Cat, locale: Locale) => catsFor(locale).find(x => x.id === c)?.label ?? c
const catIcon = (c: Cat): IconName => (c === 'masajes' ? 'hand' : c === 'faciales' ? 'sparkles' : 'leaf')
const dayLabel = (y: number, mo: number, d: number, dateLocale: string) =>
  new Date(y, mo, d).toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })

function followLabel(f: Follow, T: ChatUI, locale: Locale): string {
  switch (f.k) {
    case 'reserve': return f.svc ? T.reserveSvc(baseSvcById(f.svc, locale).short) : T.wantReserve
    case 'reserveCat': return catLabel(f.cat, locale)
    case 'catalog': return f.label ?? catLabel(f.cat, locale)
    case 'doubt': return T.anotherDoubt
    case 'menu': return T.backToMenu
    case 'maps': return T.seeMaps
    case 'advisor': return T.talkAdvisor
    case 'direct':
    case 'change': return T.writeDirect
    case 'people': return f.n === 2 ? T.weAre2 : T.weAre3
  }
}

function followIcon(f: Follow): IconName | undefined {
  switch (f.k) {
    case 'reserveCat':
    case 'catalog': return catIcon(f.cat)
    case 'maps': return 'external'
    case 'advisor':
    case 'direct':
    case 'change': return 'chat'
    case 'menu': return 'back'
    case 'people': return f.n === 2 ? 'users' : 'users'
    default: return undefined
  }
}

function readAttribution() {
  let gclid = '', adgroup = '', campaign = '', isAds = false
  try {
    const p = new URLSearchParams(window.location.search)
    gclid = p.get('gclid') || p.get('wbraid') || p.get('gbraid') || sessionStorage.getItem('gclid') || ''
    adgroup = p.get('adgroup') || sessionStorage.getItem('sem_adgroup') || ''
    campaign = p.get('utm_campaign') || sessionStorage.getItem('sem_campaign') || ''
    if (
      gclid || adgroup || campaign ||
      p.get('utm_source') === 'ads' || p.get('utm_medium') === 'cpc' ||
      sessionStorage.getItem('sem_trigger_key')
    ) isAds = true
  } catch { /* ignore */ }
  return { gclid, adgroup, campaign, isAds }
}

function postLead(body: Record<string, unknown>) {
  try {
    const json = JSON.stringify(body)
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/whatsapp-lead', new Blob([json], { type: 'application/json' }))
    } else {
      fetch('/api/whatsapp-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => {})
    }
  } catch { /* silent */ }
}

function priceLine(s: Svc) {
  if (s.cat === 'depilacion') return `${s.durMin} min · ` + s.prices.map(p => `${p.label} ${money(p.value)}`).join(' · ')
  if (s.prices.length === 1) return `${s.prices[0].label} · ${money(s.prices[0].value)}`
  return s.prices.map(p => `${p.label} ${money(p.value)}`).join(' · ')
}


const BUTTON: Record<Kind, string> = {
  reserve: 'chat_widget',
  direct: 'chat_widget',
  advisor: 'talk_advisor',
  group: 'group',
  change: 'change_appointment',
}

const pad = (n: number) => String(n).padStart(2, '0')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function PautaChatWidget({
  onClose, customText, locale = 'es',
}: { onClose: () => void; customText?: string; locale?: Locale }) {
  const T = uiFor(locale)
  // English visitors may read $220.000 as $220.00: summaries and messages state COP.
  const moneyFull = (n: number) => (locale === 'en' ? `${money(n)} COP` : money(n))
  const {
    ASK_BACK, ASK_DELICATE, ASK_DOUBT, ASK_GENERAL, ASK_MENU, BRANCHES, DELICATE_LABEL, GENERAL, GREETING, MASSAGE_ABOUT, RES,
  } = flowFor(locale)
  const countryCodes = [...BASE_COUNTRY_CODES, ...T.extraCountries]
  // Las consultas del catálogo salen ya en el idioma del chat.
  const svcById = (id: string) => baseSvcById(id, locale)
  const svcsOf = (c: Cat) => baseSvcsOf(c, locale)

  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(true)
  const [node, setNode] = useState<Node>('intro')

  // Navegación por ramas y respuestas
  const [cat, setCat] = useState<Cat | null>(null)
  const [follow, setFollow] = useState<Follow[]>([])
  const [scope, setScope] = useState<Cat | 'general'>('general')
  /** true mientras se ve la lista "Cosas que da pena preguntar" en vez de la principal. */
  const [sens, setSens] = useState(false)
  const [bare, setBare] = useState(false)
  /** Tema abierto dentro de "Ayúdame a elegir" (por ejemplo "dolor"). */
  const [helpGroup, setHelpGroup] = useState<string | null>(null)
  /** true si la respuesta que se ve vino de "Ayúdame a elegir": deja volver a las otras opciones. */
  const [fromHelp, setFromHelp] = useState(false)

  // Reserva
  const [plan, setPlan] = useState<Plan>('solo')
  const [preSvc, setPreSvc] = useState<Svc | null>(null)
  const [preCat, setPreCat] = useState<Cat | null>(null)
  const [cart, setCart] = useState<Line[]>([])
  const [techs, setTechs] = useState<string[]>([])
  const [curSvc, setCurSvc] = useState<Svc | null>(null)
  /** Masaje que la persona acaba de tocar en la lista y del que se muestra la descripción. */
  const [infoSvc, setInfoSvc] = useState<Svc | null>(null)
  const [duoOpt, setDuoOpt] = useState<number | null>(null)
  const [cal, setCal] = useState(() => {
    const n = bogotaNow()
    return { y: n.y, mo: n.mo }
  })
  const [day, setDay] = useState<number | null>(null)
  const [time, setTime] = useState<string | null>(null)

  // Contacto
  const [contactFor, setContactFor] = useState<'reserve' | 'advisor'>('reserve')
  const [name, setName] = useState('')
  const [nameIn, setNameIn] = useState('')
  const [code, setCode] = useState(T.defaultCountryCode)
  const [phoneIn, setPhoneIn] = useState('')
  const [phoneErr, setPhoneErr] = useState(false)
  const [fullPhone, setFullPhone] = useState('')

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const seq = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef(false)
  const lastOpenRef = useRef(0)
  const waUrlRef = useRef('')
  const leadRef = useRef({ any: false, withPhone: false })
  const topicRef = useRef({ topic: T.topicAdvisor, note: '' })

  const today = bogotaNow()
  const duoSvc = svcById('duo')
  /** En el Duo, si cada persona escoge una técnica distinta el precio es otro y lo confirma recepción. */
  const duoDiffers = plan === 'duo' && techs.length === 2 && techs[0] !== techs[1]
  const durMinutes =
    plan === 'duo'
      ? optionMinutes(duoSvc, duoOpt ?? 1)
      : cart.length ? Math.max(...cart.map(l => l.mins)) : 60

  // ── Conversación: burbujas con "escribiendo…" ──────────────────────────────
  function user(text: string) {
    setMessages(p => [...p, { from: 'user', text }])
  }

  function say(texts: string[], next: () => void) {
    const id = ++seq.current
    setBusy(true)
    let i = 0
    const run = () => {
      if (id !== seq.current) return
      setTyping(true)
      const t = setTimeout(() => {
        if (id !== seq.current) return
        const text = texts[i]
        setTyping(false)
        setMessages(p => [...p, { from: 'bot', text }])
        i += 1
        if (i < texts.length) run()
        else {
          setBusy(false)
          next()
        }
      }, Math.min(1000, 450 + texts[i].length * 5))
      timers.current.push(t)
    }
    run()
  }

  function go(userText: string | null, bot: string[], next: () => void) {
    if (userText) user(userText)
    say(bot, next)
  }

  useEffect(() => {
    const pending = timers.current
    const t = setTimeout(() => say(GREETING, () => setNode('menu')), 250)
    pending.push(t)
    return () => {
      seq.current += 1
      pending.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, node, busy])

  useEffect(() => {
    if (node !== 'name' && node !== 'phone') return
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [node, busy])

  // ── Menú, ramas y respuestas ───────────────────────────────────────────────
  function toMenu(userText?: string) {
    lockRef.current = false
    setSens(false)
    go(userText ?? null, [ASK_MENU], () => setNode('menu'))
  }

  function openBranch(c: Cat) {
    setCat(c)
    setSens(false)
    go(catLabel(c, locale), [BRANCHES[c].intro], () => setNode('branch'))
  }

  function showAnswer(label: string, texts: string[], f: Follow[], sc: Cat | 'general', isBare = false, fromHelpList = false) {
    setFollow(f)
    setScope(sc)
    setBare(isBare)
    setFromHelp(fromHelpList)
    go(label, texts, () => setNode('answer'))
  }

  function showDoubt(d: Doubt, sc: Cat | 'general') {
    showAnswer(d.label, d.answer, d.follow, sc, d.bare)
  }

  function onFollow(f: Follow) {
    switch (f.k) {
      case 'reserve': {
        const svc = f.svc ? svcById(f.svc) : null
        // "Quiero reservar" dentro de una duda de una categoría va directo a esa
        // categoría, sin ofrecer las otras.
        const inCat = !svc && scope !== 'general' ? scope : null
        return startReserve(svc, inCat, followLabel(f, T, locale))
      }
      case 'reserveCat': return startReserve(null, f.cat, followLabel(f, T, locale))
      case 'catalog':
        setCat(f.cat)
        return go(followLabel(f, T, locale), [BRANCHES[f.cat].catalogIntro], () => setNode('catalog'))
      case 'doubt':
        if (f.scope === 'general') return go(followLabel(f, T, locale), [ASK_GENERAL], () => setNode('general'))
        setCat(f.scope)
        return go(followLabel(f, T, locale), [ASK_DOUBT], () => setNode('doubts'))
      case 'menu': return toMenu(followLabel(f, T, locale))
      case 'maps':
        window.open(SPA_GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer')
        return
      case 'advisor': return startContact(followLabel(f, T, locale))
      case 'direct': return openWhatsApp('direct')
      case 'change': return openWhatsApp('change', followLabel(f, T, locale))
      case 'people': return pickPeople(f.n === 2 ? 2 : 3)
    }
  }

  // ── Reserva ────────────────────────────────────────────────────────────────
  function resetReservation() {
    lockRef.current = false
    setPlan('solo')
    setCart([])
    setTechs([])
    setCurSvc(null)
    setDuoOpt(null)
    setDay(null)
    setTime(null)
    setPreSvc(null)
    setPreCat(null)
  }

  function startReserve(svc: Svc | null, c: Cat | null, label: string) {
    resetReservation()
    setPreSvc(svc)
    setPreCat(c)
    if (svc?.id === 'duo') {
      setPlan('duo')
      go(label, RES.duoIntro, () => setNode('tech'))
      return
    }
    go(label, [RES.askPeople], () => setNode('people'))
  }

  function pickPeople(n: 1 | 2 | 3) {
    if (n === 1) {
      setPlan('solo')
      return selectFor(T.justMe, [RES.askCat], 0, true, 'solo')
    }
    if (n === 2) return go(T.weAre2, [RES.askPlan], () => setNode('plan'))
    go(T.weAre3, RES.group, () => setNode('group'))
  }

  function pickPlan(kind: Plan | 'help') {
    if (kind === 'help') return startContact(T.planHelp, T.topicHelp2, T.noteHelp2)
    setPlan(kind)
    if (kind === 'duo') return go(T.planDuo, RES.duoIntro, () => setNode('tech'))
    if (kind === 'same') return selectFor(T.planSame, [RES.sameIntro], 0, true, 'same')
    selectFor(T.planDistinct, [RES.distinctIntro], 0, true, 'distinct')
  }

  /** Lleva a elegir servicio; si ya venía uno (botón "Reservar X"), se salta esa elección para la persona 1. */
  function selectFor(userText: string | null, bot: string[], person: 0 | 1, usePre: boolean, p: Plan) {
    if (person === 0 && usePre && preSvc) return chooseSvc(preSvc, userText, [T.okSvc(preSvc.name)], p)
    if (person === 0 && usePre && preCat) {
      setCat(preCat)
      return go(userText, [...(p === 'solo' ? [T.ok] : bot), RES.askSvc], () => setNode('svc'))
    }
    go(userText, bot, () => setNode('cat'))
  }

  /** Al tocar un masaje en la lista: se cuenta en qué consiste y se pregunta si seguir con él o ver otros. */
  function showSvcInfo(svc: Svc) {
    setInfoSvc(svc)
    go(svc.name, [...MASSAGE_ABOUT[svc.id], RES.askContinue], () => setNode('svcInfo'))
  }

  function continueWith(svc: Svc) {
    // El Duo es para dos personas: se sigue por su propio camino (una técnica por persona).
    if (svc.id === 'duo' && plan !== 'duo') {
      setPlan('duo')
      setCart([])
      setTechs([])
      return go(RES.continueMassage, RES.duoIntro, () => setNode('tech'))
    }
    chooseSvc(svc, RES.continueMassage, [T.okSvc(svc.name)], plan)
  }

  function chooseSvc(svc: Svc, userText: string | null, prefix: string[], p: Plan) {
    setCurSvc(svc)
    if (svc.prices.length > 1) {
      go(userText, [...prefix, svc.cat === 'depilacion' ? RES.askWax : RES.askMinutes], () => setNode('opt'))
    } else {
      finishLine(svc, 0, userText, [], p)
    }
  }

  function finishLine(svc: Svc, idx: number, userText: string | null, prefix: string[], p: Plan) {
    const opt = svc.prices[idx]
    const line: Line = { svcId: svc.id, name: svc.name, opt: opt.label, price: opt.value, mins: optionMinutes(svc, idx) }
    const ack = T.noted(line.name, line.opt, moneyFull(line.price))
    if (p === 'duo') {
      setDuoOpt(idx)
      return askDate(userText, [...prefix, duoDiffers ? T.notedNoPrice(line.name, line.opt) : `${ack} ${T.forBoth}.`], p)
    }
    if (p === 'same') {
      setCart([line, line])
      return askDate(userText, [...prefix, `${ack} ${T.forEach}.`], p)
    }
    if (p === 'distinct') {
      const next = [...cart, line]
      setCart(next)
      if (next.length < 2) return selectFor(userText, [`${ack}.`, RES.distinctSecond], 1, false, p)
      return askDate(userText, [...prefix, `${ack}.`], p)
    }
    setCart([line])
    askDate(userText, [...prefix, `${ack}.`], p)
  }

  function askDate(userText: string | null, ack: string[], p: Plan) {
    const notes = p === 'duo' ? [RES.duoNote] : p === 'solo' ? [] : [RES.togetherNote]
    setDay(null)
    setTime(null)
    go(userText, [...ack, ...notes, RES.askDate], () => setNode('date'))
  }

  function pickTech(id: string) {
    const chosen = id === 'same' ? techs[0] : id
    const label = id === 'same' ? T.sameAsPerson1 : svcById(id).short
    const next = [...techs, chosen]
    setTechs(next)
    if (next.length < 2) return go(label, [RES.duoSecond], () => setNode('tech'))
    setCurSvc(duoSvc)
    go(label, [...(next[0] !== next[1] ? [RES.duoDiffPrice] : []), T.howLong], () => setNode('opt'))
  }

  function pickOpt(idx: number) {
    if (!curSvc) return
    const p = curSvc.prices[idx]
    finishLine(curSvc, idx, curSvc.id === 'duo' && duoDiffers ? p.label : `${p.label} (${money(p.value)})`, [], plan)
  }

  function pickDay(d: number) {
    setDay(d)
    go(cap(dayLabel(cal.y, cal.mo, d, T.dateLocale)), [RES.askTime], () => setNode('time'))
  }

  function pickTime(slot: string) {
    setTime(slot)
    setContactFor('reserve')
    go(slot, [RES.askNameReserve], () => setNode('name'))
  }

  /** "Cambiar" en el carrito de dos personas: vuelve a esa persona y descarta lo que sigue. */
  function changePerson(i: 0 | 1) {
    setDay(null)
    setTime(null)
    setDuoOpt(null)
    if (plan === 'duo') {
      setTechs(techs.slice(0, i))
      return go(null, [i === 0 ? T.changeDuo1 : RES.duoSecond], () => setNode('tech'))
    }
    if (plan === 'same') {
      setCart([])
      return selectFor(null, [T.changeSame], 0, false, 'same')
    }
    setCart(cart.slice(0, i))
    selectFor(null, [i === 0 ? T.changeDistinct1 : RES.distinctSecond], i, false, 'distinct')
  }

  // ── Contacto: nombre y celular, solo al decidir ───────────────────────────
  function startContact(userText: string, topic = T.topicAdvisor, note = '') {
    topicRef.current = { topic, note }
    setContactFor('advisor')
    go(userText, [RES.askNameAdvisor], () => setNode('name'))
  }

  function submitName(skip = false) {
    if (busy) return
    const v = skip ? '' : nameIn.trim()
    setName(v)
    setNameIn('')
    go(v || T.preferNotToSay, [RES.askPhone(v)], () => setNode('phone'))
  }

  function submitPhone() {
    if (busy || lockRef.current) return
    if (!validChatPhone(code, phoneIn)) {
      setPhoneErr(true)
      return
    }
    lockRef.current = true
    const digits = phoneDigits(code, phoneIn)
    const full = `${code}${digits}`
    setFullPhone(full)
    setPhoneErr(false)
    setPhoneIn('')
    user(`${code} ${digits}`)
    setNode('sending')

    if (contactFor === 'reserve') {
      const res = finalize('reserve', full, name)
      if (!res) return
      say([T.reserveDone(name)], () => {
        setMessages(p => [
          ...p,
          {
            from: 'bot',
            kind: 'summary',
            rows: [...res.rows, `${cap(res.dateText)} · ${res.time}`, `${name ? `${name} · ` : ''}${full}`],
            total: res.priceTbc ? RES.duoPriceTbc : moneyFull(res.total),
          },
        ])
        say([RES.doneHelp], () => setNode('done'))
      })
      return
    }
    finalize('advisor', full, name)
    say([RES.advisorDone(name)], () => setNode('done'))
  }

  // ── Resumen de la reserva ──────────────────────────────────────────────────
  function buildReservation() {
    const d = day ?? 1
    const dateKey = `${cal.y}-${pad(cal.mo + 1)}-${pad(d)}`
    const dateText = dayLabel(cal.y, cal.mo, d, T.dateLocale)
    const slot = time ?? ''
    let rows: string[] = []
    let parts: string[] = []
    let total = 0
    let serviceName = ''
    let serviceId = ''
    let mins = 60
    let category: Cat = 'masajes'
    let priceTbc = false

    if (plan === 'duo') {
      const opt = duoSvc.prices[duoOpt ?? 1]
      const [t1, t2] = techs.map(id => svcById(id).short)
      // Con técnicas distintas el precio cambia y lo confirma recepción; `total` queda
      // con el precio base del Duo solo como referencia del valor del evento.
      priceTbc = duoDiffers
      total = opt.value
      serviceName = duoSvc.name
      serviceId = duoSvc.id
      mins = optionMinutes(duoSvc, duoOpt ?? 1)
      rows = [
        priceTbc ? `${duoSvc.name} · ${opt.label} · ${T.priceWord} ${RES.duoPriceTbc}` : `${duoSvc.name} · ${opt.label} · ${moneyFull(total)} ${T.forBoth}`,
        `${T.person(1)}: ${t1}`,
        `${T.person(2)}: ${t2}`,
      ]
      parts = [
        priceTbc ? T.duoPartsTbc(duoSvc.name, opt.label) : T.duoParts(duoSvc.name, opt.label, moneyFull(total)),
        T.duoTechParts(t1, t2),
      ]
    } else if (cart.length <= 1) {
      const l = cart[0]
      total = l.price
      serviceName = l.name
      serviceId = l.svcId
      mins = l.mins
      category = svcById(l.svcId).cat
      rows = [`${l.name} · ${l.opt} · ${moneyFull(l.price)}`]
      parts = T.soloParts(l.name, l.opt, moneyFull(l.price))
    } else {
      const [a, b] = cart
      total = a.price + b.price
      mins = Math.max(a.mins, b.mins)
      serviceId = a.svcId
      category = svcById(a.svcId).cat
      if (plan === 'same') {
        serviceName = `${a.name} (${T.twoPeople})`
        rows = T.sameRows(a.name, a.opt, moneyFull(a.price))
        parts = [T.samePart(a.name, a.opt, moneyFull(a.price))]
      } else {
        serviceName = `${a.name} + ${b.name}`
        rows = [
          `${T.person(1)}: ${a.name} · ${a.opt} · ${moneyFull(a.price)}`,
          `${T.person(2)}: ${b.name} · ${b.opt} · ${moneyFull(b.price)}`,
        ]
        parts = [
          T.distinctIntroPart,
          T.distinctPart(1, a.name, a.opt, moneyFull(a.price)),
          T.distinctPart(2, b.name, b.opt, moneyFull(b.price)),
        ]
      }
      parts.push(`${T.total}: ${moneyFull(total)}.`)
    }
    parts.push(T.dateLine(dateText), T.timeLine(slot))
    const totalText = priceTbc ? `${T.total} ${RES.duoPriceTbc}` : `${T.total} ${moneyFull(total)}`
    const detail = [...rows, `${cap(dateText)} · ${slot}`, ...(rows.length > 1 || plan !== 'solo' ? [totalText] : [])].join(' · ')
    return { rows, parts, total, priceTbc, serviceName, serviceId, mins, category, dateKey, dateText, time: slot, detail }
  }

  // ── Salida a WhatsApp y eventos ────────────────────────────────────────────
  function finalize(kind: Kind, phoneFull: string, nm: string) {
    const a = readAttribution()
    const passive = kind === 'direct' || kind === 'group'
    const skipLead =
      kind === 'change' || (passive && (leadRef.current.withPhone || (leadRef.current.any && !phoneFull)))
    const res = kind === 'reserve' ? buildReservation() : null
    const attr = {
      ...(a.gclid ? { gclid: a.gclid } : {}),
      ...(a.adgroup ? { adgroup: a.adgroup } : {}),
      ...(a.campaign ? { campaign: a.campaign } : {}),
    }
    const button = BUTTON[kind]

    trackEvent(EVENTS.WHATSAPP_CLICKED, {
      platform: 'whatsapp',
      source: kind === 'advisor' ? 'landing_chat_advisor' : 'landing_chat_widget',
    })
    pushEvent('whatsapp_click', { source: 'landing_chat_widget', button, locale, ...attr })
    if (!skipLead && a.isAds) {
      pushEvent('whatsapp_lead_ads', {
        source: 'landing_chat_widget',
        button,
        locale,
        ...(a.gclid ? { gclid: a.gclid } : {}),
        ...(a.adgroup ? { adgroup: a.adgroup } : {}),
        ...userDataFor(phoneFull),
      })
    }
    // booking_submit solo cuando hay servicio, día y hora: es la conversión principal.
    if (res && res.serviceId && res.dateKey && res.time) {
      pushEvent('booking_submit', {
        source: a.isAds ? 'ads' : 'organic',
        locale,
        ...attr,
        ...userDataFor(phoneFull),
      })
      trackEvent(EVENTS.BOOKING_SUBMITTED, {
        service_id: res.serviceId,
        service_name: res.serviceName,
        category: res.category,
        duration_minutes: res.mins,
        price_cop: res.total,
        locale,
      })
    }

    const interest = cart.length
      ? Array.from(new Set(cart.map(l => l.name))).join(T.and)
      : (curSvc ?? preSvc)?.name
    if (!skipLead && (phoneFull || a.isAds)) {
      const body: Record<string, unknown> = {
        phone: phoneFull || undefined,
        name: nm || undefined,
        ...attr,
        source: a.isAds ? 'ads' : 'organic',
        locale,
      }
      if (res) {
        Object.assign(body, {
          serviceName: res.serviceName,
          serviceId: res.serviceId,
          priceCop: res.total,
          dateKey: res.dateKey,
          timeSlot: res.time,
          durationMinutes: res.mins,
          requests: res.detail,
        })
      } else {
        body.requests =
          kind === 'advisor' ? topicRef.current.topic
          : kind === 'group' ? T.leadGroup
          : interest ? T.leadDirect(interest)
          : undefined
      }
      postLead(body)
      leadRef.current.any = true
      if (phoneFull) leadRef.current.withPhone = true
    }

    const nameSentence = nm ? T.nameSentence(nm) : ''
    const greeting = customText || (a.isAds ? T.greetingAds : T.greetingOrganic)
    let message: string
    switch (kind) {
      case 'change':
        message = T.msgChange
        break
      case 'group':
        message = `${T.msgGroup}${nameSentence}`
        break
      case 'advisor':
        message = `${T.msgAdvisor}${nameSentence}${topicRef.current.note ? ` ${topicRef.current.note}` : ''}`
        break
      case 'direct':
        message = `${greeting}${nameSentence}${interest ? T.msgInterest(interest) : ''}`
        break
      default:
        message = `${greeting}${nameSentence} ${res?.parts.join(' ') ?? ''}`.trim()
    }

    const url = randomWhatsAppUrl(message)
    waUrlRef.current = url
    window.open(url, '_blank', 'noopener,noreferrer')
    return res
  }

  /** Salida directa a WhatsApp: el enlace fijo del pie y los botones de "3 o más" y "cambiar mi cita". */
  function openWhatsApp(kind: 'direct' | 'group' | 'change', label?: string) {
    const nowMs = Date.now()
    if (nowMs - lastOpenRef.current < 1200) return
    lastOpenRef.current = nowMs
    finalize(kind, fullPhone, name)
    if (label) go(label, [T.openingWhatsApp], () => {})
  }

  function reopenWhatsApp() {
    if (waUrlRef.current) window.open(waUrlRef.current, '_blank', 'noopener,noreferrer')
  }


  // ── Carrito visible para reservas de dos personas ──────────────────────────
  const cartSteps: Node[] = ['tech', 'opt', 'cat', 'svc', 'date', 'time', 'name', 'phone']
  const cartRows: { text: string; change?: () => void }[] = []
  let cartTotal = 0
  if (plan === 'duo') {
    techs.forEach((id, i) => cartRows.push({ text: `${T.person(i + 1)} · ${svcById(id).short}`, change: () => changePerson(i === 0 ? 0 : 1) }))
    if (duoOpt !== null) {
      const o = duoSvc.prices[duoOpt]
      if (duoDiffers) {
        cartRows.push({ text: `${duoSvc.name} · ${o.label} · ${T.priceWord} ${RES.duoPriceTbc}` })
      } else {
        cartRows.push({ text: `${duoSvc.name} · ${o.label} · ${moneyFull(o.value)} ${T.forBoth}` })
        cartTotal = o.value
      }
    }
  } else if (plan !== 'solo') {
    cart.forEach((l, i) => cartRows.push({ text: `${T.person(i + 1)} · ${l.name} · ${l.opt} · ${moneyFull(l.price)}`, change: () => changePerson(i === 0 ? 0 : 1) }))
    cartTotal = cart.reduce((s, l) => s + l.price, 0)
  }
  const showCart = plan !== 'solo' && cartRows.length > 0 && cartSteps.includes(node)
  const showInput = node === 'name' || node === 'phone'

  const answerFollow = (() => {
    const list = [...follow]
    if (!bare && !list.some(f => f.k === 'doubt')) list.push({ k: 'doubt', scope })
    if (!list.some(f => f.k === 'menu')) list.push({ k: 'menu' })
    return list
  })()

  const branch = cat ? BRANCHES[cat] : null

  function renderActions() {
    if (busy || typing) return null
    const back = (label = T.back, to: Node = 'branch', ask = ASK_BACK) => (
      <Chip ghost icon="back" onClick={() => go(label, [ask], () => setNode(to))}>{label}</Chip>
    )
    const menuGhost = <Chip ghost icon="back" onClick={() => toMenu(T.backToMenu)}>{T.backToMenu}</Chip>

    switch (node) {
      case 'menu':
        return (
          <div className="flex flex-wrap gap-2">
            {catsFor(locale).map(c => (
              <Chip key={c.id} icon={catIcon(c.id)} onClick={() => openBranch(c.id)}>{c.label}</Chip>
            ))}
            <Chip icon="help" onClick={() => go(T.generalDoubts, [ASK_GENERAL], () => setNode('general'))}>{T.generalDoubts}</Chip>
          </div>
        )

      case 'branch':
        if (!cat || !branch) return null
        return (
          <div className="flex flex-col items-start gap-1.5">
            <Chip
              block
              icon="sparkles"
              onClick={() => {
                if (branch.help && branch.helpAsk) go(branch.helpLabel, [branch.helpAsk], () => setNode('help'))
                else if (branch.direct) showAnswer(branch.helpLabel, branch.direct.reply, branch.direct.follow, cat)
              }}
            >
              {branch.helpLabel}
            </Chip>
            <Chip block icon="tag" onClick={() => go(branch.catalogLabel, [branch.catalogIntro], () => setNode('catalog'))}>
              {branch.catalogLabel}
            </Chip>
            <Chip block icon="help" onClick={() => { setSens(false); go(T.iHaveDoubt, [ASK_DOUBT], () => setNode('doubts')) }}>{T.iHaveDoubt}</Chip>
            {menuGhost}
          </div>
        )

      case 'help': {
        if (!cat || !branch?.help) return null
        const groups = branch.helpGroups
        return (
          <div className="flex flex-col items-start gap-1.5">
            {groups
              ? groups.map(g => (
                  <Chip
                    key={g.id}
                    block
                    icon={g.icon}
                    onClick={() => { setHelpGroup(g.id); go(g.label, [g.ask], () => setNode('helpGroup')) }}
                  >
                    {g.label}
                  </Chip>
                ))
              : branch.help.map(o => (
                  <Chip key={o.label} block onClick={() => showAnswer(o.label, o.reply, o.follow, cat, false, true)}>{o.label}</Chip>
                ))}
            {back()}
          </div>
        )
      }

      case 'helpGroup': {
        if (!cat || !branch?.help) return null
        return (
          <div className="flex flex-col items-start gap-1.5">
            {branch.help.filter(o => o.group === helpGroup).map(o => (
              <Chip key={o.label} block onClick={() => showAnswer(o.label, o.reply, o.follow, cat, false, true)}>{o.label}</Chip>
            ))}
            <Chip ghost icon="back" onClick={() => go(T.back, [branch.helpAsk ?? ASK_BACK], () => setNode('help'))}>{T.back}</Chip>
          </div>
        )
      }

      case 'doubts': {
        if (!cat || !branch) return null
        const hasDelicate = branch.doubts.some(d => d.delicate)
        return (
          <div className="flex flex-col items-start gap-1.5">
            {branch.doubts.filter(d => !!d.delicate === sens).map(d => (
              <Chip key={d.label} block onClick={() => showDoubt(d, cat)}>{d.label}</Chip>
            ))}
            {!sens && hasDelicate && (
              <Chip block icon="chat" onClick={() => { setSens(true); go(DELICATE_LABEL, [ASK_DELICATE], () => setNode('doubts')) }}>
                {DELICATE_LABEL}
              </Chip>
            )}
            {sens
              ? <Chip ghost icon="back" onClick={() => { setSens(false); go(T.back, [ASK_DOUBT], () => setNode('doubts')) }}>{T.back}</Chip>
              : back()}
          </div>
        )
      }

      case 'general':
        return (
          <div className="flex flex-col items-start gap-1.5">
            {GENERAL.map(g => (
              <Chip key={g.id} block icon={g.icon} onClick={() => showDoubt(g, 'general')}>{g.label}</Chip>
            ))}
            {menuGhost}
          </div>
        )

      case 'catalog':
        if (!cat) return null
        return (
          <div className="flex flex-col gap-2">
            {svcsOf(cat).map(s => (
              <div key={s.id} className="rounded-2xl border border-[#a5cce6]/20 bg-[#0b2131]/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface leading-tight">{s.name}</p>
                    {s.blurb && <p className="mt-0.5 text-xs text-on-surface/60 leading-snug">{s.blurb}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => startReserve(s, null, T.reserveSvc(s.short))}
                    className="flex-shrink-0 rounded-xl border border-[#a5cce6]/40 px-2.5 py-1 text-xs text-on-surface/90 hover:bg-[#a5cce6]/15 hover:border-[#a5cce6]/70 transition-colors"
                  >
                    {T.reserveBtn}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#a5cce6] leading-snug">{priceLine(s)}</p>
              </div>
            ))}
            {back()}
          </div>
        )

      case 'answer':
        return (
          <div className="flex flex-wrap gap-2">
            {answerFollow.map((f, i) => (
              <Fragment key={i}>
                {f.k === 'menu' && fromHelp && cat && BRANCHES[cat].help && (
                  <Chip
                    ghost
                    icon="back"
                    onClick={() => go(T.seeOtherOptions, [BRANCHES[cat].helpAsk ?? ASK_BACK], () => setNode('help'))}
                  >
                    {T.seeOtherOptions}
                  </Chip>
                )}
                <Chip icon={followIcon(f)} ghost={f.k === 'menu'} onClick={() => onFollow(f)}>{followLabel(f, T, locale)}</Chip>
              </Fragment>
            ))}
          </div>
        )

      case 'people':
        return (
          <div className="flex flex-wrap gap-2">
            <Chip icon="user" onClick={() => pickPeople(1)}>{T.justMe}</Chip>
            <Chip icon="users" onClick={() => pickPeople(2)}>{T.weAre2}</Chip>
            <Chip icon="users" onClick={() => pickPeople(3)}>{T.weAre3}</Chip>
            {menuGhost}
          </div>
        )

      case 'plan':
        return (
          <div className="flex flex-col items-start gap-1.5">
            <Chip block icon="users" onClick={() => pickPlan('duo')}>{T.planDuo}</Chip>
            <Chip block icon="users" onClick={() => pickPlan('same')}>{T.planSame}</Chip>
            <Chip block icon="users" onClick={() => pickPlan('distinct')}>{T.planDistinct}</Chip>
            <Chip block icon="help" onClick={() => pickPlan('help')}>{T.planHelp}</Chip>
            {menuGhost}
          </div>
        )

      case 'cat':
        return (
          <div className="flex flex-wrap gap-2">
            {catsFor(locale).map(c => (
              <Chip
                key={c.id}
                icon={catIcon(c.id)}
                onClick={() => {
                  setCat(c.id)
                  go(c.label, [RES.askSvc], () => setNode('svc'))
                }}
              >
                {c.label}
              </Chip>
            ))}
            {menuGhost}
          </div>
        )

      case 'svc':
        if (!cat) return null
        return (
          <div className="flex flex-wrap gap-2">
            {svcsOf(cat).map(s => (
              <Chip
                key={s.id}
                onClick={() => (MASSAGE_ABOUT[s.id] ? showSvcInfo(s) : chooseSvc(s, s.name, [], plan))}
              >
                {s.name}
              </Chip>
            ))}
            {back(T.otherCategory, 'cat', RES.askCat)}
          </div>
        )

      case 'svcInfo':
        if (!infoSvc) return null
        return (
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => continueWith(infoSvc)}>{RES.continueMassage}</Chip>
            <Chip icon="back" onClick={() => go(RES.moreMassages, [RES.askSvc], () => setNode('svc'))}>{RES.moreMassages}</Chip>
            {menuGhost}
          </div>
        )

      case 'opt':
        if (!curSvc) return null
        return (
          <div className="flex flex-wrap gap-2">
            {curSvc.prices.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => pickOpt(i)}
                className="flex flex-col items-center rounded-2xl border border-[#a5cce6]/35 px-4 py-2 text-[13px] font-body text-on-surface/90 transition-colors hover:bg-[#a5cce6]/15 hover:border-[#a5cce6]/70 active:scale-[0.98]"
              >
                <span className="font-semibold">{p.label}</span>
                {!(curSvc.id === 'duo' && duoDiffers) && (
                  <span className="mt-0.5 text-xs text-[#a5cce6]">
                    {money(p.value)}{curSvc.id === 'duo' ? ` ${T.forBoth}` : ''}
                  </span>
                )}
              </button>
            ))}
            {menuGhost}
          </div>
        )

      case 'tech':
        return (
          <div className="flex flex-wrap gap-2">
            {techs.length === 1 && <Chip icon="users" onClick={() => pickTech('same')}>{T.sameAsPerson1}</Chip>}
            {DUO_TECHNIQUES.map(id => (
              <Chip key={id} onClick={() => pickTech(id)}>{svcById(id).short}</Chip>
            ))}
            {menuGhost}
          </div>
        )

      case 'date':
        return (
          <div className="flex flex-col items-start gap-2">
          <div className="w-full rounded-2xl border border-[#a5cce6]/20 bg-[#0b2131]/60 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                aria-label={T.monthPrev}
                disabled={cal.y === today.y && cal.mo === today.mo}
                onClick={() => setCal(c => (c.mo === 0 ? { y: c.y - 1, mo: 11 } : { y: c.y, mo: c.mo - 1 }))}
                className="rounded-md px-2 py-1 text-base text-on-surface/70 transition-colors hover:text-on-surface disabled:opacity-20"
              >
                ‹
              </button>
              <span className="text-xs font-semibold text-on-surface/90">{T.months[cal.mo]} {cal.y}</span>
              <button
                type="button"
                aria-label={T.monthNext}
                onClick={() => setCal(c => (c.mo === 11 ? { y: c.y + 1, mo: 0 } : { y: c.y, mo: c.mo + 1 }))}
                className="rounded-md px-2 py-1 text-base text-on-surface/70 transition-colors hover:text-on-surface"
              >
                ›
              </button>
            </div>
            <div className="mb-1.5 grid grid-cols-7">
              {T.weekdays.map((d, i) => (
                <div key={i} className="py-0.5 text-center text-[10px] font-semibold text-on-surface/50">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells(cal.y, cal.mo).map((d, i) => {
                if (!d) return <div key={i} />
                const blocked = dayBlocked(cal.y, cal.mo, d, durMinutes)
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={blocked}
                    onClick={() => pickDay(d)}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full font-body text-xs transition-all ${
                      blocked
                        ? 'cursor-not-allowed text-on-surface/20'
                        : 'bg-[#071d2d]/80 font-medium text-on-surface/90 hover:bg-[#a5cce6]/25 active:scale-90'
                    }`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
          {menuGhost}
          </div>
        )

      case 'time': {
        const slots = day ? availableSlots(cal.y, cal.mo, day, durMinutes) : []
        const changeDay = (
          <Chip ghost icon="back" onClick={() => { setDay(null); setNode('date') }}>{T.changeDay}</Chip>
        )
        return (
          <div className="flex flex-col items-start gap-2">
            {slots.length > 0 ? (
              <div className="flex max-h-[150px] flex-wrap gap-2 overflow-y-auto pr-1">
                {slots.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pickTime(s)}
                    className="rounded-2xl border border-[#a5cce6]/35 px-3.5 py-2 text-xs font-medium text-on-surface/90 transition-colors hover:bg-[#a5cce6]/20 hover:border-[#a5cce6]/70 active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-on-surface/60">{RES.noSlots}</p>
            )}
            {changeDay}
          </div>
        )
      }

      case 'group':
        return (
          <div className="flex flex-wrap gap-2">
            <Chip icon="chat" onClick={() => openWhatsApp('group', T.writeDirect)}>{T.writeDirect}</Chip>
            {menuGhost}
          </div>
        )

      case 'done':
        return (
          <div className="flex flex-wrap gap-2">
            <Chip icon="chat" onClick={reopenWhatsApp}>{T.openWhatsApp}</Chip>
            {menuGhost}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[110]"
      style={{ width: 'min(360px, calc(100vw - 2rem))', height: 'min(560px, calc(100dvh - 2rem))' }}
      role="dialog"
      aria-label="Chat Diamond Spa"
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#a5cce6]/30 bg-[#001524] shadow-[0_8px_40px_rgba(0,0,0,0.60)] animate-in slide-in-from-bottom-4 fade-in duration-250 ease-out"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-2xl border-b border-outline-variant/15 bg-[#0b2131] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#a5cce6]/30 bg-[#a5cce6]/10 text-[#a5cce6]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                <path d="M6 3h12l4 6-10 12L2 9Z" />
                <path d="M11 3 8 9l4 12 4-12-3-6" />
                <path d="M2 9h20" />
              </svg>
            </span>
            <div>
              <p className="font-label text-sm font-semibold leading-tight tracking-wide text-on-surface">Diamond Spa</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium leading-tight text-on-surface/60">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                {T.onlineReception}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onClose}
              aria-label={T.minimize}
              title={T.minimize}
              className="rounded-lg p-1.5 text-lg leading-none text-on-surface/50 transition-colors hover:bg-white/10 hover:text-on-surface"
            >
              ⌄
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={T.closeChat}
              title={T.closeChat}
              className="rounded-lg p-1.5 text-base leading-none text-on-surface/50 transition-colors hover:bg-white/10 hover:text-on-surface"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conversación */}
        <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.map((m, i) =>
            'kind' in m ? (
              <div key={i} className="flex justify-start">
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-[#a5cce6]/30 bg-[#0b2131] p-3.5 text-sm font-body text-on-surface shadow-sm">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#a5cce6]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {T.yourBooking}
                  </p>
                  {m.rows.map((r, j) => (
                    <p key={j} className="leading-relaxed text-on-surface/90">{r}</p>
                  ))}
                  <p className="mt-2 border-t border-white/10 pt-2 font-semibold">{T.total} {m.total}</p>
                </div>
              </div>
            ) : (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[84%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 font-body text-sm leading-relaxed shadow-sm ${
                    m.from === 'user'
                      ? 'rounded-br-sm border border-[#a5cce6]/30 bg-[#a5cce6]/20 text-on-surface'
                      : 'rounded-bl-sm border border-outline-variant/20 bg-[#0b2131] text-on-surface'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}

          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-outline-variant/20 bg-[#0b2131] px-4 py-3 shadow-sm">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-surface/40"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="animate-in fade-in duration-200">{renderActions()}</div>
        </div>

        {/* Carrito de dos personas */}
        {showCart && (
          <div className="flex-shrink-0 border-t border-outline-variant/15 bg-[#071d2d]/70 px-4 py-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#a5cce6]">{T.yourBooking}</p>
            {cartRows.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-0.5">
                <p className="text-xs leading-snug text-on-surface/85">{r.text}</p>
                {r.change && (
                  <button
                    type="button"
                    onClick={r.change}
                    className="flex-shrink-0 text-[11px] text-on-surface/60 underline underline-offset-2 hover:text-primary"
                  >
                    {T.change}
                  </button>
                )}
              </div>
            ))}
            {cartTotal > 0 && <p className="mt-1 text-xs font-semibold text-on-surface">{T.total} {moneyFull(cartTotal)}</p>}
          </div>
        )}

        {/* Nombre o celular, solo al decidir */}
        {showInput && (
          <div className="flex-shrink-0 border-t border-outline-variant/15 bg-[#071d2d]/60 px-4 py-3">
            <div className="flex items-center gap-1.5 overflow-hidden rounded-full border border-outline-variant/30 bg-[#071d2d]/90 pl-1 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40">
              {node === 'phone' && (
                <select
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  aria-label={T.countryCode}
                  className="cursor-pointer bg-transparent py-2.5 pl-2.5 pr-0.5 font-label text-xs text-on-surface outline-none"
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#0b2131]">{c.flag} {c.code}</option>
                  ))}
                </select>
              )}
              <input
                ref={inputRef}
                type={node === 'phone' ? 'tel' : 'text'}
                inputMode={node === 'phone' ? 'numeric' : 'text'}
                autoComplete={node === 'phone' ? 'tel' : 'name'}
                disabled={busy}
                value={node === 'phone' ? phoneIn : nameIn}
                onChange={e => {
                  if (node === 'phone') {
                    setPhoneIn(e.target.value)
                    setPhoneErr(false)
                  } else setNameIn(e.target.value)
                }}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (node === 'phone') submitPhone()
                  else submitName()
                }}
                placeholder={node === 'phone' ? (locale === 'en' ? '555 123 4567' : '312 345 6789') : T.namePlaceholder}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-body text-sm text-on-surface outline-none placeholder:text-on-surface/30 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => (node === 'phone' ? submitPhone() : submitName())}
                aria-label={T.send}
                className="mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#a5cce6] text-[#001524] shadow-md transition-colors hover:bg-[#bcd9ee] active:scale-95 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 -translate-y-0.5 translate-x-0.5 rotate-45" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            {phoneErr && <p className="mt-1.5 pl-2 text-[11px] text-[#f87171]">{RES.badPhone}</p>}
            {node === 'name' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => submitName(true)}
                className="mt-1.5 pl-2 text-[11px] text-on-surface/60 underline underline-offset-2 transition-colors hover:text-primary"
              >
                {T.preferNotToSay}
              </button>
            )}
          </div>
        )}

        {/* Siempre visible: salida directa a WhatsApp, sin pedir datos */}
        <div className="flex-shrink-0 border-t border-outline-variant/10 bg-[#001524] px-3 py-2 text-center text-[11px] leading-snug text-on-surface/50">
          {T.askDirectPerson}{' '}
          <button
            type="button"
            onClick={() => openWhatsApp('direct')}
            className="font-label tracking-wide underline underline-offset-4 transition-colors hover:text-primary"
          >
            {T.writeDirect}
          </button>
        </div>
      </div>
    </div>
  )
}
