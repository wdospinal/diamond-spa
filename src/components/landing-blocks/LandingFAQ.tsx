'use client'

export function LandingFAQ({
  title,
  items
}: {
  title: string
  items: { question: string; answer: string }[]
}) {
  if (!items || items.length === 0) return null

  return (
    <section id="faq" className="py-24 bg-surface-container">
      <div className="max-w-screen-md mx-auto px-6 md:px-12">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-12 text-center">
          {title}
        </h2>

        <div className="flex flex-col divide-y divide-outline-variant/20">
          {items.map((faq, idx) => (
            <details key={idx} className="group py-6">
              <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                {faq.question}
                <span className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform" aria-hidden="true">
                  expand_more
                </span>
              </summary>
              <p className="mt-4 text-zinc-400 font-body text-sm leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
