import { readFileSync, writeFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY

// "Pagados y reservados": llegaron a una etapa real del pipeline (agendado o
// completado) o ya pagaron -- excluye leads que se quedaron en Nuevo/En Chat
// sin avanzar, y los cancelados.
const res = await fetch(
  `${url}/rest/v1/bookings?select=service_name,source,price_cop,status,payment_status&or=(status.eq.arrived,status.eq.completed,payment_status.eq.paid)`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
)
const rows = await res.json()
console.log('Total registros pagados/reservados:', rows.length)

writeFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_raw_services.json', JSON.stringify(rows, null, 2))
console.log('Guardado en scripts/_raw_services.json para revisar los nombres crudos')
