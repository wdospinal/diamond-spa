import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readBookings } from '@/lib/bookings-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'

/**
 * CSV export for Google Ads offline conversion import.
 *
 * Only includes bookings that are: status=completed, paymentStatus=paid,
 * and have a gclid on file — rows missing any of these are silently
 * excluded (not exported as blank/zero rows), since a partial or
 * malformed row is worse than a missing one when uploading to Ads.
 *
 * Column format follows Google's documented "Import from clicks" spec:
 * Google Click ID, Conversion Name, Conversion Time, Conversion Value,
 * Conversion Currency. Conversion Time uses yyyy-MM-dd HH:mm:ss followed
 * by a NUMERIC timezone offset with no colon (e.g. -0500) — Google's docs
 * explicitly warn that named zones (EST, UTC) or a colon in the offset
 * (-05:00) will cause the upload to fail.
 *
 * IMPORTANT — verify manually before every upload:
 *  - As of mid-2026 Google is moving accounts toward "Enhanced Conversions
 *    for Leads" and may not offer classic GCLID-only import to accounts
 *    that never used it before. Confirm which import option your account
 *    actually shows under Tools > Conversions > Import before relying on
 *    this file.
 *  - Google needs ~4-6 hours after the original ad click to index a gclid;
 *    uploading a lead logged within that window can return CLICK_NOT_FOUND.
 *  - Conversion Name below must match, character for character, the
 *    conversion action name you created in Google Ads.
 */

const CONVERSION_NAME = 'Reserva Confirmada Offline'
const BOGOTA_OFFSET = '-0500' // Colombia does not observe DST — offset is fixed year-round

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await readBookings()
  const eligible = bookings.filter(
    b => b.status === 'completed' && b.paymentStatus === 'paid' && !!b.gclid
  )

  const header = ['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency']
  const rows = eligible.map(b => {
    // scheduledAt is stored as an ISO string; reformat to Google's required
    // "yyyy-MM-dd HH:mm:ss ±hhmm" — using the booking's own date/time, not
    // export time, since that's when the conversion actually happened.
    const d = new Date(b.scheduledAt)
    const pad = (n: number) => String(n).padStart(2, '0')
    const conversionTime =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${BOGOTA_OFFSET}`
    return [
      b.gclid as string,
      CONVERSION_NAME,
      conversionTime,
      String(b.priceCop ?? 0),
      'COP',
    ].map(csvEscape).join(',')
  })

  const csv = [header.join(','), ...rows].join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="conversiones-offline-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
