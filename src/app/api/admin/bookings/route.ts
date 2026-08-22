import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendBooking } from '@/lib/bookings-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getServiceById, serviceDisplayName } from '@/lib/services'

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

/**
 * Admin-only endpoint to manually log a lead that arrived via WhatsApp
 * (floating button / header / fallback link) and therefore never went
 * through the public booking wizard, so it never created a BookingRecord.
 *
 * Deliberately more permissive than POST /api/bookings: no date/time-slot
 * validation, no SMS/email/push side effects — this is a backfill, not a
 * live reservation event. Requires an authenticated admin session.
 */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (!phone) return bad('Phone is required')

  const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
  const service = serviceId ? getServiceById(serviceId) : undefined

  const priceCop = typeof body.priceCop === 'number' ? body.priceCop
    : typeof body.priceCop === 'string' ? Number(body.priceCop) || 0
    : 0

  const status = ['pending', 'arrived', 'completed', 'cancelled'].includes(body.status as string)
    ? (body.status as 'pending' | 'arrived' | 'completed' | 'cancelled')
    : 'completed' // staff usually logs this after the fact, once the outcome is known
  const paymentStatus = body.paymentStatus === 'paid' ? 'paid' as const : 'pending' as const

  const gclid   = typeof body.gclid   === 'string' && body.gclid.trim()   ? body.gclid.trim()   : undefined
  const adgroup = typeof body.adgroup === 'string' && body.adgroup.trim() ? body.adgroup.trim() : undefined
  // A manually-logged lead only counts as 'ads' source if we actually have
  // attribution evidence (gclid or adgroup) — otherwise default to organic
  // rather than guessing, since staff may not always know the origin.
  const source = (gclid || adgroup) ? 'ads' as const : 'organic' as const

  const now = new Date()
  const dateKey = typeof body.dateKey === 'string' && body.dateKey
    ? body.dateKey
    : now.toISOString().slice(0, 10)
  const timeSlot = typeof body.timeSlot === 'string' && body.timeSlot
    ? body.timeSlot
    : now.toTimeString().slice(0, 5)

  try {
    const row = await appendBooking({
      dateKey,
      timeSlot,
      scheduledAt: now.toISOString(),
      serviceId: service?.id ?? 'whatsapp-lead',
      serviceName: service ? serviceDisplayName(service, 'es') : 'Lead de WhatsApp (sin servicio específico)',
      durationMinutes: null,
      priceCop,
      price: 0,
      duration: 'N/A',
      name: name || undefined,
      phone,
      requests: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : undefined,
      source,
      status,
      paymentStatus,
      ...(gclid   ? { gclid }   : {}),
      ...(adgroup ? { adgroup } : {}),
    })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('admin manual booking write failed', e)
    return NextResponse.json({ error: 'Could not save lead.' }, { status: 503 })
  }
}
