import { readFileSync } from 'fs'
const data = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\clarity_diag.json', 'utf8'))

const traffic = data.find(m => m.metricName === 'Traffic')?.information || []
const engagement = data.find(m => m.metricName === 'EngagementTime')?.information || []
const scroll = data.find(m => m.metricName === 'ScrollDepth')?.information || []
const dead = data.find(m => m.metricName === 'DeadClickCount')?.information || []
const rage = data.find(m => m.metricName === 'RageClickCount')?.information || []
const script = data.find(m => m.metricName === 'ScriptErrorCount')?.information || []
const quickback = data.find(m => m.metricName === 'QuickbackClick')?.information || []

const adRows = traffic.filter(r => r.Url && r.Url.includes('/l/oferta-masajes'))

console.log('=== TODAS LAS FILAS DE LANDING DE ANUNCIOS (con o sin gclid) ===')
console.log('Total filas:', adRows.length)
console.log('')

let withGclid = 0, withoutGclid = 0
for (const t of adRows) {
  const hasGclid = t.Url.includes('gclid=')
  if (hasGclid) withGclid++; else withoutGclid++
}
console.log('Con gclid real:', withGclid, '| Sin gclid (solo utm/adgroup o directo):', withoutGclid)
console.log('')

for (const t of adRows) {
  const adgroup = (t.Url.match(/adgroup=([^&]+)/) || [])[1] || '?'
  const lang = t.Url.includes('/en/') ? 'EN' : 'ES'
  const hasGclid = t.Url.includes('gclid=') ? 'SI' : 'no'
  const eng = engagement.find(e => e.Url === t.Url && e.Device === t.Device)
  const scr = scroll.find(s => s.Url === t.Url && s.Device === t.Device)
  const dc = dead.find(d => d.Url === t.Url && d.Device === t.Device)
  const rc = rage.find(r => r.Url === t.Url && r.Device === t.Device)
  const se = script.find(s => s.Url === t.Url && s.Device === t.Device)
  const qb = quickback.find(q => q.Url === t.Url && q.Device === t.Device)
  console.log(`${lang}·${adgroup}·${t.Device}·gclid:${hasGclid} | ses:${t.totalSessionCount} | activo:${eng?.activeTime ?? '?'}s | scroll:${scr?.averageScrollDepth ?? '?'}% | dead:${dc?.sessionsWithMetricPercentage ?? 0}% rage:${rc?.sessionsWithMetricPercentage ?? 0}% err:${se?.sessionsWithMetricPercentage ?? 0}% quickback:${qb?.sessionsWithMetricPercentage ?? 0}%`)
}
