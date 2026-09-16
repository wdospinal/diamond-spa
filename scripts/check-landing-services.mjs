import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

const res = await fetch(`${url}/rest/v1/landings?select=id,data`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
const rows = await res.json()
console.log('Total filas:', rows.length)
for (const r of rows) console.log('id:', r.id, '| path:', r.data?.path)

const target = rows.find(r => r.data?.path === '/l/oferta-masajes')
console.log('')
console.log('serviceIds (ES):', JSON.stringify(target?.data?.content?.services?.serviceIds))
console.log('serviceIds (EN):', JSON.stringify(target?.data?.content_en?.services?.serviceIds))
