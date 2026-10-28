/**
 * Eventos del chat de la pauta (PautaChatWidget): vocabulario compartido entre
 * el navegador (que los envía), el endpoint público (que los valida) y el panel
 * del admin (que los lee).
 *
 * Privacidad: NUNCA viaja texto libre. Cada evento es un nombre de una lista
 * cerrada más, como mucho, una etiqueta que ya existe en el chat (una duda, una
 * necesidad, un servicio) o un valor acotado (fecha, hora, categoría). El
 * servidor rechaza todo lo que no esté en esas listas, así que ni el nombre ni
 * el teléfono que la persona escribe pueden llegar aquí. Tampoco se guarda IP.
 *
 * Idioma: las etiquetas se guardan siempre en español (la referencia del chat),
 * aunque la persona use el chat en inglés. El widget traduce por posición, y la
 * prueba de paridad es/en garantiza que las listas tengan la misma forma.
 *
 * Solo constantes y funciones puras, sin imports de servidor: se importa desde
 * el navegador, la API y el panel.
 */

import { CATS, SVCS, type Cat } from '@/lib/chat-catalog'
import { BRANCHES, GENERAL, type Doubt } from '@/lib/chat-flow-es'

// ─── Vocabulario ──────────────────────────────────────────────────────────────

export const CHAT_EVENTS = [
  'open', 'close', 'view',
  'menu_cat', 'menu_general',
  'branch_help', 'branch_catalog', 'branch_doubts',
  'help_group', 'help_option', 'sens_open',
  'doubt', 'follow', 'back', 'to_menu',
  'svc_info', 'reserve_start', 'people', 'plan', 'opt_pick',
  'day_pick', 'time_pick', 'no_slots',
  'name_step', 'phone_step', 'phone_invalid',
  'reserve_saved', 'reserve_failed',
  'advisor_start', 'advisor_sent',
  'wa_direct', 'wa_after_reserve',
] as const

export type ChatEv = (typeof CHAT_EVENTS)[number]

/** Pantallas del chat (los `Node` del widget). */
export const CHAT_NODES = [
  'menu', 'general', 'branch', 'help', 'helpGroup', 'catalog', 'doubts', 'answer',
  'people', 'plan', 'cat', 'svc', 'svcInfo', 'opt', 'tech', 'date', 'time',
  'name', 'phone', 'group', 'done',
] as const

export type ChatNode = (typeof CHAT_NODES)[number]

export const CHAT_SCOPES = ['masajes', 'faciales', 'depilacion', 'general'] as const
export type ChatScope = (typeof CHAT_SCOPES)[number]

export const FOLLOW_KINDS = [
  'reserve', 'reserveCat', 'catalog', 'doubt', 'menu', 'maps', 'advisor', 'direct', 'change', 'people',
] as const

export const WA_WHERE = ['footer', 'answer', 'group', 'change'] as const
export const CONTACT_FOR = ['reserve', 'advisor'] as const
export const PLAN_KEYS = ['duo', 'same', 'distinct', 'help'] as const

export const CHAT_LIMITS = {
  /** Eventos por envío: el navegador manda lotes pequeños. */
  batch: 25,
  /** Un chat real no pasa de unas decenas de toques por sesión. */
  maxSeq: 2000,
} as const

// ─── Índice de etiquetas conocidas (del chat en español) ──────────────────────

export type LabelKind = 'doubt' | 'help' | 'group'

export interface LabelMeta {
  kind: LabelKind
  scope: ChatScope
  label: string
  /** "Cosas que da pena preguntar / contar". */
  delicate: boolean
  /** Lo que el chat responde hoy (para mostrarlo junto a las cifras en el panel). */
  answer?: string[]
  /** Botones que ofrece esa respuesta. */
  follow?: string[]
}

export const labelKey = (kind: LabelKind, scope: string, label: string) => `${kind}|${scope}|${label}`

let LABELS: Map<string, LabelMeta> | null = null

export function labelIndex(): Map<string, LabelMeta> {
  if (LABELS) return LABELS
  const m = new Map<string, LabelMeta>()
  const addDoubt = (scope: ChatScope, d: Doubt) =>
    m.set(labelKey('doubt', scope, d.label), {
      kind: 'doubt', scope, label: d.label, delicate: !!d.delicate, answer: d.answer, follow: d.follow.map(f => f.k),
    })
  GENERAL.forEach(g => addDoubt('general', g))
  for (const cat of CATS) {
    const b = BRANCHES[cat.id]
    b.doubts.forEach(d => addDoubt(cat.id, d))
    b.helpGroups?.forEach(g =>
      m.set(labelKey('group', cat.id, g.label), { kind: 'group', scope: cat.id, label: g.label, delicate: g.id === 'pena' }),
    )
    b.help?.forEach(o =>
      m.set(labelKey('help', cat.id, o.label), {
        kind: 'help', scope: cat.id, label: o.label, delicate: o.group === 'pena', answer: o.reply, follow: o.follow.map(f => f.k),
      }),
    )
  }
  LABELS = m
  return m
}

const SVC_IDS = new Set(SVCS.map(s => s.id))
const OPT_KEYS = new Set(SVCS.flatMap(s => s.prices.map(p => optKey(s.id, p.label))))

/** Clave de una opción elegida (duración o tipo de cera): "relaxing|60 min". */
export function optKey(svcId: string, optLabel: string) {
  return `${svcId}|${optLabel}`
}

// ─── Validación (lo que el servidor acepta) ───────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/
const SESSION_RE = /^[A-Za-z0-9_-]{8,64}$/
const ADG_RE = /^[\p{L}\p{N} ._-]{1,40}$/u

const inList = (list: readonly string[], v: string) => list.includes(v)

/** ¿Es `k` un valor permitido para este evento? `cat` ya viene validado. */
function validK(ev: ChatEv, k: string, cat: string | null): boolean {
  switch (ev) {
    case 'menu_cat': return inList(CATS.map(c => c.id), k)
    case 'view': return inList(CHAT_NODES, k)
    case 'doubt': return !!cat && labelIndex().has(labelKey('doubt', cat, k))
    case 'help_option': return !!cat && labelIndex().has(labelKey('help', cat, k))
    case 'help_group': return !!cat && labelIndex().has(labelKey('group', cat, k))
    case 'follow': return inList(FOLLOW_KINDS, k)
    case 'svc_info': return SVC_IDS.has(k)
    case 'reserve_start': return SVC_IDS.has(k)
    case 'opt_pick': return OPT_KEYS.has(k)
    case 'people': return k === '1' || k === '2' || k === '3'
    case 'plan': return inList(PLAN_KEYS, k)
    case 'day_pick':
    case 'no_slots': return DATE_RE.test(k)
    case 'time_pick': return TIME_RE.test(k)
    case 'name_step':
    case 'phone_step':
    case 'advisor_start':
    case 'advisor_sent': return inList(CONTACT_FOR, k)
    case 'wa_direct': return inList(WA_WHERE, k)
    default: return false
  }
}

export interface ChatEventIn {
  seq: number
  ev: ChatEv
  k: string | null
  cat: ChatScope | null
  node: ChatNode | null
}

export interface ChatSessionMeta {
  lang: 'es' | 'en'
  dev: 'm' | 'd'
  ads: boolean
  adg: string | null
}

export interface ChatBatch {
  sessionId: string
  meta: ChatSessionMeta
  events: ChatEventIn[]
}

/**
 * Valida un envío del navegador. Devuelve solo lo que cumple las listas
 * cerradas; los eventos dudosos se descartan uno a uno (no se rechaza el lote
 * entero por un evento malo). `null` = el envío no es válido.
 */
export function sanitizeBatch(body: unknown): ChatBatch | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.sessionId !== 'string' || !SESSION_RE.test(b.sessionId)) return null
  if (!Array.isArray(b.events) || b.events.length === 0 || b.events.length > CHAT_LIMITS.batch) return null

  const m = (b.meta ?? {}) as Record<string, unknown>
  const meta: ChatSessionMeta = {
    lang: m.lang === 'en' ? 'en' : 'es',
    dev: m.dev === 'm' ? 'm' : 'd',
    ads: m.ads === true,
    adg: typeof m.adg === 'string' && ADG_RE.test(m.adg.trim()) ? m.adg.trim() : null,
  }

  const events: ChatEventIn[] = []
  for (const raw of b.events) {
    if (!raw || typeof raw !== 'object') continue
    const e = raw as Record<string, unknown>
    const ev = e.ev
    if (typeof ev !== 'string' || !(CHAT_EVENTS as readonly string[]).includes(ev)) continue
    const seq = e.seq
    if (typeof seq !== 'number' || !Number.isInteger(seq) || seq < 1 || seq > CHAT_LIMITS.maxSeq) continue

    const cat = typeof e.cat === 'string' && inList(CHAT_SCOPES, e.cat) ? (e.cat as ChatScope) : null
    const node = typeof e.node === 'string' && inList(CHAT_NODES, e.node) ? (e.node as ChatNode) : null

    let k: string | null = null
    if (e.k !== undefined && e.k !== null && e.k !== '') {
      if (typeof e.k !== 'string' || e.k.length > 120 || !validK(ev as ChatEv, e.k, cat)) continue
      k = e.k
    } else if (ev === 'reserve_start') {
      // "Quiero reservar" sin servicio escogido todavía.
      k = null
    } else if (NEEDS_K.has(ev as ChatEv)) {
      continue
    }
    events.push({ seq, ev: ev as ChatEv, k, cat, node })
  }
  return events.length ? { sessionId: b.sessionId, meta, events } : null
}

/** Eventos que no tienen sentido sin su valor. */
const NEEDS_K = new Set<ChatEv>([
  'menu_cat', 'view', 'doubt', 'help_option', 'help_group', 'follow', 'svc_info', 'opt_pick',
  'people', 'plan', 'day_pick', 'time_pick', 'no_slots', 'name_step', 'phone_step',
  'advisor_start', 'advisor_sent', 'wa_direct',
])

// ─── Traducción por posición (chat en inglés → etiqueta en español) ───────────

/**
 * Etiqueta en español del elemento que ocupa la misma posición en la lista en
 * español. Con el chat en español es la propia etiqueta. `undefined` si el
 * elemento no está en la lista (no se registra nada).
 */
export function esLabelAt(
  list: readonly { label: string }[],
  item: { label: string },
  esList: readonly { label: string }[],
): string | undefined {
  const i = list.indexOf(item)
  return i >= 0 ? esList[i]?.label : undefined
}

/** "9:00 AM" / "2:30 PM" (como los muestra el chat) → "09:00" / "14:30". `undefined` si no tiene ese formato. */
export function slotTo24h(slot: string): string | undefined {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim())
  if (!m) return undefined
  const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${m[2]}`
}

// ─── Etiquetas legibles para el panel ─────────────────────────────────────────

export const NODE_LABELS: Record<ChatNode, string> = {
  menu: 'Menú inicial',
  general: 'Dudas generales',
  branch: 'Menú de la categoría',
  help: 'Ayúdame a elegir',
  helpGroup: 'Ayúdame a elegir (tema)',
  catalog: 'Catálogo y precios',
  doubts: 'Lista de dudas',
  answer: 'Leyendo una respuesta',
  people: '¿Cuántas personas?',
  plan: 'Plan para dos',
  cat: 'Elegir categoría (reserva)',
  svc: 'Elegir servicio (reserva)',
  svcInfo: 'Leyendo qué incluye un masaje',
  opt: 'Elegir duración o tipo',
  tech: 'Elegir técnica (Duo)',
  date: 'Elegir el día',
  time: 'Elegir la hora',
  name: 'Pedir el nombre',
  phone: 'Pedir el celular',
  group: 'Grupo de 3 o más',
  done: 'Reserva o contacto enviado',
}

export const SCOPE_LABELS: Record<ChatScope, string> = {
  masajes: 'Masajes',
  faciales: 'Faciales',
  depilacion: 'Depilación',
  general: 'Dudas generales',
}

export function svcName(id: string): string {
  return SVCS.find(s => s.id === id)?.name ?? id
}

export function svcCat(id: string): Cat | null {
  return SVCS.find(s => s.id === id)?.cat ?? null
}

// ─── Temas: agrupación automática de las preguntas ────────────────────────────

export type TopicKey =
  | 'precio' | 'ubicacion' | 'reservar' | 'elegir' | 'dolor' | 'confianza'
  | 'preparacion' | 'salud' | 'frecuencia' | 'primera' | 'otros'

export interface TopicDef {
  key: TopicKey
  label: string
  /** Cómo se suele resolver este tipo de duda, en la landing y en el chat. */
  playbook: string[]
}

export const TOPICS: Record<TopicKey, TopicDef> = {
  precio: {
    key: 'precio',
    label: 'Precio y pagos',
    playbook: [
      'Pon el precio de cada masaje visible en la landing, justo encima del botón de reservar: quien pregunta cuánto cuesta ya está comparando.',
      'Di en una línea cómo se paga, si hay factura y si la propina es voluntaria, para que no sea sorpresa en recepción.',
    ],
  },
  ubicacion: {
    key: 'ubicacion',
    label: 'Ubicación y horarios',
    playbook: [
      'Deja la dirección, el horario y el botón de mapa en la parte alta de la landing y en la barra fija del celular.',
      'Agrega una foto de la fachada y una indicación de cómo llegar (parqueadero, referencia cercana).',
    ],
  },
  reservar: {
    key: 'reservar',
    label: 'Reservar, cambiar o llegar tarde',
    playbook: [
      'Explica en tres pasos cómo reservar y que se puede cambiar la cita avisando con anticipación.',
      'Si preguntan por ir en pareja o en grupo, ofrece un botón directo a "Duo" en vez de obligarlos a escribir.',
    ],
  },
  elegir: {
    key: 'elegir',
    label: 'Qué servicio me conviene',
    playbook: [
      'Marca uno como "El más pedido" y deja una guía de dos líneas por necesidad (dolor, estrés, deporte).',
      'Si dudan entre dos servicios, pon una comparación corta lado a lado en la landing.',
    ],
  },
  dolor: {
    key: 'dolor',
    label: 'Dolor y presión',
    playbook: [
      'Tranquiliza con un compromiso concreto: la presión se ajusta en cualquier momento y la terapeuta pregunta antes de empezar.',
      'Pon esa promesa cerca del botón de reservar; el miedo al dolor frena la reserva más que el precio.',
    ],
  },
  confianza: {
    key: 'confianza',
    label: 'Confianza y discreción',
    playbook: [
      'Muestra en la landing que es un servicio profesional: terapeutas certificadas, protocolo de respeto y qué pasa si algo incomoda.',
      'Habla de privacidad y de cuidado sin rodeos. Quien llega a estas preguntas necesita sentirse seguro más que información técnica.',
      'Añade testimonios de hombres que fueron por primera vez; reducen la pena de ir solo.',
    ],
  },
  preparacion: {
    key: 'preparacion',
    label: 'Qué hacer antes y después',
    playbook: [
      'Resuélvelo en el mensaje de confirmación (qué llevar, si hay que bañarse, cuándo llegar) y repítelo en el recordatorio.',
      'Una mini guía "Antes de tu cita" en la landing quita dudas sin que tengan que abrir el chat.',
    ],
  },
  salud: {
    key: 'salud',
    label: 'Salud y piel',
    playbook: [
      'Aclara qué condiciones requieren avisar y que el equipo adapta el servicio; ofrece hablar con una asesora antes de reservar.',
    ],
  },
  frecuencia: {
    key: 'frecuencia',
    label: 'Cada cuánto y cuánto dura',
    playbook: [
      'Recomienda una frecuencia por objetivo (mantenimiento, dolor, estrés) y ofrece la duración más pedida como opción preseleccionada.',
    ],
  },
  primera: {
    key: 'primera',
    label: 'Primera vez',
    playbook: [
      'Pon una sección "Tu primera vez" con lo que va a pasar paso a paso. Es la barrera más grande para quien nunca ha ido a un spa.',
    ],
  },
  otros: { key: 'otros', label: 'Otras preguntas', playbook: [] },
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Agrupa una pregunta por tema con reglas simples sobre su texto en español. */
export function topicOf(label: string, delicate: boolean): TopicKey {
  const t = norm(label)
  if (delicate) return 'confianza'
  if (/precio|pagos|factura|propina|cuanto cuesta/.test(t)) return 'precio'
  if (/donde queda|horario/.test(t)) return 'ubicacion'
  if (/como reservar|cambiar mi cita|llegar tarde|dos o mas|somos dos/.test(t)) return 'reservar'
  if (/primera vez|nunca me he/.test(t)) return 'primera'
  if (/duele|dolor|presion|lesion|\bcontractura|espalda|cuello|molestia/.test(t)) return 'dolor'
  if (/condiciones de salud|sensible|acne|ansiedad/.test(t)) return 'salud'
  if (/que me pongo|banar|maquillar|ejercicio|ropa|regla|afeit|encarnad|debe medir|medir el vello/.test(t)) return 'preparacion'
  if (/cada cuanto|cuanto dura|minutos/.test(t)) return 'frecuencia'
  if (/relajante|deportivo|4 manos|hydrafacial|limpieza|cera o maquina|brasilena|cuerpo completo|para hombres|elegir|evento|piel|estres|desconectar|recuperarme|prepararme|poco tiempo|especial|experiencia/.test(t)) return 'elegir'
  return 'otros'
}
