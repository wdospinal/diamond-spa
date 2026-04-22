/**
 * Single source of truth for all Diamond Spa business information.
 * Import from here instead of hardcoding values across files.
 */

// Re-export all services, types and helpers so callers only need one import
export {
  SERVICES,
  DURATION_MINUTES,
  formatCop,
  getServiceById,
  getServicePrice,
  serviceDisplayName,
} from './services'
export type { ServiceDef, ServiceId, DurationMinutes } from './services'

// ─── Identity ─────────────────────────────────────────────────────────────────

export const SPA_NAME = 'Diamond Spa'
export const SPA_NAME_FULL = 'Diamond Spa Medellín'

export const SPA_TAGLINE = {
  en: 'Quiet luxury, deep recovery.',
  es: 'Lujo silencioso, recuperación profunda.',
} as const

export const SPA_DESCRIPTION = {
  en: 'Discover a sanctuary of relaxation where comfort, elegance and well-being unite in perfect harmony',
  es: 'Descubre una joya de relajación donde el confort, la elegancia y el bienestar se unen en perfecta armonía',
} as const

export const SPA_FOUNDED = 2026

// ─── Contact ──────────────────────────────────────────────────────────────────

export const SPA_EMAIL = 'book@diamondspa.com.co'

export const SPA_PHONES = [
  { display: '+57 305 4541635', wa: '573054541635' },
  { display: '+57 305 2263648', wa: '573052263648' },
] as const

export const SPA_INSTAGRAM = 'https://www.instagram.com/diamondmassagesmed/'

export const SPA_WHATSAPP_GREETING = {
  en: 'Hello, I would like to speak with the receptionist at Diamond Spa.',
  es: 'Hola, quisiera hablar con la recepcionista de Diamond Spa.',
} as const

// ─── Location ─────────────────────────────────────────────────────────────────

export const SPA_ADDRESS = {
  street: 'Cra 43C #10-42',
  neighborhood: 'El Poblado',
  city: 'Medellín',
  region: 'Antioquia',
  postalCode: '050021',
  country: 'CO',
  /** Full single-line display string */
  full: 'Cra 43C #10-42, El Poblado, Medellín, Antioquia',
} as const

export const SPA_GEO = {
  latitude: 6.2072,
  longitude: -75.5680,
} as const

export const SPA_GOOGLE_PLACES_ID = 'ChIJKzwytpApRI4RjIhtXLsMvK8'

export const SPA_DIRECTIONS = {
  driving: {
    en: '5 min drive from Parque El Poblado',
    es: '5 min en carro desde el Parque El Poblado',
  },
  parking: {
    en: 'Parking is available in front of the premises',
    es: 'Zona de parqueo disponible frente al local',
  },
  airport: {
    en: '25 min from Olaya Herrera Airport',
    es: '25 min desde el Aeropuerto Olaya Herrera',
  },
} as const

// ─── Business hours ───────────────────────────────────────────────────────────

export const SPA_HOURS = [
  {
    days: { en: 'Monday – Saturday', es: 'Lunes – Sábado' },
    /** ISO 24h format for schema.org / JSON-LD */
    opens: '10:00',
    closes: '22:00',
    /** Display format */
    display: '10:00 AM – 10:00 PM',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    days: { en: 'Sunday', es: 'Domingo' },
    opens: '10:00',
    closes: '18:00',
    display: '10:00 AM – 7:00 PM',
    dayOfWeek: ['Sunday'],
  },
] as const

// ─── SEO / URLs ───────────────────────────────────────────────────────────────

export const SPA_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://diamondspa.com.co'

export const SPA_OG_IMAGE = `${SPA_BASE_URL}/og-image.jpg`
export const SPA_LOGO = `${SPA_BASE_URL}/logo.png`

export const SPA_KEYWORDS =
  'spa medellin, masajes medellin, masajes para hombres en medellin, masajes medellin para hombres, spa para hombres medellin, masajes el poblado, spa el poblado, diamond spa, masajes de lujo, medellin antioquia, masaje relajante medellin, masaje deportivo medellin, deep tissue medellin, depilacion masculina medellin, spa para mujeres medellin'

// ─── WhatsApp helper ──────────────────────────────────────────────────────────

export function randomWhatsAppUrl(text: string): string {
  const { wa } = SPA_PHONES[Math.floor(Math.random() * SPA_PHONES.length)]
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
}
