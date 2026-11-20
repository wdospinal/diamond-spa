import type { Plan } from '@/lib/planes'

const duration = (min: number) =>
  min % 60 ? `${Math.floor(min / 60) ? `${Math.floor(min / 60)} h ` : ''}${min % 60} min` : `${min / 60} h`

/** Copy shared by the /planes hub, each plan page and the plan cards. */
export const planUi = {
  es: {
    hubLabel: 'Planes · El Poblado, Medellín',
    hubH1: 'Planes de Spa en Medellín',
    hubIntro:
      'Planes con nombre propio para cada ocasión: rituales para él, despedidas de soltero, cumpleaños, planes con amigos, en pareja y bonos de sesiones. Todos en cabina privada en El Poblado, con el precio a la vista.',
    hubMetaTitle: 'Planes de Spa en Medellín: Despedidas, Cumpleaños y Para Él | Diamond Spa',
    hubMetaDesc: (from: string) =>
      `Planes de spa en Medellín desde ${from}: Ritual del Caballero, despedida de soltero, cumpleaños, planes para amigos, en pareja y bonos. Cabina privada en El Poblado.`,
    back: '← Todos los planes',
    duration,
    sessions: (n: number, min: number) => `${n} × ${duration(min)}`,
    persons: (p: string) => (p === '1' ? '1 persona' : p.endsWith('+') ? `Desde ${p.slice(0, -1)} personas` : `${p} personas`),
    priceUnit: (p: Plan) =>
      p.audience === 'pareja' ? 'por pareja' : p.audience === 'grupo' ? 'por invitado' : p.sessions ? `${p.sessions} sesiones` : 'por persona',
    idealFor: 'Ideal para',
    includes: 'Incluye',
    eachGuest: 'Cada invitado',
    book: 'Reservar en línea',
    whatsapp: 'Reservar por WhatsApp',
    gift: 'Regalar',
    waText: (name: string) => `¡Hola! Quiero reservar el plan "${name}". Fecha: ___ · Personas: ___`,
    giftText: (name: string) => `¡Hola! Quiero regalar el plan "${name}".`,
    priceNote: 'Precio con nuestras tarifas vigentes. Te confirmamos todo por WhatsApp antes de pagar.',
    groupNote: 'Organizamos los turnos según las cabinas disponibles. Escríbenos con la fecha y el número de personas.',
    faqTitle: (name: string) => `${name}: preguntas frecuentes`,
    faqLabel: 'Preguntas frecuentes',
    otherPlans: 'Otros planes',
    home: 'Inicio',
    hub: 'Planes',
    helpTitle: '¿Tienes otra ocasión en mente?',
    helpBody: 'Cuéntanos para quién es, cuántas personas y tu presupuesto, y armamos el plan.',
    helpCta: 'Escríbenos por WhatsApp',
    helpText: '¡Hola! Quiero armar un plan de spa para una ocasión especial.',
    giftsLink: 'Regalos por fecha especial →',
  },
  en: {
    hubLabel: 'Plans · El Poblado, Medellín',
    hubH1: 'Spa Plans in Medellín',
    hubIntro:
      'Named plans for every occasion: rituals for him, bachelor parties, birthdays, plans with friends, for couples and session bundles. All in a private room in El Poblado, with the price up front.',
    hubMetaTitle: 'Spa Plans in Medellín: Bachelor Parties, Birthdays & For Him | Diamond Spa',
    hubMetaDesc: (from: string) =>
      `Spa plans in Medellín from ${from}: the Gentleman’s Ritual, bachelor parties, birthdays, plans for friends, couples and bundles. Private rooms in El Poblado.`,
    back: '← All plans',
    duration,
    sessions: (n: number, min: number) => `${n} × ${duration(min)}`,
    persons: (p: string) => (p === '1' ? '1 person' : p.endsWith('+') ? `${p.slice(0, -1)}+ people` : `${p} people`),
    priceUnit: (p: Plan) =>
      p.audience === 'pareja' ? 'per couple' : p.audience === 'grupo' ? 'per guest' : p.sessions ? `${p.sessions} sessions` : 'per person',
    idealFor: 'Ideal for',
    includes: 'Includes',
    eachGuest: 'Each guest',
    book: 'Book online',
    whatsapp: 'Book on WhatsApp',
    gift: 'Give as a gift',
    waText: (name: string) => `Hi! I would like to book the "${name}" plan. Date: ___ · People: ___`,
    giftText: (name: string) => `Hi! I would like to give the "${name}" plan as a gift.`,
    priceNote: 'Price at our current rates. We confirm everything on WhatsApp before you pay.',
    groupNote: 'We schedule the sessions around the rooms available. Message us with the date and the number of people.',
    faqTitle: (name: string) => `${name}: common questions`,
    faqLabel: 'Frequently asked questions',
    otherPlans: 'Other plans',
    home: 'Home',
    hub: 'Plans',
    helpTitle: 'Have another occasion in mind?',
    helpBody: 'Tell us who it is for, how many people and your budget, and we put the plan together.',
    helpCta: 'Message us on WhatsApp',
    helpText: 'Hi! I would like to put together a spa plan for a special occasion.',
    giftsLink: 'Gifts for special dates →',
  },
} as const
