/**
 * Panel login: cookie signing, safe redirects, role gating and password/code
 * hashing. A regression in any of these either locks the team out or lets a
 * forged cookie in.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  adminCookieMaxAge,
  readSessionToken,
  signSession,
  verifySessionToken,
} from '@/lib/admin-session'
import { safeAdminRedirect } from '@/lib/admin-guard'
import {
  ADMIN_ROLES,
  SECTION_ROLES,
  canAccessSection,
  hidesAdsAttribution,
  isAdminRole,
  roleFromLegacy,
  type AdminSection,
} from '@/lib/admin-roles'
import {
  codeMatches,
  generateCode,
  hashCode,
  hashPassword,
  isValidEmail,
  passwordProblem,
  resetCodeScope,
  usernameProblem,
  verifyPasswordHash,
} from '@/lib/admin-users'

// ─── Session cookie ──────────────────────────────────────────────────────────

test('a freshly signed session reads back with its username and expiry', () => {
  const exp = Date.now() + 60_000
  const token = signSession(exp, 'recepcion')
  assert.deepEqual(readSessionToken(token), { username: 'recepcion', exp })
  assert.equal(verifySessionToken(token), true)
})

test('an expired session is rejected', () => {
  assert.equal(readSessionToken(signSession(Date.now() - 1, 'recepcion')), null)
})

test('a session whose payload was edited is rejected (signature no longer matches)', () => {
  const [, sig] = signSession(Date.now() + 60_000, 'recepcion').split('.')
  const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 60_000, u: 'superadmin' })).toString('base64url')
  assert.equal(readSessionToken(`${forged}.${sig}`), null)
})

test('malformed, empty or unsigned cookies are rejected without throwing', () => {
  for (const t of [undefined, '', 'abc', '.', 'abc.', '.abc', 'a.b.c', 'é.é']) {
    assert.equal(readSessionToken(t), null, String(t))
  }
})

test('a correctly signed payload without a username is rejected', () => {
  // Sign by hand to reach the payload checks past the HMAC.
  const token = signSession(Date.now() + 60_000, '')
  assert.equal(readSessionToken(token), null)
})

test('the session cookie lasts seven days', () => {
  assert.equal(adminCookieMaxAge(), 7 * 24 * 60 * 60)
})

// ─── Post-login redirect ─────────────────────────────────────────────────────

test('safeAdminRedirect keeps in-app admin paths', () => {
  assert.equal(safeAdminRedirect('/admin/bookings'), '/admin/bookings')
  assert.equal(safeAdminRedirect('/admin/caja?day=2026-10-01'), '/admin/caja?day=2026-10-01')
})

test('safeAdminRedirect falls back to /admin for off-site or looping targets', () => {
  for (const next of [
    undefined,
    '',
    'https://evil.com',
    '//evil.com',
    '//evil.com/admin',
    '/es',
    'admin',
    '/admin/login',
    '/admin/login/',
    '/admin/login/extra',
  ]) {
    assert.equal(safeAdminRedirect(next), '/admin', String(next))
  }
})

// ─── Roles ───────────────────────────────────────────────────────────────────

test('isAdminRole only accepts the known roles', () => {
  for (const r of ADMIN_ROLES) assert.equal(isAdminRole(r), true)
  for (const r of ['admin', 'SUPERADMIN', '', null, undefined, 1]) assert.equal(isAdminRole(r), false)
})

test('legacy rows map is_superadmin to superadmin and everything else to recepcionista', () => {
  assert.equal(roleFromLegacy(undefined, true), 'superadmin')
  assert.equal(roleFromLegacy(undefined, false), 'recepcionista')
  assert.equal(roleFromLegacy('nonsense', 'true'), 'recepcionista')
  // An explicit role wins over the legacy flag.
  assert.equal(roleFromLegacy('ads_manager', true), 'ads_manager')
})

test('superadmin can open every section; reception only sees the agenda', () => {
  const sections = Object.keys(SECTION_ROLES) as AdminSection[]
  for (const s of sections) assert.equal(canAccessSection('superadmin', s), true, s)

  const reception = sections.filter(s => canAccessSection('recepcionista', s))
  assert.deepEqual(reception.sort(), ['/admin', '/admin/bookings'])
})

test('cash and Bold reports stay superadmin-only', () => {
  for (const role of ['recepcionista', 'ads_manager'] as const) {
    assert.equal(canAccessSection(role, '/admin/caja'), false, role)
    assert.equal(canAccessSection(role, '/admin/bold'), false, role)
  }
  assert.equal(canAccessSection('ads_manager', '/admin/funnel'), true)
})

test('reception does not see ads attribution', () => {
  assert.equal(hidesAdsAttribution('recepcionista'), true)
  assert.equal(hidesAdsAttribution('ads_manager'), false)
  assert.equal(hidesAdsAttribution('superadmin'), false)
})

// ─── Passwords & verification codes ──────────────────────────────────────────

test('password hashes verify only the original password and are salted', async () => {
  const a = await hashPassword('Diamante2026')
  const b = await hashPassword('Diamante2026')
  assert.match(a, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]+$/)
  assert.notEqual(a, b, 'each hash must use a fresh salt')
  assert.equal(await verifyPasswordHash('Diamante2026', a), true)
  assert.equal(await verifyPasswordHash('diamante2026', a), false, 'passwords are case-sensitive')
  assert.equal(await verifyPasswordHash('Diamante2026 ', a), false)
})

test('corrupt stored hashes fail closed', async () => {
  for (const stored of ['', 'plain-text', 'bcrypt$x$y', 'scrypt$salt$', 'scrypt$salt$abcd']) {
    assert.equal(await verifyPasswordHash('Diamante2026', stored), false, stored)
  }
})

test('password rules: 8–200 chars with at least one letter and one number', () => {
  assert.equal(passwordProblem('Diamante1'), null)
  assert.ok(passwordProblem('Ab1'))
  assert.ok(passwordProblem('solo-letras'))
  assert.ok(passwordProblem('12345678'))
  assert.ok(passwordProblem('a1'.repeat(101)))
})

test('username rules', () => {
  assert.equal(usernameProblem('Recepcion.1'), null, 'normalized to lowercase before checking')
  assert.equal(usernameProblem('  ana_m  '), null, 'surrounding spaces are trimmed')
  assert.ok(usernameProblem('a'))
  assert.ok(usernameProblem('x'.repeat(33)))
  assert.ok(usernameProblem('ana maría'))
  assert.ok(usernameProblem('ana@spa'))
})

test('verification codes are 6 digits and bound to the user and the flow', () => {
  for (let i = 0; i < 50; i++) assert.match(generateCode(), /^\d{6}$/)

  const stored = hashCode('ana', '123456')
  assert.equal(codeMatches('ana', '123456', stored), true)
  assert.equal(codeMatches('ana', ' 123456 ', stored), true, 'pasted codes are trimmed')
  assert.equal(codeMatches('ana', '123457', stored), false)
  assert.equal(codeMatches('bea', '123456', stored), false, 'a code for one account does not work on another')
  assert.equal(codeMatches('ana', '123456', null), false)

  // A password-reset code cannot be replayed in the email-change flow (and vice versa).
  const resetStored = hashCode(resetCodeScope('ana'), '123456')
  assert.equal(codeMatches('ana', '123456', resetStored), false)
  assert.equal(codeMatches(resetCodeScope('ana'), '123456', resetStored), true)
})

test('isValidEmail', () => {
  assert.equal(isValidEmail('book@diamondspa.com.co'), true)
  for (const e of ['', 'no-at', 'a@b', 'a@b.c', 'a b@c.com', `${'a'.repeat(250)}@b.com`]) {
    assert.equal(isValidEmail(e), false, e)
  }
})
