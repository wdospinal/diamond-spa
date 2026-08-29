/**
 * Simula entregas del webhook de WhatsApp contra el servidor local.
 *
 * Sirve para probar todo el camino (firma → lista blanca → parser → store)
 * sin depender de Meta ni de un túnel público. Firma cada payload con
 * WHATSAPP_APP_SECRET igual que lo hace Meta.
 *
 *   node scripts/whatsapp-webhook-test.mjs
 *   node scripts/whatsapp-webhook-test.mjs http://localhost:3000
 *
 * Con WHATSAPP_TOKEN sin configurar, el bot no puede contestar por WhatsApp
 * (queda un log de error) pero los movimientos se guardan igual — que es
 * justamente lo que interesa verificar acá.
 */

import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:3000'
const URL_ = `${BASE}/api/whatsapp/webhook`

// Lee .env.local sin dependencias: solo hacen falta dos variables.
function env(name) {
  if (process.env[name]) return process.env[name]
  try {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find(l => l.startsWith(`${name}=`))
    return line ? line.slice(name.length + 1).trim() : ''
  } catch {
    return ''
  }
}

const SECRET = env('WHATSAPP_APP_SECRET')
const SENDER = (env('WHATSAPP_ALLOWED_SENDERS').split(',')[0] || '573054541635').replace(/\D/g, '')

if (!SECRET) {
  console.error('Falta WHATSAPP_APP_SECRET en .env.local — el webhook responde 503 sin él.')
  process.exit(1)
}

let seq = Date.now()
const wamid = () => `wamid.TEST${seq++}`

function payload(msg) {
  return {
    object: 'whatsapp_business_account',
    entry: [{ id: '0', changes: [{ field: 'messages', value: { messages: [msg] } }] }],
  }
}

function text(body, { from = SENDER, id = wamid(), contextId = null, at = Date.now() } = {}) {
  return payload({
    id,
    from,
    timestamp: String(Math.floor(at / 1000)),
    type: 'text',
    text: { body },
    ...(contextId ? { context: { id: contextId } } : {}),
  })
}

function image(caption, { from = SENDER, id = wamid(), at = Date.now() } = {}) {
  return payload({
    id,
    from,
    timestamp: String(Math.floor(at / 1000)),
    type: 'image',
    image: { id: '1234567890', ...(caption ? { caption } : {}) },
  })
}

async function post(body, { badSignature = false } = {}) {
  const raw = JSON.stringify(body)
  const sig = createHmac('sha256', badSignature ? 'clave-equivocada' : SECRET).update(raw).digest('hex')
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': `sha256=${sig}` },
    body: raw,
  })
  return res.status
}

function check(label, actual, expected) {
  const ok = actual === expected
  console.log(`${ok ? '✓' : '✗'} ${label} → ${actual}${ok ? '' : ` (esperado ${expected})`}`)
  return ok
}

const results = []

console.log(`Probando ${URL_}\nRemitente autorizado: ${SENDER}\n`)

// Verificación del webhook (handshake de alta).
{
  const token = env('WHATSAPP_VERIFY_TOKEN')
  const url = `${URL_}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token)}&hub.challenge=1234`
  const res = await fetch(url)
  results.push(check('GET handshake con token correcto', await res.text(), '1234'))
  const bad = await fetch(`${URL_}?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1234`)
  results.push(check('GET handshake con token incorrecto', bad.status, 403))
}

results.push(check('firma inválida se rechaza', await post(text('Relajante 90min'), { badSignature: true }), 401))
results.push(check('remitente no autorizado se ignora', await post(text('Relajante 90min', { from: '573001112233' })), 200))

// Movimientos.
results.push(check('ingreso con monto', await post(text('220.000 masaje sensitivo 1 hora Ana')), 200))
results.push(check('egreso', await post(text('Arriendo del spa')), 200))
results.push(check('comisión (egreso, no ingreso)', await post(text('Pago 20% masaje relajante Angelica')), 200))

// Idempotencia: la misma entrega dos veces.
{
  const id = wamid()
  const dup = text('Relajante 30 minutos Sary 120.000', { id })
  await post(dup)
  results.push(check('entrega repetida (mismo wamid)', await post(dup), 200))
}

// Foto sin descripción + el texto un segundo después.
{
  const now = Date.now()
  await post(image(null, { at: now }))
  results.push(check('foto suelta y luego su texto', await post(text('Relajante 90min', { at: now + 3000 })), 200))
}

// Consulta.
results.push(check('consulta «hoy»', await post(text('hoy')), 200))

console.log(`\n${results.filter(Boolean).length}/${results.length} verificaciones OK`)
console.log('Revisa data/ledger-entries.json (o /admin/caja) para ver los movimientos.')
process.exit(results.every(Boolean) ? 0 : 1)
