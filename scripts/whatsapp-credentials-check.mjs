/**
 * Comprueba que WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID sirven para contestar.
 *
 * El webhook guarda el movimiento aunque Meta rechace el envío, así que un
 * token malo se ve en /admin/caja como «todo bien» y en WhatsApp como silencio.
 * Este script hace las dos llamadas que el bot necesita y dice cuál falla.
 *
 *   node scripts/whatsapp-credentials-check.mjs
 *   WHATSAPP_TOKEN=EAA… WHATSAPP_PHONE_NUMBER_ID=123… node scripts/whatsapp-credentials-check.mjs
 *
 * Las credenciales de producción están marcadas «Sensitive» en Vercel y no se
 * pueden volver a leer: hay que pegarlas desde la consola de Meta.
 */

import { readFileSync } from 'node:fs'

const GRAPH = 'https://graph.facebook.com/v21.0'

function env(name) {
  if (process.env[name]) return process.env[name].trim()
  try {
    const line = readFileSync('.env.local', 'utf8')
      .split('\n')
      .find(l => l.startsWith(`${name}=`))
    return line ? line.slice(name.length + 1).trim() : ''
  } catch {
    return ''
  }
}

const TOKEN = env('WHATSAPP_TOKEN')
const PHONE_ID = env('WHATSAPP_PHONE_NUMBER_ID')

if (!TOKEN || !PHONE_ID) {
  console.error('Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID.')
  process.exit(1)
}

async function get(path) {
  const res = await fetch(`${GRAPH}/${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  return { ok: res.ok, status: res.status, body: await res.json() }
}

// 1. ¿El token vale? Un 190 aquí es token vencido (el temporal de 24 h).
const me = await get('me?fields=id,name')
if (!me.ok) {
  console.error('✗ El token no sirve:', JSON.stringify(me.body.error))
  console.error(
    '  → Meta → tu app → WhatsApp → API Setup. El token temporal dura 24 h;\n' +
      '    para producción hace falta el permanente de un System User con\n' +
      '    permiso whatsapp_business_messaging sobre la WABA.',
  )
  process.exit(1)
}
console.log(`✓ Token válido (${me.body.name ?? me.body.id})`)

// 2. ¿Ese token puede usar ESE número? Es el paso que está fallando en producción:
//    code 100 «Authorization Error» al postear a {phone_number_id}/messages.
const phone = await get(`${PHONE_ID}?fields=id,display_phone_number,verified_name,quality_rating`)
if (!phone.ok) {
  console.error('✗ El token no tiene acceso a ese número:', JSON.stringify(phone.body.error))
  console.error(
    '  → Revisa que WHATSAPP_PHONE_NUMBER_ID sea el «Phone number ID» de la\n' +
      '    consola (no el número, ni el WhatsApp Business Account ID), y que el\n' +
      '    System User del token tenga asignada esa WABA en Business Settings.',
  )
  process.exit(1)
}
console.log(
  `✓ Número accesible: ${phone.body.display_phone_number} ` +
    `(${phone.body.verified_name}, calidad ${phone.body.quality_rating ?? 'n/d'})`,
)
console.log('\nLas credenciales sirven: el bot puede contestar.')
