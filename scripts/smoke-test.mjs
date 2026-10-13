/**
 * Smoke test del sitio construido: arranca `next start` (o usa SMOKE_URL) y
 * recorre cada URL del sitemap más las rutas del panel y de la API.
 *
 * Las pruebas de src/lib ejercitan la lógica; esto comprueba lo que solo se ve
 * con la app de verdad: que cada página renderiza (200, título, h1, canonical,
 * hreflang, JSON-LD válido), que los componentes compartidos están (menú, pie,
 * WhatsApp, botón de reservar) y que el panel y la API siguen cerrados.
 *
 *   yarn build && yarn test:smoke
 *   SMOKE_URL=https://<preview>.vercel.app yarn test:smoke
 */

import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
let base = process.env.SMOKE_URL?.replace(/\/$/, '')
let server

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer().listen(0, () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    }).on('error', reject)
  })
}

before(async () => {
  if (base) return
  assert.ok(existsSync(join(root, '.next', 'BUILD_ID')), 'run `yarn build` first (or set SMOKE_URL)')
  const port = await freePort()
  base = `http://localhost:${port}`
  server = spawn(join(root, 'node_modules', '.bin', 'next'), ['start', '-p', String(port)], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Sin backends: el sitio público tiene que renderizar igual con el respaldo JSON.
    env: { ...process.env, NODE_ENV: 'production' },
  })
  let log = ''
  server.stdout.on('data', d => { log += d })
  server.stderr.on('data', d => { log += d })
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`${base}/robots.txt`)
      return
    } catch {
      if (server.exitCode !== null) throw new Error(`next start exited:\n${log}`)
      await new Promise(r => setTimeout(r, 200))
    }
  }
  throw new Error(`next start did not come up:\n${log}`)
})

after(() => server?.kill())

const get = (path, init) => fetch(`${base}${path}`, { redirect: 'manual', ...init })

/** Lista de URLs del sitemap, con el host cambiado por el del servidor bajo prueba. */
async function sitemapPaths() {
  const xml = await (await get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname)
}

/** Corre `fn` sobre `items` con como mucho `n` a la vez. */
async function pool(items, n, fn) {
  const out = []
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx])
    }
  }))
  return out
}

const attr = (html, re) => html.match(re)?.[1]

/** Texto visible aproximado: sin scripts, estilos ni etiquetas. */
const visibleText = html =>
  html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')

function checkPage(path, html) {
  const problems = []
  const locale = path.split('/')[1]

  if (attr(html, /<html[^>]*\blang="([^"]+)"/) !== locale) problems.push(`<html lang> is not "${locale}"`)

  const title = attr(html, /<title>([^<]*)<\/title>/)
  if (!title?.trim()) problems.push('missing <title>')
  else if (title.length > 120) problems.push(`title is ${title.length} chars`)

  const desc = attr(html, /<meta name="description" content="([^"]*)"/)
  if (!desc?.trim()) problems.push('missing meta description')

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0
  if (h1s !== 1) problems.push(`${h1s} <h1> elements`)

  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/)
  if (!canonical) problems.push('missing canonical')
  else if (new URL(canonical).pathname !== path) problems.push(`canonical points to ${canonical}`)

  // Las páginas de un solo idioma (un post solo en español, /en/massage-medellin)
  // no llevan alternates; las que sí, tienen que incluirse a sí mismas.
  const hreflangs = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi)]
  if (hreflangs.length && !hreflangs.some(([, l, href]) => l === locale && new URL(href).pathname === path)) {
    problems.push(`hreflang alternates do not include ${locale} → ${path}`)
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(json)
      if (!JSON.stringify(data).includes('"@context"')) problems.push('JSON-LD without @context')
    } catch (e) {
      problems.push(`invalid JSON-LD: ${e.message}`)
    }
  }

  const text = visibleText(html)
  for (const bad of ['undefined', 'NaN', '[object Object]', 'null COP']) {
    if (new RegExp(`(^|[\\s>])${bad.replace(/[[\]]/g, '\\$&')}([\\s<]|$)`).test(text)) problems.push(`visible "${bad}"`)
  }

  // Componentes compartidos del layout.
  if (!/<nav[\s>]/.test(html)) problems.push('no <nav> (Navigation)')
  if (!/<footer[\s>]/.test(html)) problems.push('no <footer> (Footer)')

  return problems
}

// ─── Páginas públicas ────────────────────────────────────────────────────────

test('every sitemap URL renders a complete, indexable page', async () => {
  const paths = await sitemapPaths()
  assert.ok(paths.length > 50, `sitemap only has ${paths.length} URLs`)

  const failures = (await pool(paths, 8, async path => {
    const res = await get(path)
    if (res.status !== 200) return `${path}: HTTP ${res.status}`
    const robots = res.headers.get('x-robots-tag')
    if (robots?.includes('noindex')) return `${path}: x-robots-tag ${robots}`
    const html = await res.text()
    if (/<meta name="robots" content="[^"]*noindex/.test(html)) return `${path}: meta noindex`
    const problems = checkPage(path, html)
    return problems.length ? `${path}: ${problems.join('; ')}` : null
  })).filter(Boolean)

  assert.deepEqual(failures, [])
})

test('home pages show the booking and WhatsApp calls to action', async () => {
  for (const locale of ['es', 'en']) {
    const html = await (await get(`/${locale}`)).text()
    assert.ok(html.includes(`href="/${locale}/book`), `${locale}: no link to /${locale}/book`)
    // WhatsApp abre un modal (WhatsAppBridgeModal) desde un botón, no un enlace wa.me.
    assert.ok(/<button[^>]*aria-label="[^"]*WhatsApp[^"]*"/i.test(html), `${locale}: no WhatsApp button`)
    assert.ok(html.includes('"@type":"DaySpa"') || html.includes('"@type":"LocalBusiness"') || html.includes('"@type":"HealthAndBeautyBusiness"'),
      `${locale}: no business JSON-LD`)
  }
})

test('the booking page renders the wizard and stays out of the index', async () => {
  for (const [locale, heading] of [['es', '¿Qué servicio deseas?'], ['en', 'What service do you want?']]) {
    const res = await get(`/${locale}/book`)
    assert.equal(res.status, 200, locale)
    const html = await res.text()
    assert.ok(html.includes(heading), `${locale}: wizard step 1 ("${heading}") did not render`)
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/, `${locale}: /book must be noindex`)
  }
})

test('service detail pages list a price in pesos', async () => {
  const paths = (await sitemapPaths()).filter(p => /^\/(es|en)\/services\/[^/]+$/.test(p))
  assert.ok(paths.length >= 10, `only ${paths.length} service pages in the sitemap`)
  const missing = (await pool(paths, 8, async p => (/\$\s?[\d.]{5,}/.test(visibleText(await (await get(p)).text())) ? null : p))).filter(Boolean)
  assert.deepEqual(missing, [], 'no COP price visible')
})

test('unknown pages are a real 404, not a soft 200', async () => {
  for (const path of ['/es/no-existe-esta-pagina', '/en/services/no-such-service', '/es/blog/no-such-post']) {
    assert.equal((await get(path)).status, 404, path)
  }
})

test('the bare root redirects permanently to Spanish', async () => {
  const root = await get('/')
  assert.ok([301, 308].includes(root.status), `/ → ${root.status}`)
  assert.equal(new URL(root.headers.get('location'), base).pathname, '/es')
})

// ─── Archivos de soporte ─────────────────────────────────────────────────────

test('robots, sitemap, manifest, icon font and OG image are served', async () => {
  const robots = await (await get('/robots.txt')).text()
  assert.match(robots, /Sitemap: https:\/\/diamondspa\.com\.co\/sitemap\.xml/)
  assert.doesNotMatch(robots, /Disallow: \/_next/)

  const manifest = await get('/manifest.webmanifest')
  assert.equal(manifest.status, 200)
  assert.ok((await manifest.json()).name)

  const css = await (await get('/es')).text()
  const fontVersion = css.match(/material-symbols-outlined\.woff2\?v=(\d+)/)
  const font = await get(`/fonts/material-symbols-outlined.woff2${fontVersion ? `?v=${fontVersion[1]}` : ''}`)
  assert.equal(font.status, 200)

  assert.equal((await get('/og-image.jpg')).status, 200)
})

// ─── Panel y API ─────────────────────────────────────────────────────────────

test('admin pages send anonymous visitors to the login page', async () => {
  for (const path of ['/admin', '/admin/bookings', '/admin/caja']) {
    const res = await get(path)
    assert.ok([302, 303, 307, 308].includes(res.status), `${path} → ${res.status}`)
    assert.match(res.headers.get('location'), /\/admin\/login/, path)
  }
  const login = await get('/admin/login')
  assert.equal(login.status, 200)
  assert.equal(login.headers.get('x-robots-tag')?.includes('noindex') || /noindex/.test(await login.text()), true,
    'the login page must not be indexed')
})

test('admin APIs refuse requests without a session', async () => {
  const forged = { cookie: 'admin_session=eyJleHAiOjk5OTk5OTk5OTk5OTksInUiOiJ4In0.forged' }
  for (const [method, path] of [
    ['GET', '/api/bookings'],
    ['GET', '/api/ledger'],
    ['GET', '/api/bold'],
    ['GET', '/api/funnel'],
    ['POST', '/api/admin/bookings'],
    ['POST', '/api/admin/users'],
    ['POST', '/api/landings'],
    ['POST', '/api/blog'],
  ]) {
    const body = method === 'POST' ? '{}' : undefined
    const headers = { 'content-type': 'application/json' }
    assert.equal((await get(path, { method, body, headers })).status, 401, `${method} ${path}`)
    assert.equal((await get(path, { method, body, headers: { ...headers, ...forged } })).status, 401, `${method} ${path} with a forged cookie`)
  }
})

test('the public booking API validates input', async () => {
  const res = await get('/api/bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.77' },
    body: JSON.stringify({ serviceId: 'does-not-exist', name: 'Smoke', phone: '1' }),
  })
  assert.equal(res.status, 400)
  assert.deepEqual(await res.json(), { error: 'Invalid service' })
})

test('responses do not advertise the framework', async () => {
  // poweredByHeader: false en next.config.mjs.
  assert.equal((await get('/es')).headers.get('x-powered-by'), null)
})
