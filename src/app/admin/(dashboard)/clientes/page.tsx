import { currentAdminUser } from '@/lib/admin-guard'
import { DEFAULT_ADMIN_ROLE } from '@/lib/admin-roles'
import { getAdminRole } from '@/lib/admin-users'
import ClientesClient from './ClientesClient'

// El rol decide si se ven los montos (recepción solo completa datos), así que
// se resuelve en el servidor y baja como prop.
export default async function ClientesPage() {
  const username = await currentAdminUser()
  const role = (username ? await getAdminRole(username) : null) ?? DEFAULT_ADMIN_ROLE
  return <ClientesClient role={role} />
}
