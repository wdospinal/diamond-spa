/**
 * Envío de correo por Resend sobre `fetch` — sin dependencia npm, en línea con
 * el resto del proyecto. Requiere RESEND_API_KEY; sin ella no se envía nada y
 * el llamador decide qué hacer con el `false`.
 */

/** Remitente verificado en Resend, el mismo que usan las reservas. */
const FROM = 'Diamond Spa <reserva@zanacode.com>'

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY sin definir — no se envió el correo:', opts.subject)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error('Resend falló:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('Resend error de red:', err)
    return false
  }
}
