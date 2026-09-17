/**
 * masajes-category.ts
 * ────────────────────
 * SEO layer for the new /[lang]/masajes category taxonomy — sits ALONGSIDE
 * the existing /services/[serviceId] routes (services.ts / service-seo.ts),
 * never modifies them. Additive only, so nothing already indexed or running
 * SEM can regress.
 *
 * Keyword research source: keyword-planner exports (masajes_hombres-mujeres.csv,
 * masajes_exclusivos.csv), cross-referenced against 16 months of GSC data.
 * See /es/masajes navigation-tree planning (Sept 2026) for the full rationale.
 *
 * Pricing, descriptions, durations still come from services.ts via
 * getServiceById() — this file only adds the keyword-optimized title/
 * description/h1/keywords layer plus the new nav-friendly ES slugs.
 */

import { getServiceById, type ServiceDef } from './services'

export type MasajeTypeSeo = {
  /** services.ts `id` this entry maps to — the single source of truth for price/description. */
  serviceId: string
  /** New nav slug under /es/masajes/[slug]. EN keeps the existing slugEn (no separate EN keyword pass done yet). */
  slugEs: string
  metaTitle: { es: string; en: string }
  metaDescription: { es: string; en: string }
  h1: { es: string; en: string }
  /** Comma-separated, mirrors services.ts keyword conventions used elsewhere. */
  keywords: string
  /** Primary + secondary keywords this page targets — kept for editorial reference, not rendered. */
  kwPrincipal: string
  kwSecundarias: string[]
  /** Richer, semantic-SEO paragraph — shown as the page's main intro. */
  intro: { es: string; en: string }
  /** 4 benefit bullets, specific to this technique. */
  benefits: { es: string[]; en: string[] }
  /** The "is this for you?" differentiator block — answers the visitor's real question. */
  idealFor: { es: string; en: string }
}

export const MASAJES_HUB_SEO = {
  metaTitle: {
    es: 'Masajes Terapéuticos en Medellín | Diamond Spa',
    en: 'Therapeutic Massages in Medellín | Diamond Spa',
  },
  metaDescription: {
    es: 'Descubre los 7 tipos de masaje terapéutico de Diamond Spa en El Poblado: relajante, deep tissue, deportivo, piedras volcánicas y más. Reserva en línea.',
    en: 'Discover Diamond Spa\u2019s 7 therapeutic massage types in El Poblado: relaxing, deep tissue, sports, hot stones and more. Book online.',
  },
  h1: {
    es: 'Masajes Terapéuticos en Medellín: Elige tu Experiencia',
    en: 'Therapeutic Massages in Medellín: Choose Your Experience',
  },
  kwPrincipal: 'masajes terapéuticos',
} as const

export const MASAJES_TYPE_SEO: MasajeTypeSeo[] = [
  {
    serviceId: 'relaxing',
    slugEs: 'relajante',
    metaTitle: {
      es: 'Masaje Relajante en Medellín | Diamond Spa El Poblado',
      en: 'Relaxing Massage in Medellín | Diamond Spa El Poblado',
    },
    metaDescription: {
      es: 'El masaje relajante más reconfortante de El Poblado. Movimientos suaves para liberar tensión y recuperar la calma en un ambiente privado. Reserva ya.',
      en: 'The most comforting relaxing massage in El Poblado. Gentle strokes to release tension and restore calm in a private setting. Book now.',
    },
    h1: { es: 'Masaje Relajante en Medellín', en: 'Relaxing Massage in Medellín' },
    keywords: 'masajes relajantes, masaje relaxante, masaje corporal relajante, masajes relajantes cerca de mí, spa masajes relajantes',
    kwPrincipal: 'masajes relajantes (390, Medio)',
    kwSecundarias: ['masaje relaxante', 'masaje corporal relajante', 'masajes relajantes cerca de mí', 'spa masajes relajantes'],
    intro: {
      es: 'El masaje relajante combina movimientos largos y envolventes con presión suave, diseñados para calmar el sistema nervioso y reducir el estrés acumulado. Es la puerta de entrada perfecta al mundo del bienestar corporal — sin técnicas invasivas, solo la calma que tu cuerpo necesita.',
      en: 'Relaxing massage combines long, flowing strokes with gentle pressure, designed to calm the nervous system and release accumulated stress. It\u2019s the perfect entry point into body wellness — no invasive techniques, just the calm your body needs.',
    },
    benefits: {
      es: ['Reduce el estrés y la ansiedad acumulada', 'Mejora la calidad del sueño', 'Disminuye la tensión muscular superficial', 'Favorece la circulación sanguínea'],
      en: ['Reduces stress and accumulated anxiety', 'Improves sleep quality', 'Eases superficial muscle tension', 'Boosts blood circulation'],
    },
    idealFor: {
      es: 'Ideal si llevas semanas sin desconectar, duermes mal o simplemente necesitas un espacio sin pantallas ni pendientes.',
      en: 'Ideal if you\u2019ve gone weeks without truly disconnecting, sleep poorly, or just need a screen-free space.',
    },
  },
  {
    serviceId: 'deep-tissue',
    slugEs: 'deep-tissue',
    metaTitle: {
      es: 'Masaje Descontracturante (Deep Tissue) en Medellín',
      en: 'Deep Tissue Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Alivio real para nudos musculares y tensión crónica. Masaje descontracturante Deep Tissue en El Poblado, con resultados desde la primera sesión.',
      en: 'Real relief for muscle knots and chronic tension. Deep Tissue massage in El Poblado, with results from your first session.',
    },
    h1: { es: 'Masaje Descontracturante (Deep Tissue)', en: 'Deep Tissue Massage' },
    keywords: 'masajes descontracturante, masaje de tejido profundo, deep tissue medellín, masaje descontracturante cervical',
    kwPrincipal: 'masajes descontracturante (140, Medio)',
    kwSecundarias: ['masaje de tejido profundo', 'deep tissue medellín', 'descontracturante', 'masaje descontracturante cervical'],
    intro: {
      es: 'El masaje descontracturante Deep Tissue trabaja capas musculares profundas con presión sostenida, liberando los nudos y adherencias que un masaje relajante no alcanza. No es para todos los días — es para cuando el cuerpo realmente lo necesita.',
      en: 'Deep Tissue massage works deep muscle layers with sustained pressure, releasing the knots and adhesions a relaxing massage can\u2019t reach. It\u2019s not an everyday massage — it\u2019s for when your body genuinely needs it.',
    },
    benefits: {
      es: ['Libera nudos musculares y puntos gatillo', 'Alivia dolor lumbar y cervical crónico', 'Mejora el rango de movimiento articular', 'Complementa la recuperación post-entrenamiento'],
      en: ['Releases muscle knots and trigger points', 'Eases chronic lower back and neck pain', 'Improves joint range of motion', 'Complements post-workout recovery'],
    },
    idealFor: {
      es: 'Ideal si pasas muchas horas sentado, cargas tensión en cuello y espalda, o entrenas con intensidad.',
      en: 'Ideal if you sit for long hours, carry tension in your neck and back, or train intensely.',
    },
  },
  {
    serviceId: 'four-hands',
    slugEs: '4-manos',
    metaTitle: {
      es: 'Masaje a 4 Manos en Medellín | Diamond Spa',
      en: 'Four Hands Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Dos terapeutas, un mismo ritmo. Vive el masaje a cuatro manos más envolvente de El Poblado, una experiencia sensorial que el cuerpo no olvida.',
      en: 'Two therapists, one rhythm. Experience the most immersive four hands massage in El Poblado — a sensory experience the body won\u2019t forget.',
    },
    h1: { es: 'Masaje a 4 Manos en Medellín', en: 'Four Hands Massage in Medellín' },
    keywords: 'masaje a cuatro manos, masaje a 4 manos, masaje 4 manos, masaje de 4 manos',
    kwPrincipal: 'masaje a cuatro manos (10, Medio)',
    kwSecundarias: ['masaje a 4 manos', 'masaje 4 manos', 'masaje de 4 manos', 'masaje 4 manos beneficios'],
    intro: {
      es: 'El masaje a cuatro manos sincroniza a dos terapeutas trabajando al mismo tiempo, duplicando el estímulo sensorial sin duplicar el esfuerzo. Es una experiencia envolvente que el cuerpo procesa de forma completamente distinta a un masaje individual.',
      en: 'Four hands massage syncs two therapists working at once, doubling the sensory input without doubling the effort. It\u2019s an immersive experience the body processes completely differently from a solo massage.',
    },
    benefits: {
      es: ['Estimulación sensorial completa y simultánea', 'Sesión más profunda en el mismo tiempo', 'Relajación total del sistema nervioso', 'Una experiencia que se recuerda'],
      en: ['Complete, simultaneous sensory stimulation', 'A deeper session in the same amount of time', 'Total nervous system relaxation', 'An experience you\u2019ll remember'],
    },
    idealFor: {
      es: 'Ideal para ocasiones especiales, cumpleaños o cuando quieres llevar tu momento de relajación al siguiente nivel.',
      en: 'Ideal for special occasions, birthdays, or when you want to take your relaxation to the next level.',
    },
  },

  {
    serviceId: 'duo',
    slugEs: 'duo',
    metaTitle: {
      es: 'Masaje en Pareja en Medellín | Diamond Spa',
      en: 'Duo Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Comparte un momento único. Sala privada, dos terapeutas y una experiencia de masaje en pareja pensada para vivirla junto a quien tú elijas.',
      en: 'Share a unique moment. A private room, two therapists, and a duo massage experience designed to enjoy alongside whoever you choose.',
    },
    h1: { es: 'Masaje en Pareja (Duo) en Medellín', en: 'Duo Massage in Medellín' },
    keywords: 'masaje pareja, masajes para pareja, masaje en pareja, spa masajes para parejas',
    kwPrincipal: 'masaje pareja (40, Alto)',
    kwSecundarias: ['masajes para pareja', 'masaje en pareja', 'spa masajes para parejas'],
    intro: {
      es: 'El masaje en pareja se realiza en una sala privada, con dos terapeutas trabajando en simultáneo sobre ti y tu acompañante. Comparten el espacio y el momento, cada uno con su propia sesión personalizada.',
      en: 'Duo massage takes place in a private room, with two therapists working at once on you and your companion. You share the space and the moment, each with your own personalized session.',
    },
    benefits: {
      es: ['Comparte un momento de bienestar real', 'Cada persona recibe atención personalizada', 'Sala privada exclusiva para dos', 'Ideal para fortalecer vínculos'],
      en: ['Share a genuine wellness moment', 'Each person gets personalized attention', 'A private room exclusively for two', 'Great for strengthening bonds'],
    },
    idealFor: {
      es: 'Ideal para parejas, amigas o cualquier ocasión que quieras celebrar acompañado.',
      en: 'Ideal for couples, friends, or any occasion worth celebrating together.',
    },
  },
  {
    serviceId: 'hot-stones',
    slugEs: 'piedras-volcanicas',
    metaTitle: {
      es: 'Masaje con Piedras Volcánicas en Medellín',
      en: 'Volcanic Stone Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Siente el calor curativo de la tierra. Masaje con piedras volcánicas calientes que penetra el músculo y libera tensión crónica en El Poblado.',
      en: 'Feel the earth\u2019s healing warmth. A hot volcanic stone massage that penetrates deep into the muscle and releases chronic tension in El Poblado.',
    },
    h1: { es: 'Masaje con Piedras Volcánicas', en: 'Volcanic Stone Massage' },
    keywords: 'piedras volcánicas para masaje, masaje con piedras volcánicas, masaje con piedras calientes, piedras calientes para masaje',
    kwPrincipal: 'piedras volcánicas para masaje (50, Alto)',
    kwSecundarias: ['masaje con piedras volcánicas', 'masaje con piedras calientes', 'piedras calientes para masaje'],
    intro: {
      es: 'El masaje con piedras volcánicas combina la técnica manual con piedras calientes colocadas sobre puntos energéticos clave. El calor profundo relaja la musculatura antes de que empiece el trabajo manual, permitiendo una presión más profunda sin más incomodidad.',
      en: 'Volcanic stone massage combines manual technique with hot stones placed on key energy points. Deep heat relaxes the muscles before the manual work begins, allowing for deeper pressure with less discomfort.',
    },
    benefits: {
      es: ['El calor relaja la musculatura en profundidad', 'Mejora la circulación sanguínea local', 'Permite mayor presión con menos molestia', 'Sensación única de calidez y bienestar'],
      en: ['Heat relaxes muscles at a deep level', 'Improves local blood circulation', 'Allows deeper pressure with less discomfort', 'A uniquely warm, soothing sensation'],
    },
    idealFor: {
      es: 'Ideal si sientes frío con facilidad o buscas una experiencia sensorial distinta a un masaje tradicional.',
      en: 'Ideal if you get cold easily or want a sensory experience different from a traditional massage.',
    },
  },
  {
    serviceId: 'sports',
    slugEs: 'deportivo',
    metaTitle: {
      es: 'Masaje Deportivo en Medellín | Diamond Spa',
      en: 'Sports Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Lleva tu recuperación al siguiente nivel. Terapia profunda más pistola de percusión para eliminar fatiga y prevenir lesiones en El Poblado.',
      en: 'Take your recovery to the next level. Deep tissue therapy plus percussion gun to eliminate fatigue and prevent injuries in El Poblado.',
    },
    h1: { es: 'Masaje Deportivo en Medellín', en: 'Sports Massage in Medellín' },
    keywords: 'masaje deportivo, masajes deportivo, masaje deporte, masaje quiropráctico',
    kwPrincipal: 'masaje deportivo (90, Bajo)',
    kwSecundarias: ['masajes deportivo', 'masaje deporte', 'masaje quiropráctico', 'masaje deportivo precio'],
    intro: {
      es: 'El masaje deportivo combina terapia manual profunda con pistola de percusión, enfocado en la recuperación muscular y la prevención de lesiones. Está pensado para cuerpos que entrenan, no solo para relajarse.',
      en: 'Sports massage combines deep manual therapy with a percussion gun, focused on muscle recovery and injury prevention. It\u2019s built for bodies that train, not just relax.',
    },
    benefits: {
      es: ['Acelera la recuperación muscular post-entrenamiento', 'Reduce el riesgo de lesiones por sobrecarga', 'Mejora la flexibilidad y el rendimiento', 'Combina técnica manual con pistola de percusión'],
      en: ['Speeds up post-workout muscle recovery', 'Reduces the risk of overuse injuries', 'Improves flexibility and performance', 'Combines manual technique with a percussion gun'],
    },
    idealFor: {
      es: 'Ideal si entrenas regularmente, corres, haces pesas o cualquier deporte que exija recuperación real.',
      en: 'Ideal if you train regularly, run, lift, or play any sport that demands real recovery.',
    },
  },
  {
    serviceId: 'sensitive',
    slugEs: 'sensitivo',
    metaTitle: {
      es: 'Masaje Sensitivo en Medellín | Diamond Spa',
      en: 'Sensitive Massage in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Una experiencia sensorial completa. Movimientos suaves y elementos de textura que despiertan los sentidos en un ambiente exclusivo y privado.',
      en: 'A complete sensory experience. Gentle movements and textured elements that awaken the senses in an exclusive, private setting.',
    },
    h1: { es: 'Masaje Sensitivo en Medellín', en: 'Sensitive Massage in Medellín' },
    keywords: 'masajes sensorial, masaje sensitivo, masaje californiano sensitivo, masaje relajante sensitivo',
    kwPrincipal: 'masajes sensorial (30, Medio)',
    kwSecundarias: ['masaje sensitivo', 'masaje sensorial', 'masaje californiano sensitivo', 'masaje relajante sensitivo'],
    intro: {
      es: 'El masaje sensitivo trabaja con movimientos suaves y elementos de textura variada, diseñado para despertar los sentidos más allá de lo que logra un masaje convencional. Una experiencia sensorial completa en un ambiente exclusivo y privado.',
      en: 'Sensitive massage uses gentle movements and varied textures, designed to awaken the senses beyond what a conventional massage achieves. A complete sensory experience in an exclusive, private setting.',
    },
    benefits: {
      es: ['Estimulación sensorial completa', 'Ambiente exclusivo y privado', 'Experiencia distinta a un masaje convencional', 'Ideal para desconectar de la rutina'],
      en: ['Complete sensory stimulation', 'Exclusive, private setting', 'An experience unlike a conventional massage', 'Perfect for disconnecting from routine'],
    },
    idealFor: {
      es: 'Ideal si buscas algo diferente a lo convencional, una experiencia sensorial completa.',
      en: 'Ideal if you\u2019re looking for something different from the conventional, a complete sensory experience.',
    },
  },
]

export function getMasajeTypeBySlug(slug: string, locale: 'es' | 'en'): MasajeTypeSeo | undefined {
  if (locale === 'es') return MASAJES_TYPE_SEO.find(t => t.slugEs === slug)
  // EN keeps the existing services.ts slugEn values — no separate EN keyword pass yet.
  return MASAJES_TYPE_SEO.find(t => getServiceById(t.serviceId)?.slugEn === slug)
}

export function slugForMasajeType(entry: MasajeTypeSeo, locale: 'es' | 'en', service: ServiceDef): string {
  return locale === 'es' ? entry.slugEs : service.slugEn
}
