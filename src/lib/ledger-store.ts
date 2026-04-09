import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import type { LedgerEntry } from '@/lib/ledger-types'

const FILE = process.env.LEDGER_FILE ?? join(process.cwd(), 'data', 'ledger.json')

async function ensureDir() {
  await mkdir(dirname(FILE), { recursive: true })
}

export async function readLedger(): Promise<LedgerEntry[]> {
  try {
    const raw = await readFile(FILE, 'utf8')
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data as LedgerEntry[]
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'ENOENT') return []
    throw e
  }
}

export async function appendLedgerEntry(
  input: Omit<LedgerEntry, 'id' | 'createdAt'>
): Promise<LedgerEntry> {
  await ensureDir()
  const list = await readLedger()
  const row: LedgerEntry = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  list.push(row)
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
  return row
}

export async function updateLedgerEntry(
  id: string,
  patch: { kind: 'income' | 'expense'; amount: number; dateKey: string; note?: string }
): Promise<LedgerEntry | null> {
  await ensureDir()
  const list = await readLedger()
  const i = list.findIndex(x => x.id === id)
  if (i === -1) return null

  const prev = list[i]!
  const row: LedgerEntry = {
    ...prev,
    kind: patch.kind,
    amount: Math.round(patch.amount * 100) / 100,
    dateKey: patch.dateKey,
    note: patch.note?.trim() ? patch.note.trim() : undefined,
  }
  list[i] = row
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
  return row
}
