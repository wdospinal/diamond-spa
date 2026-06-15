/**
 * Durable aggregate store for the sales funnel.
 *
 * Counting model: per stage per day we keep the SET of `sessionId`s that
 * reached that stage, so the dashboard reports *unique sessions* (a refresh
 * doesn't inflate the top of the funnel). The count for a stage/day is the
 * cardinality of that set.
 *
 * Backends (chosen at runtime):
 *  - Production: Vercel KV / Upstash Redis over its REST API via `fetch` — no
 *    npm dependency (this project deliberately keeps deps minimal). Uses Redis
 *    sets (SADD / SCARD) with a ~100-day TTL so old days auto-expire.
 *  - Local/dev fallback: a JSON file (data/funnel-daily.json), same pattern as
 *    bookings-store.ts. Lets the whole pipeline be tested with zero infra.
 *
 * The KV backend is used whenever its env vars are present; otherwise the JSON
 * file is used. On Vercel the filesystem is ephemeral, so production REQUIRES a
 * connected KV store — see .env.local.example.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { FUNNEL_STAGE_KEYS, type FunnelStageKey } from '@/lib/funnel-stages'
import { kvConfigured, kvPipeline } from '@/lib/kv'

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

  if (kvConfigured()) {
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
