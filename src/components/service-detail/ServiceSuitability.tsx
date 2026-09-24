import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'

/** "Is it for me?" — who benefits vs. who should wait (contraindications). */
export function ServiceSuitability({ content, locale }: { content: ServiceContent['suitability']; locale: Locale }) {
  const columns = [
    { title: content.idealTitle[locale], items: content.ideal[locale], icon: 'check_circle', tone: 'text-primary' },
    { title: content.waitTitle[locale], items: content.wait[locale], icon: 'warning', tone: 'text-outline' },
  ]
  return (
    <section className="py-20 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-12">{content.title[locale]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map(col => (
            <div key={col.title} className="bg-surface p-7 md:p-8">
              <h3 className="font-label text-on-surface text-xs tracking-widest uppercase mb-6">{col.title}</h3>
              <ul className="flex flex-col gap-4">
                {col.items.map(item => (
                  <li key={item} className="flex items-start gap-3 font-body text-secondary text-sm leading-relaxed">
                    <span className={`material-symbols-outlined ${col.tone} text-lg shrink-0`} aria-hidden="true">{col.icon}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="font-body text-secondary text-sm leading-relaxed mt-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-lg shrink-0" aria-hidden="true">info</span>
          {content.note[locale]}
        </p>
      </div>
    </section>
  )
}
