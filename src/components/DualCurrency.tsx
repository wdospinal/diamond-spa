'use client'

import { formatCopFromUsd, formatUsd } from '@/lib/format-currency'

type Tone = 'default' | 'muted' | 'income' | 'expense' | 'netPositive' | 'netNegative'

const usdTone: Record<Tone, string> = {
  default: 'text-[#cfe5fa]',
  muted: 'text-[#cfe5fa]/80',
  income: 'text-[#a5cce6]',
  expense: 'text-[#e8b4a4]',
  netPositive: 'text-[#a5cce6]',
  netNegative: 'text-[#ffb4ab]',
}

export default function DualCurrency({
  usd,
  align = 'right',
  tone = 'default',
  prominent = false,
}: {
  usd: number
  align?: 'left' | 'right'
  tone?: Tone
  prominent?: boolean
}) {
  return (
    <div className={`leading-snug tabular-nums ${align === 'right' ? 'text-right' : ''}`}>
      <div
        className={`font-medium ${prominent ? 'text-xl font-headline' : 'text-sm'} ${usdTone[tone]}`}
      >
        {formatUsd(usd)} <span className="text-[10px] font-normal text-[#8a9299]">USD</span>
      </div>
      <div className={`text-[#8a9299] mt-0.5 ${prominent ? 'text-sm' : 'text-xs'}`}>
        {formatCopFromUsd(usd)} <span className="text-[10px]">COP</span>
      </div>
    </div>
  )
}
