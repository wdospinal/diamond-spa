import { NextRequest, NextResponse } from 'next/server'
import { addSubscription } from '@/lib/push-store'
import { verifySessionToken, adminCookieName } from '@/lib/admin-session'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || !body.endpoint || !body.keys) {
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 })
  }

  await addSubscription(body)

  return NextResponse.json({ ok: true })
}
