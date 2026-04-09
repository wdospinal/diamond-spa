import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuARewKYdLJs5kfLjfNo15Y-Bvcc5MYt_OWgbc-2jwqTpu1GtJUy7M56ebUX8jYdld_LWLt91r3URrz6fwYMN0y-IOJKEVXEj2rVUBiP1FDTpB27NkxYGsoz_yPj-7MAfnY9gSBRAy7HMYy6rfQhKgaGShNSaOhxJLpMnyDnV7Sr5nWohja_HikCD8haFT6_jpmzigAFmn_wJDjM-va9Ev_aSE6Tjz8Hq8LTrJyk3-yL5MCGR_uJHTRQS_VMtcNvJ_yHWmYpV-CcqZY2'
const DEEP_TISSUE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf6M3MTJY3a0VyeDXLX3bGIUrp3dUzZ72q0Mwsq2DSjh5TFK7S_w3ZQfi13HzKYpS82VRnve5FDPFxBrM5bHjR_9An8OykQbgQkSqwLcIFOH_e3uBMgeQcutLox_ARI9SUC7MEJ3IuTiegApD9kpAhhJSiiO0xm9TpPFEMuwcyXPSzdabrM1NLD9vfcIZuDbXc8OjO1fRjeFesfZSOoT81xltXvbGp-0gXh211u_ibO8r9EjmbbUxztiNDuxbEo87fRCNeA-CBgr8Y'
const FACIAL_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZsfM0QI0GE0BCNgFlTZHmGNftgnas-PXevE9015gW7bzQvQIVWQOTcdU5jYfhdRj5-Lqet2Kbzxoyry1JM8YvamU8Uhxawrd5GA5qL_dp-Q1PaYTgWE6dAWWxPaw4S3ts2q-SPF3cCmOzP2qHW0Yw586Nvheje2jixR2RsXX0BDGLEjgwd-YdJMhbOshStYX07s9n8Yrg08RnjiCE2OFRObikltW3dI3PuyHgi2ocEIq7zAx2BjzJOmqP4sMEwAgdjGd_t7jy1-QO'
const RELAX_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT0RW6uduw7sUyBSEesFWEN7RiwIAIzyZ7evCOe38BuXx9qpJveoSj5F0K8h-3mUWeQNlvmHU4cV2hz9ANgwGNdrcQzQjY7GDwt_U0ByilcyE6zT4nAd9lI5xqDwdfCMKf594okejP_rYMw2V7_NBcJbtxvX2Br69pUi8kPrWfmHHW7Yqo2VWCLCV5-eqY74K29QCQpPFnVQAz_2-QdTitbvR3sCaoqurA0gmR_qheugd8WTHveMn82CyIeCREzb1x1VfVZBQZxZ2i'
const BOUTIQUE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeGR8FHRHdKwBQH-XHXL66xsvphiainpt1lr0JS29n5HIiZDFhmdrhb4WOYalkRGilFAPnBbq5AUoqFEzQCm-RNWQXJbNArkvJTAKSp-47m2ScLWrutdw1H_GNN1O1yQzM-j5zT91RzunQehYHUZQhApdXRTtx8M-DpBaNXL_1J5_ECl8z0zEntw6h5MNFxXW_NatIsHMbIcMn6b9gPlySuZWS6mlLTPLTKvQwR5PdSlc4nno8n6By_oyg0x602FS3LJFtNMBna-AU'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const locale = isLocale(params.lang) ? params.lang : 'es'
  return {
    title: locale === 'en'
      ? 'Diamond Spa — Spa for Men and Women in Medellín'
      : 'Diamond Spa — Spa para Hombres y Mujeres en Medellín',
    description: locale === 'en'
      ? 'Luxury massages and spa treatments in El Poblado, Medellín. Book your session today.'
      : 'Masajes de lujo y tratamientos spa en El Poblado, Medellín. Reserva tu sesión hoy.',
  }
}

export default function HomePage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound()
  const locale = params.lang as Locale
  const t = getDict(locale)
  const h = t.home

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMG} alt="Diamond Spa luxury interior" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/20" />
        </div>
        <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-12 pt-10 md:pt-14 pb-24">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">{h.tagline}</span>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface leading-tight mb-8 max-w-3xl">
            {h.h1[0]}<br />{h.h1[1]}
          </h1>
          <p className="font-body text-secondary text-lg max-w-md leading-relaxed font-light mb-12">{h.body}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/book`} className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {h.bookSession}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300">
              {h.exploreServices}
            </Link>
          </div>
        </div>
      </section>

      {/* CURATED RESTORATION */}
      <section className="py-28 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">{h.section2Title}</h2>
              <p className="mt-4 font-body text-secondary max-w-lg leading-relaxed font-light">{h.section2Body}</p>
            </div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs whitespace-nowrap">{h.section2Badge}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Deep Tissue */}
            <div className="md:col-span-8 relative group overflow-hidden bg-surface-container min-h-[480px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEEP_TISSUE_IMG} alt="Deep Tissue Massage" className="w-full h-full object-cover absolute inset-0 img-hover-color" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 z-10">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.recovery}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.deepTissueTitle}</h3>
                <p className="font-body text-secondary text-sm max-w-md leading-relaxed mb-5">{h.deepTissueBody}</p>
                <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 font-label text-primary text-xs tracking-widest uppercase hover:gap-3 transition-all">
                  {h.viewDetails} <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
            {/* Facial */}
            <div className="md:col-span-4 bg-surface-container-high p-8 flex flex-col justify-between min-h-[480px] group overflow-hidden relative">
              <div>
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.grooming}</span>
                <h3 className="font-headline text-2xl text-on-surface mb-4">{h.facialTitle}</h3>
                <p className="font-body text-secondary text-sm leading-relaxed">{h.facialBody}</p>
              </div>
              <div className="mt-8 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FACIAL_IMG} alt="Facial Treatment" className="w-full h-48 object-cover object-top img-hover-color" />
              </div>
            </div>
            {/* Relaxation */}
            <div className="md:col-span-12 bg-surface-container relative group overflow-hidden min-h-[280px] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RELAX_IMG} alt="Relaxation Massage" className="absolute inset-0 w-full h-full object-cover img-hover-color" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container/70 to-transparent" />
              <div className="relative z-10 px-10 py-10 max-w-2xl">
                <span className="font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-3 block">{h.clarity}</span>
                <h3 className="font-headline text-3xl text-on-surface mb-3">{h.relaxTitle}</h3>
                <p className="font-body text-secondary text-sm leading-relaxed">{h.relaxBody}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERNATIONAL STANDARD */}
      <section className="py-28 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-16">{h.standardTitle}</h2>
            <div className="flex flex-col gap-10">
              {h.features.map(({ icon, title, body }) => (
                <div key={title} className="flex gap-6">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <h4 className="font-label font-bold text-on-surface tracking-widest uppercase text-xs mb-3">{title}</h4>
                    <p className="font-body text-secondary text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BOUTIQUE_IMG} alt="Diamond Spa boutique interior" className="w-full aspect-[4/5] object-cover opacity-80 hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-surface-container-high/90 backdrop-blur-sm p-6">
              <p className="font-headline italic text-on-surface text-sm leading-relaxed mb-2">&ldquo;{h.quote}&rdquo;</p>
              <span className="font-label text-tertiary text-xs tracking-widest uppercase">{h.quoteSource}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
        <div className="max-w-3xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">{h.ctaLabel}</span>
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-12">
            {h.ctaTitle[0]} <span className="italic text-primary">{h.ctaTitle[1]}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href={`/${locale}/book`} className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300">
              {h.reserveSession}
            </Link>
            <Link href={`/${locale}/services`} className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300">
              {h.exploreServices}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
