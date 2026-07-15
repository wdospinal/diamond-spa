'use client'

import { getServiceById, serviceDisplayName, serviceShortDesc } from '@/lib/services'
import { Locale } from '@/lib/i18n'
import { formatCopValue } from '@/lib/format-currency'
import { pushEvent } from '@/lib/gtm'



function trackAdsClick(source: string, serviceSlug?: string) {
  const campaign = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sem_campaign') : null
  const payload: Record<string, string> = {
    event_label: serviceSlug ?? 'general',
    source,
  }
  if (campaign) payload.campaign = campaign
  
  pushEvent('booking_click', payload)
}

export function LandingServices({
  title,
  serviceIds,
  locale
}: {
  title: string
  serviceIds: string[]
  locale: Locale
}) {
  return (
    <section id="servicios" className="py-20 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-serif text-center text-[#0a1628] mb-2">
          {title}
        </h2>
        <p className="text-center text-gray-500 mb-12">
          {locale === 'en' ? 'Transparent pricing from the start. No surprises.' : 'Precios claros desde el primer momento. Sin sorpresas.'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceIds.map((id) => {
            const s = getServiceById(id)
            if (!s) return null

            const name = serviceDisplayName(s, locale)
            const desc = serviceShortDesc(s, locale)
            let basePrice = 120000
            if (s.pricingModel === 'duration') {
              basePrice = Math.min(...Object.values(s.prices))
            } else if (s.pricingModel === 'flat') {
              basePrice = s.price
            } else if (s.pricingModel === 'wax-machine') {
              basePrice = Math.min(s.waxPrice, s.machinePrice)
            }

            return (
              <div key={id} className="border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow bg-white">
                <span className="material-symbols-outlined text-[#C9A876] text-3xl mb-3">
                  spa
                </span>
                <h3 className="text-xl font-serif text-[#0a1628] mb-2">
                  {name}
                </h3>
                <p className="text-sm text-gray-600 flex-grow mb-4">
                  {desc}
                </p>
                <div className="text-sm text-gray-700 border-t border-gray-100 pt-4 mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{locale === 'en' ? 'from' : 'desde'}</p>
                  <p className="text-lg font-semibold text-[#0a1628]">{formatCopValue(basePrice)}</p>
                </div>
                <a
                  href={`#reservar-${id}`}
                  rel="noopener noreferrer"
                  onClick={() => trackAdsClick('service_card', id)}
                  className="text-center bg-[#0a1628] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#132540] transition-colors"
                >
                  {locale === 'en' ? `Book ${name}` : `Reservar ${name}`}
                </a>
              </div>
            )
          })}
        </div>
        

      </div>
    </section>
  )
}
