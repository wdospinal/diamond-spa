import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifies the `x-vercel-signature` header Vercel attaches to drain (and
 * webhook) deliveries: HMAC-SHA1 of the *raw* request body using the drain's
 * signing secret, hex-encoded. Uses a constant-time compare to avoid timing
 * attacks. See https://vercel.com/docs/drains/security
 */
export function verifyVercelSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature) return false
  const expected = createHmac('sha1', secret).update(rawBody).digest('hex')
  try {
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
