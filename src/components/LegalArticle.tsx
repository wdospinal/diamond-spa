export default function LegalArticle({
  title,
  paragraphs,
}: {
  title: string
  paragraphs: readonly string[]
}) {
  return (
    <article className="px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-10">{title}</h1>
        <div className="space-y-6 font-body text-secondary text-lg leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
