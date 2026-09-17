import Link from 'next/link'
import { type Locale } from '@/lib/i18n'
import { getHairRemovalServices, formatCop, serviceShortDesc, type ServiceDef } from '@/lib/services'
import { DEPILACION_GENDER_SEO, type DepilacionGender } from '@/lib/depilacion-gender'

export default function DepilacionGenderPage({
  locale,
  gender,
}: {
  locale: Locale
  gender: DepilacionGender
}) {
  const isEn = locale === 'en'
  const seo = DEPILACION_GENDER_SEO[gender]
  const services = getHairRemovalServices()

  return (
    <>
      <header className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[color:var(--color-surface-container)] to-[color:var(--color-surface)]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            Diamond Spa — El Poblado
          </p>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface font-light leading-none mb-6">
            {seo.h1[locale]}
          </h1>
          <p className="text-on-surface/60 text-lg max-w-xl leading-relaxed">
            {seo.intro[locale]}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 pb-32 pt-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <article
              key={service.id}
              className="group flex flex-col bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 p-6"
            >
              <Link href={`/${locale}/services/${service.id}`} className="flex flex-col flex-1">
                <h2 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors duration-200 leading-tight mb-3">
                  {isEn ? service.name.en : service.name.es}
                </h2>
                <p className="text-on-surface/50 text-sm leading-relaxed flex-1">
                  {serviceShortDesc(service, locale)}
                </p>
                <span className="mt-4 font-headline text-primary text-lg tabular-nums">
                  {formatCop((service as ServiceDef & { pricingModel: 'wax-machine'; waxPrice: number }).waxPrice)}
                </span>
                <span className="mt-4 inline-flex items-center gap-2 font-label text-[10px] tracking-[0.2em] uppercase text-primary/60 group-hover:text-primary transition-colors">
                  {isEn ? 'View details' : 'Ver detalles'}
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
