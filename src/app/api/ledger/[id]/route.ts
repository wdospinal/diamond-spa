/**
 * Corregir o anular un movimiento. Admin-only.
 *
 * Es la contraparte de «todo entra automático»: lo que el parser interpretó mal
 * se arregla acá, sin tener que volver a mandar el comprobante.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { updateEntry, voidEntry, type LedgerPatch } from '@/lib/ledger-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY = /^\d{4}-\d{2}-\d{2}$/

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const patch: LedgerPatch = {}

  if (body.kind === 'income' || body.kind === 'expense') patch.kind = body.kind
  if (typeof body.categoryId === 'string') patch.categoryId = body.categoryId
  if (typeof body.therapist === 'string') patch.therapist = body.therapist || null
  if (typeof body.serviceId === 'string') patch.serviceId = body.serviceId || null
  if (typeof body.serviceLabel === 'string') patch.serviceLabel = body.serviceLabel || null
  if (body.channel === 'transfer' || body.channel === 'cash') patch.channel = body.channel
  if (typeof body.day === 'string' && DAY.test(body.day)) patch.day = body.day

  if (body.durationMinutes !== undefined) {
    const n = Number(body.durationMinutes)
    patch.durationMinutes = Number.isFinite(n) && n > 0 ? Math.round(n) : null
  }

  if (body.quantity !== undefined) {
    const n = Math.round(Number(body.quantity))
    if (!Number.isFinite(n) || n < 1) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 })
    }
    patch.quantity = n
  }

  // Confirmar el monto es lo que saca al movimiento de `needs_amount` y lo hace
  // sumar. Se hacen juntos a propósito: son el mismo gesto.
  if (body.amountCop !== undefined) {
    const n = Math.round(Number(body.amountCop))
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }
    patch.amountCop = n
    patch.status = n > 0 ? 'active' : 'needs_amount'
    patch.pendingField = null
    patch.promptWamid = null
  }

  if (body.status === 'active' || body.status === 'needs_amount' || body.status === 'void') {
    patch.status = body.status
  }

  const updated = await updateEntry((await params).id, patch)
  if (!updated) return NextResponse.json({ error: 'No existe' }, { status: 404 })
  return NextResponse.json({ ok: true, entry: updated })
}

/** No borra: marca como anulado, para no perder el rastro del comprobante. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const updated = await voidEntry((await params).id)
  if (!updated) return NextResponse.json({ error: 'No existe' }, { status: 404 })
  return NextResponse.json({ ok: true, entry: updated })
}
