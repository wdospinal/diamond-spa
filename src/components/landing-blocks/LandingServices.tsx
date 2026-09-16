'use client'

import { useState } from 'react'
import { getServiceById, serviceDisplayName, serviceShortDesc } from '@/lib/services'
import { Locale } from '@/lib/i18n'
import { formatCopValue } from '@/lib/format-currency'
import { pushEvent } from '@/lib/gtm'

function trackAdsClick(source: string, serviceSlug?: string) {
  const campaign = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sem_campaign') : null
  const adgroup  = typeof window     !== 'undefined' ? new URLSearchParams(window.location.search).get('adgroup') : null
  const payload: Record<string, string> = { event_label: serviceSlug ?? 'general', source }
  if (campaign) payload.campaign = campaign
  if (adgroup)  payload.adgroup  = adgroup
  pushEvent('booking_click', payload)
}

// Íconos simples de línea, uno por tipo de masaje — mismo lenguaje visual
// que el resto del sitio (un solo trazo, color de acento). No son ilustraciones
// realistas a propósito: más rápidos de "leer" de un vistazo en móvil.
function ServiceIcon({ id }: { id: string }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'deep-tissue':
      // Dos manos aplicando presión
      return (
        <svg {...common}>
          <path d="M5 10c0-2 1.5-3.5 3.5-3.5S12 8 12 10v3" />
          <path d="M19 10c0-2-1.5-3.5-3.5-3.5S12 8 12 10v3" />
          <path d="M6 13v2.5c0 2.5 2.7 4.5 6 4.5s6-2 6-4.5V13" />
          <path d="M9 12.5c1-.6 2-.6 3 0" opacity="0.5" />
        </svg>
      )
    case 'sports':
      // Pulso / energía en movimiento
      return (
        <svg {...common}>
          <path d="M3 12h4l2-6 4 12 2-8 2 2h4" />
        </svg>
      )
    case 'sensitive':
      // Espiral suave
      return (
        <svg {...common}>
          <path d="M12 5.5a6.5 6.5 0 1 0 6.5 6.5" />
          <path d="M12 8.5a3.5 3.5 0 1 0 3.5 3.5" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      // 'relaxing' y cualquier otro — ondas suaves
      return (
        <svg {...common}>
          <path d="M3 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
          <path d="M3 15c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" opacity="0.5" />
        </svg>
      )
  }
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
  // Id del servicio con la "hoja" de detalle abierta — null = ninguna.
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedService = expandedId ? getServiceById(expandedId) : null

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
              // Toda la tarjeta es un solo <button> nativo — igual patrón ya
              // probado con las terapeutas: el navegador distingue solo un
              // toque de un scroll, no rompe nada en móvil. El botón de
              // Reservar adentro usa stopPropagation para no abrir la hoja.
              <button
                key={id}
                type="button"
                onClick={() => setExpandedId(id)}
                className="text-left border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow bg-white active:scale-[0.98]"
              >
                <span className="w-11 h-11 rounded-full bg-[#C9A876]/10 text-[#C9A876] flex items-center justify-center mb-3">
                  <ServiceIcon id={id} />
                </span>
                <h3 className="text-xl font-serif text-[#0a1628] mb-2">
                  {name}
                </h3>
                <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-2">
                  {desc}
                </p>
                <span className="text-xs text-[#C9A876] font-medium mb-4 underline underline-offset-2">
                  {locale === 'en' ? 'See more' : 'Ver más'}
                </span>
                <div className="text-sm text-gray-700 border-t border-gray-100 pt-4 mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{locale === 'en' ? 'from' : 'desde'}</p>
                  <p className="text-lg font-semibold text-[#0a1628]">{formatCopValue(basePrice)}</p>
                </div>
                <a
                  href={`#reservar-${id}`}
                  rel="noopener noreferrer"
                  onClick={(e) => { e.stopPropagation(); trackAdsClick('service_card', id) }}
                  className="text-center bg-[#0a1628] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#132540] transition-colors"
                >
                  {locale === 'en' ? `Book ${name}` : `Reservar ${name}`}
                </a>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hoja de detalle — sube desde abajo en móvil, modal centrado en desktop.
          No saca al usuario de la página: es una capa encima, con el mismo
          CTA de reservar al final. */}
      {expandedService && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
          onClick={() => setExpandedId(null)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 sm:p-7 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
          >
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              aria-label={locale === 'en' ? 'Close' : 'Cerrar'}
            >
              ✕
            </button>

            <span className="w-14 h-14 rounded-full bg-[#C9A876]/10 text-[#C9A876] flex items-center justify-center mb-4">
              <ServiceIcon id={expandedId!} />
            </span>

            <h3 className="text-2xl font-serif text-[#0a1628] mb-3">
              {serviceDisplayName(expandedService, locale)}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {expandedService.description?.[locale] ?? serviceShortDesc(expandedService, locale)}
            </p>

            <div className="text-sm text-gray-700 border-t border-gray-100 pt-4 mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{locale === 'en' ? 'from' : 'desde'}</p>
              <p className="text-xl font-semibold text-[#0a1628]">
                {formatCopValue(
                  expandedService.pricingModel === 'duration' ? Math.min(...Object.values(expandedService.prices))
                  : expandedService.pricingModel === 'flat' ? expandedService.price
                  : Math.min(expandedService.waxPrice, expandedService.machinePrice)
                )}
              </p>
            </div>

            <a
              href={`#reservar-${expandedId}`}
              rel="noopener noreferrer"
              onClick={() => trackAdsClick('service_card_sheet', expandedId ?? undefined)}
              className="block text-center bg-[#0a1628] text-white text-sm font-medium py-3.5 rounded-full hover:bg-[#132540] transition-colors"
            >
              {locale === 'en' ? `Book ${serviceDisplayName(expandedService, locale)}` : `Reservar ${serviceDisplayName(expandedService, locale)}`}
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
