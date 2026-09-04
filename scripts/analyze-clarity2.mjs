import { readFileSync } from 'fs'
const data = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\clarity_fresh.json', 'utf8'))

const traffic = data.find(m => m.metricName === 'Traffic')?.information || []
const engagement = data.find(m => m.metricName === 'EngagementTime')?.information || []
const scroll = data.find(m => m.metricName === 'ScrollDepth')?.information || []
const dead = data.find(m => m.metricName === 'DeadClickCount')?.information || []

const adRows = traffic.filter(r => r.Url && r.Url.includes('gclid=') && r.Url.includes('/l/oferta-masajes'))

let totalScroll = 0, totalActive = 0, deadCount = 0, zeroEngage = 0
const byAdgroup = {}

for (const t of adRows) {
  const adgroup = (t.Url.match(/adgroup=([^&]+)/) || [])[1] || '?'
  const lang = t.Url.includes('/en/') ? 'EN' : 'ES'
  const key = `${lang}-${adgroup}`
  const eng = engagement.find(e => e.Url === t.Url && e.Device === t.Device)
  const scr = scroll.find(s => s.Url === t.Url && s.Device === t.Device)
  const dc = dead.find(d => d.Url === t.Url && d.Device === t.Device)

  totalScroll += scr?.averageScrollDepth ?? 0
  totalActive += eng?.activeTime ?? 0
  if ((eng?.activeTime ?? 0) === 0) zeroEngage++
  if ((dc?.sessionsWithMetricPercentage ?? 0) === 100) {
    deadCount++
    byAdgroup[key] = (byAdgroup[key] || 0) + 1
  }
}

console.log('Sesiones reales de anuncios:', adRows.length)
console.log('Scroll promedio:', (totalScroll / adRows.length).toFixed(1) + '%')
console.log('Tiempo activo promedio:', (totalActive / adRows.length).toFixed(1) + 's')
console.log('Sesiones con dead click:', deadCount, '(' + (100 * deadCount / adRows.length).toFixed(1) + '%)')
console.log('Sesiones con CERO interacción activa:', zeroEngage, '(' + (100 * zeroEngage / adRows.length).toFixed(1) + '%)')
console.log('')
console.log('Dead clicks por ad group:', byAdgroup)
