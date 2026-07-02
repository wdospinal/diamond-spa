'use client'

import { useState, useRef } from 'react'
import type { Locale, Dict } from '@/lib/i18n'
import { randomWhatsAppUrl } from '@/lib/spa'
import { EVENTS, trackEvent } from '@/lib/events'

// ─── Icon helper ─────────────────────────────────────────────────────────────
// Uses the Material Symbols Outlined font already loaded by MaterialSymbolsLoader
// (self-hosted, preloaded in <head>, zero extra network request, no CWV impact).
function Icon({ name, size = 22, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontFamily: '"Material Symbols Outlined"',
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24",
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        ...style,
      }}
    >
      {name}
    </span>
  )
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:         '#0a1628',
  card:       '#0f1f38',
  cardHov:    '#122440',
  cardBrd:    '#1e3358',
  cardSel:    '#0f2a45',
  cardSelBrd: '#4a9fd4',
  text:       '#e8eef4',
  sec:        '#7a9ab8',
  accent:     '#4a9fd4',
  accentHov:  '#5eb3e8',
  div:        '#1a2e4a',
  success:    '#34d399',
} as const

// ─── Data ─────────────────────────────────────────────────────────────────────
type PriceEntry  = { label: string; value: number }
type Category    = 'masajes' | 'faciales' | 'depilacion'
type Service = {
  id: string
  category: Category
  name: string
  desc: string
  duration: string
  durationMin: number
  prices: PriceEntry[]
}

const CATEGORIES = (lang: string): { id: Category; label: string; icon: string; sub: string }[] => [
  { id: 'masajes',    label: lang==='en'?'Massages':'Masajes',    icon: 'self_improvement', sub: lang==='en'?'7 options · from $120.000':'7 opciones · desde $120.000' },
  { id: 'faciales',  label: lang==='en'?'Facials':'Faciales',   icon: 'face',             sub: lang==='en'?'5 options · from $150.000':'5 opciones · desde $150.000' },
  { id: 'depilacion',label: lang==='en'?'Hair Removal':'Depilación', icon: 'filter_vintage',   sub: lang==='en'?'8 areas · from $20.000':'8 zonas · desde $20.000'     },
]

const SERVICES = (lang: string): Service[] => [
  { id: 'relaxing',  category: 'masajes',    name: lang==='en'?'Relaxing Massage':'Masaje Relajante',         desc: lang==='en'?'Release tension and accumulated stress':'Libera tensión y estrés acumulado',         duration: '30 – 90 min', durationMin: 60, prices: [{ label: '30 min', value: 120000 }, { label: '60 min', value: 200000 }, { label: '90 min', value: 260000 }] },
  { id: 'deep-tissue',       category: 'masajes',    name: 'Deep Tissue',              desc: lang==='en'?'For deep muscle tension':'Para tensión muscular profunda',            duration: '30 – 90 min', durationMin: 60, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'four-hands',     category: 'masajes',    name: lang==='en'?'4 Hands Massage':'Masaje 4 Manos',           desc: lang==='en'?'Two therapists, double relaxation':'Dos terapeutas, doble relajación',         duration: '60 min',      durationMin: 60, prices: [{ label: '30 min', value: 230000 }, { label: '60 min', value: 350000 }, { label: '90 min', value: 480000 }] },
  { id: 'duo',        category: 'masajes',    name: lang==='en'?'Duo Massage':'Duo Masaje',               desc: lang==='en'?'For couples or companions':'Para parejas o acompañantes',              duration: '60 min',      durationMin: 60, prices: [{ label: '30 min', value: 220000 }, { label: '60 min', value: 380000 }, { label: '90 min', value: 500000 }] },
  { id: 'hot-stones',    category: 'masajes',    name: lang==='en'?'Hot Stones':'Piedras Volcánicas',       desc: lang==='en'?'Deep heat and total relaxation':'Calor profundo y relajación total',       duration: '75 min',      durationMin: 75, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'sports',  category: 'masajes',    name: lang==='en'?'Sports Massage':'Masaje Deportivo',         desc: lang==='en'?'Active muscle recovery':'Recuperación muscular activa',             duration: '30 – 90 min', durationMin: 60, prices: [{ label: '30 min', value: 140000 }, { label: '60 min', value: 240000 }, { label: '90 min', value: 300000 }] },
  { id: 'sensitive',  category: 'masajes',    name: lang==='en'?'Sensitive Massage':'Masaje Sensitivo',         desc: lang==='en'?'Soft sensory stimulation':'Estimulación sensorial suave',             duration: '30 – 90 min', durationMin: 60, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'hidrafacial',      category: 'faciales',   name: 'Hydrafacial',              desc: lang==='en'?'Deep cleansing with technology':'Limpieza profunda con tecnología',         duration: '90 min',      durationMin: 90, prices: [{ label: lang==='en'?'Unique':'Único', value: 350000 }] },
  { id: 'limpieza-facial-profunda',   category: 'faciales',   name: lang==='en'?'Deep Facial Cleansing':'Limpieza Facial Profunda', desc: lang==='en'?'Extraction and purification':'Extracción y purificación',               duration: '60 min',      durationMin: 60, prices: [{ label: lang==='en'?'Unique':'Único', value: 250000 }] },
  { id: 'limpieza-facial-basica',    category: 'faciales',   name: lang==='en'?'Basic Facial Cleansing':'Limpieza Facial Básica',   desc: lang==='en'?'Cleansing and skin toning':'Limpieza y tonificación de la piel',      duration: '45 min',      durationMin: 45, prices: [{ label: lang==='en'?'Unique':'Único', value: 150000 }] },
  { id: 'hidratacion-facial',    category: 'faciales',   name: lang==='en'?'Facial Hydration':'Hidratación Facial',       desc: lang==='en'?'Intense skin nutrition':'Nutrición intensa para la piel',          duration: '45 min',      durationMin: 45, prices: [{ label: lang==='en'?'Unique':'Único', value: 200000 }] },
  { id: 'limpieza-espalda',category: 'faciales',   name: lang==='en'?'Back Cleansing':'Limpieza de Espalda',      desc: lang==='en'?'Complete back purification':'Purificación de espalda completa',        duration: '60 min',      durationMin: 60, prices: [{ label: lang==='en'?'Unique':'Único', value: 200000 }] },
  { id: 'depilacion-axila',      category: 'depilacion', name: lang==='en'?'Underarm':'Axila',                    desc: '',                                         duration: '20 min',      durationMin: 20, prices: [{ label: lang==='en'?'Wax':'Cera', value: 30000 }, { label: lang==='en'?'Machine':'Máquina', value: 20000 }] },
  { id: 'depilacion-bikini',     category: 'depilacion', name: 'Bikini',                   desc: '',                                         duration: '30 min',      durationMin: 30, prices: [{ label: lang==='en'?'Wax':'Cera', value: 80000 }, { label: lang==='en'?'Machine':'Máquina', value: 60000 }] },
  { id: 'depilacion-media-pierna',   category: 'depilacion', name: lang==='en'?'Half Leg':'Media Pierna',             desc: '',                                         duration: '30 min',      durationMin: 30, prices: [{ label: lang==='en'?'Wax':'Cera', value: 100000 }, { label: lang==='en'?'Machine':'Máquina', value: 70000 }] },
  { id: 'depilacion-pierna-completa',   category: 'depilacion', name: lang==='en'?'Full Leg':'Pierna Completa',          desc: '',                                         duration: '45 min',      durationMin: 45, prices: [{ label: lang==='en'?'Wax':'Cera', value: 150000 }, { label: lang==='en'?'Machine':'Máquina', value: 85000 }] },
  { id: 'depilacion-pecho',      category: 'depilacion', name: lang==='en'?'Chest':'Pecho',                    desc: '',                                         duration: '30 min',      durationMin: 30, prices: [{ label: lang==='en'?'Wax':'Cera', value: 80000 }, { label: lang==='en'?'Machine':'Máquina', value: 50000 }] },
  { id: 'depilacion-espalda',    category: 'depilacion', name: lang==='en'?'Back':'Espalda',                  desc: '',                                         duration: '30 min',      durationMin: 30, prices: [{ label: lang==='en'?'Wax':'Cera', value: 60000 }, { label: lang==='en'?'Machine':'Máquina', value: 40000 }] },
  { id: 'depilacion-zona-perianal',   category: 'depilacion', name: lang==='en'?'Perianal Area':'Zona Perianal',            desc: '',                                         duration: '30 min',      durationMin: 30, prices: [{ label: lang==='en'?'Wax':'Cera', value: 65000 }, { label: lang==='en'?'Machine':'Máquina', value: 45000 }] },
  { id: 'depilacion-cuerpo-completo',     category: 'depilacion', name: lang==='en'?'Full Body':'Cuerpo Completo',          desc: '',                                         duration: '2 h',         durationMin: 120,prices: [{ label: lang==='en'?'Wax':'Cera', value: 400000 }, { label: lang==='en'?'Machine':'Máquina', value: 250000 }] },
]

const MONTHS = (lang: string) => lang === 'en' ? ['January','February','March','April','May','June','July','August','September','October','November','December'] : ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS   = (lang: string) => lang === 'en' ? ['S','M','T','W','T','F','S'] : ['D','L','M','X','J','V','S']
const TIMES  = ['10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']

function fmtCop(n: number) {
  return '$' + n.toLocaleString('es-CO').replace(/,/g, '.')
}

// ─── Step machine ─────────────────────────────────────────────────────────────
// Steps: category → service → price → datetime → details
type StepId = 'category' | 'service' | 'price' | 'datetime' | 'details'
const STEP_ORDER: StepId[] = ['category','service','price','datetime','details']
const STEP_LABELS = ['Servicio','Servicio','Duración','Fecha y hora','Confirmar']

function stepIndex(s: StepId) { return STEP_ORDER.indexOf(s) }

// ─── Calendar helpers ─────────────────────────────────────────────────────────
type Cell = { key: string; day: number | null }
function buildCal(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const cells: Cell[] = []
  for (let i = 0; i < first; i++) cells.push({ key: `p${i}`, day: null })
  for (let d = 1; d <= total; d++) cells.push({ key: `d${d}`, day: d })
  while (cells.length % 7 !== 0) cells.push({ key: `e${cells.length}`, day: null })
  return cells
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookClient({ locale, t }: { locale: string; t: Dict['book'] }) {
  const lang = (locale === 'en' ? 'en' : 'es') as Locale

  const [step, setStep]           = useState<StepId>('category')
  const [dir,  setDir]            = useState<1|-1>(1)
  const [anim, setAnim]           = useState(true)

  // selections
  const [category, setCategory]   = useState<Category | null>(null)
  const [service,  setService]    = useState<Service | null>(null)
  const [priceIdx, setPriceIdx]   = useState<number>(0)

  // datetime
  const today = new Date()
  const [calYear,  setCalYear]    = useState(today.getFullYear())
  const [calMonth, setCalMonth]   = useState(today.getMonth())
  const [selDay,   setSelDay]     = useState<number | null>(null)
  const [selTime,  setSelTime]    = useState<string | null>(null)

  // form
  const [form, setForm]           = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Smooth navigate
  function go(target: StepId, direction: 1|-1 = 1) {
    setDir(direction)
    setAnim(false)
    setTimeout(() => { setStep(target); setAnim(true); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, 160)
  }
  function goBack() {
    const idx = stepIndex(step)
    if (idx <= 0) return
    // Skip price step going back if not needed
    let prev = STEP_ORDER[idx - 1]
    if (prev === 'price' && service && service.prices.length <= 1) {
      prev = 'service'
    }
    go(prev as StepId, -1)
  }

  // Auto-advance helpers
  function pickCategory(cat: Category) {
    setCategory(cat)
    setService(null)
    setPriceIdx(0)
    setSelDay(null)
    setSelTime(null)
    trackEvent(EVENTS.BOOKING_STARTED, { locale: lang })
    go('service')
  }

  function pickService(svc: Service) {
    setService(svc)
    setPriceIdx(0)
    trackEvent(EVENTS.BOOKING_SERVICE_SELECTED, { service_id: svc.id, service_name: svc.name, category: svc.category, locale: lang })
    // Skip price step if only one price option
    if (svc.prices.length <= 1) { go('datetime') }
    else { go('price') }
  }

  function pickPrice(idx: number) {
    setPriceIdx(idx)
    go('datetime')
  }

  function pickDay(d: number) {
    setSelDay(d)
    setSelTime(null)
    trackEvent(EVENTS.BOOKING_DATE_SELECTED, { service_id: service?.id ?? '', date: `${calYear}-${calMonth+1}-${d}` })
  }

  function pickTime(t: string) {
    setSelTime(t)
    trackEvent(EVENTS.BOOKING_TIME_SELECTED, { service_id: service?.id ?? '', time_slot: t })
    setTimeout(() => go('details'), 300)
  }

  function isPast(day: number) {
    const d = new Date(calYear, calMonth, day)
    d.setHours(0,0,0,0)
    const n = new Date(); n.setHours(0,0,0,0)
    return d < n
  }

  const selectedPrice = service ? service.prices[priceIdx] : null
  const progressStep  = stepIndex(step)    // 0..4
  // Map to user-visible steps 1..3 (category+service → 1, price+datetime → 2, details → 3)
  const uiStep = progressStep <= 1 ? 1 : progressStep <= 3 ? 2 : 3

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !selDay || !selTime || !form.name || !form.phone) return
    setSubmitting(true)

    const dateStr = `${MONTHS(lang)[calMonth]} ${selDay}, ${calYear}`
    const svcLabel = `${service.name}${service.prices.length > 1 ? ` · ${service.prices[priceIdx].label}` : ''}`
    const price    = selectedPrice?.value ?? 0

    const waText =
      `Hola Diamond Spa! Me gustaría reservar:\n\n` +
      `📋 Servicio: ${svcLabel}\n` +
      `📅 Fecha: ${dateStr}\n` +
      `⏰ Hora: ${selTime}\n` +
      `👤 Nombre: ${form.name}\n` +
      `📱 Tel: ${form.phone}\n` +
      (form.email ? `📧 Email: ${form.email}\n` : '') +
      (form.notes ? `💬 Notas: ${form.notes}\n` : '') +
      `\n💰 Total: ${fmtCop(price)}`

    trackEvent(EVENTS.BOOKING_SUBMITTED, { service_id: service.id, service_name: service.name, category: service.category, duration_minutes: service.durationMin, price_cop: price, locale: lang })
    trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source: 'booking' })
    window.open(randomWhatsAppUrl(waText), '_blank')

    try { await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `[Diamond] ${svcLabel} · ${dateStr} · ${selTime} · ${form.name} · ${form.phone}` }) }) } catch {}
    let payloadDuration: number | null = null
    let hairMethod: 'wax' | 'machine' | undefined = undefined

    if (service.category === 'masajes') {
      if (selectedPrice?.label.includes('30')) payloadDuration = 30
      else if (selectedPrice?.label.includes('90')) payloadDuration = 90
      else payloadDuration = 60
    }
    if (service.category === 'depilacion') {
      hairMethod = selectedPrice?.label === 'Cera' ? 'wax' : 'machine'
    }

    try { await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: service.id, durationMinutes: payloadDuration, hairMethod: hairMethod, year: calYear, monthIndex: calMonth, day: selDay, timeSlot: selTime, locale: lang, name: form.name, phone: form.phone, requests: form.notes }) }) } catch {}

    setSubmitting(false)
    setConfirmed(true)
  }

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', paddingTop:'96px' }}>
        <div style={{ maxWidth:440, width:'100%', textAlign:'center' }}>
          <div style={{ marginBottom:20 }}><Icon name="check_circle" size={56} style={{ color:C.success }} /></div>
          <p style={{ color:C.accent, fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:12 }}>{lang === 'en' ? 'Booking confirmed' : 'Reserva confirmada'}</p>
          <h1 style={{ color:C.text, fontSize:'clamp(28px,6vw,40px)', fontWeight:300, marginBottom:16 }}>{lang === 'en' ? 'Your appointment is booked' : 'Tu cita está reservada'}</h1>
          <p style={{ color:C.sec, lineHeight:1.7, marginBottom:32 }}>{lang === 'en' ? 'Welcome' : 'Bienvenido/a'}, <strong style={{ color:C.text }}>{form.name}</strong>. {lang === 'en' ? 'We look forward to seeing you at Diamond Spa.' : 'Te esperamos en Diamond Spa.'}</p>
          <div style={{ background:C.card, border:`1px solid ${C.cardBrd}`, borderRadius:6, padding:24, marginBottom:32, textAlign:'left' }}>
            {[
              [lang==='en'?'Service':'Servicio', service?.name ?? ''],
              [lang==='en'?'Date':'Fecha',    `${MONTHS(lang)[calMonth]} ${selDay}, ${calYear}`],
              [lang==='en'?'Time':'Hora',     selTime ?? ''],
              ['Total',    selectedPrice ? fmtCop(selectedPrice.value) : '—'],
            ].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.div}` }}>
                <span style={{ color:C.sec, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em' }}>{l}</span>
                <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>{ setConfirmed(false); setStep('category'); setCategory(null); setService(null); setSelDay(null); setSelTime(null); setForm({name:'',phone:'',email:'',notes:''}) }}
            style={{ background:'transparent', border:`1px solid ${C.cardBrd}`, color:C.sec, padding:'12px 28px', cursor:'pointer', fontSize:13, borderRadius:4 }}>
            {lang === 'en' ? 'Make another booking' : 'Hacer otra reserva'}
          </button>
        </div>
      </div>
    )
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,-apple-system,sans-serif', display:'flex', flexDirection:'column' }}>
      <STYLES dir={dir} />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ position:'sticky', top:0, zIndex:40, background:`${C.card}f0`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${C.div}` }}>
        {/* Progress bar */}
        <div style={{ height:3, background:C.div }}>
          <div style={{ height:'100%', background:C.accent, width:`${(progressStep/4)*100}%`, transition:'width 0.4s ease' }} />
        </div>

        <div style={{ maxWidth:640, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', height:56, gap:0 }}>
          {/* Back button */}
          <button
            onClick={goBack}
            style={{ background:'none', border:'none', cursor: step==='category' ? 'default' : 'pointer',
              color: step==='category' ? 'transparent' : C.sec,
              padding:'8px', marginRight:8, lineHeight:1, flexShrink:0,
              transition:'color 0.2s', display:'flex', alignItems:'center',
            }}
            aria-label="Volver"
          >
            <Icon name="chevron_left" size={20} />
          </button>

          {/* Step indicators */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
            {(lang === 'en' ? ['Category','Service','Date & time','Confirm'] : ['Categoría','Servicio','Fecha y hora','Confirmar']).map((label, i) => {
              // Map step index to 4 visible stages
              const stageMap = [0,1,1,2,3]
              const curStage = stageMap[progressStep]
              const isDone   = curStage > i
              const isNow    = curStage === i
              return (
                <div key={label} style={{ display:'flex', alignItems:'center', flex: i<3?1:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    <div style={{
                      width:20, height:20, borderRadius:'50%', flexShrink:0,
                      background: isDone ? C.accent : isNow ? `${C.accent}28` : 'transparent',
                      border:`1.5px solid ${isDone||isNow ? C.accent : C.div}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, color: isDone?'#fff': isNow?C.accent:C.sec,
                      fontWeight:700, transition:'all 0.3s',
                    }}>
                      {isDone ? '✓' : i+1}
                    </div>
                    <span style={{ fontSize:11, color: isNow?C.text:C.sec, fontWeight:isNow?600:400, whiteSpace:'nowrap', transition:'color 0.3s', display: i===1?'none':'block' }}>
                      {label}
                    </span>
                  </div>
                  {i<3 && <div style={{ flex:1, height:1, background: isDone?C.accent:C.div, margin:'0 8px', transition:'background 0.3s' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto' }}>
        <div
          key={step}
          className={anim ? 'step-in' : 'step-out'}
          style={{ maxWidth:640, margin:'0 auto', padding:'32px 16px 120px' }}
        >

          {/* ── STEP: CATEGORY ─────────────────────────────────────────── */}
          {step === 'category' && (
            <div>
              <StepTitle label={lang === 'en' ? 'What service do you want?' : '¿Qué servicio deseas?'} sub={lang === 'en' ? 'Select a category to start' : 'Selecciona una categoría para comenzar'} />
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {CATEGORIES(lang).map(cat => (
                  <button
                    key={cat.id}
                    className="tap-card"
                    onClick={() => pickCategory(cat.id)}
                    style={{
                      width:'100%', background:C.card, border:`1.5px solid ${C.cardBrd}`,
                      borderRadius:10, padding:'20px 20px', textAlign:'left', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:18, transition:'all 0.18s ease',
                    }}
                  >
                    <span style={{ width:44, height:44, borderRadius:10, background:`${C.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name={cat.icon} size={24} style={{ color:C.accent }} />
                    </span>
                    <div>
                      <div style={{ color:C.text, fontSize:18, fontWeight:600, marginBottom:4 }}>{cat.label}</div>
                      <div style={{ color:C.sec, fontSize:13 }}>{cat.sub}</div>
                    </div>
                    <span style={{ marginLeft:'auto', color:C.sec, fontSize:20, flexShrink:0 }}>›</span>
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div style={{ marginTop:32, display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { icon:'star',        text:lang === 'en' ? '4.9 on Google' : '4.9 en Google' },
                  { icon:'person',      text:lang === 'en' ? '320+ clients' : '+320 clientes' },
                  { icon:'location_on', text:'El Poblado, Medellín' },
                ].map(b=>(
                  <span key={b.text} style={{ color:C.sec, fontSize:12, background:`${C.card}88`, border:`1px solid ${C.div}`, padding:'6px 12px', borderRadius:20, display:'flex', alignItems:'center', gap:5 }}>
                    <Icon name={b.icon} size={14} style={{ color:C.accent }} />{b.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: SERVICE ──────────────────────────────────────────── */}
          {step === 'service' && category && (
            <div>
              <StepTitle
                label={CATEGORIES(lang).find(c=>c.id===category)?.label ?? ''}
                sub={lang === 'en' ? 'Select the service you want' : 'Selecciona el servicio que deseas'}
              />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {SERVICES(lang).filter(s=>s.category===category).map(svc => (
                  <button
                    key={svc.id}
                    className="tap-card"
                    onClick={()=>pickService(svc)}
                    style={{
                      width:'100%', background:C.card, border:`1.5px solid ${C.cardBrd}`,
                      borderRadius:8, padding:'16px 18px', textAlign:'left', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:14, transition:'all 0.18s ease',
                    }}
                  >
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom: svc.desc ? 4 : 0 }}>
                        {svc.name}
                      </div>
                      {svc.desc && <div style={{ color:C.sec, fontSize:13, lineHeight:1.4 }}>{svc.desc}</div>}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ color:C.accent, fontSize:14, fontWeight:700 }}>
                        {svc.prices.length > 1 ? `${lang === 'en' ? 'from' : 'desde'} ${fmtCop(Math.min(...svc.prices.map(p=>p.value)))}` : fmtCop(svc.prices[0].value)}
                      </div>
                      {svc.duration && <div style={{ color:C.sec, fontSize:11, marginTop:2 }}>{svc.duration}</div>}
                    </div>
                    <span style={{ color:C.sec, fontSize:20, flexShrink:0 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: PRICE / DURATION ─────────────────────────────────── */}
          {step === 'price' && service && (
            <div>
              <StepTitle label={service.name} sub={lang === 'en' ? 'How much time do you want?' : '¿Cuánto tiempo quieres?'} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {service.prices.map((p, idx) => (
                  <button
                    key={p.label}
                    className="tap-card"
                    onClick={()=>pickPrice(idx)}
                    style={{
                      width:'100%', background:C.card, border:`1.5px solid ${C.cardBrd}`,
                      borderRadius:8, padding:'20px 22px', textAlign:'left', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      transition:'all 0.18s ease',
                    }}
                  >
                    <span style={{ color:C.text, fontSize:17, fontWeight:500 }}>{p.label}</span>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ color:C.accent, fontSize:20, fontWeight:700 }}>{fmtCop(p.value)}</span>
                      <span style={{ color:C.sec, fontSize:11, display:'block', marginTop:2 }}>COP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: DATE + TIME ──────────────────────────────────────── */}
          {step === 'datetime' && (
            <div>
              {/* Mini summary chip */}
              {service && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, background:C.card, border:`1px solid ${C.cardBrd}`, borderRadius:8, padding:'10px 14px' }}>
                  <Icon name="spa" size={16} style={{ color:C.accent, flexShrink:0 }} />
                  <span style={{ color:C.text, fontSize:13, fontWeight:600 }}>{service.name}</span>
                  {selectedPrice && <span style={{ color:C.accent, fontSize:13, fontWeight:700, marginLeft:'auto' }}>{fmtCop(selectedPrice.value)}</span>}
                </div>
              )}

              <StepTitle label={lang === 'en' ? 'When would you like to come?' : '¿Cuándo te gustaría venir?'} sub={selDay ? `${MONTHS(lang)[calMonth]} ${selDay} — ${lang === 'en' ? 'choose your time' : 'elige tu hora'}` : (lang === 'en' ? 'Select the day' : 'Selecciona el día')} />

              {/* Calendar */}
              <div style={{ background:C.card, border:`1px solid ${C.cardBrd}`, borderRadius:10, padding:20, marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <button onClick={()=>{ if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11)}else setCalMonth(m=>m-1); setSelDay(null);setSelTime(null) }}
                    style={{ background:'none', border:'none', color:C.sec, cursor:'pointer', padding:'4px 8px', lineHeight:1, display:'flex', alignItems:'center' }}>
                    <Icon name="chevron_left" size={22} /></button>
                  <span style={{ color:C.text, fontSize:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {MONTHS(lang)[calMonth]} {calYear}
                  </span>
                  <button onClick={()=>{ if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0)}else setCalMonth(m=>m+1); setSelDay(null);setSelTime(null) }}
                    style={{ background:'none', border:'none', color:C.sec, cursor:'pointer', padding:'4px 8px', lineHeight:1, display:'flex', alignItems:'center' }}>
                    <Icon name="chevron_right" size={22} /></button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
                  {DAYS(lang).map((d, i) =>(
                    <div key={`day-${i}`} style={{ textAlign:'center', color:C.sec, fontSize:11, padding:'4px 0', fontWeight:600 }}>{d}</div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                  {buildCal(calYear, calMonth).map(({key, day})=>{
                    if(!day) return <div key={key} />
                    const past   = isPast(day)
                    const active = selDay === day
                    return (
                      <button
                        key={key}
                        disabled={past}
                        onClick={()=>pickDay(day)}
                        className={past ? '' : 'tap-day'}
                        style={{
                          aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                          background: active ? C.accent : 'transparent',
                          color: past?`${C.div}`:(active?'#fff':C.text),
                          border: active ? 'none' : `1.5px solid ${active?C.accent:'transparent'}`,
                          borderRadius:6, cursor: past?'not-allowed':'pointer',
                          fontSize:13, fontWeight: active?700:400, transition:'all 0.15s',
                        }}
                      >{day}</button>
                    )
                  })}
                </div>
              </div>

              {/* Time slots — appear when day is selected */}
              {selDay && (
                <div className="slide-up">
                  <p style={{ color:C.sec, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>
                    {lang === 'en' ? 'Available times — ' : 'Horarios disponibles — '}{MONTHS(lang)[calMonth]} {selDay}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {TIMES.map(t=>{
                      const active = selTime === t
                      return (
                        <button
                          key={t}
                          onClick={()=>pickTime(t)}
                          className="tap-time"
                          style={{
                            padding:'13px 8px', border:`1.5px solid ${active?C.accent:C.cardBrd}`,
                            background: active?C.accent:'transparent', color: active?'#fff':C.sec,
                            borderRadius:7, fontSize:13, fontWeight: active?700:400,
                            cursor:'pointer', transition:'all 0.18s ease',
                            display:'flex', alignItems:'center', justifyContent:'center',
                          }}
                        >{t}</button>
                      )
                    })}
                  </div>
                  {selTime && (
                    <div className="slide-up" style={{ marginTop:16, color:C.success, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                      <Icon name="check_circle" size={16} style={{ color:C.success }} />
                      <span>{lang === 'en' ? 'Time selected — loading next step...' : 'Hora seleccionada — cargando siguiente paso…'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: DETAILS + CONFIRM ────────────────────────────────── */}
          {step === 'details' && (
            <form onSubmit={handleSubmit}>
              {/* Booking summary card */}
              <div style={{ background:C.card, border:`1px solid ${C.cardBrd}`, borderRadius:10, padding:'18px 20px', marginBottom:28 }}>
                <p style={{ color:C.sec, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>{lang === 'en' ? 'Your booking' : 'Tu reserva'}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { label: lang === 'en' ? 'Service' : 'Servicio', val: service?.name ?? '—', icon:'spa' },
                    { label: lang === 'en' ? 'Date' : 'Fecha',    val: selDay ? `${MONTHS(lang)[calMonth]} ${selDay}, ${calYear}` : '—', icon:'calendar_month' },
                    { label: lang === 'en' ? 'Time' : 'Hora',     val: selTime ?? '—', icon:'schedule' },
                  ].map(({label,val,icon})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:C.sec, fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                        <Icon name={icon} size={14} style={{ color:C.sec }} />{label}
                      </span>
                      <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:`1px solid ${C.div}`, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <span style={{ color:C.sec, fontSize:12 }}>Total</span>
                    <span style={{ color:C.accent, fontSize:22, fontWeight:700 }}>{selectedPrice ? fmtCop(selectedPrice.value) : '—'}</span>
                  </div>
                </div>
              </div>

              <StepTitle label={lang === 'en' ? 'Your details' : 'Tus datos'} sub={lang === 'en' ? 'Last step — just a few details to confirm' : 'Último paso — solo unos datos para confirmar'} />

              <div style={{ display:'flex', flexDirection:'column', gap:18, marginBottom:24 }}>
                {([
                  { id:'name',  label: lang === 'en' ? 'Full name' : 'Nombre completo',      type:'text',  required:true },
                  { id:'phone', label: lang === 'en' ? 'Phone / WhatsApp' : 'Teléfono / WhatsApp',  type:'tel',   required:true },
                  { id:'email', label: lang === 'en' ? 'Email (optional)' : 'Email (opcional)',      type:'email', required:false },
                ] as const).map(f=>(
                  <div key={f.id}>
                    <label style={{ display:'block', color:C.sec, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                      {f.label}{f.required && <span style={{ color:C.accent }}> *</span>}
                    </label>
                    <input
                      id={f.id}
                      type={f.type}
                      required={f.required}
                      value={form[f.id]}
                      onChange={e=>setForm(p=>({...p,[f.id]:e.target.value}))}
                      className="inp"
                      style={{
                        width:'100%', boxSizing:'border-box',
                        background:C.card, border:`1.5px solid ${C.cardBrd}`,
                        color:C.text, padding:'13px 14px', fontSize:15,
                        borderRadius:7, outline:'none', fontFamily:'inherit',
                        transition:'border-color 0.2s',
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display:'block', color:C.sec, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                    {lang === 'en' ? 'Special requests' : 'Solicitudes especiales'}
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                    placeholder={lang === 'en' ? 'Preferences, sensitivities, arrival notes...' : 'Preferencias, sensibilidades, notas de llegada…'}
                    className="inp"
                    style={{
                      width:'100%', boxSizing:'border-box',
                      background:C.card, border:`1.5px solid ${C.cardBrd}`,
                      color:C.text, padding:'13px 14px', fontSize:15,
                      borderRadius:7, outline:'none', fontFamily:'inherit',
                      resize:'none', transition:'border-color 0.2s',
                    }}
                  />
                </div>
              </div>

              {/* Trust row */}
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:100 }}>
                {[
                  { icon:'star',     text:'4.9 en Google' },
                  { icon:'verified', text:lang === 'en' ? '320+ clients served' : '+320 clientes atendidos' },
                  { icon:'lock',     text:lang === 'en' ? 'Private arrival instructions 24h before' : 'Llegada privada 24h antes' },
                ].map(b=>(
                  <span key={b.text} style={{ color:C.sec, fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
                    <Icon name={b.icon} size={14} style={{ color:C.accent }} />{b.text}
                  </span>
                ))}
              </div>

              {/* Sticky confirm */}
              <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'14px 16px', background:`${C.bg}f4`, backdropFilter:'blur(10px)', borderTop:`1px solid ${C.div}`, zIndex:50 }}>
                <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:10 }}>
                  <button
                    type="submit"
                    disabled={!form.name.trim()||!form.phone.trim()||submitting}
                    className="btn-confirm"
                    style={{
                      width:'100%', padding:'16px', fontSize:15, fontWeight:700,
                      background: form.name.trim()&&form.phone.trim() ? C.accent : C.div,
                      color: form.name.trim()&&form.phone.trim() ? '#fff' : C.sec,
                      border:'none', borderRadius:8, cursor: form.name.trim()&&form.phone.trim() ? 'pointer':'not-allowed',
                      transition:'all 0.2s', letterSpacing:'0.03em',
                    }}
                  >
                    {submitting ? (lang === 'en' ? 'Sending...' : 'Enviando…') : `${lang === 'en' ? 'Confirm booking' : 'Confirmar reserva'}${selectedPrice ? ` — ${fmtCop(selectedPrice.value)}` : ''}`}
                  </button>
                  <div style={{ textAlign:'center' }}>
                    <a
                      href={`https://wa.me/573054541635?text=${encodeURIComponent('Hola Diamond Spa, quisiera reservar una cita.')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color:C.sec, fontSize:12, textDecoration:'none' }}
                    >
                      {lang === 'en' ? 'Prefer WhatsApp? Book here →' : '¿Prefieres WhatsApp? Reserva aquí →'}
                    </a>
                  </div>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StepTitle({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ color:C.text, fontSize:'clamp(22px,5vw,30px)', fontWeight:300, margin:'0 0 8px', lineHeight:1.2 }}>{label}</h2>
      <p style={{ color:C.sec, fontSize:14, margin:0 }}>{sub}</p>
    </div>
  )
}

function STYLES({ dir }: { dir: 1|-1 }) {
  return (
    <style>{`
      @keyframes stepIn  { from { opacity:0; transform:translateX(${dir>0?'24px':'-24px'}) } to { opacity:1; transform:translateX(0) } }
      @keyframes stepOut { from { opacity:1 } to { opacity:0 } }
      @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

      .step-in  { animation: stepIn  0.22s ease forwards; }
      .step-out { animation: stepOut 0.15s ease forwards; }
      .slide-up { animation: slideUp 0.25s ease forwards; }

      .tap-card:hover  { background: ${C.cardHov} !important; border-color: ${C.cardSelBrd} !important; }
      .tap-card:active { transform: scale(0.98); }
      .tap-day:hover   { background: ${C.accent}33 !important; }
      .tap-time:hover  { border-color: ${C.accent} !important; color: ${C.text} !important; }
      .btn-confirm:hover:not(:disabled) { background: ${C.accentHov} !important; }
      .inp:focus { border-color: ${C.accent} !important; }

      * { -webkit-tap-highlight-color: transparent; }
    `}</style>
  )
}
