import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendBooking, readBookings } from '@/lib/bookings-store'
import { readLedger, isLedgerSeedApplied } from '@/lib/ledger-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { EXPENSE_CATEGORIES } from '@/lib/expense-categories'
import { getServiceById, getServicePrice, serviceDisplayName } from '@/lib/services'
import { parseTimeSlot } from '@/lib/parse-time-slot'
import { computeDashboardStats } from '@/lib/income-stats'
import { copPerUsd } from '@/lib/cop-rate'

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET() {
  const token = cookies().get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [bookings, ledger] = await Promise.all([readBookings(), readLedger()])
  const sorted = [...bookings].sort((a, b) => {
    const da = a.dateKey.localeCompare(b.dateKey)
    if (da !== 0) return -da
    return (b.timeSlot || '').localeCompare(a.timeSlot || '')
  })
  const ledgerSorted = [...ledger].sort((a, b) => {
    const d = b.dateKey.localeCompare(a.dateKey)
    if (d !== 0) return d
    return b.createdAt.localeCompare(a.createdAt)
  })
  const stats = computeDashboardStats(bookings, ledger)
  return NextResponse.json({
    bookings: sorted,
    ledger: ledgerSorted,
    stats,
    expenseCategories: EXPENSE_CATEGORIES,
    seedExpensesDone: isLedgerSeedApplied(),
  })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
  const durationMinutes = typeof body.durationMinutes === 'number'
    ? body.durationMinutes
    : Number(body.durationMinutes)
  const year = typeof body.year === 'number' ? body.year : Number(body.year)
  const monthIndex = typeof body.monthIndex === 'number' ? body.monthIndex : Number(body.monthIndex)
  const day = typeof body.day === 'number' ? body.day : Number(body.day)
  const timeSlot = typeof body.timeSlot === 'string' ? body.timeSlot : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const requests = typeof body.requests === 'string' ? body.requests.trim() : ''
  const bookingLocale = body.locale === 'en' ? 'en' : 'es'

  const service = getServiceById(serviceId)
  if (!service) return bad('Invalid service')
  if (![30, 60, 90].includes(durationMinutes)) return bad('Invalid duration — must be 30, 60, or 90')
  const priceCop = getServicePrice(serviceId, durationMinutes)
  if (priceCop == null) return bad('Invalid service/duration combination')

  if (!Number.isInteger(year) || year < 2020 || year > 2100) return bad('Invalid year')
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return bad('Invalid month')
  if (!Number.isInteger(day) || day < 1 || day > 31) return bad('Invalid day')
  if (!parseTimeSlot(timeSlot)) return bad('Invalid time')
  if (!firstName || !lastName || !email || !phone) return bad('Missing contact fields')

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
      priceCop,
      price: priceUsd,
      duration: `${durationMinutes} min`,
      firstName,
      lastName,
      email,
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
          to: ['mialedasate1@gmail.com'],
          subject: `[Diamond Spa] Nueva reserva — ${firstName} ${lastName}`,
          html: `<h2 style="color:#1a1a1a">Nueva Reserva — Diamond Spa</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;color:#333">
  <tr><td style="padding:6px 12px;font-weight:bold">Servicio</td><td style="padding:6px 12px">${serviceDisplayName(service, bookingLocale)} (${durationMinutes} min)</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Fecha</td><td style="padding:6px 12px">${dateKey} a las ${timeSlot}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Cliente</td><td style="padding:6px 12px">${firstName} ${lastName}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px">${email}</td></tr>
  <tr><td style="padding:6px 12px;font-weight:bold">Teléfono</td><td style="padding:6px 12px">${phone}</td></tr>
  <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:bold">Precio</td><td style="padding:6px 12px">${priceFmt}</td></tr>
  ${requests ? `<tr><td style="padding:6px 12px;font-weight:bold">Notas</td><td style="padding:6px 12px">${requests}</td></tr>` : ''}
</table>
<p style="color:#888;font-size:11px;margin-top:16px">ID: ${row.id}</p>`,
        }),
      }).catch(err => console.error('Resend email error:', err))
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('bookings write failed', e)
    return NextResponse.json(
      { error: 'Could not save booking. If you deploy to serverless hosting, configure persistent storage or BOOKINGS_FILE.' },
      { status: 503 }
    )
  }
}
