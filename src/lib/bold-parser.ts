/**
 * Parser del correo "¡Tienes un nuevo cierre de ventas!" de Bold.
 *
 * El correo llega en HTML maquetado con tablas; `htmlToText` lo aplana y el
 * parser busca las etiquetas fijas de la plantilla:
 *
 *   Valor de tu cierre:  $127.200
 *   Ventas exitosas:     $127.200   1 transacciones
 *   Anulaciones:         $0         0 transacciones
 *   Desde  19 de agosto - 09:51 pm
 *   Hasta  19 de agosto - 11:59 pm
 *
 * Si la plantilla cambia y no se reconoce lo mínimo (ventas + rango), devuelve
 * `null` en vez de guardar datos a medias: el sync lo cuenta como error y queda
 * el pegado manual como plan B.
 */

import { createHash } from 'crypto'
import type { BoldClosing } from '@/lib/bold-types'

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü',
  copy: '©', reg: '®', hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»',
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name] ?? ENTITIES[name.toLowerCase()] ?? m)
}

/**
 * HTML → texto plano legible. Los cierres de celda/fila se vuelven separadores
 * para que "Ventas exitosas:" y su monto no queden pegados a lo siguiente.
 */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|tr|table|h[1-6]|li)>/gi, '\n')
      .replace(/<\/t[dh]>/gi, '\t')
      .replace(/<[^>]+>/g, ' '),
  )
    // El espacio fino/duro que usa la plantilla de Bold rompe los regex de monto.
    .replace(/[    ]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

/**
 * "$127.200" → 127200. Formato colombiano: el punto separa miles y la coma
 * decimales. Se redondea porque los cierres van en pesos enteros.
 */
export function parseCop(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, '')
  if (!cleaned) return NaN
  const n = Number(cleaned.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n) : NaN
}

/** Monto y nº de transacciones que siguen a una etiqueta de la plantilla. */
function blockAfter(text: string, label: RegExp): { amount: number; count: number } | null {
  const m = label.exec(text)
  if (!m) return null
  // 200 caracteres cubren "etiqueta: $monto N transacciones" con holgura sin
  // invadir el siguiente bloque de la plantilla.
  const window = text.slice(m.index + m[0].length, m.index + m[0].length + 200)
  const amount = /\$\s*([\d.,]+)/.exec(window)
  if (!amount) return null
  const count = /(\d[\d.]*)\s*transaccion/i.exec(window)
  return {
    amount: parseCop(amount[1]),
    count: count ? Number(count[1].replace(/\./g, '')) || 0 : 0,
  }
}

interface DateParts { day: number; month: number; label: string }

function parseSpanishDate(text: string, label: 'Desde' | 'Hasta'): DateParts | null {
  const re = new RegExp(
    `${label}\\s*[:\\t ]*\\s*(\\d{1,2})\\s+de\\s+([a-zá-ú]+)\\s*[-–—]?\\s*([\\d:]{4,5}\\s*[ap]\\.?m\\.?)?`,
    'i',
  )
  const m = re.exec(text)
  if (!m) return null
  const month = MONTHS[m[2].toLowerCase()]
  if (!month) return null
  const day = Number(m[1])
  if (!day || day > 31) return null
  const time = (m[3] ?? '').replace(/\s+/g, ' ').trim()
  return { day, month, label: `${day} de ${m[2].toLowerCase()}${time ? ` - ${time}` : ''}` }
}

const BOGOTA_PARTS = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * El correo no dice el año. Se toma el del correo (fecha Bogotá) y, si la fecha
 * resultante cae en el futuro, se resta un año — así un cierre del 31 de
 * diciembre enviado el 1 de enero se imputa al año correcto.
 */
function resolveYear(parts: DateParts, receivedAt: Date): string {
  const ref = BOGOTA_PARTS.format(receivedAt) // YYYY-MM-DD
  const refYear = Number(ref.slice(0, 4))
  const mm = String(parts.month).padStart(2, '0')
  const dd = String(parts.day).padStart(2, '0')
  const candidate = `${refYear}-${mm}-${dd}`
  // Margen de 2 días por si el correo se envía justo antes de medianoche UTC.
  const limit = new Date(`${ref}T00:00:00Z`)
  limit.setUTCDate(limit.getUTCDate() + 2)
  if (Date.parse(`${candidate}T00:00:00Z`) > limit.getTime()) {
    return `${refYear - 1}-${mm}-${dd}`
  }
  return candidate
}

export interface ParseOptions {
  /** `Message-ID` del correo. Sin él se genera un id sintético estable. */
  messageId?: string
  /** Header `Date` del correo. Por defecto, ahora. */
  receivedAt?: Date
  source?: 'imap' | 'manual'
}

/**
 * Devuelve el cierre, o `null` si el texto no es un correo de cierre de Bold.
 * Acepta indistintamente el HTML del correo o su texto plano.
 */
export function parseBoldClosing(input: string, opts: ParseOptions = {}): BoldClosing | null {
  if (!input || input.length > 500_000) return null
  const text = /<[a-z][\s\S]*>/i.test(input) ? htmlToText(input) : input

  const sales = blockAfter(text, /Ventas\s+exitosas\s*:?/i)
  const from = parseSpanishDate(text, 'Desde')
  const to = parseSpanishDate(text, 'Hasta')
  if (!sales || Number.isNaN(sales.amount) || !from) return null

  const refunds = blockAfter(text, /Anulaciones\s*:?/i)
  const closing = blockAfter(text, /Valor\s+de\s+tu\s+cierre\s*:?/i)

  const receivedAt = opts.receivedAt && !Number.isNaN(opts.receivedAt.getTime())
    ? opts.receivedAt
    : new Date()
  const day = resolveYear(from, receivedAt)

  const grossCop = sales.amount
  const refundsCop = refunds && !Number.isNaN(refunds.amount) ? refunds.amount : 0
  const closingCop = closing && !Number.isNaN(closing.amount) ? closing.amount : grossCop - refundsCop

  const fromLabel = from.label
  const toLabel = to?.label ?? ''

  const id = opts.messageId?.trim()
    ? opts.messageId.trim()
    : `manual:${createHash('sha1').update(`${day}|${fromLabel}|${toLabel}|${grossCop}|${closingCop}`).digest('hex').slice(0, 16)}`

  return {
    id,
    day,
    receivedAt: receivedAt.toISOString(),
    grossCop,
    closingCop,
    transactions: sales.count,
    refundsCop,
    refundCount: refunds?.count ?? 0,
    fromLabel,
    toLabel,
    source: opts.source ?? 'manual',
  }
}
