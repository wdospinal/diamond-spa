import { readFileSync } from 'fs'
const data = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\clarity_diag.json', 'utf8'))

const traffic = data.find(m => m.metricName === 'Traffic')?.information || []
const engagement = data.find(m => m.metricName === 'EngagementTime')?.information || []
const scroll = data.find(m => m.metricName === 'ScrollDepth')?.information || []
const dead = data.find(m => m.metricName === 'DeadClickCount')?.information || []
const rage = data.find(m => m.metricName === 'RageClickCount')?.information || []
const quickback = data.find(m => m.metricName === 'QuickbackClick')?.information || []

const adRows = traffic.filter(r => r.Url && r.Url.includes('/l/oferta-masajes') && r.totalSessionCount > 0)

let deadCount = 0, rageCount = 0, qbCount = 0, deepEngage = 0, shallow = 0
const byAdgroupDead = {}

for (const t of adRows) {
  const adgroup = (t.Url.match(/adgroup=([^&]+)/) || [])[1] || '?'
  const lang = t.Url.includes('/en/') ? 'EN' : 'ES'
  const key = `${lang}-${adgroup}`
  const eng = engagement.find(e => e.Url === t.Url && e.Device === t.Device)
  const scr = scroll.find(s => s.Url === t.Url && s.Device === t.Device)
  const dc = dead.find(d => d.Url === t.Url && d.Device === t.Device)
  const rc = rage.find(r => r.Url === t.Url && r.Device === t.Device)
  const qb = quickback.find(q => q.Url === t.Url && q.Device === t.Device)

  const isDead = (dc?.sessionsWithMetricPercentage ?? 0) === 100
  const isRage = (rc?.sessionsWithMetricPercentage ?? 0) === 100
  const isQb = (qb?.sessionsWithMetricPercentage ?? 0) === 100
  if (isDead) { deadCount++; byAdgroupDead[key] = (byAdgroupDead[key] || 0) + 1 }
  if (isRage) rageCount++
  if (isQb) qbCount++

  const activeT = eng?.activeTime ?? 0
  const scrollD = scr?.averageScrollDepth ?? 0
  if (activeT >= 20 && scrollD >= 30) deepEngage++
  else shallow++
}

console.log('Total sesiones reales (con actividad):', adRows.length)
console.log('Dead click:', deadCount, '(' + (100*deadCount/adRows.length).toFixed(1) + '%)')
console.log('Rage click:', rageCount, '(' + (100*rageCount/adRows.length).toFixed(1) + '%)')
console.log('Quickback:', qbCount, '(' + (100*qbCount/adRows.length).toFixed(1) + '%)')
console.log('Engagement profundo (>=20s activos Y >=30% scroll):', deepEngage, '(' + (100*deepEngage/adRows.length).toFixed(1) + '%)')
console.log('Engagement superficial:', shallow, '(' + (100*shallow/adRows.length).toFixed(1) + '%)')
console.log('')
console.log('Dead clicks por ad group:', byAdgroupDead)
