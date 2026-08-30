import { redirect } from 'next/navigation'
import { currentAdminUser } from '@/lib/admin-guard'
import { DEFAULT_ADMIN_ROLE, ROLE_LABELS, type AdminRole } from '@/lib/admin-roles'
import { getAdminUser } from '@/lib/admin-users'
import AccountClient from './AccountClient'
import CreateAdminUserCard from './CreateAdminUserCard'

export const metadata = { title: 'Mi cuenta' }

export default async function AccountPage() {
  const username = await currentAdminUser()
  if (!username) redirect('/admin/login')

  let email: string | null = null
  let role: AdminRole = DEFAULT_ADMIN_ROLE
  try {
    const account = await getAdminUser(username)
    email = account?.email ?? null
    role = account?.role ?? DEFAULT_ADMIN_ROLE
  } catch (err) {
    console.error('No se pudo leer la cuenta admin', err)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2">Mi cuenta</h1>
        <p className="text-on-surface/50 text-sm">
          Cambia tu contraseña y asocia el correo con el que quieres recibir los códigos.
        </p>
        <p className="mt-3">
          <span className="font-label text-[9px] uppercase tracking-widest text-primary border border-primary/30 rounded px-2 py-0.5">
            {ROLE_LABELS[role]}
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <AccountClient username={username} currentEmail={email} />
        {role === 'superadmin' ? <CreateAdminUserCard /> : null}
      </div>
    </div>
  )
}
