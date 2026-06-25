'use client'

import { useState } from 'react'

export default function CheckinClient({ id, bookingName }: { id: string; bookingName: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleCheckin() {
    setStatus('loading')
    try {
      const res = await fetch(`/api/bookings/${id}/checkin`, { method: 'POST' })
      if (!res.ok) throw new Error('Error')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', color: '#e8eef4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#0f1f38', border: '1px solid #1e3358', borderRadius: 12, padding: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, margin: '0 0 8px', fontWeight: 300 }}>Hola, {bookingName}</h1>
        
        {status === 'idle' && (
          <>
            <p style={{ color: '#7a9ab8', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
              ¿Ya llegaste a nuestras instalaciones? Presiona el botón para notificar a tu terapeuta y que te abran la puerta.
            </p>
            <button 
              onClick={handleCheckin}
              style={{
                width: '100%', padding: '16px', background: '#4a9fd4', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Ya llegué
            </button>
          </>
        )}

        {status === 'loading' && (
          <p style={{ color: '#4a9fd4', fontSize: 16, marginTop: 24 }}>Notificando...</p>
        )}

        {status === 'done' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#34d399' }}>✓</div>
            <p style={{ color: '#e8eef4', fontSize: 16, marginBottom: 8 }}>¡Personal notificado!</p>
            <p style={{ color: '#7a9ab8', fontSize: 14 }}>Te esperamos adentro. En breve te recibiremos.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 16 }}>Ocurrió un error al notificar.</p>
            <button onClick={() => setStatus('idle')} style={{ background: 'transparent', border: '1px solid #1e3358', color: '#e8eef4', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
