import { copPerUsd } from '@/lib/cop-rate'

const USD_FMT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const COP_FMT = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export function getCopPerUsd(): number {
  return copPerUsd()
}

export function usdToCop(usd: number): number {
  return Math.round(usd * getCopPerUsd())
}

export function formatUsd(usd: number): string {
  return USD_FMT.format(usd)
}

export function formatCopFromUsd(usd: number): string {
  return COP_FMT.format(usdToCop(usd))
}

export function formatCopValue(cop: number): string {
  return COP_FMT.format(cop)
}
