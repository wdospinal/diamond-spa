/**
 * Page titles: the brand appears exactly once.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { withBrand } from '@/lib/seo'

test('withBrand appends the brand to a plain title', () => {
  assert.equal(withBrand('Tipos de Masajes: Guía Completa'), 'Tipos de Masajes: Guía Completa | Diamond Spa Medellín')
})

test('withBrand leaves a title that already names the brand alone', () => {
  assert.equal(withBrand('Tipos de Masajes: Guía Completa 2026 | Diamond Spa'), 'Tipos de Masajes: Guía Completa 2026 | Diamond Spa')
  assert.equal(withBrand('Diamond Spa Medellín — Spa en El Poblado'), 'Diamond Spa Medellín — Spa en El Poblado')
})
