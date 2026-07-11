export function LandingLocation({
  address,
  hours,
  mapEmbedUrl,
  locale = 'es'
}: {
  address: string
  hours: string
  mapEmbedUrl: string
  locale?: 'es' | 'en'
}) {
  const t = {
    heading:  locale === 'en' ? 'Find us in El Poblado'   : 'Encuéntranos en El Poblado',
    address:  locale === 'en' ? 'Address'                  : 'Dirección',
    hours:    locale === 'en' ? 'Hours'                    : 'Horario',
    getHere:  locale === 'en' ? 'Get directions'           : 'Cómo llegar',
  }
  return (
    <section id="ubicacion" className="py-24 bg-surface scroll-mt-16 border-t border-outline-variant/10">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter">
              {t.heading}
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <div>
                  <h3 className="font-label text-sm uppercase tracking-widest text-zinc-400 mb-2">{t.address}</h3>
                  <p className="text-on-surface font-body leading-relaxed">{address}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                <div>
                  <h3 className="font-label text-sm uppercase tracking-widest text-zinc-400 mb-2">{t.hours}</h3>
                  <p className="text-on-surface font-body leading-relaxed whitespace-pre-line">{hours}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <a 
                href="https://maps.app.goo.gl/EjempLoParaElPoblado" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block border border-outline-variant text-on-surface font-label text-sm tracking-widest uppercase px-8 py-4 rounded-sm hover:bg-surface-container transition-colors"
                >
                  {t.getHere}
                </a>
            </div>
          </div>

          <div className="order-1 lg:order-2 aspect-square lg:aspect-[4/3] bg-surface-container w-full relative">
            <iframe 
              src={mapEmbedUrl} 
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
