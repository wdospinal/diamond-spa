/**
 * The price list, translations and page content are plain data, so nothing
 * type-checks that they are complete. These tests catch the usual slips: a
 * missing Spanish string, a duplicated slug, a price of 0, an icon that is not
 * in the self-hosted font subset (it renders as its raw name, e.g. "spa").
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  SERVICES,
  formatCop,
  getFacialServices,
  getHairRemovalServices,
  getMassageServices,
  getServiceById,
  getServiceByForeignSlug,
  getServiceBySlug,
  getServicePrice,
  getServiceSlug,
  type ServiceDef,
} from '@/lib/services'
import { SERVICE_CONTENT } from '@/lib/service-content'
import { FAQ_CATEGORIES, getFaqItems } from '@/lib/faqs'
import { getDict } from '@/lib/i18n'
import { MATERIAL_SYMBOLS_HREF } from '@/lib/material-symbols'
import { SPA_HOURS } from '@/lib/spa'
import { summarize } from '@/lib/cash-summary'
import type { LedgerEntry } from '@/lib/ledger-types'

const services = SERVICES as unknown as ServiceDef[]

/** Every `{ en, es }` pair anywhere inside `value`, with the path that reached it. */
function bilingualPairs(value: unknown, path = '$'): { path: string; en: unknown; es: unknown }[] {
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((v, i) => bilingualPairs(v, `${path}[${i}]`))
  const obj = value as Record<string, unknown>
  const own = 'en' in obj && 'es' in obj ? [{ path, en: obj.en, es: obj.es }] : []
  return [...own, ...Object.entries(obj).flatMap(([k, v]) => bilingualPairs(v, `${path}.${k}`))]
}

function assertBilingualComplete(value: unknown, label: string) {
  const pairs = bilingualPairs(value)
  assert.ok(pairs.length > 0, `${label}: no { en, es } pairs found`)
  for (const { path, en, es } of pairs) {
    if (typeof en !== 'string' && typeof es !== 'string') continue // nested objects, walked separately
    assert.equal(typeof en, 'string', `${label} ${path}.en`)
    assert.equal(typeof es, 'string', `${label} ${path}.es`)
    assert.ok((en as string).trim(), `${label} ${path}.en is empty`)
    assert.ok((es as string).trim(), `${label} ${path}.es is empty`)
    assert.ok(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(`${en} ${es}`), `${label} ${path} interpolated a missing value`)
  }
}

// ─── Services & prices ───────────────────────────────────────────────────────

test('service ids and English slugs are unique and URL-safe', () => {
  const ids = services.map(s => s.id)
  const slugs = services.map(s => s.slugEn)
  assert.equal(new Set(ids).size, ids.length, 'duplicate id')
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slugEn')
  for (const s of [...ids, ...slugs]) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, s)
})

test('every service belongs to exactly one category list', () => {
  const listed = [...getMassageServices(), ...getFacialServices(), ...getHairRemovalServices()]
  assert.equal(listed.length, services.length)
  assert.equal(new Set(listed.map(s => s.id)).size, services.length)
})

test('every service has a positive whole-peso price for each way it can be booked', () => {
  for (const s of services) {
    const prices =
      s.pricingModel === 'duration'
        ? [30, 60, 90].map(m => getServicePrice(s.id, m))
        : s.pricingModel === 'flat'
          ? [getServicePrice(s.id, null)]
          : [getServicePrice(s.id, null, 'wax'), getServicePrice(s.id, null, 'machine')]
    for (const p of prices) {
      assert.ok(Number.isInteger(p) && p! >= 10_000 && p! <= 2_000_000, `${s.id}: ${p}`)
    }
  }
})

test('longer massages never cost less than shorter ones', () => {
  for (const s of services) {
    if (s.pricingModel !== 'duration') continue
    assert.ok(s.prices[30] <= s.prices[60] && s.prices[60] <= s.prices[90], s.id)
  }
})

test('getServicePrice refuses combinations the booking form cannot send', () => {
  const massage = services.find(s => s.pricingModel === 'duration')!
  const wax = services.find(s => s.pricingModel === 'wax-machine')!
  assert.equal(getServicePrice(massage.id, 45), undefined)
  assert.equal(getServicePrice(massage.id, null), undefined)
  assert.equal(getServicePrice(wax.id, null), undefined, 'hair removal needs a method')
  assert.equal(getServicePrice('does-not-exist', 60), undefined)
})

test('slug lookups round-trip in both locales, including cross-locale URLs', () => {
  for (const s of services) {
    for (const locale of ['en', 'es'] as const) {
      const slug = getServiceSlug(s, locale)
      assert.equal(getServiceBySlug(slug, locale)?.id, s.id, `${locale}/${slug}`)
    }
    if (s.slugEn !== s.id) {
      // /es/services/<english-slug> must be recoverable (it 308s to the ES slug).
      assert.equal(getServiceByForeignSlug(s.slugEn, 'es')?.id, s.id)
      assert.equal(getServiceByForeignSlug(s.id, 'en')?.id, s.id)
    }
  }
})

test('service names and descriptions exist in both languages', () => {
  assertBilingualComplete(services, 'SERVICES')
})

test('formatCop uses Colombian thousands grouping', () => {
  assert.equal(formatCop(120_000), '$ 120.000 COP')
  assert.equal(formatCop(1_250_000), '$ 1.250.000 COP')
  assert.equal(formatCop(999), '$ 999 COP')
  assert.equal(formatCop(199_999.6), '$ 200.000 COP')
})

// ─── Page content ────────────────────────────────────────────────────────────

test('detail-page content is only written for services that exist', () => {
  for (const id of Object.keys(SERVICE_CONTENT)) assert.ok(getServiceById(id), id)
})

test('detail-page content is complete in both languages', () => {
  for (const [id, content] of Object.entries(SERVICE_CONTENT)) assertBilingualComplete(content, id)
})

test('FAQ entries are complete in both languages and categories are unique', () => {
  assertBilingualComplete(FAQ_CATEGORIES, 'FAQ')
  const ids = FAQ_CATEGORIES.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(getFaqItems('en').length, getFaqItems('es').length)
})

test('FAQ questions are not duplicated within a language (Google rejects duplicate FAQPage items)', () => {
  for (const locale of ['en', 'es'] as const) {
    const qs = getFaqItems(locale).map(i => i.question.trim().toLowerCase())
    const dupes = qs.filter((q, i) => qs.indexOf(q) !== i)
    assert.deepEqual(dupes, [], locale)
  }
})

// ─── UI dictionary ───────────────────────────────────────────────────────────

/** Shape of a value: key paths for objects, element shape for arrays of equal length. */
function shapeDiff(a: unknown, b: unknown, path = '$'): string[] {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return [`${path}: array vs non-array`]
    if (a.length !== b.length) return [`${path}: ${a.length} vs ${b.length} items`]
    return a.flatMap((v, i) => shapeDiff(v, b[i], `${path}[${i}]`))
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].flatMap(k =>
      !(k in a) ? [`${path}.${k}: missing in en`]
        : !(k in b) ? [`${path}.${k}: missing in es`]
          : shapeDiff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`),
    )
  }
  if (typeof a !== typeof b) return [`${path}: ${typeof a} vs ${typeof b}`]
  if (typeof a === 'string' && (!a.trim() || !(b as string).trim())) return [`${path}: empty string`]
  return []
}

test('the English and Spanish UI dictionaries have the same keys and list lengths', () => {
  assert.deepEqual(shapeDiff(getDict('en'), getDict('es')), [])
})

// ─── Icons ───────────────────────────────────────────────────────────────────

const SRC = join(import.meta.dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return name === '__fixtures__' ? [] : sourceFiles(p)
    return /\.(tsx?|mjs)$/.test(name) && !name.endsWith('.test.ts') ? [p] : []
  })
}

test('every Material Symbols icon used in the source is in the self-hosted subset', () => {
  const subset = new Set(new URL(MATERIAL_SYMBOLS_HREF).searchParams.get('icon_names')!.split(','))
  const used = new Map<string, string>()
  const patterns = [
    /\bicon:\s*'([a-z0-9_]+)'/g, // data: { icon: 'spa' }
    /<Icon\b[^>]*\bname="([a-z0-9_]+)"/g, // <Icon name="close" />
    /material-symbols-outlined[^"]*"[^>]*>\s*([a-z0-9_]+)\s*</g, // <span className="material-symbols-outlined">spa</span>
  ]
  for (const file of sourceFiles(SRC)) {
    // The chat scripts name icons from the widget's own SVG set — checked below.
    if (/chat-flow-(es|en)\.ts$/.test(file)) continue
    const text = readFileSync(file, 'utf8')
    for (const re of patterns) for (const m of text.matchAll(re)) used.set(m[1], file.slice(SRC.length + 1))
  }
  assert.ok(used.size > 20, `only found ${used.size} icons — did the patterns break?`)
  const missing = [...used].filter(([name]) => !subset.has(name)).map(([n, f]) => `${n} (${f})`)
  assert.deepEqual(missing, [], 'add these to ICON_NAMES and regenerate the woff2 (see material-symbols.ts)')
})

test('every icon the chat scripts use has an SVG in the chat widget', () => {
  const widget = readFileSync(join(SRC, 'components', 'PautaChatWidget.tsx'), 'utf8')
  const block = widget.slice(widget.indexOf('const ICONS'), widget.indexOf('\n}', widget.indexOf('const ICONS')))
  const drawn = new Set([...block.matchAll(/^\s+([a-z]+):\s*\(/gm)].map(m => m[1]))
  assert.ok(drawn.size > 5, `only found ${drawn.size} chat icons — did the pattern break?`)
  for (const file of ['chat-flow-es.ts', 'chat-flow-en.ts']) {
    const text = readFileSync(join(SRC, 'lib', file), 'utf8')
    for (const [, name] of text.matchAll(/\bicon:\s*'([a-z]+)'/g)) assert.ok(drawn.has(name), `${file}: ${name}`)
  }
})

// ─── Business hours ──────────────────────────────────────────────────────────

test('opening hours cover each weekday exactly once and open before they close', () => {
  const days = SPA_HOURS.flatMap(h => [...h.dayOfWeek])
  assert.equal(days.length, 7)
  assert.equal(new Set(days).size, 7)
  for (const h of SPA_HOURS) assert.ok(h.opens < h.closes, `${h.opens}–${h.closes}`)
})

// ─── Cash totals ─────────────────────────────────────────────────────────────

function entry(over: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: crypto.randomUUID(), day: '2026-10-13', occurredAt: '2026-10-13T15:00:00Z',
    kind: 'income', amountCop: 0, channel: 'transfer', categoryId: 'service',
    serviceId: null, serviceLabel: null, durationMinutes: null, quantity: 1, therapist: null,
    note: '', source: 'manual', author: 'test', mediaId: null, status: 'active',
    confidence: 'high', pendingField: null, promptWamid: null,
    createdAt: '2026-10-13T15:00:00Z', updatedAt: '2026-10-13T15:00:00Z',
    ...over,
  }
}

test('cash summary: income minus expenses, services counted by quantity', () => {
  const s = summarize([
    entry({ amountCop: 800_000, quantity: 4 }), // «4 relajantes»
    entry({ amountCop: 20_000, categoryId: 'tip' }),
    entry({ kind: 'expense', categoryId: 'rent', amountCop: 1_000_000 }),
  ])
  assert.deepEqual(s, { incomeCop: 820_000, expenseCop: 1_000_000, profitCop: -180_000, services: 4, pending: 0 })
})

test('cash summary: void entries are ignored and amount-less ones are only counted as pending', () => {
  const s = summarize([
    entry({ amountCop: 200_000 }),
    entry({ amountCop: 500_000, status: 'void' }),
    entry({ amountCop: 0, status: 'needs_amount', pendingField: 'amount' }),
    entry({ amountCop: 300_000, status: 'needs_amount' }),
  ])
  assert.deepEqual(s, { incomeCop: 200_000, expenseCop: 0, profitCop: 200_000, services: 1, pending: 2 })
})

test('cash summary of nothing is all zeros', () => {
  assert.deepEqual(summarize([]), { incomeCop: 0, expenseCop: 0, profitCop: 0, services: 0, pending: 0 })
})
