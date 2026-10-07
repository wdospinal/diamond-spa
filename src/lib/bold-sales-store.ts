/**
 * Almacenamiento de las compras individuales de Bold (correos "Compra por $").
 *
 * Mismo esquema de backends que bold-store.ts — Supabase → Vercel KV → JSON:
 *  - Supabase: tabla `bold_sales` (supabase/migrations/0016_bold_sales.sql).
 *  - KV: hash `bold:sales` con campo = id.
 *  - Local/dev: data/bold-sales.json, un objeto { id: compra }.
 *
 * La clave es el "ID Transacción Bold", así que reescribir una compra ya
 * guardada es inocuo.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'
import { fromBoldSaleRow, toBoldSaleRow, type BoldSale, type BoldSaleRow } from '@/lib/bold-types'

const FILE = process.env.BOLD_SALES_FILE ?? join(process.cwd(), 'data', 'bold-sales.json')
const HASH_KEY = 'bold:sales'

async function readFileMap(): Promise<Record<string, BoldSale>> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, BoldSale>)
      : {}
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

async function readAll(): Promise<BoldSale[]> {
  if (kvConfigured()) {
    const raw = await kvCommand(['HGETALL', HASH_KEY])
    const values: string[] = Array.isArray(raw)
      ? raw.filter((_, i) => i % 2 === 1).map(String)
      : raw && typeof raw === 'object'
        ? Object.values(raw as Record<string, unknown>).map(String)
        : []
    const list: BoldSale[] = []
    for (const v of values) {
      try {
        list.push(JSON.parse(v) as BoldSale)
      } catch {}
    }
    return list
  }
  return Object.values(await readFileMap())
}

/** Compras de los días posteriores a `afterDay` (exclusivo), en orden cronológico. */
export async function readSalesAfterDay(afterDay: string): Promise<BoldSale[]> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<BoldSaleRow>('bold_sales', `day=gt.${afterDay}&order=occurred_at.asc`)
    return rows.map(fromBoldSaleRow)
  }
  return (await readAll())
    .filter(s => s.day > afterDay)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
}

/** Guarda compras. Devuelve cuántas eran nuevas. */
export async function saveSales(rows: BoldSale[]): Promise<{ inserted: number; skipped: number }> {
  const unique = [...new Map(rows.map(r => [r.id, r])).values()]
  if (unique.length === 0) return { inserted: 0, skipped: 0 }

  const known = await existingSaleIds(unique)
  const fresh = unique.filter(r => !known.has(r.id))
  const result = { inserted: fresh.length, skipped: unique.length - fresh.length }
  if (fresh.length === 0) return result

  if (supabaseConfigured()) {
    await sbUpsert('bold_sales', fresh.map(toBoldSaleRow))
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
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(map, null, 2), 'utf8')
  return result
}

async function existingSaleIds(rows: BoldSale[]): Promise<Set<string>> {
  const wanted = new Set(rows.map(r => r.id))
  if (supabaseConfigured()) {
    // Los ids de Bold son alfanuméricos, pero se filtra por fechas igual que en
    // bold-store para no armar un `in.(…)` a mano.
    const times = rows.map(r => r.occurredAt).sort()
    const found = await sbSelect<{ id: string }>(
      'bold_sales',
      `select=id&occurred_at=gte.${encodeURIComponent(times[0]!)}&occurred_at=lte.${encodeURIComponent(times[times.length - 1]!)}`,
    )
    return new Set(found.map(r => r.id).filter(id => wanted.has(id)))
  }
  return new Set((await readAll()).map(s => s.id).filter(id => wanted.has(id)))
}
