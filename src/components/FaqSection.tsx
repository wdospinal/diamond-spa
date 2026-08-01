import type { ResolvedFaqCategory } from '@/lib/faqs'

/**
 * Categorised FAQ accordion.
 *
 * Server component on purpose — it renders native <details>/<summary>, so the
 * questions expand with zero JavaScript and the answers stay in the static HTML
 * where crawlers can read them.
 */
export function FaqSection({
  categories,
  title,
  label,
  intro,
  className = 'py-32 px-6 md:px-12 bg-surface-container-low',
}: {
  categories: ResolvedFaqCategory[]
  title: string
  label?: string
  intro?: string
  className?: string
}) {
  return (
    <section className={className}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          {label && (
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">
              {label}
            </span>
          )}
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{title}</h2>
          <div className="h-px w-24 bg-primary mx-auto mt-8" />
          {intro && (
            <p className="font-body text-secondary leading-relaxed mt-8 max-w-xl mx-auto">
              {intro}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-16">
          {categories.map(({ id, icon, label: catLabel, items }) => (
            <div key={id}>
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="material-symbols-outlined text-primary text-xl shrink-0"
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <h3 className="font-label text-on-surface text-xs tracking-[0.25em] uppercase">
                  {catLabel}
                </h3>
                <span className="h-px flex-1 bg-outline-variant/20" aria-hidden="true" />
              </div>

              <div className="flex flex-col divide-y divide-outline-variant/20 border-t border-outline-variant/20">
                {items.map(({ question, answer }) => (
                  <details key={question} className="group py-5">
                    <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                      {question}
                      <span
                        className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform"
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </summary>
                    <p className="mt-4 text-secondary font-body text-sm leading-relaxed">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
