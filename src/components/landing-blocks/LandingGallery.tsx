export function LandingGallery({
  title,
  subtitle,
  images
}: {
  title?: string
  subtitle?: string
  images: { url: string; title?: string }[] | string[]
}) {
  if (!images || images.length === 0) return null

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-4">
                {title}
              </h2>
            )}
            {title && subtitle && <div className="h-px w-12 bg-primary mx-auto mb-6" />}
            {subtitle && (
              <p className="text-secondary text-base max-w-2xl mx-auto leading-relaxed font-body">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${images.length >= 3 ? 'md:grid-cols-3' : ''} ${images.length >= 4 ? 'lg:grid-cols-4' : ''} gap-4`}>
          {images.map((img, idx) => {
            const src = typeof img === 'string' ? img : img.url
            const title = typeof img === 'string' ? undefined : img.title
            
            return (
              <div key={idx} className="relative aspect-[4/5] bg-surface-container rounded-sm overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={title || `Instalaciones Spa ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001524]/90 via-transparent to-transparent flex items-end p-6 pointer-events-none">
                    <h2 className="text-on-surface font-headline text-2xl font-light tracking-wide">{title}</h2>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
