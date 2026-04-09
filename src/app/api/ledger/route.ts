import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { appendLedgerEntry, deleteLedgerEntry, updateLedgerEntry } from '@/lib/ledger-store'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { EXPENSE_CATEGORIES } from '@/lib/expense-categories'

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

function parseCategoryId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const id = raw.trim()
  if (!id) return undefined
  if (!EXPENSE_CATEGORIES.some(c => c.id === id)) return undefined
  return id
}

function parseAmountCop(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return n > 0 ? Math.round(n) : undefined
}

function validateAmount(kind: 'income' | 'expense', amountRaw: number): string | null {
  if (!Number.isFinite(amountRaw)) return 'Monto inválido'
  if (kind === 'income') {
    if (amountRaw <= 0) return 'Los ingresos deben ser mayores a 0'
  } else {
    if (amountRaw < 0) return 'El monto no puede ser negativo'
  }
  return null
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
  const categoryId = parseCategoryId(body.categoryId)
  const amountCop = parseAmountCop(body.amountCop)

  if (!kind) return bad('Tipo inválido (income o expense)')
  const amtErr = validateAmount(kind, amountRaw)
  if (amtErr) return bad(amtErr)
  if (!DATE_KEY.test(dateKey)) return bad('Fecha inválida (use YYYY-MM-DD)')
  if (kind === 'income' && categoryId) return bad('Las categorías solo aplican a gastos')

  try {
    const row = await appendLedgerEntry({
      dateKey,
      kind,
      amount: Math.round(amountRaw * 100) / 100,
      note: note || undefined,
      categoryId: kind === 'expense' ? categoryId : undefined,
      amountCop: kind === 'expense' ? amountCop : undefined,
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
  const categoryId = parseCategoryId(body.categoryId)
  const amountCop = parseAmountCop(body.amountCop)
  const clearCategory = body.categoryId === null || body.categoryId === ''
  const clearAmountCop = body.amountCop === null

  if (!id) return bad('Falta el id del movimiento')
  if (!kind) return bad('Tipo inválido (income o expense)')
  const amtErr = validateAmount(kind, amountRaw)
  if (amtErr) return bad(amtErr)
  if (!DATE_KEY.test(dateKey)) return bad('Fecha inválida (use YYYY-MM-DD)')
  if (kind === 'income' && categoryId) return bad('Las categorías solo aplican a gastos')

  try {
    const row = await updateLedgerEntry(id, {
      kind,
      amount: Math.round(amountRaw * 100) / 100,
      dateKey,
      note: note || undefined,
      categoryId:
        kind === 'expense' ? (clearCategory ? null : categoryId ?? undefined) : null,
      amountCop:
        kind === 'expense'
          ? clearAmountCop
            ? null
            : amountCop !== undefined
              ? amountCop
              : undefined
          : null,
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

export async function DELETE(req: NextRequest) {
  const auth = requireAuth()
  if (auth) return auth

  let id = req.nextUrl.searchParams.get('id')?.trim() ?? ''
  if (!id) {
    try {
      const body = (await req.json()) as { id?: string }
      if (typeof body.id === 'string') id = body.id.trim()
    } catch {
      /* query only */
    }
  }
  if (!id) return bad('Falta el id del movimiento')

  try {
    const ok = await deleteLedgerEntry(id)
    if (!ok) return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('ledger delete failed', e)
    return NextResponse.json(
      { error: 'No se pudo eliminar. En hosting sin disco persistente configure almacenamiento.' },
      { status: 503 }
    )
  }
}
