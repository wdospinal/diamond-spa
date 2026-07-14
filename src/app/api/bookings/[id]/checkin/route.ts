import { NextRequest, NextResponse } from 'next/server'
import { updateBooking, readBookings } from '@/lib/bookings-store'
import { readSubscriptions } from '@/lib/push-store'
import { ensureWebPush, webpush } from '@/lib/web-push'
import { bookingDisplayName } from '@/lib/booking-types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Obtener detalles de la reserva para el mensaje (opcional, pero útil)
  const bookings = await readBookings()
  const booking = bookings.find(b => b.id === id)
  
  if (!booking) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  // Actualizar estado
  const ok = await updateBooking(id, { status: 'arrived' })
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  // Enviar Notificación Push si VAPID está configurado
  if (ensureWebPush()) {
    const subs = await readSubscriptions()
    const name = bookingDisplayName(booking)
    const payload = JSON.stringify({
      title: '¡Cliente llegó!',
      body: `${name} ya está aquí para: ${booking.serviceName}`,
      icon: '/favicon.ico'
    })

    const pushPromises = subs.map(sub => 
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Error al enviar push (suscripción expirada?):', err)
        // Aquí podríamos limpiar suscripciones inválidas (status 410)
      })
    )
    await Promise.all(pushPromises)
  } else {
    console.warn('VAPID keys no configuradas. Notificación push omitida.')
  }

  return NextResponse.json({ ok: true })
}
