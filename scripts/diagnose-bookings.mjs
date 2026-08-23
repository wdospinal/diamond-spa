import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const url = env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

const res = await fetch(
  `${url}/rest/v1/bookings?select=*&status=eq.completed&payment_status=eq.paid`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const rows = await res.json()
console.log(JSON.stringify(rows, null, 2))
