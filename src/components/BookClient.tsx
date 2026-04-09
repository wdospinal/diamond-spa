'use client'

import { useState } from 'react'
import { getDict, type Locale } from '@/lib/i18n'
import { SERVICES } from '@/lib/services'

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
]

export default function BookClient({ locale }: { locale: string }) {
  const lang = (locale === 'en' ? 'en' : 'es') as Locale
  const t = getDict(lang).book

  const today = new Date()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', requests: '' })

  const cells = buildCalendar(calYear, calMonth)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedDay || !selectedTime) return

    const service = SERVICES.find(s => s.id === selectedService)
    const dateStr = `${t.months[calMonth]} ${selectedDay}, ${calYear}`

    const waText =
      `Hola Diamond Spa! Me gustaría reservar una sesión:\n\n` +
      `📋 ${t.serviceLabel}: ${service?.name}\n` +
      `📅 ${t.dateLabel}: ${dateStr}\n` +
      `⏰ ${t.timeLabel}: ${selectedTime}\n` +
      `⏱ ${t.durationLabel}: ${service?.duration}\n\n` +
      `👤 Nombre: ${form.firstName} ${form.lastName}\n` +
      `📧 Email: ${form.email}\n` +
      `📱 Tel: ${form.phone}\n` +
      (form.requests ? `💬 Notas: ${form.requests}\n` : '') +
      `\n💰 ${t.totalLabel}: $${service?.price}`

    window.open(`https://wa.me/573145484227?text=${encodeURIComponent(waText)}`, '_blank')

    const smsBody =
      `[Diamond Spa] Nueva reserva\n` +
      `Servicio: ${service?.name} (${service?.duration})\n` +
      `Fecha: ${dateStr} a las ${selectedTime}\n` +
      `Cliente: ${form.firstName} ${form.lastName}\n` +
      `Tel: ${form.phone} | Email: ${form.email}` +
      (form.requests ? `\nNotas: ${form.requests}` : '')

    try { await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: smsBody }) }) } catch { /* non-blocking */ }
    try {
      await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService, year: calYear, monthIndex: calMonth, day: selectedDay, timeSlot: selectedTime, ...form }),
      })
    } catch { /* non-blocking */ }

    setConfirmed(true)
  }

  const selectedServiceObj = SERVICES.find(s => s.id === selectedService)

  if (confirmed) {
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
              [t.serviceLabel, selectedServiceObj?.name ?? ''],
              [t.dateLabel, `${t.months[calMonth]} ${selectedDay}, ${calYear}`],
              [t.timeLabel, selectedTime ?? ''],
              [t.durationLabel, selectedServiceObj?.duration ?? ''],
              [t.totalLabel, `$${selectedServiceObj?.price}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-label text-outline text-xs uppercase tracking-widest">{label}</span>
                <span className="font-body text-on-surface text-sm">{value}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-outline leading-relaxed mb-10">{t.confirmedConcierge}</p>
          <button
            onClick={() => { setConfirmed(false); setSelectedService(null); setSelectedDay(null); setSelectedTime(null); setForm({ firstName: '', lastName: '', email: '', phone: '', requests: '' }) }}
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

            {/* Step 1 */}
            <div>
              <StepLabel n="01" label={t.step1} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {SERVICES.map(s => (
                  <button key={s.id} type="button" onClick={() => setSelectedService(s.id)}
                    className={`text-left p-7 transition-all duration-200 ${selectedService === s.id ? 'bg-surface-container-high border border-primary/40' : 'bg-surface-container hover:bg-surface-container-high border border-transparent'}`}>
                    <span className="font-label text-tertiary text-xs tracking-[0.3em] uppercase block mb-3">{s.category}</span>
                    <span className="font-headline text-on-surface text-lg block mb-4">{s.name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-light text-xl">${s.price}</span>
                      <span className="text-outline text-xs font-label uppercase tracking-widest">{s.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <StepLabel n="02" label={t.step2} />
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

            {/* Step 3 */}
            <div>
              <StepLabel n="03" label={t.step3} />
              <div className="mt-6 grid grid-cols-4 sm:grid-cols-7 gap-2 max-w-lg">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" disabled={!selectedDay} onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-1 font-label text-xs tracking-wide transition-all duration-150 ${!selectedDay ? 'text-outline/30 bg-surface-container/40 cursor-not-allowed' : selectedTime === slot ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <StepLabel n="04" label={t.step4} />
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

          {/* Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 bg-surface-container-low p-8 flex flex-col gap-6">
              <h3 className="font-headline text-xl text-on-surface">{t.summaryTitle}</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: t.serviceLabel, value: selectedServiceObj?.name ?? '—', empty: !selectedService },
                  { label: t.dateLabel, value: selectedDay ? `${t.months[calMonth]} ${selectedDay}, ${calYear}` : '—', empty: !selectedDay },
                  { label: t.timeLabel, value: selectedTime ?? '—', empty: !selectedTime },
                  { label: t.durationLabel, value: selectedServiceObj?.duration ?? '—', empty: !selectedService },
                ].map(({ label, value, empty }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="font-label text-outline text-xs uppercase tracking-widest shrink-0">{label}</span>
                    <span className={`font-body text-xs text-right leading-relaxed ${empty ? 'text-outline/40' : 'text-on-surface'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/10 pt-6 flex justify-between items-baseline">
                <span className="font-label text-outline text-xs uppercase tracking-widest">{t.totalLabel}</span>
                <span className="font-headline text-2xl text-primary">{selectedServiceObj ? `$${selectedServiceObj.price}` : '—'}</span>
              </div>
              <button type="submit" disabled={!selectedService || !selectedDay || !selectedTime}
                className="w-full bg-primary text-on-primary py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary">
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
