/**
 * Almacenamiento de los movimientos de caja.
 *
 * Preferencia de backend — Supabase → Vercel KV → archivo JSON, igual que el
 * resto de stores (bookings, bold, blog, landings, push, funnel):
 *  - Supabase: tabla `ledger_entries` con columnas reales, para poder filtrar
 *    por rango de días en el servidor. Esquema en
 *    supabase/migrations/0011_ledger_entries.sql.
 *  - Vercel KV / Upstash sobre su API REST vía `fetch` — un hash
 *    `ledger:entries` con campo = id, porque la deduplicación es por id.
 *  - Local/dev: data/ledger-entries.json, un objeto { id: movimiento }.
 *
 * En Vercel el sistema de archivos es efímero, así que en producción hace falta
 * Supabase o KV — el fallback a JSON se perdería en cada despliegue.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbSelect, sbUpdate, sbUpsert, supabaseConfigured } from '@/lib/supabase'
import {
  fromLedgerRow,
  toLedgerRow,
  type LedgerEntry,
  type LedgerEntryRow,
} from '@/lib/ledger-types'

const FILE = process.env.LEDGER_FILE ?? join(process.cwd(), 'data', 'ledger-entries.json')
const HASH_KEY = 'ledger:entries'

// ─── Backend de archivo (local/dev) ─────────────────────────────────────────────

async function readFileMap(): Promise<Record<string, LedgerEntry>> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, LedgerEntry>)
      : {}
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function writeFileMap(map: Record<string, LedgerEntry>): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(map, null, 2), 'utf8')
}

function sortByMoment(list: LedgerEntry[]): LedgerEntry[] {
  return list.sort((a, b) =>
    a.day === b.day ? a.occurredAt.localeCompare(b.occurredAt) : a.day.localeCompare(b.day),
  )
}

async function readAllKv(): Promise<LedgerEntry[]> {
  // HGETALL devuelve [campo, valor, campo, valor, …] o un objeto según el proveedor.
  const raw = await kvCommand(['HGETALL', HASH_KEY])
  const values: string[] = Array.isArray(raw)
    ? raw.filter((_, i) => i % 2 === 1).map(String)
    : raw && typeof raw === 'object'
      ? Object.values(raw as Record<string, unknown>).map(String)
      : []
  const list: LedgerEntry[] = []
  for (const v of values) {
    try {
      list.push(JSON.parse(v) as LedgerEntry)
    } catch {}
  }
  return list
}

// ─── API pública ────────────────────────────────────────────────────────────────

/** Movimientos ordenados por día ascendente. Rango opcional, ambos extremos inclusive. */
export async function readEntries(fromDay?: string, toDay?: string): Promise<LedgerEntry[]> {
  const inRange = (e: LedgerEntry) =>
    (!fromDay || e.day >= fromDay) && (!toDay || e.day <= toDay)

  if (supabaseConfigured()) {
    const filters = ['order=day.asc']
    if (fromDay) filters.push(`day=gte.${fromDay}`)
    if (toDay) filters.push(`day=lte.${toDay}`)
    const rows = await sbSelect<LedgerEntryRow>('ledger_entries', filters.join('&'))
    return rows.map(fromLedgerRow)
  }

  if (kvConfigured()) return sortByMoment((await readAllKv()).filter(inRange))

  return sortByMoment(Object.values(await readFileMap()).filter(inRange))
}

/** Un movimiento por id, o null. */
export async function readEntry(id: string): Promise<LedgerEntry | null> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<LedgerEntryRow>(
      'ledger_entries',
      `id=eq.${encodeURIComponent(id)}&limit=1`,
    )
    return rows[0] ? fromLedgerRow(rows[0]) : null
  }

  if (kvConfigured()) {
    const raw = await kvCommand(['HGET', HASH_KEY, id])
    if (typeof raw !== 'string') return null
    try {
      return JSON.parse(raw) as LedgerEntry
    } catch {
      return null
    }
  }

  return (await readFileMap())[id] ?? null
}

/**
 * El movimiento que espera respuesta a la pregunta `promptWamid` del bot.
 *
 * Es la pieza que permite completar un dato contestando el mensaje del bot en
 * WhatsApp: el webhook trae `context.id` y por ahí se llega al movimiento.
 */
export async function findByPrompt(promptWamid: string): Promise<LedgerEntry | null> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<LedgerEntryRow>(
      'ledger_entries',
      `prompt_wamid=eq.${encodeURIComponent(promptWamid)}&limit=1`,
    )
    return rows[0] ? fromLedgerRow(rows[0]) : null
  }

  const all = kvConfigured() ? await readAllKv() : Object.values(await readFileMap())
  return all.find(e => e.promptWamid === promptWamid) ?? null
}

/**
 * La última imagen sin descripción de ese remitente, si sigue «abierta».
 *
 * En el chat es normal mandar la foto y el texto en dos mensajes seguidos
 * («12:57:15 <imagen>» → «12:57:16 Relajante 90min»). El texto que llega poco
 * después se pega a esa imagen en vez de crear un movimiento suelto.
 */
export async function findOpenImage(
  author: string,
  now: Date,
  windowMs: number,
): Promise<LedgerEntry | null> {
  const since = new Date(now.getTime() - windowMs).toISOString()
  const candidates = await readEntries(
    new Date(now.getTime() - windowMs - 86_400_000).toISOString().slice(0, 10),
  )
  return (
    candidates
      .filter(
        e =>
          e.author === author &&
          e.mediaId !== null &&
          e.note === '' &&
          e.occurredAt >= since &&
          e.status !== 'void',
      )
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0] ?? null
  )
}

/**
 * Guarda movimientos. Devuelve cuántos eran nuevos (los repetidos se
 * sobrescriben con el mismo contenido, así que reintentar es seguro — y Meta
 * reintenta el webhook ante cualquier error).
 */
export async function saveEntries(
  rows: LedgerEntry[],
): Promise<{ inserted: number; skipped: number }> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 }

  // Deduplicar dentro del propio lote: Postgres rechaza un ON CONFLICT que toca
  // la misma fila dos veces (mismo motivo que en bold-store y funnel-store).
  const batch = new Map<string, LedgerEntry>()
  for (const r of rows) batch.set(r.id, r)
  const unique = [...batch.values()]

  const known = await existingIds(unique)
  const result = {
    inserted: unique.filter(r => !known.has(r.id)).length,
    skipped: unique.filter(r => known.has(r.id)).length,
  }

  if (supabaseConfigured()) {
    await sbUpsert('ledger_entries', unique.map(toLedgerRow))
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

/** Campos que se pueden corregir desde el panel o contestando al bot. */
export type LedgerPatch = Partial<
  Pick<
    LedgerEntry,
    | 'kind'
    | 'amountCop'
    | 'channel'
    | 'categoryId'
    | 'serviceId'
    | 'serviceLabel'
    | 'durationMinutes'
    | 'quantity'
    | 'therapist'
    | 'status'
    | 'pendingField'
    | 'promptWamid'
    | 'day'
  >
>

/** Aplica una corrección. Devuelve el movimiento ya actualizado, o null si no existe. */
export async function updateEntry(id: string, patch: LedgerPatch): Promise<LedgerEntry | null> {
  const current = await readEntry(id)
  if (!current) return null

  const updated: LedgerEntry = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  if (supabaseConfigured()) {
    const rows = await sbUpdate<LedgerEntryRow>(
      'ledger_entries',
      `id=eq.${encodeURIComponent(id)}`,
      toLedgerRow(updated),
    )
    return rows[0] ? fromLedgerRow(rows[0]) : updated
  }

  if (kvConfigured()) {
    await kvCommand(['HSET', HASH_KEY, id, JSON.stringify(updated)])
    return updated
  }

  const map = await readFileMap()
  map[id] = updated
  await writeFileMap(map)
  return updated
}

/**
 * Anula un movimiento. No se borra: el comprobante existió, y perder el rastro
 * es peor que dejar una fila marcada.
 */
export async function voidEntry(id: string): Promise<LedgerEntry | null> {
  return updateEntry(id, { status: 'void', pendingField: null, promptWamid: null })
}

/** De entre los movimientos indicados, cuáles ya estaban guardados. */
export async function existingIds(rows: Pick<LedgerEntry, 'id' | 'day'>[]): Promise<Set<string>> {
  if (rows.length === 0) return new Set()
  const ids = rows.map(r => r.id)

  if (supabaseConfigured()) {
    // Los wamid llevan `.` y `=`, incómodos dentro de un filtro `in.(…)` de
    // PostgREST. Basta con traer los ids de los días que toca el lote —siempre
    // unos pocos— y cruzarlos aquí. Mismo criterio que bold-store.
    const days = rows.map(r => r.day).sort()
    const found = await sbSelect<{ id: string }>(
      'ledger_entries',
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
