import { redirect } from 'next/navigation'
import { currentAdminUser } from '@/lib/admin-guard'
import { getAdminUser } from '@/lib/admin-users'
import AccountClient from './AccountClient'

export const metadata = { title: 'Mi cuenta' }

export default async function AccountPage() {
  const username = await currentAdminUser()
  // El layout ya redirige sin sesión; esto solo estrecha el tipo.
  if (!username) redirect('/admin/login')

  // Sin fila todavía significa que la cuenta aún usa la contraseña inicial y
  // no tiene correo asociado — la pantalla es justamente para arreglar eso.
  let email: string | null = null
  try {
    email = (await getAdminUser(username))?.email ?? null
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
      </header>

      <AccountClient username={username} currentEmail={email} />
    </div>
  )
}
