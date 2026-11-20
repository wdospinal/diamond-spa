import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { formatCop } from '@/lib/services'
import { type Plan, planMinutes, planPath, planPersons, planPrice } from '@/lib/planes'
import { planUi } from '@/components/planes/plan-ui'

/** One plan on the /planes hub and in "other plans" lists. */
export function PlanCard({ plan, locale }: { plan: Plan; locale: Locale }) {
  const t = planUi[locale]
  const min = planMinutes(plan)
  const persons = planPersons(plan)
  return (
    <Link
      href={`/${locale}${planPath(plan)}`}
      className="group bg-surface-container p-8 flex flex-col gap-4 hover:bg-surface-container-high transition-colors"
    >
      <span className="font-label text-primary text-[10px] uppercase tracking-[0.2em]">{plan.occasion[locale]}</span>
      <h3 className="font-headline text-2xl text-on-surface tracking-tighter group-hover:text-primary transition-colors">
        {plan.name[locale]}
      </h3>
      <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{plan.tagline[locale]}</p>
      <p className="flex flex-wrap gap-x-5 gap-y-2 font-label text-secondary text-xs tracking-widest">
        {min !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">schedule</span>
            {plan.sessions ? t.sessions(plan.sessions, min) : t.duration(min)}
          </span>
        )}
        {persons && (
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">person</span>
            {t.persons(persons)}
          </span>
        )}
      </p>
      <p className="border-t border-outline-variant/20 pt-4 flex items-baseline justify-between gap-4">
        <span className="font-headline text-primary text-2xl tabular-nums">{formatCop(planPrice(plan))}</span>
        <span className="font-label text-outline text-[10px] uppercase tracking-widest">{t.priceUnit(plan)}</span>
      </p>
    </Link>
  )
}
