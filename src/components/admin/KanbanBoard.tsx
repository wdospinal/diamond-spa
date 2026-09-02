'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { hidesAdsAttribution, type AdminRole } from '@/lib/admin-roles'
import { bogotaDay } from '@/lib/bogota'
import type { BookingRecord } from '@/lib/booking-types'
import { bookingDisplayName } from '@/lib/booking-types'

type StageKey = 'pending' | 'contacted' | 'arrived' | 'completed' | 'cancelled'

interface ColumnDef {
  key: StageKey
  title: string
  subtitle: string
  icon: string
  accentColor: string
  headerBg: string
  pillColor: string
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'pending',
    title: '1. Nuevo Lead',
    subtitle: 'Entrante Web / WA',
    icon: 'inbox',
    accentColor: '#38bdf8', // sky
    headerBg: 'bg-sky-500/10',
    pillColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    key: 'contacted',
    title: '2. En Chat',
    subtitle: 'Preguntando info',
    icon: 'chat_bubble',
    accentColor: '#fbbf24', // amber
    headerBg: 'bg-amber-500/10',
    pillColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    key: 'arrived',
    title: '3. Cita Agendada',
    subtitle: '⭐ Lead Cualificado',
    icon: 'calendar_month',
    accentColor: '#a855f7', // purple
    headerBg: 'bg-purple-500/10',
    pillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    key: 'completed',
    title: '4. Servicio Pagado',
    subtitle: '💰 Venta Ganada',
    icon: 'verified',
    accentColor: '#22c55e', // green
    headerBg: 'bg-emerald-500/10',
    pillColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    key: 'cancelled',
    title: '5. Cancelado',
    subtitle: 'No asistió o canceló',
    icon: 'cancel',
    accentColor: '#f43f5e', // rose
    headerBg: 'bg-rose-500/10',
    pillColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
]

const SERVICES_LIST = [
  { id: 'relaxing', name: 'Masaje Relajante' },
  { id: 'deep-tissue', name: 'Tejido Profundo' },
  { id: 'sports', name: 'Masaje Deportivo' },
  { id: 'hot-stones', name: 'Piedras Volcánicas' },
  { id: 'lymphatic', name: 'Drenaje Linfático' },
  { id: 'couples', name: 'Masaje en Pareja' },
  { id: 'four-hands', name: 'Masaje 4 Manos' },
  { id: 'candle', name: 'Masaje con Velas' },
  { id: 'chocotherapy', name: 'Chocolaterapia' },
  { id: 'facial', name: 'Limpieza Facial Profunda' },
  { id: 'depilacion', name: 'Depilación Masculina' },
  { id: 'whatsapp-lead', name: 'Lead WhatsApp (Recepción)' },
]

const CARDS_PER_PAGE = 6

function formatCopCurrency(amount: number): string {
  if (!amount) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Modal de Edición de Lead ───────────────────────────────────────────────────

function LeadDetailModal({
  booking,
  onClose,
  onSaved,
  onDeleteRequest,
  showAds,
}: {
  booking: BookingRecord
  onClose: () => void
  onSaved: () => void
  onDeleteRequest: (booking: BookingRecord) => void
  showAds: boolean
}) {
  const [name, setName] = useState(booking.name || '')
  const [phone, setPhone] = useState(booking.phone || '')
  const [email, setEmail] = useState(booking.email || '')
  const [serviceName, setServiceName] = useState(booking.serviceName || '')
  const [priceCop, setPriceCop] = useState(booking.priceCop ? String(booking.priceCop) : '0')
  const [dateKey, setDateKey] = useState(booking.dateKey || '')
  const [timeSlot, setTimeSlot] = useState(booking.timeSlot || '')
  const [status, setStatus] = useState<StageKey>((booking.status || 'pending') as StageKey)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>(booking.paymentStatus || 'pending')
  const [gclid, setGclid] = useState(booking.gclid || '')
  const [requests, setRequests] = useState(booking.requests || '')
  const [saving, setSaving] = useState(false)
  const [copiedGclid, setCopiedGclid] = useState(false)
  const [error, setError] = useState('')

  const handleCopyGclid = () => {
    if (gclid) {
      navigator.clipboard.writeText(gclid)
      setCopiedGclid(true)
      setTimeout(() => setCopiedGclid(false), 2000)
    }
  }

  const handleServiceSelectChange = (val: string) => {
    const found = SERVICES_LIST.find(s => s.id === val || s.name === val)
    if (found) {
      setServiceName(found.name)
    } else {
      setServiceName(val)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError('El teléfono es obligatorio')
      return
    }
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          serviceName: serviceName.trim() || undefined,
          priceCop: Number(priceCop) || 0,
          dateKey: dateKey.trim() || undefined,
          timeSlot: timeSlot.trim() || undefined,
          requests: requests.trim() || undefined,
          status,
          paymentStatus,
        }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Error al guardar cambios')
        setSaving(false)
        return
      }

      onSaved()
      onClose()
    } catch {
      setError('Error de red al guardar')
      setSaving(false)
    }
  }

  const cleanWaNumber = phone.replace(/\D/g, '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0a182c] border border-[#1e385c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1e385c] bg-[#071322] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline text-lg sm:text-xl font-bold text-[#cfe5fa] truncate">
                {name || phone || 'Detalle del Lead'}
              </span>
              {showAds && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    booking.source === 'ads' || Boolean(gclid)
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30'
                      : 'bg-[#8a9299]/15 text-[#8a9299] border-[#8a9299]/20'
                  }`}
                >
                  {booking.source === 'ads' || Boolean(gclid) ? 'Google Ads' : 'Orgánico'}
                </span>
              )}
            </div>
            <p className="text-[#8a9299] text-xs font-mono mt-0.5">ID: {booking.id}</p>
          </div>

          <div className="flex items-center gap-2">
            {cleanWaNumber && (
              <a
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20b857] text-[#001524] px-3 py-1.5 rounded-lg text-xs font-bold font-label uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow"
                title="Abrir chat en WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-[#8a9299] hover:text-white p-1 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pipedrive Interactive Stage Stepper */}
        <div className="px-5 py-3 bg-[#071322] border-b border-[#1e385c] flex items-stretch gap-1 overflow-x-auto">
          {COLUMNS.map(c => {
            const isCurrent = status === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setStatus(c.key)
                  if (c.key === 'completed') setPaymentStatus('paid')
                }}
                className={`flex-1 basis-0 min-w-[100px] flex items-center justify-center text-center py-1.5 px-2 rounded text-xs font-bold font-label uppercase tracking-wider leading-tight transition-all border ${
                  isCurrent
                    ? 'bg-[#1a3860] text-white border-[#38bdf8] shadow'
                    : 'bg-[#0a182c] text-[#8a9299] border-[#1e385c] hover:bg-[#122744] hover:text-[#cfe5fa]'
                }`}
              >
                {c.title}
              </button>
            )
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Prominent GCLID Attribution Box */}
          {showAds && (
            <div className="p-3.5 rounded-xl bg-[#071322] border border-[#38bdf8]/40 shadow-inner flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">ads_click</span>
                  Google Click ID (GCLID):
                </span>
                <span className="text-[10px] text-[#8a9299] font-mono">
                  {booking.adgroup ? `Grupo de anuncios: ${booking.adgroup}` : 'Atribución de Ads'}
                </span>
              </div>

              {gclid ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={gclid}
                    className="flex-1 bg-[#0a182c] border border-[#1e385c] text-[#38bdf8] text-xs font-mono rounded-lg px-3 py-2 outline-none select-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleCopyGclid}
                    className="bg-[#1a3860] hover:bg-[#254e85] text-[#38bdf8] text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>{copiedGclid ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-[#8a9299] italic bg-[#0a182c] p-2 rounded-lg border border-[#1e385c]">
                  Sin GCLID detectado (Tráfico Directo u Orgánico). Google Ads emparejará este lead automáticamente por número de teléfono (Enhanced Conversions).
                </div>
              )}
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Carlos Pérez"
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Teléfono (WhatsApp) *
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+57 312 345 6789"
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Servicio
              </label>
              <div className="flex flex-col gap-1">
                <select
                  onChange={e => handleServiceSelectChange(e.target.value)}
                  className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-xs rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
                >
                  <option value="">Seleccionar del catálogo...</option>
                  {SERVICES_LIST.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  placeholder="O escribe servicio personalizado"
                  className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Precio Cobrado (COP)
              </label>
              <input
                type="number"
                value={priceCop}
                onChange={e => setPriceCop(e.target.value)}
                placeholder="200000"
                className="w-full bg-[#071322] border border-[#1e385c] text-[#34d399] font-mono font-bold text-sm rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              />
              <p className="text-[10px] text-[#8a9299] mt-1">
                {formatCopCurrency(Number(priceCop) || 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Fecha de la Cita / Contacto
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={e => setDateKey(e.target.value)}
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-xs rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Hora de la Cita
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                placeholder="15:00 o 3:00 PM"
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-xs rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Etapa en el Pipeline
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StageKey)}
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              >
                {COLUMNS.map(c => (
                  <option key={c.key} value={c.key}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a9299] mb-1">
                Estado del Pago
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as 'pending' | 'paid')}
                className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
              >
                <option value="pending">Pendiente de Pago</option>
                <option value="paid">✓ Pagado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a9299] mb-1">
              Notas / Requerimientos del Cliente
            </label>
            <textarea
              rows={3}
              value={requests}
              onChange={e => setRequests(e.target.value)}
              placeholder="Detalles de la conversación, masajista preferida, dolores específicos..."
              className="w-full bg-[#071322] border border-[#1e385c] text-[#cfe5fa] text-xs rounded-lg px-3 py-2 outline-none focus:border-[#38bdf8]"
            />
          </div>

          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1e385c] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDeleteRequest(booking)}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Eliminar Lead</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-[#8a9299] hover:text-white px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#001524] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors shadow disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal de Confirmación de Eliminación ────────────────────────────────────────

function DeleteConfirmModal({
  booking,
  onClose,
  onDeleted,
}: {
  booking: BookingRecord
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirmDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        setError('No se pudo eliminar el registro.')
        setDeleting(false)
        return
      }

      onDeleted()
      onClose()
    } catch {
      setError('Error de red al eliminar.')
      setDeleting(false)
    }
  }

  const displayName = bookingDisplayName(booking)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0f172a] border border-rose-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>

        <div>
          <h3 className="font-headline text-lg font-bold text-[#cfe5fa]">
            ¿Eliminar este lead definitivamente?
          </h3>
          <p className="text-xs text-[#8a9299] mt-1.5 leading-relaxed">
            Estás a punto de borrar el registro de{' '}
            <strong className="text-white">
              {displayName !== 'Desconocido' ? displayName : booking.phone}
            </strong>
            . Esta acción no se puede deshacer.
          </p>
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 bg-[#1e293b] hover:bg-[#334155] text-[#cfe5fa] text-xs font-bold py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal KanbanBoard ───────────────────────────────────────────

export default function KanbanBoard({
  bookings,
  onRefresh,
  role,
}: {
  bookings: BookingRecord[]
  onRefresh: () => void
  role: AdminRole
}) {
  // Recepción trabaja la agenda, no la pauta: nada de GCLID ni origen.
  const showAds = !hidesAdsAttribution(role)
  // Día de Bogotá para resaltar las citas de hoy. Se recalcula al cambiar el
  // set de reservas, suficiente para un tablero que se refresca solo.
  const today = useMemo(() => bogotaDay(), [])
  // Local state for optimistic instant card moving
  const [localBookings, setLocalBookings] = useState<BookingRecord[]>(bookings)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<StageKey | null>(null)
  const [pageByColumn, setPageByColumn] = useState<Record<StageKey, number>>({
    pending: 1,
    contacted: 1,
    arrived: 1,
    completed: 1,
    cancelled: 1,
  })
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [deletingBooking, setDeletingBooking] = useState<BookingRecord | null>(null)
  // Mobile: which column index (0-4) is currently displayed
  const [activeColumnMobile, setActiveColumnMobile] = useState(0)
  const isDraggingRef = useRef(false)

  // Sync prop changes into local state
  useEffect(() => {
    setLocalBookings(bookings)
  }, [bookings])

  // Filter bookings by search query
  const filteredBookings = useMemo(() => {
    if (!filterQuery.trim()) return localBookings
    const q = filterQuery.toLowerCase()
    return localBookings.filter(b => {
      const name = bookingDisplayName(b).toLowerCase()
      const phone = (b.phone || '').toLowerCase()
      const service = (b.serviceName || '').toLowerCase()
      const gclid = showAds ? (b.gclid || '').toLowerCase() : ''
      return name.includes(q) || phone.includes(q) || service.includes(q) || (showAds && gclid.includes(q))
    })
  }, [localBookings, filterQuery, showAds])

  // Group bookings by column stage & compute metrics
  const { grouped, stageTotals, totalPipelineValue } = useMemo(() => {
    const map: Record<StageKey, BookingRecord[]> = {
      pending: [],
      contacted: [],
      arrived: [],
      completed: [],
      cancelled: [],
    }

    const totals: Record<StageKey, number> = {
      pending: 0,
      contacted: 0,
      arrived: 0,
      completed: 0,
      cancelled: 0,
    }

    let pipelineVal = 0

    // Sort newest first
    const sorted = [...filteredBookings].sort(
      (a, b) => new Date(b.createdAt || b.scheduledAt).getTime() - new Date(a.createdAt || a.scheduledAt).getTime(),
    )

    for (const b of sorted) {
      const st = (b.status || 'pending') as StageKey
      const target = map[st] ? st : 'pending'
      map[target].push(b)
      const val = b.priceCop || 0
      totals[target] += val
      if (target !== 'cancelled') {
        pipelineVal += val
      }
    }

    return { grouped: map, stageTotals: totals, totalPipelineValue: pipelineVal }
  }, [filteredBookings])

  // Move booking with optimistic immediate UI response
  const moveBooking = async (id: string, newStatus: StageKey) => {
    // 1. Optimistic local update
    setLocalBookings(prev =>
      prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            status: newStatus,
            paymentStatus: newStatus === 'completed' ? 'paid' : b.paymentStatus,
          }
        }
        return b
      }),
    )

    // 2. Background server update
    try {
      const payload: { status: StageKey; paymentStatus?: 'paid' | 'pending' } = {
        status: newStatus,
      }
      if (newStatus === 'completed') {
        payload.paymentStatus = 'paid'
      }

      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        onRefresh() // rollback
      }
    } catch {
      onRefresh() // rollback on network failure
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    isDraggingRef.current = true
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  const handleDragEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false
    }, 100)
    setDraggedId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: StageKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear highlight when leaving the column entirely (not child elements)
    const related = e.relatedTarget as Node | null
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStatus: StageKey) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverColumn(null)
    const id = e.dataTransfer.getData('text/plain') || draggedId
    if (id) {
      moveBooking(id, targetStatus)
    }
    setDraggedId(null)
  }

  const handleStepMove = (e: React.MouseEvent, b: BookingRecord, direction: 'prev' | 'next', isMobile = false) => {
    e.stopPropagation()
    const currentStatus = (b.status || 'pending') as StageKey
    const currentIndex = COLUMNS.findIndex(c => c.key === currentStatus)
    if (currentIndex === -1) return

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (targetIndex >= 0 && targetIndex < COLUMNS.length) {
      moveBooking(b.id, COLUMNS[targetIndex].key)
      // On mobile, follow the card to its new column
      if (isMobile) setActiveColumnMobile(targetIndex)
    }
  }

  const handleCardClick = (b: BookingRecord) => {
    if (isDraggingRef.current) return
    setSelectedBooking(b)
  }

  const handlePageChange = (colKey: StageKey, delta: number) => {
    setPageByColumn(prev => ({
      ...prev,
      [colKey]: Math.max(1, (prev[colKey] || 1) + delta),
    }))
  }

  const cleanWaNumber = (phone: string) => phone.replace(/\D/g, '')

  // ─── Shared card renderer ─────────────────────────────────────────────────
  const renderCard = (b: BookingRecord, colIdx: number, isMobile = false) => {
    const displayName = bookingDisplayName(b)
    const isAds = b.source === 'ads' || Boolean(b.gclid || b.adgroup)
    const isToday = b.dateKey === today
    const waNum = cleanWaNumber(b.phone)
    const isPaid = b.paymentStatus === 'paid'
    const isBeingDragged = draggedId === b.id

    return (
      <div
        key={b.id}
        draggable={!isMobile}
        onDragStart={!isMobile ? (e => handleDragStart(e, b.id)) : undefined}
        onDragEnd={!isMobile ? handleDragEnd : undefined}
        onClick={() => handleCardClick(b)}
        className={`rounded-xl shadow-md transition-all flex flex-col gap-2 relative group ${
          isToday
            ? 'bg-[#2a1b06] border-2 border-[#f59e0b] shadow-[0_0_0_1px_rgba(245,158,11,0.25)]'
            : 'bg-[#0d1d32] border border-[#1d385c]'
        } ${
          isMobile
            ? 'p-4 hover:border-[#38bdf8]/50 active:scale-[0.99] cursor-pointer'
            : `p-3 hover:border-[#38bdf8]/70 hover:shadow-xl cursor-grab active:cursor-grabbing ${
                isBeingDragged ? 'opacity-30 scale-95 border-dashed border-[#38bdf8]' : ''
              }`
        }`}
      >
        {/* Deal Header: Name & Direct WhatsApp Link */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`font-bold text-[#cfe5fa] truncate group-hover:text-[#38bdf8] transition-colors ${
              isMobile ? 'text-sm' : 'text-xs'
            }`}>
              {displayName !== 'Desconocido' ? displayName : b.phone}
            </p>
            <p className={`text-[#8a9299] font-mono truncate mt-0.5 ${
              isMobile ? 'text-xs' : 'text-[11px]'
            }`}>
              {b.phone}
            </p>
          </div>

          {waNum && (
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label="Abrir WhatsApp del cliente"
              className={`flex items-center justify-center bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-[#001524] rounded-full transition-all shrink-0 shadow-sm ${
                isMobile ? 'w-9 h-9' : 'w-6 h-6'
              }`}
              title="Abrir chat en WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className={isMobile ? 'w-5 h-5' : 'w-3.5 h-3.5'}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </a>
          )}
        </div>

        {/* Service Details & Deal Value */}
        <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#071322] border border-[#172c4c]">
          <span className={`text-[#a5cce6] font-medium truncate ${
            isMobile ? 'text-xs max-w-[160px]' : 'text-xs max-w-[110px]'
          }`}>
            {b.serviceName || 'Lead WhatsApp'}
          </span>
          <span className={`font-bold font-mono text-[#34d399] ${
            isMobile ? 'text-sm' : 'text-xs'
          }`}>
            {b.priceCop ? formatCopCurrency(b.priceCop) : 'Por cotizar'}
          </span>
        </div>

        {/* GCLID Tag */}
        {showAds && b.gclid && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20 truncate">
            <span className="material-symbols-outlined text-[12px] shrink-0">ads_click</span>
            <span className="truncate">GCLID: {b.gclid}</span>
          </div>
        )}

        {/* Origin Badge & Date */}
        <div className="flex items-center justify-between gap-1.5 text-[10px]">
          {showAds ? (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-label uppercase tracking-wider font-semibold ${
              isAds
                ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30'
                : 'bg-[#8a9299]/15 text-[#8a9299] border border-[#8a9299]/20'
            }`}>
              {isAds ? (b.adgroup ? `Ads · ${b.adgroup}` : 'Google Ads') : 'Orgánico'}
            </span>
          ) : isToday ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-label uppercase tracking-wider font-semibold bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40">
              <span className="material-symbols-outlined text-[12px]">today</span>
              Hoy
            </span>
          ) : (
            <span />
          )}
          <span className={`font-mono text-[10px] truncate ${
            isToday ? 'text-[#fbbf24] font-bold' : 'text-[#8a9299]/80'
          }`}>
            {isToday ? 'HOY' : b.dateKey} {b.timeSlot}
          </span>
        </div>

        {/* Quick Step Move Controls */}
        <div className={`flex items-center justify-between border-t border-[#172c4c] gap-1 ${
          isMobile ? 'pt-2' : 'pt-1.5'
        }`}>
          <button
            type="button"
            disabled={colIdx === 0}
            onClick={e => handleStepMove(e, b, 'prev', isMobile)}
            aria-label="Mover a etapa anterior"
            className={`rounded bg-[#071322] text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#172c4c] disabled:opacity-20 disabled:hover:bg-[#071322] font-bold transition-colors ${
              isMobile ? 'px-4 py-2 text-base min-w-[44px] min-h-[44px] flex items-center justify-center' : 'px-2 py-0.5 text-xs'
            }`}
            title="Etapa anterior"
          >
            ‹
          </button>

          {isPaid ? (
            <span className={`font-bold text-[#34d399] inline-flex items-center gap-0.5 ${
              isMobile ? 'text-xs' : 'text-[10px]'
            }`}>
              <span className={`material-symbols-outlined ${
                isMobile ? 'text-[16px]' : 'text-[12px]'
              }`}>check_circle</span>
              Pagado
            </span>
          ) : (
            <span className={`text-[#8a9299] ${
              isMobile ? 'text-xs' : 'text-[10px]'
            }`}>Pendiente</span>
          )}

          <button
            type="button"
            disabled={colIdx === COLUMNS.length - 1}
            onClick={e => handleStepMove(e, b, 'next', isMobile)}
            aria-label="Mover a etapa siguiente"
            className={`rounded bg-[#071322] text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#172c4c] disabled:opacity-20 disabled:hover:bg-[#071322] font-bold transition-colors ${
              isMobile ? 'px-4 py-2 text-base min-w-[44px] min-h-[44px] flex items-center justify-center' : 'px-2 py-0.5 text-xs'
            }`}
            title="Siguiente etapa"
          >
            ›
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Pipedrive Style Pipeline Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-[#0a1628] border border-[#1e3358] rounded-xl shadow-lg">
        {COLUMNS.map(col => {
          const count = grouped[col.key]?.length || 0
          const val = stageTotals[col.key] || 0
          return (
            <div
              key={col.key}
              className="flex flex-col p-2.5 rounded-lg bg-[#071322] border border-[#172c4c] relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: col.accentColor }}
              />
              <div className="flex items-center justify-between text-xs text-[#8a9299] mb-1">
                <span className="truncate font-medium">{col.title}</span>
                <span className="font-bold text-white px-1.5 py-0.2 bg-[#1e3358] rounded-full text-[10px]">
                  {count}
                </span>
              </div>
              <div className="font-headline text-sm md:text-base font-bold text-[#cfe5fa] truncate">
                {formatCopCurrency(val)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a1628]/60 p-2.5 rounded-xl border border-[#1e3358]/60">
        <div className="relative flex-1 min-w-0 max-w-md">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9299] text-base pointer-events-none"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder={showAds ? 'Buscar por cliente, teléfono, GCLID o servicio...' : 'Buscar por cliente, teléfono o servicio...'}
            className="w-full bg-[#071322] border border-[#1e3358] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#cfe5fa] placeholder:text-[#8a9299]/50 outline-none focus:border-[#38bdf8] transition-colors select-text"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 leading-none text-[#8a9299] hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8a9299] font-medium">
          <span>
            Total: <strong className="text-[#38bdf8]">{filteredBookings.length}</strong>
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Valor:{' '}
            <strong className="text-[#22c55e]">{formatCopCurrency(totalPipelineValue)}</strong>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE VIEW — Single column with stage selector tabs
          Visible only on screens smaller than lg (< 1024px)
          ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-4">
        {/* Stage Selector Strip */}
        <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1 scrollbar-none">
          {COLUMNS.map((col, idx) => {
            const count = grouped[col.key]?.length || 0
            const isActive = activeColumnMobile === idx
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => setActiveColumnMobile(idx)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border text-xs font-bold font-label transition-all ${
                  isActive
                    ? 'text-white shadow-lg scale-[1.03]'
                    : 'bg-[#071322] border-[#172c4c] text-[#8a9299] hover:text-[#cfe5fa] hover:bg-[#0d1d32]'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${col.accentColor}25, ${col.accentColor}10)`,
                  borderColor: col.accentColor,
                  color: col.accentColor,
                } : undefined}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isActive ? { color: col.accentColor } : undefined}
                >
                  {col.icon}
                </span>
                <span className="whitespace-nowrap text-[10px] uppercase tracking-wider">
                  {col.title.replace(/^\d+\.\s*/, '')}
                </span>
                <span
                  className={`text-[11px] font-black tabular-nums px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-[#1e3358]'
                  }`}
                  style={isActive ? { color: col.accentColor } : { color: '#cfe5fa' }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Column Info Bar */}
        {(() => {
          const col = COLUMNS[activeColumnMobile]
          const totalStageVal = stageTotals[col.key] || 0
          const list = grouped[col.key] || []
          return (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl border"
              style={{
                background: `linear-gradient(135deg, ${col.accentColor}12, ${col.accentColor}05)`,
                borderColor: `${col.accentColor}40`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: col.accentColor }}
                >
                  {col.icon}
                </span>
                <div>
                  <p className="font-bold text-sm text-[#cfe5fa]">{col.title}</p>
                  <p className="text-[11px] text-[#8a9299]">{col.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-sm text-[#cfe5fa]">{formatCopCurrency(totalStageVal)}</p>
                <p className="text-[11px] text-[#8a9299]">{list.length} leads</p>
              </div>
            </div>
          )
        })()}

        {/* Cards for active column */}
        {(() => {
          const col = COLUMNS[activeColumnMobile]
          const colIdx = activeColumnMobile
          const list = grouped[col.key] || []
          const currentPage = pageByColumn[col.key] || 1
          const totalPages = Math.max(1, Math.ceil(list.length / CARDS_PER_PAGE))
          const startIndex = (currentPage - 1) * CARDS_PER_PAGE
          const visibleCards = list.slice(startIndex, startIndex + CARDS_PER_PAGE)

          return (
            <div className="flex flex-col gap-3">
              {visibleCards.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center text-[#8a9299]/50 border-2 border-dashed rounded-2xl"
                  style={{ borderColor: `${col.accentColor}30` }}
                >
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-30">
                    inbox
                  </span>
                  <p className="text-sm font-medium">Sin leads en esta etapa</p>
                  <p className="text-xs mt-1 text-[#8a9299]/40">
                    Mueve un lead aquí con los botones ‹ ›
                  </p>
                </div>
              ) : (
                visibleCards.map(b => renderCard(b, colIdx, true))
              )}

              {/* Pagination for mobile */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-3 text-sm font-medium text-[#8a9299]">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(col.key, -1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#071322] border border-[#172c4c] text-[#cfe5fa] disabled:opacity-30 transition-colors min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    Anterior
                  </button>
                  <span className="text-xs">{currentPage} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(col.key, 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#071322] border border-[#172c4c] text-[#cfe5fa] disabled:opacity-30 transition-colors min-h-[44px]"
                  >
                    Siguiente
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP VIEW — 5-column Pipedrive-style Kanban board
          Visible only on lg screens (≥ 1024px)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block overflow-x-auto pb-6">
        <div className="grid grid-cols-5 gap-3.5 min-w-[1150px]">
          {COLUMNS.map((col, colIdx) => {
            const list = grouped[col.key] || []
            const currentPage = pageByColumn[col.key] || 1
            const totalPages = Math.max(1, Math.ceil(list.length / CARDS_PER_PAGE))
            const startIndex = (currentPage - 1) * CARDS_PER_PAGE
            const visibleCards = list.slice(startIndex, startIndex + CARDS_PER_PAGE)
            const isOver = dragOverColumn === col.key
            const totalStageVal = stageTotals[col.key] || 0

            return (
              <div
                key={col.key}
                onDragOver={e => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.key)}
                className={`flex flex-col bg-[#071322] rounded-xl border transition-all duration-150 min-h-[640px] shadow-lg ${
                  isOver
                    ? 'border-[#38bdf8] bg-[#0c223a] ring-2 ring-[#38bdf8]/40 shadow-[#38bdf8]/20 scale-[1.01]'
                    : 'border-[#172c4c]'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#172c4c] bg-[#0a182c] rounded-t-xl flex flex-col gap-2 relative">
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ backgroundColor: col.accentColor }}
                  />

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="material-symbols-outlined text-[16px] shrink-0"
                        style={{ color: col.accentColor }}
                      >
                        {col.icon}
                      </span>
                      <h3 className="font-bold text-xs text-[#cfe5fa] tracking-tight truncate">
                        {col.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.pillColor} shrink-0`}
                    >
                      {list.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-[#172c4c]/60">
                    <span className="text-[#8a9299] text-[10px] truncate">{col.subtitle}</span>
                    <span className="text-[#cfe5fa] font-mono font-bold text-[11px]">
                      {formatCopCurrency(totalStageVal)}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                  {visibleCards.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#8a9299]/40 border-2 border-dashed border-[#172c4c]/60 rounded-lg m-1">
                      <span className="material-symbols-outlined text-2xl mb-1 opacity-30">
                        move_to_inbox
                      </span>
                      <span className="text-[10px] font-label uppercase tracking-widest">
                        Sin tratos aquí
                      </span>
                      <span className="text-[9px] text-[#8a9299]/30 mt-0.5">
                        Arrastra una tarjeta aquí
                      </span>
                    </div>
                  ) : (
                    visibleCards.map(b => renderCard(b, colIdx, false))
                  )}
                </div>

                {/* Column Footer with Pagination */}
                {totalPages > 1 && (
                  <div className="p-2 border-t border-[#172c4c] bg-[#0a182c] rounded-b-xl flex items-center justify-between text-[10px] font-medium text-[#8a9299]">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(col.key, -1)}
                      className="px-2 py-0.5 rounded hover:bg-[#172c4c] text-[#cfe5fa] disabled:opacity-20 transition-colors"
                    >
                      ‹ Ant
                    </button>
                    <span>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(col.key, 1)}
                      className="px-2 py-0.5 rounded hover:bg-[#172c4c] text-[#cfe5fa] disabled:opacity-20 transition-colors"
                    >
                      Sig ›
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Deal Modal */}
      {selectedBooking && (
        <LeadDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSaved={onRefresh}
          onDeleteRequest={b => {
            setSelectedBooking(null)
            setDeletingBooking(b)
          }}
          showAds={showAds}
        />
      )}

      {/* Safety Delete Confirmation Modal */}
      {deletingBooking && (
        <DeleteConfirmModal
          booking={deletingBooking}
          onClose={() => setDeletingBooking(null)}
          onDeleted={onRefresh}
        />
      )}
    </div>
  )
}
