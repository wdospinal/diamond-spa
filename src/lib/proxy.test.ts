/**
 * Host routing in src/proxy.ts (app.diamondspa.com.co serves the panel at its
 * root) and the men-only landing menu filter.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'
import { isMenOnlyLandingPath, withoutWomenOnLanding } from '@/lib/landing-audience'

function run(url: string) {
  const u = new URL(url)
  return proxy(new NextRequest(url, { headers: { host: u.host } }))
}
const rewrittenTo = (res: Response) => res.headers.get('x-middleware-rewrite')
const passesThrough = (res: Response) => res.headers.get('x-middleware-next') === '1'

test('the public site root redirects to Spanish', () => {
  const res = run('https://diamondspa.com.co/')
  assert.equal(res.status, 301)
  assert.equal(res.headers.get('location'), 'https://diamondspa.com.co/es')
})

test('public pages pass straight through', () => {
  for (const path of ['/es', '/en/masajes', '/admin/login', '/api/bookings']) {
    assert.ok(passesThrough(run(`https://diamondspa.com.co${path}`)), path)
  }
})

test('the app host serves the panel at its root', () => {
  assert.equal(rewrittenTo(run('https://app.diamondspa.com.co/')), 'https://app.diamondspa.com.co/admin')
  assert.equal(rewrittenTo(run('https://app.diamondspa.com.co/bookings')), 'https://app.diamondspa.com.co/admin/bookings')
  assert.equal(rewrittenTo(run('http://app.localhost:3000/caja')), 'http://app.localhost:3000/admin/caja')
})

test('the app host never double-prefixes /admin and leaves APIs and files alone', () => {
  for (const path of ['/admin', '/admin/login', '/api/bookings', '/_next/static/x.js', '/favicon.ico', '/sw.js', '/logo.webp']) {
    const res = run(`https://app.diamondspa.com.co${path}`)
    assert.ok(passesThrough(res), path)
    assert.equal(rewrittenTo(res), null, path)
  }
})

// ─── Men-only landing ────────────────────────────────────────────────────────

test('isMenOnlyLandingPath only matches the men-only ads landing', () => {
  assert.equal(isMenOnlyLandingPath('/es/l/oferta-masajes'), true)
  assert.equal(isMenOnlyLandingPath('/en/l/oferta-masajes?gclid=1'), true)
  assert.equal(isMenOnlyLandingPath('/es/l/otra-landing'), false)
  assert.equal(isMenOnlyLandingPath('/es/masajes'), false)
  assert.equal(isMenOnlyLandingPath(null), false)
})

test('women-only menu links are hidden on the men-only landing and nowhere else', () => {
  const links = [
    { label: 'Masajes', href: '/es/masajes', children: [
      { label: 'Hombres', href: '/es/masajes-para-hombres' },
      { label: 'Mujeres', href: '/es/masajes-para-mujeres' },
    ] },
    { label: 'Depilación', href: '/es/depilacion', children: [
      { label: 'Mujeres', href: '/es/depilacion-mujeres' },
      { label: 'Hombres', href: '/es/depilacion-hombres' },
    ] },
    { label: 'Blog', href: '/es/blog' },
  ]
  const onLanding = withoutWomenOnLanding(links, '/es/l/oferta-masajes')
  assert.deepEqual(onLanding.flatMap(l => l.children?.map(c => c.href) ?? []), ['/es/masajes-para-hombres', '/es/depilacion-hombres'])
  assert.equal(onLanding[2], links[2])

  assert.equal(withoutWomenOnLanding(links, '/es/masajes'), links, 'other pages are untouched')
})
