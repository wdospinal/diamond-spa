'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getDict, type Locale } from '@/lib/i18n'
import { SERVICES, formatCop, type DurationMinutes, type ServiceDef } from '@/lib/services'
import { randomWhatsAppUrl, SPA_HOURS } from '@/lib/spa'

type DurationService = ServiceDef & { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }
const MASSAGE_SERVICES = (SERVICES as unknown as ServiceDef[]).filter(
  (s): s is DurationService => s.pricingModel === 'duration'
)

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

function getTimeSlots(year: number, month: number, day: number, durationMin: number): string[] {
  const dayName = DAY_NAMES[new Date(year, month, day).getDay()]
  const schedule = SPA_HOURS.find(h => (h.dayOfWeek as readonly string[]).includes(dayName))
  if (!schedule) return []

  const [openH, openM] = schedule.opens.split(':').map(Number)
  const [closeH, closeM] = schedule.closes.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const lastSlot = closeH * 60 + closeM - durationMin

  const now = new Date()
  const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate()
  const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1

  const slots: string[] = []
  for (let m = openMinutes; m <= lastSlot; m += 30) {
    if (m <= nowMinutes) continue
    const h = Math.floor(m / 60)
    const min = m % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
    slots.push(`${displayH}:${min.toString().padStart(2, '0')} ${ampm}`)
  }
  return slots
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}


const DURATIONS: DurationMinutes[] = [30, 60, 90]

export default function BookClient({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'es') as Locale
  const t = getDict(lang).book
  const tSvc = getDict(lang).services
  const searchParams = useSearchParams()

  const today = new Date()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes | null>(null)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', requests: '' })

  // Pre-select service from ?service= query param (massages only)
  useEffect(() => {
    const svcParam = searchParams?.get('service')
    if (svcParam && MASSAGE_SERVICES.find(s => s.id === svcParam)) {
      setSelectedService(svcParam)
    }
  }, [searchParams])

  const cells = buildCalendar(calYear, calMonth)

  const selectedServiceObj = MASSAGE_SERVICES.find(s => s.id === selectedService)
  const selectedPriceCop = selectedServiceObj && selectedDuration
    ? selectedServiceObj.prices[selectedDuration]
    : null

  function isPast(day: number) {
    const d = new Date(calYear, calMonth, day)
    d.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return d < now
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1)
    setSelectedDay(null); setSelectedTime(null)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1)
    setSelectedDay(null); setSelectedTime(null)
  }

  function serviceName(s: ServiceDef) {
    return lang === 'en' ? s.name.en : s.name.es
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedDuration || !selectedDay || !selectedTime) return

    const service = selectedServiceObj!
    const dateStr = `${t.months[calMonth]} ${selectedDay}, ${calYear}`
    const sName = serviceName(service)
    const priceCop = selectedPriceCop ?? 0

    const waText =
      `Hola Diamond Spa! Me gustaría reservar una cita:\n\n` +
      `📋 ${t.serviceLabel}: ${sName} (${selectedDuration} min)\n` +
      `📅 ${t.dateLabel}: ${dateStr}\n` +
      `⏰ ${t.timeLabel}: ${selectedTime}\n` +
      `👤 Nombre: ${form.firstName} ${form.lastName}\n` +
      `📧 Email: ${form.email}\n` +
      `📱 Tel: ${form.phone}\n` +
      (form.requests ? `💬 Notas: ${form.requests}\n` : '') +
      `\n💰 ${t.totalLabel}: ${formatCop(priceCop)}`

    window.open(randomWhatsAppUrl(waText), '_blank')

    const smsBody =
      `[Diamond Spa] Nueva reserva\n` +
      `Servicio: ${sName} (${selectedDuration} min)\n` +
      `Fecha: ${dateStr}\n` +
      `Cliente: ${form.firstName} ${form.lastName}\n` +
      `Tel: ${form.phone} | Email: ${form.email}` +
      (form.requests ? `\nNotas: ${form.requests}` : '')

    try { await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: smsBody }) }) } catch { /* non-blocking */ }
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          durationMinutes: selectedDuration,
          year: calYear,
          monthIndex: calMonth,
          day: selectedDay,
          timeSlot: selectedTime,
          locale: lang,
          ...form,
        }),
      })
    } catch { /* non-blocking */ }

    setConfirmed(true)
  }

  if (confirmed) {
    const sName = selectedServiceObj ? serviceName(selectedServiceObj as ServiceDef) : ''
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6 pt-24">
        <div className="max-w-lg w-full text-center">
          <span className="material-symbols-outlined text-primary text-6xl mb-8 block">check_circle</span>
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.confirmedLabel}</span>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">{t.confirmedTitle}</h1>
          <p className="font-body text-secondary leading-relaxed mb-4">
            {t.confirmedBody1} {form.firstName}. {t.confirmedBody2} <span className="text-primary">{form.email}</span>.
          </p>
          <div className="bg-surface-container-high p-8 my-10 text-left flex flex-col gap-3">
            {[
              [t.serviceLabel, `${sName} (${selectedDuration} min)`],
              [t.dateLabel, `${t.months[calMonth]} ${selectedDay}, ${calYear}`],
              [t.totalLabel, selectedPriceCop ? formatCop(selectedPriceCop) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center gap-4">
                <span className="font-label text-outline text-xs uppercase tracking-widest shrink-0">{label}</span>
                <span className="font-body text-on-surface text-sm text-right">{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setConfirmed(false)
              setSelectedService(null)
              setSelectedDuration(null)
              setSelectedDay(null)
              setSelectedTime(null)
              setForm({ firstName: '', lastName: '', email: '', phone: '', requests: '' })
            }}
            className="bg-primary text-on-primary px-10 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all"
          >
            {t.bookAnother}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="pt-12 md:pt-16 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-5 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">{t.title}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="pb-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-12">

          <div className="xl:col-span-2 flex flex-col gap-16">

            {/* Step 01 — Select service */}
            <div>
              <StepLabel n="01" label={t.step1} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {MASSAGE_SERVICES.map(s => {
                  const isSelected = selectedService === s.id
                  const fromPrice = s.prices[30]
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(s.id)
                        setSelectedDuration(null)
                      }}
                      className={`text-left p-5 transition-all duration-200 ${
                        isSelected
                          ? 'bg-surface-container-high border border-primary/40'
                          : 'bg-surface-container hover:bg-surface-container-high border border-transparent'
                      }`}
                    >
                      <span className="font-headline text-on-surface text-base block mb-3 leading-tight">
                        {serviceName(s)}
                      </span>
                      <span className="font-body text-outline text-xs">
                        {lang === 'en' ? 'from ' : 'desde '}
                        <span className="text-primary font-medium">{formatCop(fromPrice)}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 02 — Select duration (visible only after service picked) */}
            {selectedService && (
              <div>
                <StepLabel n="02" label={t.step1b} />
                <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm">
                  {DURATIONS.map(min => {
                    const svc = MASSAGE_SERVICES.find(s => s.id === selectedService)!
                    const price = svc.prices[min]
                    const isActive = selectedDuration === min
                    return (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setSelectedDuration(min)}
                        className={`p-5 text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-surface-container-high border border-primary/40'
                            : 'bg-surface-container hover:bg-surface-container-high border border-transparent'
                        }`}
                      >
                        <span className="font-label text-on-surface text-sm font-bold block mb-1">
                          {min} {lang === 'en' ? 'min' : 'min'}
                        </span>
                        <span className="font-body text-primary text-sm tabular-nums">{formatCop(price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 03 — Choose date */}
            <div>
              <StepLabel n="03" label={t.step2} />
              <div className="mt-6 bg-surface-container p-4 max-w-xs">
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={prevMonth} className="text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base leading-none">chevron_left</span>
                  </button>
                  <span className="font-label text-on-surface text-xs tracking-widest uppercase">{t.months[calMonth]} {calYear}</span>
                  <button type="button" onClick={nextMonth} className="text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 mb-1">
                  {t.days.map(d => <div key={d} className="text-center font-label text-outline text-[10px] py-0.5">{d}</div>)}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((day, i) => {
                    if (!day) return <div key={i} />
                    const past = isPast(day)
                    const active = selectedDay === day
                    return (
                      <button key={i} type="button" disabled={past} onClick={() => { setSelectedDay(day); setSelectedTime(null) }}
                        className={`h-7 w-7 mx-auto flex items-center justify-center font-body text-[11px] transition-all duration-150 ${past ? 'text-outline/30 cursor-not-allowed' : active ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-high'}`}>
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Step 04 — Select time slot */}
            <div>
              <StepLabel n="04" label={t.step3} />
              <div className="mt-6">
                {!selectedDay ? (
                  <p className="font-body text-outline text-xs">
                    {lang === 'es' ? 'Selecciona una fecha primero.' : 'Select a date first.'}
                  </p>
                ) : !selectedDuration ? (
                  <p className="font-body text-outline text-xs">
                    {lang === 'es' ? 'Selecciona una duración primero.' : 'Select a duration first.'}
                  </p>
                ) : (() => {
                  const slots = getTimeSlots(calYear, calMonth, selectedDay, selectedDuration)
                  return slots.length === 0 ? (
                    <p className="font-body text-outline text-xs">
                      {lang === 'es' ? 'No hay horarios disponibles para este día.' : 'No available times for this day.'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-w-lg">
                      {slots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`px-4 py-2 font-label text-xs tracking-widest uppercase transition-all duration-150 ${
                            selectedTime === slot
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-transparent'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Step 05 — Personal details */}
            <div>
              <StepLabel n="05" label={t.step4} />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                {([
                  { id: 'firstName', label: t.firstName, type: 'text' },
                  { id: 'lastName', label: t.lastName, type: 'text' },
                  { id: 'email', label: t.email, type: 'email' },
                  { id: 'phone', label: t.phone, type: 'tel' },
                ] as const).map(({ id, label, type }) => (
                  <div key={id} className="flex flex-col gap-1">
                    <label htmlFor={id} className="font-label text-xs text-outline uppercase tracking-widest">{label}</label>
                    <input id={id} type={type} required value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                      className="bg-surface-container-highest border-b border-outline focus:border-primary outline-none py-3 px-0 font-body text-sm text-on-surface placeholder:text-outline/40 transition-colors duration-200" />
                  </div>
                ))}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label htmlFor="requests" className="font-label text-xs text-outline uppercase tracking-widest">{t.specialRequests}</label>
                  <textarea id="requests" rows={3} value={form.requests} onChange={e => setForm(f => ({ ...f, requests: e.target.value }))} placeholder={t.requestsPlaceholder}
                    className="bg-surface-container-highest border-b border-outline focus:border-primary outline-none py-3 px-0 font-body text-sm text-on-surface placeholder:text-outline/40 transition-colors duration-200 resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 bg-surface-container-low p-8 flex flex-col gap-6">
              <h3 className="font-headline text-xl text-on-surface">{t.summaryTitle}</h3>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: t.serviceLabel,
                    value: selectedServiceObj ? serviceName(selectedServiceObj) : '—',
                    empty: !selectedService,
                  },
                  {
                    label: t.durationLabel,
                    value: selectedDuration ? `${selectedDuration} min` : '—',
                    empty: !selectedDuration,
                  },
                  {
                    label: t.dateLabel,
                    value: selectedDay ? `${t.months[calMonth]} ${selectedDay}, ${calYear}` : '—',
                    empty: !selectedDay,
                  },
                  {
                    label: t.timeLabel,
                    value: selectedTime ?? '—',
                    empty: !selectedTime,
                  },
                ].map(({ label, value, empty }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="font-label text-outline text-xs uppercase tracking-widest shrink-0">{label}</span>
                    <span className={`font-body text-xs text-right leading-relaxed ${empty ? 'text-outline/40' : 'text-on-surface'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/10 pt-6 flex justify-between items-baseline">
                <span className="font-label text-outline text-xs uppercase tracking-widest">{t.totalLabel}</span>
                <div className="text-right">
                  <span className="font-headline text-2xl text-primary block">
                    {selectedPriceCop ? formatCop(selectedPriceCop) : '—'}
                  </span>
                  {selectedPriceCop && (
                    <span className="font-label text-outline text-[10px] tracking-widest">{t.totalCopHint}</span>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!selectedService || !selectedDuration || !selectedDay || !selectedTime}
                className="w-full bg-primary text-on-primary py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {t.confirm}
              </button>
              <p className="font-body text-xs text-outline leading-relaxed text-center">{t.privacy}</p>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

function StepLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-headline text-outline/40 text-4xl leading-none">{n}</span>
      <span className="font-label text-on-surface text-xs tracking-[0.3em] uppercase">{label}</span>
    </div>
  )
}
