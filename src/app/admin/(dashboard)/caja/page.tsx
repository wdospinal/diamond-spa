'use client'

/**
 * Caja — ingresos y egresos del spa.
 *
 * Los movimientos entran solos desde WhatsApp (ver `whatsapp-router.ts`) y esta
 * página es donde se corrige lo que el parser interpretó mal. Por eso todo es
 * editable en línea y nada requiere aprobación previa: lo que ya tiene monto
 * suma, y lo que no, aparece arriba pidiendo que lo completen.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  categoryLabel,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type LedgerEntry,
  type LedgerKind,
} from '@/lib/ledger-types'
import { summarize, type CashSummary } from '@/lib/cash-summary'
import { formatCop, getMassageServices, getFacialServices, getHairRemovalServices } from '@/lib/services'
import { STAFF_NAMES } from '@/lib/staff'

interface LedgerResponse {
  from: string
  to: string
  entries: LedgerEntry[]
  summary: CashSummary
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const ALL_SERVICES = [...getMassageServices(), ...getFacialServices(), ...getHairRemovalServices()]

function shiftMonth(month: string, delta: number): string {
  const total = Number(month.slice(0, 4)) * 12 + (Number(month.slice(5, 7)) - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

function monthLabel(month: string): string {
  return `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`
}

function lastDayOf(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`
}

function dayLabel(day: string): string {
  const d = new Date(`${day}T12:00:00Z`)
  const weekday = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][
    d.getUTCDay()
  ]
  return `${weekday} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`
}

/** Nombre visible del movimiento: el servicio si lo hay, si no la categoría. */
function title(e: LedgerEntry): string {
  if (e.serviceLabel) return e.quantity > 1 ? `${e.quantity}× ${e.serviceLabel}` : e.serviceLabel
  return categoryLabel(e.kind, e.categoryId)
}

// ─── Tarjetas de totales ────────────────────────────────────────────────────────

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-emerald-300' : tone === 'bad' ? 'text-rose-300' : 'text-[#cfe5fa]'
  return (
    <div className="rounded bg-surface-container-low border border-[#1b3346] px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-[#5c656d] font-body">{label}</div>
      <div className={`font-headline text-xl md:text-2xl mt-1 ${color}`}>{value}</div>
    </div>
  )
}

// ─── Fila editable ──────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onChange,
}: {
  entry: LedgerEntry
  onChange: (e: LedgerEntry) => void
}) {
  const [open, setOpen] = useState(false)
  // Meta borra los adjuntos a los ~30 días; pasado ese plazo la miniatura ya no
  // carga y se muestra el punto de color, no un recuadro roto.
  const [mediaOk, setMediaOk] = useState(true)
  const [amount, setAmount] = useState(String(entry.amountCop || ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const needsAmount = entry.status === 'needs_amount'
  const voided = entry.status === 'void'

  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      setSaving(true)
      setError('')
      try {
        const res = await fetch(`/api/ledger/${encodeURIComponent(entry.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          setError('No se pudo guardar')
          return
        }
        const json = (await res.json()) as { entry: LedgerEntry }
        onChange(json.entry)
      } catch {
        setError('Error de red')
      } finally {
        setSaving(false)
      }
    },
    [entry.id, onChange],
  )

  const saveAmount = () => {
    // Se escribe como en el chat: «260.000», «260000» o «260k».
    const raw = amount.trim().toLowerCase()
    const n = raw.endsWith('k')
      ? Number(raw.slice(0, -1).replace(/[.,]/g, '')) * 1000
      : Number(raw.replace(/[.\s]/g, '').replace(',', '.'))
    if (!Number.isFinite(n) || n < 0) {
      setError('Monto inválido')
      return
    }
    if (Math.round(n) === entry.amountCop && !needsAmount) return
    void patch({ amountCop: Math.round(n) })
  }

  const categories = entry.kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <li
      className={`rounded border px-3 py-2.5 transition-colors ${
        voided
          ? 'border-[#1b3346]/50 bg-transparent opacity-50'
          : needsAmount
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-[#1b3346] bg-surface-container-low'
      }`}
    >
      <div className="flex items-center gap-3">
        {entry.mediaId && mediaOk ? (
          <a
            href={`/api/whatsapp/media/${entry.mediaId}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 w-10 h-10 rounded overflow-hidden bg-surface-variant"
            title="Ver comprobante"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/whatsapp/media/${entry.mediaId}`}
              alt=""
              onError={() => setMediaOk(false)}
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <span
            className={`shrink-0 w-2.5 h-2.5 rounded-full ${
              entry.kind === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
        )}

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="text-sm text-[#cfe5fa] font-body truncate">
            {title(entry)}
            {entry.durationMinutes ? (
              <span className="text-[#5c656d]"> · {entry.durationMinutes} min</span>
            ) : null}
            {entry.therapist ? <span className="text-[#8a9299]"> · {entry.therapist}</span> : null}
          </div>
          {entry.note ? (
            <div className="text-[11px] text-[#5c656d] font-body truncate">{entry.note}</div>
          ) : null}
        </button>

        <div className="shrink-0 flex items-center gap-2">
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onBlur={saveAmount}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            inputMode="numeric"
            placeholder="monto"
            disabled={saving || voided}
            className={`w-28 text-right bg-transparent border rounded px-2 py-1 text-sm font-body tabular-nums ${
              needsAmount
                ? 'border-amber-500/50 text-amber-200 placeholder:text-amber-500/50'
                : 'border-transparent hover:border-[#1b3346] focus:border-primary/50 text-[#cfe5fa]'
            } outline-none`}
          />
          <span className={entry.kind === 'income' ? 'text-emerald-400/60' : 'text-rose-400/60'}>
            {entry.kind === 'income' ? '+' : '−'}
          </span>
        </div>
      </div>

      {open && !voided ? (
        <div className="mt-3 pt-3 border-t border-[#1b3346] grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="text-[11px] text-[#5c656d] font-body">
            Tipo
            <select
              value={entry.kind}
              onChange={e => {
                const kind = e.target.value as LedgerKind
                // La categoría pertenece al tipo: al cambiarlo hay que reponerla.
                void patch({ kind, categoryId: 'other' })
              }}
              className="mt-1 w-full bg-surface-container border border-[#1b3346] rounded px-2 py-1.5 text-sm text-[#cfe5fa]"
            >
              <option value="income">Ingreso</option>
              <option value="expense">Egreso</option>
            </select>
          </label>

          <label className="text-[11px] text-[#5c656d] font-body">
            Categoría
            <select
              value={entry.categoryId}
              onChange={e => void patch({ categoryId: e.target.value })}
              className="mt-1 w-full bg-surface-container border border-[#1b3346] rounded px-2 py-1.5 text-sm text-[#cfe5fa]"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] text-[#5c656d] font-body">
            Servicio
            <select
              value={entry.serviceId ?? ''}
              onChange={e => {
                const id = e.target.value
                const svc = ALL_SERVICES.find(s => s.id === id)
                void patch({ serviceId: id, serviceLabel: svc ? svc.name.es : entry.serviceLabel })
              }}
              className="mt-1 w-full bg-surface-container border border-[#1b3346] rounded px-2 py-1.5 text-sm text-[#cfe5fa]"
            >
              <option value="">
                {entry.serviceLabel ? `${entry.serviceLabel} (fuera del catálogo)` : '— ninguno —'}
              </option>
              {ALL_SERVICES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name.es}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] text-[#5c656d] font-body">
            Terapeuta
            <select
              value={entry.therapist ?? ''}
              onChange={e => void patch({ therapist: e.target.value })}
              className="mt-1 w-full bg-surface-container border border-[#1b3346] rounded px-2 py-1.5 text-sm text-[#cfe5fa]"
            >
              <option value="">— sin asignar —</option>
              {/* Un nombre que venga de WhatsApp y ya no esté en la lista (alguien
                  que salió del equipo) se conserva como opción, para no borrarlo
                  en silencio al abrir un movimiento viejo. */}
              {entry.therapist && !STAFF_NAMES.includes(entry.therapist) ? (
                <option value={entry.therapist}>{entry.therapist}</option>
              ) : null}
              {STAFF_NAMES.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="col-span-2 md:col-span-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#5c656d] font-body">
              {entry.source === 'whatsapp' ? `WhatsApp · ${entry.author}` : `Manual · ${entry.author}`}
              {entry.confidence === 'low' ? ' · interpretación dudosa' : ''}
            </span>
            <button
              type="button"
              onClick={() => void patch({ status: 'void' })}
              className="text-[11px] text-rose-300/80 hover:text-rose-300 font-body"
            >
              Anular movimiento
            </button>
          </div>
        </div>
      ) : null}

      {voided ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#5c656d] font-body">Anulado</span>
          <button
            type="button"
            onClick={() => void patch({ status: entry.amountCop > 0 ? 'active' : 'needs_amount' })}
            className="text-[11px] text-primary/80 hover:text-primary font-body"
          >
            Restaurar
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[11px] text-rose-300 font-body">{error}</p> : null}
    </li>
  )
}

// ─── Página ─────────────────────────────────────────────────────────────────────

export default function CajaPage() {
  const { replace } = useRouter()
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [data, setData] = useState<LedgerResponse | null | undefined>(undefined)
  const [error, setError] = useState('')

  const load = useCallback(
    async (m: string) => {
      setError('')
      try {
        const res = await fetch(`/api/ledger?from=${m}-01&to=${lastDayOf(m)}`, {
          credentials: 'same-origin',
        })
        if (res.status === 401) {
          replace('/admin/login')
          return
        }
        if (!res.ok) {
          setError('No se pudieron cargar los movimientos.')
          setData(null)
          return
        }
        setData((await res.json()) as LedgerResponse)
      } catch {
        setError('Error de red')
        setData(null)
      }
    },
    [replace],
  )

  useEffect(() => {
    void load(month)
  }, [load, month])

  /** Reemplaza un movimiento y recalcula los totales sin volver a pedir todo. */
  const replaceEntry = useCallback((updated: LedgerEntry) => {
    setData(d => {
      if (!d) return d
      const entries = d.entries.map(e => (e.id === updated.id ? updated : e))
      return { ...d, entries, summary: summarize(entries) }
    })
  }, [])

  const { pending, byDay } = useMemo(() => {
    const entries = data?.entries ?? []
    const pending = entries.filter(e => e.status === 'needs_amount')
    const groups = new Map<string, LedgerEntry[]>()
    for (const e of entries) {
      const list = groups.get(e.day) ?? []
      list.push(e)
      groups.set(e.day, list)
    }
    return {
      pending,
      byDay: [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])),
    }
  }, [data])

  if (data === undefined && !error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }

  const s = data?.summary

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Caja</h1>
          <p className="text-[11px] text-[#5c656d] font-body mt-2">
            Los comprobantes reenviados al WhatsApp del sistema entran aquí solos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth(m => shiftMonth(m, -1))}
            className="px-3 py-1.5 rounded border border-[#1b3346] text-sm text-[#8a9299] hover:text-[#cfe5fa] font-body"
          >
            ←
          </button>
          <span className="font-body text-sm text-[#cfe5fa] min-w-32 text-center capitalize">
            {monthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth(m => shiftMonth(m, 1))}
            className="px-3 py-1.5 rounded border border-[#1b3346] text-sm text-[#8a9299] hover:text-[#cfe5fa] font-body"
          >
            →
          </button>
        </div>
      </header>

      {error ? <p className="mb-6 text-sm text-rose-300 font-body">{error}</p> : null}

      {s ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Kpi label="Ingresos" value={formatCop(s.incomeCop)} tone="good" />
          <Kpi label="Egresos" value={formatCop(s.expenseCop)} tone="bad" />
          <Kpi label="Utilidad" value={formatCop(s.profitCop)} />
          <Kpi label="Servicios" value={String(s.services)} />
        </div>
      ) : null}

      {pending.length > 0 ? (
        <section className="mb-8">
          <h2 className="font-body text-xs uppercase tracking-wider text-amber-300/80 mb-3">
            Falta el monto ({pending.length}) — no suman todavía
          </h2>
          <ul className="space-y-2">
            {pending.map(e => (
              <EntryRow key={e.id} entry={e} onChange={replaceEntry} />
            ))}
          </ul>
        </section>
      ) : null}

      {byDay.length === 0 ? (
        <p className="text-sm text-[#5c656d] font-body py-12 text-center">
          Sin movimientos en {monthLabel(month)}.
        </p>
      ) : (
        byDay.map(([day, entries]) => (
          <section key={day} className="mb-6">
            <h2 className="font-body text-xs uppercase tracking-wider text-[#5c656d] mb-2 capitalize">
              {dayLabel(day)}
            </h2>
            <ul className="space-y-2">
              {entries.map(e => (
                <EntryRow key={e.id} entry={e} onChange={replaceEntry} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
