export const DURATION_MINUTES = [30, 60, 90] as const
export type DurationMinutes = (typeof DURATION_MINUTES)[number]

export type ServiceDef = {
  id: string
  name: { en: string; es: string }
  category: { en: string; es: string }
  categoryId: 'massages' | 'facials' | 'hair-removal'
  shortDesc: { en: string; es: string }
  description: { en: string; es: string }
} & (
  | { pricingModel: 'duration'; prices: Record<DurationMinutes, number> }
  | { pricingModel: 'flat'; price: number }
  | { pricingModel: 'wax-machine'; waxPrice: number; machinePrice: number }
)

export const SERVICES = [
  // ── EXCLUSIVE MASSAGES ──────────────────────────────────────────────────────
  {
    id: 'relaxing',
    name: { en: 'Relaxing massage', es: 'Relajante' },
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    name: { en: 'Volcanic stone massage', es: 'Con Piedras Volcánicas' },
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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
    category: { en: 'Exclusive Massages', es: 'Masajes Exclusivos' },
    categoryId: 'massages' as const,
    pricingModel: 'duration' as const,
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

  // ── FACIALS & SKIN CARE ──────────────────────────────────────────────────────
  {
    id: 'hidrafacial',
    name: { en: 'HydraFacial', es: 'Hidrafacial' },
    category: { en: 'Facials & Skin Care', es: 'Faciales y Cuidado de la Piel' },
    categoryId: 'facials' as const,
    pricingModel: 'flat' as const,
    shortDesc: {
      en: 'Deep cleansing, extraction, and intensive hydration in one treatment.',
      es: 'Limpieza profunda, extracción e hidratación intensiva en un solo tratamiento.',
    },
    description: {
      en: 'The HydraFacial is a multi-step treatment that deeply cleanses, exfoliates, extracts impurities and infuses skin with intensive serums. Suitable for all skin types, it delivers immediate visible results — cleaner pores, smoother texture, and lasting luminosity — with no downtime required.',
      es: 'El Hidrafacial es un tratamiento de múltiples pasos que limpia profundamente, exfolia, extrae impurezas e infunde la piel con sueros intensivos. Apto para todo tipo de piel, ofrece resultados visibles desde la primera sesión — poros más limpios, textura más suave y luminosidad duradera — sin tiempo de recuperación.',
    },
    price: 350_000,
  },
  {
    id: 'limpieza-facial-profunda',
    name: { en: 'Deep Facial Cleansing', es: 'Limpieza Facial Profunda' },
    category: { en: 'Facials & Skin Care', es: 'Faciales y Cuidado de la Piel' },
    categoryId: 'facials' as const,
    pricingModel: 'flat' as const,
    shortDesc: {
      en: 'Professional extraction and exfoliation for congested skin.',
      es: 'Extracción y exfoliación profesional para piel congestionada.',
    },
    description: {
      en: 'A thorough professional facial cleansing that removes blackheads, whiteheads, and deep impurities through manual extraction and exfoliation. Leaves the skin deeply clean, refreshed, and visibly clearer after just one session. Ideal for oily, combination, or congested skin types.',
      es: 'Una limpieza facial profesional y completa que elimina puntos negros, espinillas e impurezas profundas mediante extracción manual y exfoliación. Deja la piel profundamente limpia, fresca y visiblemente más clara desde la primera sesión. Ideal para pieles grasas, mixtas o congestionadas.',
    },
    price: 250_000,
  },
  {
    id: 'limpieza-facial-basica',
    name: { en: 'Basic Facial Cleansing', es: 'Limpieza Facial Básica' },
    category: { en: 'Facials & Skin Care', es: 'Faciales y Cuidado de la Piel' },
    categoryId: 'facials' as const,
    pricingModel: 'flat' as const,
    shortDesc: {
      en: 'Gentle daily cleansing to refresh and purify the skin.',
      es: 'Limpieza suave para refrescar y purificar la piel.',
    },
    description: {
      en: 'A gentle facial cleansing treatment designed to remove surface impurities, excess sebum, and environmental pollutants accumulated throughout the day. Ideal for maintaining skin health between deeper treatments or as an introduction to professional skin care.',
      es: 'Tratamiento de limpieza facial suave para eliminar impurezas superficiales, exceso de sebo y contaminantes del entorno acumulados durante el día. Ideal para mantener la salud de la piel entre tratamientos más profundos o como introducción al cuidado profesional de la piel.',
    },
    price: 150_000,
  },
  {
    id: 'hidratacion-facial',
    name: { en: 'Facial Hydration', es: 'Hidratación Facial' },
    category: { en: 'Facials & Skin Care', es: 'Faciales y Cuidado de la Piel' },
    categoryId: 'facials' as const,
    pricingModel: 'flat' as const,
    shortDesc: {
      en: 'Intensive moisture restoration for dehydrated or dull skin.',
      es: 'Restauración intensiva de humedad para piel deshidratada o apagada.',
    },
    description: {
      en: 'An intensive facial hydration treatment using high-performance moisturising serums and masks to restore the skin\'s natural moisture barrier. Leaves the skin visibly plumper, more luminous, and deeply comfortable. Perfect for dehydrated, stressed, or post-sun skin.',
      es: 'Tratamiento de hidratación facial intensiva con sueros y máscaras de alto rendimiento que restauran la barrera natural de humedad de la piel. Deja la piel notablemente más tersa, luminosa y confortable en profundidad. Perfecto para pieles deshidratadas, estresadas o con daño solar.',
    },
    price: 200_000,
  },
  {
    id: 'limpieza-espalda',
    name: { en: 'Back Cleansing', es: 'Limpieza de Espalda' },
    category: { en: 'Facials & Skin Care', es: 'Faciales y Cuidado de la Piel' },
    categoryId: 'facials' as const,
    pricingModel: 'flat' as const,
    shortDesc: {
      en: 'Professional back treatment targeting pores and blemishes.',
      es: 'Tratamiento profesional para la espalda, dirigido a poros e imperfecciones.',
    },
    description: {
      en: 'A professional cleansing treatment specifically designed for the back, targeting clogged pores, blackheads, and blemishes in this hard-to-reach area. Includes exfoliation, extraction, and a purifying mask for clear, smooth skin. Highly recommended before special events or as part of a regular skin care routine.',
      es: 'Tratamiento de limpieza profesional diseñado específicamente para la espalda, dirigido a poros obstruidos, puntos negros e imperfecciones en esta zona de difícil acceso. Incluye exfoliación, extracción y mascarilla purificante para una piel limpia y suave. Muy recomendado antes de eventos especiales o como parte de una rutina de cuidado regular.',
    },
    price: 200_000,
  },

  // ── HAIR REMOVAL ─────────────────────────────────────────────────────────────
  {
    id: 'depilacion-axila',
    name: { en: 'Underarm', es: 'Axila' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Underarm hair removal by wax or machine.',
      es: 'Depilación de axilas con cera o máquina.',
    },
    description: {
      en: 'Professional underarm hair removal available with warm wax for precise, long-lasting results or with electric machine for a gentler approach. Both methods deliver smooth, clean results with minimal discomfort in a private, hygienic environment.',
      es: 'Depilación profesional de axilas disponible con cera caliente para resultados precisos y duraderos, o con máquina para un enfoque más suave. Ambos métodos ofrecen resultados suaves y limpios con mínimas molestias en un entorno privado e higiénico.',
    },
    waxPrice: 30_000,
    machinePrice: 20_000,
  },
  {
    id: 'depilacion-bikini',
    name: { en: 'Bikini', es: 'Bikini' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Bikini line hair removal by wax or machine.',
      es: 'Depilación de línea de bikini con cera o máquina.',
    },
    description: {
      en: 'Professional bikini line hair removal performed with precision using either warm wax or electric machine. Our therapists ensure maximum comfort and discretion throughout the treatment, delivering clean and lasting results.',
      es: 'Depilación profesional de la línea de bikini realizada con precisión usando cera caliente o máquina eléctrica. Nuestras terapeutas garantizan el máximo confort y discreción durante el tratamiento, ofreciendo resultados limpios y duraderos.',
    },
    waxPrice: 80_000,
    machinePrice: 60_000,
  },
  {
    id: 'depilacion-media-pierna',
    name: { en: 'Half Leg', es: 'Media Pierna' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Half leg hair removal by wax or machine.',
      es: 'Depilación de media pierna con cera o máquina.',
    },
    description: {
      en: 'Half leg hair removal from knee to ankle or from knee to thigh, using warm wax for thorough results or electric machine for sensitive skin. Leave with smooth, hair-free skin that lasts weeks.',
      es: 'Depilación de media pierna desde la rodilla hasta el tobillo o desde la rodilla hasta el muslo, con cera caliente para resultados completos o máquina para pieles sensibles. Sal con una piel suave y sin vello que dura semanas.',
    },
    waxPrice: 100_000,
    machinePrice: 70_000,
  },
  {
    id: 'depilacion-pierna-completa',
    name: { en: 'Full Leg', es: 'Pierna Completa' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Full leg hair removal by wax or machine.',
      es: 'Depilación de pierna completa con cera o máquina.',
    },
    description: {
      en: 'Complete full leg hair removal from ankle to hip using warm wax or electric machine. A comprehensive treatment that leaves both legs smooth and hair-free for weeks, performed with precision and care by our trained therapists.',
      es: 'Depilación completa de pierna desde el tobillo hasta la cadera con cera caliente o máquina eléctrica. Un tratamiento completo que deja ambas piernas suaves y sin vello durante semanas, realizado con precisión y cuidado por nuestras terapeutas.',
    },
    waxPrice: 150_000,
    machinePrice: 85_000,
  },
  {
    id: 'depilacion-pecho',
    name: { en: 'Chest', es: 'Pecho' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Chest hair removal by wax or machine.',
      es: 'Depilación de pecho con cera o máquina.',
    },
    description: {
      en: 'Professional chest hair removal using warm wax for a clean, long-lasting result or electric machine for sensitive skin. A popular treatment for men and women seeking a smooth, defined chest with minimal irritation.',
      es: 'Depilación profesional de pecho con cera caliente para un resultado limpio y duradero, o máquina eléctrica para pieles sensibles. Un tratamiento muy solicitado por hombres y mujeres que buscan un pecho liso y definido con mínima irritación.',
    },
    waxPrice: 80_000,
    machinePrice: 50_000,
  },
  {
    id: 'depilacion-espalda',
    name: { en: 'Back', es: 'Espalda' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Back hair removal by wax or machine.',
      es: 'Depilación de espalda con cera o máquina.',
    },
    description: {
      en: 'Full back hair removal using warm wax or electric machine. Our therapists work methodically across the entire back for a uniform, smooth result. Ideal for those seeking a clean appearance before events, travel, or as part of a regular grooming routine.',
      es: 'Depilación completa de espalda con cera caliente o máquina eléctrica. Nuestras terapeutas trabajan metódicamente en toda la espalda para un resultado uniforme y suave. Ideal para quienes buscan una apariencia limpia antes de eventos, viajes o como parte de una rutina de cuidado regular.',
    },
    waxPrice: 60_000,
    machinePrice: 40_000,
  },
  {
    id: 'depilacion-zona-perianal',
    name: { en: 'Perianal Zone', es: 'Zona Perianal' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Perianal area hair removal by wax or machine.',
      es: 'Depilación de zona perianal con cera o máquina.',
    },
    description: {
      en: 'Professional perianal area hair removal performed with maximum discretion and care by our trained therapists. Available with warm wax or electric machine, using only the highest-hygiene standards and gentle technique for this sensitive zone.',
      es: 'Depilación profesional de la zona perianal realizada con máxima discreción y cuidado por nuestras terapeutas capacitadas. Disponible con cera caliente o máquina eléctrica, utilizando los más altos estándares de higiene y técnica suave para esta zona sensible.',
    },
    waxPrice: 60_000,
    machinePrice: 45_000,
  },
  {
    id: 'depilacion-cuerpo-completo',
    name: { en: 'Full Body', es: 'Cuerpo Completo' },
    category: { en: 'Hair Removal', es: 'Depilación' },
    categoryId: 'hair-removal' as const,
    pricingModel: 'wax-machine' as const,
    shortDesc: {
      en: 'Complete full-body hair removal by wax or machine.',
      es: 'Depilación completa de cuerpo con cera o máquina.',
    },
    description: {
      en: 'Comprehensive full-body hair removal in a single session using warm wax or electric machine. Covers legs, arms, underarms, bikini area, chest, back, and more. Our therapists work efficiently and with care to deliver a uniformly smooth result from head to toe.',
      es: 'Depilación completa de cuerpo en una sola sesión con cera caliente o máquina eléctrica. Incluye piernas, brazos, axilas, zona de bikini, pecho, espalda y más. Nuestras terapeutas trabajan con eficiencia y cuidado para ofrecer un resultado uniformemente suave de pies a cabeza.',
    },
    waxPrice: 400_000,
    machinePrice: 250_000,
  },
] as const satisfies readonly ServiceDef[]

export type ServiceId = (typeof SERVICES)[number]['id']

/** e.g. 120_000 → `$ 120.000 COP` (Colombian-style grouping). */
export function formatCop(amount: number): string {
  const n = Math.round(amount)
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$ ${grouped} COP`
}

export function getServiceById(id: string): ServiceDef | undefined {
  return (SERVICES as unknown as ServiceDef[]).find(s => s.id === id)
}

export function getServicePrice(serviceId: string, minutes: number): number | undefined {
  if (minutes !== 30 && minutes !== 60 && minutes !== 90) return undefined
  const s = getServiceById(serviceId)
  if (!s || s.pricingModel !== 'duration') return undefined
  return s.prices[minutes as DurationMinutes]
}

export function serviceDisplayName(s: ServiceDef, locale: 'en' | 'es'): string {
  return locale === 'en' ? s.name.en : s.name.es
}
