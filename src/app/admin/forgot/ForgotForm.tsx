'use client'

import { useState } from 'react'
import Link from 'next/link'
import PasswordInput from '@/components/admin/PasswordInput'
import CodeInput from '@/components/admin/CodeInput'

const fieldClass =
  'bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none p-3 font-body text-sm text-[#cfe5fa]'
const labelClass = 'font-label text-xs text-[#8a9299] uppercase tracking-widest'
const buttonClass =
  'mt-2 bg-[#a5cce6] text-[#001524] py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-colors disabled:opacity-40'

export default function ForgotForm() {
  const [step, setStep] = useState<'ask' | 'code' | 'done'>('ask')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function post(url: string, payload: unknown): Promise<Record<string, unknown> | null> {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo completar la solicitud')
        return null
      }
      return data
    } catch {
      setError('Error de red')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function onRequest(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/admin/password/forgot', { identifier })
    if (!data) return
    const minutes = typeof data.expiresInMinutes === 'number' ? data.expiresInMinutes : 10
    setNotice(
      `Si la cuenta existe y tiene un correo asociado, te enviamos un código de 6 dígitos. Caduca en ${minutes} minutos.`,
    )
    setStep('code')
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/admin/password/reset', { identifier, code, newPassword })
    if (!data) return
    setNotice('')
    setStep('done')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <span className="font-label text-[#a5cce6] tracking-[0.3em] uppercase text-xs block text-center mb-4">
          Diamond Spa
        </span>
        <h1 className="font-headline text-3xl text-center text-[#cfe5fa] mb-4">
          Recuperar contraseña
        </h1>

        {step === 'done' ? (
          <>
            <p className="font-body text-sm text-[#8a9299] text-center mb-8">
              Tu contraseña quedó cambiada. Ya puedes entrar con ella.
            </p>
            <Link href="/admin/login" className={`${buttonClass} block text-center`}>
              Iniciar sesión
            </Link>
          </>
        ) : null}

        {step === 'ask' ? (
          <>
            <p className="font-body text-sm text-[#8a9299] text-center mb-8">
              Escribe tu usuario o tu correo y te enviamos un código al correo asociado a la cuenta.
            </p>
            <form onSubmit={onRequest} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="identifier" className={labelClass}>
                  Usuario o correo
                </label>
                <input
                  id="identifier"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className={fieldClass}
                  required
                />
              </div>
              {error ? (
                <p role="alert" aria-live="polite" className="text-sm text-red-400/90 font-body">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? 'Enviando…' : 'Enviarme el código'}
              </button>
            </form>
          </>
        ) : null}

        {step === 'code' ? (
          <>
            <p className="font-body text-sm text-[#8a9299] text-center mb-8">{notice}</p>
            <form onSubmit={onConfirm} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="code" className={labelClass}>
                  Código
                </label>
                <CodeInput
                  id="code"
                  autoFocus
                  value={code}
                  onValueChange={setCode}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="newPassword" className={labelClass}>
                  Contraseña nueva
                </label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={fieldClass}
                  toggleClassName="text-[#8a9299] hover:text-[#a5cce6]"
                  required
                />
                <span className="font-body text-xs text-[#8a9299] mt-1">
                  Mínimo 8 caracteres, con al menos una letra y un número.
                </span>
              </div>
              {error ? (
                <p role="alert" aria-live="polite" className="text-sm text-red-400/90 font-body">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('ask')
                  setCode('')
                  setNewPassword('')
                  setError('')
                }}
                className="font-body text-xs text-[#a5cce6] hover:underline"
              >
                Volver a pedir el código
              </button>
            </form>
          </>
        ) : null}

        <p className="mt-10 text-center text-xs text-[#8a9299] font-body">
          <Link href="/admin/login" className="text-[#a5cce6] hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
