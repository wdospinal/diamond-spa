'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'
import DualCurrency from '@/components/DualCurrency'

const EMPTY_MESSAGE =
  'Aún no hay reservas. Aparecerán aquí cuando un cliente confirme en la página de reservas.'

// Servicios curados que sí se pautan en Ads — mismo listado que la landing de campaña.
// Se hardcodea aquí (en vez de importar de @/lib/services) porque este componente
// corre en el cliente y ese archivo trae dependencias de servidor.
const AD_SERVICES = [
  { id: 'relaxing', name: 'Relajante' },
  { id: 'deep-tissue', name: 'Tejido Profundo' },
  { id: 'sports', name: 'Deportivo' },
  { id: 'hot-stones', name: 'Piedras Volcánicas' },
]

function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [gclid, setGclid] = useState('')
  const [adgroup, setAdgroup] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'completed' | 'arrived' | 'contacted' | 'pending' | 'cancelled'>('completed')
  const [paid, setPaid] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) { setError('El teléfono es obligatorio.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim(),
          serviceId: serviceId || undefined,
          gclid: gclid.trim() || undefined,
          adgroup: adgroup.trim() || undefined,
          notes: notes.trim() || undefined,
          status,
          paymentStatus: paid ? 'paid' : 'pending',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'No se pudo guardar el lead.')
        setSaving(false)
        return
      }
      onSaved()
      onClose()
    } catch {
      setError('Error de red.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a1628] border border-[#1e3358] rounded-sm p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="font-headline text-xl text-[#cfe5fa]">Agregar Lead de WhatsApp</h2>
        <p className="text-[#8a9299] text-xs -mt-2">
          Para clientes que escribieron directo por WhatsApp, sin pasar por el wizard de reserva.
        </p>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none" />
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Teléfono *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none" />
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Servicio</label>
          <select value={serviceId} onChange={e => setServiceId(e.target.value)}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none">
            <option value="">No especificado</option>
            {AD_SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8a9299] mb-1">GCLID (Opcional)</label>
            <input value={gclid} onChange={e => setGclid(e.target.value)}
              placeholder="Opcional (Google empareja por teléfono)"
              className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none placeholder:text-[#8a9299]/50" />
          </div>
          <div>
            <label className="block text-xs text-[#8a9299] mb-1">Ad Group</label>
            <input value={adgroup} onChange={e => setAdgroup(e.target.value)}
              className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8a9299] mb-1">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value as typeof status)}
              className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none">
              <option value="pending">1. Nuevo Lead</option>
              <option value="contacted">2. En Chat</option>
              <option value="arrived">3. Cita Agendada</option>
              <option value="completed">4. Servicio Pagado</option>
              <option value="cancelled">5. Cancelado</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-[#cfe5fa]">
              <input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} />
              Ya pagó
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8a9299] mb-1">Notas</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 py-2 outline-none" />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="text-sm text-[#8a9299] px-4 py-2">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="text-sm bg-[#4a9fd4] text-white px-4 py-2 rounded disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}

type UpdateField = 'status' | 'paymentStatus'
type UpdateHandler = (id: string, field: UpdateField, value: string) => void

function SourceBadge({ source }: { source: BookingRecord['source'] }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-label uppercase tracking-wider ${
      source === 'ads' ? 'bg-[#4a9fd4]/20 text-[#4a9fd4]' : 'bg-[#8a9299]/20 text-[#8a9299]'
    }`}>
      {source === 'ads' ? 'Ads' : 'Orgánico'}
    </span>
  )
}

function StatusSelect({
  booking, disabled, onUpdate, className = '',
}: {
  booking: BookingRecord
  disabled: boolean
  onUpdate: UpdateHandler
  className?: string
}) {
  return (
    <select
      value={booking.status || 'pending'}
      onChange={(e) => onUpdate(booking.id, 'status', e.target.value)}
      disabled={disabled}
      aria-label={`Estado de la reserva de ${bookingDisplayName(booking) || 'cliente'}`}
      className={`bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-xs rounded px-2 min-h-11 sm:min-h-0 sm:py-1 outline-none ${className}`}
    >
      <option value="pending" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">1. Nuevo Lead</option>
      <option value="contacted" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">2. En Conversación</option>
      <option value="arrived" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">3. Cita Agendada</option>
      <option value="completed" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">4. Servicio Pagado</option>
      <option value="cancelled" className="text-black bg-white dark:bg-[#0f1f38] dark:text-[#cfe5fa]">5. Cancelado</option>
    </select>
  )
}

function PaymentControl({
  booking, disabled, onUpdate, className = '',
}: {
  booking: BookingRecord
  disabled: boolean
  onUpdate: UpdateHandler
  className?: string
}) {
  if (booking.paymentStatus && booking.paymentStatus !== 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[#34d399] text-xs font-medium">
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">check_circle</span>
        Pagado
      </span>
    )
  }
  return (
    <button
      onClick={() => onUpdate(booking.id, 'paymentStatus', 'paid')}
      disabled={disabled}
      className={`text-xs border border-[#34d399]/40 text-[#34d399] hover:bg-[#34d399]/10 px-3 min-h-11 sm:min-h-0 sm:py-1 rounded transition-colors disabled:opacity-50 ${className}`}
    >
      Marcar Pagado
    </button>
  )
}

/** Phone layout: one card per booking, so every field stays readable without
 *  the horizontal scrolling the eight-column table would require. */
function BookingCards({
  bookings, updatingId, onUpdate,
}: {
  bookings: BookingRecord[]
  updatingId: string | null
  onUpdate: UpdateHandler
}) {
  if (bookings.length === 0) {
    return (
      <p className="lg:hidden border border-[#42484c]/40 rounded-sm py-12 px-4 text-center text-[#8a9299]">
        {EMPTY_MESSAGE}
      </p>
    )
  }

  return (
    <ul className="lg:hidden flex flex-col gap-3">
      {bookings.map(b => (
        <li key={b.id} className="border border-[#42484c]/40 rounded-sm p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[#cfe5fa] font-medium truncate">{bookingDisplayName(b) || '—'}</p>
              <p className="text-xs text-[#a5cce6]/90 mt-0.5">{b.phone}</p>
              {b.email && <p className="text-[#8a9299] text-xs truncate">{b.email}</p>}
            </div>
            <DualCurrency
              usd={b.price}
              copOverride={b.priceCop}
              tone={b.paymentStatus === 'paid' ? 'income' : 'default'}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#cfe5fa]">
            <span className="tabular-nums">{b.dateKey}</span>
            <span className="text-[#42484c]" aria-hidden="true">·</span>
            <span className="tabular-nums">{b.timeSlot}</span>
            <SourceBadge source={b.source} />
          </div>

          <div>
            <p className="text-sm text-[#cfe5fa]">{b.serviceName}</p>
            <p className="text-[#8a9299] text-xs">{b.duration}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#42484c]/25">
            <StatusSelect booking={b} disabled={updatingId === b.id} onUpdate={onUpdate} className="flex-1 min-w-[9rem] mt-3" />
            <PaymentControl booking={b} disabled={updatingId === b.id} onUpdate={onUpdate} className="mt-3" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function BookingsTable({ bookings, onRefresh }: { bookings: BookingRecord[], onRefresh: () => void }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleUpdate = async (id: string, field: UpdateField, value: string) => {
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

      <BookingCards bookings={bookings} updatingId={updatingId} onUpdate={handleUpdate} />

      <div className="hidden lg:block overflow-x-auto border border-[#42484c]/40 rounded-sm">
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
                  {EMPTY_MESSAGE}
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
                    <SourceBadge source={b.source} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusSelect booking={b} disabled={updatingId === b.id} onUpdate={handleUpdate} />
                  </td>
                  <td className="py-3 px-4">
                    <PaymentControl booking={b} disabled={updatingId === b.id} onUpdate={handleUpdate} />
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

import KanbanBoard from '@/components/admin/KanbanBoard'
import GoogleAdsFeedModal from '@/components/admin/GoogleAdsFeedModal'

export default function AdminDashboardPage() {
  const { replace, refresh } = useRouter()
  const [bookings, setBookings] = useState<BookingRecord[] | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [showAddLead, setShowAddLead] = useState(false)
  const [showAdsModal, setShowAdsModal] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')

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
    try {
      const saved = localStorage.getItem('admin_bookings_view')
      if (saved === 'table' || saved === 'kanban') {
        setViewMode(saved)
      }
    } catch {}
  }, [load])

  const handleToggleView = (mode: 'kanban' | 'table') => {
    setViewMode(mode)
    try {
      localStorage.setItem('admin_bookings_view', mode)
    } catch {}
  }

  if (bookings === undefined && !error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }
  if (bookings === null) return null

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col gap-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#38bdf8] text-xl shrink-0">account_tree</span>
              <h1 className="font-headline text-xl md:text-3xl text-[#cfe5fa] leading-tight">
                Pipeline de Ventas
              </h1>
            </div>
            <p className="text-[#8a9299] text-xs font-body">
              Gestiona el embudo de clientes y sincroniza con Google Ads.
            </p>
          </div>

          {/* Primary action — always visible */}
          <button
            onClick={() => setShowAddLead(true)}
            className="shrink-0 text-xs font-bold font-label uppercase tracking-wider bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#001524] px-3 py-2 md:px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span className="hidden sm:inline">+ Lead Manual</span>
            <span className="sm:hidden">+ Lead</span>
          </button>
        </div>

        {/* Secondary actions row — wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center rounded-lg border border-[#1e3358] bg-[#071322] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleToggleView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-label uppercase tracking-wider transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#1a3860] text-[#38bdf8] shadow-md border border-[#38bdf8]/30'
                  : 'text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#0f243e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span className="hidden sm:inline">Tablero</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-label uppercase tracking-wider transition-all ${
                viewMode === 'table'
                  ? 'bg-[#1a3860] text-[#38bdf8] shadow-md border border-[#38bdf8]/30'
                  : 'text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#0f243e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          {/* Google Ads connect */}
          <button
            onClick={() => setShowAdsModal(true)}
            className="text-xs font-bold font-label uppercase tracking-wider bg-[#1a3860] hover:bg-[#254e85] text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Ver enlaces de conexión automática HTTPS para Google Ads"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span className="hidden sm:inline">Conectar Google Ads</span>
            <span className="sm:hidden">Google Ads</span>
          </button>

          {/* Export group */}
          <div className="flex items-center rounded-lg border border-[#1e3358] bg-[#071322] overflow-hidden shadow-sm ml-auto">
            <a
              href="/api/admin/bookings/export?type=all"
              className="text-xs font-bold font-label uppercase tracking-wider text-[#cfe5fa] hover:bg-[#1a3860] px-2.5 py-2 transition-colors border-r border-[#1e3358]"
              title="Exporta todas las conversiones combinadas para Google Ads"
            >
              <span className="hidden sm:inline">Exportar Ads</span>
              <span className="sm:hidden">Ads</span>
            </a>
            <a
              href="/api/admin/bookings/export?type=qualified"
              className="text-xs font-bold font-label uppercase tracking-wider text-[#a855f7] hover:bg-[#1a3860] px-2.5 py-2 transition-colors border-r border-[#1e3358]"
              title="Exporta solo Leads Cualificados (Cita Agendada)"
            >
              <span className="hidden sm:inline">Cualificados</span>
              <span className="sm:hidden">Cual.</span>
            </a>
            <a
              href="/api/admin/bookings/export?type=converted"
              className="text-xs font-bold font-label uppercase tracking-wider text-[#22c55e] hover:bg-[#1a3860] px-2.5 py-2 transition-colors"
              title="Exporta solo Ventas Pagadas con valor COP"
            >
              Ventas
            </a>
          </div>
        </div>
      </header>

      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}

      {viewMode === 'kanban' ? (
        <KanbanBoard bookings={bookings ?? []} onRefresh={load} />
      ) : (
        <BookingsTable bookings={bookings ?? []} onRefresh={load} />
      )}

      {showAddLead && (
        <AddLeadModal onClose={() => setShowAddLead(false)} onSaved={load} />
      )}

      {showAdsModal && (
        <GoogleAdsFeedModal onClose={() => setShowAdsModal(false)} />
      )}
    </div>
  )
}
