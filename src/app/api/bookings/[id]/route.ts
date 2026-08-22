import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { updateBooking, deleteBooking } from '@/lib/bookings-store'
import type { BookingRecord } from '@/lib/booking-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload: Partial<BookingRecord> = {}

  if (typeof body.name === 'string') payload.name = body.name.trim()
  if (typeof body.phone === 'string') payload.phone = body.phone.trim()
  if (typeof body.email === 'string') payload.email = body.email.trim()
  if (typeof body.serviceId === 'string') payload.serviceId = body.serviceId
  if (typeof body.serviceName === 'string') payload.serviceName = body.serviceName.trim()
  if (typeof body.priceCop === 'number') payload.priceCop = body.priceCop
  else if (typeof body.priceCop === 'string' && body.priceCop.trim()) payload.priceCop = Number(body.priceCop) || 0
  if (typeof body.dateKey === 'string') payload.dateKey = body.dateKey.trim()
  if (typeof body.timeSlot === 'string') payload.timeSlot = body.timeSlot.trim()
  if (typeof body.requests === 'string') payload.requests = body.requests.trim()

  if (['pending', 'contacted', 'arrived', 'cancelled', 'completed'].includes(body.status as string)) {
    payload.status = body.status as BookingRecord['status']
  }
  if (['pending', 'paid'].includes(body.paymentStatus as string)) {
    payload.paymentStatus = body.paymentStatus as BookingRecord['paymentStatus']
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const ok = await updateBooking(id, payload)
  if (!ok) {
    return NextResponse.json({ error: 'Booking not found or could not be updated' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ok = await deleteBooking(id)
  if (!ok) {
    return NextResponse.json({ error: 'Booking not found or could not be deleted' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
