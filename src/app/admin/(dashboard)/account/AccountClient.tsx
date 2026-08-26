'use client'

import { useState } from 'react'
import PasswordInput from '@/components/admin/PasswordInput'
import CodeInput from '@/components/admin/CodeInput'

type Step = 'request' | 'confirm' | 'done'

const FIELD =
  'bg-surface-variant/40 border border-outline-variant/30 focus:border-primary outline-none ' +
  'rounded px-3 py-3 min-h-11 font-body text-sm text-on-surface placeholder:text-on-surface/30 transition-colors'
const LABEL = 'font-label text-[11px] text-on-surface/60 uppercase tracking-widest'
const BUTTON =
  'mt-2 inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 min-h-11 rounded ' +
  'font-label font-bold tracking-widest text-[10px] uppercase hover:bg-primary-fixed transition-colors disabled:opacity-40'

export default function AccountClient({
  username,
  currentEmail,
}: {
  username: string
  currentEmail: string | null
}) {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState(currentEmail ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [savedEmail, setSavedEmail] = useState(currentEmail)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function post(url: string, payload: unknown): Promise<Record<string, unknown> | null> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Algo salió mal. Inténtalo de nuevo.')
      return null
    }
    return data
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await post('/api/admin/password/request', { email, currentPassword })
      if (data) {
        setCode('')
        setStep('confirm')
      }
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  async function confirmChange(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== repeatPassword) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const data = await post('/api/admin/password/confirm', { code, newPassword })
      if (data) {
        setSavedEmail(typeof data.email === 'string' ? data.email : email)
        setCurrentPassword('')
        setNewPassword('')
        setRepeatPassword('')
        setCode('')
        setStep('done')
      }
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container border border-outline-variant/20 p-6 rounded-lg max-w-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">lock</span>
        </div>
        <div>
          <h2 className="font-headline text-xl text-on-surface mb-1">Cambiar contraseña</h2>
          <p className="text-sm text-on-surface/60 leading-relaxed">
            Te enviamos un código al correo que indiques. Ese correo queda asociado a tu cuenta
            para futuros cambios.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mb-6 pb-6 border-b border-outline-variant/20 text-sm">
        <dt className={LABEL}>Usuario</dt>
        <dd className="font-body text-on-surface">{username}</dd>
        <dt className={LABEL}>Correo</dt>
        <dd className="font-body text-on-surface/70">
          {savedEmail ?? <span className="text-on-surface/40">Sin asociar todavía</span>}
        </dd>
      </dl>

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 text-sm text-error bg-error/10 border border-error/20 p-3 rounded mb-5 font-body"
        >
          <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">error</span>
          <span>{error}</span>
        </p>
      ) : null}

      {step === 'request' ? (
        <form onSubmit={requestCode} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={LABEL}>Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className={FIELD}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="current" className={LABEL}>Contraseña actual</label>
            <PasswordInput
              id="current"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={FIELD}
              required
            />
          </div>
          <button type="submit" disabled={loading} className={BUTTON}>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {loading ? 'sync' : 'mail'}
            </span>
            {loading ? 'Enviando…' : 'Enviarme el código'}
          </button>
        </form>
      ) : null}

      {step === 'confirm' ? (
        <form onSubmit={confirmChange} className="flex flex-col gap-5">
          <p className="text-sm text-on-surface/70 font-body">
            Enviamos un código de 6 dígitos a <strong className="text-on-surface">{email}</strong>.
            Caduca en 10 minutos.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className={LABEL}>Código</label>
            <CodeInput
              id="code"
              autoFocus
              value={code}
              onValueChange={setCode}
              className={FIELD}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new" className={LABEL}>Contraseña nueva</label>
            <PasswordInput
              id="new"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={FIELD}
              required
            />
            <p className="text-xs text-on-surface/40 font-body">Mínimo 8 caracteres, con letras y números.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="repeat" className={LABEL}>Repite la contraseña nueva</label>
            <PasswordInput
              id="repeat"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
              className={FIELD}
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className={BUTTON}>
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                {loading ? 'sync' : 'save'}
              </span>
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError('')
                setStep('request')
              }}
              className="mt-2 font-label text-[10px] uppercase tracking-widest text-on-surface/50 hover:text-primary transition-colors"
            >
              Usar otro correo
            </button>
          </div>
        </form>
      ) : null}

      {step === 'done' ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 p-4 rounded">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
            <span className="font-label text-xs uppercase tracking-widest">Contraseña actualizada</span>
          </div>
          <p className="text-sm text-on-surface/70 font-body">
            La próxima vez entra con tu contraseña nueva, usando{' '}
            <strong className="text-on-surface">{username}</strong> o tu correo{' '}
            <strong className="text-on-surface">{savedEmail}</strong>: cualquiera de los dos sirve.
          </p>
          <button
            type="button"
            onClick={() => {
              setError('')
              setStep('request')
            }}
            className="self-start font-label text-[10px] uppercase tracking-widest text-on-surface/50 hover:text-primary transition-colors"
          >
            Cambiarla otra vez
          </button>
        </div>
      ) : null}
    </div>
  )
}
