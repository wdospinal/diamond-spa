/**
 * Almacenamiento de los cierres de venta de Bold.
 *
 * Preferencia de backend — Supabase → Vercel KV → archivo JSON, igual que el
 * resto de stores (bookings, blog, landings, push, funnel):
 *  - Supabase: tabla `bold_closings` con columnas reales (se agrega por mes en
 *    la API). La PK es el `Message-ID`, así que un upsert repetido es idempotente
 *    y volver a barrer el buzón nunca duplica un cierre.
 *    Esquema: supabase/migrations/0007_bold_closings.sql.
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

/**
 * Identidad real de un cierre. El mismo turno puede llegar por IMAP y también
 * pegarse manualmente, por lo que el Message-ID no basta para deduplicarlo.
 */
export function boldClosingKey(c: Pick<BoldClosing, 'day' | 'fromLabel' | 'toLabel'>): string {
  return JSON.stringify([c.day, c.fromLabel.trim(), c.toLabel.trim()])
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
  // el mismo turno dos veces, aunque los correos tengan Message-ID distintos.
  const batch = new Map<string, BoldClosing>()
  for (const r of rows) batch.set(boldClosingKey(r), r)
  const unique = [...batch.values()]

  const known = await existingClosingKeys(unique)
  const fresh = unique.filter(r => !known.has(boldClosingKey(r)))
  const result = { inserted: fresh.length, skipped: unique.length - fresh.length }
  if (fresh.length === 0) return result

  if (supabaseConfigured()) {
    await sbUpsert('bold_closings', fresh.map(toBoldRow))
    return result
  }

  if (kvConfigured()) {
    const args: (string | number)[] = ['HSET', HASH_KEY]
    for (const r of fresh) args.push(r.id, JSON.stringify(r))
    await kvCommand(args)
    return result
  }

  const map = await readFileMap()
  for (const r of fresh) map[r.id] = r
  await writeFileMap(map)
  return result
}

async function existingClosingKeys(
  rows: Pick<BoldClosing, 'day' | 'fromLabel' | 'toLabel'>[],
): Promise<Set<string>> {
  if (rows.length === 0) return new Set()
  const days = rows.map(r => r.day).sort()

  if (supabaseConfigured()) {
    const found = await sbSelect<Pick<BoldClosingRow, 'day' | 'from_label' | 'to_label'>>(
      'bold_closings',
      `select=day,from_label,to_label&day=gte.${days[0]}&day=lte.${days[days.length - 1]}`,
    )
    return new Set(
      found.map(r =>
        boldClosingKey({
          day: String(r.day).slice(0, 10),
          fromLabel: r.from_label ?? '',
          toLabel: r.to_label ?? '',
        }),
      ),
    )
  }

  const existing = kvConfigured()
    ? await readClosings(days[0], days[days.length - 1])
    : Object.values(await readFileMap()).filter(c => c.day >= days[0] && c.day <= days[days.length - 1])
  return new Set(existing.map(boldClosingKey))
}

/**
 * De entre los cierres indicados, cuáles ya estaban guardados. Sirve para
 * distinguir "nuevo" de "repetido" al informar el resultado de una sincronización.
 */
export async function existingIds(rows: Pick<BoldClosing, 'id' | 'day'>[]): Promise<Set<string>> {
  if (rows.length === 0) return new Set()
  const ids = rows.map(r => r.id)

  if (supabaseConfigured()) {
    // Los Message-ID llevan `<`, `>` y `@`, incómodos de escapar dentro de un
    // filtro `in.(…)` de PostgREST. Basta con traer los ids de los días que
    // toca el lote —siempre unos pocos— y cruzarlos aquí.
    const days = rows.map(r => r.day).sort()
    const found = await sbSelect<{ id: string }>(
      'bold_closings',
      `select=id&day=gte.${days[0]}&day=lte.${days[days.length - 1]}`,
    )
    const wanted = new Set(ids)
    return new Set(found.map(r => r.id).filter(id => wanted.has(id)))
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
