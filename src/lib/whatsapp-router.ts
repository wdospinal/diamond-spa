/**
 * Qué hacer con cada mensaje que llega al número bot.
 *
 * El equipo no cambia cómo escribe: manda el comprobante como siempre y aquí se
 * decide si eso es un movimiento nuevo, la respuesta a algo que el bot preguntó,
 * el texto que le faltaba a una foto anterior, o una consulta («hoy», «mes»).
 *
 * Regla de fondo: el movimiento se guarda SIEMPRE, aunque no se entienda nada.
 * Lo que no se sabe queda pendiente y el bot pregunta; nunca se descarta un
 * comprobante por no poder interpretarlo.
 */

import { bogotaDay, monthStart, shiftDay } from '@/lib/bogota'
import { summarize } from '@/lib/cash-summary'
import { parseLedgerText } from '@/lib/ledger-parser'
import {
  findByPrompt,
  findOpenImage,
  readEntries,
  saveEntries,
  updateEntry,
} from '@/lib/ledger-store'
import { EXPENSE_CATEGORIES, type LedgerEntry, type LedgerKind } from '@/lib/ledger-types'
import { formatCop } from '@/lib/services'
import { sendButtons, sendList, sendText, type ReplyOption } from '@/lib/whatsapp'

/** Cuánto espera una foto sin descripción a que llegue su texto. */
const PAIRING_WINDOW_MS = 120_000

// ─── Forma normalizada del mensaje entrante ─────────────────────────────────────

export interface InboundMessage {
  /** `wamid.…` — es la PK del movimiento, así que reprocesar no duplica. */
  id: string
  from: string
  /** Unix en segundos, tal como lo manda Meta. */
  timestamp: number
  text: string
  mediaId: string | null
  /** Id de la opción elegida cuando el usuario tocó un botón o una lista. */
  replyId: string | null
  /** Id del mensaje al que se está respondiendo. */
  contextId: string | null
}

interface RawMessage {
  id?: string
  from?: string
  timestamp?: string
  type?: string
  text?: { body?: string }
  image?: { id?: string; caption?: string }
  document?: { id?: string; caption?: string }
  interactive?: {
    button_reply?: { id?: string }
    list_reply?: { id?: string }
  }
  context?: { id?: string }
}

/** Aplana el payload del webhook. Meta puede mandar varios mensajes por entrega. */
export function extractMessages(payload: unknown): InboundMessage[] {
  const entries = (payload as { entry?: { changes?: { value?: { messages?: RawMessage[] } }[] }[] })
    ?.entry
  if (!Array.isArray(entries)) return []

  const out: InboundMessage[] = []
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const m of change.value?.messages ?? []) {
        if (!m.id || !m.from) continue
        const media = m.image ?? m.document
        out.push({
          id: m.id,
          from: m.from,
          timestamp: Number(m.timestamp) || Math.floor(Date.now() / 1000),
          text: (m.text?.body ?? media?.caption ?? '').trim(),
          mediaId: media?.id ?? null,
          replyId: m.interactive?.button_reply?.id ?? m.interactive?.list_reply?.id ?? null,
          contextId: m.context?.id ?? null,
        })
      }
    }
  }
  return out
}

// ─── Consultas ──────────────────────────────────────────────────────────────────

const QUERIES: Record<string, { label: string; days: number }> = {
  hoy: { label: 'Hoy', days: 0 },
  ayer: { label: 'Ayer', days: -1 },
  semana: { label: 'Últimos 7 días', days: -6 },
  mes: { label: 'Este mes', days: -1 },
}

function queryFor(text: string): keyof typeof QUERIES | null {
  const key = text.toLowerCase().trim().replace(/[¿?¡!.]/g, '')
  return key in QUERIES ? (key as keyof typeof QUERIES) : null
}

async function answerQuery(to: string, key: keyof typeof QUERIES): Promise<void> {
  const today = bogotaDay()
  const { label, days } = QUERIES[key]
  const from = key === 'mes' ? monthStart(today) : shiftDay(today, days)
  const to_ = key === 'ayer' ? from : today

  const s = summarize(await readEntries(from, to_))
  const lines = [
    `📊 ${label}`,
    `Ingresos: ${formatCop(s.incomeCop)}`,
    `Egresos: ${formatCop(s.expenseCop)}`,
    `Utilidad: ${formatCop(s.profitCop)}`,
    `Servicios: ${s.services}`,
  ]
  if (s.pending > 0) lines.push(`⚠️ ${s.pending} sin monto — quedan por fuera de estas cifras.`)
  await sendText(to, lines.join('\n'))
}

// ─── Preguntas del bot ──────────────────────────────────────────────────────────

/**
 * Pregunta el siguiente dato que falte, y deja anotado en el movimiento con qué
 * mensaje se preguntó para poder casar la respuesta cuando llegue.
 *
 * Se pregunta de a una cosa: encadenar tres preguntas por cada comprobante
 * convierte el registro en un interrogatorio.
 */
async function askNext(entry: LedgerEntry, to: string): Promise<void> {
  const resumen = describe(entry)

  if (entry.kind === null) {
    const options: ReplyOption[] = [
      { id: 'kind:income:service', title: 'Ingreso servicio' },
      { id: 'kind:expense', title: 'Egreso' },
      { id: 'kind:income:tip', title: 'Propina recibida' },
    ]
    const wamid = await sendButtons(to, `${resumen}\n¿Qué fue?`, options)
    await updateEntry(entry.id, { pendingField: 'kind', promptWamid: wamid })
    return
  }

  if (entry.kind === 'expense' && entry.categoryId === 'other') {
    const options: ReplyOption[] = EXPENSE_CATEGORIES.filter(c => c.id !== 'other').map(c => ({
      id: `cat:${c.id}`,
      title: c.label,
    }))
    const wamid = await sendList(to, `${resumen}\n¿De qué es el egreso?`, 'Elegir', options)
    await updateEntry(entry.id, { pendingField: 'category', promptWamid: wamid })
    return
  }

  if (entry.status === 'needs_amount') {
    const sugerencia =
      entry.amountCop > 0 ? `\nSugerido por catálogo: ${formatCop(entry.amountCop)}` : ''
    const wamid = await sendText(
      to,
      `${resumen}\n¿Cuánto fue?${sugerencia}\nResponde este mensaje con el valor.`,
    )
    await updateEntry(entry.id, { pendingField: 'amount', promptWamid: wamid })
    return
  }

  await updateEntry(entry.id, { pendingField: null, promptWamid: null })
  await sendText(to, `✅ ${resumen}`)
}

/** Resumen de una línea de lo que quedó registrado. */
function describe(entry: LedgerEntry): string {
  const partes: string[] = [entry.kind === 'expense' ? '🔴 Egreso' : '🟢 Ingreso']
  if (entry.serviceLabel) {
    partes.push(
      entry.quantity > 1 ? `${entry.quantity}× ${entry.serviceLabel}` : entry.serviceLabel,
    )
  }
  if (entry.durationMinutes) partes.push(`${entry.durationMinutes} min`)
  if (entry.therapist) partes.push(entry.therapist)
  if (entry.status === 'active' && entry.amountCop > 0) partes.push(formatCop(entry.amountCop))
  return partes.join(' · ')
}

// ─── Respuestas a una pregunta del bot ──────────────────────────────────────────

/** Aplica lo que el usuario contestó. Devuelve false si la respuesta no sirvió. */
async function applyAnswer(pending: LedgerEntry, msg: InboundMessage): Promise<boolean> {
  const from = msg.from

  if (pending.pendingField === 'kind') {
    const choice = msg.replyId ?? kindFromText(msg.text)
    if (!choice?.startsWith('kind:')) return false
    const [, kind, category] = choice.split(':')
    const updated = await updateEntry(pending.id, {
      kind: kind as LedgerKind,
      categoryId: category ?? 'other',
      pendingField: null,
      promptWamid: null,
    })
    if (updated) await askNext(updated, from)
    return true
  }

  if (pending.pendingField === 'category') {
    const choice = msg.replyId
    if (!choice?.startsWith('cat:')) return false
    const updated = await updateEntry(pending.id, {
      categoryId: choice.slice(4),
      pendingField: null,
      promptWamid: null,
    })
    if (updated) await askNext(updated, from)
    return true
  }

  if (pending.pendingField === 'amount') {
    const parsed = parseLedgerText(msg.text)
    if (parsed.amountCop === null || parsed.amountCop <= 0) {
      await sendText(from, 'No entendí el valor. Responde solo con el número, por ejemplo 260.000')
      return true
    }
    const updated = await updateEntry(pending.id, {
      amountCop: parsed.amountCop,
      status: 'active',
      pendingField: null,
      promptWamid: null,
    })
    if (updated) await sendText(from, `✅ ${describe(updated)}`)
    return true
  }

  return false
}

/** Permite contestar «ingreso» / «egreso» escribiendo, no solo tocando el botón. */
function kindFromText(text: string): string | null {
  const t = text.toLowerCase()
  if (/^egreso|^gasto|^salida/.test(t)) return 'kind:expense'
  if (/^propina|^tip/.test(t)) return 'kind:income:tip'
  if (/^ingreso|^entrada|^venta/.test(t)) return 'kind:income:service'
  return null
}

// ─── Alta de un movimiento ──────────────────────────────────────────────────────

function buildEntry(msg: InboundMessage, text: string): LedgerEntry {
  const parsed = parseLedgerText(text)
  const occurredAt = new Date(msg.timestamp * 1000)
  const now = new Date().toISOString()

  // Solo el monto leído del texto se da por bueno. El del catálogo se guarda
  // como sugerencia visible, pero el movimiento no suma hasta confirmarlo.
  const confirmedAmount = parsed.amountSource === 'text'

  return {
    id: msg.id,
    day: bogotaDay(occurredAt),
    occurredAt: occurredAt.toISOString(),
    kind: parsed.kind ?? 'income',
    amountCop: parsed.amountCop ?? 0,
    channel: 'transfer',
    categoryId: parsed.categoryId ?? 'other',
    serviceId: parsed.serviceId,
    serviceLabel: parsed.serviceLabel,
    durationMinutes: parsed.durationMinutes,
    quantity: parsed.quantity,
    therapist: parsed.therapist,
    note: text,
    source: 'whatsapp',
    author: msg.from,
    mediaId: msg.mediaId,
    status: confirmedAmount ? 'active' : 'needs_amount',
    confidence: parsed.confidence,
    pendingField: null,
    promptWamid: null,
    createdAt: now,
    updatedAt: now,
  }
}

// ─── Entrada principal ──────────────────────────────────────────────────────────

/**
 * Procesa un mensaje. El orden importa: primero lo que es respuesta a algo
 * anterior, después lo que es consulta, y solo al final se crea un movimiento.
 */
export async function handleMessage(msg: InboundMessage): Promise<void> {
  // 1. ¿Es la respuesta a una pregunta del bot?
  if (msg.contextId) {
    const pending = await findByPrompt(msg.contextId)
    if (pending && (await applyAnswer(pending, msg))) return
  }

  // 2. Un botón sin contexto reconocible no se puede aplicar a nada.
  if (msg.replyId) return

  // 3. ¿Es una consulta?
  const query = queryFor(msg.text)
  if (query && !msg.mediaId) {
    await answerQuery(msg.from, query)
    return
  }

  // 4. ¿Es el texto que le faltaba a una foto de hace un momento?
  if (!msg.mediaId && msg.text) {
    const open = await findOpenImage(msg.from, new Date(msg.timestamp * 1000), PAIRING_WINDOW_MS)
    if (open) {
      const parsed = parseLedgerText(msg.text)
      const confirmed = parsed.amountSource === 'text'
      const updated = await updateEntry(open.id, {
        kind: parsed.kind ?? open.kind,
        categoryId: parsed.categoryId ?? open.categoryId,
        amountCop: parsed.amountCop ?? open.amountCop,
        serviceId: parsed.serviceId,
        serviceLabel: parsed.serviceLabel,
        durationMinutes: parsed.durationMinutes,
        quantity: parsed.quantity,
        therapist: parsed.therapist,
        status: confirmed ? 'active' : 'needs_amount',
      })
      if (updated) {
        // `note` guarda el texto original y no se pisa al editar, así que la
        // descripción que llegó aparte se escribe aquí, una sola vez.
        const fresh: LedgerEntry = { ...updated, note: msg.text, confidence: parsed.confidence }
        await saveEntries([fresh])
        await askNext(fresh, msg.from)
      }
      return
    }
  }

  // 5. Movimiento nuevo.
  const entry = buildEntry(msg, msg.text)
  await saveEntries([entry])
  await askNext(entry, msg.from)
}
