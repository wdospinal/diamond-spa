/** Tasa COP por 1 USD (servidor y cliente). */
export function copPerUsd(): number {
  const n = Number(process.env.NEXT_PUBLIC_COP_PER_USD || process.env.COP_PER_USD)
  return Number.isFinite(n) && n > 0 ? n : 4100
}
