import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'

/** Numbered step-by-step of the session — an <ol> so the order is semantic. */
export function ServiceProtocol({ content, locale }: { content: ServiceContent['protocol']; locale: Locale }) {
  return (
    <section className="py-20 px-6 md:px-12 bg-surface">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-6">{content.title[locale]}</h2>
        <p className="font-body text-secondary leading-relaxed mb-12">{content.intro[locale]}</p>
        <ol className="flex flex-col">
          {content.steps.map((step, i) => (
            <li key={step.title[locale]} className="flex gap-4 pb-8 last:pb-0 relative">
              {i < content.steps.length - 1 && (
                <span className="absolute left-6 top-12 bottom-0 w-px bg-outline-variant/30" aria-hidden="true" />
              )}
              <span className="font-headline text-primary text-2xl tabular-nums w-12 h-12 shrink-0 flex items-center justify-center">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="pt-2.5 flex-1">
                <h3 className="font-label text-on-surface text-xs tracking-widest uppercase mb-2">{step.title[locale]}</h3>
                <p className="font-body text-secondary text-sm leading-relaxed">{step.body[locale]}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
