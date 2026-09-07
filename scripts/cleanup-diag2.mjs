import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
const res = await fetch(`${url}/rest/v1/bookings?id=eq.7a53c25c-95de-4f68-aa97-744ef3b626d2`, {method:'DELETE',headers:{apikey:key,Authorization:`Bearer ${key}`}})
console.log('Status:', res.status)
