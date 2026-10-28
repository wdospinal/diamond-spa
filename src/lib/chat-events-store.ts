/**
 * Almacén de los eventos del chat de la pauta (ver lib/chat-events.ts).
 *
 * Supabase (`chat_events`, migración 0017) en producción. Para desarrollo sin
 * infraestructura —o para probar sin tocar la base de producción— existe un
 * archivo JSON (data/chat-events.json), que se activa solo cuando Supabase no
 * está configurado o con CHAT_EVENTS_STORE=file. En Vercel el disco es efímero,
 * así que producción necesita Supabase.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

export interface ChatEventRow {
  session_id: string
  seq: number
  /** YYYY-MM-DD, fecha de Bogotá. */
  day: string
  created_at: string
  ev: string
  k: string | null
  cat: string | null
  node: string | null
  lang: string | null
  dev: string | null
  ads: boolean | null
  adg: string | null
}

const FILE = process.env.CHAT_EVENTS_FILE ?? join(process.cwd(), 'data', 'chat-events.json')
/** El archivo solo es para pruebas: se queda con lo más reciente. */
const FILE_MAX_ROWS = 50_000
const PAGE = 1000
/** Tope de páginas al leer (50.000 filas): protege la API de rangos enormes. */
const MAX_PAGES = 50

const useFile = () => process.env.CHAT_EVENTS_STORE === 'file' || !supabaseConfigured()

async function readJson(): Promise<ChatEventRow[]> {
  try {
    const data = JSON.parse(await readFile(/*turbopackIgnore: true*/ FILE, 'utf8')) as unknown
    return Array.isArray(data) ? (data as ChatEventRow[]) : []
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return []
    throw e
  }
}

export async function recordChatEvents(rows: ChatEventRow[]): Promise<void> {
  if (rows.length === 0) return
  // Postgres rechaza un ON CONFLICT que toca la misma fila dos veces en un lote.
  const seen = new Set<string>()
  const unique = rows.filter(r => {
    const key = `${r.session_id}|${r.seq}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (!useFile()) {
    await sbUpsert('chat_events', unique)
    return
  }
  await mkdir(dirname(FILE), { recursive: true })
  const all = await readJson()
  const index = new Map(all.map((r, i) => [`${r.session_id}|${r.seq}`, i]))
  for (const r of unique) {
    const at = index.get(`${r.session_id}|${r.seq}`)
    if (at === undefined) all.push(r)
    else all[at] = r
  }
  await writeFile(FILE, JSON.stringify(all.slice(-FILE_MAX_ROWS)), 'utf8')
}

const COLUMNS = 'session_id,seq,day,created_at,ev,k,cat,node,lang,dev,ads,adg'

/** Eventos entre dos fechas (YYYY-MM-DD, ambas incluidas). */
export async function readChatEvents(fromDay: string, toDay: string): Promise<ChatEventRow[]> {
  if (useFile()) {
    return (await readJson()).filter(r => r.day >= fromDay && r.day <= toDay)
  }
  const out: ChatEventRow[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await sbSelect<ChatEventRow>(
      'chat_events',
      `select=${COLUMNS}&day=gte.${fromDay}&day=lte.${toDay}&order=day.asc,session_id.asc,seq.asc&limit=${PAGE}&offset=${page * PAGE}`,
    )
    for (const r of rows) {
      out.push({ ...r, day: String(r.day).slice(0, 10) })
    }
    if (rows.length < PAGE) break
  }
  return out
}
