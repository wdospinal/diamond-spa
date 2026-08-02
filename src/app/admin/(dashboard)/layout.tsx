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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
