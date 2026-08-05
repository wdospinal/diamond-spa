import { redirect } from 'next/navigation'
import { isAdminAuthenticated, safeAdminRedirect } from '@/lib/admin-guard'
import LoginForm from './LoginForm'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const raw = (await searchParams).next
  const next = safeAdminRedirect(Array.isArray(raw) ? raw[0] : raw)

  // Already signed in — never show the form again, go straight to the dashboard.
  if (await isAdminAuthenticated()) {
    redirect(next)
  }

  return <LoginForm next={next} />
}
