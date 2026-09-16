import { readFileSync, writeFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

// Esta vez: TODOS los leads, sin importar la etapa (no solo pagados/reservados)
const res = await fetch(
  `${url}/rest/v1/bookings?select=service_name,source,status,price_cop`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
const rows = await res.json()
console.log('Total leads en la base de datos:', rows.length)
writeFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_all_leads.json', JSON.stringify(rows, null, 2))
