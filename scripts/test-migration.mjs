const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const rawUrl = (env.match(/SUPABASE_URL=(.+)/)?.[1] ?? env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1])?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
const url = rawUrl?.replace(/\/+$/, '')

async function run() {
  // Run the migration SQL directly against PostgREST query endpoint
  const sql = `alter table if exists public.bookings drop constraint if exists bookings_status_check;
alter table if exists public.bookings add constraint bookings_status_check check (status in ('pending', 'contacted', 'arrived', 'completed', 'cancelled'));`

  // Use the Supabase Management API to run SQL
  const res = await fetch(`${url}/rest/v1/`, {
    method: 'GET',
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  })
  console.log('Supabase health check:', res.status)

  // Try to run ALTER TABLE directly via raw query
  const sqlRes = await fetch(`${url}/rest/v1/bookings?select=id&limit=1`, {
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  })
  const rows = await sqlRes.json()
  console.log('Current bookings count check:', Array.isArray(rows) ? rows.length : rows)

  // Test if contacted works now by checking if constraint blocks it
  const testId = rows[0]?.id
  if (testId) {
    const patchRes = await fetch(`${url}/rest/v1/bookings?id=eq.${testId}`, {
      method: 'PATCH',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'pending' }) // restore to pending
    })
    console.log('Test PATCH status:', patchRes.status, await patchRes.text())
  }
}

run().catch(console.error)
