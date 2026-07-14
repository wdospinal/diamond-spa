/**
 * Registry of all known public-facing pages in the app that could be
 * candidates for SEO overrides and/or SEM (Google Ads) campaigns.
 *
 * This list is the "source of truth" for the admin landing-pages panel.
 * Every time a new page is added to src/app/[lang]/, add an entry here
 * so it automatically appears in the admin with a "Create Config" button.
 *
 * The `path` must match the URL path WITHOUT the locale prefix, exactly
 * as it appears in the file-system router (src/app/[lang]/<path>/).
 */

export type KnownPage = {
  /** URL path without locale prefix, starting with /. e.g. "/massage-medellin" */
  path: string
  /** Display label for the admin UI */
  label: string
  /** Category for grouping in the admin */
  category: 'landing' | 'service' | 'info' | 'home'
}

export const KNOWN_PAGES: KnownPage[] = [
  // ─── High-value landing / campaign pages ─────────────────────────────────────
  { path: '/massage-medellin',       label: 'Masajes en Medellín',            category: 'landing' },
  { path: '/spa-el-poblado',         label: 'Spa El Poblado',                 category: 'landing' },
  { path: '/spa-near-me',            label: 'Spa Near Me (EN)',               category: 'landing' },
  { path: '/depilacion-medellin',    label: 'Depilación en Medellín',         category: 'landing' },
  { path: '/hydrafacial-medellin',   label: 'Hydrafacial Medellín',           category: 'landing' },
  { path: '/limpieza-facial-medellin', label: 'Limpieza Facial Medellín',     category: 'landing' },
  { path: '/masajes-para-hombres',   label: 'Masajes para Hombres',           category: 'landing' },
  { path: '/masajes-para-mujeres',   label: 'Masajes para Mujeres',           category: 'landing' },
  { path: '/dia-de-spa',             label: 'Día de Spa',                     category: 'landing' },

  // ─── Service / section pages ──────────────────────────────────────────────────
  { path: '/services',               label: 'Todos los Servicios',            category: 'service' },
  { path: '/book',                   label: 'Reservar Cita',                  category: 'service' },

  // ─── Info pages ───────────────────────────────────────────────────────────────
  { path: '/',                       label: 'Página Principal (Home)',         category: 'home'    },
  { path: '/about',                  label: 'Sobre Nosotros',                 category: 'info'    },
  { path: '/location',               label: 'Ubicación',                      category: 'info'    },
  { path: '/blog',                   label: 'Blog',                           category: 'info'    },
]

/** Ordered list of categories for display grouping */
export const PAGE_CATEGORIES: { id: KnownPage['category']; label: string; icon: string }[] = [
  { id: 'landing', label: 'Landings / Campañas',  icon: 'rocket_launch'    },
  { id: 'service', label: 'Páginas de Servicio',  icon: 'spa'              },
  { id: 'home',    label: 'Home',                 icon: 'home'             },
  { id: 'info',    label: 'Información',          icon: 'info'             },
]
