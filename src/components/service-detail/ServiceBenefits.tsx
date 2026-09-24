import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'

export function ServiceBenefits({ content, locale }: { content: ServiceContent['benefits']; locale: Locale }) {
  return (
    <section className="py-20 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-12">{content.title[locale]}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.items.map(b => (
            <li key={b.title[locale]} className="bg-surface p-7 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">{b.icon}</span>
              <h3 className="font-label text-on-surface text-xs tracking-widest uppercase">{b.title[locale]}</h3>
              <p className="font-body text-secondary text-sm leading-relaxed">{b.body[locale]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
