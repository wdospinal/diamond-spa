import { readFileSync } from 'fs'
const rows = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_all_leads.json', 'utf8'))

const NORMALIZE = {
  'deep tissue': 'Tejido Profundo (Deep Tissue)',
  'tejido profundo': 'Tejido Profundo (Deep Tissue)',
  'relaxing massage': 'Masaje Relajante',
  'masaje relajante': 'Masaje Relajante',
  'sports massage': 'Masaje Deportivo (Sports)',
  'masaje deportivo': 'Masaje Deportivo (Sports)',
  'chest': 'Pecho (depilación)',
  'pecho': 'Pecho (depilación)',
  'con piedras volcánicas': 'Piedras Volcánicas (Hot Stones)',
  'piedras volcánicas': 'Piedras Volcánicas (Hot Stones)',
  'bikini': 'Bikini (depilación)',
  'duo masaje': 'Duo Masaje',
  '4 manos': 'Masaje 4 Manos',
  'masaje sensitivo': 'Masaje Sensitivo',
  'sensitivo': 'Masaje Sensitivo',
  'servicio premium': 'Servicio Premium',
}
const GENERIC = new Set([
  'lead whatsapp (recepción directa)',
  'lead de whatsapp (sin servicio específico)',
])

const byService = {}
let generic = 0

for (const r of rows) {
  const key = (r.service_name || '').trim().toLowerCase()
  if (!key || GENERIC.has(key)) { generic++; continue }
  const normalized = NORMALIZE[key] || r.service_name
  if (!byService[normalized]) byService[normalized] = { leads: 0, ads: 0, organic: 0, cerrados: 0 }
  byService[normalized].leads++
  if (r.source === 'ads') byService[normalized].ads++
  else byService[normalized].organic++
  if (r.status === 'completed') byService[normalized].cerrados++
}

const ranked = Object.entries(byService).sort((a, b) => b[1].leads - a[1].leads)

console.log('=== RANKING POR LEADS TOTALES (todas las etapas) ===\n')
ranked.forEach(([name, d], i) => {
  console.log(`${i+1}. ${name.padEnd(35)} ${d.leads} leads  (${d.ads} ads / ${d.organic} orgánico)  →  ${d.cerrados} cerrados`)
})
console.log(`\nLeads de WhatsApp genéricos, sin servicio específico: ${generic}`)
