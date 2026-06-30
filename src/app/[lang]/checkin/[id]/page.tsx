import { readBookings } from '@/lib/bookings-store'
import CheckinClient from './CheckinClient'

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Verify booking exists
  const bookings = await readBookings()
  const booking = bookings.find(b => b.id === id)

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a1628', color: '#e8eef4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <h2>Reserva no encontrada</h2>
      </div>
    )
  }

  return <CheckinClient id={id} bookingName={booking.name || booking.firstName || 'Cliente'} />
}
