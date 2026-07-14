export function LandingWhyUs({
  title,
  pillars
}: {
  title: string
  pillars: { icon: string; title: string; body: string }[]
}) {
  return (
    <section id="por-que-nosotros" className="py-24 bg-surface-container scroll-mt-16">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-16 text-center">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="font-headline text-primary text-4xl mb-2 opacity-50">
                0{idx + 1}
              </div>
              <h3 className="font-headline text-xl text-on-surface tracking-tighter flex items-center gap-2">
                {/* Opcional: mostrar ícono de material-symbols si es necesario */}
                {pillar.title}
              </h3>
              <p className="text-zinc-400 font-body text-sm leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
