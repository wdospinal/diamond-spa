import { readFileSync } from 'fs'
const data = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\clarity_fresh.json', 'utf8'))

const traffic = data.find(m => m.metricName === 'Traffic')?.information || []
const engagement = data.find(m => m.metricName === 'EngagementTime')?.information || []
const scroll = data.find(m => m.metricName === 'ScrollDepth')?.information || []
const dead = data.find(m => m.metricName === 'DeadClickCount')?.information || []
const rage = data.find(m => m.metricName === 'RageClickCount')?.information || []

const adRows = traffic.filter(r => r.Url && r.Url.includes('gclid=') && r.Url.includes('/l/oferta-masajes'))

console.log('=== SESIONES REALES DE ANUNCIOS (con gclid) ===')
console.log('Total filas de tráfico de anuncios:', adRows.length)
console.log('')

for (const t of adRows) {
  const adgroup = (t.Url.match(/adgroup=([^&]+)/) || [])[1] || '?'
  const lang = t.Url.includes('/en/') ? 'EN' : 'ES'
  const eng = engagement.find(e => e.Url === t.Url && e.Device === t.Device)
  const scr = scroll.find(s => s.Url === t.Url && s.Device === t.Device)
  const dc = dead.find(d => d.Url === t.Url && d.Device === t.Device)
  const rc = rage.find(r => r.Url === t.Url && r.Device === t.Device)
  console.log(`${lang} · ${adgroup} · ${t.Device} | sesiones:${t.totalSessionCount} usuarios:${t.distinctUserCount} pag/sesion:${t.pagesPerSessionPercentage} | activo:${eng?.activeTime ?? '?'}s total:${eng?.totalTime ?? '?'}s | scroll:${scr?.averageScrollDepth ?? '?'}% | deadclick:${dc?.sessionsWithMetricPercentage ?? 0}% ragclick:${rc?.sessionsWithMetricPercentage ?? 0}%`)
}

const totalAdSessions = adRows.reduce((s, r) => s + r.totalSessionCount, 0)
console.log('')
console.log('TOTAL sesiones reales de anuncios en la ventana de 3 dias:', totalAdSessions)
