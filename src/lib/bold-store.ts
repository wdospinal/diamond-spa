/**
 * Almacenamiento de los cierres de venta de Bold.
 *
 * Preferencia de backend — Supabase → Vercel KV → archivo JSON, igual que el
 * resto de stores (bookings, blog, landings, push, funnel):
 *  - Supabase: tabla `bold_closings` con columnas reales (se agrega por mes en
 *    la API). La PK es el `Message-ID`, así que un upsert repetido es idempotente
 *    y volver a barrer el buzón nunca duplica un cierre.
 *    Esquema: supabase/migrations/0005_bold_closings.sql.
 *  - Vercel KV / Upstash sobre su API REST vía `fetch` — un hash `bold:closings`
 *    con campo = id, en vez de una lista, porque la deduplicación es por id.
 *  - Local/dev: data/bold-closings.json, un objeto { id: cierre }.
 *
 * En Vercel el sistema de archivos es efímero, así que en producción hace falta
 * Supabase o KV — el fallback a JSON se perdería en cada despliegue.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'
import { fromBoldRow, toBoldRow, type BoldClosing, type BoldClosingRow } from '@/lib/bold-types'

const FILE = process.env.BOLD_FILE ?? join(process.cwd(), 'data', 'bold-closings.json')
const HASH_KEY = 'bold:closings'

// ─── Backend de archivo (local/dev) ─────────────────────────────────────────────

async function readFileMap(): Promise<Record<string, BoldClosing>> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, BoldClosing>)
      : {}
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function writeFileMap(map: Record<string, BoldClosing>): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(map, null, 2), 'utf8')
}

function sortByDay(list: BoldClosing[]): BoldClosing[] {
  return list.sort((a, b) => (a.day === b.day ? a.receivedAt.localeCompare(b.receivedAt) : a.day.localeCompare(b.day)))
}

// ─── API pública ────────────────────────────────────────────────────────────────

/** Cierres ordenados por día ascendente. Rango opcional, ambos extremos inclusive. */
export async function readClosings(fromDay?: string, toDay?: string): Promise<BoldClosing[]> {
  const inRange = (c: BoldClosing) =>
    (!fromDay || c.day >= fromDay) && (!toDay || c.day <= toDay)

  if (supabaseConfigured()) {
    const filters = ['order=day.asc']
    if (fromDay) filters.push(`day=gte.${fromDay}`)
    if (toDay) filters.push(`day=lte.${toDay}`)
    const rows = await sbSelect<BoldClosingRow>('bold_closings', filters.join('&'))
    return rows.map(fromBoldRow)
  }

  if (kvConfigured()) {
    // HGETALL devuelve [campo, valor, campo, valor, …] o un objeto según el proveedor.
    const raw = await kvCommand(['HGETALL', HASH_KEY])
    const values: string[] = Array.isArray(raw)
      ? raw.filter((_, i) => i % 2 === 1).map(String)
      : raw && typeof raw === 'object'
        ? Object.values(raw as Record<string, unknown>).map(String)
        : []
    const list: BoldClosing[] = []
    for (const v of values) {
      try {
        const c = JSON.parse(v) as BoldClosing
        if (inRange(c)) list.push(c)
      } catch {}
    }
    return sortByDay(list)
  }

  return sortByDay(Object.values(await readFileMap()).filter(inRange))
}

/**
 * Guarda cierres. Devuelve cuántos eran nuevos (los repetidos se sobrescriben
 * con el mismo contenido, así que reintentar es seguro).
 */
export async function saveClosings(rows: BoldClosing[]): Promise<{ inserted: number; skipped: number }> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 }

  // Deduplicar dentro del propio lote: Postgres rechaza un ON CONFLICT que toca
  // la misma fila dos veces (mismo motivo que en funnel-store).
  const batch = new Map<string, BoldClosing>()
  for (const r of rows) batch.set(r.id, r)
  const unique = [...batch.values()]

  const known = await existingIds(unique.map(r => r.id))
  const fresh = unique.filter(r => !known.has(r.id))
  const result = { inserted: fresh.length, skipped: unique.length - fresh.length }

  if (supabaseConfigured()) {
    await sbUpsert('bold_closings', unique.map(toBoldRow))
    return result
  }

  if (kvConfigured()) {
    const args: (string | number)[] = ['HSET', HASH_KEY]
    for (const r of unique) args.push(r.id, JSON.stringify(r))
    await kvCommand(args)
    return result
  }

  const map = await readFileMap()
  for (const r of unique) map[r.id] = r
  await writeFileMap(map)
  return result
}

/** Ids ya almacenados de entre los indicados. Permite no re-descargar correos. */
export async function existingIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set()

  if (supabaseConfigured()) {
    const list = ids.map(id => `"${id.replace(/"/g, '\\"')}"`).join(',')
    const rows = await sbSelect<{ id: string }>('bold_closings', `select=id&id=in.(${encodeURIComponent(list)})`)
    return new Set(rows.map(r => r.id))
  }

  if (kvConfigured()) {
    const raw = await kvCommand(['HMGET', HASH_KEY, ...ids])
    const found = new Set<string>()
    if (Array.isArray(raw)) {
      raw.forEach((v, i) => {
        if (v !== null && v !== undefined) found.add(ids[i])
      })
    }
    return found
  }

  const map = await readFileMap()
  return new Set(ids.filter(id => id in map))
}
