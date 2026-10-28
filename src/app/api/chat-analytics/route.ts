import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { analyzeChat } from '@/lib/chat-analytics'
import { readChatEvents } from '@/lib/chat-events-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOGOTA_DAY = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

function shiftDay(day: string, deltaDays: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

function enumerateDays(from: string, to: string): string[] {
  const out: string[] = []
  for (let d = from; d <= to && out.length < 120; d = shiftDay(d, 1)) out.push(d)
  return out
}

/**
 * Lectura del panel /admin/chatbot. Solo con sesión de admin (misma puerta que
 * /api/funnel): sin cookie válida responde 401 y el panel manda al login.
 *
 * Query: ?days=N (por defecto 30, máximo 90) o ?from=YYYY-MM-DD&to=YYYY-MM-DD.
 */
export async function GET(req: NextRequest) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const today = BOGOTA_DAY.format(new Date())

  let to = searchParams.get('to') ?? ''
  if (!DAY_RE.test(to)) to = today

  let from = searchParams.get('from') ?? ''
  if (!DAY_RE.test(from)) {
    const raw = parseInt(searchParams.get('days') ?? '30', 10)
    const days = Math.min(Math.max(Number.isFinite(raw) ? raw : 30, 1), 90)
    from = shiftDay(to, -(days - 1))
  }

  try {
    const rows = await readChatEvents(from, to)
    return NextResponse.json(analyzeChat(rows, { from, to, days: enumerateDays(from, to) }))
  } catch (err) {
    // Lo más común: la tabla chat_events todavía no existe (falta aplicar la migración 0017).
    const message = err instanceof Error ? err.message : String(err)
    console.error('chat-analytics: read failed', err)
    const missingTable = /chat_events/.test(message) && /(42P01|PGRST205|does not exist|schema cache)/i.test(message)
    return NextResponse.json(
      { error: missingTable ? 'missing_table' : 'store_unavailable' },
      { status: missingTable ? 424 : 503 },
    )
  }
}
