/**
 * Movimientos de caja para /admin/caja. Admin-only, igual que /api/bold.
 *
 * GET  ?from=YYYY-MM-DD&to=YYYY-MM-DD  → movimientos del rango + totales.
 *      Sin rango, el mes en curso.
 * POST                                 → alta manual (lo que no llegó por WhatsApp).
 */

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { currentAdminUser } from '@/lib/admin-guard'
import { bogotaDay, monthStart } from '@/lib/bogota'
import { summarize } from '@/lib/cash-summary'
import { readEntries, saveEntries } from '@/lib/ledger-store'
import type { LedgerEntry, LedgerKind } from '@/lib/ledger-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY = /^\d{4}-\d{2}-\d{2}$/

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = bogotaDay()
  const from = req.nextUrl.searchParams.get('from') ?? monthStart(today)
  const to = req.nextUrl.searchParams.get('to') ?? today

  if (!DAY.test(from) || !DAY.test(to) || from > to) {
    return NextResponse.json({ error: 'Rango de fechas inválido' }, { status: 400 })
  }

  const entries = await readEntries(from, to)
  return NextResponse.json({ from, to, entries, summary: summarize(entries) })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const kind: LedgerKind = body.kind === 'expense' ? 'expense' : 'income'
  const amountCop = Math.round(Number(body.amountCop) || 0)
  const day = typeof body.day === 'string' && DAY.test(body.day) ? body.day : bogotaDay()

  if (amountCop < 0) {
    return NextResponse.json({ error: 'El monto no puede ser negativo' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const entry: LedgerEntry = {
    id: `manual:${randomUUID()}`,
    day,
    occurredAt: now,
    kind,
    amountCop,
    channel: body.channel === 'cash' ? 'cash' : 'transfer',
    categoryId: typeof body.categoryId === 'string' ? body.categoryId : 'other',
    serviceId: typeof body.serviceId === 'string' ? body.serviceId : null,
    serviceLabel: typeof body.serviceLabel === 'string' ? body.serviceLabel : null,
    durationMinutes: Number(body.durationMinutes) || null,
    quantity: Math.max(1, Math.round(Number(body.quantity) || 1)),
    therapist: typeof body.therapist === 'string' && body.therapist ? body.therapist : null,
    note: typeof body.note === 'string' ? body.note : '',
    source: 'manual',
    author: (await currentAdminUser()) ?? 'admin',
    mediaId: null,
    // Un alta manual sin monto se comporta igual que una de WhatsApp: no suma.
    status: amountCop > 0 ? 'active' : 'needs_amount',
    confidence: 'high',
    pendingField: null,
    promptWamid: null,
    createdAt: now,
    updatedAt: now,
  }

  await saveEntries([entry])
  return NextResponse.json({ ok: true, entry })
}
