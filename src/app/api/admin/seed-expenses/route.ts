import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { applyLedgerExpenseSeed } from '@/lib/ledger-store'

export async function POST() {
  const token = cookies().get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await applyLedgerExpenseSeed()
    return NextResponse.json(result)
  } catch (e) {
    console.error('seed expenses failed', e)
    return NextResponse.json({ error: 'No se pudieron cargar los gastos iniciales' }, { status: 503 })
  }
}
