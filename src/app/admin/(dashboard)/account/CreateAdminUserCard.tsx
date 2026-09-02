'use client'

import { useState } from 'react'
import PasswordInput from '@/components/admin/PasswordInput'
import { ADMIN_ROLES, DEFAULT_ADMIN_ROLE, ROLE_LABELS, type AdminRole } from '@/lib/admin-roles'

const ROLE_HINTS: Record<AdminRole, string> = {
  recepcionista: 'Inicio y Reservas, sin datos de Ads.',
  ads_manager: 'Inicio, Reservas, Blog, Landings y Embudo.',
  superadmin: 'Todo el panel, incluidas Ventas Bold, Caja y la creación de usuarios.',
}

const FIELD =
  'bg-surface-variant/40 border border-outline-variant/30 focus:border-primary outline-none ' +
  'rounded px-3 py-3 min-h-11 font-body text-sm text-on-surface placeholder:text-on-surface/30 transition-colors'
const LABEL = 'font-label text-[11px] text-on-surface/60 uppercase tracking-widest'
const BUTTON =
  'mt-2 inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 min-h-11 rounded ' +
  'font-label font-bold tracking-widest text-[10px] uppercase hover:bg-primary-fixed transition-colors disabled:opacity-40'

export default function CreateAdminUserCard() {
  const [username, setUsername] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [role, setRole] = useState<AdminRole>(DEFAULT_ADMIN_ROLE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdUser, setCreatedUser] = useState('')
  const [createdRole, setCreatedRole] = useState('')

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreatedUser('')
    setCreatedRole('')
    if (temporaryPassword !== repeatPassword) {
      setError('Las dos contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, temporaryPassword, role }),
      })
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo crear el usuario.')
        return
      }

      const savedUsername = typeof data.username === 'string' ? data.username : username
      setCreatedUser(savedUsername)
      setCreatedRole(typeof data.roleLabel === 'string' ? data.roleLabel : ROLE_LABELS[role])
      setUsername('')
      setRole(DEFAULT_ADMIN_ROLE)
      setTemporaryPassword('')
      setRepeatPassword('')
    } catch {
      setError('Error de red. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-surface-container border border-outline-variant/20 p-6 rounded-lg max-w-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            person
          </span>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-headline text-xl text-on-surface">Crear usuario</h2>
            <span className="font-label text-[9px] uppercase tracking-widest text-primary border border-primary/30 rounded px-2 py-0.5">
              Superadmin
            </span>
          </div>
          <p className="text-sm text-on-surface/60 leading-relaxed">
            Crea una cuenta con su rol y una contraseña temporal. La persona debe cambiarla desde
            Mi cuenta.
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-error bg-error/10 border border-error/20 p-3 rounded mb-5 font-body"
        >
          <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">
            error
          </span>
          <span>{error}</span>
        </p>
      ) : null}

      {createdUser ? (
        <p
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 text-sm text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 p-3 rounded mb-5 font-body"
        >
          <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">
            check_circle
          </span>
          <span>
            Usuario <strong>{createdUser}</strong> creado como <strong>{createdRole}</strong>.
            Comparte la contraseña temporal por un canal seguro.
          </span>
        </p>
      ) : null}

      <form onSubmit={createUser} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-admin-username" className={LABEL}>
            Usuario
          </label>
          <input
            id="new-admin-username"
            type="text"
            autoComplete="off"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            placeholder="nombre.apellido"
            minLength={2}
            maxLength={32}
            pattern="[a-z0-9._-]+"
            className={FIELD}
            required
          />
          <p className="text-xs text-on-surface/40 font-body">
            Entre 2 y 32 caracteres: letras minúsculas, números, punto, guion o guion bajo.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-admin-role" className={LABEL}>
            Rol
          </label>
          <select
            id="new-admin-role"
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            className={FIELD}
          >
            {ADMIN_ROLES.map(option => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          <p className="text-xs text-on-surface/40 font-body">{ROLE_HINTS[role]}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="temporary-password" className={LABEL}>
            Contraseña temporal
          </label>
          <PasswordInput
            id="temporary-password"
            autoComplete="new-password"
            value={temporaryPassword}
            onChange={e => setTemporaryPassword(e.target.value)}
            className={FIELD}
            required
          />
          <p className="text-xs text-on-surface/40 font-body">
            Mínimo 8 caracteres, con letras y números.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="repeat-temporary-password" className={LABEL}>
            Repite la contraseña temporal
          </label>
          <PasswordInput
            id="repeat-temporary-password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            className={FIELD}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={BUTTON}>
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {loading ? 'sync' : 'add'}
          </span>
          {loading ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>
    </section>
  )
}
