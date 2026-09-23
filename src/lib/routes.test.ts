/**
 * Service URLs must point at the final page, never at a URL that redirects.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canonicalizeServiceLinks, getLocalizedPath, serviceHref } from '@/lib/routes'

test('serviceHref sends massage types to /masajes with locale slugs', () => {
  assert.equal(serviceHref('hot-stones', 'es'), '/es/masajes/piedras-volcanicas')
  assert.equal(serviceHref('hot-stones', 'en'), '/en/masajes/hot-stones')
})

test('serviceHref uses the English slug for EN service pages', () => {
  assert.equal(serviceHref('depilacion-pecho', 'es'), '/es/services/depilacion-pecho')
  assert.equal(serviceHref('depilacion-pecho', 'en'), '/en/services/wax-chest')
})

test('canonicalizeServiceLinks rewrites stale links in stored HTML', () => {
  const html =
    '<a href="/es/services/sports">a</a> ' +
    '<a href="https://www.diamondspa.com.co/en/services/deep-tissue">b</a> ' +
    '<a href="/en/services/depilacion-pecho">c</a>'
  assert.equal(
    canonicalizeServiceLinks(html),
    '<a href="/es/masajes/deportivo">a</a> ' +
    '<a href="/en/masajes/deep-tissue">b</a> ' +
    '<a href="/en/services/wax-chest">c</a>',
  )
})

test('canonicalizeServiceLinks leaves unknown slugs and other links alone', () => {
  const html = '<a href="/es/services/no-existe">x</a> <a href="/es/book">y</a>'
  assert.equal(canonicalizeServiceLinks(html), html)
})

test('language switch from /en/massage-medellin skips the redirecting ES URL', () => {
  assert.equal(getLocalizedPath('/en/massage-medellin', 'es'), '/es/masajes')
  assert.equal(getLocalizedPath('/en/massage-medellin', 'en'), '/en/massage-medellin')
})
