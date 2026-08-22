import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const rawUrl = (env.match(/SUPABASE_URL=(.+)/)?.[1] ?? env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1])?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()
const baseUrl = rawUrl?.replace(/\/+$/, '')
const projectRef = baseUrl.replace('https://', '').split('.')[0]

// Use Supabase Management API to run DDL SQL
const sql = `alter table if exists public.bookings drop constraint if exists bookings_status_check;
alter table if exists public.bookings add constraint bookings_status_check check (status in ('pending', 'contacted', 'arrived', 'completed', 'cancelled'));`

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: sql })
})

console.log('Management API status:', res.status)
const body = await res.text()
console.log('Response:', body)
