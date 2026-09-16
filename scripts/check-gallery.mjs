import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

const res = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234&select=id,data`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
const rows = await res.json()
const full = rows[0].data
console.log('gallery (ES):', JSON.stringify(full.content?.gallery, null, 2))
console.log('gallery (EN):', JSON.stringify(full.content_en?.gallery, null, 2))
