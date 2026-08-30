import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { currentAdminUser, isAdminAuthenticated } from '@/lib/admin-guard'
import { isAdminSuperadmin } from '@/lib/admin-users'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The API routes already reject unauthenticated calls; this keeps the shell
  // itself from rendering for anyone without a valid session.
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  // El rol se consulta en el store en cada render: la cookie no lo lleva, así
  // que quitarle el privilegio a una cuenta se nota sin cerrar su sesión.
  const username = await currentAdminUser()
  const isSuperadmin = username ? await isAdminSuperadmin(username) : false

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar isSuperadmin={isSuperadmin} />
      <main className="admin-main lg:ml-64">
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
