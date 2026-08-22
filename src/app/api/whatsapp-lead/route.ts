import { NextRequest, NextResponse } from 'next/server'
import { appendBooking } from '@/lib/bookings-store'
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { readSubscriptions } from '@/lib/push-store'
import { ensureWebPush, webpush } from '@/lib/web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '').trim()
  if (!cleaned) return ''
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('57') && cleaned.length === 12) return `+${cleaned}`
  // Standard 10-digit Colombian mobile (e.g. 3123456789)
  if (cleaned.length === 10 && cleaned.startsWith('3')) return `+57${cleaned}`
  return `+${cleaned}`
}

export async function POST(req: NextRequest) {
  // Generous limit: 10 per minute per IP to avoid spamming the database
  const limit = await rateLimit('whatsapp-lead', clientIp(req), 10, 60)
  if (!limit.ok) return tooManyRequests(limit.retryAfter)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const phone = normalizePhone(rawPhone)

  if (!phone || phone.length < 8) {
    return NextResponse.json({ error: 'Número de teléfono inválido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : undefined
  const gclid = typeof body.gclid === 'string' && body.gclid.trim() ? body.gclid.trim() : undefined
  const adgroup = typeof body.adgroup === 'string' && body.adgroup.trim() ? body.adgroup.trim() : undefined
  const campaign = typeof body.campaign === 'string' && body.campaign.trim() ? body.campaign.trim() : undefined
  const source = (gclid || adgroup || body.source === 'ads') ? ('ads' as const) : ('organic' as const)

  const now = new Date()
  const dateKey = now.toISOString().slice(0, 10)
  const timeSlot = now.toTimeString().slice(0, 5)

  try {
    const row = await appendBooking({
      dateKey,
      timeSlot,
      scheduledAt: now.toISOString(),
      serviceId: 'whatsapp-lead',
      serviceName: 'Lead WhatsApp (Recepción Directa)',
      durationMinutes: null,
      priceCop: 0,
      price: 0,
      duration: 'N/A',
      name,
      phone,
      requests: campaign ? `Campaña: ${campaign}` : undefined,
      source,
      status: 'pending',
      paymentStatus: 'pending',
      ...(gclid ? { gclid } : {}),
      ...(adgroup ? { adgroup } : {}),
    })

    // Enviar notificación Push a los dispositivos admin suscritos
    if (ensureWebPush()) {
      try {
        const subs = await readSubscriptions()
        const payload = JSON.stringify({
          title: '💬 Nuevo Lead de WhatsApp',
          body: `${name || 'Cliente'} (${phone}) conectó desde ${source === 'ads' ? 'Google Ads' : 'la web'}.`,
          icon: '/favicon.png',
        })

        await Promise.all(
          subs.map(sub =>
            webpush.sendNotification(sub, payload).catch(err => {
              console.error('Error al enviar push de lead WhatsApp:', err)
            }),
          ),
        )
      } catch (pushErr) {
        console.error('Error procesando suscripciones push:', pushErr)
      }
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch (err) {
    console.error('Error al guardar lead de WhatsApp:', err)
    return NextResponse.json({ error: 'No se pudo registrar el lead' }, { status: 500 })
  }
}
