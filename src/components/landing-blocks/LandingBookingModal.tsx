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
  const [initialServiceId, setInitialServiceId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#reservar')) {
        const parts = hash.split('-')
        if (parts.length > 1) {
          setInitialServiceId(parts.slice(1).join('-'))
        } else {
          setInitialServiceId(undefined)
        }
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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { window.location.hash = '' }}
    >
      <div 
        className="w-full h-full md:h-[90vh] md:max-h-[800px] md:max-w-[500px] bg-[#0a1628] md:rounded-2xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          <BookClient 
            locale={locale} 
            t={t} 
            allowedServiceIds={allowedServiceIds}
            initialServiceId={initialServiceId}
            onClose={() => {
              window.location.hash = ''
            }} 
          />
        </div>
      </div>
    </div>
  )
}
