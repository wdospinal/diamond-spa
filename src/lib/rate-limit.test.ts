/**
 * In-process rate limiter (the fallback used when KV is not configured) and the
 * helpers every throttled route shares.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'

// Force the in-memory backend regardless of the developer's shell.
for (const k of ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']) {
  delete process.env[k]
}
const { clientIp, rateLimit, tooManyRequests } = await import('@/lib/rate-limit')

test('allows up to the limit, then rejects with a Retry-After inside the window', async () => {
  const results = []
  for (let i = 0; i < 4; i++) results.push(await rateLimit('t-basic', '1.1.1.1', 3, 60))

  assert.deepEqual(results.map(r => r.ok), [true, true, true, false])
  assert.deepEqual(results.map(r => r.remaining), [2, 1, 0, 0])
  assert.ok(results[3].retryAfter >= 1 && results[3].retryAfter <= 60)
})

test('limits are per caller and per bucket name', async () => {
  for (let i = 0; i < 2; i++) await rateLimit('t-iso', 'a', 2, 60)
  assert.equal((await rateLimit('t-iso', 'a', 2, 60)).ok, false)
  assert.equal((await rateLimit('t-iso', 'b', 2, 60)).ok, true, 'another IP is unaffected')
  assert.equal((await rateLimit('t-iso-other', 'a', 2, 60)).ok, true, 'another bucket is unaffected')
})

test('clientIp takes the left-most x-forwarded-for entry', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': ' 203.0.113.9 , 10.0.0.1' } })
  assert.equal(clientIp(req), '203.0.113.9')
})

test('clientIp falls back to x-real-ip, then to one shared bucket', () => {
  assert.equal(clientIp(new Request('http://x', { headers: { 'x-real-ip': '198.51.100.4' } })), '198.51.100.4')
  assert.equal(clientIp(new Request('http://x')), 'unknown')
})

test('tooManyRequests is a JSON 429 with a Retry-After of at least one second', async () => {
  const res = tooManyRequests(0, 'Espera')
  assert.equal(res.status, 429)
  assert.equal(res.headers.get('Retry-After'), '1')
  assert.equal(res.headers.get('Content-Type'), 'application/json')
  assert.deepEqual(await res.json(), { error: 'Espera' })
  assert.equal(tooManyRequests(42).headers.get('Retry-After'), '42')
})
