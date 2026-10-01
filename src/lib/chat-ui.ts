/**
 * Textos de la interfaz del chat de la pauta (botones, etiquetas, mensajes de
 * WhatsApp y resumen de la reserva), en español e inglés.
 *
 * Los textos de las conversaciones viven en chat-flow-es.ts / chat-flow-en.ts;
 * aquí están los que pone el propio componente. Las dos versiones tienen que
 * tener exactamente las mismas claves (el tipo ChatUI lo exige).
 */
import type { Locale } from './chat-catalog'

export type ChatUI = {
  dateLocale: string
  months: string[]
  weekdays: string[]
  defaultCountryCode: string
  extraCountries: { code: string; flag: string }[]

  greetingAds: string
  greetingOrganic: string

  // Botones
  reserveSvc: (short: string) => string
  reserveBtn: string
  wantReserve: string
  anotherDoubt: string
  backToMenu: string
  seeMaps: string
  talkAdvisor: string
  writeDirect: string
  weAre2: string
  weAre3: string
  justMe: string
  back: string
  generalDoubts: string
  iHaveDoubt: string
  seeOtherOptions: string
  planDuo: string
  planSame: string
  planDistinct: string
  planHelp: string
  otherCategory: string
  changeDay: string
  openWhatsApp: string
  sameAsPerson1: string
  preferNotToSay: string
  change: string

  // Accesibilidad y marcos del chat
  monthPrev: string
  monthNext: string
  minimize: string
  closeChat: string
  countryCode: string
  send: string
  namePlaceholder: string
  onlineReception: string
  yourBooking: string
  total: string
  askDirectPerson: string

  // Conversación dentro del componente
  ok: string
  okSvc: (name: string) => string
  noted: (name: string, opt: string, price: string) => string
  notedNoPrice: (name: string, opt: string) => string
  forBoth: string
  forEach: string
  howLong: string
  person: (n: number) => string
  priceWord: string
  and: string
  openingWhatsApp: string
  changeDuo1: string
  changeSame: string
  changeDistinct1: string
  reserveDone: (name: string) => string

  // Resumen de la reserva y mensaje a WhatsApp
  twoPeople: string
  duoPartsTbc: (name: string, label: string) => string
  duoParts: (name: string, label: string, price: string) => string
  duoTechParts: (t1: string, t2: string) => string
  soloParts: (name: string, opt: string, price: string) => string[]
  sameRows: (name: string, opt: string, price: string) => string[]
  samePart: (name: string, opt: string, price: string) => string
  distinctIntroPart: string
  distinctPart: (n: number, name: string, opt: string, price: string) => string
  dateLine: (d: string) => string
  timeLine: (t: string) => string

  // Lo que queda en el lead y en WhatsApp
  topicAdvisor: string
  topicHelp2: string
  noteHelp2: string
  leadGroup: string
  leadDirect: (interest: string) => string
  nameSentence: (nm: string) => string
  msgChange: string
  msgGroup: string
  msgAdvisor: string
  msgInterest: (interest: string) => string
}

const es: ChatUI = {
  dateLocale: 'es-CO',
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  weekdays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  defaultCountryCode: '+57',
  extraCountries: [],

  greetingAds: 'Hola, vi su anuncio en Google y me gustaría más información para reservar.',
  greetingOrganic: 'Hola, me gustaría agendar una cita con recepción.',

  reserveSvc: short => `Reservar ${short}`,
  reserveBtn: 'Reservar',
  wantReserve: 'Quiero reservar',
  anotherDoubt: 'Tengo otra duda',
  backToMenu: 'Volver al menú',
  seeMaps: 'Ver en Google Maps',
  talkAdvisor: 'Hablar con una asesora',
  writeDirect: 'Escribir directo a WhatsApp',
  weAre2: 'Somos 2',
  weAre3: 'Somos 3 o más',
  justMe: 'Solo yo',
  back: 'Volver',
  generalDoubts: 'Dudas generales',
  iHaveDoubt: 'Tengo una duda',
  seeOtherOptions: 'Ver otras opciones',
  planDuo: 'Duo Masaje, juntos en la misma sala',
  planSame: 'Mismo servicio, cada uno por separado',
  planDistinct: 'Cada uno un servicio distinto',
  planHelp: 'No sé, ayúdame',
  otherCategory: 'Otra categoría',
  changeDay: 'Cambiar día',
  openWhatsApp: 'Abrir WhatsApp',
  sameAsPerson1: 'La misma que la persona 1',
  preferNotToSay: 'Prefiero no decir',
  change: 'Cambiar',

  monthPrev: 'Mes anterior',
  monthNext: 'Mes siguiente',
  minimize: 'Minimizar',
  closeChat: 'Cerrar chat',
  countryCode: 'Código de país',
  send: 'Enviar',
  namePlaceholder: 'Escribe tu nombre…',
  onlineReception: 'Recepción en línea',
  yourBooking: 'Tu reserva',
  total: 'Total',
  askDirectPerson: '¿Prefieres hablar con una persona?',

  ok: 'Perfecto.',
  okSvc: name => `Perfecto, ${name}.`,
  noted: (name, opt, price) => `Anotado: ${name} · ${opt} · ${price}`,
  notedNoPrice: (name, opt) => `Anotado: ${name} · ${opt}.`,
  forBoth: 'para los dos',
  forEach: 'para cada uno',
  howLong: '¿Cuánto tiempo?',
  person: n => `Persona ${n}`,
  priceWord: 'precio',
  and: ' y ',
  openingWhatsApp: 'Listo, te abrimos WhatsApp.',
  changeDuo1: 'Claro. Empecemos por la persona 1: ¿qué técnica prefiere?',
  changeSame: 'Claro. Elijan de nuevo el servicio y la duración; vale para los dos.',
  changeDistinct1: 'Claro. Empecemos de nuevo por la persona 1: ¿qué servicio y cuánto tiempo?',
  reserveDone: name => `¡Listo${name ? `, ${name}` : ''}! Tu reserva quedó enviada con éxito.`,

  twoPeople: '2 personas',
  duoPartsTbc: (name, label) => `Me interesa: ${name} (${label}). Técnicas distintas: el precio lo confirma recepción.`,
  duoParts: (name, label, price) => `Me interesa: ${name} (${label}, ${price} para los dos).`,
  duoTechParts: (t1, t2) => `Técnicas: persona 1 ${t1}, persona 2 ${t2}.`,
  soloParts: (name, opt, price) => [`Me interesa: ${name}.`, `Opción: ${opt}.`, `Precio: ${price}.`],
  sameRows: (name, opt, price) => [`2 personas, mismo servicio: ${name} · ${opt}`, `${price} × 2`],
  samePart: (name, opt, price) => `Somos 2 personas, mismo servicio: ${name} (${opt}, ${price} cada uno).`,
  distinctIntroPart: 'Somos 2 personas.',
  distinctPart: (n, name, opt, price) => `Persona ${n}: ${name} (${opt}, ${price}).`,
  dateLine: d => `Fecha: ${d}.`,
  timeLine: t => `Hora: ${t}.`,

  topicAdvisor: 'Hablar con una asesora',
  topicHelp2: 'Reserva para 2 personas: necesita ayuda',
  noteHelp2: 'Somos 2 personas y necesito ayuda para elegir.',
  leadGroup: 'Quiere reservar para 3 o más personas',
  leadDirect: interest => `Escribió directo a WhatsApp · Le interesa: ${interest}`,
  nameSentence: nm => ` Mi nombre es ${nm}.`,
  msgChange: 'Hola, necesito cambiar mi cita o avisar que voy a llegar tarde.',
  msgGroup: 'Hola, quisiera reservar para tres o más personas.',
  msgAdvisor: 'Hola, me gustaría hablar con una asesora de Diamond Spa.',
  msgInterest: interest => ` Me interesa: ${interest}.`,
}

const en: ChatUI = {
  dateLocale: 'en-US',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  defaultCountryCode: '+1',
  extraCountries: [
    { code: '+44', flag: '🇬🇧' },
    { code: '+33', flag: '🇫🇷' },
    { code: '+49', flag: '🇩🇪' },
  ],

  greetingAds: 'Hello, I saw your Google ad and would like more information to book.',
  greetingOrganic: 'Hello, I would like to book an appointment with reception.',

  reserveSvc: short => `Book ${short}`,
  reserveBtn: 'Book',
  wantReserve: 'I want to book',
  anotherDoubt: 'I have another question',
  backToMenu: 'Back to menu',
  seeMaps: 'See on Google Maps',
  talkAdvisor: 'Talk to an advisor',
  writeDirect: 'Message us directly on WhatsApp',
  weAre2: 'There are 2 of us',
  weAre3: 'There are 3 or more of us',
  justMe: 'Just me',
  back: 'Back',
  generalDoubts: 'General questions',
  iHaveDoubt: 'I have a question',
  seeOtherOptions: 'See other options',
  planDuo: 'Duo Massage, together in the same room',
  planSame: 'Same service, each separately',
  planDistinct: 'A different service each',
  planHelp: "I'm not sure, help me",
  otherCategory: 'Another category',
  changeDay: 'Change day',
  openWhatsApp: 'Open WhatsApp',
  sameAsPerson1: 'Same as person 1',
  preferNotToSay: "I'd rather not say",
  change: 'Change',

  monthPrev: 'Previous month',
  monthNext: 'Next month',
  minimize: 'Minimize',
  closeChat: 'Close chat',
  countryCode: 'Country code',
  send: 'Send',
  namePlaceholder: 'Type your name…',
  onlineReception: 'Online reception',
  yourBooking: 'Your booking',
  total: 'Total',
  askDirectPerson: 'Prefer to talk to a person?',

  ok: 'Perfect.',
  okSvc: name => `Perfect, ${name}.`,
  noted: (name, opt, price) => `Got it: ${name} · ${opt} · ${price}`,
  notedNoPrice: (name, opt) => `Got it: ${name} · ${opt}.`,
  forBoth: 'for both',
  forEach: 'each',
  howLong: 'How long?',
  person: n => `Person ${n}`,
  priceWord: 'price',
  and: ' and ',
  openingWhatsApp: 'Done, we are opening WhatsApp for you.',
  changeDuo1: "Sure. Let's start with person 1: which technique would they prefer?",
  changeSame: 'Sure. Pick the service and the duration again; it applies to both of you.',
  changeDistinct1: "Sure. Let's start over with person 1: which service and for how long?",
  reserveDone: name => `All set${name ? `, ${name}` : ''}! Your booking was sent successfully.`,

  twoPeople: '2 people',
  duoPartsTbc: (name, label) => `I'm interested in: ${name} (${label}). Different techniques: reception confirms the price.`,
  duoParts: (name, label, price) => `I'm interested in: ${name} (${label}, ${price} for both).`,
  duoTechParts: (t1, t2) => `Techniques: person 1 ${t1}, person 2 ${t2}.`,
  soloParts: (name, opt, price) => [`I'm interested in: ${name}.`, `Option: ${opt}.`, `Price: ${price}.`],
  sameRows: (name, opt, price) => [`2 people, same service: ${name} · ${opt}`, `${price} × 2`],
  samePart: (name, opt, price) => `There are 2 of us, same service: ${name} (${opt}, ${price} each).`,
  distinctIntroPart: 'There are 2 of us.',
  distinctPart: (n, name, opt, price) => `Person ${n}: ${name} (${opt}, ${price}).`,
  dateLine: d => `Date: ${d}.`,
  timeLine: t => `Time: ${t}.`,

  topicAdvisor: 'Talk to an advisor',
  topicHelp2: 'Booking for 2 people: needs help',
  noteHelp2: 'There are 2 of us and I need help choosing.',
  leadGroup: 'Wants to book for 3 or more people',
  leadDirect: interest => `Wrote directly on WhatsApp · Interested in: ${interest}`,
  nameSentence: nm => ` My name is ${nm}.`,
  msgChange: "Hello, I need to change my appointment or let you know I'll be late.",
  msgGroup: "Hello, I'd like to book for three or more people.",
  msgAdvisor: "Hello, I'd like to talk to a Diamond Spa advisor.",
  msgInterest: interest => ` I'm interested in: ${interest}.`,
}

export const UI: Record<Locale, ChatUI> = { es, en }

export const uiFor = (locale: Locale): ChatUI => UI[locale]
