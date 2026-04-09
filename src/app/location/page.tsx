import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ubicación — Diamond Spa Medellín | El Poblado',
  description: 'Encuéntranos en Cra 43C #10-42, El Poblado, Medellín, Antioquia. Masajes de lujo en el corazón de El Poblado.',
}

const HOURS = [
  { day: 'Monday – Friday', time: '7:00 AM – 11:00 PM' },
  { day: 'Saturday',        time: '8:00 AM – 11:00 PM' },
  { day: 'Sunday',          time: '9:00 AM – 9:00 PM'  },
]

const TRANSPORT = [
  { icon: 'directions_subway', label: 'Metro',     detail: 'Estación Industriales — 8 min en taxi' },
  { icon: 'local_parking',     label: 'Parqueadero', detail: 'Zona de parqueo disponible en el sector' },
  { icon: 'flight',            label: 'Aeropuerto', detail: '25 min desde el Aeropuerto Olaya Herrera' },
]

export default function LocationPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="pt-12 md:pt-16 pb-20 px-6 md:px-12 bg-surface">
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
              <p className="font-headline text-5xl md:text-6xl text-on-surface leading-snug mb-2">Cra 43C #10-42</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic mt-4">El Poblado</p>
              <p className="font-headline text-3xl md:text-4xl text-secondary leading-snug italic">Medellín, Antioquia</p>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">phone</span>
                <span className="font-body text-secondary text-sm tracking-widest">+57 314 5484227</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span className="font-body text-secondary text-sm tracking-widest">info@diamondspa.com.co</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-[0.2em] text-xs uppercase hover:bg-white transition-all duration-300"
            >
              <span className="material-symbols-outlined text-base">directions</span>
              Get Directions
            </a>
          </div>

          {/* Google Maps embed */}
          <div className="min-h-[460px] overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Cra+43C+%2310-42,+El+Poblado,+Medell%C3%ADn,+Antioquia&output=embed&z=16"
              width="100%"
              height="460"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diamond Spa location"
            />
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
                A private entrance ensures complete anonymity and a seamless transition into
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
