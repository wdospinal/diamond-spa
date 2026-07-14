import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getPostById, savePost, deletePost, slugify } from '@/lib/blog-store'

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

async function isAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

// GET /api/blog/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

// PUT /api/blog/[id] — update (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await getPostById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid JSON')
  }

  const titleEs = typeof body.titleEs === 'string' ? body.titleEs.trim() : existing.title.es
  const excerptEs = typeof body.excerptEs === 'string' ? body.excerptEs.trim() : existing.excerpt.es
  const contentEs = typeof body.contentEs === 'string' ? body.contentEs.trim() : existing.content.es
  const titleEn = typeof body.titleEn === 'string' ? body.titleEn.trim() || undefined : existing.title.en
  const excerptEn = typeof body.excerptEn === 'string' ? body.excerptEn.trim() || undefined : existing.excerpt.en
  const contentEn = typeof body.contentEn === 'string' ? body.contentEn.trim() || undefined : existing.content.en
  const locales = Array.isArray(body.locales) ? body.locales as ('es' | 'en')[] : existing.locales

  const rawSlug = typeof body.slug === 'string' && body.slug.trim()
    ? slugify(body.slug.trim())
    : existing.slug

  const updated = await savePost({
    ...existing,
    id,
    slug: rawSlug,
    title: { es: titleEs, ...(titleEn ? { en: titleEn } : {}) },
    excerpt: { es: excerptEs, ...(excerptEn ? { en: excerptEn } : {}) },
    content: { es: contentEs, ...(contentEn ? { en: contentEn } : {}) },
    coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl.trim() || undefined : existing.coverUrl,
    category: (body.category as 'bienestar' | 'novedades' | 'servicios') ?? existing.category,
    locales,
    isDraft: typeof body.isDraft === 'boolean' ? body.isDraft : existing.isDraft,
    authorName: typeof body.authorName === 'string' ? body.authorName : existing.authorName,
  })

  return NextResponse.json({ post: updated })
}

// DELETE /api/blog/[id] — delete (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await getPostById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deletePost(id)
  return NextResponse.json({ success: true })
}
