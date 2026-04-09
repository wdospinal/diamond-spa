import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import type { LedgerEntry } from '@/lib/ledger-types'
import { copPerUsd } from '@/lib/cop-rate'
import { INITIAL_EXPENSE_LINES } from '@/lib/ledger-initial-data'
import { todayKeyBogota } from '@/lib/income-stats'

const FILE = process.env.LEDGER_FILE ?? join(process.cwd(), 'data', 'ledger.json')
const SEED_FLAG = join(process.cwd(), 'data', '.seed-expenses-v1')

export function isLedgerSeedApplied(): boolean {
  return existsSync(SEED_FLAG)
}

function buildInitialExpenseRows(dateKey: string, rate: number): Omit<LedgerEntry, 'id' | 'createdAt'>[] {
  return INITIAL_EXPENSE_LINES.map(line => {
    const cop = line.amountCop ?? 0
    const usd = cop > 0 ? Math.round((cop / rate) * 100) / 100 : 0
    const parts = [line.title]
    if (line.detail) parts.push(line.detail)
    return {
      dateKey,
      kind: 'expense',
      amount: usd,
      categoryId: line.categoryId,
      amountCop: cop > 0 ? cop : undefined,
      note: parts.join(' — '),
    }
  })
}

/** Inserta gastos iniciales una sola vez (marca `data/.seed-expenses-v1`). */
export async function applyLedgerExpenseSeed(): Promise<{ inserted: number; skipped: boolean }> {
  if (existsSync(SEED_FLAG)) {
    return { inserted: 0, skipped: true }
  }
  await ensureDir()
  const rate = copPerUsd()
  const dateKey = todayKeyBogota()
  const rows = buildInitialExpenseRows(dateKey, rate)
  for (const row of rows) {
    await appendLedgerEntry(row)
  }
  await writeFile(SEED_FLAG, new Date().toISOString(), 'utf8')
  return { inserted: rows.length, skipped: false }
}

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
  patch: {
    kind: 'income' | 'expense'
    amount: number
    dateKey: string
    note?: string
    categoryId?: string | null
    amountCop?: number | null
  }
): Promise<LedgerEntry | null> {
  await ensureDir()
  const list = await readLedger()
  const i = list.findIndex(x => x.id === id)
  if (i === -1) return null

  const prev = list[i]!
  let categoryId: string | undefined
  let amountCop: number | undefined
  if (patch.kind === 'income') {
    categoryId = undefined
    amountCop = undefined
  } else {
    categoryId =
      patch.categoryId === null ? undefined : patch.categoryId ?? prev.categoryId
    amountCop = prev.amountCop
    if (patch.amountCop === null) amountCop = undefined
    else if (patch.amountCop !== undefined)
      amountCop = patch.amountCop > 0 ? patch.amountCop : undefined
  }

  const row: LedgerEntry = {
    ...prev,
    kind: patch.kind,
    amount: Math.round(patch.amount * 100) / 100,
    dateKey: patch.dateKey,
    note: patch.note?.trim() ? patch.note.trim() : undefined,
    categoryId,
    amountCop,
  }
  list[i] = row
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
  return row
}
