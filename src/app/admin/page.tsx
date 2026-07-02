'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'
import DualCurrency from '@/components/DualCurrency'

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 mt-2">
      <div>
        <span className="font-label text-[#a5cce6] tracking-[0.3em] uppercase text-xs block mb-2">
          Diamond Spa
        </span>
        <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Reservas</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PushManager />
        <Link
          href="/admin/funnel"
          className="bg-[#102a3d] border border-[#a5cce6]/35 text-[#a5cce6] px-5 py-2.5 font-label font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#1a3d52] transition-colors"
        >
          Embudo de ventas
        </Link>
        <Link
          href="/admin/blog"
          className="bg-[#102a3d] border border-[#a5cce6]/35 text-[#a5cce6] px-5 py-2.5 font-label font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#1a3d52] transition-colors"
        >
          Blog
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="font-label text-xs uppercase tracking-widest text-[#8a9299] hover:text-[#a5cce6] px-2"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

function PushManager() {
  const [status, setStatus] = useState<'idle'|'loading'|'subscribed'>('idle')

  // Clave pública VAPID (debería venir del entorno, pero para este código cliente la inyectamos)
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  const subscribe = async () => {
    if (!vapidPublicKey) {
      alert('VAPID public key no configurada en .env.local')
      return
    }
    try {
      setStatus('loading')
      const reg = await navigator.serviceWorker.register('/sw.js')
      // Esperar a que el service worker esté activo antes de suscribirse
      const readyReg = await navigator.serviceWorker.ready
      const sub = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub)
      })
      setStatus('subscribed')
    } catch (e) {
      console.error(e)
      alert('Error al suscribir notificaciones. Asegúrate de dar permisos.')
      setStatus('idle')
    }
  }

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.pushManager.getSubscription().then(sub => {
            if (sub) setStatus('subscribed')
          })
        }
      })
    }
  }, [])

  if (status === 'subscribed') {
    return <span className="text-[#34d399] font-label text-[10px] tracking-widest uppercase border border-[#34d399]/30 px-3 py-1.5 rounded-full">Notificaciones Activas</span>
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === 'loading'}
      className="bg-[#4a9fd4] text-white px-5 py-2.5 font-label font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#5eb3e8] transition-colors rounded-full"
    >
      {status === 'loading' ? 'Activando...' : 'Activar Notificaciones'}
    </button>
  )
}

function BookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  return (
    <section>
      <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
        Sesiones reservadas ({bookings.length})
      </h2>
      <div className="overflow-x-auto border border-[#42484c]/40 rounded-sm">
        <table className="w-full text-left text-sm font-body">
          <thead>
            <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium">Hora</th>
              <th className="py-3 px-4 font-medium">Servicio</th>
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Contacto</th>
              <th className="py-3 px-4 font-medium text-right">
                Precio
                <span className="block font-normal normal-case tracking-normal text-[9px] text-[#5c656d] mt-1">
                  USD · COP
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center text-[#8a9299]">
                  Aún no hay reservas. Aparecerán aquí cuando un cliente confirme en la página de reservas.
                </td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id} className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50">
                  <td className="py-3 px-4 whitespace-nowrap">{b.dateKey}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{b.timeSlot}</td>
                  <td className="py-3 px-4">
                    <span className="block">{b.serviceName}</span>
                    <span className="text-[#8a9299] text-xs">{b.duration}</span>
                  </td>
                  <td className="py-3 px-4">{bookingDisplayName(b) || '—'}</td>
                  <td className="py-3 px-4">
                    {b.status === 'arrived' ? (
                      <span className="inline-flex items-center gap-1.5 text-[#34d399] text-xs font-medium bg-[#34d399]/10 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
                        Llegó
                      </span>
                    ) : (
                      <span className="text-[#8a9299] text-xs">Pendiente</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#a5cce6]/90">
                    <span className="block">{b.phone}</span>
                    {b.email ? <span className="text-[#8a9299]">{b.email}</span> : null}
                  </td>
                  <td className="py-3 px-4">
                    <DualCurrency usd={b.price} copOverride={b.priceCop} tone="income" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function AdminDashboardPage() {
  const { replace, refresh } = useRouter()
  const [bookings, setBookings] = useState<BookingRecord[] | null | undefined>(undefined)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    const res = await fetch('/api/bookings', { credentials: 'same-origin' })
    if (res.status === 401) {
      setBookings(null)
      replace('/admin/login')
      return
    }
    if (!res.ok) {
      setError('No se pudieron cargar las reservas.')
      setBookings([])
      return
    }
    const data = await res.json()
    setBookings(data.bookings ?? [])
  }, [replace])

  useEffect(() => {
    void load()
  }, [load])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    replace('/admin/login')
    refresh()
  }

  if (bookings === undefined && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }
  if (bookings === null) return null

  return (
    <div className="min-h-screen px-6 pt-14 pb-10 md:px-12 md:pt-16 md:pb-12 max-w-6xl mx-auto">
      <AdminHeader onLogout={() => void logout()} />
      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}
      <BookingsTable bookings={bookings ?? []} />
    </div>
  )
}
