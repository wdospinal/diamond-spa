'use client'

import { useState, useRef, useEffect } from 'react'
import { randomWhatsAppUrl, SPA_HOURS } from '@/lib/spa'
import { pushEvent } from '@/lib/gtm'
import { EVENTS, trackEvent } from '@/lib/events'

const COUNTRY_CODES = [
  { code: '+57', flag: '🇨🇴' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+34', flag: '🇪🇸' },
  { code: '+52', flag: '🇲🇽' },
  { code: '+507', flag: '🇵🇦' },
  { code: '+56', flag: '🇨🇱' },
  { code: '+54', flag: '🇦🇷' },
  { code: '+593', flag: '🇪🇨' },
  { code: '+51', flag: '🇵🇪' },
]

// ─── Category / service data ──────────────────────────────────────────────────
type WCat = 'masajes' | 'faciales' | 'depilacion'
type WPrice = { label: string; value: number }
type WSvc = { id: string; cat: WCat; name: string; durMin: number; prices: WPrice[] }

const W_CATS = (l: 'es' | 'en') => [
  { id: 'masajes' as WCat, label: l === 'en' ? 'Massages' : 'Masajes', icon: '🧘' },
  { id: 'faciales' as WCat, label: l === 'en' ? 'Facials' : 'Faciales', icon: '✨' },
  { id: 'depilacion' as WCat, label: l === 'en' ? 'Hair Removal' : 'Depilación', icon: '🌿' },
]

const W_SVCS = (l: 'es' | 'en'): WSvc[] => [
  { id: 'relaxing', cat: 'masajes', name: l === 'en' ? 'Relaxing Massage' : 'Masaje Relajante', durMin: 60, prices: [{ label: '30 min', value: 120000 }, { label: '60 min', value: 200000 }, { label: '90 min', value: 260000 }] },
  { id: 'deep-tissue', cat: 'masajes', name: l === 'en' ? 'Deep Tissue' : 'Tejido Profundo', durMin: 60, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'four-hands', cat: 'masajes', name: l === 'en' ? 'Four Hands' : '4 Manos', durMin: 60, prices: [{ label: '30 min', value: 230000 }, { label: '60 min', value: 350000 }, { label: '90 min', value: 480000 }] },
  { id: 'duo', cat: 'masajes', name: l === 'en' ? 'Duo Massage' : 'Duo Masaje', durMin: 60, prices: [{ label: '30 min', value: 220000 }, { label: '60 min', value: 380000 }, { label: '90 min', value: 500000 }] },
  { id: 'hot-stones', cat: 'masajes', name: l === 'en' ? 'Volcanic Stones' : 'Piedras Volcánicas', durMin: 75, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'sports', cat: 'masajes', name: l === 'en' ? 'Sports Massage' : 'Masaje Deportivo', durMin: 60, prices: [{ label: '30 min', value: 140000 }, { label: '60 min', value: 240000 }, { label: '90 min', value: 300000 }] },
  { id: 'sensitive', cat: 'masajes', name: l === 'en' ? 'Sensitive Massage' : 'Masaje Sensitivo', durMin: 60, prices: [{ label: '30 min', value: 130000 }, { label: '60 min', value: 220000 }, { label: '90 min', value: 280000 }] },
  { id: 'hidrafacial', cat: 'faciales', name: 'HydraFacial', durMin: 90, prices: [{ label: l === 'en' ? 'Unique · 90 min' : 'Único · 90 min', value: 350000 }] },
  { id: 'lf-profunda', cat: 'faciales', name: l === 'en' ? 'Deep Facial Cleansing' : 'Limpieza Facial Profunda', durMin: 60, prices: [{ label: l === 'en' ? 'Unique · 60 min' : 'Único · 60 min', value: 250000 }] },
  { id: 'lf-basica', cat: 'faciales', name: l === 'en' ? 'Basic Facial Cleansing' : 'Limpieza Facial Básica', durMin: 45, prices: [{ label: l === 'en' ? 'Unique · 45 min' : 'Único · 45 min', value: 150000 }] },
  { id: 'hidratacion', cat: 'faciales', name: l === 'en' ? 'Facial Hydration' : 'Hidratación Facial', durMin: 45, prices: [{ label: l === 'en' ? 'Unique · 45 min' : 'Único · 45 min', value: 200000 }] },
  { id: 'lf-espalda', cat: 'faciales', name: l === 'en' ? 'Back Cleansing' : 'Limpieza de Espalda', durMin: 60, prices: [{ label: l === 'en' ? 'Unique · 60 min' : 'Único · 60 min', value: 200000 }] },
  { id: 'dep-axila', cat: 'depilacion', name: l === 'en' ? 'Underarm' : 'Axila', durMin: 20, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 30000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 20000 }] },
  { id: 'dep-bikini', cat: 'depilacion', name: 'Bikini', durMin: 30, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 80000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 60000 }] },
  { id: 'dep-m-pierna', cat: 'depilacion', name: l === 'en' ? 'Half Leg' : 'Media Pierna', durMin: 30, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 100000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 70000 }] },
  { id: 'dep-pierna', cat: 'depilacion', name: l === 'en' ? 'Full Leg' : 'Pierna Completa', durMin: 45, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 150000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 85000 }] },
  { id: 'dep-pecho', cat: 'depilacion', name: l === 'en' ? 'Chest' : 'Pecho', durMin: 30, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 80000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 50000 }] },
  { id: 'dep-espalda', cat: 'depilacion', name: l === 'en' ? 'Back' : 'Espalda', durMin: 30, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 60000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 40000 }] },
  { id: 'dep-perianal', cat: 'depilacion', name: l === 'en' ? 'Perianal Zone' : 'Zona Perianal', durMin: 30, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 65000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 45000 }] },
  { id: 'dep-full', cat: 'depilacion', name: l === 'en' ? 'Full Body' : 'Cuerpo Completo', durMin: 120, prices: [{ label: l === 'en' ? 'Wax' : 'Cera', value: 400000 }, { label: l === 'en' ? 'Machine' : 'Máquina', value: 250000 }] },
]

// ─── Calendar / time-slot helpers ─────────────────────────────────────────────
const W_EDGE = 30, W_LEAD = 30
const W_DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
function wMin(hhmm: string) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
function wOpen(wd: number) {
  const name = W_DAYS_EN[wd]
  const b = SPA_HOURS.find(h => (h.dayOfWeek as readonly string[]).includes(name)) ?? SPA_HOURS[0]
  return { o: wMin(b.opens), c: wMin(b.closes) }
}
function wFmt(t: number) {
  const h24 = Math.floor(t / 60), m = t % 60, h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}
function wSlots(y: number, mo: number, d: number, dur: number) {
  const { o, c } = wOpen(new Date(y, mo, d).getDay()), step = dur <= 60 ? 30 : 60, out: string[] = []
  for (let m = o + W_EDGE; m <= c - W_EDGE; m += step) out.push(wFmt(m))
  return out
}
function wNow() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date())
  const g = (t: string) => Number(p.find(x => x.type === t)?.value ?? 0), hr = g('hour') % 24
  return { y: g('year'), mo: g('month') - 1, d: g('day'), min: hr * 60 + g('minute') }
}
function wSlotMin(s: string) {
  const m = s.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/); if (!m) return 0
  return (Number(m[1]) % 12 + (m[3] === 'PM' ? 12 : 0)) * 60 + Number(m[2])
}
function wAvail(y: number, mo: number, d: number, dur: number) {
  const sl = wSlots(y, mo, d, dur), now = wNow(), today = y === now.y && mo === now.mo && d === now.d
  return today ? sl.filter(t => wSlotMin(t) >= now.min + W_LEAD) : sl
}
function wCal(y: number, mo: number) {
  const first = new Date(y, mo, 1).getDay(), total = new Date(y, mo + 1, 0).getDate(), cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
function wPast(y: number, mo: number, d: number, dur: number) {
  const now = wNow(), cell = y * 10000 + mo * 100 + d, today = now.y * 10000 + now.mo * 100 + now.d
  if (cell < today) return true; if (cell > today) return false
  return wAvail(y, mo, d, dur).length === 0
}
function wFmtPrice(n: number) { return '$' + n.toLocaleString('es-CO').replace(/,/g, '.') }

const COPY = {
  es: {
    badge: 'Recepción en Línea',
    headerTitle: 'Diamond Spa',
    headerSubtitle: 'En línea · Responde en minutos',
    close: 'Cerrar chat',
    greeting: '¡Hola! 👋 Te conectamos con recepción en segundos.\n\n¿Cómo te llamas?',
    askPhone: (name: string) => `Mucho gusto, ${name} 😊\n\n¿Cuál es tu número de WhatsApp?`,
    askPhoneNoName: '¿Cuál es tu número de WhatsApp?',
    askCategory: '¿Qué tipo de servicio te interesa?',
    askSvc: '¿Cuál servicio específico?',
    askDur: '¿Qué duración o modalidad prefieres?',
    askDate: '¿Qué día te viene bien?',
    askTime: '¿A qué hora te gustaría tu cita?',
    talkAdvisor: 'Hablar con un asesor →',
    talkAdvisorConnecting: '¡Perfecto! Te transferimos con nuestro asesor en WhatsApp…',
    closing: '¡Perfecto! Te estamos conectando por WhatsApp…',
    namePlaceholder: 'Escribe tu nombre…',
    phonePlaceholder: '312 345 6789',
    skipName: 'Prefiero no decir',
    skipAll: 'Escribir directo a WhatsApp →',
    invalidPhone: 'Escribe un número válido (mínimo 7 dígitos).',
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    days: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    noSlots: 'Sin horarios disponibles para este día. Elige otro día.',
    changeDay: '← Cambiar día',
  },
  en: {
    badge: 'Live Receptionist',
    headerTitle: 'Diamond Spa',
    headerSubtitle: 'Online · Replies in minutes',
    close: 'Close chat',
    greeting: "Hi! 👋 We'll connect you with reception in seconds.\n\nWhat's your name?",
    askPhone: (name: string) => `Nice to meet you, ${name} 😊\n\nWhat's your WhatsApp number?`,
    askPhoneNoName: "What's your WhatsApp number?",
    askCategory: 'What type of service are you interested in?',
    askSvc: 'Which specific service?',
    askDur: 'What duration or option do you prefer?',
    askDate: 'What day works for you?',
    askTime: 'What time would you like your appointment?',
    talkAdvisor: 'Talk to an advisor →',
    talkAdvisorConnecting: 'Perfect! Connecting you with an advisor on WhatsApp…',
    closing: 'Perfect! Connecting you on WhatsApp…',
    namePlaceholder: 'Type your name…',
    phonePlaceholder: '312 345 6789',
    skipName: "I'd rather not say",
    skipAll: 'Message directly on WhatsApp →',
    invalidPhone: 'Enter a valid phone number (at least 7 digits).',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    noSlots: 'No available slots for this day. Pick another day.',
    changeDay: '← Pick another day',
  },
}

type ChatStep = 'name' | 'phone' | 'category' | 'svc' | 'dur' | 'date' | 'time' | 'closing'
type ChatMsg = { from: 'bot' | 'user'; text: string }

export default function WhatsAppChatWidget({
  locale,
  isOpen,
  onClose,
  customText,
}: {
  locale: 'es' | 'en'
  isOpen: boolean
  onClose: () => void
  customText?: string
}) {
  const [step, setStep] = useState<ChatStep>('name')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState(locale === 'en' ? '+1' : '+57')
  const [inputValue, setInputValue] = useState('')
  const [phoneError, setPhoneError] = useState(false)

  // booking selections
  const [wCat, setWCat] = useState<WCat | null>(null)
  const [wSvc, setWSvc] = useState<WSvc | null>(null)
  const [wPriceIdx, setWPriceIdx] = useState(0)
  const _now = wNow()
  const [wCalY, setWCalY] = useState(_now.y)
  const [wCalMo, setWCalMo] = useState(_now.mo)
  const [wDay, setWDay] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const submittingRef = useRef(false)

  const t = COPY[locale]

  function pushBotMessage(text: string, delay = 400) {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text }])
    }, delay)
  }

  // Initialize conversation on mount / open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ from: 'bot', text: t.greeting }])
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen, messages.length, t.greeting])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping, step])

  function submitName(overrideValue?: string) {
    const val = overrideValue !== undefined ? overrideValue : inputValue.trim()
    setName(val)
    setMessages(prev => [...prev, { from: 'user', text: val || t.skipName }])
    setInputValue('')
    setStep('phone')
    pushBotMessage(val ? t.askPhone(val) : t.askPhoneNoName)
    setTimeout(() => inputRef.current?.focus(), 500)
  }

  function submitPhone() {
    const cleanNumber = inputValue.replace(/\D/g, '')
    if (cleanNumber.length < 7) {
      setPhoneError(true)
      return
    }
    setPhoneError(false)
    const full = `${countryCode}${cleanNumber}`
    setPhone(full)
    setMessages(prev => [...prev, { from: 'user', text: `${countryCode} ${cleanNumber}` }])
    setInputValue('')
    setStep('category')
    pushBotMessage(t.askCategory)
  }

  function pickCategory(cat: WCat) {
    const catLabel = W_CATS(locale).find(c => c.id === cat)?.label ?? cat
    setMessages(prev => [...prev, { from: 'user', text: catLabel }])
    setWCat(cat)
    setWSvc(null)
    setWPriceIdx(0)
    setWDay(null)
    setStep('svc')
    pushBotMessage(t.askSvc)
  }

  function pickSvc(s: WSvc) {
    setMessages(prev => [...prev, { from: 'user', text: s.name }])
    setWSvc(s)
    setWPriceIdx(0)
    if (s.prices.length <= 1) {
      setStep('date')
      pushBotMessage(t.askDate)
    } else {
      setStep('dur')
      pushBotMessage(t.askDur)
    }
  }

  function pickDur(idx: number) {
    const optLabel = wSvc?.prices[idx]?.label ?? ''
    const optPrice = wSvc?.prices[idx]?.value ? ` (${wFmtPrice(wSvc.prices[idx].value)})` : ''
    setMessages(prev => [...prev, { from: 'user', text: `${optLabel}${optPrice}` }])
    setWPriceIdx(idx)
    setStep('date')
    pushBotMessage(t.askDate)
  }

  function pickDay(d: number) {
    setWDay(d)
    const ds = new Date(wCalY, wCalMo, d).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'es-CO',
      { weekday: 'long', day: 'numeric', month: 'long' }
    )
    setMessages(prev => [...prev, { from: 'user', text: ds }])
    setStep('time')
    pushBotMessage(t.askTime)
  }

  function pickTime(slot: string) {
    setMessages(prev => [...prev, { from: 'user', text: slot }])
    setStep('closing')
    pushBotMessage(t.closing, 300)
    setTimeout(() => finalizeConnect(phone, wSvc?.name ?? null, slot), 900)
  }

  function talkAdvisor() {
    if (submittingRef.current) return
    submittingRef.current = true

    setMessages(prev => [...prev, { from: 'user', text: t.talkAdvisor }])
    pushBotMessage(t.talkAdvisorConnecting, 300)

    let gclid = '', adgroup = '', campaign = '', isAds = false
    try {
      const p = new URLSearchParams(window.location.search)
      gclid = p.get('gclid') || p.get('wbraid') || p.get('gbraid') || sessionStorage.getItem('gclid') || ''
      adgroup = p.get('adgroup') || sessionStorage.getItem('sem_adgroup') || ''
      campaign = p.get('utm_campaign') || sessionStorage.getItem('sem_campaign') || ''
      if (gclid || adgroup || campaign || p.get('utm_source') === 'ads' || p.get('utm_medium') === 'cpc' || sessionStorage.getItem('sem_trigger_key')) isAds = true
    } catch { /* ignore */ }

    trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source: 'landing_chat_advisor' })
    pushEvent('whatsapp_click', {
      source: 'landing_chat_widget', button: 'talk_advisor', locale,
      ...(gclid ? { gclid } : {}), ...(adgroup ? { adgroup } : {}), ...(campaign ? { campaign } : {}),
    })
    if (isAds) {
      pushEvent('whatsapp_lead_ads', {
        source: 'landing_chat_widget', button: 'talk_advisor', locale,
        ...(gclid ? { gclid } : {}), ...(adgroup ? { adgroup } : {}),
      })
    }

    // Save lead
    if (phone || isAds) {
      try {
        const body = JSON.stringify({
          phone: phone || undefined,
          name: name.trim() || undefined,
          requests: locale === 'en' ? 'Talk to an advisor' : 'Hablar con un asesor',
          gclid: gclid || undefined,
          adgroup: adgroup || undefined,
          campaign: campaign || undefined,
          source: isAds ? 'ads' : 'organic',
          locale,
        })
        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/whatsapp-lead', new Blob([body], { type: 'application/json' }))
        } else {
          fetch('/api/whatsapp-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
        }
      } catch { /* silent */ }
    }

    const greet = locale === 'en'
      ? 'Hello, I would like to speak with an advisor at Diamond Spa.'
      : 'Hola, me gustaría hablar con un asesor de Diamond Spa.'
    const namePart = name.trim() ? (locale === 'en' ? ` My name is ${name.trim()}.` : ` Mi nombre es ${name.trim()}.`) : ''
    const msg = `${greet}${namePart}`

    setTimeout(() => {
      window.open(randomWhatsAppUrl(msg), '_blank', 'noopener,noreferrer')
      submittingRef.current = false
      onClose()
    }, 700)
  }

  async function finalizeConnect(fullPhone: string, service: string | null, timeSlot?: string, skippedAll = false) {
    if (submittingRef.current) return
    submittingRef.current = true

    let gclid = '', adgroup = '', campaign = '', isAds = false
    try {
      const p = new URLSearchParams(window.location.search)
      gclid = p.get('gclid') || p.get('wbraid') || p.get('gbraid') || sessionStorage.getItem('gclid') || ''
      adgroup = p.get('adgroup') || sessionStorage.getItem('sem_adgroup') || ''
      campaign = p.get('utm_campaign') || sessionStorage.getItem('sem_campaign') || ''
      if (gclid || adgroup || campaign || p.get('utm_source') === 'ads' || p.get('utm_medium') === 'cpc' || sessionStorage.getItem('sem_trigger_key')) isAds = true
    } catch { /* ignore */ }

    trackEvent(EVENTS.WHATSAPP_CLICKED, { platform: 'whatsapp', source: 'landing_chat_widget' })
    pushEvent('whatsapp_click', {
      source: 'landing_chat_widget', button: 'chat_widget', locale,
      ...(gclid ? { gclid } : {}), ...(adgroup ? { adgroup } : {}), ...(campaign ? { campaign } : {}),
    })
    if (isAds) {
      pushEvent('whatsapp_lead_ads', {
        source: 'landing_chat_widget', button: 'chat_widget', locale,
        ...(gclid ? { gclid } : {}), ...(adgroup ? { adgroup } : {}),
      })
    }

    if (!skippedAll && service) {
      pushEvent('booking_submit', {
        source: isAds ? 'ads' : 'organic',
        locale,
        ...(gclid ? { gclid } : {}),
        ...(adgroup ? { adgroup } : {}),
        ...(campaign ? { campaign } : {}),
      })
      trackEvent(EVENTS.BOOKING_SUBMITTED, {
        service_id: wSvc?.id ?? 'custom',
        service_name: service,
        category: wCat ?? 'masajes',
        duration_minutes: durMinutes,
        price_cop: wSvc?.prices[wPriceIdx]?.value ?? 0,
        locale,
      })
    }

    if (fullPhone || isAds) {
      try {
        const durLabel = wSvc?.prices[wPriceIdx]?.label
        const priceVal = wSvc?.prices[wPriceIdx]?.value ?? 0
        const dateKey = wDay
          ? `${wCalY}-${String(wCalMo + 1).padStart(2, '0')}-${String(wDay).padStart(2, '0')}`
          : undefined
        const dateStr = wDay
          ? new Date(wCalY, wCalMo, wDay).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
          : undefined
        const parts = [service, durLabel, dateStr, timeSlot].filter(Boolean)
        const body = JSON.stringify({
          phone: fullPhone || undefined,
          name: name.trim() || undefined,
          serviceName: service || undefined,
          serviceId: wSvc?.id || undefined,
          priceCop: priceVal || undefined,
          dateKey,
          timeSlot: timeSlot || undefined,
          durationMinutes: durMinutes || undefined,
          requests: parts.length ? parts.join(' · ') : undefined,
          gclid: gclid || undefined,
          adgroup: adgroup || undefined,
          campaign: campaign || undefined,
          source: isAds ? 'ads' : 'organic',
          locale,
        })
        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/whatsapp-lead', new Blob([body], { type: 'application/json' }))
        } else {
          fetch('/api/whatsapp-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
        }
      } catch { /* silent */ }
    }

    let message = customText
    if (!message) {
      const greeting = isAds
        ? (locale === 'en' ? 'Hello, I saw your Google ad and would like more information to book.' : 'Hola, vi su anuncio en Google y me gustaría más información para reservar.')
        : (locale === 'en' ? 'Hello, I would like to book an appointment with reception.' : 'Hola, me gustaría agendar una cita con recepción.')
      const extras: string[] = []
      if (!skippedAll) {
        if (name.trim()) extras.push(locale === 'en' ? `My name is ${name.trim()}.` : `Mi nombre es ${name.trim()}.`)
        if (service) extras.push(locale === 'en' ? `I'm interested in: ${service}.` : `Me interesa: ${service}.`)
        const durLabel = wSvc?.prices[wPriceIdx]?.label
        if (durLabel) extras.push(locale === 'en' ? `Option: ${durLabel}.` : `Opción: ${durLabel}.`)
        if (wDay) {
          const ds = new Date(wCalY, wCalMo, wDay).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
          extras.push(locale === 'en' ? `Date: ${ds}.` : `Fecha: ${ds}.`)
        }
        if (timeSlot) extras.push(locale === 'en' ? `Time: ${timeSlot}.` : `Hora: ${timeSlot}.`)
      }
      message = extras.length ? `${greeting} ${extras.join(' ')}` : greeting
    }

    window.open(randomWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
    submittingRef.current = false
    onClose()
  }

  function skipAll() {
    finalizeConnect('', null, undefined, true)
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (step === 'name') submitName()
    else if (step === 'phone') submitPhone()
  }

  if (!isOpen) return null

  const durMinutes = wSvc ? (wSvc.prices.length <= 1 ? wSvc.durMin : (wSvc.prices[wPriceIdx]?.label?.match(/(\d+)\s*min/i)?.[1] ? Number(wSvc.prices[wPriceIdx].label.match(/(\d+)\s*min/i)![1]) : wSvc.durMin)) : 60

  return (
    <>
      {/* Cuadro de diálogo de chat estilo Messenger/WhatsApp:
          SIEMPRE el mismo tamaño fijo (360×520px), anclado en la esquina inferior derecha.
          En pantallas < 400px se adapta con min() pero NUNCA ocupa toda la pantalla.
          Sin fondo oscuro en desktop. Solo un tenue overlay sin bloqueo de página. */}
      <div
        className="fixed bottom-4 right-4 z-[110]"
        style={{ width: 'min(360px, calc(100vw - 2rem))', height: '520px' }}
        role="dialog"
        aria-label="Chat Diamond Spa"
      >
        <div
          className="w-full h-full bg-[#001524] border border-[#a5cce6]/30 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.60)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-250 ease-out"
          onClick={e => e.stopPropagation()}
        >
        {/* Header estilo ventana de chat */}
        <div className="flex flex-col bg-[#0b2131] border-b border-outline-variant/15 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-[#001524] flex-shrink-0 shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </span>
              <div>
                <p className="font-label text-sm font-semibold tracking-wide text-on-surface leading-tight">
                  {t.headerTitle}
                </p>
                <p className="text-[11px] text-[#34d399] leading-tight font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] inline-block animate-pulse" />
                  {t.headerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Minimizar"
                title="Minimizar"
                className="text-on-surface/50 hover:text-on-surface text-lg p-1.5 leading-none rounded-lg hover:bg-white/10 transition-colors"
              >
                ⌄
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                title={t.close}
                className="text-on-surface/50 hover:text-on-surface text-base p-1.5 leading-none rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Historial de la conversación, en burbujas */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] px-3.5 py-2.5 text-sm font-body leading-relaxed whitespace-pre-line rounded-2xl ${
                  m.from === 'user'
                    ? 'bg-[#25D366] text-[#031f0f] rounded-br-sm font-medium shadow-sm'
                    : 'bg-[#0b2131] text-on-surface rounded-bl-sm border border-outline-variant/20 shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#0b2131] border border-outline-variant/20 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-on-surface/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Paso 3: Categoría ── */}
          {step === 'category' && !isTyping && (
            <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
              <div className="flex flex-wrap gap-2">
                {W_CATS(locale).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCategory(c.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-body bg-transparent text-on-surface/90 border border-[#a5cce6]/40 hover:bg-[#a5cce6]/15 hover:border-[#a5cce6] transition-colors active:scale-95"
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Botón hablar con un asesor (directo a WhatsApp con nombre y teléfono) */}
              <button
                type="button"
                onClick={talkAdvisor}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-body text-[#25D366] border border-[#25D366]/50 bg-[#25D366]/5 hover:bg-[#25D366]/15 transition-colors w-full mt-1 font-medium active:scale-98 shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>{t.talkAdvisor}</span>
              </button>
            </div>
          )}

          {/* ── Paso 4: Subcategoría / Servicio específico ── */}
          {step === 'svc' && !isTyping && wCat && (
            <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in duration-200">
              {W_SVCS(locale)
                .filter(s => s.cat === wCat)
                .map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickSvc(s)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-body bg-[#0b2131] text-on-surface/90 border border-[#a5cce6]/40 hover:bg-[#a5cce6]/15 hover:border-[#a5cce6] transition-colors active:scale-95"
                  >
                    {s.name}
                  </button>
                ))}
            </div>
          )}

          {/* ── Paso 5: Duración / Precio ── */}
          {step === 'dur' && !isTyping && wSvc && (
            <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in duration-200">
              {wSvc.prices.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickDur(i)}
                  className="flex flex-col items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-body bg-[#0b2131] text-on-surface/90 border border-[#a5cce6]/40 hover:bg-[#a5cce6]/15 hover:border-[#a5cce6] transition-colors active:scale-95 shadow-sm"
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-[#4a9fd4] text-xs mt-0.5 font-medium">{wFmtPrice(p.value)}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Paso 6: Calendario ── */}
          {step === 'date' && !isTyping && (
            <div className="pt-1 bg-[#0b2131]/60 p-3 rounded-2xl border border-outline-variant/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2 px-1">
                <button
                  type="button"
                  disabled={wCalY === _now.y && wCalMo === _now.mo}
                  onClick={() => {
                    if (wCalMo === 0) {
                      setWCalY(y => y - 1)
                      setWCalMo(11)
                    } else setWCalMo(m => m - 1)
                  }}
                  className="text-on-surface/70 hover:text-on-surface disabled:opacity-20 disabled:hover:text-on-surface/70 px-2 py-1 rounded-md text-base transition-colors"
                >
                  ‹
                </button>
                <span className="text-xs font-semibold text-on-surface/90">
                  {t.months[wCalMo]} {wCalY}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (wCalMo === 11) {
                      setWCalY(y => y + 1)
                      setWCalMo(0)
                    } else setWCalMo(m => m + 1)
                  }}
                  className="text-on-surface/70 hover:text-on-surface px-2 py-1 rounded-md text-base transition-colors"
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1.5">
                {t.days.map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold text-on-surface/50 py-0.5">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {wCal(wCalY, wCalMo).map((day, i) => {
                  if (!day) return <div key={i} />
                  const past = wPast(wCalY, wCalMo, day, durMinutes)
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={past}
                      onClick={() => pickDay(day)}
                      className={`mx-auto w-8 h-8 rounded-full text-xs font-body flex items-center justify-center transition-all ${
                        past
                          ? 'text-on-surface/20 cursor-not-allowed'
                          : 'text-on-surface/90 bg-[#071d2d]/80 hover:bg-[#a5cce6]/25 hover:text-primary active:scale-90 font-medium'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Paso 7: Horarios disponibles ── */}
          {step === 'time' && !isTyping && wDay && (() => {
            const slots = wAvail(wCalY, wCalMo, wDay, durMinutes)
            return (
              <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
                {slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {slots.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => pickTime(s)}
                        className="px-3.5 py-2 rounded-xl text-xs font-body bg-[#0b2131] text-on-surface/90 border border-[#a5cce6]/40 hover:bg-[#a5cce6]/20 hover:border-[#a5cce6] transition-colors active:scale-95 font-medium shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-3 bg-[#0b2131]/60 rounded-xl border border-outline-variant/20 text-center">
                    <p className="text-xs text-on-surface/60 italic">{t.noSlots}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setWDay(null)
                        setStep('date')
                      }}
                      className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {t.changeDay}
                    </button>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Entrada activa (nombre o teléfono) */}
        {(step === 'name' || step === 'phone') && (
          <div className="flex-shrink-0 border-t border-outline-variant/15 px-4 py-3 bg-[#071d2d]/60">
            <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-[#071d2d]/90 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all overflow-hidden pl-1">
              {step === 'phone' && (
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  aria-label="Country code"
                  className="bg-transparent text-xs font-label text-on-surface pl-2.5 pr-0.5 py-2.5 outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code} className="bg-[#0b2131]">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              )}
              <input
                ref={inputRef}
                type={step === 'phone' ? 'tel' : 'text'}
                inputMode={step === 'phone' ? 'numeric' : 'text'}
                autoComplete={step === 'phone' ? 'tel' : 'name'}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                  if (step === 'phone') setPhoneError(false)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={step === 'phone' ? t.phonePlaceholder : t.namePlaceholder}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm font-body text-on-surface placeholder:text-on-surface/30 outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => (step === 'name' ? submitName() : submitPhone())}
                aria-label="Enviar"
                className="w-9 h-9 mr-1 rounded-full bg-[#25D366] hover:bg-[#22bf5b] text-[#001524] flex items-center justify-center flex-shrink-0 transition-colors active:scale-95 shadow-md"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transform rotate-45 -translate-y-0.5 translate-x-0.5" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {phoneError && (
              <p className="text-[11px] text-[#f87171] mt-1.5 pl-2">{t.invalidPhone}</p>
            )}

            {step === 'name' && (
              <button
                type="button"
                onClick={() => submitName('')}
                className="text-[11px] text-outline/70 hover:text-primary mt-1.5 pl-2 underline underline-offset-2 transition-colors"
              >
                {t.skipName}
              </button>
            )}
          </div>
        )}

        {/* Salida rápida a WhatsApp disponible en cualquier momento */}
        {step !== 'closing' && (
          <div className="flex-shrink-0 text-center pb-2.5 pt-1 border-t border-outline-variant/10 bg-[#001524]">
            <button
              type="button"
              onClick={skipAll}
              className="text-[10.5px] font-label text-outline/70 hover:text-primary transition-colors underline underline-offset-4 tracking-wider"
            >
              {t.skipAll}
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
