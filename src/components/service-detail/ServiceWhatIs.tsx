import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'

export function ServiceWhatIs({ content, locale }: { content: ServiceContent['whatIs']; locale: Locale }) {
  return (
    <section className="py-20 px-6 md:px-12 bg-surface">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-8">{content.title[locale]}</h2>
        <div className="flex flex-col gap-5">
          {content.body[locale].map(p => (
            <p key={p} className="font-body text-secondary text-lg leading-relaxed">{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
