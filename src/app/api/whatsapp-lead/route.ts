import { NextRequest, NextResponse } from 'next/server'
import { appendBooking, findRecentBookingByPhone } from '@/lib/bookings-store'
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
  const phone = rawPhone ? normalizePhone(rawPhone) : ''

  // Phone is optional — if the visitor skipped that step in the bridge modal,
  // we still record the lead so the gclid/adgroup attribution isn't lost.
  // Staff can fill in the phone later from the LeadDetailModal in the Kanban
  // once they get it from the real WhatsApp conversation. If a phone WAS
  // provided, it still has to look valid.
  if (rawPhone && (!phone || phone.length < 8)) {
    return NextResponse.json({ error: 'Número de teléfono inválido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : undefined
  const gclid = typeof body.gclid === 'string' && body.gclid.trim() ? body.gclid.trim() : undefined
  const adgroup = typeof body.adgroup === 'string' && body.adgroup.trim() ? body.adgroup.trim() : undefined
  const campaign = typeof body.campaign === 'string' && body.campaign.trim() ? body.campaign.trim() : undefined
  const source = (gclid || adgroup || body.source === 'ads') ? ('ads' as const) : ('organic' as const)

  const now = new Date()
  const dateKey = typeof body.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey) ? body.dateKey : now.toISOString().slice(0, 10)
  const timeSlot = typeof body.timeSlot === 'string' && body.timeSlot.trim() ? body.timeSlot.trim() : now.toTimeString().slice(0, 5)
  const serviceName = typeof body.serviceName === 'string' && body.serviceName.trim() ? body.serviceName.trim() : 'Lead WhatsApp (Recepción Directa)'
  const serviceId = typeof body.serviceId === 'string' && body.serviceId.trim() ? body.serviceId.trim() : 'whatsapp-lead'
  const priceCop = typeof body.priceCop === 'number' && body.priceCop > 0 ? body.priceCop : 0
  const durationMinutes = typeof body.durationMinutes === 'number' && body.durationMinutes > 0 ? body.durationMinutes : null

  // Candado anti-duplicados: si este mismo teléfono ya generó un lead de
  // WhatsApp en los últimos 5 minutos, es casi con certeza un reintento del
  // mismo visitante (doble toque, o volvió a tocar el botón al no ver
  // confirmación clara) — no un lead nuevo. Se reutiliza el registro
  // existente en vez de crear uno duplicado.
  if (phone) {
    try {
      const recent = await findRecentBookingByPhone(phone, 5)
      if (recent) {
        return NextResponse.json({ ok: true, id: recent.id, deduped: true })
      }
    } catch (err) {
      console.error('Error revisando duplicados de WhatsApp lead:', err)
      // Si la revisión falla, seguimos con el flujo normal — mejor un
      // duplicado ocasional que perder el lead por completo.
    }
  }

  try {
    const row = await appendBooking({
      dateKey,
      timeSlot,
      scheduledAt: now.toISOString(),
      serviceId,
      serviceName,
      durationMinutes,
      priceCop,
      price: priceCop ? Math.round(priceCop / 4000) : 0,
      duration: durationMinutes ? `${durationMinutes} min` : 'N/A',
      name,
      phone,
      requests: [
        campaign ? `Campaña: ${campaign}` : null,
        !phone ? '⚠ Sin teléfono — el visitante saltó ese paso. Complétalo aquí cuando lo obtengas de la conversación real de WhatsApp.' : null,
      ].filter(Boolean).join(' · ') || undefined,
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
        const contactLine = phone ? phone : 'sin número — revisar en el Kanban'
        const payload = JSON.stringify({
          title: '💬 Nuevo Lead de WhatsApp',
          body: `${name || 'Cliente'} (${contactLine}) conectó desde ${source === 'ads' ? 'Google Ads' : 'la web'}.`,
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
