import { getDict, type Locale } from '@/lib/i18n'
import MapEmbed from '@/components/MapEmbed'
import { PHONES } from '@/lib/phones'
import { SPA_ADDRESS, SPA_EMAIL, SPA_MAP_EMBED_SRC } from '@/lib/spa'

/** Address, phones, email, directions button and the lazy Google Map. */
export function LocationSection({ locale }: { locale: Locale }) {
  const t = getDict(locale).location
  const mapTitle = locale === 'es'
    ? `Mapa de Google con la ubicación de Diamond Spa en ${SPA_ADDRESS.full}`
    : `Google Map showing the location of Diamond Spa at ${SPA_ADDRESS.full}`

  return (
    <section className="py-20 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div>
          <div className="mb-12">
            <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">{SPA_ADDRESS.street}</p>
            <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic mt-4">{SPA_ADDRESS.neighborhood}</p>
            <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic">{SPA_ADDRESS.city}, {SPA_ADDRESS.region}</p>
          </div>
          <div className="flex flex-col gap-4 mb-8">
            {PHONES.map(({ display, wa }) => (
              <div key={wa} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">phone</span>
                <a
                  href={`tel:+${wa}`}
                  aria-label={locale === 'es' ? `Llamar al ${display}` : `Call ${display}`}
                  className="font-body text-secondary text-sm tracking-widest hover:text-primary transition-colors"
                >
                  {display}
                </a>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">mail</span>
              <a
                href={`mailto:${SPA_EMAIL}`}
                aria-label={locale === 'es' ? `Enviar correo a ${SPA_EMAIL}` : `Email ${SPA_EMAIL}`}
                className="font-body text-secondary text-sm tracking-widest hover:text-primary transition-colors"
              >
                {SPA_EMAIL}
              </a>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">directions</span>
            {t.getDirections}
          </a>
        </div>
        <div className="min-h-[460px] overflow-hidden">
          {/* MapEmbed defers Google Maps JS until the map scrolls into view,
              saving ~200 KB of third-party script from blocking TBT. */}
          <MapEmbed
            src={SPA_MAP_EMBED_SRC}
            title={mapTitle}
            height={460}
            style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
          />
        </div>
      </div>
    </section>
  )
}
