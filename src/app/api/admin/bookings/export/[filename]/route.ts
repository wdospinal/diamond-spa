import { NextRequest } from 'next/server'
import { handleExport } from '../route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  let explicitType: string | undefined = undefined

  if (filename.includes('qualified')) explicitType = 'qualified'
  else if (filename.includes('converted')) explicitType = 'converted'
  else if (filename.includes('all')) explicitType = 'all'

  return handleExport(req, explicitType)
}
