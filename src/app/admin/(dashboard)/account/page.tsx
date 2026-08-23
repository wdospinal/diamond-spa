import { redirect } from 'next/navigation'
import { currentAdminUser } from '@/lib/admin-guard'
import { getAdminUser, listAdminAccounts, type AdminAccountSummary } from '@/lib/admin-users'
import AccountClient from './AccountClient'
import AdminUsersCard from './AdminUsersCard'

export const metadata = { title: 'Mi cuenta' }

export default async function AccountPage() {
  const username = await currentAdminUser()
  // El layout ya redirige sin sesión; esto solo estrecha el tipo.
  if (!username) redirect('/admin/login')

  let email: string | null = null
  let accounts: AdminAccountSummary[] = []
  let listFailed = false
  try {
    email = (await getAdminUser(username))?.email ?? null
    accounts = await listAdminAccounts()
  } catch (err) {
    console.error('No se pudo leer las cuentas admin', err)
    listFailed = true
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2">Mi cuenta</h1>
        <p className="text-on-surface/50 text-sm">
          Cambia tu contraseña y asocia el correo con el que quieres recibir los códigos.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <AccountClient username={username} currentEmail={email} />
        <AdminUsersCard accounts={accounts} currentUser={username} error={listFailed} />
      </div>
    </div>
  )
}
