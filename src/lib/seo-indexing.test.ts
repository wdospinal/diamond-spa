/**
 * Guards against the causes of Search Console's "not indexed" buckets
 * (Sept 2026 audit): sitemap URLs that redirect, internal links that go
 * through a 308, redirect chains, hreflang pointing at 404s, noindex pages in
 * the sitemap, and crawl rules that would block rendering.
 *
 * These run against the real sitemap(), robots() and next.config.mjs — not
 * copies — so a regression in any of them fails here before Google sees it.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { test } from 'node:test'

// The blog store falls back Supabase → KV → JSON file. Force the file and point
// it at a fixture, so the sitemap's blog section is deterministic and offline.
for (const key of [
  'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN',
]) delete process.env[key]
process.env.POSTS_FILE = join(import.meta.dirname, '__fixtures__', 'seo-posts.json')

const ROOT = join(import.meta.dirname, '..', '..')
const LANG_DIR = join(ROOT, 'src', 'app', '[lang]')
const LOCALES = ['es', 'en'] as const

const { default: sitemap } = await import('@/app/sitemap')
const { default: robots } = await import('@/app/robots')
const { default: nextConfig } = await import('../../next.config.mjs')
const { BASE_URL, X_DEFAULT_LOCALE } = await import('@/lib/seo')
const { SERVICES, getServiceBySlug } = await import('@/lib/services')
const { getMasajeTypeBySlug } = await import('@/lib/masajes-category')
const { serviceHref, getLocalizedPath, canonicalizeServiceLinks } = await import('@/lib/routes')
const { readPublishedPosts, slugForLocale } = await import('@/lib/blog-store')

type Redirect = { source: string; destination: string; permanent?: boolean; has?: unknown[] }

const entries = await sitemap()
const sitemapUrls = entries.map(e => e.url)
const sitemapSet = new Set(sitemapUrls)
const redirects: Redirect[] = await nextConfig.redirects!()
const pathRedirects = redirects.filter(r => !r.has)
const posts = await readPublishedPosts()

/** Compiles a Next.js redirect `source` (":name", ":name(a|b)", ":name*") to a RegExp. */
function compileSource(source: string): RegExp {
  let pattern = ''
  for (const m of source.matchAll(/:(\w+)(\([^)]*\))?(\*)?|[^:]+/g)) {
    if (m[0].startsWith(':')) pattern += m[3] ? '(.*)' : (m[2] ?? '([^/]+)')
    else pattern += m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${pattern}$`)
}
const compiled = pathRedirects.map(r => ({ rule: r, re: compileSource(r.source) }))

/** The redirect rule a path would hit, if any (query string ignored, as Next does). */
function redirectFor(path: string): Redirect | undefined {
  const bare = path.split('?')[0]
  return compiled.find(({ re }) => re.test(bare))?.rule
}

const pathOf = (url: string) => new URL(url).pathname

// ─── Sitemap ─────────────────────────────────────────────────────────────────

test('sitemap: every URL is on the canonical https, non-www host', () => {
  assert.equal(BASE_URL, 'https://diamondspa.com.co')
  for (const url of sitemapUrls) assert.ok(url.startsWith(`${BASE_URL}/`), url)
})

test('sitemap: no URL is listed twice', () => {
  const dupes = sitemapUrls.filter((u, i) => sitemapUrls.indexOf(u) !== i)
  assert.deepEqual(dupes, [])
})

test('sitemap: no URL redirects ("Page with redirect")', () => {
  const redirecting = sitemapUrls
    .map(u => ({ url: u, rule: redirectFor(pathOf(u)) }))
    .filter(x => x.rule)
    .map(x => `${x.url} -> ${x.rule!.destination}`)
  assert.deepEqual(redirecting, [])
})

test('sitemap: every URL maps to a page that exists ("Not found (404)")', () => {
  const missing: string[] = []
  for (const url of sitemapUrls) {
    const [, lang, ...rest] = pathOf(url).split('/') as [string, 'es' | 'en', ...string[]]
    const [section, slug] = rest
    let ok: boolean
    if (rest.length === 0) ok = existsSync(join(LANG_DIR, 'page.tsx'))
    else if (section === 'services' && slug) ok = !!getServiceBySlug(slug, lang)
    else if (section === 'masajes' && slug) ok = !!getMasajeTypeBySlug(slug, lang)
    else if (section === 'blog' && slug) {
      ok = posts.some(p => p.locales.includes(lang) && slugForLocale(p, lang) === slug)
    } else ok = existsSync(join(LANG_DIR, ...rest, 'page.tsx'))
    if (!ok) missing.push(url)
  }
  assert.deepEqual(missing, [])
})

/** Route prefixes (e.g. "/privacy") of every page that declares robots index:false. */
function noindexRoutes(dir = LANG_DIR): string[] {
  const found: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) found.push(...noindexRoutes(full))
    else if (/^(page|layout)\.tsx$/.test(name) && /index:\s*false/.test(readFileSync(full, 'utf8'))) {
      const route = relative(LANG_DIR, dir).split(sep).filter(Boolean)
      // A dynamic segment ([slug]) means everything under the static prefix.
      const staticPart = route.slice(0, route.findIndex(s => s.startsWith('[')) >>> 0)
      found.push('/' + staticPart.join('/'))
    }
  }
  return found
}

test('sitemap: pages marked noindex are not listed', () => {
  const routes = noindexRoutes()
  assert.ok(routes.includes('/privacy') && routes.includes('/book'), `detected: ${routes}`)
  const listed = sitemapUrls.filter(u => {
    const rest = pathOf(u).replace(/^\/(es|en)/, '')
    return routes.some(r => rest === r || rest.startsWith(`${r}/`))
  })
  assert.deepEqual(listed, [])
})

test('sitemap: hreflang alternates are self-referencing, reciprocal and listed', () => {
  const byUrl = new Map(entries.map(e => [e.url, e]))
  const problems: string[] = []
  for (const e of entries) {
    const langs = e.alternates?.languages as Record<string, string> | undefined
    if (!langs) continue
    if (!Object.values(langs).includes(e.url)) problems.push(`${e.url}: does not list itself`)
    for (const [lang, alt] of Object.entries(langs)) {
      if (!sitemapSet.has(alt)) { problems.push(`${e.url}: ${lang} -> ${alt} not in sitemap`); continue }
      if (lang === 'x-default') continue
      const back = byUrl.get(alt)?.alternates?.languages as Record<string, string> | undefined
      if (!back || !Object.values(back).includes(e.url)) problems.push(`${e.url}: ${alt} does not link back`)
    }
  }
  assert.deepEqual(problems, [])
})

test('sitemap: x-default is the same locale everywhere', () => {
  const wrong = entries
    .map(e => (e.alternates?.languages as Record<string, string> | undefined)?.['x-default'])
    .filter((x): x is string => !!x)
    .filter(x => !pathOf(x).startsWith(`/${X_DEFAULT_LOCALE}`))
  // Single-locale blog posts may default to their only locale; nothing else may.
  assert.deepEqual(wrong.filter(x => !pathOf(x).includes('/blog/')), [])
})

test('sitemap: blog posts use locale slugs, skip drafts and unpublished locales', () => {
  const blog = sitemapUrls.filter(u => pathOf(u).includes('/blog/')).map(pathOf).sort()
  assert.deepEqual(blog, [
    '/en/blog/relaxing-massage-benefits', // slugEn, not the Spanish slug
    '/es/blog/beneficios-masaje-relajante',
    '/es/blog/spas-de-medellin', // Spanish-only: no /en twin
  ])
  const esOnly = entries.find(e => e.url.endsWith('/es/blog/spas-de-medellin'))!
  assert.deepEqual(Object.keys(esOnly.alternates!.languages!).sort(), ['es', 'x-default'])
})

// ─── Redirects ───────────────────────────────────────────────────────────────

test('redirects: all are permanent (a 307 keeps the old URL indexed)', () => {
  assert.deepEqual(redirects.filter(r => r.permanent !== true).map(r => r.source), [])
})

test('redirects: www.diamondspa.com.co is folded into the canonical host', () => {
  const www = redirects.find(r => r.has?.some(h => (h as { value?: string }).value === 'www.diamondspa.com.co'))
  assert.ok(www, 'missing www -> non-www redirect')
  assert.ok(www.destination.startsWith(`${BASE_URL}/`))
})

test('redirects: no chains — every destination is a final URL', () => {
  const chains: string[] = []
  for (const r of pathRedirects) {
    if (/^https?:/.test(r.destination)) continue
    // Expand ":lang" into both locales; other params can't be resolved statically.
    const dests = r.destination.includes(':lang')
      ? LOCALES.map(l => r.destination.replace(':lang', l))
      : [r.destination]
    for (const d of dests) {
      if (d.includes(':')) continue
      const next = redirectFor(d)
      if (next) chains.push(`${r.source} -> ${d} -> ${next.destination}`)
    }
  }
  assert.deepEqual(chains, [])
})

// ─── Internal links ──────────────────────────────────────────────────────────

test('links: serviceHref() never points at a redirect and is always in the sitemap', () => {
  const bad: string[] = []
  for (const svc of SERVICES) {
    for (const locale of LOCALES) {
      const href = serviceHref(svc, locale)
      if (redirectFor(href)) bad.push(`${href} redirects`)
      if (!sitemapSet.has(`${BASE_URL}${href}`)) bad.push(`${href} not in sitemap`)
    }
  }
  assert.deepEqual(bad, [])
})

test('links: the language switcher never links through a redirect', () => {
  const bad: string[] = []
  for (const url of sitemapUrls) {
    for (const locale of LOCALES) {
      const target = getLocalizedPath(pathOf(url), locale)
      const rule = redirectFor(target)
      if (rule) bad.push(`${pathOf(url)} [${locale}] -> ${target} -> ${rule.destination}`)
    }
  }
  assert.deepEqual(bad, [])
})

test('links: stale service links in blog HTML are rewritten to non-redirecting URLs', () => {
  const stale = pathRedirects
    .filter(r => /^\/(es|en)\/services\/[a-z0-9-]+$/.test(r.source))
    .map(r => r.source)
  assert.ok(stale.length > 0)
  const html = stale.map(s => `<a href="${s}">x</a>`).join('')
  const hrefs = [...canonicalizeServiceLinks(html).matchAll(/href="([^"]+)"/g)].map(m => m[1])
  assert.deepEqual(hrefs.filter(h => redirectFor(h)), [])
})

/** All .tsx files under a directory. */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return tsxFiles(full)
    return name.endsWith('.tsx') ? [full] : []
  })
}

test('links: no hand-built /services/<slug> hrefs — use serviceHref()', () => {
  // A literal or template href into /services/<something> is how the old
  // massage URLs kept being linked after they moved to /masajes.
  const handBuilt = /href(?:=\{?|:\s*)\s*[`'"][^`'"]*\/services\/[^`'"\s]/
  const offenders = [
    ...tsxFiles(LANG_DIR),
    ...tsxFiles(join(ROOT, 'src', 'components')),
  ].filter(f => handBuilt.test(readFileSync(f, 'utf8'))).map(f => relative(ROOT, f))
  assert.deepEqual(offenders, [])
})

// ─── Crawl controls ──────────────────────────────────────────────────────────

test('crawl: build artefacts under /_next/static are noindex via header', async () => {
  const headers = await nextConfig.headers!()
  const rule = headers.find((h: { source: string }) => h.source === '/_next/static/:path*')
  assert.ok(rule, 'missing /_next/static headers rule')
  const robotsTag = rule.headers.find((h: { key: string }) => h.key.toLowerCase() === 'x-robots-tag')
  assert.match(robotsTag?.value ?? '', /noindex/)
})

test('crawl: robots.txt blocks nothing Google needs to render or index', () => {
  const r = robots()
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
  const disallowed = rules.flatMap(rule => [rule.disallow ?? []].flat())
  // Blocking /_next stops Googlebot rendering every page; that is why the
  // static chunks are noindexed with a header instead (see next.config.mjs).
  for (const path of ['/', '/_next/', '/es', '/en']) {
    assert.ok(!disallowed.some(d => d === path || path.startsWith(d) && d !== '/admin/' && d !== '/api/'), path)
  }
  assert.equal(r.sitemap, `${BASE_URL}/sitemap.xml`)
})
