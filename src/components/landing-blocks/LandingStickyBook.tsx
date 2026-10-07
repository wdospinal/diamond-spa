'use client'

import { useEffect, useState } from 'react'

// Botón fijo de reserva en móvil (landing de pauta en inglés, v1). Aparece al
// pasar el hero. Deja libre la esquina derecha para la burbuja de WhatsApp.
// Abre el mismo modal (#reservar); no dispara eventos nuevos.
export function LandingStickyBook({ locale = 'en' }: { locale?: 'es' | 'en' }) {
  const label = locale === 'es' ? 'Reserva tu sesión' : 'Book your session'
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // Se oculta mientras las tarjetas de servicios están en pantalla: ahí cada
      // tarjeta ya tiene su propio botón de reserva y no queremos tapar el precio.
      const svc = document.getElementById('servicios')?.getBoundingClientRect()
      const h = window.innerHeight
      const onServices = !!svc && svc.top < h * 0.75 && svc.bottom > h * 0.25
      setShow(window.scrollY > h * 0.8 && !onServices)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`md:hidden fixed bottom-6 left-4 right-[92px] z-40 transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <a
        href="#reservar"
        className="flex items-center justify-center gap-2 h-14 rounded-full bg-[#0a1628] text-white text-sm font-semibold shadow-xl"
      >
        <span className="material-symbols-outlined text-[18px]">event</span>
        {label}
      </a>
    </div>
  )
}
