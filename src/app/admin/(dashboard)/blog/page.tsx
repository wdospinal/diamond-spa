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

const actionCls =
  'flex items-center justify-center px-4 min-h-11 sm:min-h-0 sm:py-[7px] text-[11px] tracking-[0.15em] uppercase border transition-colors'

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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-[#cfe5fa]">Blog</h1>
          <p className="text-on-surface/50 text-sm mt-1">Gestiona los artículos de tu sitio.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex w-full sm:w-auto items-center justify-center gap-1.5 bg-[#a5cce6] text-[#0a0e12] px-5 py-3.5 sm:py-2.5 text-[11px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-opacity shrink-0"
        >
          + Nuevo artículo
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center py-20 text-[#6b8299] text-xs tracking-[0.2em] uppercase">
          Cargando…
        </p>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-[#6b8299]">
          <p className="text-sm mb-5">No hay artículos aún.</p>
          <Link href="/admin/blog/new" className="text-[#a5cce6] underline text-[13px]">
            Crear el primer artículo →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map(post => {
            const date = new Date(post.publishedAt).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
            return (
              <li
                key={post.id}
                className="bg-[#111820] border border-[#1e2a35] p-4 sm:px-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1 sm:gap-4 sm:items-center">
                  {/* Cover thumb */}
                  {post.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      className="w-[60px] h-11 object-cover shrink-0 opacity-80"
                    />
                  ) : (
                    <div className="w-[60px] h-11 bg-[#a5cce6]/10 shrink-0 flex items-center justify-center">
                      <span className="text-lg opacity-40" aria-hidden="true">✦</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-[#a5cce6] border border-[#a5cce6]/25 px-1.5 py-px">
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      {post.isDraft && (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-[#6b8299] border border-[#6b8299]/25 px-1.5 py-px">
                          Borrador
                        </span>
                      )}
                      {post.locales.map(l => (
                        <span
                          key={l}
                          className={`text-[9px] tracking-[0.15em] uppercase px-[5px] py-px border ${
                            l === 'en'
                              ? 'text-[#86efac] border-[#86efac]/25'
                              : 'text-[#93c5fd] border-[#93c5fd]/25'
                          }`}
                        >
                          {l.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {/* Wraps to two lines on a phone rather than truncating to
                        a few words the way a single-line ellipsis would. */}
                    <p className="text-sm text-[#cfe5fa] font-medium line-clamp-2 sm:line-clamp-1">
                      {post.title.es}
                    </p>
                    <p className="text-[11px] text-[#6b8299] mt-0.5 truncate">
                      {date} · /{post.slug}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!post.isDraft && post.slug && (
                    <Link
                      href={`/es/blog/${post.slug}`}
                      target="_blank"
                      className={`${actionCls} flex-1 sm:flex-initial text-[#cfe5fa] border-[#cfe5fa]/25 hover:border-[#cfe5fa]/60`}
                    >
                      Ver
                    </Link>
                  )}
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className={`${actionCls} flex-1 sm:flex-initial text-[#a5cce6] border-[#a5cce6]/25 hover:border-[#a5cce6]/60`}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className={`${actionCls} flex-1 sm:flex-initial text-[#f87171] border-[#f87171]/25 hover:border-[#f87171]/60 disabled:opacity-40`}
                  >
                    {deleting === post.id ? '…' : 'Eliminar'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
