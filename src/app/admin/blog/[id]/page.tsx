'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { BlogPost } from '@/lib/blog-store'

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

const C = {
  bg:     '#0a0e12',
  card:   '#111820',
  border: '#1e2a35',
  accent: '#a5cce6',
  text:   '#cfe5fa',
  muted:  '#6b8299',
  error:  '#f87171',
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: C.card, border: `1px solid ${C.border}`,
  color: C.text, padding: '12px 14px', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', borderRadius: 0,
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: C.muted, fontSize: 10,
  letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8,
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es')

  const [titleEs,   setTitleEs]   = useState('')
  const [titleEn,   setTitleEn]   = useState('')
  const [excerptEs, setExcerptEs] = useState('')
  const [excerptEn, setExcerptEn] = useState('')
  const [contentEs, setContentEs] = useState('')
  const [contentEn, setContentEn] = useState('')
  
  const [coverUrl,  setCoverUrl]  = useState('')
  const [category,  setCategory]  = useState('bienestar')
  const [locales,   setLocales]   = useState<('es' | 'en')[]>(['es'])
  const [slug,      setSlug]      = useState('')
  const [isDraft,   setIsDraft]   = useState(false)
  const [author,    setAuthor]    = useState('Diamond Spa')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${id}`)
      if (res.status === 404) { setNotFound(true); return }
      if (res.status === 401) { router.push('/admin'); return }
      const { post }: { post: BlogPost } = await res.json()
      setTitleEs(post.title.es)
      setTitleEn(post.title.en ?? '')
      setExcerptEs(post.excerpt.es)
      setExcerptEn(post.excerpt.en ?? '')
      setContentEs(post.content.es)
      setContentEn(post.content.en ?? '')
      setCoverUrl(post.coverUrl ?? '')
      setCategory(post.category)
      setLocales(post.locales)
      setSlug(post.slug)
      setIsDraft(post.isDraft)
      setAuthor(post.authorName)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  const toggleLocale = (l: 'es' | 'en') => {
    setLocales(prev =>
      prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locales.length === 0) { setError('Debes seleccionar al menos un idioma'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEs, titleEn: titleEn || undefined,
          excerptEs, excerptEn: excerptEn || undefined,
          contentEs, contentEn: contentEn || undefined,
          coverUrl: coverUrl || undefined,
          category, locales, slug,
          isDraft, authorName: author,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return }
      router.push('/admin/blog')
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Cargando…
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p>Artículo no encontrado.</p>
        <Link href="/admin/blog" style={{ color: C.accent, textDecoration: 'underline', fontSize: 13 }}>← Volver al blog</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '32px 20px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
          <Link href="/admin/blog" style={{ color: C.muted, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Blog
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 300, margin: 0, color: C.text }}>Editar artículo</h1>
        </div>

        {error && (
          <div style={{ background: `${C.error}18`, border: `1px solid ${C.error}50`, color: C.error, padding: '12px 16px', marginBottom: 24, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* ── EDITOR DE CONTENIDO CON TABS ── */}
            <section style={{ background: C.card, border: `1px solid ${C.border}` }}>
              
              {/* Tabs header */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('es')}
                  style={{
                    flex: 1, padding: '16px', background: activeTab === 'es' ? `${C.accent}10` : 'transparent',
                    border: 'none', borderBottom: activeTab === 'es' ? `2px solid ${C.accent}` : '2px solid transparent',
                    color: activeTab === 'es' ? C.text : C.muted, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Contenido en Español
                  {!locales.includes('es') && ' (Inactivo)'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  style={{
                    flex: 1, padding: '16px', background: activeTab === 'en' ? `${C.accent}10` : 'transparent',
                    border: 'none', borderBottom: activeTab === 'en' ? `2px solid ${C.accent}` : '2px solid transparent',
                    color: activeTab === 'en' ? C.text : C.muted, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Contenido en Inglés
                  {!locales.includes('en') && ' (Inactivo)'}
                </button>
              </div>

              {/* Editor body */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {activeTab === 'es' ? (
                  <>
                    <div>
                      <label style={labelStyle}>Título (ES) *</label>
                      <input value={titleEs} onChange={e => setTitleEs(e.target.value)} required={locales.includes('es')} style={inputStyle} placeholder="Ej: Beneficios del masaje..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Extracto (ES) *</label>
                      <textarea value={excerptEs} onChange={e => setExcerptEs(e.target.value)} required={locales.includes('es')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción corta..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Contenido (ES) *</label>
                      <RichEditor value={contentEs} onChange={setContentEs} placeholder="Escribe el cuerpo del artículo en español..." />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Título (EN) {locales.includes('en') ? '*' : ''}</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={locales.includes('en')} onChange={() => toggleLocale('en')} style={{ accentColor: C.accent, width: 15, height: 15 }} />
                        <span style={{ fontSize: 11, color: C.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Publicar en /en/blog</span>
                      </label>
                    </div>
                    <div>
                      <input value={titleEn} onChange={e => setTitleEn(e.target.value)} required={locales.includes('en')} style={{ ...inputStyle, opacity: locales.includes('en') ? 1 : 0.5 }} placeholder="Ej: Benefits of a massage..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Extracto (EN) {locales.includes('en') ? '*' : ''}</label>
                      <textarea value={excerptEn} onChange={e => setExcerptEn(e.target.value)} required={locales.includes('en')} rows={2} style={{ ...inputStyle, resize: 'vertical', opacity: locales.includes('en') ? 1 : 0.5 }} placeholder="Short description..." />
                    </div>
                    <div>
                      <label style={labelStyle}>Contenido (EN) {locales.includes('en') ? '*' : ''}</label>
                      <div style={{ opacity: locales.includes('en') ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                        <RichEditor value={contentEn} onChange={setContentEn} placeholder="Write the article body in english..." />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ── SETTINGS ── */}
            <section style={{ background: C.card, border: `1px solid ${C.border}`, padding: 24 }}>
              <p style={{ ...labelStyle, marginBottom: 20 }}>Configuración de la publicación</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

                <div>
                  <label style={labelStyle}>Imagen de portada</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="URL (https://...) o subir" />
                    <button
                      type="button"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                      style={{
                        background: `${C.accent}15`, border: `1px solid ${C.accent}40`, color: C.accent,
                        padding: '0 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer'
                      }}
                    >
                      Subir
                    </button>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const { compressImageToWebP } = await import('@/lib/image-optimizer')
                          const b64 = await compressImageToWebP(file, 1200, 0.8)
                          setCoverUrl(b64)
                        } catch (err) { alert('Error subiendo imagen') }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="bienestar">Bienestar</option>
                    <option value="novedades">Novedades</option>
                    <option value="servicios">Servicios</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Slug URL <span style={{ color: C.muted, fontSize: 9 }}>(auto si se deja vacío)</span></label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} placeholder="ejemplo-mi-post" />
                </div>

                <div>
                  <label style={labelStyle}>Autor</label>
                  <input value={author} onChange={e => setAuthor(e.target.value)} style={inputStyle} placeholder="Diamond Spa" />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, marginBottom: 12 }}>Idiomas a publicar</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {(['es', 'en'] as const).map(l => (
                      <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={locales.includes(l)} onChange={() => toggleLocale(l)} style={{ accentColor: C.accent, width: 15, height: 15 }} />
                        <span style={{ fontSize: 12, color: C.text }}>
                          {l === 'es' ? '🇨🇴 Español (/es)' : '🇺🇸 Inglés (/en)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={isDraft} onChange={e => setIsDraft(e.target.checked)} style={{ accentColor: C.accent, width: 15, height: 15 }} />
                    <span style={{ fontSize: 13, color: C.text }}>Guardar como borrador <span style={{ color: C.muted }}>(no será visible en la web pública)</span></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifySelf: 'flex-end', marginLeft: 'auto', paddingBottom: 48 }}>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.text, border: `1px solid ${C.text}40`, padding: '12px 24px', background: 'transparent', cursor: 'pointer' }}
              >
                Vista Previa
              </button>
              <Link href="/admin/blog" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted, textDecoration: 'none', marginRight: 16, marginLeft: 16 }}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? C.border : C.accent, color: '#0a0e12',
                  border: 'none', padding: '13px 32px', fontSize: 11,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(4px)' }}>
          <div style={{ padding: '16px 24px', background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.accent }}>Vista Previa — {activeTab === 'es' ? 'Español' : 'Inglés'}</span>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: C.text, cursor: 'pointer', fontSize: 24 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '40px 20px' }}>
            <div style={{ maxWidth: 768, margin: '0 auto' }}>
              <h1 style={{ fontSize: 40, fontWeight: 300, marginBottom: 40, color: C.text }}>{activeTab === 'es' ? (titleEs || 'Sin título') : (titleEn || 'Sin título')}</h1>
              <div className="rich-editor-content max-w-none">
                <div className="tiptap" dangerouslySetInnerHTML={{ __html: activeTab === 'es' ? contentEs : contentEn }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
