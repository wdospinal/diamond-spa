import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { readBookings } from '@/lib/bookings-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Must match, character for character, the conversion action names already
// live in Google Ads (both created 22/8/2026, category "Cliente potencial
// importado", both marked Principal). Override per-request with
// ?conv_name_qualified=...&conv_name_converted=... only if you rename them.
const DEFAULT_CONV_QUALIFIED = 'Lead Cualificado'
const DEFAULT_CONV_CONVERTED = 'Reserva Confirmada Offline'
const BOGOTA_OFFSET = '-0500' // America/Bogota is UTC-5 year-round

// ─── Enhanced Conversions for Leads: normalize + SHA-256 hash ──────────────────
// Google requires email/phone to be hashed (hex SHA-256) before upload, never
// sent raw. See: https://support.google.com/google-ads/answer/11347292

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

function normalizeEmailForHash(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.indexOf('@')
  if (at === -1) return trimmed
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  // Google's spec: strip dots from the local part for gmail.com/googlemail.com only.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.replace(/\./g, '')}@${domain}`
  }
  return trimmed
}

function hashEmail(email: string): string {
  const normalized = normalizeEmailForHash(email)
  return normalized ? sha256Hex(normalized) : ''
}

function hashPhoneE164(e164Phone: string): string {
  // Phone must already be in E.164 (+<country><number>, no spaces/dashes) before hashing.
  return e164Phone ? sha256Hex(e164Phone) : ''
}

function csvEscape(value: string): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatConversionTime(isoDate: string): string {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${BOGOTA_OFFSET}`
  )
}

function normalizeE164(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[^\d+]/g, '').trim()
  if (!cleaned) return ''
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('57') && cleaned.length === 12) return `+${cleaned}`
  if (cleaned.length === 10 && cleaned.startsWith('3')) return `+57${cleaned}`
  return `+${cleaned}`
}

function checkAuth(req: NextRequest, queryKey?: string | null): boolean {
  // Deliberately NOT falling back to ADMIN_SESSION_SECRET here — that
  // variable already has a real, different value in production (it signs
  // the normal /admin/login session cookie), so using it as a fallback
  // silently overrides the password shared with Google Ads and makes every
  // login attempt with the documented password fail. This feed's password
  // must come only from its own dedicated env var, or the hardcoded default.
  const validSecret =
    process.env.GOOGLE_ADS_EXPORT_SECRET?.trim() ||
    'NbhB7rO30CBMoDNdhfzvV1mfS12juTxT'

  // 1. Check Query Key / Token
  if (queryKey === validSecret) {
    return true
  }

  // 2. Check Authorization Header (Basic Auth or Bearer)
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    if (authHeader.startsWith('Basic ')) {
      try {
        const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
        const separator = decoded.indexOf(':')
        const password = separator >= 0 ? decoded.slice(separator + 1) : ''
        if (password === validSecret) {
          return true
        }
      } catch {}
    } else if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      if (token === validSecret) {
        return true
      }
    }
  }

  // 3. Check X-API-Key Header
  const apiKey = req.headers.get('x-api-key')?.trim()
  if (apiKey === validSecret) {
    return true
  }

  return false
}

export async function handleExport(req: NextRequest, explicitType?: string) {
  const { searchParams } = req.nextUrl
  const exportType = explicitType || searchParams.get('type') || 'all' // 'all' | 'qualified' | 'converted'
  const keyParam = searchParams.get('key') || searchParams.get('token')
  const includeOrganic = searchParams.get('include_organic') === 'true'

  const convNameQualified = searchParams.get('conv_name_qualified')?.trim() || DEFAULT_CONV_QUALIFIED
  const convNameConverted = searchParams.get('conv_name_converted')?.trim() || DEFAULT_CONV_CONVERTED

  const isAuthed = checkAuth(req, keyParam)
  const sessionToken = (await cookies()).get(adminCookieName())?.value
  const isValidSession = Boolean(sessionToken && verifySessionToken(sessionToken))

  if (!isAuthed && !isValidSession) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Google Ads Conversions Feed"',
      },
    })
  }

  const allBookings = await readBookings()

  type ExportRow = {
    gclid: string
    conversionName: string
    conversionTime: string
    conversionValue: string
    conversionCurrency: string
    phoneNumber: string
    email: string
    transactionId: string
  }

  const exportRows: ExportRow[] = []

  for (const b of allBookings) {
    const hasGclid = Boolean(b.gclid && b.gclid.trim())
    const isAdsAttributed = hasGclid || b.source === 'ads' || Boolean(b.adgroup)

    if (!includeOrganic && !isAdsAttributed) {
      continue
    }

    const phoneE164 = b.phone ? normalizeE164(b.phone) : ''
    const convTime = formatConversionTime(b.scheduledAt || b.createdAt)
    const emailRaw = b.email ? b.email.trim().toLowerCase() : ''
    const gclid = b.gclid?.trim() || ''

    // Hash phone/email for Enhanced Conversions for Leads — Google rejects/
    // ignores raw PII in this column, and we never want to transmit it plain
    // over HTTP even if it happened to be accepted.
    const phoneHashed = phoneE164 ? hashPhoneE164(phoneE164) : ''
    const emailHashed = emailRaw ? hashEmail(emailRaw) : ''

    if (!gclid && !phoneHashed && !emailHashed) {
      continue
    }

    // 1. Stage: Lead Cualificado — requiere que alguien del equipo ya haya
    // interactuado con el lead (Contactado, Cita Agendada o Pagado). Un lead
    // "Pendiente" recién llegado, aunque venga de Ads, todavía no cuenta:
    // mandarlo como calificado entrenaría a Google con leads sin filtrar.
    const isQualified =
      b.status === 'contacted' ||
      b.status === 'arrived' ||
      b.status === 'completed'

    if (
      (exportType === 'all' || exportType === 'qualified') &&
      isQualified &&
      b.status !== 'cancelled'
    ) {
      exportRows.push({
        gclid,
        conversionName: convNameQualified,
        conversionTime: convTime,
        conversionValue: '0',
        conversionCurrency: 'COP',
        phoneNumber: phoneHashed,
        email: emailHashed,
        transactionId: `${b.id}-qualified`,
      })
    }

    // 2. Stage: Reserva Confirmada / Venta
    const isConverted = b.status === 'completed' && b.paymentStatus === 'paid'

    if ((exportType === 'all' || exportType === 'converted') && isConverted) {
      exportRows.push({
        gclid,
        conversionName: convNameConverted,
        conversionTime: convTime,
        conversionValue: String(b.priceCop || 0),
        conversionCurrency: 'COP',
        phoneNumber: phoneHashed,
        email: emailHashed,
        transactionId: `${b.id}-converted`,
      })
    }
  }

  const header = [
    'Google Click ID',
    'Conversion Name',
    'Conversion Time',
    'Conversion Value',
    'Conversion Currency',
    'Phone Number',
    'Email',
    'Transaction ID',
  ]

  const csvBody = exportRows.map(r =>
    [
      r.gclid,
      r.conversionName,
      r.conversionTime,
      r.conversionValue,
      r.conversionCurrency,
      r.phoneNumber,
      r.email,
      r.transactionId,
    ]
      .map(csvEscape)
      .join(','),
  )

  const csv = [header.join(','), ...csvBody].join('\r\n')
  const filename = `conversions-${exportType}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Rows-Count': String(exportRows.length),
    },
  })
}

export async function GET(req: NextRequest) {
  return handleExport(req)
}
