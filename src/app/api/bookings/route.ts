import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendBooking, readBookings, updateBooking } from '@/lib/bookings-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'
import { parseTimeSlot } from '@/lib/parse-time-slot'
import { copPerUsd } from '@/lib/cop-rate'
import { SPA_EMAIL } from '@/lib/spa'
import { readSubscriptions } from '@/lib/push-store'
import { ensureWebPush, webpush } from '@/lib/web-push'
import { sendBusinessSms } from '@/lib/twilio-sms'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { sortBookingsForAdmin } from '@/lib/booking-types'

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET() {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Mismo orden que el stream SSE (`/api/bookings/stream`), para que la carga
  // inicial y las actualizaciones en vivo no barajen las tarjetas.
  const sorted = sortBookingsForAdmin(await readBookings())
  return NextResponse.json({ bookings: sorted })
}

export async function POST(req: NextRequest) {
  // Each accepted booking fans out to an SMS (billed), an email and a push
  // broadcast, so cap how fast one client can trigger that.
  const limit = await rateLimit('booking', clientIp(req), 5, 600)
  if (!limit.ok) return tooManyRequests(limit.retryAfter, 'Demasiadas reservas. Intenta de nuevo en unos minutos.')

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  // Two-phase capture: the wizard calls this once with no date/time right
  // after name+phone (creates a minimal "Por confirmar" lead so an abandoned
  // calendar step still leaves a recoverable record), then again with the
  // real date/time — passing back `id` so we UPDATE that same row instead of
  // creating a duplicate. `id` absent + no date/time = old single-shot caller.
  const existingId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null

  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
  const durationMinutes = body.durationMinutes == null
    ? null
    : typeof body.durationMinutes === 'number'
      ? body.durationMinutes
      : Number(body.durationMinutes)
  const hairMethod = body.hairMethod === 'wax' ? 'wax' as const
    : body.hairMethod === 'machine' ? 'machine' as const
    : undefined

  const hasDateTime =
    body.year != null && body.monthIndex != null && body.day != null &&
    typeof body.timeSlot === 'string' && body.timeSlot.trim().length > 0

  const year = typeof body.year === 'number' ? body.year : Number(body.year)
  const monthIndex = typeof body.monthIndex === 'number' ? body.monthIndex : Number(body.monthIndex)
  const day = typeof body.day === 'number' ? body.day : Number(body.day)
  const timeSlot = typeof body.timeSlot === 'string' ? body.timeSlot : ''

  // The booking form sends a single `name`; older payloads sent firstName/lastName.
  const name = typeof body.name === 'string' && body.name.trim()
    ? body.name.trim()
    : [body.firstName, body.lastName].filter(s => typeof s === 'string').join(' ').trim()
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const requests = typeof body.requests === 'string' ? body.requests.trim() : ''
  const bookingLocale = body.locale === 'en' ? 'en' : 'es'
  const source = body.source === 'ads' ? 'ads' : 'organic'
  // Attribution fields — only present when the user arrived via a Google Ads click
  const gclid   = typeof body.gclid   === 'string' && body.gclid   ? body.gclid   : undefined
  const adgroup = typeof body.adgroup === 'string' && body.adgroup ? body.adgroup : undefined

  const service = getServiceById(serviceId)
  if (!service) return bad('Invalid service')
  if (service.pricingModel === 'duration' && ![30, 60, 90].includes(durationMinutes as number)) {
    return bad('Invalid duration — must be 30, 60, or 90')
  }
  const priceCop = getServicePrice(serviceId, durationMinutes, hairMethod)
  if (priceCop == null) return bad('Invalid service/duration combination')
  if (!name || !phone) return bad('Missing contact fields')

  let dateKey: string
  let finalTimeSlot: string
  let scheduledAt: string

  if (hasDateTime) {
    if (!Number.isInteger(year) || year < 2020 || year > 2100) return bad('Invalid year')
    if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return bad('Invalid month')
    if (!Number.isInteger(day) || day < 1 || day > 31) return bad('Invalid day')
    if (!parseTimeSlot(timeSlot)) return bad('Invalid time')
    dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const { h, m } = parseTimeSlot(timeSlot)!
    scheduledAt = new Date(
      `${dateKey}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-05:00`
    ).toISOString()
    finalTimeSlot = timeSlot
  } else {
    // Phase 1, or the "coordinate via WhatsApp" shortcut — no firm slot yet.
    const now = new Date()
    dateKey = now.toISOString().slice(0, 10)
    scheduledAt = now.toISOString()
    finalTimeSlot = 'Por confirmar'
  }

  const priceFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(priceCop)

  async function sendFullNotifications(bookingId: string) {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Diamond Spa <reserva@zanacode.com>',
          to: [SPA_EMAIL],
          subject: `[Diamond Spa] Nueva reserva — ${name}`,
          html: `<h2 style="color:#1a1a1a">Nueva Reserva — Diamond Spa</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;color:#333">
  <tr><td style="padding:6px 12px;font-weight:bold">Servicio</td><td style="padding:6px 12px">${serviceDisplayName(service!, bookingLocale)}${durationMinutes ? ` (${durationMinutes} min)` : ''}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Fecha</td><td style="padding:6px 12px">${dateKey} a las ${finalTimeSlot}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Cliente</td><td style="padding:6px 12px">${name}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Teléfono</td><td style="padding:6px 12px">${phone}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Precio</td><td style="padding:6px 12px">${priceFmt}</td></tr>
  ${requests ? `<tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Notas</td><td style="padding:6px 12px">${requests}</td></tr>` : ''}
</table>
<p style="color:#888;font-size:11px;margin-top:16px">ID: ${bookingId}</p>`,
        }),
      }).catch(err => console.error('Resend email error:', err))
    }

    // Se espera a propósito: en serverless el trabajo disparado y olvidado
    // puede morir al devolver la respuesta. sendBusinessSms nunca lanza.
    await sendBusinessSms(
      `[Diamond] ${serviceDisplayName(service!, bookingLocale)}` +
      `${durationMinutes ? ` (${durationMinutes} min)` : ''}` +
      ` · ${dateKey} ${finalTimeSlot} · ${name} · ${phone}`
    )

    if (ensureWebPush()) {
      try {
        const subs = await readSubscriptions()
        const payload = JSON.stringify({
          title: '¡Nueva Reserva Recibida!',
          body: `${name} reservó ${service!.name} para el ${dateKey} a las ${finalTimeSlot}.`,
          icon: '/favicon.ico',
        })
        await Promise.all(subs.map(sub => webpush.sendNotification(sub, payload).catch(err => {
          console.error('Error al enviar push de nueva reserva:', err)
        })))
      } catch (pushErr) {
        console.error('Error procesando suscripciones push:', pushErr)
      }
    }
  }

  async function sendLightPush() {
    if (!ensureWebPush()) return
    try {
      const subs = await readSubscriptions()
      const payload = JSON.stringify({
        title: '💬 Nuevo lead en el wizard',
        body: `${name} está reservando ${service!.name} — eligiendo fecha/hora ahora.`,
        icon: '/favicon.ico',
      })
      await Promise.all(subs.map(sub => webpush.sendNotification(sub, payload).catch(() => {})))
    } catch { /* best-effort */ }
  }

  try {
    // ── Phase 2: real date/time (or the "coordinate via WhatsApp" skip)
    // arriving for a lead created in phase 1 → update that same row.
    if (existingId) {
      const ok = await updateBooking(existingId, {
        dateKey,
        timeSlot: finalTimeSlot,
        scheduledAt,
        ...(requests ? { requests } : {}),
      })
      if (ok) {
        await sendFullNotifications(existingId)
        return NextResponse.json({ ok: true, id: existingId })
      }
      // existingId not found (edge case, e.g. storage fallback changed
      // between calls) — fall through and create a fresh row instead.
    }

    const row = await appendBooking({
      dateKey,
      timeSlot: finalTimeSlot,
      scheduledAt,
      serviceId: service.id,
      serviceName: serviceDisplayName(service, bookingLocale),
      durationMinutes,
      hairMethod,
      priceCop,
      price: priceCop / copPerUsd(),
      duration: durationMinutes ? `${durationMinutes} min` : hairMethod ?? 'flat',
      name,
      email: email || undefined,
      phone,
      requests: requests || undefined,
      source,
      status: 'pending',
      paymentStatus: 'pending',
      ...(gclid   ? { gclid }   : {}),
      ...(adgroup ? { adgroup } : {}),
    })

    if (hasDateTime) {
      await sendFullNotifications(row.id)
    } else {
      // Phase 1 — lightweight, free notification only. The paid SMS/email
      // fire once, on the phase-2 call that confirms real date/time.
      await sendLightPush()
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('bookings write failed', e)
    return NextResponse.json(
      { error: 'Could not save booking. Configure Vercel KV (KV_REST_API_URL/KV_REST_API_TOKEN) for durable storage.' },
      { status: 503 }
    )
  }
}
