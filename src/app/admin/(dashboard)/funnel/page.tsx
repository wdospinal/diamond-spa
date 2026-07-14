'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DualCurrency from '@/components/DualCurrency'

type Stage = {
  key: string
  label: string
  phase: string
  color: string
  count: number
  pctOfTop: number
  pctOfPrev: number
  revenueUsd?: number
  revenueCop?: number
}

type FunnelResponse = {
  from: string
  to: string
  days: string[]
  stages: Stage[]
  byDay: Record<string, Record<string, number>>
}

const RANGES = [
  { label: 'Hoy', days: 1 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
]

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const v = n * 100
  return `${v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)}%`
}

export default function FunnelDashboardPage() {
  const { replace } = useRouter()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<FunnelResponse | null | undefined>(undefined)
  const [error, setError] = useState('')

  const load = useCallback(
    async (d: number) => {
      setError('')
      try {
        const res = await fetch(`/api/funnel?days=${d}`, { credentials: 'same-origin' })
        if (res.status === 401) {
          replace('/admin/login')
          return
        }
        if (!res.ok) {
          setError('No se pudo cargar el embudo.')
          setData(null)
          return
        }
        setData((await res.json()) as FunnelResponse)
      } catch {
        setError('Error de red')
        setData(null)
      }
    },
    [replace],
  )

  useEffect(() => {
    void load(days)
  }, [load, days])

  if (data === undefined && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-[#8a9299]">
        Cargando…
      </div>
    )
  }

  const stages = data?.stages ?? []
  const hasData = stages.some(s => s.count > 0)

  return (
    <div className="min-h-screen px-6 pt-14 pb-10 md:px-12 md:pt-16 md:pb-12 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 mt-2">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Embudo de ventas</h1>
          {data ? (
            <p className="text-[11px] text-[#5c656d] font-body mt-2">
              {data.from} → {data.to} · sesiones únicas por etapa
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-[#42484c]/50">
            {RANGES.map(r => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={`font-label text-[10px] uppercase tracking-[0.15em] px-4 py-2.5 transition-colors ${
                  days === r.days
                    ? 'bg-[#1a3d52] text-[#cfe5fa]'
                    : 'text-[#8a9299] hover:bg-[#0a2438]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? <p className="text-red-400/90 font-body mb-6">{error}</p> : null}

      {!hasData ? (
        <div className="border border-[#42484c]/40 rounded-sm py-16 px-6 text-center text-[#8a9299] font-body">
          Aún no hay datos del embudo en este período. Aparecerán cuando Vercel comience a enviar
          eventos al drain de analítica.
        </div>
      ) : (
        <>
          {/* Funnel */}
          <section className="bg-[#0a2438] border border-[#42484c]/30 p-6 md:p-10 mb-10">
            <div className="flex flex-col gap-2">
              {stages.map((s, idx) => (
                <div key={s.key}>
                  {idx > 0 ? (
                    <div className="flex items-center justify-center py-1.5">
                      <span className="font-label text-[10px] uppercase tracking-widest text-[#5c656d]">
                        {fmtPct(s.pctOfPrev)} continúa
                        <span className="text-[#c97b63]/80 ml-2 normal-case tracking-normal">
                          (−{fmtPct(1 - s.pctOfPrev)})
                        </span>
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="w-32 md:w-44 shrink-0 text-right">
                      <span className="block font-label text-[9px] uppercase tracking-[0.2em] text-[#8a9299]">
                        {s.phase}
                      </span>
                      <span className="block font-body text-xs md:text-sm text-[#cfe5fa] leading-tight">
                        {s.label}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div
                        className="h-12 md:h-14 flex items-center justify-center rounded-sm transition-all w-full"
                        style={{ width: `${Math.max(s.pctOfTop * 100, 6)}%`, backgroundColor: s.color }}
                        title={`${s.count} sesiones`}
                      >
                        <span className="font-headline text-base md:text-xl text-[#001524] tabular-nums px-2">
                          {s.count.toLocaleString('es-CO')}
                        </span>
                      </div>
                      {s.revenueUsd !== undefined && (
                        <div className="mt-2 text-center">
                          <DualCurrency usd={s.revenueUsd} copOverride={s.revenueCop} tone="income" align="left" />
                        </div>
                      )}
                    </div>
                    <div className="w-20 md:w-24 shrink-0 text-right">
                      <span className="block text-[#cfe5fa] text-sm tabular-nums">
                        {fmtPct(s.pctOfTop)}
                      </span>
                      <span className="block text-[9px] text-[#5c656d]">de visitas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Daily breakdown */}
          <section>
            <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#8a9299] mb-4">
              Detalle por día
            </h2>
            <div className="overflow-x-auto border border-[#42484c]/40 rounded-sm">
              <table className="w-full text-left text-sm font-body">
                <thead>
                  <tr className="border-b border-[#42484c]/40 text-[#8a9299] font-label text-[10px] uppercase tracking-widest">
                    <th className="py-3 px-4 font-medium">Fecha</th>
                    {stages.map(s => (
                      <th key={s.key} className="py-3 px-4 font-medium text-right whitespace-nowrap">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data && [...data.days].reverse().map(day => (
                    <tr
                      key={day}
                      className="border-b border-[#42484c]/25 text-[#cfe5fa] hover:bg-[#0a2438]/50"
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap tabular-nums">{day}</td>
                      {stages.map(s => (
                        <td key={s.key} className="py-2.5 px-4 text-right tabular-nums text-[#a5cce6]/90">
                          {(data.byDay[day]?.[s.key] ?? 0).toLocaleString('es-CO')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="text-[10px] text-[#5c656d] font-body mt-8 max-w-3xl leading-relaxed">
        Datos provenientes de Vercel Web Analytics vía drain. Se cuentan sesiones únicas por etapa y
        día (zona horaria de Bogotá). No hay datos anteriores a la activación del drain. Sumar varios
        días puede contar de nuevo a un visitante activo en más de un día.
      </p>
    </div>
  )
}
