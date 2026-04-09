export type LedgerEntry = {
  id: string
  createdAt: string
  /** Fecha contable YYYY-MM-DD (calendario Bogotá). */
  dateKey: string
  kind: 'income' | 'expense'
  /** Monto contable en USD (como hoy en el sistema). */
  amount: number
  note?: string
  /** Categoría de gasto reutilizable (ver `EXPENSE_CATEGORIES`). */
  categoryId?: string
  /** COP original cuando se conoce (ej. gastos iniciales); si existe, la UI prioriza esto para la línea en pesos. */
  amountCop?: number
}
