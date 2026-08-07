import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { isAdminAuthenticated } from '@/lib/admin-guard'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The API routes already reject unauthenticated calls; this keeps the shell
  // itself from rendering for anyone without a valid session.
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <main className="admin-main lg:ml-64">
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
