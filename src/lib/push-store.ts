import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { kvCommand, kvConfigured } from '@/lib/kv'
import { sbDelete, sbSelect, sbUpsert, supabaseConfigured } from '@/lib/supabase'
import type { PushSubscription } from 'web-push'

// Backend preference: Supabase (`push_subscriptions` table, keyed by endpoint)
// → Vercel KV → data/push-subs.json. Schema: supabase/migrations/0001_init.sql.

const FILE = join(process.cwd(), 'data', 'push-subs.json')
const LIST_KEY = 'push_subscriptions'

async function readFileSubs(): Promise<PushSubscription[]> {
  try {
    const data = JSON.parse(await readFile(FILE, 'utf8')) as unknown
    return Array.isArray(data) ? (data as PushSubscription[]) : []
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ENOENT') return []
    throw e
  }
}

async function saveFileSubs(list: PushSubscription[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
}

export async function readSubscriptions(): Promise<PushSubscription[]> {
  if (supabaseConfigured()) {
    const rows = await sbSelect<{ data: PushSubscription }>('push_subscriptions', 'select=data')
    return rows.map(r => r.data)
  }
  if (kvConfigured()) {
    const raw = await kvCommand(['LRANGE', LIST_KEY, 0, -1])
    if (!Array.isArray(raw)) return []
    const rows: PushSubscription[] = []
    for (const item of raw) {
      if (typeof item === 'string') {
        try { rows.push(JSON.parse(item) as PushSubscription) } catch {}
      }
    }
    return rows
  }
  return readFileSubs()
}

export async function addSubscription(sub: PushSubscription): Promise<void> {
  if (supabaseConfigured()) {
    // Endpoint is the primary key, so re-subscribing just overwrites the row.
    await sbUpsert('push_subscriptions', { endpoint: sub.endpoint, data: sub })
    return
  }
  if (kvConfigured()) {
    // Avoid exact duplicates (simple check by endpoint)
    const existing = await readSubscriptions()
    if (!existing.some(s => s.endpoint === sub.endpoint)) {
      await kvCommand(['RPUSH', LIST_KEY, JSON.stringify(sub)])
    }
  } else {
    const list = await readFileSubs()
    if (!list.some(s => s.endpoint === sub.endpoint)) {
      list.push(sub)
      await saveFileSubs(list)
    }
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  if (supabaseConfigured()) {
    await sbDelete('push_subscriptions', `endpoint=eq.${encodeURIComponent(endpoint)}`)
    return
  }
  if (kvConfigured()) {
    // Read all, filter, and rewrite the list
    const existing = await readSubscriptions()
    const filtered = existing.filter(s => s.endpoint !== endpoint)
    await kvCommand(['DEL', LIST_KEY])
    if (filtered.length > 0) {
      // Push back one by one or in batch (simple batch approach below)
      for (const s of filtered) {
         await kvCommand(['RPUSH', LIST_KEY, JSON.stringify(s)])
      }
    }
  } else {
    const list = await readFileSubs()
    await saveFileSubs(list.filter(s => s.endpoint !== endpoint))
  }
}
