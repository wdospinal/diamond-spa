import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Location — Diamond Spa',
  description: 'Find Diamond Spa at 1221 Obsidian Heights, Level 40, Midnight District. Private entrances, absolute discretion.',
}

const HOURS = [
  { day: 'Monday – Friday', time: '7:00 AM – 11:00 PM' },
  { day: 'Saturday',        time: '8:00 AM – 11:00 PM' },
  { day: 'Sunday',          time: '9:00 AM – 9:00 PM'  },
]

const TRANSPORT = [
  { icon: 'directions_subway', label: 'Metro',   detail: 'Obsidian Heights Station — 2 min walk' },
  { icon: 'local_parking',     label: 'Parking', detail: 'Private valet on Level 38, 24 hrs'      },
  { icon: 'flight',            label: 'Airport', detail: '22 min by private transfer'              },
]

export default function LocationPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="pt-40 pb-20 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">Find Us</span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">
            The Sanctuary<br /><span className="italic text-primary">Address</span>
          </h1>
        </div>
      </header>

      {/* ── ADDRESS DISPLAY ──────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Large address typography */}
          <div>
            <div className="mb-12">
              <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">1221 Obsidian</p>
              <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">Heights</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic mt-4">Level 40</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic">Midnight District</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">phone</span>
                <span className="font-body text-secondary text-sm tracking-widest">+1 (800) DIAMOND</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-body text-secondary text-sm tracking-widest">concierge@diamondspa.intl</span>
              </div>
            </div>
          </div>

          {/* Coordinates + map placeholder */}
          <div className="bg-surface-container min-h-[460px] relative overflow-hidden flex flex-col justify-between p-10">
            {/* Grid lines decoration */}
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'linear-gradient(#a5cce6 1px, transparent 1px), linear-gradient(90deg, #a5cce6 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            {/* Crosshair pin */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-primary/20" />
                <div className="absolute w-20 h-20 rounded-full border border-primary/40" />
                <div className="absolute w-2 h-2 bg-primary rounded-full" />
                <div className="absolute w-px h-16 bg-primary/30" />
                <div className="absolute h-px w-16 bg-primary/30" />
              </div>
            </div>
            {/* Top coords */}
            <div className="relative z-20 flex justify-between">
              <span className="font-label text-outline text-xs tracking-widest">40.7128° N</span>
              <span className="font-label text-outline text-xs tracking-widest">74.0060° W</span>
            </div>
            {/* Bottom label */}
            <div className="relative z-20">
              <p className="font-label text-primary text-xs tracking-[0.3em] uppercase mb-1">Diamond Spa</p>
              <p className="font-body text-secondary text-xs">Midnight District · Level 40</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOURS ────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">

          <div>
            <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">Operating Hours</span>
            <div className="flex flex-col gap-0">
              {HOURS.map(({ day, time }, i) => (
                <div
                  key={day}
                  className={`flex justify-between items-center py-6 ${i < HOURS.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                >
                  <span className="font-body text-secondary text-sm">{day}</span>
                  <span className="font-label text-on-surface text-sm tracking-widest">{time}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-body text-xs text-outline leading-relaxed">
              Last bookings accepted 90 minutes before closing. Extended hours available for members.
            </p>
          </div>

          {/* Private entrance note */}
          <div className="bg-surface-container-high p-10 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-3xl mb-6 block">lock</span>
              <h3 className="font-headline text-2xl text-on-surface mb-5">Private Arrival</h3>
              <p className="font-body text-secondary leading-relaxed text-sm mb-8">
                Our concierge will provide personalised arrival instructions upon booking confirmation.
                A private entrance on Level 39 ensures complete anonymity and a seamless transition into
                the sanctuary environment.
              </p>
              <p className="font-body text-secondary leading-relaxed text-sm">
                Staggered appointment scheduling guarantees you will never encounter another client during
                arrival or departure.
              </p>
            </div>
            <Link
              href="/book"
              className="mt-10 w-fit bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              Reserve &amp; Receive Directions
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRANSPORT ────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-12 block">Getting Here</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {TRANSPORT.map(({ icon, label, detail }, i) => (
              <div
                key={label}
                className={`flex gap-6 items-start p-10 hover:bg-surface-container-high transition-colors duration-300 ${i < TRANSPORT.length - 1 ? 'md:border-r border-outline-variant/10' : ''}`}
              >
                <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
                <div>
                  <h4 className="font-label font-bold text-on-surface text-xs tracking-widest uppercase mb-2">{label}</h4>
                  <p className="font-body text-secondary text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-40 px-6 md:px-12 bg-surface-container-lowest text-center">
        <div className="max-w-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-8 block">Your Journey Begins</span>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface mb-6 italic">
            The destination is the experience.
          </h2>
          <p className="font-body text-secondary text-sm mb-12 leading-relaxed">
            Reserve your session and our team will send private arrival coordinates directly to you.
          </p>
          <Link
            href="/book"
            className="bg-primary text-on-primary px-12 py-5 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
          >
            Book Your Visit
          </Link>
        </div>
      </section>
    </>
  )
}
