'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost, BlogCategory } from '@/lib/blog-store'

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  bienestar: 'Bienestar',
  novedades: 'Novedades',
  servicios:  'Servicios',
}

const C = {
  bg:      '#0a0e12',
  card:    '#111820',
  border:  '#1e2a35',
  accent:  '#a5cce6',
  text:    '#cfe5fa',
  muted:   '#6b8299',
  success: '#4ade80',
  danger:  '#f87171',
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts]       = useState<BlogPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blog?admin=true')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      const sorted = [...(data.posts ?? [])].sort(
        (a: BlogPost, b: BlogPost) => b.publishedAt.localeCompare(a.publishedAt)
      )
      setPosts(sorted)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este artículo? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE' })
      setPosts(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 300, margin: 0, color: C.text }}>Blog</h1>
            <p className="text-on-surface/50 text-sm mt-1">Gestiona los artículos de tu sitio.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/admin/blog/new"
              style={{ background: C.accent, color: '#0a0e12', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              + Nuevo artículo
            </Link>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Cargando…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <p style={{ fontSize: 14, marginBottom: 20 }}>No hay artículos aún.</p>
            <Link href="/admin/blog/new" style={{ color: C.accent, textDecoration: 'underline', fontSize: 13 }}>
              Crear el primer artículo →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map(post => {
              const date = new Date(post.publishedAt).toLocaleDateString('es-CO', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
              return (
                <div
                  key={post.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Cover thumb */}
                  {post.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      style={{ width: 60, height: 44, objectFit: 'cover', flexShrink: 0, opacity: 0.8 }}
                    />
                  ) : (
                    <div style={{ width: 60, height: 44, background: `${C.accent}18`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18, opacity: 0.4 }}>✦</span>
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.accent, border: `1px solid ${C.accent}40`, padding: '1px 6px' }}>
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      {post.isDraft && (
                        <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, border: `1px solid ${C.muted}40`, padding: '1px 6px' }}>
                          Borrador
                        </span>
                      )}
                      {post.locales.map(l => (
                        <span key={l} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: l === 'en' ? '#86efac' : '#93c5fd', border: `1px solid ${l === 'en' ? '#86efac40' : '#93c5fd40'}`, padding: '1px 5px' }}>
                          {l.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: C.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title.es}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>
                      {date} · /{post.slug}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!post.isDraft && post.slug && (
                      <Link
                        href={`/es/blog/${post.slug}`}
                        target="_blank"
                        style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.text, border: `1px solid ${C.text}40`, padding: '7px 14px', textDecoration: 'none' }}
                      >
                        Ver
                      </Link>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}`}
                      style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.accent, border: `1px solid ${C.accent}40`, padding: '7px 14px', textDecoration: 'none' }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.danger, border: `1px solid ${C.danger}40`, padding: '7px 14px', background: 'none', cursor: 'pointer' }}
                    >
                      {deleting === post.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
