'use client'

/**
 * Panel del chat de la pauta: qué pregunta la gente, dónde hace clic y dónde
 * se va, leído como lo leería un CRO. Solo presenta: recibe el análisis ya
 * calculado (lib/chat-analytics.ts), así que se puede revisar con datos de prueba.
 *
 * Colores de datos: ranuras categóricas 1-4 del modo oscuro, validadas contra la
 * superficie del admin (#0a2438). Cada gráfico lleva leyenda y las cifras en
 * texto; el tooltip nunca es la única forma de leer un valor.
 */

import { useState } from 'react'
import type {
  ChatAnalytics, CountItem, FunnelStep, Insight, OutcomeCounts, QuestionStat, TopicStat,
} from '@/lib/chat-analytics'

// ─── Tokens ───────────────────────────────────────────────────────────────────

const SERIES = '#3987e5'
const OUTCOMES: { key: keyof OutcomeCounts; label: string; color: string }[] = [
  { key: 'reserva', label: 'Siguió a reservar', color: '#3987e5' },
  { key: 'whatsapp', label: 'Pidió hablar con una persona', color: '#d95926' },
  { key: 'sigue', label: 'Siguió explorando', color: '#199e70' },
  { key: 'se_fue', label: 'Se fue', color: '#c98500' },
]
const LEVELS: Record<Insight['level'], { label: string; color: string }> = {
  alta: { label: 'Urgente', color: '#e66767' },
  media: { label: 'Atención', color: '#c98500' },
  info: { label: 'Dato', color: '#3987e5' },
}
const FOLLOW_LABELS: Record<string, string> = {
  reserve: 'Quiero reservar',
  reserveCat: 'Reservar (de la categoría)',
  catalog: 'Ver el catálogo',
  doubt: 'Otra duda',
  menu: 'Volver al menú',
  maps: 'Ver el mapa',
  advisor: 'Hablar con una asesora',
  direct: 'Escribir a WhatsApp',
  change: 'Cambiar mi cita',
  people: 'Somos 2 o 3 o más',
}

const n = (x: number) => x.toLocaleString('es-CO')
const pct = (x: number) => {
  if (!Number.isFinite(x)) return '—'
  const v = x * 100
  return `${v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)}%`
}
const total = (o: OutcomeCounts) => o.reserva + o.whatsapp + o.sigue + o.se_fue

// ─── Piezas ───────────────────────────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-label text-xs uppercase tracking-[0.25em] text-[#a5cce6]">{title}</h2>
      {hint ? <p className="mt-1.5 mb-4 max-w-3xl text-xs leading-relaxed text-[#8a9299]">{hint}</p> : <div className="mb-4" />}
      {children}
    </section>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-sm border border-[#42484c]/30 bg-[#0a2438] ${className}`}>{children}</div>
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] text-[#8a9299]">{label}</p>
      <p className="mt-1.5 font-body text-3xl font-semibold tabular-nums text-[#cfe5fa]">{value}</p>
      {sub ? <p className="mt-1 text-[11px] leading-snug text-[#8a9299]">{sub}</p> : null}
    </Card>
  )
}

/** Una barra de una sola serie: delgada, con el extremo redondeado y la cifra a la punta. */
function BarRow({ label, sub, value, max, tail }: { label: string; sub?: string; value: number; max: number; tail?: string }) {
  const w = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-[13px] leading-snug text-[#cfe5fa]">
          {label}
          {sub ? <span className="ml-2 text-[11px] text-[#8a9299]">{sub}</span> : null}
        </p>
        <p className="shrink-0 text-xs tabular-nums text-[#a5cce6]">
          {n(value)}
          {tail ? <span className="ml-1.5 text-[#8a9299]">{tail}</span> : null}
        </p>
      </div>
      <div className="mt-1 h-2 rounded-r-[4px] bg-transparent">
        <div className="h-2 rounded-r-[4px]" style={{ width: `${w}%`, backgroundColor: SERIES }} />
      </div>
    </div>
  )
}

/** Lo que hizo la gente tras leer una respuesta: segmentos separados por 2px de superficie. */
function OutcomeBar({ o, className = '' }: { o: OutcomeCounts; className?: string }) {
  const t = total(o)
  return (
    <div
      className={`flex h-3 gap-[2px] overflow-hidden rounded-[4px] bg-[#071d2d] ${className}`}
      role="img"
      aria-label={OUTCOMES.map(s => `${s.label}: ${n(o[s.key])}`).join(', ')}
    >
      {t > 0
        ? OUTCOMES.filter(s => o[s.key] > 0).map(s => (
            <div
              key={s.key}
              title={`${s.label}: ${n(o[s.key])} (${pct(o[s.key] / t)})`}
              style={{ width: `${(o[s.key] / t) * 100}%`, backgroundColor: s.color, minWidth: 3 }}
            />
          ))
        : null}
    </div>
  )
}

function OutcomeLegend({ o }: { o?: OutcomeCounts }) {
  const t = o ? total(o) : 0
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-[#a5cce6]">
      {OUTCOMES.map(s => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: s.color }} aria-hidden="true" />
          {s.label}
          {o ? <span className="text-[#8a9299]">{n(o[s.key])} · {pct(t > 0 ? o[s.key] / t : 0)}</span> : null}
        </li>
      ))}
    </ul>
  )
}

function FunnelBars({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((s, i) => (
        <div key={s.key} className="py-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 text-[13px] text-[#cfe5fa]">{s.label}</p>
            <p className="shrink-0 text-xs text-[#a5cce6]">
              <span className="tabular-nums">{n(s.sessions)}</span>
              <span className="ml-1.5 text-[#8a9299]">{pct(s.pctOfTop)} del paso 1</span>
              {i > 0 && s.sessions < steps[i - 1].sessions ? (
                <span className="ml-1.5 text-[#c98500]">−{pct(1 - s.pctOfPrev)} vs paso anterior</span>
              ) : null}
            </p>
          </div>
          <div className="mt-1 h-3 rounded-r-[4px]" style={{ width: `${Math.max(s.pctOfTop * 100, s.sessions > 0 ? 1.5 : 0)}%`, backgroundColor: SERIES }} />
        </div>
      ))}
    </div>
  )
}

function CountList({ items, empty, tail }: { items: CountItem[]; empty: string; tail?: (i: CountItem) => string }) {
  const max = Math.max(1, ...items.map(i => i.sessions))
  if (items.length === 0 || items.every(i => i.sessions === 0)) return <p className="py-2 text-xs text-[#8a9299]">{empty}</p>
  return (
    <div>
      {items.map(i => (
        <BarRow key={i.key} label={i.label} value={i.sessions} max={max} tail={tail?.(i)} />
      ))}
    </div>
  )
}

function WarnIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 10v4M12 17.5h.01" />
    </svg>
  )
}

function InsightCard({ i }: { i: Insight }) {
  const lv = LEVELS[i.level]
  return (
    <Card className="p-4" >
      <div className="flex items-center gap-2" style={{ borderLeft: `3px solid ${lv.color}`, paddingLeft: 10 }}>
        {i.level === 'alta' || i.level === 'media' ? <WarnIcon color={lv.color} /> : null}
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">{lv.label}</span>
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-snug text-[#cfe5fa]">{i.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#8a9299]">{i.evidence}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#cfe5fa]">
        <span className="text-[#a5cce6]">Qué hacer: </span>
        {i.action}
      </p>
    </Card>
  )
}

// ─── Preguntas ────────────────────────────────────────────────────────────────

type QFilter = 'all' | 'masajes' | 'faciales' | 'depilacion' | 'general' | 'delicate'
const FILTERS: { key: QFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'masajes', label: 'Masajes' },
  { key: 'faciales', label: 'Faciales' },
  { key: 'depilacion', label: 'Depilación' },
  { key: 'general', label: 'Generales' },
  { key: 'delicate', label: 'Da pena preguntar' },
]

function QuestionRow({ q, rank, max, playbook, open, onToggle }: {
  q: QuestionStat; rank: number; max: number; playbook: string[]; open: boolean; onToggle: () => void
}) {
  const t = total(q.outcomes)
  return (
    <li className="border-b border-[#42484c]/25 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[1.5rem_1fr] items-start gap-x-2 gap-y-2 px-3 py-3 text-left transition-colors hover:bg-[#0d2d45]/50 md:grid-cols-[1.5rem_minmax(0,1fr)_9rem_11rem] md:items-center md:gap-x-4"
      >
        <span className="pt-0.5 text-xs tabular-nums text-[#5c656d]">{rank}</span>
        <span className="min-w-0">
          <span className="block text-[13px] leading-snug text-[#cfe5fa]">{q.label}</span>
          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8a9299]">
            <span>{q.scopeLabel}</span>
            <span>{q.topicLabel}</span>
            {q.delicate ? <span className="text-[#a5cce6]">Da pena preguntar</span> : null}
          </span>
        </span>
        <span className="col-start-2 md:col-start-auto">
          <span className="flex items-baseline justify-between gap-2 text-xs text-[#a5cce6]">
            <span className="tabular-nums">{n(q.sessions)} {q.sessions === 1 ? 'sesión' : 'sesiones'}</span>
            {q.clicks > q.sessions ? <span className="text-[#8a9299]">{n(q.clicks)} clics</span> : null}
          </span>
          <span className="mt-1 block h-2 rounded-r-[4px]" style={{ width: `${Math.max((q.sessions / max) * 100, 3)}%`, backgroundColor: SERIES }} />
        </span>
        <span className="col-start-2 md:col-start-auto">
          <OutcomeBar o={q.outcomes} />
          <span className="mt-1 block text-[10px] text-[#8a9299]">
            {t > 0 ? `${pct(q.outcomes.reserva / t)} reserva · ${pct(q.outcomes.se_fue / t)} se va` : 'Sin datos'}
          </span>
        </span>
      </button>
      {open ? (
        <div className="grid gap-5 border-t border-[#42484c]/20 bg-[#071d2d]/60 px-4 py-4 md:grid-cols-2">
          <div>
            <p className="mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Después de leer la respuesta</p>
            <OutcomeLegend o={q.outcomes} />
            <p className="mt-4 mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Botones que ofrece hoy</p>
            <p className="text-xs leading-relaxed text-[#cfe5fa]">
              {q.follow.length ? q.follow.map(f => FOLLOW_LABELS[f] ?? f).join(' · ') : 'Ninguno propio (solo "Otra duda" y "Volver al menú").'}
            </p>
            {t >= 5 && q.outcomes.se_fue / t >= 0.5 ? (
              <p className="mt-3 text-xs leading-relaxed text-[#cfe5fa]">
                <span className="text-[#c98500]">La mayoría se va aquí. </span>
                Termina la respuesta con un dato concreto y el botón de reservar el servicio que corresponde.
              </p>
            ) : null}
          </div>
          <div>
            <p className="mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Lo que responde el chat hoy</p>
            <div className="space-y-1.5">
              {q.answer.length ? q.answer.map((a, i) => (
                <p key={i} className="whitespace-pre-line rounded-md border border-[#a5cce6]/15 bg-[#0b2131] px-3 py-2 text-xs leading-relaxed text-[#cfe5fa]">{a}</p>
              )) : <p className="text-xs text-[#8a9299]">Esta respuesta ya no existe en el chat.</p>}
            </div>
            {playbook.length ? (
              <>
                <p className="mt-4 mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Cómo resolver este tipo de duda</p>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#cfe5fa]">
                  {playbook.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  )
}

function TopicRow({ t, max }: { t: TopicStat; max: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="border-b border-[#42484c]/25 last:border-b-0">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="w-full px-3 py-3 text-left transition-colors hover:bg-[#0d2d45]/50">
        <BarRow label={t.label} value={t.sessions} max={max} tail={`${pct(t.share)} de quienes preguntan`} />
      </button>
      {open ? (
        <div className="grid gap-5 border-t border-[#42484c]/20 bg-[#071d2d]/60 px-4 py-4 md:grid-cols-2">
          <div>
            <p className="mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Preguntas más tocadas</p>
            <ul className="space-y-1 text-xs text-[#cfe5fa]">
              {t.top.map(q => (
                <li key={q.label} className="flex justify-between gap-3">
                  <span>{q.label}</span>
                  <span className="tabular-nums text-[#a5cce6]">{n(q.sessions)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Qué hicieron después</p>
            <OutcomeBar o={t.outcomes} />
            <div className="mt-2"><OutcomeLegend o={t.outcomes} /></div>
          </div>
          <div>
            <p className="mb-2 font-label text-[10px] uppercase tracking-[0.2em] text-[#a5cce6]">Cómo resolverlo</p>
            {t.playbook.length ? (
              <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[#cfe5fa]">
                {t.playbook.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            ) : <p className="text-xs text-[#8a9299]">Preguntas sueltas que no encajan en un tema.</p>}
          </div>
        </div>
      ) : null}
    </li>
  )
}

// ─── Horas ────────────────────────────────────────────────────────────────────

function HourColumns({ byHour }: { byHour: number[] }) {
  const max = Math.max(1, ...byHour)
  return (
    <div>
      <div className="flex h-24 items-end gap-[2px]" role="img" aria-label="Aperturas del chat por hora del día, hora de Bogotá">
        {byHour.map((v, h) => (
          <div key={h} className="flex flex-1 flex-col justify-end" title={`${String(h).padStart(2, '0')}:00 · ${n(v)} ${v === 1 ? 'sesión' : 'sesiones'}`}>
            <div className="w-full rounded-t-[4px]" style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0, backgroundColor: SERIES }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[#8a9299]">
        {[0, 3, 6, 9, 12, 15, 18, 21].map(h => <span key={h}>{String(h).padStart(2, '0')}h</span>)}
      </div>
    </div>
  )
}

// ─── Vista ────────────────────────────────────────────────────────────────────

export const RANGES = [
  { label: 'Hoy', days: 1 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
]

export default function ChatbotView({ data, days, onDays }: { data: ChatAnalytics; days: number; onDays: (d: number) => void }) {
  const [filter, setFilter] = useState<QFilter>('all')
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [showAllQ, setShowAllQ] = useState(false)

  const k = data.kpis
  const empty = k.sessions === 0
  const topicPlaybook = (key: string) => data.topics.find(t => t.key === key)?.playbook ?? []

  const questions = data.questions.filter(q =>
    filter === 'all' ? true : filter === 'delicate' ? q.delicate : q.scope === filter,
  )
  const shownQ = showAllQ ? questions : questions.slice(0, 12)
  const maxQ = Math.max(1, ...data.questions.map(q => q.sessions))
  const maxTopic = Math.max(1, ...data.topics.map(t => t.sessions))
  const maxNeed = Math.max(1, ...data.needs.map(q => q.sessions))
  const shownInsights = showAllInsights ? data.insights : data.insights.slice(0, 6)
  const firstTotal = data.firstChoice.reduce((s, c) => s + c.sessions, 0)

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between md:mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[#cfe5fa] md:text-4xl">Chatbot de la pauta</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#8a9299]">
            Qué pregunta la gente, dónde hace clic y dónde se va en el chat de la landing de ofertas.
            <span className="ml-1 text-[#5c656d]">{data.range.from} → {data.range.to} · una sesión es una persona en una pestaña</span>
          </p>
        </div>
        <div className="flex w-full border border-[#42484c]/50 sm:w-auto">
          {RANGES.map(r => (
            <button
              key={r.days}
              type="button"
              onClick={() => onDays(r.days)}
              aria-pressed={days === r.days}
              className={`min-h-11 flex-1 px-4 font-label text-[10px] uppercase tracking-[0.15em] transition-colors sm:min-h-0 sm:flex-initial sm:py-2.5 ${
                days === r.days ? 'bg-[#1a3d52] text-[#cfe5fa]' : 'text-[#8a9299] hover:bg-[#0a2438]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Lectura de CRO */}
      <Section
        title="Lectura de CRO"
        hint="Lo que dicen las cifras y qué haría yo con ellas, de lo más urgente a lo informativo. Con pocas sesiones son pistas, no conclusiones."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {shownInsights.map(i => <InsightCard key={i.id} i={i} />)}
        </div>
        {data.insights.length > 6 ? (
          <button type="button" onClick={() => setShowAllInsights(v => !v)} className="mt-3 text-xs text-[#a5cce6] underline underline-offset-4 hover:text-[#cfe5fa]">
            {showAllInsights ? 'Ver menos' : `Ver los ${data.insights.length} avisos`}
          </button>
        ) : null}
      </Section>

      {empty ? null : (
        <>
          {/* Cifras */}
          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Tile label="Abrieron el chat" value={n(k.sessions)} sub="sesiones" />
            <Tile label="Tocaron algo" value={pct(k.engaged / k.sessions)} sub={`${n(k.engaged)} de ${n(k.sessions)}`} />
            <Tile label="Preguntaron algo" value={pct(k.asked / k.sessions)} sub={`${n(k.asked)} sesiones`} />
            <Tile label="Iniciaron reserva" value={pct(k.reserveStarted / k.sessions)} sub={`${n(k.reserveStarted)} sesiones`} />
            <Tile label="Reserva guardada" value={n(k.saved)} sub={k.reserveStarted > 0 ? `${pct(k.saved / k.reserveStarted)} de quienes empezaron` : undefined} />
            <Tile label="Salieron a WhatsApp" value={n(k.waDirect)} sub="directo, sin reservar en el chat" />
          </div>

          {/* Qué quieren saber */}
          <Section
            title="¿Qué quieren saber?"
            hint="Las preguntas se agrupan por tema automáticamente. Toca un tema o una pregunta para ver qué hizo la gente después de leer la respuesta y cómo resolverla."
          >
            {data.topics.length === 0 ? (
              <p className="text-xs text-[#8a9299]">Todavía nadie abrió una duda.</p>
            ) : (
              <>
                <Card className="mb-5">
                  <ul>{data.topics.map(t => <TopicRow key={t.key} t={t} max={maxTopic} />)}</ul>
                </Card>

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#cfe5fa]">Preguntas más frecuentes</h3>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar preguntas">
                    {FILTERS.map(f => (
                      <button
                        key={f.key}
                        type="button"
                        aria-pressed={filter === f.key}
                        onClick={() => { setFilter(f.key); setShowAllQ(false) }}
                        className={`rounded-sm border px-3 py-1.5 text-[11px] transition-colors ${
                          filter === f.key ? 'border-[#a5cce6]/60 bg-[#1a3d52] text-[#cfe5fa]' : 'border-[#42484c]/50 text-[#8a9299] hover:bg-[#0a2438]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3"><OutcomeLegend /></div>
                <Card>
                  {shownQ.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-[#8a9299]">Sin preguntas en este filtro.</p>
                  ) : (
                    <ol>
                      {shownQ.map((q, i) => (
                        <QuestionRow
                          key={q.id}
                          q={q}
                          rank={i + 1}
                          max={maxQ}
                          playbook={topicPlaybook(q.topic)}
                          open={openQ === q.id}
                          onToggle={() => setOpenQ(openQ === q.id ? null : q.id)}
                        />
                      ))}
                    </ol>
                  )}
                </Card>
                {questions.length > 12 ? (
                  <button type="button" onClick={() => setShowAllQ(v => !v)} className="mt-3 text-xs text-[#a5cce6] underline underline-offset-4 hover:text-[#cfe5fa]">
                    {showAllQ ? 'Ver menos' : `Ver las ${questions.length} preguntas`}
                  </button>
                ) : null}
              </>
            )}
          </Section>

          {/* Qué buscan */}
          <Section
            title="¿Qué buscan?"
            hint="Qué escogen al abrir el chat y qué hacen dentro de cada categoría: pedir ayuda para elegir, ir directo a los precios o resolver una duda."
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {data.scopes.map(s => {
                const isGeneral = s.scope === 'general'
                const max = Math.max(1, s.help, s.catalog, s.doubts)
                return (
                  <Card key={s.scope} className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#cfe5fa]">{s.label}</h3>
                      <span className="text-xs text-[#a5cce6]">
                        <span className="tabular-nums">{n(s.chose)}</span>
                        {firstTotal > 0 ? <span className="ml-1.5 text-[#8a9299]">{pct(s.chose / firstTotal)}</span> : null}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8a9299]">la escogieron en el menú</p>
                    {isGeneral ? (
                      <p className="mt-3 text-xs leading-relaxed text-[#8a9299]">{n(s.asked)} abrieron una duda general.</p>
                    ) : (
                      <div className="mt-3">
                        <BarRow label="Ayúdame a elegir" value={s.help} max={max} />
                        <BarRow label="Ver servicios y precios" value={s.catalog} max={max} />
                        <BarRow label="Tengo una duda" value={s.doubts} max={max} />
                        <p className="mt-2 text-[11px] leading-relaxed text-[#8a9299]">
                          {n(s.sens)} abrieron "da pena preguntar" · {n(s.reserveStart)} iniciaron reserva
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Lo que necesitan (Ayúdame a elegir)</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">La situación que tocaron para que el chat les recomendara un servicio.</p>
                {data.needs.length === 0 ? (
                  <p className="py-2 text-xs text-[#8a9299]">Nadie ha usado esta ayuda todavía.</p>
                ) : (
                  data.needs.slice(0, 10).map(q => (
                    <BarRow key={q.id} label={q.label} sub={q.scopeLabel + (q.delicate ? ' · da pena contar' : '')} value={q.sessions} max={maxNeed} />
                  ))
                )}
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Servicios que miran y eligen</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">Sesiones que leyeron qué incluye cada masaje, que empezaron a reservarlo y que lo eligieron.</p>
                {data.services.length === 0 ? (
                  <p className="py-2 text-xs text-[#8a9299]">Todavía no hay servicios vistos.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#42484c]/40 font-label text-[10px] uppercase tracking-widest text-[#8a9299]">
                        <th className="py-2 pr-2 font-medium">Servicio</th>
                        <th className="px-2 py-2 text-right font-medium">Leyeron</th>
                        <th className="px-2 py-2 text-right font-medium">Empezaron</th>
                        <th className="py-2 pl-2 text-right font-medium">Eligieron</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.services.slice(0, 10).map(s => (
                        <tr key={s.id} className="border-b border-[#42484c]/20 text-[#cfe5fa]">
                          <td className="py-2 pr-2">{s.name}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(s.info)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(s.reserveStart)}</td>
                          <td className="py-2 pl-2 text-right tabular-nums text-[#a5cce6]">{n(s.picked)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          </Section>

          {/* Dónde se cae */}
          <Section
            title="¿Dónde se cae?"
            hint="El recorrido dentro del chat. La reserva cuenta a cada persona hasta el último paso al que llegó."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Conversación</h3>
                <FunnelBars steps={data.engagement} />
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Reserva dentro del chat</h3>
                <FunnelBars steps={data.reservation} />
              </Card>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Última pantalla de quien se fue</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">Sin reserva, sin asesora y sin WhatsApp.</p>
                <CountList items={data.dropoff} empty="Nadie se ha ido todavía." />
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Lo último que leían antes de irse</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">Respuestas que no cerraron la duda.</p>
                <CountList items={data.leftAfter} empty="Sin datos todavía." />
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Lo que leían antes de ir a WhatsApp</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">Preguntas que terminaron en una persona.</p>
                <CountList items={data.waAfter} empty="Sin datos todavía." />
              </Card>
            </div>
          </Section>

          {/* Reserva */}
          <Section title="La reserva en el chat" hint="Qué día y a qué hora quieren venir, y qué les estorba al reservar.">
            <div className="grid gap-3 lg:grid-cols-3">
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Con cuánta anticipación</h3>
                <CountList items={data.demand.lead} empty="Nadie ha elegido día todavía." />
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Día de la semana que eligen</h3>
                <CountList items={data.demand.weekday} empty="Nadie ha elegido día todavía." />
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Horas que eligen</h3>
                <CountList items={data.demand.hours} empty="Nadie ha elegido hora todavía." />
              </Card>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Tile
                label="Eligieron un día sin horarios"
                value={n(data.demand.noSlots.sessions)}
                sub={data.demand.noSlots.dates.length ? data.demand.noSlots.dates.map(d => d.label).join(' · ') : 'demanda que no se pudo atender'}
              />
              <Tile label="Se equivocaron con el celular" value={n(data.demand.phoneInvalid.sessions)} sub={`${n(data.demand.phoneInvalid.events)} intentos inválidos`} />
              <Tile
                label="Pidieron una asesora"
                value={n(k.advisorSent)}
                sub={k.waAfterReserve > 0 ? `${n(k.waAfterReserve)} tocaron WhatsApp tras reservar` : 'dejaron su celular para que las llamen'}
              />
            </div>
            {k.failed > 0 ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-[#cfe5fa]">
                <WarnIcon color="#e66767" />
                {n(k.failed)} {k.failed === 1 ? 'reserva no se pudo guardar' : 'reservas no se pudieron guardar'}: revísalas en recepción.
              </p>
            ) : null}
          </Section>

          {/* Quién y cuándo */}
          <Section title="Quién escribe y cuándo" hint="Hora de Bogotá. Útil para decidir en qué momento reforzar la atención en WhatsApp y cómo viene el tráfico.">
            <div className="grid gap-3 lg:grid-cols-2">
              <Card className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-[#cfe5fa]">Aperturas del chat por hora</h3>
                <HourColumns byHour={data.time.byHour} />
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#cfe5fa]">Cómo se comportan según de dónde vienen</h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#42484c]/40 font-label text-[10px] uppercase tracking-widest text-[#8a9299]">
                      <th className="py-2 pr-2 font-medium">Segmento</th>
                      <th className="px-2 py-2 text-right font-medium">Sesiones</th>
                      <th className="px-2 py-2 text-right font-medium">Tocan</th>
                      <th className="px-2 py-2 text-right font-medium">Preguntan</th>
                      <th className="py-2 pl-2 text-right font-medium">Reservan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.segments.map(s => (
                      <tr key={s.key} className="border-b border-[#42484c]/20 text-[#cfe5fa]">
                        <td className="py-2 pr-2">{s.label}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(s.sessions)}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{pct(s.engagedRate)}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{pct(s.askedRate)}</td>
                        <td className="py-2 pl-2 text-right tabular-nums text-[#a5cce6]">{pct(s.savedRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            {data.adGroups.length > 0 ? (
              <Card className="mt-3 p-4">
                <h3 className="text-sm font-semibold text-[#cfe5fa]">Qué pregunta cada grupo de anuncios</h3>
                <p className="mb-2 mt-0.5 text-[11px] text-[#8a9299]">Sirve para ajustar el mensaje del anuncio a la duda que trae esa gente.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#42484c]/40 font-label text-[10px] uppercase tracking-widest text-[#8a9299]">
                        <th className="py-2 pr-2 font-medium">Grupo de anuncios</th>
                        <th className="px-2 py-2 text-right font-medium">Sesiones</th>
                        <th className="px-2 py-2 text-right font-medium">Preguntaron</th>
                        <th className="px-2 py-2 text-right font-medium">Reservaron</th>
                        <th className="py-2 pl-2 font-medium">Tema que más preguntan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.adGroups.map(g => (
                        <tr key={g.adg} className="border-b border-[#42484c]/20 text-[#cfe5fa]">
                          <td className="py-2 pr-2">{g.adg}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(g.sessions)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(g.asked)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-[#a5cce6]">{n(g.saved)}</td>
                          <td className="py-2 pl-2 text-[#a5cce6]">{g.topTopic ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}
          </Section>

          {/* Por día */}
          {data.range.days > 1 ? (
            <Section title="Por día">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#42484c]/40 font-label text-[10px] uppercase tracking-widest text-[#8a9299]">
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 text-right font-medium">Abrieron</th>
                        <th className="px-4 py-3 text-right font-medium">Tocaron algo</th>
                        <th className="px-4 py-3 text-right font-medium">Reserva guardada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...data.time.byDay].reverse().filter(d => d.sessions > 0).map(d => (
                        <tr key={d.day} className="border-b border-[#42484c]/20 text-[#cfe5fa]">
                          <td className="px-4 py-2.5 tabular-nums">{d.day}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-[#a5cce6]">{n(d.sessions)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-[#a5cce6]">{n(d.engaged)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-[#a5cce6]">{n(d.saved)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Section>
          ) : null}
        </>
      )}

      <p className="mt-8 max-w-3xl text-[10px] leading-relaxed text-[#5c656d]">
        Datos propios del chat de la landing de ofertas, anónimos: no se guarda el nombre ni el celular que la persona escribe,
        ni su IP; solo qué botón tocó. El registro empieza desde que se publicó este panel y respeta el banner de cookies
        (quien lo rechaza no aparece). Los porcentajes con pocas sesiones cambian mucho: espera unas 100 antes de decidir.
      </p>
    </div>
  )
}
