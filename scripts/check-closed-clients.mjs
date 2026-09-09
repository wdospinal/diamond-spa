import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
const res = await fetch(`${url}/rest/v1/bookings?select=id,created_at,name,phone,service_name,price_cop,source,gclid&status=eq.completed&payment_status=eq.paid&created_at=gte.2026-08-25&created_at=lte.2026-09-09&order=created_at.desc`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
const rows = await res.json()
console.log('Total completados+pagados 25 ago - 8 sep:', rows.length)
console.log(JSON.stringify(rows, null, 2))
