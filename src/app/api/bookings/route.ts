import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendBooking, readBookings } from '@/lib/bookings-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'
import { parseTimeSlot } from '@/lib/parse-time-slot'
import { copPerUsd } from '@/lib/cop-rate'
import { SPA_EMAIL } from '@/lib/spa'
import { readSubscriptions } from '@/lib/push-store'
import { ensureWebPush, webpush } from '@/lib/web-push'

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET() {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await readBookings()
  const sorted = [...bookings].sort((a, b) => {
    const da = a.dateKey.localeCompare(b.dateKey)
    if (da !== 0) return -da
    return (b.timeSlot || '').localeCompare(a.timeSlot || '')
  })
  return NextResponse.json({ bookings: sorted })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
  const durationMinutes = body.durationMinutes == null
    ? null
    : typeof body.durationMinutes === 'number'
      ? body.durationMinutes
      : Number(body.durationMinutes)
  const hairMethod = body.hairMethod === 'wax' ? 'wax' as const
    : body.hairMethod === 'machine' ? 'machine' as const
    : undefined
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

  const service = getServiceById(serviceId)
  if (!service) return bad('Invalid service')
  if (service.pricingModel === 'duration' && ![30, 60, 90].includes(durationMinutes as number)) {
    return bad('Invalid duration — must be 30, 60, or 90')
  }
  const priceCop = getServicePrice(serviceId, durationMinutes, hairMethod)
  if (priceCop == null) return bad('Invalid service/duration combination')

  if (!Number.isInteger(year) || year < 2020 || year > 2100) return bad('Invalid year')
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return bad('Invalid month')
  if (!Number.isInteger(day) || day < 1 || day > 31) return bad('Invalid day')
  if (!parseTimeSlot(timeSlot)) return bad('Invalid time')
  if (!name || !phone) return bad('Missing contact fields')

  const rate = copPerUsd()
  const priceUsd = priceCop / rate

  const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const { h, m } = parseTimeSlot(timeSlot)!
  const scheduledAt = new Date(
    `${dateKey}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-05:00`
  ).toISOString()

  try {
    const row = await appendBooking({
      dateKey,
      timeSlot,
      scheduledAt,
      serviceId: service.id,
      serviceName: serviceDisplayName(service, bookingLocale),
      durationMinutes,
      hairMethod,
      priceCop,
      price: priceUsd,
      duration: durationMinutes ? `${durationMinutes} min` : hairMethod ?? 'flat',
      name,
      email: email || undefined,
      phone,
      requests: requests || undefined,
    })

    // Fire-and-forget email notification via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const priceFmt = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(priceCop)
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Diamond Spa <reserva@zanacode.com>',
          to: [SPA_EMAIL],
          subject: `[Diamond Spa] Nueva reserva — ${name}`,
          html: `<h2 style="color:#1a1a1a">Nueva Reserva — Diamond Spa</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;color:#333">
  <tr><td style="padding:6px 12px;font-weight:bold">Servicio</td><td style="padding:6px 12px">${serviceDisplayName(service, bookingLocale)}${durationMinutes ? ` (${durationMinutes} min)` : ''}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Fecha</td><td style="padding:6px 12px">${dateKey} a las ${timeSlot}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Cliente</td><td style="padding:6px 12px">${name}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Teléfono</td><td style="padding:6px 12px">${phone}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Precio</td><td style="padding:6px 12px">${priceFmt}</td></tr>
  ${requests ? `<tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Notas</td><td style="padding:6px 12px">${requests}</td></tr>` : ''}
</table>
<p style="color:#888;font-size:11px;margin-top:16px">ID: ${row.id}</p>`,
        }),
      }).catch(err => console.error('Resend email error:', err))
    }

    // Enviar Notificación Push a los admins si VAPID está configurado
    if (ensureWebPush()) {
      try {
        const subs = await readSubscriptions()
        const payload = JSON.stringify({
          title: '¡Nueva Reserva Recibida!',
          body: `${name} reservó ${service.name} para el ${dateKey} a las ${timeSlot}.`,
          icon: '/favicon.ico'
        })

        const pushPromises = subs.map(sub => 
          webpush.sendNotification(sub, payload).catch(err => {
            console.error('Error al enviar push de nueva reserva:', err)
          })
        )
        await Promise.all(pushPromises)
      } catch (pushErr) {
        console.error('Error procesando suscripciones push:', pushErr)
      }
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
