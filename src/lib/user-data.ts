/**
 * user_data para las conversiones mejoradas de Google Ads (leads).
 *
 * El dataLayer lleva el teléfono en claro y en formato E.164; la etiqueta
 * "Google Ads User-Provided Data Event" de GTM (variable "UPD - lead") lo
 * normaliza y le aplica el SHA-256 antes de enviarlo a Google. Aquí solo se
 * deja el dato en la forma que Google acepta, o no se envía nada.
 *
 * Nunca se envía un dato dudoso: un teléfono sin código de país conocido se
 * descarta, porque un número mal formado no empareja con nada.
 */

export interface UserData {
  phone_number?: string
}

// E.164: "+", código de país sin cero inicial y 11 a 15 dígitos en total.
const E164 = /^\+[1-9]\d{10,14}$/

/**
 * Lleva un teléfono escrito por una persona a E.164, o devuelve null.
 *
 * Reglas (mismas que usa el export de conversiones offline para Colombia):
 *  - con "+" se respeta el código de país que puso la persona
 *  - 12 dígitos que empiezan por 57 → ya trae el código de Colombia
 *  - 10 dígitos que empiezan por 3 → celular colombiano, se le antepone +57
 *  - 11 dígitos o más sin "+" → se asume que ya incluyen código de país
 *  - cualquier otra cosa (p. ej. 10 dígitos que no empiezan por 3) → null,
 *    porque no se puede saber de qué país es
 */
export function toE164(raw: string | null | undefined): string | null {
  // Analítica nunca debe romper el flujo de reserva: con cualquier valor que
  // no sea texto (no debería pasar, pero el estado de React es mutable) no se
  // lanza nada, simplemente no hay user_data.
  if (typeof raw !== 'string' || !raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  let candidate: string
  if (raw.trim().startsWith('+')) candidate = `+${digits}`
  else if (digits.length === 12 && digits.startsWith('57')) candidate = `+${digits}`
  else if (digits.length === 10 && digits.startsWith('3')) candidate = `+57${digits}`
  else if (digits.length >= 11) candidate = `+${digits}`
  else return null

  return E164.test(candidate) ? candidate : null
}

/**
 * Fragmento listo para esparcir en un pushEvent: `{ user_data: { … } }` si hay
 * un teléfono válido, y `{}` si no — así el evento sale igual, sin user_data.
 */
export function userDataFor(phone: string | null | undefined): { user_data?: UserData } {
  const e164 = toE164(phone)
  return e164 ? { user_data: { phone_number: e164 } } : {}
}
