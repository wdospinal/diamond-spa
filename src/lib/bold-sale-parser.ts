/**
 * Parser del correo "Compra por $ 348.000 en Diamond spa" de Bold: el
 * comprobante de cada pago aprobado en el datáfono. Aplanado a texto queda así:
 *
 *   Transacción aprobada  COP $ 233.200  Diamond spa 2026/10/04 20:03:26
 *   … ID Transacción Bold CPH037KMBI6H …
 *   App label Visa Prepaid … Medio de pago ***0634 …
 *   Subtotal $ 233.200  Propina $ 0  Total COP $ 233.200
 *
 * Si no aparecen lo mínimo (subtotal + fecha de la compra) devuelve `null`: el
 * sync lo cuenta como "otro correo de Bold" en vez de guardar datos a medias.
 */

import { htmlToText, parseCop } from '@/lib/bold-parser'
import type { BoldSale } from '@/lib/bold-types'

/** Monto que sigue a una etiqueta: "Subtotal $ 233.200", "Total COP $ 233.200". */
function amountAfter(text: string, label: RegExp): number {
  const m = new RegExp(`${label.source}\\s*(?:COP)?\\s*\\$\\s*([\\d.,]+)`, 'i').exec(text)
  return m ? parseCop(m[1]) : NaN
}

/** "2026/10/04 20:03:26" (hora de Bogotá, UTC−5 todo el año) → Date. */
function parseOccurredAt(text: string): Date | null {
  const m = /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/.exec(text)
  if (!m) return null
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? '00'}-05:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export interface SaleParseOptions {
  messageId?: string
  /** Header `Date` del correo. Por defecto, ahora. */
  receivedAt?: Date
}

/**
 * Devuelve la compra, o `null` si el texto no es un comprobante de Bold.
 * Acepta indistintamente el HTML del correo o su texto plano.
 */
export function parseBoldSale(input: string, opts: SaleParseOptions = {}): BoldSale | null {
  if (!input || input.length > 500_000) return null
  const text = /<[a-z][\s\S]*>/i.test(input) ? htmlToText(input) : input
  if (!/Transacci[oó]n\s+aprobada/i.test(text)) return null

  const subtotalCop = amountAfter(text, /Subtotal/)
  const occurredAt = parseOccurredAt(text)
  if (Number.isNaN(subtotalCop) || !occurredAt) return null

  const tip = amountAfter(text, /Propina/)
  const tipCop = Number.isNaN(tip) ? 0 : tip
  // "Total" aparece varias veces; la primera con monto es la del resumen.
  const total = amountAfter(text, /\bTotal/)
  const totalCop = Number.isNaN(total) ? subtotalCop + tipCop : total

  const txId = /ID\s+Transacci[oó]n\s+Bold\s+([A-Z0-9]{6,})/i.exec(text)?.[1] ?? ''
  const cardLabel = (/App\s+label\s+(.+?)\s+M[eé]todo\s+de\s+cobro/i.exec(text)?.[1] ?? '').trim()
  const last4 = /\*{3,}\s*(\d{4})/.exec(text)?.[1] ?? ''

  const receivedAt = opts.receivedAt && !Number.isNaN(opts.receivedAt.getTime())
    ? opts.receivedAt
    : new Date()
  const messageId = opts.messageId?.trim() ?? ''
  const id = txId || messageId
  if (!id) return null

  return {
    id,
    day: occurredAt.toLocaleDateString('fr-CA', { timeZone: 'America/Bogota' }),
    occurredAt: occurredAt.toISOString(),
    receivedAt: receivedAt.toISOString(),
    subtotalCop,
    tipCop,
    totalCop,
    cardLabel,
    last4,
    messageId,
  }
}
