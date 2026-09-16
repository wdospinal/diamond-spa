'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Tiptap cannot be SSR'd easily
const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

// text-base below sm: iOS Safari zooms the viewport when focusing an input
// whose font-size is under 16px.
const inputCls =
  'w-full bg-[#111820] border border-[#1e2a35] text-[#cfe5fa] px-3.5 py-3 text-base sm:text-sm rounded-none outline-none transition-colors focus:border-[#a5cce6]/60 placeholder:text-[#6b8299]'

const labelCls = 'block text-[#6b8299] text-[10px] tracking-[0.2em] uppercase'

const tabCls = 'flex-1 px-2 py-3.5 sm:p-4 border-b-2 text-[11px] sm:text-xs tracking-[0.15em] uppercase transition-all'

export default function NewBlogPostPage() {
  const router = useRouter()

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

  // SEO Metadata
  const [metaTitleEs,   setMetaTitleEs]   = useState('')
  const [metaTitleEn,   setMetaTitleEn]   = useState('')
  const [metaDescEs,    setMetaDescEs]    = useState('')
  const [metaDescEn,    setMetaDescEn]    = useState('')
  const [keywords,      setKeywords]      = useState('')

  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [showPreview, setShowPreview] = useState(false)

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
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEs, titleEn: titleEn || undefined,
          excerptEs, excerptEn: excerptEn || undefined,
          contentEs, contentEn: contentEn || undefined,
          coverUrl: coverUrl || undefined,
          category, locales,
          slug: slug || undefined,
          isDraft, authorName: author,
          // SEO Metadata
          metaTitleEs: metaTitleEs || undefined,
          metaTitleEn: metaTitleEn || undefined,
          metaDescEs:  metaDescEs  || undefined,
          metaDescEn:  metaDescEn  || undefined,
          keywords:    keywords    || undefined,
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

  const enIsActive = locales.includes('en')

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 md:mb-9 flex-wrap">
        <Link href="/admin/blog" className="text-[#6b8299] text-[11px] tracking-[0.15em] uppercase hover:text-[#a5cce6] transition-colors">
          ← Blog
        </Link>
        <h1 className="font-headline text-2xl sm:text-3xl text-[#cfe5fa]">Nuevo artículo</h1>
      </div>

      {error && (
        <div className="bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] px-4 py-3 mb-6 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">

        {/* ── EDITOR DE CONTENIDO CON TABS ── */}
        <section className="bg-[#111820] border border-[#1e2a35]">

          {/* Tabs header */}
          <div className="flex border-b border-[#1e2a35]">
            <button
              type="button"
              onClick={() => setActiveTab('es')}
              aria-pressed={activeTab === 'es'}
              className={`${tabCls} ${
                activeTab === 'es'
                  ? 'bg-[#a5cce6]/[0.06] border-[#a5cce6] text-[#cfe5fa]'
                  : 'border-transparent text-[#6b8299]'
              }`}
            >
              <span className="sm:hidden">Español</span>
              <span className="hidden sm:inline">Contenido en Español</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              aria-pressed={activeTab === 'en'}
              className={`${tabCls} ${
                activeTab === 'en'
                  ? 'bg-[#a5cce6]/[0.06] border-[#a5cce6] text-[#cfe5fa]'
                  : 'border-transparent text-[#6b8299]'
              }`}
            >
              <span className="sm:hidden">Inglés</span>
              <span className="hidden sm:inline">Contenido en Inglés</span>
              {!enIsActive && activeTab !== 'en' && (titleEn || excerptEn || contentEn) && (
                <span className="ml-1.5 text-[9px] text-[#f59e0b]">⚠ Inactivo</span>
              )}
            </button>
          </div>

          {/* Editor body */}
          <div className="p-4 sm:p-6 flex flex-col gap-5">
            {activeTab === 'es' ? (
              <>
                <div>
                  <label className={`${labelCls} mb-2`}>Título (ES) *</label>
                  <input value={titleEs} onChange={e => setTitleEs(e.target.value)} required={locales.includes('es')} className={inputCls} placeholder="Ej: Beneficios del masaje..." />
                </div>
                <div>
                  <label className={`${labelCls} mb-2`}>Extracto (ES) *</label>
                  <textarea value={excerptEs} onChange={e => setExcerptEs(e.target.value)} required={locales.includes('es')} rows={2} className={`${inputCls} resize-y`} placeholder="Descripción corta..." />
                </div>
                <div>
                  <label className={`${labelCls} mb-2`}>Contenido (ES) *</label>
                  <RichEditor value={contentEs} onChange={setContentEs} placeholder="Escribe el cuerpo del artículo en español..." />
                </div>
              </>
            ) : (
              <>
                {/* Info banner when EN locale is not activated */}
                {!enIsActive && (
                  <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] px-4 py-3 text-[12px] leading-relaxed">
                    ℹ️ Estás escribiendo el contenido en inglés, pero el idioma <strong>Inglés (/en)</strong> aún no está activado.<br />
                    Actívalo en la sección <strong>Configuración → Idiomas a publicar</strong> para que este contenido se guarde y aparezca en <code>/en/blog/...</code>
                  </div>
                )}
                <div>
                  <label className={`${labelCls} mb-2`}>Título (EN) {enIsActive ? '*' : ''}</label>
                  <input value={titleEn} onChange={e => setTitleEn(e.target.value)} required={enIsActive} className={`${inputCls} ${enIsActive ? '' : 'opacity-60'}`} placeholder="Ej: Benefits of a massage..." />
                </div>
                <div>
                  <label className={`${labelCls} mb-2`}>Extracto (EN) {enIsActive ? '*' : ''}</label>
                  <textarea value={excerptEn} onChange={e => setExcerptEn(e.target.value)} required={enIsActive} rows={2} className={`${inputCls} resize-y ${enIsActive ? '' : 'opacity-60'}`} placeholder="Short description..." />
                </div>
                <div>
                  <label className={`${labelCls} mb-2`}>Contenido (EN) {enIsActive ? '*' : ''}</label>
                  <div className={`transition-opacity ${enIsActive ? '' : 'opacity-60'}`}>
                    <RichEditor value={contentEn} onChange={setContentEn} placeholder="Write the article body in english..." />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── SETTINGS ── */}
        <section className="bg-[#111820] border border-[#1e2a35] p-4 sm:p-6">
          <p className={`${labelCls} mb-5`}>Configuración de la publicación</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className={`${labelCls} mb-2`}>Imagen de portada</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className={`${inputCls} sm:flex-1`} placeholder="URL (https://...) o subir" />
                <button
                  type="button"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  className="bg-[#a5cce6]/10 border border-[#a5cce6]/25 text-[#a5cce6] px-4 py-3 sm:py-0 text-[11px] tracking-[0.1em] uppercase hover:bg-[#a5cce6]/20 transition-colors shrink-0"
                >
                  Subir
                </button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
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
              <label className={`${labelCls} mb-2`}>Categoría *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required className={`${inputCls} cursor-pointer`}>
                <option value="bienestar">Bienestar</option>
                <option value="novedades">Novedades</option>
                <option value="servicios">Servicios</option>
              </select>
            </div>

            <div>
              <label className={`${labelCls} mb-2`}>Slug URL <span className="text-[9px] normal-case tracking-normal">(auto si se deja vacío)</span></label>
              <input value={slug} onChange={e => setSlug(e.target.value)} className={inputCls} placeholder="ejemplo-mi-post" />
            </div>

            <div>
              <label className={`${labelCls} mb-2`}>Autor</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className={inputCls} placeholder="Diamond Spa" />
            </div>

            {/* Idiomas a publicar */}
            <div className="md:col-span-2">
              <label className={`${labelCls} mb-3`}>Idiomas a publicar</label>
              <div className="flex flex-wrap gap-3">
                {(['es', 'en'] as const).map(l => (
                  <label key={l} className="flex items-center gap-2 cursor-pointer select-none min-h-11">
                    <input type="checkbox" checked={locales.includes(l)} onChange={() => toggleLocale(l)} className="w-4 h-4 accent-[#a5cce6]" />
                    <span className="text-xs text-[#cfe5fa]">
                      {l === 'es' ? '🇨🇴 Español — /es/blog/...' : '🇺🇸 Inglés — /en/blog/...'}
                    </span>
                  </label>
                ))}
              </div>
              {enIsActive && (!titleEn || !excerptEn || !contentEn) && (
                <p className="mt-2 text-[11px] text-[#f59e0b]">
                  ⚠ Inglés activado — completa el título, extracto y contenido en la pestaña "Inglés" antes de publicar.
                </p>
              )}
            </div>

            <div className="md:col-span-2 mt-2 pt-4 border-t border-[#1e2a35]">
              <label className="flex items-start gap-2.5 cursor-pointer select-none min-h-11">
                <input type="checkbox" checked={isDraft} onChange={e => setIsDraft(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#a5cce6]" />
                <span className="text-[13px] text-[#cfe5fa]">
                  Guardar como borrador <span className="text-[#6b8299]">(no será visible en la web pública)</span>
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* ── SEO METADATA ── */}
        <section className="bg-[#111820] border border-[#1e2a35] p-4 sm:p-6">
          <p className={`${labelCls} mb-1`}>Metadata SEO</p>
          <p className="text-[#6b8299] text-[11px] mb-5">
            Campos opcionales. Si los dejas vacíos, se usarán automáticamente el título y extracto del artículo.
          </p>
          <div className="flex flex-col gap-4">

            {/* Meta Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${labelCls} mb-2`}>Meta Title (ES) <span className="text-[9px] normal-case tracking-normal">máx. 60 chars</span></label>
                <input
                  value={metaTitleEs}
                  onChange={e => setMetaTitleEs(e.target.value)}
                  maxLength={60}
                  className={inputCls}
                  placeholder={titleEs ? `${titleEs} | Diamond Spa Medellín` : 'Ej: Título SEO en español...'}
                />
                <p className="text-[#6b8299] text-[10px] mt-1 text-right">{metaTitleEs.length}/60</p>
              </div>
              <div>
                <label className={`${labelCls} mb-2`}>Meta Title (EN) <span className="text-[9px] normal-case tracking-normal">máx. 60 chars</span></label>
                <input
                  value={metaTitleEn}
                  onChange={e => setMetaTitleEn(e.target.value)}
                  maxLength={60}
                  className={`${inputCls} ${enIsActive ? '' : 'opacity-60'}`}
                  placeholder={titleEn ? `${titleEn} | Diamond Spa Medellín` : 'Ej: SEO title in english...'}
                />
                <p className="text-[#6b8299] text-[10px] mt-1 text-right">{metaTitleEn.length}/60</p>
              </div>
            </div>

            {/* Meta Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${labelCls} mb-2`}>Meta Description (ES) <span className="text-[9px] normal-case tracking-normal">máx. 160 chars</span></label>
                <textarea
                  value={metaDescEs}
                  onChange={e => setMetaDescEs(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder={excerptEs || 'Descripción SEO en español...'}
                />
                <p className="text-[#6b8299] text-[10px] mt-1 text-right">{metaDescEs.length}/160</p>
              </div>
              <div>
                <label className={`${labelCls} mb-2`}>Meta Description (EN) <span className="text-[9px] normal-case tracking-normal">máx. 160 chars</span></label>
                <textarea
                  value={metaDescEn}
                  onChange={e => setMetaDescEn(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className={`${inputCls} resize-y ${enIsActive ? '' : 'opacity-60'}`}
                  placeholder={excerptEn || 'SEO description in english...'}
                />
                <p className="text-[#6b8299] text-[10px] mt-1 text-right">{metaDescEn.length}/160</p>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className={`${labelCls} mb-2`}>Keywords <span className="text-[9px] normal-case tracking-normal">(separadas por coma)</span></label>
              <input
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                className={inputCls}
                placeholder="masajes medellin, spa el poblado, bienestar..."
              />
            </div>

          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 pb-12 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full sm:w-auto text-[11px] tracking-[0.15em] uppercase text-[#cfe5fa] border border-[#cfe5fa]/25 hover:border-[#cfe5fa]/60 px-6 py-3 transition-colors"
          >
            Vista Previa
          </button>
          <Link
            href="/admin/blog"
            className="w-full sm:w-auto text-center text-[11px] tracking-[0.15em] uppercase text-[#6b8299] hover:text-[#cfe5fa] px-6 py-3 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#a5cce6] text-[#0a0e12] px-8 py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-90 disabled:bg-[#1e2a35] disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : isDraft ? 'Guardar borrador' : 'Publicar artículo'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="admin-topbar flex items-center justify-between gap-3 px-4 sm:px-6 bg-[#0a0e12] border-b border-[#1e2a35]">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#a5cce6] truncate">
              Vista Previa — {activeTab === 'es' ? 'Español' : 'Inglés'}
            </span>
            <button
              onClick={() => setShowPreview(false)}
              aria-label="Cerrar vista previa"
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-2xl text-[#cfe5fa] hover:text-[#a5cce6] transition-colors"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#0a0e12] px-5 py-8 sm:px-6 sm:py-10 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-headline text-2xl sm:text-4xl font-light mb-8 sm:mb-10 text-[#cfe5fa]">
                {activeTab === 'es' ? (titleEs || 'Sin título') : (titleEn || 'Sin título')}
              </h1>
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
