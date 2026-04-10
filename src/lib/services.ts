export const DURATION_MINUTES = [30, 60, 90] as const
export type DurationMinutes = (typeof DURATION_MINUTES)[number]

export type ServiceDef = {
  id: string
  name: { en: string; es: string }
  category: { en: string; es: string }
  shortDesc: { en: string; es: string }
  description: { en: string; es: string }
  prices: Record<DurationMinutes, number>
}

export const SERVICES = [
  {
    id: 'relaxing',
    name: { en: 'Relaxing massage', es: 'Relajante' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Gentle strokes to release tension and restore calm.',
      es: 'Movimientos suaves para liberar tensión y restaurar la calma.',
    },
    description: {
      en: 'A full-body relaxation massage using long, gentle, rhythmic strokes designed to release built-up tension, reduce stress hormones, and restore a deep sense of calm to both body and mind. Ideal for those who need a mental reset or simply want to unwind in a private, quiet environment.',
      es: 'Masaje de cuerpo completo con movimientos largos, suaves y rítmicos diseñados para liberar la tensión acumulada, reducir el cortisol y restaurar una profunda sensación de calma en cuerpo y mente. Ideal para quienes necesitan un reinicio mental o simplemente desean relajarse en un entorno privado y silencioso.',
    },
    prices: { 30: 120_000, 60: 200_000, 90: 260_000 },
  },
  {
    id: 'deep-tissue',
    name: { en: 'Deep tissue', es: 'Deep Tissue' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'High-pressure technique for chronic muscle tension and recovery.',
      es: 'Técnica de alta presión para tensión muscular crónica y recuperación.',
    },
    description: {
      en: 'A targeted technique using slow, firm strokes and focused pressure to release deep-seated muscle tension, chronic knots, and postural imbalances. Particularly effective for people with demanding physical routines, desk-based posture issues, or after intense athletic activity.',
      es: 'Técnica dirigida con movimientos lentos y firmes que liberan la tensión muscular profunda, los nudos crónicos y los desequilibrios posturales. Especialmente efectivo para personas con rutinas físicas exigentes, problemas de postura por trabajo sedentario o después de actividad deportiva intensa.',
    },
    prices: { 30: 130_000, 60: 220_000, 90: 280_000 },
  },
  {
    id: 'four-hands',
    name: { en: 'Four hands', es: '4 Manos' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Two therapists working in synchrony for double the benefit.',
      es: 'Dos terapeutas trabajando en sincronía para el doble del beneficio.',
    },
    description: {
      en: 'A unique and immersive experience where two therapists work simultaneously in perfect synchrony across your entire body. The dual stimulation overwhelms the nervous system in the best possible way — the mind cannot track two sets of hands and simply surrenders, delivering a depth of relaxation far beyond what a single therapist can achieve.',
      es: 'Una experiencia única e inmersiva en la que dos terapeutas trabajan simultáneamente en perfecta sincronía sobre todo el cuerpo. La estimulación dual satura el sistema nervioso de la mejor manera posible: la mente no puede seguir el rastro de cuatro manos y simplemente se rinde, alcanzando una profundidad de relajación muy superior a la de un solo terapeuta.',
    },
    prices: { 30: 230_000, 60: 350_000, 90: 480_000 },
  },
  {
    id: 'duo',
    name: { en: 'Duo massage', es: 'Duo Masaje' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Shared session for two — perfect for couples or friends.',
      es: 'Sesión compartida para dos personas — perfecta para parejas o amigos.',
    },
    description: {
      en: 'A side-by-side session in the same private room for two people. Each person receives their own dedicated therapist, allowing couples or close friends to share the experience simultaneously. Choose the same technique or different ones — the room is yours, private and unhurried.',
      es: 'Sesión en paralelo en la misma sala privada para dos personas. Cada persona tiene su propio terapeuta dedicado, lo que permite que parejas o amigos vivan la experiencia al mismo tiempo. Pueden elegir la misma técnica o técnicas diferentes; la sala es suya, privada y sin prisa.',
    },
    prices: { 30: 220_000, 60: 380_000, 90: 500_000 },
  },
  {
    id: 'hot-stones',
    name: { en: 'Hot stone massage', es: 'Con Piedras Calientes' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Volcanic stones that penetrate heat deep into muscle tissue.',
      es: 'Piedras volcánicas que penetran el calor profundamente en el tejido muscular.',
    },
    description: {
      en: 'Smooth volcanic basalt stones are heated and placed along key energy points while the therapist uses them as an extension of the hand to deliver a deeper-than-usual massage. The radiant heat penetrates muscle tissue, improves circulation, and relieves chronic tension with a profoundly soothing effect unlike any other treatment.',
      es: 'Piedras de basalto volcánico se calientan y se colocan sobre puntos energéticos clave mientras el terapeuta las usa como extensión de la mano para un masaje más profundo. El calor radiante penetra el tejido muscular, mejora la circulación y alivia la tensión crónica con un efecto calmante único que no tiene comparación con ningún otro tratamiento.',
    },
    prices: { 30: 130_000, 60: 220_000, 90: 280_000 },
  },
  {
    id: 'sports',
    name: { en: 'Sports massage', es: 'Deportivo' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Recovery-focused technique combining deep pressure and stretching.',
      es: 'Técnica enfocada en recuperación con presión profunda y estiramientos.',
    },
    description: {
      en: 'Designed for those who push their bodies — whether through professional sport, intense training, or demanding physical work. Combines deep-tissue pressure, assisted stretching, and targeted lymphatic drainage to flush metabolic waste, restore range of motion, and reduce injury risk. Best taken regularly as part of a recovery programme.',
      es: 'Diseñado para quienes exigen mucho a su cuerpo — ya sea mediante deporte profesional, entrenamiento intenso o trabajo físico exigente. Combina presión de tejido profundo, estiramientos asistidos y drenaje linfático dirigido para eliminar residuos metabólicos, restaurar el rango de movimiento y reducir el riesgo de lesiones. Recomendado de forma regular como parte de un programa de recuperación.',
    },
    prices: { 30: 140_000, 60: 240_000, 90: 300_000 },
  },
  {
    id: 'sensitive',
    name: { en: 'Sensitive massage', es: 'Sensitive' },
    category: { en: 'Basic services', es: 'Servicios básicos' },
    shortDesc: {
      en: 'Gentle care for sensitive skin or nervous systems.',
      es: 'Cuidado delicado para piel o sistemas nerviosos sensibles.',
    },
    description: {
      en: 'A carefully adapted massage for clients with sensitive skin, heightened nervous system reactivity, or conditions that require a gentler approach. Uses hypoallergenic oils, very light pressure, and slow deliberate movements to provide genuine therapeutic relief without overstimulation. Equally suitable as an introduction for first-time massage clients.',
      es: 'Masaje adaptado con cuidado para clientes con piel sensible, reactividad elevada del sistema nervioso o condiciones que requieren un enfoque más suave. Utiliza aceites hipoalergénicos, presión muy ligera y movimientos lentos y deliberados para brindar un alivio terapéutico real sin sobreestimulación. También es ideal como introducción para quienes reciben un masaje por primera vez.',
    },
    prices: { 30: 130_000, 60: 220_000, 90: 280_000 },
  },
] as const satisfies readonly ServiceDef[]

export type ServiceId = (typeof SERVICES)[number]['id']

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

export function getServiceById(id: string): ServiceDef | undefined {
  return (SERVICES as unknown as ServiceDef[]).find(s => s.id === id)
}

export function getServicePrice(serviceId: string, minutes: number): number | undefined {
  if (minutes !== 30 && minutes !== 60 && minutes !== 90) return undefined
  const s = getServiceById(serviceId)
  return s?.prices[minutes as DurationMinutes]
}

export function serviceDisplayName(s: ServiceDef, locale: 'en' | 'es'): string {
  return locale === 'en' ? s.name.en : s.name.es
}
