export type BookingRecord = {
  id: string
  createdAt: string
  /** YYYY-MM-DD — session date as chosen on the calendar (Bogota-aligned reporting uses same civil dates). */
  dateKey: string
  timeSlot: string
  scheduledAt: string
  serviceId: string
  serviceName: string
  /** Duration in minutes (30, 60, or 90) — null for flat-rate and wax/machine services. */
  durationMinutes: number | null
  /** Wax or machine method — only present for hair-removal services. */
  hairMethod?: 'wax' | 'machine'
  /** COP amount charged per the price list. */
  priceCop: number
  /** USD equivalent at booking time (COP / rate) — used by dashboard stats. */
  price: number
  duration: string
  firstName: string
  lastName: string
  email: string
  phone: string
  requests?: string
}
