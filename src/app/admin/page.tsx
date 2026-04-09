'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookingRecord } from '@/lib/booking-types'
import type { LedgerEntry } from '@/lib/ledger-types'
import type { PeriodMoney } from '@/lib/income-stats'
import DualCurrency from '@/components/DualCurrency'
import { formatCopFromUsd } from '@/lib/format-currency'
import { getExpenseCategoryName } from '@/lib/expense-categories'

type Stats = { today: PeriodMoney; week: PeriodMoney; month: PeriodMoney; currency: string }

type ExpenseCategoryRow = { id: string; name: string }

type LedgerModalState =
  | { mode: 'create'; kind: 'income' | 'expense' }
  | { mode: 'edit'; entry: LedgerEntry }

function bogotaTodayKey(): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function parseCopDigits(s: string): number | undefined {
  const digits = s.replace(/\D/g, '')
  if (!digits) return undefined
  const n = parseInt(digits, 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRecord[] | null | undefined>(undefined)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [ledgerModal, setLedgerModal] = useState<LedgerModalState | null>(null)
  const [saving, setSaving] = useState(false)
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryRow[]>([])
  const [seedExpensesDone, setSeedExpensesDone] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setError('')
    const res = await fetch('/api/bookings', { credentials: 'same-origin' })
    if (res.status === 401) {
      setBookings(null)
      router.replace('/admin/login')
      return
    }
    if (!res.ok) {
      setError('No se pudieron cargar los datos.')
      setBookings([])
      return
    }
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setLedger(data.ledger ?? [])
    setStats(data.stats ?? null)
    setExpenseCategories(data.expenseCategories ?? [])
    setSeedExpensesDone(Boolean(data.seedExpensesDone))
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    router.replace('/admin/login')
    router.refresh()
  }

  async function runExpenseSeed() {
    setNotice('')
    setError('')
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/seed-expenses', {
        method: 'POST',
        credentials: 'same-origin',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo importar')
        return
      }
      if (data.skipped) {
        setNotice('Los gastos iniciales ya estaban cargados (solo se puede hacer una vez).')
      } else {
        setNotice(`Se agregaron ${data.inserted as number} movimientos de gastos iniciales.`)
      }
      await load()
    } catch {
      setError('Error de red')
    } finally {
      setSeeding(false)
    }
  }

  if (bookings === undefined && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }

  if (bookings === null) {
    return null
  }

  return (
    <div className="min-h-screen px-6 pt-14 pb-10 md:px-12 md:pt-16 md:pb-12 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 mt-2">
        <div>
          <span className="font-label text-[#a5cce6] tracking-[0.3em] uppercase text-xs block mb-2">
            Diamond Spa
          </span>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Reservas y finanzas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setLedgerModal({ mode: 'create', kind: 'income' })}
            className="bg-[#1a3d52] border border-[#a5cce6]/35 text-[#a5cce6] px-5 py-2.5 font-label font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#234b61] transition-colors"
          >
            Agregar ingreso
          </button>
          <button
            type="button"
            onClick={() => setLedgerModal({ mode: 'create', kind: 'expense' })}
            className="bg-[#2c1810] border border-[#c97b63]/40 text-[#e8b4a4] px-5 py-2.5 font-label font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-[#3d2418] transition-colors"
          >
            Agregar gasto
          </button>
          <button
            type="button"
            disabled={seeding || seedExpensesDone}
            onClick={() => void runExpenseSeed()}
            title={
              seedExpensesDone
                ? 'Los gastos iniciales ya se importaron'
                : 'Cargar listado de gastos de apertura (una vez)'
            }
            className="bg-[#223747] border border-[#42484c]/50 text-[#cfe5fa] px-5 py-2.5 font-label font-bold tracking-[0.12em] text-[10px] uppercase hover:bg-[#2c4455] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {seeding ? 'Importando…' : 'Gastos iniciales'}
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="font-label text-xs uppercase tracking-widest text-[#8a9299] hover:text-[#a5cce6] px-2"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {stats ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          <PeriodCard title="Hoy" subtitle="Calendario Bogotá" p={stats.today} />
          <PeriodCard title="Esta semana" subtitle="Lun — dom" p={stats.week} />
          <PeriodCard title="Este mes" p={stats.month} />
        </section>
      ) : null}

      {notice ? (
        <p className="text-[#a5cce6]/90 font-body text-sm mb-4 border border-[#a5cce6]/25 bg-[#0a2438]/80 px-4 py-3">
          {notice}
        </p>
      ) : null}
      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}

      <section className="mb-14">
        <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
          Sesiones reservadas ({bookings?.length ?? 0})
        </h2>
        <div className="overflow-x-auto border border-[#42484c]/40 rounded-sm">
          <table className="w-full text-left text-sm font-body">
            <thead>
              <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Hora</th>
                <th className="py-3 px-4 font-medium">Servicio</th>
                <th className="py-3 px-4 font-medium">Cliente</th>
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
              {(bookings ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-[#8a9299]">
                    Aún no hay reservas. Aparecerán aquí cuando un cliente confirme en la página de reservas.
                  </td>
                </tr>
              ) : (
                (bookings ?? []).map(b => (
                  <tr key={b.id} className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50">
                    <td className="py-3 px-4 whitespace-nowrap">{b.dateKey}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{b.timeSlot}</td>
                    <td className="py-3 px-4">
                      <span className="block">{b.serviceName}</span>
                      <span className="text-[#8a9299] text-xs">{b.duration}</span>
                    </td>
                    <td className="py-3 px-4">
                      {b.firstName} {b.lastName}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#a5cce6]/90">
                      <span className="block">{b.phone}</span>
                      <span className="text-[#8a9299]">{b.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <DualCurrency usd={b.price} tone="income" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
          Ingresos y gastos manuales ({ledger.length})
        </h2>
        <p className="text-[11px] text-[#5c656d] font-body mb-3 max-w-3xl">
          Las categorías de gasto se reutilizan al crear o editar movimientos. Use «Gastos iniciales» una vez para
          importar el listado de apertura (COP guardado donde aplica; USD según tasa).
        </p>
        <div className="overflow-x-auto border border-[#42484c]/40 rounded-sm">
          <table className="w-full text-left text-sm font-body">
            <thead>
              <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Tipo</th>
                <th className="py-3 px-4 font-medium min-w-[140px]">Categoría</th>
                <th className="py-3 px-4 font-medium text-right">
                  Monto
                  <span className="block font-normal normal-case tracking-normal text-[9px] text-[#5c656d] mt-1">
                    USD · COP
                  </span>
                </th>
                <th className="py-3 px-4 font-medium">Nota</th>
                <th className="py-3 px-4 font-medium text-right w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-[#8a9299]">
                    Use «Agregar ingreso» o «Agregar gasto» para registrar movimientos fuera de las reservas.
                  </td>
                </tr>
              ) : (
                ledger.map(e => (
                  <tr key={e.id} className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50">
                    <td className="py-3 px-4 whitespace-nowrap">{e.dateKey}</td>
                    <td className="py-3 px-4">
                      <span className={e.kind === 'income' ? 'text-[#a5cce6]' : 'text-[#e8b4a4]'}>
                        {e.kind === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#8a9299] leading-snug">
                      {e.kind === 'expense'
                        ? getExpenseCategoryName(e.categoryId) ?? '—'
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <DualCurrency
                        usd={e.amount}
                        copOverride={e.amountCop}
                        tone={e.kind === 'income' ? 'income' : 'expense'}
                      />
                    </td>
                    <td className="py-3 px-4 text-[#8a9299] text-xs max-w-xs">{e.note ?? '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setLedgerModal({ mode: 'edit', entry: e })}
                        className="font-label text-[10px] uppercase tracking-widest text-[#a5cce6] border border-[#a5cce6]/35 px-3 py-1.5 hover:bg-[#1a3d52] transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {ledgerModal ? (
        <LedgerModal
          state={ledgerModal}
          categories={expenseCategories}
          saving={saving}
          onClose={() => !saving && setLedgerModal(null)}
          onSave={async payload => {
            setSaving(true)
            setError('')
            try {
              const isEdit = Boolean(payload.id)
              const base: Record<string, unknown> = {
                kind: payload.kind,
                amount: payload.amount,
                dateKey: payload.dateKey,
                note: payload.note,
              }
              if (payload.kind === 'expense') {
                base.categoryId = payload.categoryId ?? ''
                if (payload.amountCop === null) base.amountCop = null
                else if (payload.amountCop !== undefined && payload.amountCop > 0)
                  base.amountCop = payload.amountCop
              }
              if (isEdit) base.id = payload.id

              const res = await fetch('/api/ledger', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(base),
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(typeof data.error === 'string' ? data.error : 'No se pudo guardar')
                return
              }
              setLedgerModal(null)
              await load()
            } catch {
              setError('Error de red')
            } finally {
              setSaving(false)
            }
          }}
        />
      ) : null}
    </div>
  )
}

function PeriodCard({ title, subtitle, p }: { title: string; subtitle?: string; p: PeriodMoney }) {
  return (
    <div className="bg-[#0a2438] border border-[#42484c]/30 p-6">
      <span className="font-label text-[10px] uppercase tracking-widest text-[#8a9299] block mb-1">{title}</span>
      {subtitle ? <span className="text-[10px] text-[#5c656d] block mb-3">{subtitle}</span> : <div className="mb-3" />}
      <p className="text-[9px] text-[#5c656d] mb-3 font-body">Montos en dólares (USD) y pesos (COP) según tasa configurada.</p>
      <dl className="space-y-3 text-sm font-body">
        <div className="flex justify-between gap-4 items-start">
          <dt className="text-[#8a9299] shrink-0 pt-0.5">Por reservas</dt>
          <dd>
            <DualCurrency usd={p.sessionsIncome} tone="muted" />
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-start">
          <dt className="text-[#8a9299] shrink-0 pt-0.5">Otros ingresos</dt>
          <dd>
            <DualCurrency usd={p.otherIncome} tone="income" />
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-start">
          <dt className="text-[#8a9299] shrink-0 pt-0.5">Gastos</dt>
          <dd>
            <DualCurrency usd={p.expenses} tone="expense" />
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-start pt-2 border-t border-[#42484c]/40">
          <dt className="font-label text-[10px] uppercase tracking-widest text-[#a5cce6] shrink-0 pt-1">Ingreso total</dt>
          <dd>
            <DualCurrency usd={p.totalIncome} tone="income" />
          </dd>
        </div>
        <div className="flex justify-between gap-4 items-start">
          <dt className="font-label text-[10px] uppercase tracking-widest text-on-surface shrink-0 pt-1">Balance neto</dt>
          <dd>
            <DualCurrency
              usd={p.net}
              tone={p.net >= 0 ? 'netPositive' : 'netNegative'}
              prominent
            />
          </dd>
        </div>
      </dl>
    </div>
  )
}

function LedgerModal({
  state,
  categories,
  saving,
  onClose,
  onSave,
}: {
  state: LedgerModalState
  categories: ExpenseCategoryRow[]
  saving: boolean
  onClose: () => void
  onSave: (p: {
    id?: string
    kind: 'income' | 'expense'
    amount: number
    dateKey: string
    note: string
    categoryId?: string
    amountCop?: number | null
  }) => Promise<void>
}) {
  const [kind, setKind] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [dateKey, setDateKey] = useState(bogotaTodayKey())
  const [note, setNote] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amountCopStr, setAmountCopStr] = useState('')

  useEffect(() => {
    if (state.mode === 'edit') {
      const e = state.entry
      setKind(e.kind)
      setAmount(String(e.amount))
      setDateKey(e.dateKey)
      setNote(e.note ?? '')
      setCategoryId(e.categoryId ?? '')
      setAmountCopStr(e.amountCop != null ? String(e.amountCop) : '')
    } else {
      setKind(state.kind)
      setAmount('')
      setDateKey(bogotaTodayKey())
      setNote('')
      setCategoryId('')
      setAmountCopStr('')
    }
  }, [state])

  const copPreview = useMemo(() => {
    const n = Number(String(amount).replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) return null
    return formatCopFromUsd(n)
  }, [amount])

  const title =
    state.mode === 'edit'
      ? 'Editar movimiento'
      : state.kind === 'income'
        ? 'Registrar ingreso'
        : 'Registrar gasto'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(String(amount).replace(',', '.'))
    if (kind === 'income') {
      if (!Number.isFinite(n) || n <= 0) return
    } else {
      if (!Number.isFinite(n) || n < 0) return
    }

    const parsedCop = parseCopDigits(amountCopStr)
    let amountCop: number | null | undefined
    if (kind === 'expense') {
      if (parsedCop !== undefined) amountCop = parsedCop
      else if (
        state.mode === 'edit' &&
        state.entry.amountCop != null &&
        amountCopStr.trim() === ''
      ) {
        amountCop = null
      }
    }

    await onSave({
      id: state.mode === 'edit' ? state.entry.id : undefined,
      kind,
      amount: n,
      dateKey,
      note,
      categoryId: kind === 'expense' ? categoryId : undefined,
      amountCop: kind === 'expense' ? amountCop : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="ledger-modal-title"
        className="w-full max-w-md bg-[#071d2d] border border-[#42484c]/50 p-8 shadow-xl"
      >
        <h2 id="ledger-modal-title" className="font-headline text-xl text-[#cfe5fa] mb-6">
          {title}
        </h2>
        <form onSubmit={e => void handleSubmit(e)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="font-label text-xs text-[#8a9299] uppercase tracking-widest">Tipo</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-body text-sm text-[#cfe5fa] cursor-pointer">
                <input
                  type="radio"
                  name="ledger-kind"
                  checked={kind === 'income'}
                  onChange={() => setKind('income')}
                  className="accent-[#a5cce6]"
                />
                Ingreso
              </label>
              <label className="flex items-center gap-2 font-body text-sm text-[#cfe5fa] cursor-pointer">
                <input
                  type="radio"
                  name="ledger-kind"
                  checked={kind === 'expense'}
                  onChange={() => setKind('expense')}
                  className="accent-[#c97b63]"
                />
                Gasto
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="amt" className="font-label text-xs text-[#8a9299] uppercase tracking-widest">
              Monto en dólares (USD)
            </label>
            <input
              id="amt"
              type="text"
              inputMode="decimal"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none py-3 px-3 font-body text-sm text-[#cfe5fa]"
              placeholder="0"
            />
            {copPreview ? (
              <p className="text-xs text-[#8a9299] mt-1">
                Equivalente aproximado: <span className="text-[#cfe5fa]">{copPreview} COP</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dk" className="font-label text-xs text-[#8a9299] uppercase tracking-widest">
              Fecha
            </label>
            <input
              id="dk"
              type="date"
              required
              value={dateKey}
              onChange={e => setDateKey(e.target.value)}
              className="bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none py-3 px-3 font-body text-sm text-[#cfe5fa] scheme-dark"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nt" className="font-label text-xs text-[#8a9299] uppercase tracking-widest">
              Nota (opcional)
            </label>
            <input
              id="nt"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="bg-[#0a2438] border-b border-[#42484c] focus:border-[#a5cce6] outline-none py-3 px-3 font-body text-sm text-[#cfe5fa]"
              placeholder="Ej. insumos, propina, etc."
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 py-3 font-label text-xs uppercase tracking-widest text-[#8a9299] border border-[#42484c]/50 hover:border-[#8a9299] transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 font-label font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-40 ${
                kind === 'income'
                  ? 'bg-[#a5cce6] text-[#001524] hover:bg-white'
                  : 'bg-[#c97b63] text-[#1a0f0a] hover:bg-[#e8a090]'
              }`}
            >
              {saving ? 'Guardando…' : state.mode === 'edit' ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
