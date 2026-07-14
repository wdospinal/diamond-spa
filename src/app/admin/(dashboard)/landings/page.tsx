'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LandingPage } from '@/lib/landing-store'
import type { KnownPage } from '@/lib/known-pages'
import { PAGE_CATEGORIES } from '@/lib/known-pages'

// ─── Types ────────────────────────────────────────────────────────────────────

type PageEntry = {
  knownPage: KnownPage | null
  config: LandingPage | null
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ config }: { config: LandingPage | null }) {
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-wider bg-on-surface/5 text-on-surface/30 border border-outline-variant/10">
        <span className="material-symbols-outlined text-[11px]" aria-hidden="true">radio_button_unchecked</span>
        Sin config
      </span>
    )
  }
  if (!config.isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-wider bg-on-surface/10 text-on-surface/40 border border-outline-variant/20">
        <span className="material-symbols-outlined text-[11px]" aria-hidden="true">pause_circle</span>
        Inactiva
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-wider bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20">
      <span className="material-symbols-outlined text-[11px]" aria-hidden="true">check_circle</span>
      Activa
    </span>
  )
}

// ─── Single page row ──────────────────────────────────────────────────────────

function PageRow({
  entry,
  onDelete,
  deleting,
}: {
  entry: PageEntry
  onDelete: (id: string, name: string) => void
  deleting: string | null
}) {
  const { knownPage, config } = entry
  const displayLabel  = knownPage?.label ?? config?.name ?? 'Página sin nombre'
  const displayPath   = knownPage?.path  ?? config?.path ?? ''
  const editHref      = config ? `/admin/landings/${config.id}` : `/admin/landings/new?path=${encodeURIComponent(displayPath)}&label=${encodeURIComponent(displayLabel)}`

  return (
    <div className="flex items-center gap-4 py-4 px-5 border-b border-outline-variant/10 last:border-0 hover:bg-surface-variant/10 transition-colors">
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        config?.isActive ? 'bg-[#34d399]' : config ? 'bg-on-surface/20' : 'bg-outline-variant/30'
      }`} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <StatusBadge config={config} />
          <span className="font-label text-sm text-on-surface truncate">{displayLabel}</span>
        </div>
        <code className="text-[11px] text-primary/60 truncate block">{displayPath}</code>
        {config?.seo.es.metaTitle && (
          <p className="text-[11px] text-on-surface/40 truncate mt-0.5">
            ES: {config.seo.es.metaTitle}
          </p>
        )}
      </div>

      {/* SEO / SEM chips */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        {config?.seo.es.metaTitle && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-label tracking-wider uppercase">SEO ES</span>
        )}
        {config?.seo.en?.metaTitle && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-label tracking-wider uppercase">SEO EN</span>
        )}
        {config?.seo.es.jsonLd && (
          <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-label tracking-wider uppercase">JSON-LD</span>
        )}
        {config?.sem.hideChrome && (
          <span className="px-2 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] text-[10px] font-label tracking-wider uppercase">SEM</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={editHref}
          className="flex items-center gap-1 border border-outline-variant/30 text-on-surface/60 hover:border-primary/50 hover:text-primary px-3 py-1.5 rounded transition-colors font-label text-[10px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            {config ? 'edit' : 'add'}
          </span>
          {config ? 'Editar' : 'Crear'}
        </Link>
        {config && (
          <button
            onClick={() => onDelete(config.id, config.name)}
            disabled={deleting === config.id}
            className="flex items-center gap-1 border border-error/20 text-error/50 hover:border-error/50 hover:text-error px-3 py-1.5 rounded transition-colors font-label text-[10px] uppercase tracking-widest disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              {deleting === config.id ? 'sync' : 'delete'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({
  categoryId,
  icon,
  label,
  entries,
  onDelete,
  deleting,
}: {
  categoryId: string
  icon: string
  label: string
  entries: PageEntry[]
  onDelete: (id: string, name: string) => void
  deleting: string | null
}) {
  if (entries.length === 0) return null
  const configured = entries.filter(e => e.config).length

  return (
    <section className="bg-surface-container border border-outline-variant/20 rounded overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20 bg-surface-container-high/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">{icon}</span>
          <h2 className="font-label text-sm tracking-wide text-on-surface">{label}</h2>
        </div>
        <span className="font-label text-[10px] tracking-widest uppercase text-on-surface/40">
          {configured}/{entries.length} configuradas
        </span>
      </div>
      <div>
        {entries.map(entry => (
          <PageRow
            key={entry.config?.id ?? entry.knownPage?.path}
            entry={entry}
            onDelete={onDelete}
            deleting={deleting}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingsAdminPage() {
  const [entries,  setEntries]  = useState<PageEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/landings')
      if (!res.ok) {
        if (res.status === 401) { window.location.href = '/admin/login'; return }
        throw new Error('Error de red')
      }
      const data = await res.json()
      setEntries(data.pages)
    } catch {
      setError('No se pudieron cargar las páginas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la configuración de "${name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/landings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      // Remove config from state but keep the known-page entry
      setEntries(prev => prev.map(e =>
        e.config?.id === id ? { ...e, config: null } : e
      ))
    } catch {
      alert('Error al eliminar. Intenta de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  // Group entries by category
  const grouped = PAGE_CATEGORIES.map(cat => ({
    ...cat,
    entries: entries.filter(e =>
      e.knownPage?.category === cat.id ||
      // Extras (no knownPage) go into 'landing' category
      (!e.knownPage && cat.id === 'landing')
    ),
  }))

  // Stats
  const total      = entries.length
  const configured = entries.filter(e => e.config).length
  const active     = entries.filter(e => e.config?.isActive).length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2">
            SEO &amp; Landing Pages
          </h1>
          <p className="text-on-surface/50 text-sm">
            Gestiona los metadatos SEO, datos estructurados y configuración SEM de cada página.
          </p>
        </div>
        <Link
          href="/admin/landings/new"
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Página Personalizada
        </Link>
      </header>

      {/* Stats strip */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Páginas totales', value: total,      icon: 'layers'          },
            { label: 'Con config SEO',  value: configured, icon: 'manage_search'   },
            { label: 'SEM activas',     value: active,     icon: 'ads_click'       },
          ].map(s => (
            <div key={s.label} className="bg-surface-container border border-outline-variant/20 rounded p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">{s.icon}</span>
              <div>
                <p className="font-headline text-2xl text-on-surface leading-none">{s.value}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[30vh] text-on-surface/40 font-label text-xs uppercase tracking-widest">
          Cargando…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/30 text-error text-sm rounded">
          {error}
        </div>
      )}

      {/* Page groups */}
      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {grouped.map(group => (
            <CategorySection
              key={group.id}
              categoryId={group.id}
              icon={group.icon}
              label={group.label}
              entries={group.entries}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </div>
  )
}
