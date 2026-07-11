'use client'

import { useEffect, useState } from 'react'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'
import DualCurrency from '@/components/DualCurrency'
import Link from 'next/link'

export default function DashboardHome() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bookings?all=true')
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/admin/login'
            return
          }
          throw new Error('Error de red')
        }
        const data = await res.json()
        setBookings(data.bookings)
      } catch (err) {
        setError('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-on-surface/50 font-label tracking-widest text-xs uppercase">
        Cargando resumen...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/30 text-error text-sm">
        {error}
      </div>
    )
  }

  // Calculate metrics
  // Today's date (ignoring time)
  const todayStr = new Date().toISOString().split('T')[0]
  
  const todayBookings = bookings.filter(b => b.dateKey === todayStr)
  const upcomingBookings = bookings.filter(b => !b.status || b.status === 'pending')
  
  // Revenue calculation
  const organicBookings = bookings.filter(b => b.source !== 'ads' && b.status !== 'cancelled')
  const adsBookings = bookings.filter(b => b.source === 'ads' && b.status !== 'cancelled')
  
  const organicUsd = organicBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const organicCop = organicBookings.reduce((sum, b) => sum + (b.priceCop || 0), 0)
  
  const adsUsd = adsBookings.reduce((sum, b) => sum + (b.price || 0), 0)
  const adsCop = adsBookings.reduce((sum, b) => sum + (b.priceCop || 0), 0)

  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled')
  const paidCop = paidBookings.reduce((sum, b) => sum + (b.priceCop || 0), 0)
  const paidUsd = paidBookings.reduce((sum, b) => sum + (b.price || 0), 0)

  // Recent 5 bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2">Resumen</h1>
        <p className="text-on-surface/50 text-sm">Hola, aquí tienes el estado general de Diamond Spa.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Metric 1 */}
        <div className="bg-surface-container border border-outline-variant/20 p-6 rounded">
          <div className="flex items-center gap-3 mb-4 text-on-surface/60">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">today</span>
            <span className="font-label text-[10px] tracking-widest uppercase">Citas Hoy</span>
          </div>
          <p className="font-headline text-4xl text-on-surface">{todayBookings.length}</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container border border-outline-variant/20 p-6 rounded">
          <div className="flex items-center gap-3 mb-4 text-on-surface/60">
            <span className="material-symbols-outlined text-[#34d399]" aria-hidden="true">payments</span>
            <span className="font-label text-[10px] tracking-widest uppercase">Pagos Recibidos</span>
          </div>
          <div className="font-headline text-2xl text-[#34d399]">
            <DualCurrency usd={paidUsd} copOverride={paidCop} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container border border-outline-variant/20 p-6 rounded">
          <div className="flex items-center gap-3 mb-4 text-on-surface/60">
            <span className="material-symbols-outlined text-on-surface/50" aria-hidden="true">eco</span>
            <span className="font-label text-[10px] tracking-widest uppercase">Valor Orgánico</span>
          </div>
          <div className="font-headline text-xl text-on-surface">
            <DualCurrency usd={organicUsd} copOverride={organicCop} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#4a9fd4]/5 border border-[#4a9fd4]/20 p-6 rounded">
          <div className="flex items-center gap-3 mb-4 text-[#4a9fd4]/80">
            <span className="material-symbols-outlined text-[#4a9fd4]" aria-hidden="true">campaign</span>
            <span className="font-label text-[10px] tracking-widest uppercase">Valor por Ads</span>
          </div>
          <div className="font-headline text-xl text-on-surface">
            <DualCurrency usd={adsUsd} copOverride={adsCop} />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <section className="bg-surface-container border border-outline-variant/20 rounded overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline text-xl text-on-surface">Citas Recientes</h2>
          <Link href="/admin/bookings" className="text-primary font-label text-[10px] tracking-widest uppercase hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30 text-on-surface/50 font-label text-[10px] uppercase tracking-[0.2em]">
                <th className="p-4 font-normal">Cliente</th>
                <th className="p-4 font-normal">Servicio</th>
                <th className="p-4 font-normal">Fecha</th>
                <th className="p-4 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface/30 font-label text-xs uppercase tracking-widest">
                    No hay reservas
                  </td>
                </tr>
              ) : (
                recentBookings.map(b => (
                  <tr key={b.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-variant/20 transition-colors">
                    <td className="p-4">
                      <p className="text-on-surface font-medium">{bookingDisplayName(b)}</p>
                      <p className="text-on-surface/50 text-xs">{b.email}</p>
                    </td>
                    <td className="p-4 text-on-surface/80">{b.serviceName}</td>
                    <td className="p-4">
                      <p className="text-on-surface">{b.dateKey}</p>
                      <p className="text-on-surface/50 text-xs">{b.timeSlot}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-label uppercase tracking-wider ${
                        (!b.status || b.status === 'pending') ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                        'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20'
                      }`}>
                        {(!b.status || b.status === 'pending') ? 'Pendiente' :
                        b.status === 'arrived' ? 'Llegó' :
                        b.status === 'completed' ? 'Completado' : 'Cancelado'
                        }
                      </span>
                      {b.source === 'ads' && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-label uppercase tracking-wider bg-[#4a9fd4]/10 text-[#4a9fd4] border border-[#4a9fd4]/20">
                          Ads
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
