'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { hidesPipelineTotals, type AdminRole } from '@/lib/admin-roles'
import type { BookingRecord } from '@/lib/booking-types'
import { formatCopValue } from '@/lib/format-currency'
import {
  computeLtv,
  DATA_ISSUE_LABELS,
  formatPhone,
  SUSPICIOUS_PRICE_BELOW,
  type Customer,
  type DataQualityRow,
} from '@/lib/ltv'

function fmtPct(n: number): string {
  const v = n * 100
  return `${v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)}%`
}

function fmtDay(dateKey: string): string {
  return dateKey ? dateKey.split('-').reverse().join('/') : '—'
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-[#0a2438] border border-[#42484c]/30 p-4 md:p-5">
      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299]">{label}</p>
      <p className="font-headline text-2xl md:text-3xl text-[#cfe5fa] mt-2 tabular-nums">{value}</p>
      {hint ? <p className="text-[11px] text-[#5c656d] font-body mt-1.5 leading-snug">{hint}</p> : null}
    </div>
  )
}

/** Una fila del panel "Completar datos": si el problema es el precio, se corrige aquí mismo. */
function FixRow({
  row,
  onSavePrice,
}: {
  row: DataQualityRow
  onSavePrice: (id: string, priceCop: number) => Promise<string | null>
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const needsPrice = row.issues.includes('sin_precio') || row.issues.includes('precio_sospechoso')

  const save = async () => {
    const amount = Number(value.replace(/[^\d]/g, ''))
    if (!Number.isFinite(amount) || amount < SUSPICIOUS_PRICE_BELOW) {
      setError('Escribe el valor completo en pesos, por ejemplo 150000.')
      return
    }
    setSaving(true)
    setError('')
    const failure = await onSavePrice(row.id, amount)
    if (failure) {
      setError(failure)
      setSaving(false)
    }
  }

  return (
    <li className="border border-[#42484c]/40 rounded-sm p-3 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-sm text-[#cfe5fa] truncate">
            {row.name} <span className="text-[#5c656d]">· {row.phone || 'Sin teléfono'}</span>
          </p>
          <p className="text-xs text-[#8a9299] mt-0.5">
            {fmtDay(row.dateKey)} · {row.serviceName || 'Sin servicio'}
            {row.priceCop > 0 ? ` · hoy figura ${formatCopValue(row.priceCop)}` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {row.issues.map(issue => (
              <span
                key={issue}
                className="font-label text-[9px] uppercase tracking-widest text-[#e8b4a4] border border-[#c97b63]/40 px-2 py-0.5"
              >
                {DATA_ISSUE_LABELS[issue]}
              </span>
            ))}
          </div>
        </div>

        {needsPrice ? (
          <div className="flex items-center gap-2 shrink-0">
            <input
              inputMode="numeric"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Precio en pesos"
              aria-label={`Precio de ${row.name} en pesos`}
              className="w-36 bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 min-h-11 md:min-h-0 md:py-2 outline-none"
            />
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !value.trim()}
              className="font-label text-[10px] uppercase tracking-[0.15em] bg-[#1a3d52] text-[#cfe5fa] px-4 min-h-11 md:min-h-0 md:py-2.5 disabled:opacity-40"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        ) : (
          <Link
            href="/admin/bookings"
            className="font-label text-[10px] uppercase tracking-[0.15em] text-[#a5cce6] underline underline-offset-4 shrink-0"
          >
            Corregir en Reservas
          </Link>
        )}
      </div>
      {error ? <p className="text-red-400/90 text-xs mt-2">{error}</p> : null}
    </li>
  )
}

function CustomerRow({
  customer,
  expanded,
  onToggle,
}: {
  customer: Customer
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <li className="border-b border-[#42484c]/25">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left px-3 md:px-4 py-3 hover:bg-[#0a2438]/50 md:grid md:grid-cols-[1fr_5rem_9rem_9rem_7rem] md:items-center md:gap-4"
      >
        <span className="block min-w-0">
          <span className="block font-body text-sm text-[#cfe5fa] truncate">
            {customer.name}
            {customer.isRepeat ? (
              <span className="ml-2 font-label text-[9px] uppercase tracking-widest text-[#a5cce6] border border-[#a5cce6]/40 px-1.5 py-0.5">
                Repite
              </span>
            ) : null}
            {customer.needsReview ? (
              <span
                className="ml-2 font-label text-[9px] uppercase tracking-widest text-[#e8b4a4]"
                title="Tiene un servicio sin precio o con precio sospechoso: el total está incompleto"
              >
                Revisar
              </span>
            ) : null}
          </span>
          <span className="block text-xs text-[#5c656d] tabular-nums">{formatPhone(customer.key)}</span>
        </span>
        <span className="flex justify-between md:block mt-2 md:mt-0 text-xs md:text-sm text-[#a5cce6]/90 tabular-nums md:text-right">
          <span className="md:hidden text-[#5c656d]">Visitas</span>
          {customer.visits}
        </span>
        <span className="flex justify-between md:block mt-1 md:mt-0 text-xs md:text-sm text-[#cfe5fa] tabular-nums md:text-right">
          <span className="md:hidden text-[#5c656d]">LTV</span>
          {formatCopValue(customer.totalCop)}
        </span>
        <span className="flex justify-between md:block mt-1 md:mt-0 text-xs md:text-sm text-[#a5cce6]/90 tabular-nums md:text-right">
          <span className="md:hidden text-[#5c656d]">Ticket promedio</span>
          {customer.avgTicketCop > 0 ? formatCopValue(customer.avgTicketCop) : '—'}
        </span>
        <span className="flex justify-between md:block mt-1 md:mt-0 text-xs md:text-sm text-[#8a9299] tabular-nums md:text-right">
          <span className="md:hidden text-[#5c656d]">Última visita</span>
          {fmtDay(customer.lastVisit)}
        </span>
      </button>

      {expanded ? (
        <div className="px-3 md:px-4 pb-4 bg-[#0a2438]/40">
          <ul className="flex flex-col gap-1.5 pt-3">
            {customer.history.map(h => (
              <li key={h.id} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-[#8a9299] tabular-nums shrink-0">{fmtDay(h.dateKey)}</span>
                <span className="text-[#cfe5fa] min-w-0 truncate flex-1">{h.serviceName || 'Sin servicio'}</span>
                <span className="text-[#a5cce6] tabular-nums shrink-0">
                  {h.priceCop > 0 ? formatCopValue(h.priceCop) : 'Sin precio'}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 mt-3">
            {customer.avgDaysBetween !== null ? (
              <span className="text-[11px] text-[#5c656d]">
                Vuelve cada {customer.avgDaysBetween} días en promedio
              </span>
            ) : null}
            <a
              href={`https://wa.me/${customer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-[10px] uppercase tracking-[0.15em] text-[#a5cce6] underline underline-offset-4"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </li>
  )
}

export default function ClientesClient({ role }: { role: AdminRole }) {
  const { replace } = useRouter()
  const showMoney = !hidesPipelineTotals(role)

  const [bookings, setBookings] = useState<BookingRecord[] | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'repeat'>('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/bookings', { credentials: 'same-origin', cache: 'no-store' })
      if (res.status === 401) {
        replace('/admin/login')
        return
      }
      if (!res.ok) {
        setError('No se pudieron cargar las reservas.')
        return
      }
      const data = (await res.json()) as { bookings?: BookingRecord[] }
      setBookings(Array.isArray(data.bookings) ? data.bookings : [])
    } catch {
      setError('Error de red')
    }
  }, [replace])

  useEffect(() => {
    void load()
  }, [load])

  const report = useMemo(() => (bookings ? computeLtv(bookings) : null), [bookings])

  const savePrice = useCallback(async (id: string, priceCop: number): Promise<string | null> => {
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceCop }),
      })
      if (!res.ok) return 'No se pudo guardar el precio.'
      setBookings(prev => (prev ? prev.map(b => (b.id === id ? { ...b, priceCop } : b)) : prev))
      return null
    } catch {
      return 'Error de red'
    }
  }, [])

  const visible = useMemo(() => {
    if (!report) return []
    const q = query.trim().toLowerCase()
    const digits = q.replace(/\D/g, '')
    return report.customers.filter(c => {
      if (filter === 'repeat' && !c.isRepeat) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || (digits.length > 0 && c.key.includes(digits))
    })
  }, [report, filter, query])

  if (!report && !error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }

  const s = report?.summary
  const quality = report?.quality ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Clientes</h1>
          <p className="text-[11px] text-[#5c656d] font-body mt-2">
            {showMoney
              ? 'Valor de vida (LTV) por cliente · solo servicios en etapa 4. Servicio Pagado'
              : 'Servicios pagados a los que les falta información'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start sm:self-auto font-label text-[10px] uppercase tracking-[0.15em] border border-[#42484c]/50 text-[#8a9299] hover:bg-[#0a2438] px-4 min-h-11 sm:min-h-0 sm:py-2.5"
        >
          Actualizar
        </button>
      </header>

      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}

      {/* Datos por completar: mientras haya servicios pagados sin precio, el LTV queda corto. */}
      {quality.length > 0 ? (
        <section className="mb-10">
          <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#e8b4a4] mb-1">
            Completar datos ({quality.length})
          </h2>
          <p className="text-xs text-[#8a9299] font-body mb-4 max-w-2xl leading-relaxed">
            Servicios pagados con información incompleta. Mientras no tengan el precio completo en
            pesos, el valor de los clientes se ve más bajo de lo real.
          </p>
          <ul className="flex flex-col gap-2">
            {quality.map(row => (
              <FixRow key={row.id} row={row} onSavePrice={savePrice} />
            ))}
          </ul>
        </section>
      ) : null}

      {showMoney && s ? (
        s.clients === 0 ? (
          <div className="border border-[#42484c]/40 rounded-sm py-16 px-6 text-center text-[#8a9299] font-body">
            Aún no hay servicios pagados con teléfono. Aparecerán aquí cuando una reserva llegue a
            “4. Servicio Pagado”.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
              <Kpi label="Clientes" value={s.clients.toLocaleString('es-CO')} hint="con al menos un servicio pagado" />
              <Kpi
                label="Clientes que repiten"
                value={s.repeatClients.toLocaleString('es-CO')}
                hint={`${fmtPct(s.repeatRate)} de los clientes han venido 2 o más veces`}
              />
              <Kpi label="LTV promedio" value={formatCopValue(s.avgLtvCop)} hint="lo que deja un cliente en promedio" />
              <Kpi
                label="LTV de quien repite"
                value={s.repeatClients > 0 ? formatCopValue(s.avgLtvRepeatCop) : '—'}
                hint={`vs ${formatCopValue(s.avgLtvOneTimeCop)} de quien vino una sola vez`}
              />
              <Kpi
                label="Ingresos de repetidores"
                value={fmtPct(s.repeatShare)}
                hint={`${formatCopValue(s.repeatCop)} de ${formatCopValue(s.totalCop)}`}
              />
              <Kpi
                label="Cada cuánto vuelven"
                value={s.avgDaysBetween !== null ? `${s.avgDaysBetween} días` : '—'}
                hint={
                  s.repeatClients > 0
                    ? `${s.avgVisitsRepeat.toLocaleString('es-CO')} visitas en promedio por repetidor`
                    : 'Aún nadie repite'
                }
              />
            </section>

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299]">
                  Clientes por valor ({visible.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex border border-[#42484c]/50">
                    {(
                      [
                        { key: 'all', label: 'Todos' },
                        { key: 'repeat', label: 'Repiten' },
                      ] as const
                    ).map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        aria-pressed={filter === f.key}
                        className={`flex-1 sm:flex-initial font-label text-[10px] uppercase tracking-[0.15em] px-4 min-h-11 sm:min-h-0 sm:py-2.5 transition-colors ${
                          filter === f.key ? 'bg-[#1a3d52] text-[#cfe5fa]' : 'text-[#8a9299] hover:bg-[#0a2438]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar nombre o teléfono"
                    aria-label="Buscar cliente"
                    className="bg-[#0f1f38] border border-[#1e3358] text-[#cfe5fa] text-sm rounded px-3 min-h-11 sm:min-h-0 sm:py-2 outline-none"
                  />
                </div>
              </div>

              <div className="border border-[#42484c]/40 rounded-sm">
                <div className="hidden md:grid grid-cols-[1fr_5rem_9rem_9rem_7rem] gap-4 px-4 py-3 border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
                  <span>Cliente</span>
                  <span className="text-right">Visitas</span>
                  <span className="text-right">LTV</span>
                  <span className="text-right">Ticket prom.</span>
                  <span className="text-right">Última visita</span>
                </div>
                {visible.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#8a9299] font-body">
                    Ningún cliente coincide con el filtro.
                  </p>
                ) : (
                  <ul>
                    {visible.map(c => (
                      <CustomerRow
                        key={c.key}
                        customer={c}
                        expanded={expanded === c.key}
                        onToggle={() => setExpanded(prev => (prev === c.key ? null : c.key))}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <p className="text-[10px] text-[#5c656d] font-body mt-8 max-w-3xl leading-relaxed">
              Un cliente es un teléfono: el mismo número escrito distinto cuenta como una persona.
              Una visita es un día con servicio pagado (dos servicios el mismo día son una visita).
              El LTV suma el precio de todos sus servicios en “4. Servicio Pagado”.
              {s.unassignedCount > 0
                ? ` Hay ${s.unassignedCount} servicio${s.unassignedCount === 1 ? '' : 's'} pagado${
                    s.unassignedCount === 1 ? '' : 's'
                  } sin teléfono (${formatCopValue(s.unassignedCop)}) que no se pueden asignar a un cliente.`
                : ''}
            </p>
          </>
        )
      ) : null}

      {!showMoney && quality.length === 0 && !error ? (
        <div className="border border-[#42484c]/40 rounded-sm py-16 px-6 text-center text-[#8a9299] font-body">
          Todos los servicios pagados tienen su información completa.
        </div>
      ) : null}
    </div>
  )
}
