import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { currentAdminUser, isAdminAuthenticated } from '@/lib/admin-guard'
import { DEFAULT_ADMIN_ROLE } from '@/lib/admin-roles'
import { getAdminRole } from '@/lib/admin-users'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The API routes already reject unauthenticated calls; this keeps the shell
  // itself from rendering for anyone without a valid session.
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  // El rol se consulta en el store en cada render: la cookie no lo lleva, así
  // que cambiarle el rol a una cuenta se nota sin cerrar su sesión.
  const username = await currentAdminUser()
  const role = (username ? await getAdminRole(username) : null) ?? DEFAULT_ADMIN_ROLE

  return (
    <AdminShell role={role}>{children}</AdminShell>
  )
}
