#!/usr/bin/env node
/**
 * Barrido histórico de los cierres de venta de Bold.
 *
 * Recorre el buzón MES A MES, de atrás hacia adelante, llamando a
 * /api/bold/sync con una ventana `since`/`before` por cada mes. Ir por ventanas
 * no es una comodidad: el servidor devuelve como mucho `limit` correos y son
 * siempre los más recientes del rango, así que sin techo los meses viejos no
 * entrarían nunca.
 *
 * Uso:
 *   node scripts/bold-backfill.mjs --from 2025-01 --to 2026-08
 *   node scripts/bold-backfill.mjs --from 2025-01                 # hasta el mes actual
 *   node scripts/bold-backfill.mjs --from 2025-01 --dry           # sin escribir nada
 *
 * El secreto se lee de la variable CRON_SECRET (del entorno o de .env.local),
 * nunca de un argumento: así no queda en el historial del shell.
 * La URL base se puede cambiar con BOLD_SYNC_URL.
 */

import { readFileSync } from 'fs'

const DEFAULT_BASE = 'https://diamondspa.com.co'
const MONTH_RE = /^\d{4}-\d{2}$/

function loadEnvLocal() {
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // Sin .env.local se usa lo que haya en el entorno.
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}

/** 'YYYY-MM' + delta → 'YYYY-MM'. */
function shiftMonth(month, delta) {
  const total = Number(month.slice(0, 4)) * 12 + (Number(month.slice(5, 7)) - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

function currentMonthBogota() {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit' })
    .format(new Date())
    .slice(0, 7)
}

async function main() {
  loadEnvLocal()

  const from = arg('from')
  const to = arg('to') ?? currentMonthBogota()
  const dry = process.argv.includes('--dry')
  const limit = Number(arg('limit') ?? 200)
  const base = (process.env.BOLD_SYNC_URL ?? DEFAULT_BASE).replace(/\/+$/, '')
  const secret = process.env.CRON_SECRET

  if (!from || !MONTH_RE.test(from) || !MONTH_RE.test(to)) {
    console.error('Uso: node scripts/bold-backfill.mjs --from YYYY-MM [--to YYYY-MM] [--limit N] [--dry]')
    process.exit(1)
  }
  if (!secret) {
    console.error('Falta CRON_SECRET (ponlo en .env.local o en el entorno). Sin él la ruta responde 401.')
    process.exit(1)
  }
  if (from > to) {
    console.error(`El mes inicial (${from}) es posterior al final (${to}).`)
    process.exit(1)
  }

  console.log(`Barrido de ${from} a ${to}${dry ? ' (en seco, no escribe nada)' : ''} contra ${base}\n`)

  let totalInserted = 0
  let totalSkipped = 0
  let totalIgnored = 0
  const warnings = []

  for (let month = from; month <= to; month = shiftMonth(month, 1)) {
    const params = new URLSearchParams({
      since: `${month}-01`,
      before: `${shiftMonth(month, 1)}-01`,
      limit: String(limit),
    })
    if (dry) params.set('dry', '1')

    // Aviso antes de llamar: cada ventana puede tardar, y un script mudo
    // durante un minuto parece colgado.
    process.stdout.write(`${month}  ·  leyendo…`)

    let body
    try {
      const res = await fetch(`${base}/api/bold/sync?${params}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
        // Un poco más que el maxDuration de la función: si se agota, el
        // problema está del otro lado y conviene decirlo, no esperar sin fin.
        signal: AbortSignal.timeout(75_000),
      })
      process.stdout.write('\r')
      body = await res.json()
      if (!res.ok) {
        console.log(`${month}  ✗  ${res.status} ${body.error ?? ''}`.trimEnd())
        warnings.push(`${month}: ${res.status} ${body.error ?? ''}`)
        continue
      }
    } catch (e) {
      process.stdout.write('\r')
      const reason =
        e.name === 'TimeoutError'
          ? 'la petición pasó de 75 s — la ventana es demasiado grande para la función, o el despliegue aún no acepta `before`'
          : e.message
      console.log(`${month}  ✗  ${reason}`)
      warnings.push(`${month}: ${reason}`)
      continue
    }

    totalInserted += body.inserted ?? 0
    totalSkipped += body.skipped ?? 0
    totalIgnored += body.ignoredCount ?? 0

    const bits = [
      `correos ${String(body.scanned ?? 0).padStart(3)}`,
      `cierres ${String(body.parsed ?? 0).padStart(2)}`,
      `nuevos ${String(body.inserted ?? 0).padStart(2)}`,
    ]
    if (body.skipped) bits.push(`ya estaban ${body.skipped}`)
    if (body.ignoredCount) bits.push(`otros ${body.ignoredCount}`)
    console.log(`${month}  ·  ${bits.join('  ·  ')}`)

    if (body.truncated) {
      const msg = `${month}: la ventana se quedó corta (${body.matched} correos, se bajaron ${body.scanned}). Sube --limit y repite ese mes.`
      warnings.push(msg)
      console.log(`         ⚠ ${msg}`)
    }
    for (const err of body.errors ?? []) {
      warnings.push(`${month}: ${err}`)
      console.log(`         ⚠ ${err}`)
    }
  }

  console.log(`\nTotal · cierres nuevos: ${totalInserted} · ya registrados: ${totalSkipped} · otros correos de Bold: ${totalIgnored}`)

  if (warnings.length > 0) {
    console.log(`\nRevisar (${warnings.length}):`)
    for (const w of warnings) console.log(`  - ${w}`)
  }

  if (!dry && totalInserted > 0) {
    console.log('\nYa puedes ver el resultado en https://app.diamondspa.com.co/bold')
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
