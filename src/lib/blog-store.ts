import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbDelete, sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

// Backend preference: Supabase (`blog_posts` table, full post in a jsonb `data`
// column) → Vercel KV → data/posts.json. Schema: supabase/migrations/0001_init.sql.

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlogCategory = 'bienestar' | 'novedades' | 'servicios'

export type BlogPost = {
  id: string
  slug: string                         // URL slug e.g. "beneficios-masaje-relajante"
  title: { es: string; en?: string }
  excerpt: { es: string; en?: string }
  content: { es: string; en?: string } // Rich HTML content
  coverUrl?: string
  category: BlogCategory
  locales: ('es' | 'en')[]             // Which languages are published
  publishedAt: string                  // ISO string
  isDraft: boolean
  authorName: string
}

// ─── File fallback (local / dev) ─────────────────────────────────────────────

const FILE = process.env.POSTS_FILE ?? join(process.cwd(), 'data', 'posts.json')
const KV_KEY = 'blog:posts'

async function readFilePosts(): Promise<BlogPost[]> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return Array.isArray(data) ? (data as BlogPost[]) : []
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return []
    throw e
  }
}

async function writeFilePosts(posts: BlogPost[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(posts, null, 2), 'utf8')
}

// ─── KV helpers ──────────────────────────────────────────────────────────────

function parseKvPosts(raw: unknown): BlogPost[] {
  if (!Array.isArray(raw)) return []
  const posts: BlogPost[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      try { posts.push(JSON.parse(item) as BlogPost) } catch { /* skip */ }
    } else if (item && typeof item === 'object') {
      posts.push(item as BlogPost)
    }
  }
  return posts
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function readAllPosts(): Promise<BlogPost[]> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<{ data: BlogPost }>('blog_posts', 'select=data&order=published_at.asc')
    return rows.map(r => r.data)
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['LRANGE', KV_KEY, 0, -1])
    return parseKvPosts(raw)
  }
  return readFilePosts()
}

export async function readPublishedPosts(locale?: 'es' | 'en'): Promise<BlogPost[]> {
  const all = await readAllPosts()
  return all
    .filter(p => !p.isDraft)
    .filter(p => !locale || p.locales.includes(locale))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await readAllPosts()
  return all.find(p => p.slug === slug) ?? null
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const all = await readAllPosts()
  return all.find(p => p.id === id) ?? null
}

export async function savePost(data: Omit<BlogPost, 'id'> & { id?: string }): Promise<BlogPost> {
  const all = await readAllPosts()
  const existing = data.id ? all.findIndex(p => p.id === data.id) : -1

  const post: BlogPost = {
    ...data,
    id: data.id ?? randomUUID(),
    publishedAt: data.publishedAt ?? new Date().toISOString(),
  }

  if (existing >= 0) {
    // Update existing — remove and re-append
    all.splice(existing, 1)
  }

  if (supabaseConfigured()) {
    await sbUpsert('blog_posts', { id: post.id, data: post })
  } else if (kvConfigured()) {
    if (existing >= 0) {
      // Rebuild list: LRANGE → filter out old → push all + new
      const filtered = all.filter(p => p.id !== post.id)
      // Delete and re-populate
      await kvCommand(['DEL', KV_KEY])
      for (const p of filtered) {
        await kvCommand(['RPUSH', KV_KEY, JSON.stringify(p)])
      }
    }
    await kvCommand(['RPUSH', KV_KEY, JSON.stringify(post)])
  } else {
    all.push(post)
    await writeFilePosts(all)
  }

  return post
}

export async function deletePost(id: string): Promise<void> {
  if (supabaseConfigured()) {
    await sbDelete('blog_posts', `id=eq.${id}`)
    return
  }

  const all = await readAllPosts()
  const filtered = all.filter(p => p.id !== id)

  if (kvConfigured()) {
    await kvCommand(['DEL', KV_KEY])
    for (const p of filtered) {
      await kvCommand(['RPUSH', KV_KEY, JSON.stringify(p)])
    }
  } else {
    await writeFilePosts(filtered)
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
