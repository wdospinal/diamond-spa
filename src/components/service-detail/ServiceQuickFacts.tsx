import type { Locale } from '@/lib/i18n'
import type { QuickFact } from '@/lib/service-content'

/**
 * At-a-glance facts under the hero (duration, frequency, downtime, skin type).
 * Competing pages bury these in paragraphs; a scannable row answers the first
 * questions before the visitor scrolls.
 */
export function ServiceQuickFacts({ facts, price, locale }: { facts: QuickFact[]; price: string; locale: Locale }) {
  const items = [
    { icon: 'payments', label: locale === 'en' ? 'Price' : 'Precio', value: price },
    ...facts.map(f => ({ icon: f.icon, label: f.label[locale], value: f.value[locale] })),
  ]
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-outline-variant/20">
      {items.map(item => (
        <div key={item.label} className="bg-surface-container-low p-5 md:p-6 flex flex-col gap-2">
          <dt className="flex items-center gap-2 font-label text-outline text-[10px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </dt>
          <dd className="font-body text-on-surface text-sm md:text-base leading-snug">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
