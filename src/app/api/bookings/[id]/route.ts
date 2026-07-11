import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { updateBooking } from '@/lib/bookings-store'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: { status?: 'pending' | 'arrived' | 'cancelled' | 'completed'; paymentStatus?: 'pending' | 'paid' }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload: any = {}
  if (['pending', 'arrived', 'cancelled', 'completed'].includes(body.status as string)) {
    payload.status = body.status
  }
  if (['pending', 'paid'].includes(body.paymentStatus as string)) {
    payload.paymentStatus = body.paymentStatus
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
