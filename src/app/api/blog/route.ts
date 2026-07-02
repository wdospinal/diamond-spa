import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { readAllPosts, readPublishedPosts, savePost, slugify } from '@/lib/blog-store'

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

// GET /api/blog — list posts
// Admin: all posts (with drafts). Public: only published, filter by ?lang=es|en
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') as 'es' | 'en' | null
  const admin = searchParams.get('admin') === 'true'

  if (admin) {
    if (!(await isAdmin())) return unauthorized()
    const posts = await readAllPosts()
    return NextResponse.json({ posts })
  }

  const posts = await readPublishedPosts(lang ?? undefined)
  return NextResponse.json({ posts })
}

// POST /api/blog — create or update a post (admin only)
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const titleEs = typeof body.titleEs === 'string' ? body.titleEs.trim() : ''
  if (!titleEs) return bad('El título en español es requerido')

  const excerptEs = typeof body.excerptEs === 'string' ? body.excerptEs.trim() : ''
  if (!excerptEs) return bad('El extracto en español es requerido')

  const contentEs = typeof body.contentEs === 'string' ? body.contentEs.trim() : ''
  if (!contentEs) return bad('El contenido en español es requerido')

  const category = body.category as string
  if (!['bienestar', 'novedades', 'servicios'].includes(category)) {
    return bad('Categoría inválida')
  }

  const locales = Array.isArray(body.locales) ? body.locales as ('es' | 'en')[] : ['es'] as ('es' | 'en')[]
  if (locales.length === 0) return bad('Debes seleccionar al menos un idioma')

  // Validate: if EN locale is selected, EN content is required
  const titleEn = typeof body.titleEn === 'string' ? body.titleEn.trim() : undefined
  const excerptEn = typeof body.excerptEn === 'string' ? body.excerptEn.trim() : undefined
  const contentEn = typeof body.contentEn === 'string' ? body.contentEn.trim() : undefined

  if (locales.includes('en') && (!titleEn || !excerptEn || !contentEn)) {
    return bad('Si publicas en inglés, el título, extracto y contenido en inglés son requeridos')
  }

  const existingId = typeof body.id === 'string' ? body.id : undefined

  // Generate slug from Spanish title if not provided
  const rawSlug = typeof body.slug === 'string' && body.slug.trim()
    ? slugify(body.slug.trim())
    : slugify(titleEs)

  const post = await savePost({
    id: existingId,
    slug: rawSlug,
    title: { es: titleEs, ...(titleEn ? { en: titleEn } : {}) },
    excerpt: { es: excerptEs, ...(excerptEn ? { en: excerptEn } : {}) },
    content: { es: contentEs, ...(contentEn ? { en: contentEn } : {}) },
    coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl.trim() || undefined : undefined,
    category: category as 'bienestar' | 'novedades' | 'servicios',
    locales,
    publishedAt: typeof body.publishedAt === 'string' ? body.publishedAt : new Date().toISOString(),
    isDraft: body.isDraft === true,
    authorName: typeof body.authorName === 'string' ? body.authorName : 'Diamond Spa',
  })

  return NextResponse.json({ post }, { status: existingId ? 200 : 201 })
}
