import { currentAdminUser } from '@/lib/admin-guard'
import { DEFAULT_ADMIN_ROLE } from '@/lib/admin-roles'
import { getAdminRole } from '@/lib/admin-users'
import BookingsClient from './BookingsClient'

// El rol decide qué tanto muestra el tablero (las terapeutas no ven atribución
// de Ads), así que se resuelve en el servidor y baja como prop.
export default async function BookingsPage() {
  const username = await currentAdminUser()
  const role = (username ? await getAdminRole(username) : null) ?? DEFAULT_ADMIN_ROLE
  return <BookingsClient role={role} />
}
