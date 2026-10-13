/**
 * The two public endpoints that guard something: the panel login (brute-force
 * throttle, no session on failure) and the WhatsApp webhook (Meta signature,
 * verify-token handshake). Run through the real route handlers.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHmac } from 'node:crypto'

for (const k of [
  'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
]) delete process.env[k]
process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me'
process.env.WHATSAPP_APP_SECRET = 'app-secret'

const { NextRequest } = await import('next/server')
const login = await import('@/app/api/admin/login/route')
const webhook = await import('@/app/api/whatsapp/webhook/route')
const { verifyMetaSignature } = await import('@/lib/meta-signature')

// ─── Admin login ─────────────────────────────────────────────────────────────

function postLogin(body: unknown, ip: string) {
  return login.POST(new NextRequest('https://app.diamondspa.com.co/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }))
}

test('login rejects malformed JSON with 400', async () => {
  const res = await postLogin('{', '198.51.100.1')
  assert.equal(res.status, 400)
})

test('login with unknown or empty credentials is a 401 and sets no cookie', async () => {
  for (const body of [
    { username: 'no-such-user-for-tests', password: 'Whatever123' },
    { username: '', password: '' },
    { username: 'nobody@example.com', password: 'Whatever123' },
    { username: 42, password: ['x'] },
  ]) {
    const res = await postLogin(body, '198.51.100.2')
    assert.equal(res.status, 401, JSON.stringify(body))
    assert.equal(res.headers.get('set-cookie'), null)
  }
})

test('login is throttled to 8 attempts per 15 minutes per IP', async () => {
  const ip = '198.51.100.3'
  const statuses = []
  for (let i = 0; i < 9; i++) {
    statuses.push((await postLogin({ username: 'no-such-user-for-tests', password: `Guess${i}abc` }, ip)).status)
  }
  assert.deepEqual(statuses, [401, 401, 401, 401, 401, 401, 401, 401, 429])
  // A different IP is still allowed to try.
  assert.equal((await postLogin({ username: 'x', password: 'y' }, '198.51.100.4')).status, 401)
})

// ─── WhatsApp webhook ────────────────────────────────────────────────────────

const sign = (body: string, secret = 'app-secret') =>
  `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`

test('verifyMetaSignature accepts only an HMAC of the exact raw body', () => {
  const body = '{"entry":[]}'
  assert.equal(verifyMetaSignature(body, sign(body), 'app-secret'), true)
  assert.equal(verifyMetaSignature(body, sign(body).slice(7), 'app-secret'), true, 'prefix is optional')
  assert.equal(verifyMetaSignature(body + ' ', sign(body), 'app-secret'), false, 'reformatted body')
  assert.equal(verifyMetaSignature(body, sign(body, 'other'), 'app-secret'), false, 'wrong secret')
  assert.equal(verifyMetaSignature(body, 'sha256=abc', 'app-secret'), false, 'truncated')
  assert.equal(verifyMetaSignature(body, null, 'app-secret'), false)
  assert.equal(verifyMetaSignature(body, '', 'app-secret'), false)
})

test('webhook handshake echoes the challenge only for the right verify token', async () => {
  const get = (qs: string) => webhook.GET(new NextRequest(`https://diamondspa.com.co/api/whatsapp/webhook?${qs}`))

  const ok = await get('hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345')
  assert.equal(ok.status, 200)
  assert.equal(await ok.text(), '12345')

  assert.equal((await get('hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1')).status, 403)
  assert.equal((await get('hub.mode=unsubscribe&hub.verify_token=verify-me&hub.challenge=1')).status, 403)
  assert.equal((await get('')).status, 403)
})

function postWebhook(body: string, signature: string | null) {
  return webhook.POST(new NextRequest('https://diamondspa.com.co/api/whatsapp/webhook', {
    method: 'POST',
    headers: signature ? { 'x-hub-signature-256': signature } : {},
    body,
  }))
}

test('webhook rejects unsigned and badly signed deliveries', async () => {
  const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] })
  assert.equal((await postWebhook(body, null)).status, 401)
  assert.equal((await postWebhook(body, sign(body, 'attacker'))).status, 401)
})

test('webhook acknowledges signed deliveries with no messages (status updates) with 200', async () => {
  const quiet = console.log
  console.log = () => {}
  try {
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ value: { statuses: [{}] } }] }] })
    assert.equal((await postWebhook(body, sign(body))).status, 200)
    // Signed but not JSON: still 200, otherwise Meta retries the same delivery forever.
    assert.equal((await postWebhook('not json', sign('not json'))).status, 200)
  } finally {
    console.log = quiet
  }
})

test('webhook stays closed (503) when the app secret is not configured', async () => {
  const saved = process.env.WHATSAPP_APP_SECRET
  delete process.env.WHATSAPP_APP_SECRET
  const quiet = console.error
  console.error = () => {}
  try {
    assert.equal((await postWebhook('{}', sign('{}'))).status, 503)
  } finally {
    process.env.WHATSAPP_APP_SECRET = saved
    console.error = quiet
  }
})
