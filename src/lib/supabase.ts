/**
 * Minimal Supabase (PostgREST) client over the REST API using `fetch` — no npm
 * dependency (this project deliberately keeps deps minimal, same approach as
 * the KV client in kv.ts). Server-side only: uses the service-role key, which
 * bypasses RLS, so it must NEVER be imported from client components.
 *
 * Reads SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
 * SUPABASE_SERVICE_ROLE_KEY from the env. When unset, callers fall back to
 * Vercel KV or the local JSON files (see the individual stores).
 *
 * Schema lives in supabase/migrations/ — run it in the Supabase SQL editor
 * (or `supabase db push`) before enabling these env vars.
 */

export interface SupabaseConn {
  url: string
  key: string
}

export function supabaseEnv(): SupabaseConn | null {
  const rawUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!rawUrl || !key) return null
  // Normalize common misconfigurations that make PostgREST return
  // PGRST125 "Invalid path": stray whitespace, trailing slashes, or a value
  // that already includes the /rest/v1 (or /auth/v1, /storage/v1) suffix.
  const url = rawUrl.trim().replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/, '')
  return url ? { url, key } : null
}

export function supabaseConfigured(): boolean {
  return supabaseEnv() !== null
}

async function sbFetch(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  pathAndQuery: string,
  body?: unknown,
  prefer?: string,
): Promise<unknown> {
  const conn = supabaseEnv()
  if (!conn) throw new Error('Supabase not configured')
  const res = await fetch(`${conn.url}/rest/v1/${pathAndQuery}`, {
    method,
    headers: {
      apikey: conn.key,
      Authorization: `Bearer ${conn.key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Supabase ${method} ${pathAndQuery} failed: ${res.status} ${await res.text()}`)
  }
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

/**
 * SELECT rows. `query` is a PostgREST query string, e.g.
 * sbSelect('bookings', 'order=created_at.asc') or
 * sbSelect('blog_posts', 'slug=eq.mi-post&limit=1').
 */
export async function sbSelect<T = Record<string, unknown>>(table: string, query = ''): Promise<T[]> {
  const rows = await sbFetch('GET', query ? `${table}?${query}` : table)
  return Array.isArray(rows) ? (rows as T[]) : []
}

/** INSERT rows; returns the inserted rows. */
export async function sbInsert<T = Record<string, unknown>>(table: string, rows: unknown): Promise<T[]> {
  const out = await sbFetch('POST', table, rows, 'return=representation')
  return Array.isArray(out) ? (out as T[]) : []
}

/** INSERT ... ON CONFLICT DO UPDATE (upsert on the table's primary key). */
export async function sbUpsert<T = Record<string, unknown>>(table: string, rows: unknown): Promise<T[]> {
  const out = await sbFetch('POST', table, rows, 'resolution=merge-duplicates,return=representation')
  return Array.isArray(out) ? (out as T[]) : []
}

/**
 * UPDATE rows matching a PostgREST filter, e.g.
 * sbUpdate('bookings', 'id=eq.<uuid>', { status: 'arrived' }).
 * Returns the updated rows (empty array when nothing matched).
 */
export async function sbUpdate<T = Record<string, unknown>>(
  table: string,
  filter: string,
  patch: unknown,
): Promise<T[]> {
  const out = await sbFetch('PATCH', `${table}?${filter}`, patch, 'return=representation')
  return Array.isArray(out) ? (out as T[]) : []
}

/** DELETE rows matching a PostgREST filter, e.g. sbDelete('blog_posts', 'id=eq.<uuid>'). */
export async function sbDelete(table: string, filter: string): Promise<void> {
  await sbFetch('DELETE', `${table}?${filter}`)
}
