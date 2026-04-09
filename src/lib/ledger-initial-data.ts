import type { ExpenseCategory } from '@/lib/expense-categories'

export type InitialExpenseLine = {
  categoryId: ExpenseCategory['id']
  title: string
  /** COP; null o 0 = sin monto en las hojas (se guarda pendiente) */
  amountCop: number | null
  /** Texto adicional (ej. "restamos …") */
  detail?: string
}

/**
 * Gastos iniciales según listado del negocio.
 * Montos en pesos colombianos (COP).
 */
export const INITIAL_EXPENSE_LINES: InitialExpenseLine[] = [
  {
    categoryId: 'infra',
    title: 'Construcción drywall spa',
    amountCop: 3_000_000,
    detail: 'Nota en hojas: restamos 2.000.000',
  },
  {
    categoryId: 'infra',
    title: '5 Puertas',
    amountCop: 1_620_000,
    detail: 'Nota: restamos 810.000',
  },
  {
    categoryId: 'infra',
    title: 'Puerta PVC',
    amountCop: 991_270,
    detail: 'Nota: restamos 424.830',
  },
  { categoryId: 'infra', title: 'Puerta PVC cocina', amountCop: 600_000 },
  { categoryId: 'infra', title: 'Medida Puertas', amountCop: 30_000 },
  {
    categoryId: 'infra',
    title: 'Cambio de chapa',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },
  {
    categoryId: 'infra',
    title: 'Pintura y adecuación cabinas y spa',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },
  {
    categoryId: 'infra',
    title: 'Aires',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  { categoryId: 'fijos', title: 'Arriendo', amountCop: 9_232_667 },
  {
    categoryId: 'fijos',
    title: 'Bonos',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  {
    categoryId: 'mobiliario',
    title: 'Muebles (camillas)',
    amountCop: 7_244_000,
    detail: 'Nota: restamos 4.976.000',
  },
  {
    categoryId: 'mobiliario',
    title: 'Cajones almacenamiento cocina',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  { categoryId: 'decoracion', title: 'Insumos decoración', amountCop: 579_500 },
  { categoryId: 'decoracion', title: 'Cuadros', amountCop: 260_000 },
  {
    categoryId: 'decoracion',
    title: 'Decoración camillas',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },
  {
    categoryId: 'decoracion',
    title: 'Bowl y teteras',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  {
    categoryId: 'insumos-med',
    title: 'Todos los insumos primordiales',
    amountCop: 1_032_500,
  },
  { categoryId: 'insumos-med', title: 'Rollos', amountCop: 180_000 },
  {
    categoryId: 'insumos-med',
    title: 'Insumos (Aceite, agujas, etc.)',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  {
    categoryId: 'marketing',
    title: 'Publicidad',
    amountCop: 1_026_000,
    detail: 'Nota: restamos 1.026.000',
  },
  { categoryId: 'marketing', title: 'Menú', amountCop: 80_000 },

  { categoryId: 'compras', title: 'Homecenter', amountCop: 491_400 },
  {
    categoryId: 'compras',
    title: 'Aguas y tragos',
    amountCop: null,
    detail: 'Sin valor especificado en hojas',
  },

  {
    categoryId: 'aseo',
    title: 'Papeleras y bolsas (negra, blanca, verde y roja)',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
  {
    categoryId: 'aseo',
    title: 'Jabón de platos y esponjas',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
  {
    categoryId: 'aseo',
    title: 'Accesorios aseo baños',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
  {
    categoryId: 'aseo',
    title: 'Escoba, recogedor',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
  {
    categoryId: 'aseo',
    title: 'Canastas y baldes',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },

  {
    categoryId: 'seguridad',
    title: 'Candado grande',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
  {
    categoryId: 'seguridad',
    title: 'Botiquín y extintor',
    amountCop: null,
    detail: 'Sin valor en hojas',
  },
]
