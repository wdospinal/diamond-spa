import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendBooking, readBookings } from '@/lib/bookings-store'
import { readLedger } from '@/lib/ledger-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getServiceById } from '@/lib/services'
import { parseTimeSlot } from '@/lib/parse-time-slot'
import { computeDashboardStats } from '@/lib/income-stats'

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
  return NextResponse.json({ bookings: sorted, ledger: ledgerSorted, stats })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
  const year = typeof body.year === 'number' ? body.year : Number(body.year)
  const monthIndex = typeof body.monthIndex === 'number' ? body.monthIndex : Number(body.monthIndex)
  const day = typeof body.day === 'number' ? body.day : Number(body.day)
  const timeSlot = typeof body.timeSlot === 'string' ? body.timeSlot : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const requests = typeof body.requests === 'string' ? body.requests.trim() : ''

  if (!getServiceById(serviceId)) return bad('Invalid service')
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return bad('Invalid year')
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return bad('Invalid month')
  if (!Number.isInteger(day) || day < 1 || day > 31) return bad('Invalid day')
  if (!parseTimeSlot(timeSlot)) return bad('Invalid time')
  if (!firstName || !lastName || !email || !phone) return bad('Missing contact fields')

  const service = getServiceById(serviceId)!
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
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      firstName,
      lastName,
      email,
      phone,
      requests: requests || undefined,
    })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('bookings write failed', e)
    return NextResponse.json(
      { error: 'Could not save booking. If you deploy to serverless hosting, configure persistent storage or BOOKINGS_FILE.' },
      { status: 503 }
    )
  }
}
