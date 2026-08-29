/**
 * Totales de un conjunto de movimientos.
 *
 * Se usa igual desde /admin/caja y desde las respuestas del bot («hoy», «mes»),
 * para que las cifras que llegan por WhatsApp sean literalmente las mismas que
 * muestra el panel y no dos cuentas parecidas.
 */

import { countsTowardTotals, type LedgerEntry } from '@/lib/ledger-types'

export interface CashSummary {
  incomeCop: number
  expenseCop: number
  /** Ingresos menos egresos. Puede ser negativo. */
  profitCop: number
  /** Servicios prestados, sumando cantidades («4 relajantes» cuenta 4). */
  services: number
  /** Movimientos registrados a los que todavía les falta el monto. */
  pending: number
}

export function summarize(entries: LedgerEntry[]): CashSummary {
  const s: CashSummary = { incomeCop: 0, expenseCop: 0, profitCop: 0, services: 0, pending: 0 }

  for (const e of entries) {
    if (e.status === 'void') continue
    if (!countsTowardTotals(e)) {
      s.pending += 1
      continue
    }
    if (e.kind === 'income') {
      s.incomeCop += e.amountCop
      if (e.categoryId === 'service') s.services += e.quantity
    } else {
      s.expenseCop += e.amountCop
    }
  }

  s.profitCop = s.incomeCop - s.expenseCop
  return s
}
