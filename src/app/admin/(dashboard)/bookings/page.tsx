'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'
import DualCurrency from '@/components/DualCurrency'

function BookingsTable({ bookings, onRefresh }: { bookings: BookingRecord[], onRefresh: () => void }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleUpdate = async (id: string, field: 'status' | 'paymentStatus', value: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      if (res.ok) {
        onRefresh()
      } else {
        alert('Error al actualizar')
      }
    } catch (e) {
      alert('Error de red')
    } finally {
      setUpdatingId(null)
    }
  }

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
              <th className="py-3 px-4 font-medium">Cliente / Contacto</th>
              <th className="py-3 px-4 font-medium">Origen</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Pago</th>
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
                <td colSpan={8} className="py-12 px-4 text-center text-[#8a9299]">
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
                  <td className="py-3 px-4">
                    <div className="font-medium">{bookingDisplayName(b) || '—'}</div>
                    <div className="text-xs text-[#a5cce6]/90 mt-1">{b.phone}</div>
                    {b.email && <div className="text-[#8a9299] text-xs">{b.email}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-label uppercase tracking-wider ${
                      b.source === 'ads' ? 'bg-[#4a9fd4]/20 text-[#4a9fd4]' : 'bg-[#8a9299]/20 text-[#8a9299]'
                    }`}>
                      {b.source === 'ads' ? 'Ads' : 'Orgánico'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={b.status || 'pending'}
                      onChange={(e) => handleUpdate(b.id, 'status', e.target.value)}
                      disabled={updatingId === b.id}
                      className="bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-xs rounded px-2 py-1 outline-none"
                    >
                      <option value="pending" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">Pendiente</option>
                      <option value="arrived" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">Llegó</option>
                      <option value="completed" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">Completado</option>
                      <option value="cancelled" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">Cancelado</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {(!b.paymentStatus || b.paymentStatus === 'pending') ? (
                      <button
                        onClick={() => handleUpdate(b.id, 'paymentStatus', 'paid')}
                        disabled={updatingId === b.id}
                        className="text-xs border border-[#34d399]/40 text-[#34d399] hover:bg-[#34d399]/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        Marcar Pagado
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#34d399] text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Pagado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <DualCurrency usd={b.price} copOverride={b.priceCop} tone={b.paymentStatus === 'paid' ? 'income' : 'default'} />
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

  if (bookings === undefined && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }
  if (bookings === null) return null

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa] mb-2">Reservas</h1>
        <p className="text-[#cfe5fa]/50 text-sm">Gestiona todas las reservas del sistema.</p>
      </header>

      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}
      <BookingsTable bookings={bookings ?? []} onRefresh={load} />
    </div>
  )
}
