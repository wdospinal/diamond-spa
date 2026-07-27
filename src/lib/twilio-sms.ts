/**
 * Minimal Twilio SMS sender over the REST API using `fetch` — no npm dependency.
 *
 * Only ever called from trusted server paths with a message this module's caller
 * built from already-validated data. There is deliberately no public route that
 * forwards a caller-supplied body to Twilio: every send costs money and lands on
 * the spa's phone.
 */

const SPA_FALLBACK_PHONE = '+573054541635'

export function smsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER,
  )
}

/**
 * Fire-and-forget SMS to the business line. Never throws — notification failure
 * must not fail the booking that triggered it.
 */
export async function sendBusinessSms(message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  const toNumber = process.env.BUSINESS_PHONE ?? SPA_FALLBACK_PHONE

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('SMS not sent — Twilio env vars missing')
    return
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const body = new URLSearchParams({
    From: fromNumber,
    To: toNumber,
    // Twilio bills per 160-char segment; keep a hard ceiling on cost per send.
    Body: message.slice(0, 320),
  })

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    )
    if (!res.ok) console.error('Twilio error:', await res.text())
  } catch (err) {
    console.error('Twilio request failed:', err)
  }
}
