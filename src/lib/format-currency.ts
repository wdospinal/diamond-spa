import { copPerUsd } from '@/lib/cop-rate'

export function getCopPerUsd(): number {
  return copPerUsd()
}

export function usdToCop(usd: number): number {
  return Math.round(usd * getCopPerUsd())
}

export function formatUsd(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd)
}

export function formatCopFromUsd(usd: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(usdToCop(usd))
}

export function formatCopValue(cop: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cop)
}
