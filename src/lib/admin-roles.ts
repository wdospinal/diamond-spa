/**
 * Roles del panel de administración. Vive aparte de `admin-users.ts` porque el
 * Sidebar es un componente de cliente y no puede arrastrar `crypto` ni los
 * clientes de Supabase/KV solo para saber qué secciones mostrar.
 */

export const ADMIN_ROLES = ['recepcionista', 'ads_manager', 'superadmin'] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export const DEFAULT_ADMIN_ROLE: AdminRole = 'recepcionista'

export const ROLE_LABELS: Record<AdminRole, string> = {
  recepcionista: 'Recepcionista',
  ads_manager: 'Ads manager',
  superadmin: 'Superadmin',
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && (ADMIN_ROLES as readonly string[]).includes(value)
}

/**
 * Rol de una fila antigua, anterior a la columna `role`: las cuentas marcadas
 * con `is_superadmin` siguen siendo superadmin y el resto, recepcionistas.
 */
export function roleFromLegacy(role: unknown, isSuperadmin: unknown): AdminRole {
  if (isAdminRole(role)) return role
  return isSuperadmin === true ? 'superadmin' : DEFAULT_ADMIN_ROLE
}

/**
 * Recepción trabaja la agenda, no la pauta: ve el tablero sin atribución de
 * Ads (GCLID, origen Ads/Orgánico) ni las etapas de captación.
 */
export function hidesAdsAttribution(role: AdminRole): boolean {
  return role === 'recepcionista'
}

/**
 * Recepción gestiona la agenda, no la caja: el resumen de totales por etapa
 * del pipeline queda oculto para ese rol.
 */
export function hidesPipelineTotals(role: AdminRole): boolean {
  return role === 'recepcionista'
}

/**
 * Recepción entra al panel para despachar la agenda del día, casi siempre desde
 * el móvil: el encabezado de /admin/bookings se reduce a una sola fila con lo
 * único que usa —buscar, saber si el tablero está en vivo y crear un usuario—
 * en vez del título y la descripción del pipeline, que no le dicen nada.
 */
export function usesCompactHeader(role: AdminRole): boolean {
  return role === 'recepcionista'
}

/**
 * Secciones del panel por rol. `null` = visible para todos. Igual que con el
 * booleano anterior, esto decide qué enlaces muestra el Sidebar; las rutas en
 * sí no están bloqueadas por rol.
 */
export const SECTION_ROLES = {
  '/admin': null,
  '/admin/bookings': null,
  '/admin/blog': ['ads_manager', 'superadmin'],
  '/admin/landings': ['ads_manager', 'superadmin'],
  '/admin/funnel': ['ads_manager', 'superadmin'],
  '/admin/bold': ['superadmin'],
  '/admin/caja': ['superadmin'],
} as const satisfies Record<string, readonly AdminRole[] | null>

export type AdminSection = keyof typeof SECTION_ROLES

export function canAccessSection(role: AdminRole, section: AdminSection): boolean {
  const allowed = SECTION_ROLES[section] as readonly AdminRole[] | null
  return allowed === null || allowed.includes(role)
}
