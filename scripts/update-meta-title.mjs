import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

const getRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234&select=id,data`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
const rows = await getRes.json()
const full = rows[0].data

console.log('Antes:', full.seo.en.metaTitle)
full.seo.en.metaTitle = 'Massage in El Poblado, Medellín | Diamond Spa'

const patchRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234`, {
  method: 'PATCH',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ data: full }),
})
console.log('Status:', patchRes.status)
const updated = await patchRes.json()
console.log('Despues:', updated[0]?.data?.seo?.en?.metaTitle)
