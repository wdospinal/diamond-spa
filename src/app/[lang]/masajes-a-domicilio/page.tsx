import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph, localBusinessJsonLd, faqJsonLd } from '@/lib/seo'
import { SPA_RATING } from '@/lib/spa'
import { getServiceById, serviceDisplayName } from '@/lib/services'
import { serviceHref } from '@/lib/routes'
import { JsonLd } from '@/components/JsonLd'
import LandingHead from '@/components/LandingHead'
import WhatsAppLink from '@/components/WhatsAppLink'
import { mergeLandingMetadata } from '@/lib/landing-meta'

export const revalidate = 3600

const PATH = '/masajes-a-domicilio'

/** Massages we take to a home or hotel. Hot stones and four hands stay at the spa. */
const HOME_SERVICES = [
  {
    id: 'relaxing',
    es: 'Movimientos largos y presión suave para bajar el estrés y dormir mejor, sin salir de tu habitación.',
    en: 'Long strokes and gentle pressure to lower stress and sleep better, without leaving your room.',
  },
  {
    id: 'deep-tissue',
    es: 'Presión sostenida sobre cuello, espalda y lumbar para soltar los nudos de horas de trabajo o de vuelo.',
    en: 'Sustained pressure on neck, back and lower back to release the knots from long work days or flights.',
  },
  {
    id: 'sports',
    es: 'Recuperación muscular antes o después de entrenar, una caminata larga o un día de ciclismo.',
    en: 'Muscle recovery before or after training, a long hike or a day of cycling.',
  },
  {
    id: 'duo',
    es: 'Dos terapeutas al mismo tiempo para ti y tu acompañante, en el mismo espacio.',
    en: 'Two therapists at the same time for you and your companion, in the same room.',
  },
] as const

const content = {
  es: {
    metaTitle: 'Masajes a Domicilio en Medellín — El Poblado y Laureles | Diamond Spa',
    metaDesc: `Masajes a domicilio y en tu hotel en El Poblado y Laureles, Medellín. Relajante, deep tissue, deportivo y dúo con terapeutas certificadas. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} reseñas. Agenda por WhatsApp.`,
    heroLabel: 'El Poblado y Laureles, Medellín',
    h1: 'Masajes a Domicilio en Medellín',
    heroBody:
      'Llevamos la experiencia Diamond Spa a tu apartamento, casa u hotel en El Poblado y Laureles. Una terapeuta certificada llega con camilla, aceites y toallas limpias, y tú solo tienes que elegir el masaje y la hora.',
    waCta: 'Agendar por WhatsApp',
    waText: 'Hola, quiero agendar un masaje a domicilio. Zona/hotel: ___ · Fecha y hora: ___ · Masaje: ___',
    servicesTitle: 'Masajes que llevamos a tu espacio',
    servicesNote: 'Las piedras volcánicas y el masaje a 4 manos se hacen solo en nuestra sede.',
    viewDetails: 'Ver el masaje',
    bookThis: 'Agendar este',
    waTextFor: (name: string) => `Hola, quiero agendar un masaje ${name} a domicilio. Zona/hotel: ___ · Fecha y hora: ___`,
    includesTitle: 'Qué llevamos',
    includes: [
      { icon: 'meeting_room', title: 'Camilla profesional', body: 'Portátil y firme, para que el masaje sea igual de bueno que en la cabina.' },
      { icon: 'water_drop', title: 'Aceites y toallas', body: 'Aceites de masaje y toallas limpias para cada sesión. No necesitas preparar nada.' },
      { icon: 'verified', title: 'Terapeuta certificada', body: 'Las mismas terapeutas de nuestra sede, con formación en terapia de masaje.' },
      { icon: 'spa', title: 'Ambiente', body: 'Música suave y aromas para convertir tu habitación en un pequeño spa.' },
    ],
    zonesTitle: 'Dónde atendemos',
    zonesBody:
      'Vamos a hoteles, apartamentos de estadía corta y casas en El Poblado y Laureles. Si te alojas en otra zona, escríbenos y te decimos si podemos llegar.',
    zones: ['El Poblado', 'Provenza', 'Parque Lleras', 'Manila', 'Astorga', 'Laureles', 'Estadio', 'La 70'],
    stepsTitle: 'Cómo funciona',
    steps: [
      { icon: 'chat_bubble', title: 'Escríbenos', body: 'Por WhatsApp, con tu zona o el nombre del hotel, el día, la hora y el masaje que quieres.' },
      { icon: 'payments', title: 'Te confirmamos', body: 'Te enviamos el valor según la zona y el masaje, y apartamos a tu terapeuta.' },
      { icon: 'directions_car', title: 'Llegamos', body: 'La terapeuta llega unos minutos antes para montar la camilla y preparar el espacio.' },
      { icon: 'self_improvement', title: 'Te relajas', body: 'Al terminar recogemos todo. Tú solo te quedas descansando.' },
    ],
    whyTitle: 'Por qué con Diamond Spa',
    why: [
      { icon: 'star', title: `${SPA_RATING.value} en Google`, body: `${SPA_RATING.count} reseñas de clientes que ya pasaron por nuestras manos.` },
      { icon: 'location_on', title: 'Spa con sede física', body: 'Somos un spa con local en El Poblado, no un contacto suelto: sabes quién va a tu casa o a tu hotel.' },
      { icon: 'language', title: 'Español e inglés', body: 'Atendemos en los dos idiomas, ideal si estás de viaje en Medellín.' },
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Cuánto cuesta un masaje a domicilio en Medellín?',
        answer:
          'El valor depende del masaje, la duración y la zona. Escríbenos por WhatsApp con tu ubicación y te enviamos el precio exacto antes de confirmar.',
      },
      {
        question: '¿A qué zonas de Medellín van?',
        answer:
          'Atendemos hoteles, apartamentos y casas en El Poblado y Laureles. Para otras zonas, escríbenos y te confirmamos si podemos llegar.',
      },
      {
        question: '¿Pueden ir a mi hotel?',
        answer:
          'Sí. Solo necesitamos el nombre del hotel y el número de habitación. Si el hotel pide registrar visitantes en recepción, la terapeuta lo hace al llegar.',
      },
      {
        question: '¿Qué masajes hacen a domicilio?',
        answer:
          'Relajante, deep tissue, deportivo y dúo (dos terapeutas para dos personas). Las piedras volcánicas y el masaje a 4 manos se hacen solo en nuestra sede de El Poblado.',
      },
      {
        question: '¿Qué necesito preparar?',
        answer:
          'Solo un espacio de unos 2 x 3 metros para la camilla. La terapeuta lleva camilla, aceites y toallas limpias.',
      },
      {
        question: '¿Con cuánta anticipación debo reservar?',
        answer:
          'Te recomendamos escribirnos con algunas horas de anticipación para apartar a la terapeuta. Si es para el mismo día, escríbenos y revisamos la disponibilidad.',
      },
      {
        question: '¿Prefiero ir al spa, también puedo?',
        answer:
          'Claro. En nuestra sede de El Poblado tienes cabinas privadas y todos los masajes de la carta, incluidas las piedras volcánicas y el masaje a 4 manos.',
      },
    ],
    ctaTitle: 'Tu masaje, donde estés',
    ctaBody: 'Escríbenos con tu zona y la hora que quieres. Te respondemos con el valor y la disponibilidad.',
    spaLink: 'Prefiero ir al spa',
  },
  en: {
    metaTitle: 'In-Home & Hotel Massage in Medellín — El Poblado & Laureles | Diamond Spa',
    metaDesc: `Massage at your home or hotel in El Poblado and Laureles, Medellín. Relaxing, deep tissue, sports and couples with certified therapists. ⭐ ${SPA_RATING.value} · ${SPA_RATING.count} Google reviews. Book on WhatsApp.`,
    heroLabel: 'El Poblado & Laureles, Medellín',
    h1: 'In-Home & Hotel Massage in Medellín',
    heroBody:
      'We bring the Diamond Spa experience to your apartment, house or hotel in El Poblado and Laureles. A certified therapist arrives with a table, oils and clean towels — all you do is choose the massage and the time.',
    waCta: 'Book on WhatsApp',
    waText: 'Hi, I would like to book an in-home massage. Area/hotel: ___ · Date and time: ___ · Massage: ___',
    servicesTitle: 'Massages we bring to you',
    servicesNote: 'Hot stones and four-hands massage are only available at our spa.',
    viewDetails: 'See the massage',
    bookThis: 'Book this one',
    waTextFor: (name: string) => `Hi, I would like to book a ${name} at my place. Area/hotel: ___ · Date and time: ___`,
    includesTitle: 'What we bring',
    includes: [
      { icon: 'meeting_room', title: 'Professional table', body: 'Portable and firm, so the massage is as good as in our rooms.' },
      { icon: 'water_drop', title: 'Oils and towels', body: 'Massage oils and clean towels for every session. You don’t need to prepare anything.' },
      { icon: 'verified', title: 'Certified therapist', body: 'The same therapists who work at our spa, trained in massage therapy.' },
      { icon: 'spa', title: 'Atmosphere', body: 'Soft music and aromas to turn your room into a small spa.' },
    ],
    zonesTitle: 'Where we go',
    zonesBody:
      'We visit hotels, short-stay apartments and homes in El Poblado and Laureles. Staying somewhere else? Message us and we’ll tell you if we can get there.',
    zones: ['El Poblado', 'Provenza', 'Parque Lleras', 'Manila', 'Astorga', 'Laureles', 'Estadio', 'La 70'],
    stepsTitle: 'How it works',
    steps: [
      { icon: 'chat_bubble', title: 'Message us', body: 'On WhatsApp, with your area or hotel name, the day, the time and the massage you want.' },
      { icon: 'payments', title: 'We confirm', body: 'We send you the price for your area and massage, and reserve your therapist.' },
      { icon: 'directions_car', title: 'We arrive', body: 'Your therapist arrives a few minutes early to set up the table and the space.' },
      { icon: 'self_improvement', title: 'You relax', body: 'When we finish we pack everything up. You just stay and rest.' },
    ],
    whyTitle: 'Why Diamond Spa',
    why: [
      { icon: 'star', title: `${SPA_RATING.value} on Google`, body: `${SPA_RATING.count} reviews from clients who have already been in our hands.` },
      { icon: 'location_on', title: 'A spa with a real location', body: 'We are a spa with premises in El Poblado, not a stray contact: you know who is coming to your home or hotel.' },
      { icon: 'language', title: 'English and Spanish', body: 'We speak both languages — ideal if you are travelling in Medellín.' },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'How much is an in-home massage in Medellín?',
        answer:
          'The price depends on the massage, the length and your area. Message us on WhatsApp with your location and we will send you the exact price before you confirm.',
      },
      {
        question: 'Which areas of Medellín do you cover?',
        answer:
          'We visit hotels, apartments and homes in El Poblado and Laureles. For other areas, message us and we will confirm whether we can get there.',
      },
      {
        question: 'Can you come to my hotel?',
        answer:
          'Yes. We only need the hotel name and your room number. If the hotel asks visitors to register at the front desk, your therapist does it on arrival.',
      },
      {
        question: 'Which massages do you offer at home?',
        answer:
          'Relaxing, deep tissue, sports and couples (two therapists for two people). Hot stones and four-hands massage are only available at our El Poblado spa.',
      },
      {
        question: 'What do I need to prepare?',
        answer: 'Just a space of about 2 x 3 metres for the table. Your therapist brings the table, oils and clean towels.',
      },
      {
        question: 'How far in advance should I book?',
        answer:
          'We recommend messaging us a few hours ahead so we can reserve your therapist. For same-day requests, message us and we will check availability.',
      },
      {
        question: 'Can I come to the spa instead?',
        answer:
          'Of course. At our El Poblado spa you get private rooms and the full massage menu, including hot stones and four-hands massage.',
      },
    ],
    ctaTitle: 'Your massage, wherever you are',
    ctaBody: 'Message us with your area and the time you want. We will reply with the price and availability.',
    spaLink: 'I’d rather visit the spa',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = (isLocale(lang) ? lang : 'es') as Locale
  const c = content[locale]
  return mergeLandingMetadata(
    PATH,
    locale,
    { title: c.metaTitle, description: c.metaDesc },
    {
      alternates: buildAlternates(PATH, locale),
      openGraph: buildOpenGraph({ title: c.metaTitle, description: c.metaDesc, path: PATH, locale }),
    },
  )
}

const h2 = 'font-headline text-2xl md:text-3xl text-on-surface tracking-tighter mb-10'
const primaryBtn =
  'inline-block bg-primary text-on-primary font-label text-sm tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity'
const textLink = 'text-primary font-label text-xs tracking-widest uppercase hover:opacity-80 transition-opacity'

export default async function MasajesADomicilioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale
  const c = content[locale]
  const services = HOME_SERVICES.flatMap((s) => {
    const svc = getServiceById(s.id)
    return svc ? [{ svc, body: s[locale] }] : []
  })

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale)} />
      <JsonLd data={faqJsonLd(c.faqs)} />
      <LandingHead path={PATH} locale={locale} />

      <main className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Hero */}
        <section className="mb-20">
          <p className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-4">{c.heroLabel}</p>
          <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tighter leading-tight mb-6">{c.h1}</h1>
          <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl mb-8">{c.heroBody}</p>
          <WhatsAppLink text={c.waText} source="masajes-a-domicilio" className={primaryBtn}>
            {c.waCta}
          </WhatsAppLink>
        </section>

        {/* Services */}
        <section className="mb-20">
          <h2 className={h2}>{c.servicesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(({ svc, body }) => {
              const name = serviceDisplayName(svc, locale)
              return (
                <div key={svc.id} className="bg-surface-container p-8 flex flex-col gap-4">
                  <h3 className="font-headline text-xl text-on-surface tracking-tighter">{name}</h3>
                  <p className="text-zinc-400 font-body text-sm leading-relaxed flex-1">{body}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <WhatsAppLink text={c.waTextFor(name)} source="masajes-a-domicilio" className={textLink}>
                      {c.bookThis}
                    </WhatsAppLink>
                    <Link href={serviceHref(svc, locale)} className={textLink}>
                      {c.viewDetails}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-6 text-zinc-500 font-body text-sm">{c.servicesNote}</p>
        </section>

        {/* What we bring */}
        <section className="mb-20">
          <h2 className={h2}>{c.includesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.includes.map((item) => (
              <div key={item.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{item.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">{item.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="mb-20">
          <h2 className={h2}>{c.zonesTitle}</h2>
          <p className="text-zinc-400 font-body text-base leading-relaxed max-w-2xl mb-6">{c.zonesBody}</p>
          <ul className="flex flex-wrap gap-3">
            {c.zones.map((z) => (
              <li key={z} className="border border-outline-variant/30 px-4 py-2 font-label text-xs tracking-widest uppercase text-on-surface">
                {z}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <h2 className={h2}>{c.stepsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {c.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-3">
                <span className="font-label text-outline text-xs tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">{step.icon}</span>
                <h3 className="font-label font-semibold text-on-surface text-xs tracking-widest uppercase">{step.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why us */}
        <section className="mb-20">
          <h2 className={h2}>{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.why.map((w) => (
              <div key={w.title} className="bg-surface-container p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block" aria-hidden="true">{w.icon}</span>
                <h3 className="font-headline text-lg text-on-surface tracking-tighter mb-2">{w.title}</h3>
                <p className="text-zinc-400 font-body text-sm leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className={h2}>{c.faqTitle}</h2>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {c.faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="font-label text-on-surface text-sm tracking-wide cursor-pointer list-none flex justify-between items-center gap-4">
                  {faq.question}
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 group-open:rotate-180 transition-transform" aria-hidden="true">
                    expand_more
                  </span>
                </summary>
                <p className="mt-4 text-zinc-400 font-body text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-container p-12 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface tracking-tighter mb-6">{c.ctaTitle}</h2>
          <p className="text-zinc-400 font-body text-sm mb-8 max-w-md mx-auto">{c.ctaBody}</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <WhatsAppLink text={c.waText} source="masajes-a-domicilio" className={primaryBtn}>
              {c.waCta}
            </WhatsAppLink>
            <Link href={`/${locale}/book`} className="text-zinc-400 hover:text-primary font-label text-sm tracking-widest uppercase transition-colors">
              {c.spaLink}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
