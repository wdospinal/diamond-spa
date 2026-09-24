import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'

export function ServiceAftercare({ content, locale }: { content: ServiceContent['aftercare']; locale: Locale }) {
  const columns = [
    { title: content.beforeTitle[locale], items: content.before[locale], icon: 'event' },
    { title: content.afterTitle[locale], items: content.after[locale], icon: 'spa' },
  ]
  return (
    <section className="py-20 px-6 md:px-12 bg-surface">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-12">{content.title[locale]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {columns.map(col => (
            <div key={col.title}>
              <h3 className="flex items-center gap-3 font-label text-on-surface text-xs tracking-widest uppercase mb-6">
                <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">{col.icon}</span>
                {col.title}
              </h3>
              <ul className="flex flex-col divide-y divide-outline-variant/20 border-t border-outline-variant/20">
                {col.items.map(item => (
                  <li key={item} className="py-4 font-body text-secondary text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
