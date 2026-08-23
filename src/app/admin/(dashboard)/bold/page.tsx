'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPA_HOURS } from '@/lib/spa'

type BoldMonth = {
  month: string
  grossCop: number
  closingCop: number
  transactions: number
  refundsCop: number
  refundCount: number
  closings: number
}

type BoldClosing = {
  id: string
  day: string
  grossCop: number
  closingCop: number
  transactions: number
  refundsCop: number
  refundCount: number
  fromLabel: string
  toLabel: string
  source: 'imap' | 'manual'
}

type BoldDay = {
  day: string
  grossCop: number
  closingCop: number
  transactions: number
  refundsCop: number
  refundCount: number
  closings: number
}

type BoldResponse = {
  today: string
  currentMonth: string
  previousMonth: string
  rangeStart: string
  rangeEnd: string
  months: BoldMonth[]
  current: BoldMonth
  previous: BoldMonth
  mtd: { dayOfMonth: number; current: BoldMonth; previous: BoldMonth }
  days: BoldClosing[]
  daily: BoldDay[]
}

const RANGES = [6, 12, 24]
const PAGE_SIZE = 20

/** Escala estilo GitHub: 0 vacío → 4 máximo. */
const HEAT = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] as const

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const COP_COMPACT = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const DAY_LONG = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const WEEKDAY_LONG = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  timeZone: 'UTC',
})
const MONTH_SHORT = new Intl.DateTimeFormat('es-CO', {
  month: 'short',
  timeZone: 'UTC',
})

function fmtCop(n: number): string {
  return COP.format(n || 0)
}

/** 'YYYY-MM-DD' → Date UTC a mediodía (evita saltos de zona). */
function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!, 12))
}

function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** '2026-08-21' → '21 de agosto' */
function dayLabel(day: string): string {
  return DAY_LONG.format(parseDay(day))
}

/** '2026-08-21' → 'viernes' */
function weekdayLabel(day: string): string {
  return WEEKDAY_LONG.format(parseDay(day))
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** '10:00' → '10am', '22:00' → '10pm'. */
function hourLabel(hhmm: string): string {
  const hour = Number(hhmm.slice(0, 2))
  const suffix = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}${suffix}`
}

/** Horario del spa según el día (SPA_HOURS): lun–sáb 10am–10pm, dom 10am–7pm. */
function spaHoursForDay(day: string): string {
  const isSunday = parseDay(day).getUTCDay() === 0
  const slot = isSunday ? SPA_HOURS[1] : SPA_HOURS[0]
  return `${hourLabel(slot.opens)} – ${hourLabel(slot.closes)}`
}

/** Turno: 'Viernes · 10am – 10pm' */
function shiftLabel(day: string): string {
  return `${capitalize(weekdayLabel(day))} · ${spaHoursForDay(day)}`
}

/** 'YYYY-MM' → 'ago 26' */
function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  const name = MONTH_SHORT.format(new Date(Date.UTC(Number(y), Number(m) - 1, 1))).replace('.', '')
  return `${name} ${y!.slice(2)}`
}

function fmtDelta(current: number, previous: number): { text: string; tone: string } {
  if (!previous) {
    return { text: current ? 'sin base de comparación' : '—', tone: 'text-[#8a9299]' }
  }
  const pct = ((current - previous) / previous) * 100
  const sign = pct >= 0 ? '+' : '−'
  return {
    text: `${sign}${Math.abs(pct).toFixed(Math.abs(pct) >= 10 ? 0 : 1)}%`,
    tone: pct >= 0 ? 'text-[#7fc9a6]' : 'text-[#c97b63]',
  }
}

/**
 * Línea mes a mes. SVG a mano: el proyecto no tiene librería de gráficos
 * (el embudo también dibuja a mano) y así no se añade una dependencia.
 */
function GrowthChart({ months }: { months: BoldMonth[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const active = hover ?? pinned

  const W = 720
  const H = 240
  const padX = 44
  const padTop = 18
  const padBottom = 34

  const values = months.map(m => m.grossCop)
  const max = Math.max(...values, 1)
  const scaleMax = max * 1.15
  const stepX = months.length > 1 ? (W - padX * 2) / (months.length - 1) : 0
  const x = (i: number) => padX + i * stepX
  const y = (v: number) => H - padBottom - (v / scaleMax) * (H - padTop - padBottom)

  const points = months.map((m, i) => `${x(i)},${y(m.grossCop)}`).join(' ')
  const area = `${padX},${H - padBottom} ${points} ${x(months.length - 1)},${H - padBottom}`
  const labelEvery = months.length > 14 ? 2 : 1
  const grid = [0.25, 0.5, 0.75, 1].map(f => scaleMax * f)

  const activeMonth = active !== null ? months[active] : null
  const tooltipW = 168
  const tooltipH = 44
  const tooltipX = active !== null ? Math.min(Math.max(x(active) - tooltipW / 2, 8), W - tooltipW - 8) : 0
  const tooltipY = active !== null && activeMonth ? Math.max(y(activeMonth.grossCop) - tooltipH - 12, 4) : 0

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[520px] h-auto"
        role="img"
        aria-label="Ventas de Bold por mes. Pasa el mouse o toca un punto para ver el valor."
      >
        <defs>
          <linearGradient id="boldArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5cce6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#a5cce6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map(v => (
          <g key={v}>
            <line x1={padX} x2={W - padX} y1={y(v)} y2={y(v)} stroke="#42484c" strokeOpacity="0.35" />
            <text x={4} y={y(v) + 4} fill="#5c656d" fontSize="10">
              {COP_COMPACT.format(v)}
            </text>
          </g>
        ))}

        <polygon points={area} fill="url(#boldArea)" />
        <polyline points={points} fill="none" stroke="#a5cce6" strokeWidth="2" strokeLinejoin="round" />

        {months.map((m, i) => {
          const isActive = active === i
          return (
            <g key={m.month}>
              <circle
                cx={x(i)}
                cy={y(m.grossCop)}
                r={isActive ? 6 : i === months.length - 1 ? 5 : 3.5}
                fill={isActive || i === months.length - 1 ? '#cfe5fa' : '#a5cce6'}
                stroke={isActive ? '#001524' : 'none'}
                strokeWidth={isActive ? 1.5 : 0}
              />
              {/* Área de toque más grande que el punto visible. */}
              <circle
                cx={x(i)}
                cy={y(m.grossCop)}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${monthLabel(m.month)}: ${fmtCop(m.grossCop)}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(p => (p === i ? null : i))}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setPinned(p => (p === i ? null : i))
                  }
                }}
              />
              {i % labelEvery === 0 || i === months.length - 1 ? (
                <text x={x(i)} y={H - 12} fill="#8a9299" fontSize="10" textAnchor="middle">
                  {monthLabel(m.month)}
                </text>
              ) : null}
            </g>
          )
        })}

        {activeMonth ? (
          <g pointerEvents="none">
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipW}
              height={tooltipH}
              rx={4}
              fill="#001524"
              stroke="#a5cce6"
              strokeOpacity="0.45"
            />
            <text x={tooltipX + 12} y={tooltipY + 18} fill="#8a9299" fontSize="11">
              {monthLabel(activeMonth.month)}
            </text>
            <text x={tooltipX + 12} y={tooltipY + 34} fill="#cfe5fa" fontSize="13" fontWeight="600">
              {fmtCop(activeMonth.grossCop)}
            </text>
          </g>
        ) : null}
      </svg>
      <p className="sr-only" aria-live="polite">
        {activeMonth ? `${monthLabel(activeMonth.month)}: ${fmtCop(activeMonth.grossCop)}` : ''}
      </p>
    </div>
  )
}

/**
 * Heatmap estilo GitHub: cada celda es un día; el verde mide qué tan altas
 * fueron las ventas respecto al máximo del rango seleccionado.
 */
function IncomeHeatmap({
  daily,
  rangeStart,
  rangeEnd,
}: {
  daily: BoldDay[]
  rangeStart: string
  rangeEnd: string
}) {
  const { weeks, monthTicks, activeDays, maxGross, levelOf } = useMemo(() => {
    const byDay = new Map(daily.map(d => [d.day, d.grossCop]))
    const start = parseDay(rangeStart)
    // Alinear al domingo (columnas = semanas), como GitHub.
    start.setUTCDate(start.getUTCDate() - start.getUTCDay())

    const weeks: { day: string; gross: number; future: boolean }[][] = []
    const cursor = new Date(start)

    while (true) {
      if (weeks.length === 0 || weeks[weeks.length - 1]!.length === 7) {
        weeks.push([])
      }
      const iso = toIsoDay(cursor)
      const week = weeks[weeks.length - 1]!
      week.push({
        day: iso,
        gross: byDay.get(iso) ?? 0,
        future: iso > rangeEnd,
      })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
      if (iso >= rangeEnd && week.length === 7) break
      if (weeks.length > 110) break
    }

    const maxGross = Math.max(0, ...daily.map(d => d.grossCop))
    const activeDays = daily.filter(d => d.grossCop > 0).length

    const levelOf = (gross: number, future: boolean): number => {
      if (future || gross <= 0 || maxGross <= 0) return 0
      const ratio = gross / maxGross
      if (ratio <= 0.25) return 1
      if (ratio <= 0.5) return 2
      if (ratio <= 0.75) return 3
      return 4
    }

    const monthTicks: { weekIndex: number; label: string }[] = []
    let lastMonth = ''
    weeks.forEach((week, wi) => {
      const anchor = week.find(c => !c.future) ?? week[0]
      if (!anchor) return
      const month = anchor.day.slice(0, 7)
      if (month !== lastMonth) {
        monthTicks.push({
          weekIndex: wi,
          label: MONTH_SHORT.format(parseDay(anchor.day)).replace('.', ''),
        })
        lastMonth = month
      }
    })

    return { weeks, monthTicks, activeDays, maxGross, levelOf }
  }, [daily, rangeEnd, rangeStart])

  const dayNames = ['', 'lun', '', 'mié', '', 'vie', '']

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <p className="font-body text-sm text-[#cfe5fa]">
          <span className="font-headline text-lg tabular-nums">{activeDays}</span>
          {activeDays === 1 ? ' día con ventas' : ' días con ventas'} entre {dayLabel(rangeStart)} y{' '}
          {dayLabel(rangeEnd)}
        </p>
        {maxGross > 0 ? (
          <p className="text-[11px] text-[#5c656d] font-body shrink-0">Máx. día: {fmtCop(maxGross)}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          <div className="relative h-4 mb-1 ml-8">
            {monthTicks.map(t => (
              <span
                key={`${t.label}-${t.weekIndex}`}
                className="absolute text-[10px] text-[#8a9299] font-label capitalize"
                style={{ left: `${t.weekIndex * 14}px` }}
              >
                {t.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 w-7 shrink-0">
              {dayNames.map((name, i) => (
                <div
                  key={i}
                  className="h-[11px] text-[9px] leading-[11px] text-[#5c656d] font-label text-right pr-1"
                >
                  {name}
                </div>
              ))}
            </div>

            <div className="flex gap-1" role="img" aria-label="Intensidad de ingresos por día">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map(cell => {
                    const level = levelOf(cell.gross, cell.future)
                    const title = cell.future
                      ? `${dayLabel(cell.day)} (${weekdayLabel(cell.day)}) — futuro`
                      : `${dayLabel(cell.day)} (${weekdayLabel(cell.day)}): ${fmtCop(cell.gross)}`
                    return (
                      <div
                        key={cell.day}
                        title={title}
                        aria-label={title}
                        className="w-[11px] h-[11px] rounded-[2px] transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: HEAT[level],
                          opacity: cell.future ? 0.35 : 1,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-[#8a9299] font-label">
            <span>Menos</span>
            {HEAT.map((c, i) => (
              <span
                key={c}
                className="w-[11px] h-[11px] rounded-[2px] inline-block"
                style={{ backgroundColor: c }}
                aria-label={`Nivel ${i}`}
              />
            ))}
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  tone = 'text-[#cfe5fa]',
}: {
  label: string
  value: string
  hint?: string
  tone?: string
}) {
  return (
    <div className="border border-[#42484c]/40 rounded-sm p-4 sm:p-5 bg-[#0a2438]/40">
      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299]">{label}</p>
      <p className={`font-headline text-2xl sm:text-3xl mt-2 tabular-nums ${tone}`}>{value}</p>
      {hint ? <p className="text-[11px] text-[#5c656d] font-body mt-1.5 leading-snug">{hint}</p> : null}
    </div>
  )
}

export default function BoldDashboardPage() {
  const { replace } = useRouter()
  const [months, setMonths] = useState(12)
  const [data, setData] = useState<BoldResponse | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<'sync' | 'paste' | null>(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(
    async (n: number, range: { from: string; to: string } | null) => {
      setError('')
      try {
        const params = new URLSearchParams({ months: String(n) })
        if (range) {
          params.set('from', range.from)
          params.set('to', range.to)
        }
        const res = await fetch(`/api/bold?${params.toString()}`, { credentials: 'same-origin' })
        if (res.status === 401) {
          replace('/admin/login')
          return
        }
        if (!res.ok) {
          setError('No se pudieron cargar los cierres de Bold.')
          setData(null)
          return
        }
        setData((await res.json()) as BoldResponse)
        setPage(1)
      } catch {
        setError('Error de red')
        setData(null)
      }
    },
    [replace],
  )

  useEffect(() => {
    void load(months, appliedRange)
  }, [appliedRange, load, months])

  const applyDateRange = () => {
    if (!fromDate || !toDate) {
      setError('Selecciona la fecha inicial y la fecha final.')
      return
    }
    if (fromDate > toDate) {
      setError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }
    if (data && toDate > data.today) {
      setError('La fecha final no puede estar en el futuro.')
      return
    }
    setError('')
    setAppliedRange({ from: fromDate, to: toDate })
  }

  const clearDateRange = () => {
    setFromDate('')
    setToDate('')
    setError('')
    setAppliedRange(null)
  }

  const syncNow = async () => {
    setBusy('sync')
    setNotice('')
    setError('')
    try {
      const res = await fetch('/api/bold/sync', { method: 'POST', credentials: 'same-origin' })
      const body = (await res.json()) as {
        error?: string
        scanned?: number
        inserted?: number
        skipped?: number
        ignoredCount?: number
      }
      if (res.status === 401) {
        replace('/admin/login')
        return
      }
      if (!res.ok) {
        setError(body.error ?? 'No se pudo sincronizar.')
        return
      }
      setNotice(
        [
          `Correos revisados: ${body.scanned ?? 0}`,
          `cierres nuevos: ${body.inserted ?? 0}`,
          `ya registrados: ${body.skipped ?? 0}`,
          ...(body.ignoredCount ? [`otros correos de Bold: ${body.ignoredCount}`] : []),
        ].join(' · '),
      )
      await load(months, appliedRange)
    } catch {
      setError('Error de red al sincronizar.')
    } finally {
      setBusy(null)
    }
  }

  const submitPaste = async () => {
    setBusy('paste')
    setNotice('')
    setError('')
    try {
      const res = await fetch('/api/bold', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const body = (await res.json()) as {
        error?: string
        inserted?: number
        closing?: BoldClosing
      }
      if (res.status === 401) {
        replace('/admin/login')
        return
      }
      if (!res.ok) {
        setError(body.error ?? 'No se pudo registrar el cierre.')
        return
      }
      setNotice(
        body.inserted
          ? `Cierre del ${body.closing?.day ? dayLabel(body.closing.day) : '—'} registrado: ${fmtCop(body.closing?.grossCop ?? 0)}`
          : `Ese cierre (${body.closing?.day ? dayLabel(body.closing.day) : '—'}) ya estaba registrado.`,
      )
      setPasteText('')
      setPasteOpen(false)
      await load(months, appliedRange)
    } catch {
      setError('Error de red al registrar el cierre.')
    } finally {
      setBusy(null)
    }
  }

  if (data === undefined && !error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }

  const current = data?.current
  const previous = data?.previous
  const mtd = data?.mtd
  const series = data?.months ?? []
  const hasData = series.some(m => m.grossCop > 0)
  const monthDelta = fmtDelta(current?.grossCop ?? 0, previous?.grossCop ?? 0)
  const mtdDelta = fmtDelta(mtd?.current.grossCop ?? 0, mtd?.previous.grossCop ?? 0)
  const ticket = current && current.transactions > 0 ? current.grossCop / current.transactions : 0
  const closings = data ? [...data.days].reverse() : []
  const pageCount = Math.max(1, Math.ceil(closings.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedClosings = closings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Ventas Bold</h1>
          {data ? (
            <p className="text-[11px] text-[#5c656d] font-body mt-2">
              Cierres del datáfono · {monthLabel(data.currentMonth)} al día {mtd?.dayOfMonth}
            </p>
          ) : null}
        </div>
        <div className="flex border border-[#42484c]/50 w-full sm:w-auto">
          {RANGES.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setMonths(n)}
              aria-pressed={months === n}
              className={`flex-1 sm:flex-initial font-label text-[10px] uppercase tracking-[0.15em] px-4 min-h-11 sm:min-h-0 sm:py-2.5 transition-colors cursor-pointer ${
                months === n ? 'bg-[#1a3d52] text-[#cfe5fa]' : 'text-[#8a9299] hover:bg-[#0a2438]'
              }`}
            >
              {n} meses
            </button>
          ))}
        </div>
      </header>

      <section className="border border-[#42484c]/40 bg-[#0a2438]/35 p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <label className="block">
              <span className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299] mb-2">
                Desde
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate || data?.today}
                onChange={e => setFromDate(e.target.value)}
                className="w-full min-h-11 bg-[#001524] border border-[#42484c]/50 px-3 text-sm text-[#cfe5fa] font-body [color-scheme:dark] focus:outline-none focus:border-[#a5cce6]/60"
              />
            </label>
            <label className="block">
              <span className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299] mb-2">
                Hasta
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={data?.today}
                onChange={e => setToDate(e.target.value)}
                className="w-full min-h-11 bg-[#001524] border border-[#42484c]/50 px-3 text-sm text-[#cfe5fa] font-body [color-scheme:dark] focus:outline-none focus:border-[#a5cce6]/60"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyDateRange}
              className="flex-1 lg:flex-none min-h-11 px-5 bg-[#1a3d52] text-[#cfe5fa] font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[#24516a] transition-colors cursor-pointer"
            >
              Aplicar filtro
            </button>
            {appliedRange ? (
              <button
                type="button"
                onClick={clearDateRange}
                className="flex-1 lg:flex-none min-h-11 px-4 border border-[#42484c]/50 text-[#8a9299] font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[#0a2438] transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </div>
        {appliedRange ? (
          <p className="text-[11px] text-[#7fc9a6] font-body mt-3">
            Mostrando cierres del {dayLabel(appliedRange.from)} al {dayLabel(appliedRange.to)}
          </p>
        ) : (
          <p className="text-[11px] text-[#5c656d] font-body mt-3">
            Filtra la gráfica diaria y la tabla de cierres por un rango específico.
          </p>
        )}
      </section>

      {error ? (
        <p className="text-red-400/90 font-body mb-6" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? <p className="text-[#7fc9a6] font-body text-sm mb-6">{notice}</p> : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <Kpi
          label="Mes actual"
          value={fmtCop(current?.grossCop ?? 0)}
          hint={`${current?.transactions ?? 0} transacciones · ${current?.closings ?? 0} cierres`}
        />
        <Kpi
          label={`Mes anterior (${previous ? monthLabel(previous.month) : '—'})`}
          value={fmtCop(previous?.grossCop ?? 0)}
          hint={`${previous?.transactions ?? 0} transacciones`}
        />
        <Kpi
          label="Variación"
          value={monthDelta.text}
          tone={monthDelta.tone}
          hint={`A la misma altura del mes (día ${mtd?.dayOfMonth}): ${mtdDelta.text} — ${fmtCop(
            mtd?.current.grossCop ?? 0,
          )} vs ${fmtCop(mtd?.previous.grossCop ?? 0)}`}
        />
        <Kpi
          label="Ticket promedio"
          value={fmtCop(ticket)}
          hint={
            current && current.refundsCop > 0
              ? `Anulaciones del mes: ${fmtCop(current.refundsCop)} (${current.refundCount})`
              : 'Sin anulaciones este mes'
          }
        />
      </section>

      <section className="bg-[#0a2438] border border-[#42484c]/30 p-4 sm:p-6 mb-10">
        <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
          Intensidad de ingresos por día
        </h2>
        {data && data.daily.length > 0 ? (
          <IncomeHeatmap
            daily={data.daily}
            rangeStart={data.rangeStart}
            rangeEnd={data.rangeEnd}
          />
        ) : (
          <p className="py-10 text-center text-[#8a9299] font-body text-sm">
            Aún no hay cierres para graficar. Sincroniza el buzón o pega un correo de Bold.
          </p>
        )}
      </section>

      <section className="bg-[#0a2438] border border-[#42484c]/30 p-4 sm:p-6 mb-10">
        <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
          Crecimiento mes a mes
        </h2>
        {hasData ? (
          <GrowthChart months={series} />
        ) : (
          <p className="py-12 text-center text-[#8a9299] font-body text-sm">
            Aún no hay cierres registrados. Sincroniza el buzón o pega un correo de Bold.
          </p>
        )}
      </section>

      <section className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={syncNow}
            disabled={busy !== null}
            className="font-label text-[10px] uppercase tracking-[0.15em] px-4 min-h-11 border border-[#42484c]/50 text-[#cfe5fa] hover:bg-[#0a2438] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {busy === 'sync' ? 'Sincronizando…' : 'Sincronizar ahora'}
          </button>
          <button
            type="button"
            onClick={() => setPasteOpen(o => !o)}
            aria-expanded={pasteOpen}
            className="font-label text-[10px] uppercase tracking-[0.15em] px-4 min-h-11 border border-[#42484c]/50 text-[#8a9299] hover:bg-[#0a2438] transition-colors cursor-pointer"
          >
            Pegar correo de Bold
          </button>
        </div>
        {pasteOpen ? (
          <div className="border border-[#42484c]/40 rounded-sm p-4">
            <label
              htmlFor="bold-paste"
              className="block font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299] mb-2"
            >
              Contenido del correo
            </label>
            <textarea
              id="bold-paste"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={8}
              placeholder="Pega aquí el correo completo de Bold (texto o HTML)…"
              className="w-full bg-[#001524] border border-[#42484c]/50 rounded-sm p-3 text-sm text-[#cfe5fa] font-body focus:outline-none focus:border-[#a5cce6]/60"
            />
            <button
              type="button"
              onClick={submitPaste}
              disabled={busy !== null || !pasteText.trim()}
              className="mt-3 font-label text-[10px] uppercase tracking-[0.15em] px-4 min-h-11 bg-[#1a3d52] text-[#cfe5fa] hover:bg-[#1a3d52]/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {busy === 'paste' ? 'Registrando…' : 'Registrar cierre'}
            </button>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
          {appliedRange
            ? `Cierres del ${dayLabel(appliedRange.from)} al ${dayLabel(appliedRange.to)}`
            : 'Historial de cierres'}
        </h2>
        {closings.length > 0 ? (
          <>
            <ul className="md:hidden flex flex-col gap-2">
              {pagedClosings.map(c => (
                <li key={c.id} className="border border-[#42484c]/40 rounded-sm p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="font-label text-[11px] uppercase tracking-[0.15em] text-[#8a9299]">
                        {dayLabel(c.day)}
                      </p>
                      <p className="text-[11px] text-[#5c656d] font-body mt-0.5">
                        {shiftLabel(c.day)}
                      </p>
                    </div>
                    <p className="font-headline text-lg text-[#cfe5fa] tabular-nums">
                      {fmtCop(c.grossCop)}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#5c656d] font-body mt-1.5">
                    {c.transactions} transacciones
                    {c.refundsCop > 0 ? ` · anulaciones ${fmtCop(c.refundsCop)}` : ''}
                    {c.source === 'manual' ? ' · cargado a mano' : ''}
                  </p>
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto border border-[#42484c]/40 rounded-sm">
              <table className="w-full text-left text-sm font-body">
                <thead>
                  <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
                    <th className="py-3 px-4 font-medium">Día</th>
                    <th className="py-3 px-4 font-medium">Turno</th>
                    <th className="py-3 px-4 font-medium text-right">Ventas</th>
                    <th className="py-3 px-4 font-medium text-right">Transacciones</th>
                    <th className="py-3 px-4 font-medium text-right">Anulaciones</th>
                    <th className="py-3 px-4 font-medium text-right">Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedClosings.map(c => (
                    <tr
                      key={c.id}
                      className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50"
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap capitalize">{dayLabel(c.day)}</td>
                      <td className="py-2.5 px-4 text-[#8a9299] text-xs whitespace-nowrap">
                        {shiftLabel(c.day)}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">{fmtCop(c.grossCop)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-[#a5cce6]/90">
                        {c.transactions}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-[#c97b63]/90">
                        {c.refundsCop > 0 ? fmtCop(c.refundsCop) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">{fmtCop(c.closingCop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-[11px] text-[#5c656d] font-body">
                {closings.length} cierres · página {currentPage} de {pageCount}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="min-h-11 px-4 border border-[#42484c]/50 text-[#cfe5fa] font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[#0a2438] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount}
                  className="min-h-11 px-4 border border-[#42484c]/50 text-[#cfe5fa] font-label text-[10px] uppercase tracking-[0.15em] hover:bg-[#0a2438] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-[#42484c]/40 rounded-sm py-12 px-6 text-center text-[#8a9299] font-body text-sm">
            No hay cierres registrados en este rango.
          </div>
        )}
      </section>

      <p className="text-[10px] text-[#5c656d] font-body mt-8 max-w-3xl leading-relaxed">
        Los datos vienen del correo diario de cierre de Bold (no-responder@bold.co), leído del buzón
        por IMAP una vez al día. Los montos son los del datáfono en pesos: no incluyen ventas
        cobradas por otros medios. Un día puede tener varios cierres si se programan varios turnos.
      </p>
    </div>
  )
}
