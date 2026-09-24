import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { ServiceContent } from '@/lib/service-content'
import { formatCop, getServiceById } from '@/lib/services'
import { serviceFromPrice } from '@/lib/service-seo'
import { serviceHref } from '@/lib/routes'

/**
 * Side-by-side of related treatments. Prices come from `services.ts`, so the
 * table can never drift from the menu. The current service is highlighted and
 * the others link to their own detail pages.
 */
export function ServiceComparison({
  content,
  currentId,
  locale,
}: {
  content: ServiceContent['compare']
  currentId: string
  locale: Locale
}) {
  const rows = content.rows.flatMap(r => {
    const svc = getServiceById(r.serviceId)
    return svc ? [{ ...r, svc }] : []
  })
  const head = locale === 'en'
    ? ['Treatment', 'Price', 'Duration', 'Best for', 'Extraction', 'Downtime']
    : ['Tratamiento', 'Precio', 'Duración', 'Ideal para', 'Extracción', 'Recuperación']

  return (
    <section className="py-20 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-6">{content.title[locale]}</h2>
        <p className="font-body text-secondary leading-relaxed mb-10">{content.intro[locale]}</p>

        {/* Mobile: stacked cards */}
        <ul className="flex flex-col gap-4 md:hidden">
          {rows.map(({ svc, durationMin, bestFor, extraction, downtime }) => {
            const current = svc.id === currentId
            const values = [formatCop(serviceFromPrice(svc)), `${durationMin} min`, bestFor[locale], extraction[locale], downtime[locale]]
            return (
              <li key={svc.id} className={`bg-surface p-6 ${current ? 'border border-primary/60' : ''}`}>
                <h3 className="font-headline text-xl text-on-surface mb-4">
                  {current ? svc.name[locale] : <Link href={serviceHref(svc, locale)} className="hover:text-primary transition-colors">{svc.name[locale]}</Link>}
                </h3>
                <dl className="flex flex-col gap-2 text-sm">
                  {values.map((v, i) => (
                    <div key={head[i + 1]} className="flex justify-between gap-4">
                      <dt className="font-label text-outline text-[10px] uppercase tracking-widest pt-0.5 shrink-0">{head[i + 1]}</dt>
                      <dd className={`font-body text-right ${i === 0 ? 'text-primary tabular-nums' : 'text-secondary'}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            )
          })}
        </ul>

        {/* Desktop: table */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {head.map(h => (
                  <th key={h} scope="col" className="font-label text-outline text-[10px] uppercase tracking-widest font-normal py-4 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ svc, durationMin, bestFor, extraction, downtime }) => {
                const current = svc.id === currentId
                return (
                  <tr key={svc.id} className={`border-b border-outline-variant/20 ${current ? 'bg-surface' : ''}`}>
                    <th scope="row" className="font-headline text-on-surface text-lg font-normal py-5 pr-4 pl-3">
                      {current ? svc.name[locale] : <Link href={serviceHref(svc, locale)} className="hover:text-primary transition-colors underline-offset-4 hover:underline">{svc.name[locale]}</Link>}
                    </th>
                    <td className="font-body text-primary tabular-nums py-5 pr-4 whitespace-nowrap">{formatCop(serviceFromPrice(svc))}</td>
                    <td className="font-body text-secondary text-sm py-5 pr-4 whitespace-nowrap">{durationMin} min</td>
                    <td className="font-body text-secondary text-sm py-5 pr-4">{bestFor[locale]}</td>
                    <td className="font-body text-secondary text-sm py-5 pr-4">{extraction[locale]}</td>
                    <td className="font-body text-secondary text-sm py-5 pr-3">{downtime[locale]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
