import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import {
  readAllLandings,
  saveLanding,
  getLandingById,
  defaultSemConfig,
  defaultLocaleData,
  type LandingLocaleData,
  type LandingSemConfig,
} from '@/lib/landing-store'
import { KNOWN_PAGES } from '@/lib/known-pages'


function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

async function isAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

function parseJsonLd(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    JSON.parse(trimmed) // validate it is parseable
    return trimmed
  } catch {
    throw new Error('El JSON-LD no es JSON válido')
  }
}

function extractLocaleData(body: Record<string, unknown>, prefix: 'es' | 'en'): LandingLocaleData {
  return {
    metaTitle:       typeof body[`${prefix}MetaTitle`]       === 'string' ? (body[`${prefix}MetaTitle`] as string).trim()       : '',
    metaDescription: typeof body[`${prefix}MetaDescription`] === 'string' ? (body[`${prefix}MetaDescription`] as string).trim() : '',
    jsonLd:          parseJsonLd(body[`${prefix}JsonLd`]),
  }
}

function extractSemConfig(body: Record<string, unknown>): LandingSemConfig {
  const defaults = defaultSemConfig()
  return {
    hideChrome:       body.semHideChrome       === false ? false : defaults.hideChrome,
    showFloatingWa:   body.semShowFloatingWa   === false ? false : defaults.showFloatingWa,
    semTriggerKey:    typeof body.semTriggerKey   === 'string' && body.semTriggerKey.trim()   ? (body.semTriggerKey as string).trim()   : defaults.semTriggerKey,
    semTriggerValue:  typeof body.semTriggerValue === 'string' && body.semTriggerValue.trim() ? (body.semTriggerValue as string).trim() : defaults.semTriggerValue,
  }
}

// GET /api/landings — merged view: all known pages + saved configs (admin only)
export async function GET() {
  if (!(await isAdmin())) return unauthorized()

  const savedPages = await readAllLandings()
  const savedByPath = new Map(savedPages.map(p => [p.path, p]))

  /**
   * Build the merged list:
   * 1. Start with all known pages from the registry.
   * 2. Enrich each with its saved config (if any).
   * 3. Append any extra saved configs whose path isn't in the registry.
   */
  const knownPaths = new Set(KNOWN_PAGES.map(k => k.path))

  const merged = KNOWN_PAGES.map(k => ({
    knownPage: k,
    config: savedByPath.get(k.path) ?? null,
  }))

  // Extra pages saved via the admin that aren't in the registry
  const extras = savedPages
    .filter(p => !knownPaths.has(p.path))
    .map(p => ({ knownPage: null, config: p }))

  return NextResponse.json({ pages: [...merged, ...extras] })
}


// POST /api/landings — create or update a landing config (admin only)
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return bad('El nombre interno es requerido')

  const path = typeof body.path === 'string' ? body.path.trim() : ''
  if (!path) return bad('La ruta (path) es requerida')
  if (!path.startsWith('/')) return bad('La ruta debe comenzar con /')

  let esData: LandingLocaleData
  let enData: LandingLocaleData | undefined
  let semConfig: LandingSemConfig

  try {
    esData     = extractLocaleData(body, 'es')
    semConfig  = extractSemConfig(body)

    const hasEn = body.hasEn === true
    enData = hasEn ? extractLocaleData(body, 'en') : undefined
  } catch (err: unknown) {
    return bad(err instanceof Error ? err.message : 'Error de validación')
  }

  const existingId = typeof body.id === 'string' ? body.id : undefined
  const existingPage = existingId ? await getLandingById(existingId) : null

  const page = await saveLanding({
    id: existingId,
    name,
    path,
    seo: {
      es: esData,
      ...(enData ? { en: enData } : {}),
    },
    sem: semConfig,
    isActive: body.isActive !== false,
    ...(existingPage && existingPage.content ? { content: existingPage.content } : {}),
  })

  return NextResponse.json({ page }, { status: existingId ? 200 : 201 })
}
