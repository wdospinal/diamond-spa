/**
 * Bold (bold.co) — "cierre de ventas" del datáfono.
 *
 * Bold envía cada madrugada un correo con el cierre del turno anterior. Cada
 * correo es un `BoldClosing`: los totales de ese turno, no del día natural (un
 * día puede tener varios cierres si se programan varios turnos).
 *
 * Todos los montos son pesos colombianos enteros — Bold no factura en USD, así
 * que aquí no hay conversión ni `DualCurrency`.
 */

export interface BoldClosing {
  /** `Message-ID` del correo, o `manual:<hash>` cuando se pegó a mano. Clave de deduplicación. */
  id: string
  /** YYYY-MM-DD (Bogotá) del inicio del turno — el día al que se imputa el cierre. */
  day: string
  /** ISO del header `Date` del correo (o del momento del pegado manual). */
  receivedAt: string
  /** "Ventas exitosas". */
  grossCop: number
  /** "Valor de tu cierre" (ventas menos anulaciones). */
  closingCop: number
  /** Transacciones exitosas. */
  transactions: number
  /** "Anulaciones". */
  refundsCop: number
  refundCount: number
  /** Texto tal cual del correo, p. ej. "19 de agosto - 09:51 pm". Solo para mostrar. */
  fromLabel: string
  toLabel: string
  source: 'imap' | 'manual'
}

/** Fila en Supabase / KV / JSON — snake_case, igual que `bookings`. */
export interface BoldClosingRow {
  id: string
  day: string
  received_at: string
  gross_cop: number
  closing_cop: number
  transactions: number
  refunds_cop: number
  refund_count: number
  from_label: string
  to_label: string
  source: string
}

export function toBoldRow(c: BoldClosing): BoldClosingRow {
  return {
    id: c.id,
    day: c.day,
    received_at: c.receivedAt,
    gross_cop: c.grossCop,
    closing_cop: c.closingCop,
    transactions: c.transactions,
    refunds_cop: c.refundsCop,
    refund_count: c.refundCount,
    from_label: c.fromLabel,
    to_label: c.toLabel,
    source: c.source,
  }
}

export function fromBoldRow(r: BoldClosingRow): BoldClosing {
  return {
    id: r.id,
    day: String(r.day).slice(0, 10),
    receivedAt: r.received_at,
    grossCop: Number(r.gross_cop) || 0,
    closingCop: Number(r.closing_cop) || 0,
    transactions: Number(r.transactions) || 0,
    refundsCop: Number(r.refunds_cop) || 0,
    refundCount: Number(r.refund_count) || 0,
    fromLabel: r.from_label ?? '',
    toLabel: r.to_label ?? '',
    source: r.source === 'manual' ? 'manual' : 'imap',
  }
}

/**
 * Bold — correo "Compra por $ X en Diamond spa", uno por cada pago aprobado en
 * el datáfono. Llega minutos después de la compra, así que permite ver las
 * ventas del día en curso antes de que llegue el cierre; el cierre sigue siendo
 * la cifra oficial y las compras que ya cubre no se vuelven a sumar.
 */
export interface BoldSale {
  /** "ID Transacción Bold" (p. ej. CPE2HPGI16CH), o el Message-ID si no viene. Clave de deduplicación. */
  id: string
  /** YYYY-MM-DD (Bogotá) de la compra. */
  day: string
  /** ISO de la compra, tomada del cuerpo del correo (hora de Bogotá). */
  occurredAt: string
  /** ISO del header `Date` del correo. */
  receivedAt: string
  subtotalCop: number
  tipCop: number
  totalCop: number
  /** "App label" del correo: Mastercard, Visa Prepaid… */
  cardLabel: string
  /** Últimos 4 dígitos del medio de pago, si vienen. */
  last4: string
  messageId: string
}

export interface BoldSaleRow {
  id: string
  day: string
  occurred_at: string
  received_at: string
  subtotal_cop: number
  tip_cop: number
  total_cop: number
  card_label: string
  last4: string
  message_id: string
}

export function toBoldSaleRow(s: BoldSale): BoldSaleRow {
  return {
    id: s.id,
    day: s.day,
    occurred_at: s.occurredAt,
    received_at: s.receivedAt,
    subtotal_cop: s.subtotalCop,
    tip_cop: s.tipCop,
    total_cop: s.totalCop,
    card_label: s.cardLabel,
    last4: s.last4,
    message_id: s.messageId,
  }
}

export function fromBoldSaleRow(r: BoldSaleRow): BoldSale {
  return {
    id: r.id,
    day: String(r.day).slice(0, 10),
    occurredAt: new Date(r.occurred_at).toISOString(),
    receivedAt: new Date(r.received_at).toISOString(),
    subtotalCop: Number(r.subtotal_cop) || 0,
    tipCop: Number(r.tip_cop) || 0,
    totalCop: Number(r.total_cop) || 0,
    cardLabel: r.card_label ?? '',
    last4: r.last4 ?? '',
    messageId: r.message_id ?? '',
  }
}
