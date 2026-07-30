/**
 * Durable aggregate store for the sales funnel.
 *
 * Counting model: per stage per day we keep the SET of `sessionId`s that
 * reached that stage, so the dashboard reports *unique sessions* (a refresh
 * doesn't inflate the top of the funnel). The count for a stage/day is the
 * cardinality of that set.
 *
 * Backend preference — Supabase → Vercel KV → JSON file, matching every other
 * store in the app (bookings, blog, landings, push):
 *  - Supabase: `funnel_hits`, one row per (day, stage, session); uniqueness is
 *    the primary key, so re-inserting a session is a no-op. Counts are read
 *    from the `funnel_daily` view. Schema: supabase/migrations/0004_funnel_hits.sql.
 *  - Vercel KV / Upstash Redis over its REST API via `fetch` — no npm
 *    dependency (this project deliberately keeps deps minimal). Uses Redis sets
 *    (SADD / SCARD) with a ~100-day TTL so old days auto-expire.
 *  - Local/dev fallback: a JSON file (data/funnel-daily.json). Lets the whole
 *    pipeline be tested with zero infra.
 *
 * On Vercel the filesystem is ephemeral, so production REQUIRES either Supabase
 * or a connected KV store — the JSON fallback would be wiped on every deploy.
 * See .env.local.example.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { FUNNEL_STAGE_KEYS, type FunnelStageKey } from '@/lib/funnel-stages'
import { kvConfigured, kvPipeline } from '@/lib/kv'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

export interface FunnelHit {
  /** YYYY-MM-DD, Bogota-aligned. */
  day: string
  stage: FunnelStageKey
  sessionId: string
}

export interface FunnelData {
  days: string[]
  /** day → stage → unique-session count */
  byDay: Record<string, Record<string, number>>
  /** stage → unique-session count across the whole range */
  totals: Record<string, number>
}

const TTL_SECONDS = 100 * 24 * 60 * 60
const FILE = process.env.FUNNEL_FILE ?? join(process.cwd(), 'data', 'funnel-daily.json')

function keyFor(day: string, stage: string) {
  return `funnel:${day}:${stage}`
}

// ─── JSON-file backend (local/dev) ──────────────────────────────────────────────

type JsonShape = Record<string, Partial<Record<FunnelStageKey, string[]>>>

async function readJson(): Promise<JsonShape> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return data && typeof data === 'object' ? (data as JsonShape) : {}
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function recordJsonHits(hits: FunnelHit[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  const data = await readJson()
  for (const h of hits) {
    const day = (data[h.day] ??= {})
    const list = (day[h.stage] ??= [])
    if (!list.includes(h.sessionId)) list.push(h.sessionId)
  }
  await writeFile(FILE, JSON.stringify(data), 'utf8')
}

// ─── Date helpers ───────────────────────────────────────────────────────────────

/** Inclusive list of YYYY-MM-DD between two day strings (UTC-anchored). */
function enumerateDays(fromDay: string, toDay: string): string[] {
  const days: string[] = []
  const start = Date.parse(`${fromDay}T00:00:00Z`)
  const end = Date.parse(`${toDay}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return []
  // Cap at ~1 year to avoid pathological ranges.
  for (let t = start, i = 0; t <= end && i < 400; t += 86_400_000, i++) {
    days.push(new Date(t).toISOString().slice(0, 10))
  }
  return days
}

// ─── Public API ─────────────────────────────────────────────────────────────────

export async function recordFunnelHits(hits: FunnelHit[]): Promise<void> {
  if (hits.length === 0) return
  if (supabaseConfigured()) {
    // Upsert on the (day, stage, session_id) primary key: a repeat hit from the
    // same session collapses into the existing row instead of double-counting.
    // Postgres rejects an ON CONFLICT batch that touches the same row twice, so
    // duplicates within this batch have to be dropped first.
    const seen = new Set<string>()
    const rows: { day: string; stage: string; session_id: string }[] = []
    for (const h of hits) {
      const k = `${h.day}|${h.stage}|${h.sessionId}`
      if (seen.has(k)) continue
      seen.add(k)
      rows.push({ day: h.day, stage: h.stage, session_id: h.sessionId })
    }
    await sbUpsert('funnel_hits', rows)
    return
  }
  if (kvConfigured()) {
    const commands: (string | number)[][] = []
    const expired = new Set<string>()
    for (const h of hits) {
      const k = keyFor(h.day, h.stage)
      commands.push(['SADD', k, h.sessionId])
      if (!expired.has(k)) {
        commands.push(['EXPIRE', k, TTL_SECONDS])
        expired.add(k)
      }
    }
    await kvPipeline(commands)
    return
  }
  await recordJsonHits(hits)
}

export async function readFunnel(fromDay: string, toDay: string): Promise<FunnelData> {
  const days = enumerateDays(fromDay, toDay)
  const byDay: Record<string, Record<string, number>> = {}

  if (days.length === 0) {
    return { days, byDay, totals: Object.fromEntries(FUNNEL_STAGE_KEYS.map(s => [s, 0])) }
  }

  if (supabaseConfigured()) {
    for (const d of days) {
      byDay[d] = Object.fromEntries(FUNNEL_STAGE_KEYS.map(s => [s, 0]))
    }
    const rows = await sbSelect<{ day: string; stage: string; count: number }>(
      'funnel_daily',
      `day=gte.${days[0]}&day=lte.${days[days.length - 1]}`,
    )
    for (const r of rows) {
      // PostgREST renders `date` as YYYY-MM-DD, but slice defensively anyway.
      const d = String(r.day).slice(0, 10)
      if (byDay[d] && r.stage in byDay[d]) byDay[d][r.stage] = Number(r.count) || 0
    }
  } else if (kvConfigured()) {
    const commands = days.flatMap(d => FUNNEL_STAGE_KEYS.map(s => ['SCARD', keyFor(d, s)]))
    const results = await kvPipeline(commands)
    let i = 0
    for (const d of days) {
      byDay[d] = {}
      for (const s of FUNNEL_STAGE_KEYS) {
        const r = results[i++]
        byDay[d][s] = typeof r === 'number' ? r : Number(r ?? 0) || 0
      }
    }
  } else {
    const data = await readJson()
    for (const d of days) {
      byDay[d] = {}
      for (const s of FUNNEL_STAGE_KEYS) {
        byDay[d][s] = data[d]?.[s]?.length ?? 0
      }
    }
  }

  const totals: Record<string, number> = {}
  for (const s of FUNNEL_STAGE_KEYS) {
    totals[s] = days.reduce((acc, d) => acc + (byDay[d]?.[s] ?? 0), 0)
  }
  return { days, byDay, totals }
}
