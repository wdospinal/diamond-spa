import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { getLandingById, deleteLanding } from '@/lib/landing-store'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function isAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value
  return verifySessionToken(token)
}

// GET /api/landings/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized()
  const { id } = await params
  const page = await getLandingById(id)
  if (!page) return notFound()
  return NextResponse.json({ page })
}

// DELETE /api/landings/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized()
  const { id } = await params
  const page = await getLandingById(id)
  if (!page) return notFound()
  await deleteLanding(id)
  return NextResponse.json({ ok: true })
}
