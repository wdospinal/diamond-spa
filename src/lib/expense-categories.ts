export type ExpenseCategory = {
  id: string
  name: string
}

/** Categorías reutilizables para gastos (y futuros registros). */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'infra', name: 'Infraestructura, Remodelación y Adecuaciones' },
  { id: 'fijos', name: 'Gastos Fijos y Operativos' },
  { id: 'mobiliario', name: 'Mobiliario y Equipamiento' },
  { id: 'decoracion', name: 'Decoración y Ambientación' },
  { id: 'insumos-med', name: 'Insumos Médicos / Estéticos' },
  { id: 'marketing', name: 'Marketing y Publicidad' },
  { id: 'compras', name: 'Compras Generales / Alimentos' },
  { id: 'aseo', name: 'Aseo y Limpieza' },
  { id: 'seguridad', name: 'Seguridad y Salud en el Trabajo' },
]

export function getExpenseCategoryName(id: string | undefined): string | null {
  if (!id) return null
  return EXPENSE_CATEGORIES.find(c => c.id === id)?.name ?? null
}
