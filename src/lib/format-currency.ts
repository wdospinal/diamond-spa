const DEFAULT_COP_PER_USD = 4100

export function getCopPerUsd(): number {
  const n = Number(process.env.NEXT_PUBLIC_COP_PER_USD)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_COP_PER_USD
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
