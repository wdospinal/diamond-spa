/**
 * Configuración compartida por todo el equipo.
 *
 * Preferencia de backend — Supabase → Vercel KV → archivo JSON, igual que el
 * resto de stores. Esquema en supabase/migrations/0014_app_settings.sql.
 *
 * Es a propósito un almacén compartido y no `localStorage`: el día de corte
 * decide qué movimientos entran en cada período, así que si cada navegador
 * tuviera el suyo, dos personas verían utilidades distintas del mismo mes.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'

const FILE = process.env.SETTINGS_FILE ?? join(process.cwd(), 'data', 'app-settings.json')
const HASH_KEY = 'app:settings'

/** Día de corte del período contable. Ver `src/lib/cycle.ts`. */
export const CYCLE_START_DAY_KEY = 'ledger.cycle_start_day'

interface SettingRow {
  key: string
  value: unknown
}

async function readFileMap(): Promise<Record<string, unknown>> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {}
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return {}
    throw e
  }
}

/**
 * Lee un ajuste. Si el almacén falla, devuelve el valor por defecto en vez de
 * lanzar: una configuración que no carga no debe tumbar la página de caja.
 */
export async function readSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    if (supabaseConfigured()) {
      const rows = await sbSelect<SettingRow>(
        'app_settings',
        `key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
      )
      return rows.length ? (rows[0].value as T) : fallback
    }

    if (kvConfigured()) {
      const raw = await kvCommand(['HGET', HASH_KEY, key])
      if (typeof raw !== 'string') return fallback
      return JSON.parse(raw) as T
    }

    const map = await readFileMap()
    return key in map ? (map[key] as T) : fallback
  } catch (err) {
    console.error(`No se pudo leer el ajuste ${key}:`, err)
    return fallback
  }
}

export async function writeSetting(key: string, value: unknown, updatedBy?: string): Promise<void> {
  if (supabaseConfigured()) {
    await sbUpsert('app_settings', [
      { key, value, updated_at: new Date().toISOString(), updated_by: updatedBy ?? null },
    ])
    return
  }

  if (kvConfigured()) {
    await kvCommand(['HSET', HASH_KEY, key, JSON.stringify(value)])
    return
  }

  const map = await readFileMap()
  map[key] = value
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(map, null, 2), 'utf8')
}
