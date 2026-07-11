'use client'

import { useEffect, useState } from 'react'
import BookClient from '@/components/BookClient'
import type { Dict } from '@/lib/i18n'

export function LandingBookingModal({ 
  locale, 
  allowedServiceIds,
  t
}: { 
  locale: string; 
  allowedServiceIds?: string[];
  t: Dict['book']
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#reservar') {
        setIsOpen(true)
        document.body.style.overflow = 'hidden'
      } else {
        setIsOpen(false)
        document.body.style.overflow = 'auto'
      }
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      document.body.style.overflow = 'auto'
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full md:h-[90vh] md:max-h-[800px] md:max-w-[500px] bg-[#0a1628] md:rounded-2xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex-1 overflow-y-auto">
          <BookClient 
            locale={locale} 
            t={t} 
            allowedServiceIds={allowedServiceIds} 
            onClose={() => {
              window.location.hash = ''
            }} 
          />
        </div>
      </div>
    </div>
  )
}
