/**
 * Legal page body. A paragraph starting with "## " renders as a section
 * heading, so the dictionary can keep each policy as one ordered list.
 */
export default function LegalArticle({
  title,
  paragraphs,
  updated,
}: {
  title: string
  paragraphs: readonly string[]
  /** Already-localized "last updated" line, shown under the title. */
  updated?: string
}) {
  return (
    <article className="px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4">{title}</h1>
        {updated && <p className="font-label text-outline text-xs uppercase tracking-widest mb-10">{updated}</p>}
        <div className={`space-y-6 font-body text-secondary text-lg leading-relaxed ${updated ? '' : 'mt-10'}`}>
          {paragraphs.map((p) =>
            p.startsWith('## ') ? (
              <h2 key={p} className="font-headline text-2xl text-on-surface pt-4">{p.slice(3)}</h2>
            ) : (
              <p key={p}>{p}</p>
            ),
          )}
        </div>
      </div>
    </article>
  )
}
