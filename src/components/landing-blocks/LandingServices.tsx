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

// ─── Íconos vectoriales minimalistas por tipo de masaje ──────────────────────
function ServiceIcon({ id }: { id: string }) {
  const c = {
    width: 22, height: 22, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (id) {
    case 'relaxing':
      return (
        <svg {...c}>
          <path d="M2 12c2.5-3 5.5-3 8 0s5.5 3 8 0 2.5-1.5 4-1.5" />
          <path d="M2 17c2.5-3 5.5-3 8 0s5.5 3 8 0 2.5-1.5 4-1.5" opacity="0.55" />
          <circle cx="12" cy="6" r="2.2" />
        </svg>
      )
    case 'deep-tissue':
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4" strokeDasharray="2 2" opacity="0.65" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      )
    case 'hot-stones':
      return (
        <svg {...c}>
          <ellipse cx="12" cy="17" rx="7.5" ry="3" />
          <ellipse cx="12" cy="12" rx="5" ry="2.2" />
          <ellipse cx="12" cy="7.5" rx="3" ry="1.5" />
          <path d="M9 3.5c.4-.6.8-.8 1.2-.4s.8.6 1.2 0" opacity="0.65" />
        </svg>
      )
    case 'sports':
      return (
        <svg {...c}>
          <path d="M3 13h3.5l2-6 4 12 2.5-8 2 3.5h4" />
        </svg>
      )
    case 'sensitive':
      return (
        <svg {...c}>
          <path d="M12 5.5a6.5 6.5 0 1 0 6.5 6.5" />
          <path d="M12 8.5a3.5 3.5 0 1 0 3.5 3.5" />
          <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
  }
}

// ─── Datos de dolor y solución por masaje (todos los servicios del landing) ──
const PAIN_SOLUTIONS: Record<
  string,
  {
    badge: { es: string; en: string }
    hook: { es: string; en: string }
    bullets: { es: string[]; en: string[] }
    detail: { es: string; en: string }
  }
> = {
  relaxing: {
    badge:   { es: 'Estrés · Mente saturada',      en: 'Stress · Mental fatigue'       },
    hook:    { es: 'Baja el cortisol y desconecta tu mente del ruido del día.',          en: 'Lowers cortisol and fully disconnects your mind from the daily noise.'    },
    bullets: { es: ['Pases suaves cabeza a pies', 'Cero dolor', 'Sueño reparador'],    en: ['Head-to-toe gentle strokes', 'Zero pain', 'Restful sleep']              },
    detail:  { es: 'Para quienes sienten agotamiento mental o insomnio. Movimientos largos y rítmicos que sedimentan el sistema nervioso.', en: 'For mental burnout and insomnia. Long, rhythmic strokes that settle the nervous system completely.' },
  },
  'deep-tissue': {
    badge:   { es: 'Nudos · Dolor de espalda',      en: 'Knots · Back & neck pain'      },
    hook:    { es: 'Presión firme sobre contracturas en cuello, hombros y lumbar.',     en: 'Firm, targeted pressure on stubborn knots in neck, shoulders and lower back.' },
    bullets: { es: ['Desactiva nudos profundos', 'Presión metódica', 'Más movilidad'], en: ['Deep knot release', 'Firm & methodical', 'Restored range of motion']     },
    detail:  { es: 'Ideal para personas con dolor crónico por trabajo sedentario o postura. La terapeuta trabaja lenta y profundamente en las capas musculares internas.', en: 'Ideal for chronic desk pain or postural strain. The therapist works slow and deep on internal muscle layers.' },
  },
  'hot-stones': {
    badge:   { es: 'Rigidez · Tensión profunda',    en: 'Stiffness · Deep tension'      },
    hook:    { es: 'Calor volcánico que penetra el músculo y disuelve la rigidez.',     en: 'Volcanic heat that penetrates muscle tissue and melts away deep stiffness.' },
    bullets: { es: ['Calor basáltico', 'Sin dolor invasivo', 'Mejora circulación'],    en: ['Basalt stone heat', 'Gentle yet deep', 'Boosts circulation']             },
    detail:  { es: 'Las piedras de basalto caliente relajan las fibras antes de manipularlas, logrando una relajación muscular profunda sin dolor.', en: 'Heated basalt stones open muscle fibers before manual work, achieving deep relaxation without painful pressure.' },
  },
  sports: {
    badge:   { es: 'Fatiga muscular · Deporte',     en: 'Soreness · Athletic recovery'  },
    hook:    { es: 'Terapia manual + percusión para drenar ácido láctico y recuperarte.', en: 'Manual therapy + percussion to flush lactic acid and reset your body.'   },
    bullets: { es: ['Terapia + percusión', 'Drena ácido láctico', 'Estiramientos'],    en: ['Therapy + percussion', 'Flushes lactic acid', 'Assisted stretching']     },
    detail:  { es: 'Para deportistas, runners o quienes llegaron con piernas cargadas. Fusión de masaje fuerte, pistola de percusión y estiramientos asistidos.', en: 'For athletes, runners or heavy-legged travelers. Combination of deep massage, percussion gun and assisted stretching.' },
  },
  sensitive: {
    badge:   { es: 'Sensaciones · Relajación total', en: 'Senses · Total relaxation'    },
    hook:    { es: 'Movimientos suaves y texturas que estimulan los sentidos y disuelven la tensión.',  en: 'Gentle movements and textured elements that stimulate the senses and melt tension away.' },
    bullets: { es: ['Ultra suave', 'Estimula sentidos', 'Ambiente exclusivo'],          en: ['Ultra-gentle', 'Sensory stimulation', 'Exclusive atmosphere']           },
    detail:  { es: 'Para quienes buscan una relajación sensorial profunda, sin presión, en un ambiente íntimo y privado.', en: 'For those seeking deep sensory relaxation without pressure, in a private and intimate setting.' },
  },
  'four-hands': {
    badge:   { es: '2 Terapeutas · Doble alivio',  en: '2 Therapists · Double relief'  },
    hook:    { es: 'Cuatro manos sincronizadas que saturan el sistema nervioso de la mejor manera.', en: 'Four synchronized hands that overwhelm the nervous system — in the best possible way.' },
    bullets: { es: ['4 manos simultáneas', 'Relajación sin igual', 'Sincronización perfecta'], en: ['4 simultaneous hands', 'Unmatched relaxation', 'Perfect synchrony'] },
    detail:  { es: 'La mente no puede seguir el ritmo de dos terapeutas y simplemente se rinde. Profundidad de relajación imposible con un solo terapeuta.', en: 'The mind cannot track two therapists and simply surrenders. Relaxation depth impossible with a single therapist.' },
  },
  duo: {
    badge:   { es: 'Parejas · Sesión compartida',  en: 'Couples · Shared session'      },
    hook:    { es: 'Dos personas, una sala privada, dos terapeutas dedicados.',         en: 'Two people, one private room, two dedicated therapists.'                  },
    bullets: { es: ['Sala privada doble', 'Técnicas independientes', 'Sin prisas'],     en: ['Private double room', 'Custom techniques', 'Unhurried pace']            },
    detail:  { es: 'Perfecta para parejas o amigos. Cada persona tiene su propio terapeuta y pueden elegir técnicas distintas en la misma sala.', en: 'Perfect for couples or friends. Each person gets their own therapist and can choose different techniques in the same room.' },
  },
}

export function LandingServices({
  title,
  serviceIds,
  locale,
}: {
  title: string
  serviceIds: string[]
  locale: Locale
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedService = expandedId ? getServiceById(expandedId) : null
  const expandedPain = expandedId ? PAIN_SOLUTIONS[expandedId] : null
  const isEn = locale === 'en'

  return (
    <section id="servicios" className="py-12 sm:py-18 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Encabezado compacto ── */}
        <div className="text-center max-w-lg mx-auto mb-7 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#0a1628] mb-1.5">
            {title}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            {isEn ? 'Prices from $120,000 COP · No hidden fees.' : 'Desde $120.000 COP · Sin costos ocultos.'}
          </p>
        </div>

        {/* ── 4 Tarjetas — grid 1 col móvil, 2 tablet, 4 desktop ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {serviceIds.map((id) => {
            const s = getServiceById(id)
            if (!s) return null

            const name = serviceDisplayName(s, locale)
            const pain = PAIN_SOLUTIONS[id]

            let basePrice = 120000
            if (s.pricingModel === 'duration') {
              basePrice = Math.min(...Object.values(s.prices))
            } else if (s.pricingModel === 'flat') {
              basePrice = s.price
            } else if (s.pricingModel === 'wax-machine') {
              basePrice = Math.min(s.waxPrice, s.machinePrice)
            }

            return (
              <div
                key={id}
                id={`service-card-${id}`}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(id) }
                }}
                className="group text-left border border-gray-200 hover:border-[#C9A876]/70 rounded-2xl p-4 flex flex-col bg-white hover:shadow-md transition-all cursor-pointer active:scale-[0.99] select-none"
              >
                {/* Fila: ícono + badge pill */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-lg bg-[#C9A876]/10 text-[#C9A876] flex items-center justify-center shrink-0 group-hover:bg-[#C9A876] group-hover:text-white transition-colors">
                    <ServiceIcon id={id} />
                  </span>
                  {pain && (
                    <span className="text-[10px] text-[#8B6B38] bg-[#FBF7F1] border border-[#EFE3D0] px-2 py-0.5 rounded-full leading-tight truncate">
                      {pain.badge[locale]}
                    </span>
                  )}
                </div>

                {/* Nombre */}
                <h3 className="text-[17px] sm:text-lg font-serif text-[#0a1628] mb-1.5 group-hover:text-[#C9A876] transition-colors leading-snug">
                  {name}
                </h3>

                {/* Hook — 1 línea directa al dolor */}
                <p className="text-[11.5px] text-gray-500 leading-relaxed mb-3 flex-1">
                  {pain ? pain.hook[locale] : serviceShortDesc(s, locale)}
                </p>

                {/* Bullets minimalistas de solución */}
                {pain && (
                  <div className="flex flex-col gap-1 mb-4">
                    {pain.bullets[locale].map((b, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#C9A876]/15 text-[#C9A876] flex items-center justify-center text-[8px] font-bold shrink-0">✓</span>
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {/* Precio + Reservar */}
                <div className="border-t border-gray-100 pt-3 mt-auto">
                  <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{isEn ? 'from' : 'desde'}</span>
                    <span className="text-[17px] font-bold text-[#0a1628]">{formatCopValue(basePrice)}</span>
                  </div>
                  <a
                    href={`#reservar-${id}`}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation()
                      trackAdsClick('service_card', id)
                    }}
                    className="block text-center bg-[#0a1628] text-white text-xs font-medium py-2.5 rounded-full hover:bg-[#132540] active:scale-[0.98] transition-colors w-full"
                  >
                    {isEn ? `Book ${name}` : `Reservar ${name}`}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modal centrado en pantalla (móvil y desktop) ── */}
      {expandedService && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setExpandedId(null)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-7 max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in duration-200"
          >
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer text-sm"
              aria-label={isEn ? 'Close' : 'Cerrar'}
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#C9A876]/12 text-[#C9A876] flex items-center justify-center shrink-0">
                <ServiceIcon id={expandedId!} />
              </span>
              <div>
                {expandedPain && (
                  <span className="text-[10px] text-[#C9A876] font-semibold uppercase tracking-wider block mb-0.5">
                    {expandedPain.badge[locale]}
                  </span>
                )}
                <h3 className="text-xl font-serif text-[#0a1628] leading-tight">
                  {serviceDisplayName(expandedService, locale)}
                </h3>
              </div>
            </div>

            {expandedPain && (
              <div className="bg-[#FAF8F5] border border-[#F0EAE1] rounded-xl p-3.5 mb-4 text-[12px] text-gray-700 leading-relaxed">
                {expandedPain.detail[locale]}
              </div>
            )}

            <p className="text-[12px] text-gray-600 leading-relaxed mb-5">
              {expandedService.description?.[locale] ?? serviceShortDesc(expandedService, locale)}
            </p>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider">{isEn ? 'Price from' : 'Tarifa desde'}</span>
              <span className="text-xl font-bold text-[#0a1628]">
                {formatCopValue(
                  expandedService.pricingModel === 'duration'
                    ? Math.min(...Object.values(expandedService.prices))
                    : expandedService.pricingModel === 'flat'
                    ? expandedService.price
                    : Math.min(expandedService.waxPrice, expandedService.machinePrice)
                )}
              </span>
            </div>

            <a
              href={`#reservar-${expandedId}`}
              rel="noopener noreferrer"
              onClick={() => {
                trackAdsClick('service_card_sheet', expandedId ?? undefined)
                if (typeof window !== 'undefined') {
                  window.location.hash = `#reservar-${expandedId}`
                }
                setExpandedId(null)
              }}
              className="block text-center bg-[#0a1628] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#132540] transition-colors shadow-sm w-full"
            >
              {isEn ? `Book ${serviceDisplayName(expandedService, locale)}` : `Reservar ${serviceDisplayName(expandedService, locale)}`}
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
