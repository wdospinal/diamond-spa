import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifica la cabecera `X-Hub-Signature-256` que Meta manda en cada entrega del
 * webhook de WhatsApp: HMAC-SHA256 del cuerpo *crudo* con el App Secret, en hex
 * y con el prefijo `sha256=`. Compara en tiempo constante.
 *
 * Mismo patrón que `vercel-signature.ts` (que usa SHA-1 porque así lo define
 * Vercel); la diferencia importante es la misma en los dos: hay que firmar el
 * texto exacto del cuerpo, así que la ruta debe leer `await req.text()` antes
 * de parsear el JSON.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
 */
export function verifyMetaSignature(
  rawBody: string,
  signature: string | null | undefined,
  appSecret: string,
): boolean {
  if (!signature) return false
  const received = signature.startsWith('sha256=') ? signature.slice(7) : signature
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  try {
    const a = Buffer.from(received)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
