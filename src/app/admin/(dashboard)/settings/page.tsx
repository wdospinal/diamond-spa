'use client'

import { useState, useEffect } from 'react'

function PushManager() {
  const [status, setStatus] = useState<'idle'|'loading'|'subscribed'>('idle')

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  const subscribe = async () => {
    if (!vapidPublicKey) {
      alert('VAPID public key no configurada en .env.local')
      return
    }
    try {
      setStatus('loading')
      const reg = await navigator.serviceWorker.register('/sw.js')
      const readyReg = await navigator.serviceWorker.ready
      const sub = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub)
      })
      setStatus('subscribed')
    } catch (e) {
      console.error(e)
      alert('Error al suscribir notificaciones. Asegúrate de dar permisos.')
      setStatus('idle')
    }
  }

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.pushManager.getSubscription().then(sub => {
            if (sub) setStatus('subscribed')
          })
        }
      })
    }
  }, [])

  return (
    <div className="bg-surface-container border border-outline-variant/20 p-6 rounded-lg max-w-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">notifications_active</span>
        </div>
        <div>
          <h2 className="font-headline text-xl text-on-surface mb-1">Notificaciones Push</h2>
          <p className="text-sm text-on-surface/60 leading-relaxed">
            Recibe alertas instantáneas en tu dispositivo cuando un cliente realice una nueva reserva en la web.
          </p>
        </div>
      </div>
      
      {status === 'subscribed' ? (
        <div className="flex items-center gap-2 text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/20 p-4 rounded">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
          <span className="font-label text-xs uppercase tracking-widest">Notificaciones Activas</span>
        </div>
      ) : (
        <button
          onClick={subscribe}
          disabled={status === 'loading'}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-label font-bold tracking-widest text-[10px] uppercase hover:bg-primary-fixed transition-colors"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {status === 'loading' ? 'sync' : 'add_alert'}
          </span>
          {status === 'loading' ? 'Activando...' : 'Activar Notificaciones'}
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2">Configuración</h1>
        <p className="text-on-surface/50 text-sm">Gestiona las preferencias y herramientas del administrador.</p>
      </header>

      <div className="flex flex-col gap-8">
        <PushManager />
      </div>
    </div>
  )
}
