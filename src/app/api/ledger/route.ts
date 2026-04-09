import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendLedgerEntry, updateLedgerEntry } from '@/lib/ledger-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(req: NextRequest) {
  const token = cookies().get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('JSON inválido')
  }

  const kind = body.kind === 'income' || body.kind === 'expense' ? body.kind : null
  const amountRaw = typeof body.amount === 'number' ? body.amount : Number(body.amount)
  const dateKey = typeof body.dateKey === 'string' ? body.dateKey.trim() : ''
  const note = typeof body.note === 'string' ? body.note.trim() : ''

  if (!kind) return bad('Tipo inválido (income o expense)')
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) return bad('Monto debe ser mayor a 0')
  if (!DATE_KEY.test(dateKey)) return bad('Fecha inválida (use YYYY-MM-DD)')

  try {
    const row = await appendLedgerEntry({
      dateKey,
      kind,
      amount: Math.round(amountRaw * 100) / 100,
      note: note || undefined,
    })
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e) {
    console.error('ledger write failed', e)
    return NextResponse.json(
      { error: 'No se pudo guardar. En hosting sin disco persistente configure almacenamiento.' },
      { status: 503 }
    )
  }
}

function requireAuth() {
  const token = cookies().get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth()
  if (auth) return auth

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('JSON inválido')
  }

  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const kind = body.kind === 'income' || body.kind === 'expense' ? body.kind : null
  const amountRaw = typeof body.amount === 'number' ? body.amount : Number(body.amount)
  const dateKey = typeof body.dateKey === 'string' ? body.dateKey.trim() : ''
  const note = typeof body.note === 'string' ? body.note.trim() : ''

  if (!id) return bad('Falta el id del movimiento')
  if (!kind) return bad('Tipo inválido (income o expense)')
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) return bad('Monto debe ser mayor a 0')
  if (!DATE_KEY.test(dateKey)) return bad('Fecha inválida (use YYYY-MM-DD)')

  try {
    const row = await updateLedgerEntry(id, {
      kind,
      amount: Math.round(amountRaw * 100) / 100,
      dateKey,
      note: note || undefined,
    })
    if (!row) return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true, entry: row })
  } catch (e) {
    console.error('ledger update failed', e)
    return NextResponse.json(
      { error: 'No se pudo actualizar. En hosting sin disco persistente configure almacenamiento.' },
      { status: 503 }
    )
  }
}
