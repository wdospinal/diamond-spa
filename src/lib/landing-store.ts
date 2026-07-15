import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbDelete, sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

// Backend preference: Supabase (`landings` table, full page in a jsonb `data`
// column) → Vercel KV → data/landings.json. Schema: supabase/migrations/0001_init.sql.

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * SEO & structured data config managed from the admin.
 * Stored per locale so each language can have independent metadata.
 */
export type LandingLocaleData = {
  /** <title> tag */
  metaTitle: string
  /** <meta name="description"> */
  metaDescription: string
  /**
   * Raw JSON-LD objects to inject as <script type="application/ld+json">.
   * Stored as a JSON string so non-technical admins can paste/edit them.
   * The API validates it is parseable before saving.
   */
  jsonLd: string
}

/**
 * SEM / Google Ads config for this landing page.
 * Controls the behaviour when ?utm_source=ads (or a custom trigger) is detected.
 */
export type LandingSemConfig = {
  /** Whether to hide the global nav + footer when the ads param is present. */
  hideChrome: boolean
  /** Whether to show the global floating WhatsApp button on this landing page (default: true). */
  showFloatingWa?: boolean
  /**
   * The URL query-string key that triggers SEM mode (default: 'utm_source').
   * The value must match `semTriggerValue` to activate.
   */
  semTriggerKey: string
  /**
   * The value of the trigger key that activates SEM mode (default: 'ads').
   * e.g. utm_source=ads → hide nav & footer.
   */
  semTriggerValue: string
}

export type LandingContent = {
  hero: {
    h1: string
    subtitle: string
    bgImage: string
    primaryCtaText: string
    secondaryCtaText: string
  }
  trustBar: {
    location: string
    hours: string
    certified: string
    response: string
  }
  services: {
    title: string
    serviceIds: string[]
  }
  whyUs: {
    title: string
    pillars: { icon: string; title: string; body: string }[]
  }
  gallery: {
    images: { url: string; title?: string }[] | string[]
  }
  testimonials: {
    title: string
    items: { name: string; city: string; text: string }[]
  }
  location: {
    address: string
    hours: string
    mapEmbedUrl: string
  }
  faqs: {
    title: string
    items: { question: string; answer: string }[]
  }
  finalCta: {
    title: string
    buttonText: string
    phoneText: string
  }
}

export type LandingPage = {
  id: string
  /** Human-readable internal name, never shown publicly (e.g. "Masajes - Ads Q3 2026") */
  name: string
  /**
   * The URL path this config applies to — without the locale prefix.
   * e.g. "/massage-medellin" or "/limpieza-facial-medellin"
   */
  path: string
  /** Per-locale SEO metadata */
  seo: {
    es: LandingLocaleData
    en?: LandingLocaleData
  }
  /** SEM / Google Ads behaviour */
  sem: LandingSemConfig
  /** Dynamic content blocks — Spanish (default locale) */
  content?: LandingContent
  /**
   * Optional English content override.
   * When locale === 'en' and this field exists, it takes precedence over `content`.
   * This allows a single landing record to serve both /es/... and /en/... routes
   * without duplicating the entire page config.
   */
  content_en?: LandingContent
  /** Whether this config is active. Inactive configs are ignored at runtime. */
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── File fallback (local / dev) ─────────────────────────────────────────────

const FILE = process.env.LANDINGS_FILE ?? join(process.cwd(), 'data', 'landings.json')
const KV_KEY = 'landings:pages'

async function readFileLandings(): Promise<LandingPage[]> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return Array.isArray(data) ? (data as LandingPage[]) : []
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return []
    throw e
  }
}

async function writeFileLandings(pages: LandingPage[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(pages, null, 2), 'utf8')
}

// ─── KV helpers ──────────────────────────────────────────────────────────────

function parseKvLandings(raw: unknown): LandingPage[] {
  if (!Array.isArray(raw)) return []
  const pages: LandingPage[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      try { pages.push(JSON.parse(item) as LandingPage) } catch { /* skip */ }
    } else if (item && typeof item === 'object') {
      pages.push(item as LandingPage)
    }
  }
  return pages
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function readAllLandings(): Promise<LandingPage[]> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<{ data: LandingPage }>('landings', 'select=data&order=updated_at.asc')
    return rows.map(r => r.data)
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['LRANGE', KV_KEY, 0, -1])
    return parseKvLandings(raw)
  }
  return readFileLandings()
}

export async function getLandingById(id: string): Promise<LandingPage | null> {
  const all = await readAllLandings()
  return all.find(p => p.id === id) ?? null
}

/**
 * Find the active landing config for a given path.
 * Called at render time by the page to get its metadata overrides.
 */
export async function getLandingByPath(path: string): Promise<LandingPage | null> {
  const all = await readAllLandings()
  return all.find(p => p.isActive && p.path === path) ?? null
}

export async function saveLanding(
  data: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<LandingPage> {
  const all = await readAllLandings()
  const existingIdx = data.id ? all.findIndex(p => p.id === data.id) : -1

  const now = new Date().toISOString()
  const page: LandingPage = {
    ...data,
    id: data.id ?? randomUUID(),
    createdAt: existingIdx >= 0 ? all[existingIdx].createdAt : now,
    updatedAt: now,
  }

  if (supabaseConfigured()) {
    await sbUpsert('landings', { id: page.id, data: page })
  } else if (kvConfigured()) {
    if (existingIdx >= 0) {
      const filtered = all.filter(p => p.id !== page.id)
      await kvCommand(['DEL', KV_KEY])
      for (const p of filtered) {
        await kvCommand(['RPUSH', KV_KEY, JSON.stringify(p)])
      }
    }
    await kvCommand(['RPUSH', KV_KEY, JSON.stringify(page)])
  } else {
    if (existingIdx >= 0) {
      all.splice(existingIdx, 1)
    }
    all.push(page)
    await writeFileLandings(all)
  }

  return page
}

export async function deleteLanding(id: string): Promise<void> {
  if (supabaseConfigured()) {
    await sbDelete('landings', `id=eq.${id}`)
    return
  }

  const all = await readAllLandings()
  const filtered = all.filter(p => p.id !== id)

  if (kvConfigured()) {
    await kvCommand(['DEL', KV_KEY])
    for (const p of filtered) {
      await kvCommand(['RPUSH', KV_KEY, JSON.stringify(p)])
    }
  } else {
    await writeFileLandings(filtered)
  }
}

/** Returns default SEM config values so forms always have a starting point. */
export function defaultSemConfig(): LandingSemConfig {
  return {
    hideChrome: true,
    showFloatingWa: true,
    semTriggerKey: 'utm_source',
    semTriggerValue: 'ads',
  }
}

/** Returns an empty locale data object. */
export function defaultLocaleData(): LandingLocaleData {
  return {
    metaTitle: '',
    metaDescription: '',
    jsonLd: '',
  }
}
