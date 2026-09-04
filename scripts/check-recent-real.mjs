import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
const res = await fetch(`${url}/rest/v1/bookings?select=id,created_at,name,phone,source,gclid,status&created_at=gte.2026-09-01&order=created_at.desc`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
const rows = await res.json()
console.log('Total reservas desde el 1 de sept:', rows.length)
console.log(JSON.stringify(rows, null, 2))
