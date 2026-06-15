/**
 * Minimal Vercel KV / Upstash Redis client over the REST API using `fetch` —
 * no npm dependency (this project deliberately keeps deps minimal). Shared by
 * the funnel aggregate store and the bookings store.
 *
 * Reads KV_REST_API_URL/KV_REST_API_TOKEN (Vercel KV) or
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (Upstash) from the env, which
 * Vercel injects automatically when a KV store is connected to the project.
 */

export interface KvConn {
  url: string
  token: string
}

export function kvEnv(): KvConn | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

export function kvConfigured(): boolean {
  return kvEnv() !== null
}

type KvResult = { result?: unknown; error?: string }

async function kvFetch(path: string, body: unknown): Promise<unknown> {
  const conn = kvEnv()
  if (!conn) throw new Error('KV not configured')
  const res = await fetch(`${conn.url}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${conn.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV ${path || '/'} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

/** Run a single Redis command, e.g. kvCommand(['LRANGE', 'bookings', 0, -1]). */
export async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const json = (await kvFetch('', command)) as KvResult
  if (json.error) throw new Error(`KV error: ${json.error}`)
  return json.result
}

/** Run several commands in one round-trip; returns the unwrapped results in order. */
export async function kvPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  if (commands.length === 0) return []
  const json = (await kvFetch('/pipeline', commands)) as KvResult[]
  return json.map(r => {
    if (r.error) throw new Error(`KV error: ${r.error}`)
    return r.result
  })
}
