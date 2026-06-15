/**
 * Sales-funnel stage registry — the single source of truth shared by the drain
 * webhook (event → stage mapping), the read API (labels), and the admin
 * dashboard (order + colors). Pure constants only: NO node/server imports, so
 * this is safe to import from the client dashboard.
 *
 * Funnel maps to the classic AIDA model:
 *   Awareness → Interest → Desire → Action → (Contact)
 */

export type FunnelStageKey =
  | 'visit'
  | 'service_view'
  | 'booking_start'
  | 'booking_submit'
  | 'whatsapp_open'

export interface FunnelStageDef {
  key: FunnelStageKey
  /** Spanish label shown in the admin dashboard. */
  label: string
  /** AIDA phase, shown as a small caption. */
  phase: string
  /** Bar color (hex) — AIDA palette from green → blue, WhatsApp green for contact. */
  color: string
}

export const FUNNEL_STAGES: FunnelStageDef[] = [
  { key: 'visit',          label: 'Visitas al sitio',  phase: 'Awareness', color: '#6cbf6c' },
  { key: 'service_view',   label: 'Vio un servicio',   phase: 'Interest',  color: '#e8a33d' },
  { key: 'booking_start',  label: 'Inició reserva',    phase: 'Desire',    color: '#e57350' },
  { key: 'booking_submit', label: 'Reserva enviada',   phase: 'Action',    color: '#3aa0c9' },
  { key: 'whatsapp_open',  label: 'Abrió WhatsApp',    phase: 'Contacto',  color: '#25D366' },
]

export const FUNNEL_STAGE_KEYS: FunnelStageKey[] = FUNNEL_STAGES.map(s => s.key)

/**
 * Maps the custom analytics event names (see src/lib/events.ts) to funnel
 * stages. Pageviews are handled separately by the webhook (they map to `visit`
 * and are delivered automatically by the drain, no custom event needed).
 */
export const EVENT_NAME_TO_STAGE: Record<string, FunnelStageKey> = {
  service_detail_viewed: 'service_view',
  booking_started:       'booking_start',
  booking_submitted:     'booking_submit',
  whatsapp_clicked:      'whatsapp_open',
}
