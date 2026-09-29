/**
 * El teléfono que va al dataLayer para las conversiones mejoradas debe estar
 * en E.164 válido, o no ir.
 *
 *   npm test
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toE164, userDataFor } from '@/lib/user-data'

test('celular colombiano con y sin formato llega a +57', () => {
  assert.equal(toE164('3001234567'), '+573001234567')
  assert.equal(toE164('300 123 4567'), '+573001234567')
  assert.equal(toE164('(300) 123-4567'), '+573001234567')
  assert.equal(toE164('573001234567'), '+573001234567')
  assert.equal(toE164('+57 300 123 4567'), '+573001234567')
})

test('respeta el código de país cuando la persona escribe el +', () => {
  assert.equal(toE164('+1 212 555 1234'), '+12125551234')
  assert.equal(toE164('+34 612 345 678'), '+34612345678')
  assert.equal(toE164('+593 99 123 4567'), '+593991234567')
})

test('el modal y el chat ya arman +código+número y pasan tal cual', () => {
  assert.equal(toE164('+573001234567'), '+573001234567')
  assert.equal(toE164('+12125551234'), '+12125551234')
})

test('11 dígitos o más sin + se asume que traen código de país', () => {
  assert.equal(toE164('12125551234'), '+12125551234')
})

test('lo que no se puede asegurar se descarta', () => {
  assert.equal(toE164(''), null)
  assert.equal(toE164(null), null)
  assert.equal(toE164(undefined), null)
  assert.equal(toE164('abc'), null)
  // 10 dígitos que no empiezan por 3: no se sabe de qué país es
  assert.equal(toE164('2125551234'), null)
  // fijo de 7 dígitos
  assert.equal(toE164('4441234'), null)
  // demasiado corto y demasiado largo
  assert.equal(toE164('+57300123'), null)
  assert.equal(toE164('+5730012345678901'), null)
})

test('valores que no son texto no lanzan error: simplemente no hay user_data', () => {
  assert.equal(toE164(3001234567 as unknown as string), null)
  assert.equal(toE164({} as unknown as string), null)
  assert.deepEqual(userDataFor(null), {})
  assert.deepEqual(userDataFor(12345 as unknown as string), {})
})

test('userDataFor devuelve user_data solo con teléfono válido', () => {
  assert.deepEqual(userDataFor('3001234567'), { user_data: { phone_number: '+573001234567' } })
  assert.deepEqual(userDataFor('2125551234'), {})
  assert.deepEqual(userDataFor(undefined), {})
})
