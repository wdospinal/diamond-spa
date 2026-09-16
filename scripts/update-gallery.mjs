import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

const getRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234&select=id,data`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
const rows = await getRes.json()
const full = rows[0].data

// Mismo orden que el bloque de servicios: Deep Tissue, Relajante, Deportivo, Sensitivo.
// OJO: Sensitivo usa temporalmente la foto de Relajante -- no hay foto propia
// todavia en /public/images-ads/. Reemplazar cuando haya una real.
full.content.gallery.images = [
  { url: '/masaje.webp', title: 'Tejido Profundo' },
  { url: '/images-ads/masaje relajante.jpg', title: 'Masaje Relajante' },
  { url: '/images-ads/masaje-deportivo.png', title: 'Masaje Deportivo' },
  { url: '/images-ads/masaje relajante.jpg', title: 'Masaje Sensitivo' },
]
full.content_en.gallery.images = [
  { url: '/masaje.webp', title: 'Deep Tissue' },
  { url: '/images-ads/masaje relajante.jpg', title: 'Relaxing Massage' },
  { url: '/images-ads/masaje-deportivo.png', title: 'Sports Massage' },
  { url: '/images-ads/masaje relajante.jpg', title: 'Sensitive Massage' },
]

const patchRes = await fetch(`${url}/rest/v1/landings?id=eq.dummy-landing-1234`, {
  method: 'PATCH',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ data: full }),
})
console.log('Status:', patchRes.status)
const updated = await patchRes.json()
console.log('Galeria ES actualizada:', JSON.stringify(updated[0]?.data?.content?.gallery?.images?.map(i => i.title)))
