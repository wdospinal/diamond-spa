'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import type { LandingPage } from '@/lib/landing-store'

// ─── Small reusable field components ─────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-[11px] uppercase tracking-[0.15em] text-on-surface/60">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-on-surface/40 leading-relaxed">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full bg-surface-container border border-outline-variant/30 text-on-surface text-sm px-4 py-3 rounded focus:outline-none focus:border-primary/60 placeholder:text-on-surface/30 transition-colors'

const textareaCls =
  'w-full bg-surface-container border border-outline-variant/30 text-on-surface text-sm px-4 py-3 rounded focus:outline-none focus:border-primary/60 placeholder:text-on-surface/30 transition-colors resize-y font-mono leading-relaxed'

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-container border border-outline-variant/20 rounded overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/20">
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">{icon}</span>
        <h2 className="font-headline text-lg text-on-surface">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-6">{children}</div>
    </section>
  )
}

// ─── SEO locale panel ─────────────────────────────────────────────────────────

type LocaleFields = {
  metaTitle: string
  metaDescription: string
  jsonLd: string
}

function SeoLocalePanel({
  locale,
  fields,
  onChange,
}: {
  locale: 'ES' | 'EN'
  fields: LocaleFields
  onChange: (f: LocaleFields) => void
}) {
  const flagEmoji = locale === 'ES' ? '🇨🇴' : '🇺🇸'

  return (
    <div className="border border-outline-variant/20 rounded p-5 flex flex-col gap-5">
      <p className="font-label text-xs tracking-[0.2em] uppercase text-on-surface/50">
        {flagEmoji} Versión {locale}
      </p>

      <Field
        label="Meta Title"
        hint="Aparece en la pestaña del navegador y en los resultados de Google. Máx. 60 caracteres."
        required={locale === 'ES'}
      >
        <input
          className={inputCls}
          placeholder={`Ej: Masaje en Medellín — Relajante y Deep Tissue | Diamond Spa`}
          value={fields.metaTitle}
          maxLength={120}
          onChange={e => onChange({ ...fields, metaTitle: e.target.value })}
        />
        <span className={`text-[11px] self-end ${fields.metaTitle.length > 60 ? 'text-error' : 'text-on-surface/30'}`}>
          {fields.metaTitle.length}/60
        </span>
      </Field>

      <Field
        label="Meta Description"
        hint="Descripción que muestra Google bajo el título. Máx. 160 caracteres."
      >
        <textarea
          className={textareaCls}
          rows={3}
          placeholder="Ej: Masajes en El Poblado, Medellín. ⭐ 4.9 · 111 reseñas en Google…"
          value={fields.metaDescription}
          maxLength={320}
          onChange={e => onChange({ ...fields, metaDescription: e.target.value })}
        />
        <span className={`text-[11px] self-end ${fields.metaDescription.length > 160 ? 'text-error' : 'text-on-surface/30'}`}>
          {fields.metaDescription.length}/160
        </span>
      </Field>

      <Field
        label="JSON-LD (Datos Estructurados)"
        hint='Pega aquí un objeto o array JSON válido con el schema.org que quieres inyectar en <head>. Ej: { "@context": "https://schema.org", "@type": "FAQPage", ... }'
      >
        <textarea
          className={`${textareaCls} text-xs text-primary/80`}
          rows={10}
          spellCheck={false}
          placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": []\n}'}
          value={fields.jsonLd}
          onChange={e => onChange({ ...fields, jsonLd: e.target.value })}
        />
        <JsonLdValidator json={fields.jsonLd} />
      </Field>
    </div>
  )
}

// ─── JSON-LD inline validator ─────────────────────────────────────────────────

function JsonLdValidator({ json }: { json: string }) {
  if (!json.trim()) return null
  try {
    JSON.parse(json)
    return (
      <span className="text-[11px] text-[#34d399] flex items-center gap-1">
        <span className="material-symbols-outlined text-[13px]">check_circle</span>
        JSON válido
      </span>
    )
  } catch {
    return (
      <span className="text-[11px] text-error flex items-center gap-1">
        <span className="material-symbols-outlined text-[13px]">error</span>
        JSON inválido — no se guardará hasta corregirlo
      </span>
    )
  }
}

// ─── Main editor page ─────────────────────────────────────────────────────────

const emptyLocale: LocaleFields = { metaTitle: '', metaDescription: '', jsonLd: '' }

function LandingEditorPageInner() {
  const params       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isNew        = params.id === 'new'
  const pageId       = isNew ? null : (params.id as string)

  // Pre-fill values passed via query string when creating from a known page
  const prefillPath  = searchParams.get('path')  ?? ''
  const prefillLabel = searchParams.get('label') ?? ''

  // ── Form state ──
  const [name,            setName]            = useState(prefillLabel)
  const [path,            setPath]            = useState(prefillPath)
  const [isActive,        setIsActive]        = useState(true)
  const [hasEn,           setHasEn]           = useState(false)
  const [esFields,        setEsFields]        = useState<LocaleFields>({ ...emptyLocale })
  const [enFields,        setEnFields]        = useState<LocaleFields>({ ...emptyLocale })
  const [semHideChrome,   setSemHideChrome]   = useState(true)
  const [semShowFloatingWa, setSemShowFloatingWa] = useState(true)
  const [semTriggerKey,   setSemTriggerKey]   = useState('utm_source')
  const [semTriggerValue, setSemTriggerValue] = useState('ads')

  // ── UI state ──
  const [loading,  setLoading]  = useState(!isNew)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // ── Load existing page ──
  const loadPage = useCallback(async () => {
    if (!pageId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/landings/${pageId}`)
      if (!res.ok) {
        if (res.status === 401) { window.location.href = '/admin/login'; return }
        throw new Error()
      }
      const { page }: { page: LandingPage } = await res.json()
      setName(page.name)
      setPath(page.path)
      setIsActive(page.isActive)
      setEsFields({
        metaTitle:       page.seo.es.metaTitle       ?? '',
        metaDescription: page.seo.es.metaDescription ?? '',
        jsonLd:          page.seo.es.jsonLd           ?? '',
      })
      if (page.seo.en) {
        setHasEn(true)
        setEnFields({
          metaTitle:       page.seo.en.metaTitle       ?? '',
          metaDescription: page.seo.en.metaDescription ?? '',
          jsonLd:          page.seo.en.jsonLd           ?? '',
        })
      }
      setSemHideChrome(page.sem.hideChrome)
      setSemShowFloatingWa(page.sem.showFloatingWa ?? true)
      setSemTriggerKey(page.sem.semTriggerKey)
      setSemTriggerValue(page.sem.semTriggerValue)
    } catch {
      setError('No se pudo cargar la configuración.')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => { loadPage() }, [loadPage])

  // ── Save ──
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate JSON-LD before sending
    if (esFields.jsonLd.trim()) {
      try { JSON.parse(esFields.jsonLd) } catch { setError('El JSON-LD en español no es válido.'); return }
    }
    if (hasEn && enFields.jsonLd.trim()) {
      try { JSON.parse(enFields.jsonLd) } catch { setError('El JSON-LD en inglés no es válido.'); return }
    }

    setSaving(true)
    try {
      const body = {
        ...(pageId ? { id: pageId } : {}),
        name,
        path,
        isActive,
        hasEn,
        // ES fields
        esMetaTitle:       esFields.metaTitle,
        esMetaDescription: esFields.metaDescription,
        esJsonLd:          esFields.jsonLd,
        // EN fields
        enMetaTitle:       enFields.metaTitle,
        enMetaDescription: enFields.metaDescription,
        enJsonLd:          enFields.jsonLd,
        // SEM
        semHideChrome,
        semShowFloatingWa,
        semTriggerKey,
        semTriggerValue,
      }

      const res = await fetch('/api/landings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error al guardar')
      }

      const { page }: { page: LandingPage } = await res.json()
      setSuccess(true)
      if (isNew) {
        router.replace(`/admin/landings/${page.id}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-on-surface/40 font-label text-xs uppercase tracking-widest">
        Cargando configuración…
      </div>
    )
  }

  // ── Preview URL ──
  const previewUrl = path
    ? `${path}?${semTriggerKey}=${semTriggerValue}`
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/admin/landings')}
            className="flex items-center gap-1 text-on-surface/40 hover:text-primary font-label text-[10px] uppercase tracking-widest mb-3 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Volver
          </button>
          <h1 className="font-headline text-3xl text-on-surface">
            {isNew ? 'Nueva Landing Page' : `Editar: ${name || 'Sin nombre'}`}
          </h1>
        </div>

        {/* Active toggle */}
        <button
          type="button"
          onClick={() => setIsActive(v => !v)}
          className={`flex items-center gap-2 border px-4 py-2 rounded font-label text-[10px] uppercase tracking-widest transition-colors shrink-0 ${
            isActive
              ? 'border-[#34d399]/30 text-[#34d399] bg-[#34d399]/5'
              : 'border-outline-variant/30 text-on-surface/40'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isActive ? 'check_circle' : 'pause_circle'}
          </span>
          {isActive ? 'Activa' : 'Inactiva'}
        </button>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-8">

        {/* ── Identificación ── */}
        <Section title="Identificación" icon="label">
          <Field label="Nombre Interno" required hint="Solo visible en el admin. Útil para identificar campañas. Ej: 'Masajes - Ads Q3 2026'">
            <input
              className={inputCls}
              placeholder="Ej: Masajes - Google Ads Verano 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Ruta (Path)"
            required
            hint="La URL de la página sin el prefijo de idioma. Debe empezar con /. Ej: /massage-medellin"
          >
            <input
              className={`${inputCls} font-mono`}
              placeholder="/massage-medellin"
              value={path}
              onChange={e => setPath(e.target.value)}
              required
            />
          </Field>
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO — Metadatos" icon="manage_search">
          <p className="text-sm text-on-surface/50 leading-relaxed -mt-2">
            Estos valores sobreescriben el title, description y datos estructurados de la página.
            Si los dejas vacíos, se usan los valores hardcodeados en el código de la página.
          </p>

          <SeoLocalePanel locale="ES" fields={esFields} onChange={setEsFields} />

          {/* EN toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasEn(v => !v)}
              className={`flex items-center gap-2 border px-4 py-2 rounded font-label text-[10px] uppercase tracking-widest transition-colors ${
                hasEn
                  ? 'border-primary/40 text-primary bg-primary/5'
                  : 'border-outline-variant/30 text-on-surface/40 hover:border-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {hasEn ? 'language' : 'add'}
              </span>
              {hasEn ? 'Versión EN activa' : 'Añadir versión EN'}
            </button>
          </div>

          {hasEn && (
            <SeoLocalePanel locale="EN" fields={enFields} onChange={setEnFields} />
          )}
        </Section>

        {/* ── SEM / Ads ── */}
        <Section title="SEM — Google Ads" icon="ads_click">
          <p className="text-sm text-on-surface/50 leading-relaxed -mt-2">
            Cuando la URL contenga el parámetro configurado abajo, se activa el{' '}
            <strong className="text-on-surface/70">modo SEM</strong>: el nav y el footer
            desaparecen para maximizar la conversión sin distraer al visitante que llega del anuncio.
          </p>

          {/* Hide chrome toggle */}
          <div className="flex items-start gap-4 p-4 border border-outline-variant/20 rounded">
            <button
              type="button"
              id="sem-hide-chrome-toggle"
              onClick={() => setSemHideChrome(v => !v)}
              className={`mt-0.5 w-10 h-6 rounded-full border-2 transition-all shrink-0 relative ${
                semHideChrome
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-high border-outline-variant/40'
              }`}
              role="switch"
              aria-checked={semHideChrome}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${semHideChrome ? 'left-4' : 'left-0.5'}`} />
            </button>
            <div>
              <p className="font-label text-sm text-on-surface font-semibold">
                Ocultar Nav &amp; Footer en modo Ads
              </p>
              <p className="text-xs text-on-surface/50 mt-0.5">
                Cuando está activo, el menú superior y el pie de página se ocultan cuando el usuario llega con el parámetro de abajo.
              </p>
            </div>
          </div>

          {/* Show floating WhatsApp toggle */}
          <div className="flex items-start gap-4 p-4 border border-outline-variant/20 rounded">
            <button
              type="button"
              id="sem-show-floating-wa-toggle"
              onClick={() => setSemShowFloatingWa(v => !v)}
              className={`mt-0.5 w-10 h-6 rounded-full border-2 transition-all shrink-0 relative ${
                semShowFloatingWa
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-high border-outline-variant/40'
              }`}
              role="switch"
              aria-checked={semShowFloatingWa}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${semShowFloatingWa ? 'left-4' : 'left-0.5'}`} />
            </button>
            <div>
              <p className="font-label text-sm text-on-surface font-semibold">
                Botón flotante de WhatsApp
              </p>
              <p className="text-xs text-on-surface/50 mt-0.5">
                Cuando está activo, el botón de WhatsApp se mostrará en esta página. Útil desactivarlo si tu landing ya tiene muchos botones de acción.
              </p>
            </div>
          </div>

          {/* Trigger config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Parámetro de Activación (clave)"
              hint="Clave del query string. Estándar de industria: utm_source"
            >
              <input
                className={`${inputCls} font-mono`}
                placeholder="utm_source"
                value={semTriggerKey}
                onChange={e => setSemTriggerKey(e.target.value)}
              />
            </Field>
            <Field
              label="Valor de Activación"
              hint="Valor que activa el modo SEM. Usa 'ads' en tus campañas de Google."
            >
              <input
                className={`${inputCls} font-mono`}
                placeholder="ads"
                value={semTriggerValue}
                onChange={e => setSemTriggerValue(e.target.value)}
              />
            </Field>
          </div>

          {/* Preview URL */}
          {previewUrl && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/60 mb-1.5">
                URL de prueba para Google Ads:
              </p>
              <code className="text-xs text-primary break-all">
                https://diamondspa.com.co/es{previewUrl}
              </code>
            </div>
          )}
        </Section>

        {/* ── Feedback ── */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/30 text-error text-sm rounded flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-sm rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Guardado correctamente.
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-between gap-4 pb-12">
          <button
            type="button"
            onClick={() => router.push('/admin/landings')}
            className="border border-outline-variant/30 text-on-surface/60 hover:text-on-surface px-6 py-3 rounded font-label text-xs uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded font-label font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {saving ? 'sync' : 'save'}
            </span>
            {saving ? 'Guardando…' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}

// useSearchParams() requires a Suspense boundary in the Next.js App Router
export default function LandingEditorPage() {
  return (
    <Suspense>
      <LandingEditorPageInner />
    </Suspense>
  )
}
