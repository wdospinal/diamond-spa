import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
for (const id of ['172d5fad-effa-4e2e-b1e2-66b4a2bf0e78','c5fff83f-62f6-4a81-a27f-da1dac5de594']) {
  const res = await fetch(`${url}/rest/v1/bookings?id=eq.${id}`, {method:'DELETE',headers:{apikey:key,Authorization:`Bearer ${key}`}})
  console.log(id, res.status)
}
