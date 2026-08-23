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

const now = new Date().toISOString()

const testRow = {
  date_key: now.slice(0, 10),
  time_slot: '10:00 AM',
  scheduled_at: now,
  service_id: 'relaxing',
  service_name: 'Relajante',
  duration_minutes: 60,
  price_cop: 120000,
  price_usd: 29.27,
  duration: '60 min',
  name: 'TEST - BORRAR - Configuracion Google Ads',
  phone: '+573000000000',
  status: 'completed',
  payment_status: 'paid',
  source: 'ads',
  gclid: 'TEST_TEMPORAL_' + Math.random().toString(36).slice(2, 18),
  adgroup: 'test',
}

const res = await fetch(`${url}/rest/v1/bookings`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify(testRow),
})

const out = await res.json()
console.log('Status:', res.status)
console.log(JSON.stringify(out, null, 2))
