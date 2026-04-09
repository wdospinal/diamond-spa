import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'

const DEEP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4TLgQEAJhMmHRcBiuKsxNpSZmN3_4KIid1fDSZbEr_X_qUEklAvU71y95lrzrua7R9eMETC3MxquRHr5uaMHs2ruFpONqsDW9stQ0I2NrQ0KGhRWNW6WZsVjLB80sqxl4x6nH55tDQni_sqla9RNdXaC7Zy0CvU2BayQTQfZondAPM9-9_eW6nJuhgjjE70qM4DlrUpct4QqC5-XaKMxgPrJIEageTO_hFE7CoTdnvrX-DXGgHKHTJEL8QPvuwNVYgNZH7rOCP1A4'
const RELAX_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbS-K-jnnLmzmUa6oia4LgPSOU9ymOYsO5sGsiCBFyWAwcA_WMyqzZYLSoQXl0aSQWrJbGE_piHfbwK6I0FzjUXVmffmhQw1dy3kMqWuR0ZXffAmVkGB25McjAZ-o5O-RueQwwfSZ4NcQ55nusS4MTxcdQ9tVU6X0mPrs2CJOnLNZhO6VqTQ3zhiBz99204KWeXI9fYdRDFFPIqnPLo2jjJO-WlpLSfPGWE2VDl2fqOGDiFJu0uUYXKGJQoHaMbr7BkmzAnKmRpV-w'
const SKIN1_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR-nsOvHmHpT_Qg3ZFMuCBnmhHWOxLkBTwm7zQfb7_y0_DmwPabW2NqBVv1419NE-rjb8n8TFEyWCoi-Dhh2_R9RG6BHxkRiSxOPPDEDAjmTssalykJHil_jl2XvR-TZBATL6ECGA_DwyLeA1bCC1AtgnDSFYL_eRmtlUdOtlRm11BtzDaDn2CTMzspp3JRblnSVCABPYeG0uVp2PV5E1MZ9FoL9dr3c1Uq-CfT0jQojp2gbbKrIRCS1t0Vn7w5fE-TM51T-wJji5R'
const SKIN2_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7VHiRlBlZil1gotLZ9v49B1bjjg-_FCTYNxKj85Hx7Z0fezD2vu9rKd_yHep8VzZ9oa2ayB6XqNzjF78HC2RfCHVqwrxCJPBwCE-DTVQ-CDYLcJT62gef7EMJRprKYi9eo2hZ0qv3HvhhSwLallM5IN_BCcNUJ12wDuK4hmpSsGNDVhuZshxoBuJIPVvetDvhq7cqBPi97YGWQiCLVZlJg5Gb0su4kATn1wczDuB6EsyTXFGC1M9ZwRrFLwu5z7D-0_v7V2CvZ8oz'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  const t = getDict(locale)
  return { title: t.services.metaTitle, description: t.services.metaDesc }
}

export default function ServicesPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale).services

  return (
    <>
      {/* HERO */}
      <header className="pt-40 pb-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto max-w-4xl">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-5 block">{t.label}</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">{t.title}</h1>
          <p className="mt-8 text-on-surface-variant text-lg max-w-xl font-light leading-relaxed">{t.subtitle}</p>
        </div>
      </header>

      {/* Deep Tissue */}
      <section className="py-20 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 relative group overflow-hidden">
            <div className="absolute inset-0 bg-surface-container/20 group-hover:bg-transparent transition-all duration-700 z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEEP_IMG} alt="Deep Tissue Massage" className="w-full aspect-video object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 lg:pl-8">
            <span className="text-tertiary font-label text-xs uppercase tracking-[0.4em] mb-4 block">{t.deepTissueCat}</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">{t.deepTissueTitle}</h2>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl font-light text-primary">$180</span>
              <span className="w-1.5 h-1.5 bg-outline-variant rounded-full" />
              <span className="text-sm font-label uppercase tracking-widest text-on-surface-variant">{t.deepTissueDuration}</span>
            </div>
            <p className="text-on-surface-variant mb-10 leading-relaxed font-light">{t.deepTissueBody}</p>
            <div className="flex flex-col gap-5">
              <Link href={`/${locale}/book`} className="w-fit bg-primary text-on-primary px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
                {t.bookSession}
              </Link>
              <div className="flex items-center gap-2 text-outline text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {t.deepTissueInclude}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relaxation */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 lg:pr-8">
              <span className="text-tertiary font-label text-xs uppercase tracking-[0.4em] mb-4 block">{t.relaxCat}</span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">{t.relaxTitle}</h2>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl font-light text-primary">$150</span>
                <span className="w-1.5 h-1.5 bg-outline-variant rounded-full" />
                <span className="text-sm font-label uppercase tracking-widest text-on-surface-variant">{t.relaxDuration}</span>
              </div>
              <p className="text-on-surface-variant mb-10 leading-relaxed font-light">{t.relaxBody}</p>
              <Link href={`/${locale}/book`} className="w-fit border border-outline-variant text-on-surface px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-surface-bright transition-all">
                {t.bookSession}
              </Link>
            </div>
            <div className="lg:col-span-7 relative group overflow-hidden">
              <div className="absolute inset-0 bg-surface-container/20 group-hover:bg-transparent transition-all duration-700 z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RELAX_IMG} alt="Relaxation Massage" className="w-full aspect-video object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Facial */}
      <section className="py-20 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SKIN1_IMG} alt="Skincare" className="w-full h-80 object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-700" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SKIN2_IMG} alt="Facial Treatment" className="w-full h-80 object-cover grayscale brightness-75 mt-12 hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
          <div className="lg:col-span-5 lg:pl-8">
            <span className="text-tertiary font-label text-xs uppercase tracking-[0.4em] mb-4 block">{t.facialCat}</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6">{t.facialTitle}</h2>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl font-light text-primary">$165</span>
              <span className="w-1.5 h-1.5 bg-outline-variant rounded-full" />
              <span className="text-sm font-label uppercase tracking-widest text-on-surface-variant">{t.facialDuration}</span>
            </div>
            <p className="text-on-surface-variant mb-8 leading-relaxed font-light">{t.facialBody}</p>
            <ul className="mb-10 space-y-3">
              {t.facialItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="w-1 h-1 bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/book`} className="w-full block text-center bg-primary text-on-primary px-10 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              {t.bookSession}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 bg-surface-container-lowest text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">{t.ctaTitle}</h2>
          <p className="text-outline mb-12 uppercase tracking-widest text-xs font-label">{t.ctaSub}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              {t.reserveNow}
            </Link>
            <Link href={`/${locale}/book`} className="border border-outline-variant text-on-surface px-12 py-5 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all">
              {t.inquireMembership}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
