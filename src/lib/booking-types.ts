export type BookingRecord = {
  id: string
  createdAt: string
  /** YYYY-MM-DD — session date as chosen on the calendar (Bogota-aligned reporting uses same civil dates). */
  dateKey: string
  timeSlot: string
  scheduledAt: string
  serviceId: string
  serviceName: string
  price: number
  duration: string
  firstName: string
  lastName: string
  email: string
  phone: string
  requests?: string
}
