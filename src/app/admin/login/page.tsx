'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 401) {
          setError('Usuario o contraseña incorrectos')
        } else {
          setError(typeof data.error === 'string' ? data.error : 'No se pudo iniciar sesión')
        }
        return
      }
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <span className="font-label text-[#a5cce6] tracking-[0.3em] uppercase text-xs block text-center mb-4">
          Diamond Spa
        </span>
        <h1 className="font-headline text-3xl text-center text-[#cfe5fa] mb-10">Administración</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="user" className="font-label text-xs text-[#8a9299] uppercase tracking-widest">
              Usuario
            </label>
            <input
              id="user"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none py-3 px-3 font-body text-sm text-[#cfe5fa]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pass" className="font-label text-xs text-[#8a9299] uppercase tracking-widest">
              Contraseña
            </label>
            <input
              id="pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none py-3 px-3 font-body text-sm text-[#cfe5fa]"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400/90 font-body">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#a5cce6] text-[#001524] py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-colors disabled:opacity-40"
          >
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-10 text-center text-xs text-[#8a9299] font-body">
          <Link href="/" className="text-[#a5cce6] hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}
