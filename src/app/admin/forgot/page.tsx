import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-guard'
import ForgotForm from './ForgotForm'

export default async function AdminForgotPage() {
  // Con sesión abierta el cambio se hace desde Cuenta, con la contraseña actual.
  if (await isAdminAuthenticated()) {
    redirect('/admin/account')
  }

  return <ForgotForm />
}
