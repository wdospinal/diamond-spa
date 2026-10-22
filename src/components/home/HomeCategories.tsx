import Image from 'next/image'
import Link from 'next/link'
import { getDict, type Locale } from '@/lib/i18n'
import { IMG_DEEP_TISSUE, IMG_FACIAL, IMG_RELAXATION } from '@/lib/images'
import { getServiceById } from '@/lib/services'
import { serviceHref } from '@/lib/routes'
import { SERVICE_DETAIL_FROM_HOME } from '@/lib/service-detail-nav'
import { ServiceCardLink } from '@/components/ServiceCardLink'

// The three original category cards of the home, with their photos, exactly as
// they were before the home rebuild: hair removal, Hidrafacial and relaxing.
const FEATURED_SERVICES = {
  deepTissue: getServiceById('depilacion-cuerpo-completo')!,
  facial: getServiceById('hidrafacial')!,
  sensitive: getServiceById('sensitive')!,
}

export function HomeCategories({ locale }: { locale: Locale }) {
  const h = getDict(locale).home
  const deepTissueDesc = locale === 'en' ? FEATURED_SERVICES.deepTissue.shortDesc.en : FEATURED_SERVICES.deepTissue.shortDesc.es
  const facialDesc = locale === 'en' ? FEATURED_SERVICES.facial.shortDesc.en : FEATURED_SERVICES.facial.shortDesc.es
  const sensitiveDesc = locale === 'en' ? FEATURED_SERVICES.sensitive.shortDesc.en : FEATURED_SERVICES.sensitive.shortDesc.es
  return (
    <section className="py-28 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{h.section2Title}</h2>
            <p className="mt-4 font-body text-secondary max-w-lg leading-relaxed font-light">{h.section2Body}</p>
            <Link href={`/${locale}/masajes-para-hombres`} className="mt-4 inline-flex items-center gap-1 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all">
              {locale === 'es' ? 'Masajes para hombres en Medellín' : 'Massages for men in Medellín'} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative group min-h-[480px] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
            <Image
              src={IMG_DEEP_TISSUE}
              alt={locale === 'es'
                ? 'Cosmetóloga extendiendo cera caliente con espátula sobre la pierna durante una depilación en Diamond Spa'
                : 'Cosmetologist spreading warm wax on a leg with a spatula during a waxing session at Diamond Spa'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover img-hover-color"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 z-10">
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.care}</span>
              <h3 className="font-headline text-3xl text-on-surface mb-3">{h.hairRemovalTitle}</h3>
              <p className="font-body text-secondary text-sm max-w-md leading-relaxed mb-5">{deepTissueDesc}</p>
              <ServiceCardLink href={serviceHref(FEATURED_SERVICES.deepTissue, locale)} from={SERVICE_DETAIL_FROM_HOME} aria-label={locale === 'es' ? `Ver detalles: ${h.hairRemovalTitle}` : `View details: ${h.hairRemovalTitle}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
              </ServiceCardLink>
            </div>
          </div>
          <div className="md:col-span-6 relative group min-h-[480px] overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
            <Image
              src={IMG_FACIAL}
              alt={locale === 'es'
                ? 'Cosmetóloga aplicando con pincel una mascarilla facial verde a un hombre durante un tratamiento facial'
                : 'Cosmetologist brushing a green facial mask onto a man during a facial treatment'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top img-hover-color"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 z-10">
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.treatments}</span>
              <h3 className="font-headline text-3xl text-on-surface mb-3">{h.facialTitle}</h3>
              <p className="font-body text-secondary text-sm max-w-md leading-relaxed mb-5">{facialDesc}</p>
              <ServiceCardLink href={serviceHref(FEATURED_SERVICES.facial, locale)} from={SERVICE_DETAIL_FROM_HOME} aria-label={locale === 'es' ? `Ver detalles: ${h.facialTitle}` : `View details: ${h.facialTitle}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
              </ServiceCardLink>
            </div>
          </div>
          <div className="md:col-span-12 relative flex min-h-[480px] items-center overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10 group">
            <Image
              src={IMG_RELAXATION}
              alt={locale === 'es'
                ? 'Terapeuta pasando una pluma blanca sobre el pecho de un hombre durante un masaje sensitivo en Diamond Spa'
                : 'Therapist gliding a white feather over a man’s chest during a sensitive massage at Diamond Spa'}
              fill
              quality={65}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1536px"
              className="object-cover img-hover-color"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container/70 to-transparent" />
            <div className="relative z-10 p-10 max-w-2xl">
              <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.relaxLabel}</span>
              <h3 className="font-headline text-3xl text-on-surface mb-3">{h.relaxTitle}</h3>
              <p className="font-body text-secondary text-sm leading-relaxed mb-5">{sensitiveDesc}</p>
              <ServiceCardLink href={serviceHref(FEATURED_SERVICES.sensitive, locale)} from={SERVICE_DETAIL_FROM_HOME} aria-label={locale === 'es' ? `Ver detalles: ${h.relaxTitle}` : `View details: ${h.relaxTitle}`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                {h.viewDetails} <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
              </ServiceCardLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
