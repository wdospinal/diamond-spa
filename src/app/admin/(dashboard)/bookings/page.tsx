'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'
import DualCurrency from '@/components/DualCurrency'

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
      <BookingsTable bookings={bookings ?? []} />
    </div>
  )
}
