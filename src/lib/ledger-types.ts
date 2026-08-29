/**
 * Movimientos de caja del spa — ingresos y egresos.
 *
 * La fuente principal son los comprobantes que el equipo reenvía por WhatsApp
 * al número bot (ver `whatsapp-router.ts`). Un mensaje = un movimiento, y la PK
 * es el `wamid` de WhatsApp, así que reprocesar un webhook nunca duplica —
 * mismo criterio que el `Message-ID` del correo en `bold_closings`.
 *
 * Todos los montos son pesos colombianos enteros. Los pagos con datáfono NO
 * viven aquí: los trae Bold por IMAP y se unifican al leer (`cash-view.ts`).
 */

export type LedgerKind = 'income' | 'expense'

/** Cómo entró/salió la plata. `bold` lo usan solo los movimientos sintéticos del datáfono. */
export type LedgerChannel = 'transfer' | 'bold' | 'cash'

/**
 * `needs_amount` = registrado pero sin monto confirmado; NO suma en los totales.
 * `void` = anulado a mano, se conserva para no perder el rastro del comprobante.
 */
export type LedgerStatus = 'active' | 'needs_amount' | 'void'

/** Dato que el bot está esperando por WhatsApp. `null` = nada pendiente. */
export type PendingField = 'kind' | 'category' | 'amount' | null

export const INCOME_CATEGORIES = [
  { id: 'service', label: 'Servicio' },
  { id: 'tip', label: 'Propina' },
  { id: 'other', label: 'Otro ingreso' },
] as const

export const EXPENSE_CATEGORIES = [
  { id: 'rent', label: 'Arriendo' },
  { id: 'marketing', label: 'Publicidad' },
  { id: 'payroll', label: 'Pago a terapeuta' },
  { id: 'commission', label: 'Comisión / propina' },
  { id: 'supplies', label: 'Insumos' },
  { id: 'utilities', label: 'Servicios públicos' },
  { id: 'equipment', label: 'Equipos' },
  { id: 'food', label: 'Alimentación' },
  { id: 'other', label: 'Otro egreso' },
] as const

export type IncomeCategoryId = (typeof INCOME_CATEGORIES)[number]['id']
export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number]['id']

export function categoryLabel(kind: LedgerKind, id: string): string {
  const list: readonly { id: string; label: string }[] =
    kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return list.find(c => c.id === id)?.label ?? id
}

export interface LedgerEntry {
  /** `wamid.…` de WhatsApp, `manual:<uuid>` o `zip:<hash>`. Clave de deduplicación. */
  id: string
  /** YYYY-MM-DD (Bogotá) al que se imputa el movimiento. */
  day: string
  /** ISO del momento del mensaje (o del alta manual). */
  occurredAt: string
  kind: LedgerKind
  /** Pesos enteros. 0 mientras el estado sea `needs_amount`. */
  amountCop: number
  channel: LedgerChannel
  categoryId: string
  /** Id del catálogo (`src/lib/services.ts`), o null si el servicio no existe ahí. */
  serviceId: string | null
  /** Nombre del servicio tal como se reconoció, útil cuando `serviceId` es null. */
  serviceLabel: string | null
  durationMinutes: number | null
  /** «4 relajantes 1 hora» → 4. */
  quantity: number
  therapist: string | null
  /** Texto original del mensaje, íntegro. Nunca se pisa al editar. */
  note: string
  source: 'whatsapp' | 'manual' | 'zip'
  /** Número de WhatsApp que lo envió (o el usuario admin en altas manuales). */
  author: string
  /** Id del adjunto en Meta; se sirve por `/api/whatsapp/media/[id]`. */
  mediaId: string | null
  status: LedgerStatus
  confidence: 'high' | 'low'
  pendingField: PendingField
  /** Id del mensaje con que el bot preguntó; la respuesta llega con este `context.id`. */
  promptWamid: string | null
  createdAt: string
  updatedAt: string
}

/** Fila en Supabase / KV / JSON — snake_case, igual que el resto de tablas. */
export interface LedgerEntryRow {
  id: string
  day: string
  occurred_at: string
  kind: string
  amount_cop: number
  channel: string
  category_id: string
  service_id: string | null
  service_label: string | null
  duration_minutes: number | null
  quantity: number
  therapist: string | null
  note: string
  source: string
  author: string
  media_id: string | null
  status: string
  confidence: string
  pending_field: string | null
  prompt_wamid: string | null
  created_at: string
  updated_at: string
}

export function toLedgerRow(e: LedgerEntry): LedgerEntryRow {
  return {
    id: e.id,
    day: e.day,
    occurred_at: e.occurredAt,
    kind: e.kind,
    amount_cop: e.amountCop,
    channel: e.channel,
    category_id: e.categoryId,
    service_id: e.serviceId,
    service_label: e.serviceLabel,
    duration_minutes: e.durationMinutes,
    quantity: e.quantity,
    therapist: e.therapist,
    note: e.note,
    source: e.source,
    author: e.author,
    media_id: e.mediaId,
    status: e.status,
    confidence: e.confidence,
    pending_field: e.pendingField,
    prompt_wamid: e.promptWamid,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  }
}

export function fromLedgerRow(r: LedgerEntryRow): LedgerEntry {
  return {
    id: r.id,
    day: String(r.day).slice(0, 10),
    occurredAt: r.occurred_at,
    kind: r.kind === 'expense' ? 'expense' : 'income',
    amountCop: Number(r.amount_cop) || 0,
    channel: r.channel === 'bold' ? 'bold' : r.channel === 'cash' ? 'cash' : 'transfer',
    categoryId: r.category_id ?? 'other',
    serviceId: r.service_id ?? null,
    serviceLabel: r.service_label ?? null,
    durationMinutes: r.duration_minutes == null ? null : Number(r.duration_minutes),
    quantity: Number(r.quantity) || 1,
    therapist: r.therapist ?? null,
    note: r.note ?? '',
    source: r.source === 'manual' ? 'manual' : r.source === 'zip' ? 'zip' : 'whatsapp',
    author: r.author ?? '',
    mediaId: r.media_id ?? null,
    status: r.status === 'void' ? 'void' : r.status === 'needs_amount' ? 'needs_amount' : 'active',
    confidence: r.confidence === 'low' ? 'low' : 'high',
    pendingField: (r.pending_field as PendingField) ?? null,
    promptWamid: r.prompt_wamid ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

/** Solo los movimientos `active` suman: los `needs_amount` y `void` se ignoran. */
export function countsTowardTotals(e: LedgerEntry): boolean {
  return e.status === 'active' && e.amountCop > 0
}
