import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
const res = await fetch(`${url}/rest/v1/bookings?id=eq.3e899402-ade1-48f2-a1ab-631ac19f818a&select=*`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
console.log(JSON.stringify(await res.json(), null, 2))
