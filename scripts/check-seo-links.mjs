#!/usr/bin/env node
/**
 * Crawl every URL in the sitemap and fail if:
 *   - a sitemap entry does not answer 200 (redirecting/404 URLs in a sitemap
 *     show up in Search Console as "Page with redirect" / "Not found"), or
 *   - any page links internally to a URL that redirects or errors (each hop
 *     burns crawl budget and weakens the link to the real page).
 *
 * Usage:  node scripts/check-seo-links.mjs [baseUrl]
 *         baseUrl defaults to http://localhost:3000
 *
 * The sitemap always uses the production host, so its URLs are rewritten
 * onto baseUrl to test a local or preview build.
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const PROD = 'https://diamondspa.com.co'
// /book is noindex by design and linked from every page — not worth re-checking 90 times.
const SKIP = [/^\/(en|es)\/book(\?|$)/, /^\/(admin|api|_next)\//]

const toLocal = url => url.replace(PROD, BASE)

async function status(url) {
  const res = await fetch(url, { redirect: 'manual' })
  return { code: res.status, location: res.headers.get('location') }
}

const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text()
const pages = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => toLocal(m[1]))
if (pages.length === 0) {
  console.error(`No <loc> entries found in ${BASE}/sitemap.xml`)
  process.exit(1)
}

const problems = []
const linkSources = new Map() // path -> Set of pages linking to it

for (const page of pages) {
  const res = await fetch(page, { redirect: 'manual' })
  if (res.status !== 200) {
    problems.push(`sitemap  ${res.status}  ${page}${res.headers.get('location') ? ` -> ${res.headers.get('location')}` : ''}`)
    continue
  }
  const html = await res.text()
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#]*)"/g)) {
    const path = href.replace(/&amp;/g, '&')
    if (SKIP.some(re => re.test(path))) continue
    if (!linkSources.has(path)) linkSources.set(path, new Set())
    linkSources.get(path).add(page.replace(BASE, ''))
  }
}

for (const [path, sources] of linkSources) {
  const { code, location } = await status(`${BASE}${path}`)
  if (code !== 200) {
    const from = [...sources].slice(0, 3).join(', ') + (sources.size > 3 ? ` (+${sources.size - 3} more)` : '')
    problems.push(`link     ${code}  ${path}${location ? ` -> ${location}` : ''}\n           linked from: ${from}`)
  }
}

console.log(`Checked ${pages.length} sitemap URLs and ${linkSources.size} unique internal links on ${BASE}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n`)
  for (const p of problems) console.log(`  ${p}`)
  process.exit(1)
}
console.log('OK: every sitemap URL answers 200 and no internal link redirects.')
