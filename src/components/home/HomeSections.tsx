import Image from 'next/image'
import Link from 'next/link'
import { getDict, type Locale } from '@/lib/i18n'
import { formatRating, type HomeContent } from '@/lib/home-content'
import {
  SPA_ADDRESS,
  SPA_GOOGLE_MAPS_URL,
  SPA_GOOGLE_REVIEW_URL,
  SPA_MAP_EMBED_SRC,
} from '@/lib/spa'
import MapEmbed from '@/components/MapEmbed'
import { HomeVideos } from '@/components/home/HomeVideos'

const SECTION_LABEL = 'font-label text-tertiary tracking-[0.3em] uppercase text-xs mb-4 block'
const SECTION_H2 = 'font-headline text-4xl md:text-5xl text-on-surface'

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function HomeHero({
  locale,
  rating,
  content,
}: {
  locale: Locale
  rating: { value: string; count: number }
  content: HomeContent
}) {
  const h = getDict(locale).home
  const { hero } = content
  const es = locale === 'es'

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Real photo of one of our private rooms. priority emits a preload
            <link> in <head> so the browser finds it at HTML-parse time. */}
        <Image
          src="/home/hero-cabina.webp"
          alt={hero.imageAlt}
          fill
          priority
          fetchPriority="high"
          quality={70}
          sizes="100vw"
          className="object-cover object-[center_42%] opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
      </div>
      <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-6 md:px-12 pt-10 md:pt-14 pb-24">
        <div className="lg:w-2/3 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs">{hero.tagline}</span>
            <span className="w-px h-3 bg-outline-variant/40" />
            <span className="inline-flex items-center gap-1 font-label text-outline text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined shrink-0 overflow-visible" style={{ fontSize: '16px', lineHeight: '1' }} aria-hidden="true">location_on</span>
              Medellín, El Poblado
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface leading-tight mb-8 w-full">
            {hero.h1[0]}<br />{hero.h1[1]}
          </h1>
          <p className="font-body text-secondary text-lg max-w-xl leading-relaxed font-light mb-12">{hero.body}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/book`} className="inline-flex items-center gap-3 bg-primary text-on-primary px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-all duration-300">
              {h.bookSession}
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
            <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-5 font-label font-bold tracking-[0.2em] text-sm uppercase hover:bg-surface-container-high transition-all duration-300">
              {h.exploreServices}
            </Link>
          </div>

          {/* Trust signals strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-10 border-t border-outline-variant/20">
            <a
              href={SPA_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <div
                className="flex gap-0.5"
                role="img"
                aria-label={es ? `${formatRating(rating.value, locale)} estrellas de 5` : `${rating.value} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                ))}
              </div>
              <span className="font-label text-on-surface text-xs tracking-wider group-hover:text-primary transition-colors">
                {formatRating(rating.value, locale)} · {rating.count} {es ? 'reseñas de Google' : 'Google reviews'}
              </span>
            </a>
            <span className="w-px h-3 bg-outline-variant/30 hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }} aria-hidden="true">schedule</span>
              <span className="font-label text-outline text-xs tracking-wider">
                {es ? 'Lun–Sáb 10:00–22:00 · Dom 10:00–19:00' : 'Mon–Sat 10:00–10pm · Sun 10:00–7pm'}
              </span>
            </div>
            <span className="w-px h-3 bg-outline-variant/30 hidden md:block" aria-hidden="true" />
            <div className="hidden md:flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '14px' }} aria-hidden="true">location_on</span>
              <span className="font-label text-outline text-xs tracking-wider">{SPA_ADDRESS.street}, {SPA_ADDRESS.neighborhood}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Facts strip ──────────────────────────────────────────────────────────────

export function HomeFacts({ content }: { content: HomeContent }) {
  return (
    <section className="bg-surface-container-low border-y border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 px-6 md:px-12 py-12">
        {content.facts.map(fact => (
          <div key={fact.label}>
            <p className="font-headline text-3xl md:text-4xl text-on-surface leading-none">{fact.value}</p>
            <p className="mt-3 font-label text-outline text-xs tracking-wider leading-relaxed">{fact.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function HomeServices({ content }: { content: HomeContent }) {
  const { services } = content
  return (
    <section className="py-28 px-6 md:px-12 bg-surface">
      <div className="max-w-screen-2xl mx-auto">
        <div className="max-w-3xl mb-16">
          <span className={SECTION_LABEL}>{services.label}</span>
          <h2 className={SECTION_H2}>{services.title}</h2>
          <p className="mt-4 font-body text-secondary leading-relaxed font-light">{services.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.cards.map(card => (
            <article
              key={card.title}
              className="flex flex-col gap-6 bg-surface-container ring-1 ring-outline-variant/10 rounded-sm p-8"
            >
              <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">{card.icon}</span>
              <div className="flex-1">
                <h3 className="font-headline text-2xl text-on-surface">
                  <Link href={card.href} className="hover:text-primary transition-colors">{card.title}</Link>
                </h3>
                <p className="mt-3 font-body text-secondary text-sm leading-relaxed">{card.desc}</p>
                {card.price && (
                  <p className="mt-4 font-label text-xs tracking-wider text-on-surface">
                    <span className="text-outline">{services.fromLabel} </span>
                    {card.price}
                  </p>
                )}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {card.chips.map(chip => (
                    <li key={chip.href}>
                      <Link
                        href={chip.href}
                        className="inline-block border border-outline-variant/30 px-3 py-1.5 font-label text-[11px] tracking-wider text-secondary hover:border-primary hover:text-primary transition-colors"
                      >
                        {chip.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all"
              >
                {card.cta}
                <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">chevron_right</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={services.seeAllHref}
            className="inline-flex items-center gap-2 border border-outline-variant/30 text-on-surface px-10 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
          >
            {services.seeAll}
            <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export function HomeVideosSection({ content }: { content: HomeContent }) {
  const { videos } = content
  if (!videos.items.length) return null
  return (
    <section className="py-28 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto">
        <div className="max-w-3xl mb-16">
          <span className={SECTION_LABEL}>{videos.label}</span>
          <h2 className={SECTION_H2}>{videos.title}</h2>
          <p className="mt-4 font-body text-secondary leading-relaxed font-light">{videos.intro}</p>
        </div>
        <HomeVideos
          items={videos.items}
          playLabel={videos.play}
          pauseLabel={videos.pause}
          viewLabel={videos.viewMassage}
        />
      </div>
    </section>
  )
}

// ─── Guide: how to choose a spa ───────────────────────────────────────────────

export function HomeGuide({ content }: { content: HomeContent }) {
  const { guide } = content
  return (
    <section className="py-28 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <span className={SECTION_LABEL}>{guide.label}</span>
          <h2 className={SECTION_H2}>{guide.title}</h2>
          <p className="mt-4 font-body text-secondary leading-relaxed font-light">{guide.intro}</p>
          <Link
            href={guide.moreHref}
            className="mt-8 inline-flex items-center gap-1 font-label text-primary text-xs tracking-widest uppercase hover:gap-2 transition-all"
          >
            {guide.moreLabel}
            <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">chevron_right</span>
          </Link>
        </div>
        <ol className="lg:col-span-7 flex flex-col divide-y divide-outline-variant/20 border-t border-outline-variant/20">
          {guide.items.map((item, i) => (
            <li key={item.title} className="flex gap-6 py-8">
              <span className="font-headline text-3xl text-primary/60 leading-none w-8 shrink-0" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-headline text-xl text-on-surface">{item.title}</h3>
                <p className="mt-3 font-body text-secondary text-sm leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ─── Location + map ───────────────────────────────────────────────────────────

export function HomeLocation({ locale, content }: { locale: Locale; content: HomeContent }) {
  const { location: loc } = content
  return (
    <section className="py-28 px-6 md:px-12 bg-surface">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div>
            <span className={SECTION_LABEL}>{loc.label}</span>
            <h2 className={SECTION_H2}>{loc.title}</h2>
          </div>

          <address className="not-italic flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0" aria-hidden="true">location_on</span>
            <div>
              <p className="font-label text-outline text-xs tracking-widest uppercase mb-2">{loc.addressLabel}</p>
              <p className="font-label font-bold text-on-surface text-sm tracking-wide">Diamond Spa</p>
              <p className="font-body text-secondary text-sm">{SPA_ADDRESS.street}</p>
              <p className="font-body text-secondary text-sm">{SPA_ADDRESS.neighborhood}, {SPA_ADDRESS.city}, {SPA_ADDRESS.region}</p>
              <a
                href={loc.phoneHref}
                className="mt-3 inline-flex items-center gap-2 font-label text-on-surface text-sm tracking-wide hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">call</span>
                <span className="sr-only">{loc.phoneLabel}: </span>
                {loc.phone}
              </a>
            </div>
          </address>

          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0" aria-hidden="true">schedule</span>
            <div className="flex-1">
              <p className="font-label text-outline text-xs tracking-widest uppercase mb-2">{loc.hoursLabel}</p>
              <ul className="flex flex-col gap-1.5">
                {loc.hours.map(({ day, time }) => (
                  <li key={day} className="flex items-center justify-between gap-4">
                    <span className="font-label text-on-surface text-xs tracking-wide">{day}</span>
                    <span className="font-label text-outline text-xs">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5 shrink-0" aria-hidden="true">directions_car</span>
            <div>
              <p className="font-label text-outline text-xs tracking-widest uppercase mb-2">{loc.howLabel}</p>
              <ul className="flex flex-col gap-1.5">
                {loc.directions.map(line => (
                  <li key={line} className="font-body text-secondary text-sm leading-relaxed">{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/book`}
              className="inline-flex items-center justify-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              {loc.book}
              <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">arrow_forward</span>
            </Link>
            <a
              href={SPA_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-outline-variant/30 text-on-surface px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
            >
              {loc.directionsCta}
              <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden="true">open_in_new</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-sm ring-1 ring-outline-variant/20">
            <MapEmbed src={SPA_MAP_EMBED_SRC} title={loc.mapTitle} height={520} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Internal-link hub ────────────────────────────────────────────────────────

export function HomeHub({ content }: { content: HomeContent }) {
  const { hub } = content
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-14">
          <span className={SECTION_LABEL}>{hub.label}</span>
          <h2 className={SECTION_H2}>{hub.title}</h2>
        </div>
        <nav
          aria-label={hub.title}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12"
        >
          {hub.groups.map(group => (
            <div key={group.title}>
              <h3 className="font-label text-on-surface text-xs tracking-[0.25em] uppercase mb-5">{group.title}</h3>
              <ul className="flex flex-col gap-3 border-t border-outline-variant/20 pt-5">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-secondary text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </section>
  )
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────

export function HomeCta({ locale }: { locale: Locale }) {
  const h = getDict(locale).home
  return (
    <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
      <div className="max-w-3xl mx-auto">
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
        <p className="mt-10">
          <a
            href={SPA_GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-outline text-xs tracking-widest uppercase hover:text-on-surface transition-colors"
          >
            {locale === 'es' ? '¿Ya nos visitaste? Deja tu reseña en Google' : 'Already visited? Leave a Google review'}
          </a>
        </p>
      </div>
    </section>
  )
}
