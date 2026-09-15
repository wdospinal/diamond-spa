import { readFileSync } from 'fs'
const rows = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_raw_services.json', 'utf8'))

// Normaliza variantes ES/EN del mismo servicio a un solo nombre para agrupar bien.
const NORMALIZE = {
  'deep tissue': 'Tejido Profundo (Deep Tissue)',
  'tejido profundo': 'Tejido Profundo (Deep Tissue)',
  'relaxing massage': 'Masaje Relajante',
  'masaje relajante': 'Masaje Relajante',
  'sports massage': 'Masaje Deportivo (Sports)',
  'chest': 'Pecho (depilación)',
  'pecho': 'Pecho (depilación)',
  'con piedras volcánicas': 'Piedras Volcánicas (Hot Stones)',
  'bikini': 'Bikini (depilación)',
  'duo masaje': 'Duo Masaje',
  '4 manos': 'Masaje 4 Manos',
  'masaje sensitivo': 'Masaje Sensitivo',
  'servicio premium': 'Servicio Premium',
}
const WHATSAPP_GENERIC = new Set([
  'lead whatsapp (recepción directa)',
  'lead de whatsapp (sin servicio específico)',
])

const byService = {}
let genericWhatsapp = { count: 0, revenue: 0 }

for (const r of rows) {
  const key = (r.service_name || '').trim().toLowerCase()
  if (WHATSAPP_GENERIC.has(key)) {
    genericWhatsapp.count++
    genericWhatsapp.revenue += r.price_cop || 0
    continue
  }
  const normalized = NORMALIZE[key] || r.service_name
  if (!byService[normalized]) byService[normalized] = { count: 0, revenue: 0, ads: 0, organic: 0 }
  byService[normalized].count++
  byService[normalized].revenue += r.price_cop || 0
  if (r.source === 'ads') byService[normalized].ads++
  else byService[normalized].organic++
}

const ranked = Object.entries(byService).sort((a, b) => b[1].count - a[1].count)

console.log('=== Ranking de servicios, pagados/reservados (organico + ads) ===')
console.log('')
for (const [name, d] of ranked) {
  console.log(`${d.count.toString().padStart(2)} × ${name.padEnd(35)} | $${d.revenue.toLocaleString('es-CO').padStart(10)} COP | orgánico:${d.organic} ads:${d.ads}`)
}
console.log('')
console.log(`Leads de WhatsApp sin servicio específico asignado: ${genericWhatsapp.count} (excluidos del ranking, no representan un servicio elegido)`)

const totalCount = ranked.reduce((s, [, d]) => s + d.count, 0)
const totalRevenue = ranked.reduce((s, [, d]) => s + d.revenue, 0)
console.log('')
console.log(`Total con servicio identificado: ${totalCount} reservas, $${totalRevenue.toLocaleString('es-CO')} COP`)
