import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

function detectChannel(b) {
  if (b.duration_minutes != null || b.hair_method != null) return 'form'
  const req = b.requests || ''
  if (req.startsWith('Campaña:') || req.includes('saltó ese paso') || b.service_name === 'Lead WhatsApp (Recepción Directa)') {
    return 'whatsapp'
  }
  return null
}

const ids = ['2fd2066c-40e1-4644-adad-dd4a5e2087a9','9db0ab9e-e539-4815-aa77-a6f5cb5b13eb','50aa7b3e-424e-4623-acfe-2289524190b4','75814f75-7aa8-4d0c-99a8-e1f519e15e5a']
const res = await fetch(`${url}/rest/v1/bookings?id=in.(${ids.join(',')})&select=id,name,duration_minutes,hair_method,requests,service_name`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
const rows = await res.json()

console.log('=== Prueba contra los 4 registros ya verificados con el usuario ===')
for (const r of rows) {
  console.log(`${r.name || '(sin nombre)'} -> detectado como: ${detectChannel(r)}`)
}

// Muestra tambien contra una muestra mas amplia reciente, para ver la distribucion real
const res2 = await fetch(`${url}/rest/v1/bookings?select=duration_minutes,hair_method,requests,service_name&created_at=gte.2026-08-25&order=created_at.desc&limit=60`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
const rows2 = await res2.json()
const counts = { form: 0, whatsapp: 0, null: 0 }
for (const r of rows2) {
  const c = detectChannel(r)
  counts[c === null ? 'null' : c]++
}
console.log('')
console.log('=== Distribucion en los ultimos 60 registros (25 ago en adelante) ===')
console.log(counts)
