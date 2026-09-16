import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

// 1. Traer el objeto COMPLETO actual, para no perder nada al reescribir
const getRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234&select=id,data`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
const rows = await getRes.json()
const full = rows[0].data

const NEW_ORDER = ['deep-tissue', 'relaxing', 'sports', 'sensitive']
console.log('Antes (ES):', JSON.stringify(full.content.services.serviceIds))
console.log('Antes (EN):', JSON.stringify(full.content_en.services.serviceIds))

full.content.services.serviceIds = NEW_ORDER
full.content_en.services.serviceIds = NEW_ORDER

// 2. Escribir el objeto completo de vuelta, con solo esos 2 arrays cambiados
const patchRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234`, {
  method: 'PATCH',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ data: full }),
})
console.log('Status del PATCH:', patchRes.status)
const updated = await patchRes.json()
console.log('Despues (ES):', JSON.stringify(updated[0]?.data?.content?.services?.serviceIds))
console.log('Despues (EN):', JSON.stringify(updated[0]?.data?.content_en?.services?.serviceIds))
