export type LedgerEntry = {
  id: string
  createdAt: string
  /** Fecha contable YYYY-MM-DD (calendario Bogotá). */
  dateKey: string
  kind: 'income' | 'expense'
  amount: number
  note?: string
}
