import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { randomUUID } from 'crypto'
import type { BookingRecord } from '@/lib/booking-types'

const FILE = process.env.BOOKINGS_FILE ?? join(process.cwd(), 'data', 'bookings.json')

async function ensureDir() {
  await mkdir(dirname(FILE), { recursive: true })
}

export async function readBookings(): Promise<BookingRecord[]> {
  try {
    const raw = await readFile(FILE, 'utf8')
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data as BookingRecord[]
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'ENOENT') return []
    throw e
  }
}

export async function appendBooking(
  input: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<BookingRecord> {
  await ensureDir()
  const list = await readBookings()
  const row: BookingRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  list.push(row)
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
  return row
}
