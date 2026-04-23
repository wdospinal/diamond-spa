'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'diamond_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const dismiss = (value: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant/20 px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
      <p className="font-body text-secondary text-sm flex-1 leading-relaxed">
        Usamos analíticas anónimas para mejorar el sitio.{' '}
        <span className="text-on-surface/40 mx-1">/</span>{' '}
        We use anonymous analytics to improve the site.{' '}
        <a href="/es/privacy" className="text-primary underline underline-offset-2 hover:text-on-surface transition-colors">
          Política de Privacidad
        </a>
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => dismiss('declined')}
          className="font-label text-xs tracking-widest uppercase text-secondary border border-outline-variant/30 px-5 py-2 hover:bg-surface-container-high transition-colors duration-300"
        >
          Rechazar / Decline
        </button>
        <button
          onClick={() => dismiss('accepted')}
          className="font-label text-xs tracking-widest uppercase bg-primary text-on-primary px-5 py-2 hover:bg-white hover:text-surface transition-colors duration-300"
        >
          Aceptar / Accept
        </button>
      </div>
    </div>
  )
}
