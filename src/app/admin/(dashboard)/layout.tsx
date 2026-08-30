import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
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
    <div className="min-h-dvh bg-background">
      <Sidebar role={role} />
      <main className="admin-main lg:ml-64">
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
