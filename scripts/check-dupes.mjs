import { readFileSync, writeFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

// Ultimos 14 dias, todo, para buscar duplicados reales por telefono+cercania de tiempo
const res = await fetch(
  `${url}/rest/v1/bookings?select=id,created_at,name,phone,service_name,source,gclid,status&order=created_at.desc&limit=200`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
const rows = await res.json()
console.log('Total registros revisados:', rows.length)
writeFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_dup_check.json', JSON.stringify(rows, null, 2))
