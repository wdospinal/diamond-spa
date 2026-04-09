import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sanctuary — Diamond Spa',
  description: 'The philosophy and heritage behind Diamond Spa — precision wellness for those who carry the weight of leadership.',
}

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMJt6gVTVOcc0SLCddvP7863h-3G97XDjh63aBjalz_oTlp8ClqkDtehoFnE47a2wt_n0r5LV4MuWsS483zQ0ZaeeIjUuH1IKmb_9q7MF_GUK3ONCFOjNKdonpAAY5Kgha5XDqKSoh1Hcf7qYeUraZVrSJRQtt1acSfjO7vh2cbe1jBwIs48ju40Zl0JXuHfISXPTkBu4v4TJupflDrpH7VdphBKpeYBsZDPssMRc_0oO5Ayuwe3k5iayBAJjqFLdB9Aur39XbUZDK'

const STONE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBs3haFtBW8DAugh_D6Bb6qT_cFNTjpvGP0LKKs5eeBeV-4jgNh3VDaFM-zJYOC3-weUhoTSRXJSLFoQi65MlMiKmUVVLTEW-E5_NgaVNJaCZ5vM3fNDLA0jVi54ViIwjLlzc2I8j_JIiMBft3RF9WHTF6PVfIRppcvj2U1drHqDRAMCzEU76UiVW_8kHob8AUxwEbeqCCXm8PuzX3DrIDhTgrtGRiu8luULgBpUJi8IJOrJabDZA2xKIe-pY7oTrCwoF6LSjKv_rTz'

const LOUNGE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBu7nA58in7biCj0013W2NJFHpMPUSX9srE_U6hc_uPTXg6kgHw9uwqj7pIAfqqZQynbSw05TioMo3Sguz2hawhGyDciZoFqC_h_7_TGww21-LZyrDPl1wDFOCUyIGHFmIh_h0uevJ2AQlHZZsdKs4klIh0JA3jIFSas6EssHhXhmjLJSWvqC_2fjkzsepld29rHXlWme-XNGQLBcj2OnkvEHyx6aO5Y9e7RziAvlphzuIVOKEAwO-mKxJRtcUVqCBZEsisOp2I04Ms'

const THERAPISTS = [
  {
    name: 'Daniela Salina',
    role: 'Lead Cosmetologist',
    bio: 'Specialising in deep-tissue structural integration and neurological reset protocols.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlYrNsIn8dZN54uDQ1X-VQW5iiO7QVjajJzNQZGbhD5nKxzeR4fJgF932bmu8AicevIWwyo4Imm5cAM0AIEOvRMBhr8mzZtG0I8_97pvmSRqtv02qMcgnH8RuBFfi2LLT4jrNNR1VlWz_mvjDzB5Xz5huGLEcHxZxGD5Q2qlgwsp_cEXvWJbUQ8jawA6NOd4hjGZASpZKBVQBzA2zYGBK4JQhlnAsDjZzUjthaV9vAgrC1K9d57MWO7oeLfIwJHUuiBt9BWoKJltoi',
  },
  {
    name: 'Sary Paez',
    role: 'Lead Cosmetologist',
    bio: 'Merging traditional eastern precision with modern dermatological science for skin restoration.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA--AjeGJ5OrkedJ6XBzdoMVNZwwbv00doKpINgYwu3gySdyB83gFJg17CvXn-Ykws4T7U6YMHSScyi0d5wq4b8tTEUs5yV7ezrc-dkOthJ8S43TwL-9DDIDoOohgPJZyQoUyTuNH1jQhSiSPIlyEtuJiPo0fZ0HvWWuxemQoNAWCtErMQ7oJN8abhZcF0QK_WNSTNnskbn1sgwwqTsBjnIi5w39yyUwD3jucUWT1LXooZazdy-MGCsKRptJ5JK16koRQ-NhGaj7LpS',
  },
  {
    name: 'Julian Ross',
    role: 'Massage Therapist',
    bio: 'Expert in circadian rhythm alignment and acoustic resonance therapy for cognitive rest.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgQ0urlt0Erih0_7j4uMvAiRh0GoCvrhpnm5OppBbApO1fhYi-svnHmNCTm37opwsQxn24WpcEQLfxfjo0UwiJ_XeXhETmxcOWig5GZuLDcXvlK633HT7FGCy0Tduqb70NPD4uZwx8dAk4WQQReJLg-xQ2fQEWv_F1tkoFLU29V9tkUuiSwTDpC0VXqVsSzE-Z9fwf60QSSI-M7cn7qGNPt-tIkjxDLQP34nSMHfmYdXzwdwgehJ1E8bXFdeDhki2pECsK1eTG1Gol',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center px-6 md:px-12 overflow-hidden bg-surface">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-10 md:pt-14">

          {/* Text */}
          <div className="lg:col-span-7 z-10">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">The Midnight Sanctuary</span>
            <h1 className="font-headline text-5xl md:text-8xl text-on-surface leading-tight mb-8">
              The <span className="italic text-primary">Philosophy</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-secondary max-w-xl leading-relaxed font-light">
              Where the modern world&apos;s noise fades into obsidian silence. We curate an atmosphere of deep
              restoration designed specifically for those who carry the weight of leadership.
            </p>
          </div>

          {/* Image */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMG} alt="Luxury spa interior" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="absolute -bottom-8 -left-8 w-56 h-72 bg-surface-container-high hidden lg:flex flex-col justify-end p-7">
              <p className="font-headline text-primary text-2xl mb-3 italic">Quiet Confidence</p>
              <p className="font-body text-xs text-secondary leading-relaxed">
                A sanctuary defined not by what it adds, but by what it removes: distraction, urgency, and noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERITAGE ─────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">

          {/* Staggered images */}
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={STONE_IMG}  alt="Stone massage" className="w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity duration-700" />
              </div>
              <div className="aspect-square translate-y-8 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOUNGE_IMG} alt="Spa lounge"    className="w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity duration-700" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">Established Heritage</span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-8">
              A Boutique Haven for the Modern <span className="italic">Professional</span>
            </h2>
            <p className="font-body text-secondary mb-6 leading-relaxed text-lg">
              Founded on the principle that recovery is as critical as performance. Diamond Spa was conceived
              as a private club for those whose time is their most valuable asset. We have evolved from a
              private boutique into a global benchmark for precision wellness.
            </p>
            <p className="font-body text-secondary leading-relaxed text-lg">
              Every corner of our sanctuary reflects the architectural rigour and refined taste of our clientele.
              We don&apos;t just offer treatments; we offer a return to the self.
            </p>
          </div>
        </div>
      </section>

      {/* ── INTERNATIONAL STANDARD ───────────────────────────── */}
      <section className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto text-center mb-24">
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-6">The International Standard</h2>
          <div className="h-px w-24 bg-primary mx-auto" />
        </div>
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            {
              icon: 'lock',
              title: 'Absolute Discretion',
              body: 'Our protocols are modelled after Swiss banking standards. Privacy is not a feature; it is our foundation. Private entrances and staggered arrivals ensure total anonymity.',
            },
            {
              icon: 'language',
              title: 'Global Proficiency',
              body: 'A truly international staff fluent in six major world languages, trained to anticipate cultural nuances and specific professional expectations with effortless grace.',
            },
            {
              icon: 'architecture',
              title: 'Professional Rigour',
              body: 'Our practitioners are not just therapists; they are clinical specialists in stress management and biomechanics, operating with the precision of a master watchmaker.',
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="bg-surface p-12 hover:bg-surface-container-low transition-colors duration-500 group">
              <span className="material-symbols-outlined text-4xl text-primary mb-8 block">{icon}</span>
              <h3 className="font-headline text-2xl text-on-surface mb-6">{title}</h3>
              <p className="font-body text-secondary leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 bg-surface-container-lowest">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">Our Practitioners</span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
                Precise. Professional. <span className="italic">Elite.</span>
              </h2>
            </div>
            <p className="font-body text-secondary max-w-sm text-sm leading-relaxed">
              Curated from the world&apos;s most prestigious training institutes, our team represents the pinnacle
              of therapeutic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {THERAPISTS.map(({ name, role, bio, img }) => (
              <div key={name} className="group">
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-70 group-hover:opacity-100"
                  />
                </div>
                <h4 className="font-headline text-xl text-on-surface mb-1">{name}</h4>
                <p className="font-label text-primary text-xs tracking-widest uppercase mb-4">{role}</p>
                <p className="font-body text-sm text-secondary leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-40 px-6 md:px-12 bg-surface text-center">
        <div className="max-w-4xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">Exclusive Access</span>
          <h2 className="font-headline text-4xl md:text-7xl text-on-surface mb-12">
            Return to your <span className="italic text-primary">Primal Calm.</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/book"
              className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              Request Membership
            </Link>
            <Link
              href="/services"
              className="border border-outline-variant/30 text-on-surface px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-surface-container-high transition-all duration-300"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
