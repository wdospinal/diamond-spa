import { readFileSync } from 'fs'
const rows = JSON.parse(readFileSync('C:\\Users\\kpeee\\Documents\\diamond-spa\\scripts\\_dup_check.json', 'utf8'))

const byPhone = {}
for (const r of rows) {
  const p = (r.phone || '').trim()
  if (!p) continue
  if (!byPhone[p]) byPhone[p] = []
  byPhone[p].push(r)
}

console.log('=== Telefonos con mas de 1 registro ===\n')
let found = 0
for (const [phone, list] of Object.entries(byPhone)) {
  if (list.length < 2) continue
  found++
  console.log(`Teléfono ${phone} — ${list.length} registros:`)
  list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  for (const r of list) {
    const t = new Date(r.created_at)
    console.log(`  [${r.id.slice(0,8)}] ${t.toISOString()} | ${r.name || '(sin nombre)'} | ${r.service_name} | source:${r.source} | gclid:${r.gclid ? 'sí' : 'no'} | status:${r.status}`)
  }
  console.log('')
}
if (found === 0) console.log('Ningún teléfono aparece más de una vez en los últimos 200 registros.')
