import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  const { metaTitle: title, metaDesc: description } = t.history
  return {
    title,
    description,
    alternates: buildAlternates('/history'),
    openGraph: buildOpenGraph({ title, description, path: '/history', locale }),
  }
}

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMJt6gVTVOcc0SLCddvP7863h-3G97XDjh63aBjalz_oTlp8ClqkDtehoFnE47a2wt_n0r5LV4MuWsS483zQ0ZaeeIjUuH1IKmb_9q7MF_GUK3ONCFOjNKdonpAAY5Kgha5XDqKSoh1Hcf7qYeUraZVrSJRQtt1acSfjO7vh2cbe1jBwIs48ju40Zl0JXuHfISXPTkBu4v4TJupflDrpH7VdphBKpeYBsZDPssMRc_0oO5Ayuwe3k5iayBAJjqFLdB9Aur39XbUZDK'
const INTERIOR_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu7nA58in7biCj0013W2NJFHpMPUSX9srE_U6hc_uPTXg6kgHw9uwqj7pIAfqqZQynbSw05TioMo3Sguz2hawhGyDciZoFqC_h_7_TGww21-LZyrDPl1wDFOCUyIGHFmIh_h0uevJ2AQlHZZsdKs4klIh0JA3jIFSas6EssHhXhmjLJSWvqC_2fjkzsepld29rHXlWme-XNGQLBcj2OnkvEHyx6aO5Y9e7RziAvlphzuIVOKEAwO-mKxJRtcUVqCBZEsisOp2I04Ms'

export default function HistoryPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).history

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-end px-6 md:px-12 overflow-hidden bg-surface">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_IMG}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            aria-hidden
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        </div>
        <div className="max-w-screen-2xl mx-auto w-full z-10 pb-24 pt-40">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-9xl text-on-surface font-light leading-tight">
            {t.titleParts[0]}<br /><span className="italic text-primary">{t.titleParts[1]}</span>
          </h1>
        </div>
      </section>

      {/* STATS ROW */}
      <section className="bg-primary">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-3">
          {[
            { number: t.stat1Number, label: t.stat1Label },
            { number: t.stat2Number, label: t.stat2Label },
            { number: t.stat3Number, label: t.stat3Label },
          ].map(({ number, label }, i) => (
            <div key={i} className={`py-12 px-10 text-center ${i < 2 ? 'border-r border-on-primary/20' : ''}`}>
              <p className="font-headline text-3xl md:text-4xl text-on-primary mb-2">{number}</p>
              <p className="font-label text-on-primary/60 text-xs tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDING STORY */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.foundedLabel}</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-10 leading-tight">
              {t.foundedTitle}
            </h2>
            <p className="font-body text-secondary text-lg leading-relaxed">{t.foundedBody}</p>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
              <Image
                src={INTERIOR_IMG}
                alt="Diamond Spa interior"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover opacity-70"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 border border-primary/30 hidden md:block" />
          </div>
        </div>
      </section>

      {/* VISION / MOTIVATION */}
      <section className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.visionLabel}</span>
            <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-4">
              {t.visionTitle[0]}<br /><span className="italic text-primary">{t.visionTitle[1]}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-screen-2xl mx-auto">
            <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-8 block">psychology</span>
              <p className="font-body text-secondary text-lg leading-relaxed">{t.visionBody1}</p>
            </div>
            <div className="p-12 md:p-16">
              <span className="material-symbols-outlined text-primary text-3xl mb-8 block">verified</span>
              <p className="font-body text-secondary text-lg leading-relaxed">{t.visionBody2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONE / LOCATION */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          {/* Map embed */}
          <div className="overflow-hidden min-h-[400px]">
            <iframe
              src="https://maps.google.com/maps?q=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia&output=embed&z=16"
              width="100%"
              height="400"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diamond Spa location"
            />
          </div>
          <div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{t.milestoneLabel}</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-8 leading-tight">{t.milestoneTitle}</h2>
            <p className="font-body text-secondary text-lg leading-relaxed mb-10">{t.milestoneBody}</p>
            <div className="flex items-start gap-3 text-secondary">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">location_on</span>
              <span className="font-body text-sm">Cra 43C #10-42, El Poblado, Medellín</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">{t.ctaTitle}</h2>
          <p className="font-body text-secondary text-sm mb-12 leading-relaxed max-w-lg mx-auto">{t.ctaBody}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {t.bookSession}
            </Link>
            <Link href={`/${locale}/services`} className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300">
              {t.exploreServices}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
