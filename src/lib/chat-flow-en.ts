/**
 * Chat texts and branches for the pauta landing (English).
 *
 * Same flow, same branches and same buttons as chat-flow-es.ts, in the voice
 * of Diamond Spa's reception: short sentences, friendly, one question at a
 * time. Prices come from the catalog (chat-catalog.ts), never typed by hand.
 * The Spanish file is the reference: chat-flow-en.test.ts checks that both
 * keep the same structure.
 */
import { m as priceOf, type Cat } from './chat-catalog'
import type { Branch, Doubt, Follow, HelpGroup, HelpOpt } from './chat-flow-es'

/**
 * Every price in this file states the currency: an English reader can take
 * "$200.000" for two hundred dollars, so it always reads "$200.000 COP".
 */
const m = (id: string, key?: 30 | 60 | 90 | 'wax' | 'machine') => `${priceOf(id, key)} COP`

export const GREETING = [
  "Hi! I'm Diamond Spa's online reception.",
  'I can answer your questions and get your booking ready in a minute. What can I help you with today?',
]
export const ASK_MENU = 'What can I help you with today?'
export const ASK_GENERAL = 'Sure, what would you like to know?'
export const ASK_DOUBT = 'Sure. Tap the one closest to your question.'
export const ASK_BACK = 'What would you prefer?'
export const DELICATE_LABEL = 'Things that feel awkward to ask'
export const ASK_DELICATE = 'You can ask anything here, no judgment. Tap the one closest to your question.'

// ─── General questions ────────────────────────────────────────────────────────
export const GENERAL: (Doubt & { id: string })[] = [
  {
    id: 'donde', label: 'Where are you?', icon: 'pin',
    answer: [
      "We're at Cra 43C #10-42, in El Poblado, Medellín. It's about a 10-minute walk from Parque Lleras, and a few minutes by car from Parque El Poblado.",
      "There's parking right in front and a parking lot on the same block.",
    ],
    follow: [{ k: 'maps' }, { k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'horarios', label: 'Opening hours', icon: 'clock',
    answer: [
      "We're open Monday to Saturday from 10:00 AM to 10:00 PM, and Sundays from 10:00 AM to 7:00 PM.",
      "On public holidays we usually open like on a Sunday; if you're coming on a holiday, message us first to confirm.",
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'como', label: 'How to book', icon: 'calendar', bare: true,
    answer: [
      "It's very easy: you tell me which service you want, for how long, and which day and time suit you.",
      "At the end you leave me your name and phone number, and WhatsApp opens with your request already written; reception confirms availability.",
      "I recommend booking ahead: the cabins are private and we have a limited number of therapists. Which service shall we start with?",
    ],
    follow: [
      { k: 'reserveCat', cat: 'masajes' },
      { k: 'reserveCat', cat: 'faciales' },
      { k: 'reserveCat', cat: 'depilacion' },
    ],
  },
  {
    id: 'precios', label: 'Prices', icon: 'tag', bare: true,
    answer: [
      `Massages start at ${m('relaxing', 30)} (30 min), and the most popular one, the 60-minute relaxing massage, costs ${m('relaxing', 60)}.`,
      `Facials start at ${m('lf-basica')}. Hair removal starts at ${m('dep-axila', 'machine')}, depending on the area and whether it's wax or machine. Prices are in Colombian pesos (COP). Which would you like to see?`,
    ],
    follow: [
      { k: 'catalog', cat: 'masajes' },
      { k: 'catalog', cat: 'faciales' },
      { k: 'catalog', cat: 'depilacion' },
    ],
  },
  {
    id: 'pagos', label: 'Payments and invoice', icon: 'card',
    answer: [
      'We accept cards, Nequi, Daviplata (Colombian mobile wallets), cash and bank transfer, and we also take US dollars.',
      "Prices already include VAT (IVA), there are no hidden costs, and we don't ask for a deposit to book. If you need an invoice, you can request it at the register.",
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'propina', label: 'Tipping', icon: 'card',
    answer: [
      "We don't ask for tips and they're not required.",
      'The price we quote you is the full price.',
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'cambiar', label: 'Change my appointment or arrive late', icon: 'refresh',
    answer: ["Of course. If you need to reschedule or you're going to be late, message us directly on WhatsApp so we can keep your appointment."],
    follow: [{ k: 'change' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'primera', label: 'First time at a spa', icon: 'sparkles',
    answer: [
      "Great that you're giving it a try! Arrive 5 to 10 minutes early; you don't need to bring anything, we provide towels and everything else.",
      "You undress only as far as you feel comfortable, you're covered with towels, and you can ask for more or less pressure whenever you like. Our therapists are certified and the cabin is private.",
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'grupo', label: 'Book for two or more people', icon: 'users', bare: true,
    answer: [
      `Each cabin is for two people at most. For two, we have the Duo Massage: the same private room, two massage tables and two therapists (${m('duo', 60)} for 60 min and ${m('duo', 90)} for 90 min, for both with the same technique). If each of you wants a different technique, the price changes and reception confirms it for you.`,
      "If there are 3 or more of you, we split you across other cabins depending on availability, and reception confirms that on WhatsApp. How many of you are there?",
    ],
    follow: [{ k: 'people', n: 2 }, { k: 'people', n: 3 }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'otra', label: 'Another question', icon: 'help', bare: true,
    answer: ["Sure. Someone from reception can answer that better: I'll connect you on WhatsApp."],
    follow: [{ k: 'advisor' }, { k: 'reserve' }],
  },
]

// ─── Branches by category ─────────────────────────────────────────────────────
export const HELP_DELICATE_LABEL = "Things I'm embarrassed to mention"
const HELP_DELICATE_ASK = 'You can tell me anything here, no judgment. Tap the one closest to your situation.'
const DELICATE_GROUP = (): HelpGroup => ({ id: 'pena', label: HELP_DELICATE_LABEL, ask: HELP_DELICATE_ASK, icon: 'chat' })

const R = (svc: string): Follow => ({ k: 'reserve', svc })

// ─── "Help me choose": massages, by kind of need ──────────────────────────────
const MASAJES_GROUPS: HelpGroup[] = [
  { id: 'dolor', label: 'Body pain or tension', ask: 'Tell me, where do you feel it or what is going on?', icon: 'hand' },
  { id: 'estres', label: 'Stress, anxiety and mind', ask: 'Tell me, how are you feeling?', icon: 'leaf' },
  { id: 'deporte', label: 'Training and sports', ask: 'When do you train or compete?', icon: 'refresh' },
  { id: 'personas', label: 'For two or more people', ask: 'How are you coming?', icon: 'users' },
  { id: 'especial', label: 'First time and special experiences', ask: 'Tell me, what would you like to experience?', icon: 'sparkles' },
  DELICATE_GROUP(),
]

const MASAJES_HELP: HelpOpt[] = [
  // Body pain or tension
  {
    group: 'dolor',
    label: 'Relieve back pain or tight muscles',
    reply: [
      `Deep tissue works very well for that (${m('deep-tissue', 60)} for 60 min): it works slowly and firmly on the lower back, upper back and shoulders.`,
      'Tell the therapist exactly where it hurts before you start.',
    ],
    follow: [R('deep-tissue')],
  },
  {
    group: 'dolor',
    label: 'Neck and shoulders loaded from work',
    reply: [
      `Deep tissue (${m('deep-tissue', 60)} for 60 min) or the sports massage (${m('sports', 60)} for 60 min, with a percussion gun and assisted stretching) work directly on the trapezius and the neck area.`,
      `If you're short on time, a 30-minute session focused only on the upper body also works (${m('deep-tissue', 30)} for deep tissue).`,
    ],
    follow: [R('deep-tissue'), R('sports')],
  },
  {
    group: 'dolor',
    label: 'An injury or discomfort in one spot',
    reply: [
      `When the problem is an injury or a specific spot, a deep-tissue session with a single therapist does more: deep tissue (${m('deep-tissue', 60)} for 60 min) works that spot slowly and firmly.`,
      'Tell us when you book if you have any pain, injury or condition, and tell the therapist exactly where so she can adapt the technique and the pressure.',
    ],
    follow: [R('deep-tissue'), { k: 'advisor' }],
  },
  // Stress, anxiety and mind
  {
    group: 'estres',
    label: 'Relax, lower my stress',
    reply: [
      `To let go of stress you'll love the relaxing massage (${m('relaxing', 60)} for 60 min). And if you like warmth, there are the volcanic stones (${m('hot-stones', 60)} for 60 min): heated basalt stones on key points.`,
      'A tip: for stress, 60 or 90 minutes do more than 30.',
    ],
    follow: [R('relaxing'), R('hot-stones')],
  },
  {
    group: 'estres',
    label: 'I have trouble switching off my mind',
    reply: [
      `That's what the Four Hands massage is for (${m('four-hands', 60)} for 60 min): two therapists work on your body at the same time and in sync, and your mind stops following the movement and lets go much faster.`,
      "It's the most immersive session we offer and we recommend it from 60 minutes.",
    ],
    follow: [R('four-hands')],
  },
  {
    group: 'estres',
    label: 'Something deeper than a relaxing massage, but without strong pressure',
    reply: [
      `Then the volcanic stones (${m('hot-stones', 60)} for 60 min): basalt stones that are heated, placed on key points and also used as an extension of the therapist's hand.`,
      "It's deeper than the relaxing massage and works the nervous system more than specific knots, so it isn't a strong-pressure massage like deep tissue.",
    ],
    follow: [R('hot-stones')],
  },
  // Training and sports
  {
    group: 'deporte',
    label: 'Recover after training',
    reply: [`The sports massage is for you (${m('sports', 60)} for 60 min): it adds a percussion gun and assisted stretching, and most people book it right after training.`],
    follow: [R('sports')],
  },
  {
    group: 'deporte',
    label: 'Prepare before training or competing',
    reply: [
      `Before training, a short, activating session helps: it improves mobility and prepares the muscle. The sports massage (${m('sports', 30)} for 30 min and ${m('sports', 60)} for 60) adds a percussion gun and assisted stretching.`,
      'After training, a few hours later or the next day, a deeper session works better for fatigue.',
    ],
    follow: [R('sports')],
  },
  // For two or more people
  {
    group: 'personas',
    label: 'Massage for two or more people',
    reply: [
      `For two people there's the Duo Massage (${m('duo', 60)} for 60 min and ${m('duo', 90)} for 90 min, for both): the same private room, two massage tables and two therapists, and each of you picks your technique.`,
      'With the same technique for both, the price is the Duo price; if you pick different techniques, the price changes and reception confirms it for you.',
      "If there are 3 or more of you, we split you across other cabins depending on availability, and reception confirms that on WhatsApp.",
    ],
    follow: [R('duo'), { k: 'people', n: 3 }],
  },
  {
    group: 'personas',
    label: "There are two of us and each wants something different",
    reply: [
      "That's possible: in the Duo Massage each of you picks your technique (relaxing, deep tissue, sports, volcanic stones or sensitive), in the same private room with two massage tables and two therapists.",
      `With different techniques the price differs from the Duo price with the same technique (${m('duo', 60)} for 60 min and ${m('duo', 90)} for 90, for both), and reception confirms the total for you on WhatsApp.`,
    ],
    follow: [R('duo')],
  },
  // First time and special experiences
  {
    group: 'especial',
    label: "It's my first time and I don't know which to pick",
    reply: [
      `To start, I recommend the relaxing massage (${m('relaxing', 60)} for 60 min): it's the most popular, with long, gentle movements that feel good the whole time.`,
      'And you can ask for more or less pressure at any moment: just tell the therapist.',
    ],
    follow: [R('relaxing')],
  },
  {
    group: 'especial',
    label: "I'm short on time",
    reply: [
      `With 30 minutes you can work one specific area, like neck and shoulders: relaxing costs ${m('relaxing', 30)} and deep tissue ${m('deep-tissue', 30)}.`,
      'That said: for general stress, 60 or 90 minutes do much more than 30, because the body needs time to let go.',
    ],
    follow: [R('relaxing'), R('deep-tissue')],
  },
  {
    group: 'especial',
    label: 'Something special, different from a regular massage',
    reply: [
      `Three options: Four Hands (${m('four-hands', 60)} for 60 min), with two therapists working at once and in sync; the volcanic stones (${m('hot-stones', 60)} for 60 min), with heated basalt stones; and the sensitive massage (${m('sensitive', 60)} for 60 min), with gentle, slow movements to release tension.`,
    ],
    follow: [R('four-hands'), R('hot-stones'), R('sensitive')],
  },
  {
    group: 'especial',
    label: 'A slow, full-body experience',
    reply: [`Then the sensitive massage (${m('sensitive', 60)} for 60 min): gentle, slow movements to release tension, with no deep pressure.`],
    follow: [R('sensitive')],
  },
  // Things I'm embarrassed to mention
  {
    group: 'pena',
    label: 'I have anxiety or feel overwhelmed',
    reply: [
      `Thank you for telling me. For stress and anxiety the relaxing massage works very well (${m('relaxing', 60)} for 60 min) and, if you want something deeper, the volcanic stones (${m('hot-stones', 60)} for 60 min): both work on the nervous system more than on specific knots.`,
      "60 or 90 minutes do more than 30, because the body needs time to let go. A massage helps you relax, but it doesn't replace support from a health professional if you need it.",
    ],
    follow: [R('relaxing'), R('hot-stones')],
  },
  {
    group: 'pena',
    label: "I'm embarrassed to go alone",
    reply: [
      "Not at all: most of our clients come alone. A massage is a private, one-to-one session in a closed cabin, so coming alone is the norm, not the exception.",
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: "I'm afraid it will hurt or I can't handle strong pressure",
    reply: [
      `Then pick a gentle one: the relaxing massage (${m('relaxing', 60)} for 60 min) feels good the whole time, and the sensitive massage (${m('sensitive', 60)} for 60 min) is slow and gentle, with no deep pressure.`,
      'And in any of them you can ask for more or less pressure whenever you like: just say so and the therapist adjusts.',
    ],
    follow: [R('relaxing'), R('sensitive')],
  },
  {
    group: 'pena',
    label: "It makes me nervous to be touched by a therapist I don't know",
    reply: [
      "It's more common than you think. The session is private, one-to-one, in a closed cabin with a certified therapist who does this every day; you're covered with towels and only the area being worked on is uncovered.",
      'And at any moment you can ask her to stop, change the pressure, or skip an area.',
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: "An area hurts and I'm embarrassed to have it touched",
    reply: [
      "Tell the therapist exactly where it hurts before you start: she adjusts the technique and the pressure, and you can ask her not to work on an area. You're covered with towels and only the area being worked on is uncovered.",
      `For deep muscle pain, deep tissue usually works best (${m('deep-tissue', 60)} for 60 min).`,
    ],
    follow: [R('deep-tissue')],
  },
  {
    group: 'pena',
    label: "I'm self-conscious about my body",
    reply: [
      "It's more common than you think. Our therapists work with all kinds of bodies every day and focus on how you feel, not on how you look.",
      "Plus, you're covered with towels and only the area being worked on is uncovered.",
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'I come sweaty from the gym or work',
    reply: [
      "No problem: ideally you arrive freshly showered, but if you're coming from the gym or a long day, the important thing is that you arrive comfortable. Therapists see this every day.",
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'I have scars or marks on my skin',
    reply: [
      'Our therapists work with all kinds of bodies every day and focus on how you feel, not on how you look.',
      "If the scar is from recent surgery, tell us when you book: in most cases we adapt the technique, the pressure and the position.",
    ],
    follow: [{ k: 'reserve' }, { k: 'advisor' }],
  },
]

// ─── "Help me choose": facials ────────────────────────────────────────────────
const FACIALES_GROUPS: HelpGroup[] = [
  { id: 'piel', label: 'How my skin is', ask: 'Tell me, how is your skin?', icon: 'sparkles' },
  { id: 'ocasion', label: 'An occasion or an area', ask: 'Tell me, what do you need?', icon: 'calendar' },
  DELICATE_GROUP(),
]

const FACIALES_HELP: HelpOpt[] = [
  {
    group: 'piel',
    label: 'Oily skin, enlarged pores or blackheads',
    reply: [`Deep facial cleansing (${m('lf-profunda')}, 60 min) or the HydraFacial (${m('hidrafacial')}, 90 min) work very well for that. We adjust the products to control oil without drying out your skin.`],
    follow: [R('lf-profunda'), R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'Sensitive skin',
    reply: [`With sensitive skin we go gently: basic facial cleansing (${m('lf-basica')}, 45 min) or facial hydration (${m('hidratacion')}, 45 min), with no aggressive extractions.`, 'If you use any active products, tell the therapist.'],
    follow: [R('lf-basica'), R('hidratacion')],
  },
  {
    group: 'piel',
    label: 'Dull skin or I want an immediate result',
    reply: [`Then the HydraFacial (${m('hidrafacial')}, 90 min): it cleanses, exfoliates and hydrates in a single session, with no days of redness.`, "There's no recovery: you can put on makeup the same day."],
    follow: [R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'Dry or dehydrated skin',
    reply: [
      `Facial hydration (${m('hidratacion')}, 45 min) goes straight to that. And if your skin also looks dull, the HydraFacial (${m('hidrafacial')}, 90 min) is also used for dehydration and lack of radiance.`,
      'With dry skin, a deep cleansing every two months works better than every month.',
    ],
    follow: [R('hidratacion'), R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'I have acne',
    reply: [
      `Deep facial cleansing (${m('lf-profunda')}, 60 min) helps as a support: it decongests pores, reduces blackheads and improves skin texture. If your skin is oily or acne-prone, it's usually done every month.`,
      "It doesn't replace dermatologist treatment for moderate or severe acne. If you have active inflamed breakouts, let us know and we'll adapt the session or recommend waiting.",
    ],
    follow: [R('lf-profunda'), { k: 'advisor' }],
  },
  {
    group: 'piel',
    label: "I don't know what my skin needs",
    reply: [
      "No problem, you don't need to know anything: tell the therapist how your skin feels and what bothers you, and she'll guide you and give you a basic routine for home care.",
      `If you want to start gently, basic facial cleansing (${m('lf-basica')}, 45 min) has no aggressive extractions; and if you want the most complete treatment, the HydraFacial (${m('hidrafacial')}, 90 min).`,
    ],
    follow: [R('lf-basica'), R('hidrafacial')],
  },
  {
    group: 'ocasion',
    label: 'I have an event and want to look good',
    reply: [
      `The HydraFacial (${m('hidrafacial')}, 90 min) is the right one: there's no recovery and you can put on makeup the same day, so it works very well before an event.`,
      'Deep cleansing includes extractions: afterwards your skin may look a bit red and it is best to wait about 24 hours before makeup, so do it a day ahead.',
    ],
    follow: [R('hidrafacial'), R('lf-profunda')],
  },
  {
    group: 'ocasion',
    label: 'Shaving irritation or ingrown hairs',
    reply: [`Deep facial cleansing (${m('lf-profunda')}, 60 min) helps with shaving irritation, ingrown hairs and enlarged pores; it's one of the most requested by men.`],
    follow: [R('lf-profunda')],
  },
  {
    group: 'ocasion',
    label: 'Clean my back',
    reply: [`For the back we have the back cleansing (${m('lf-espalda')}, 60 min).`],
    follow: [R('lf-espalda')],
  },
  // Things I'm embarrassed to mention
  {
    group: 'pena',
    label: "I have breakouts on my back and I'm embarrassed to show it",
    reply: [
      `For that we have the back cleansing (${m('lf-espalda')}, 60 min). Our therapists see all kinds of skin every day and nobody judges you: just tell them what bothers you.`,
      "If you have active inflamed breakouts, let us know and we'll adapt the session or recommend waiting.",
    ],
    follow: [R('lf-espalda')],
  },
  {
    group: 'pena',
    label: "I'm embarrassed to get a facial",
    reply: [
      `It's more common than you think among our male clients: deep facial cleansing (${m('lf-profunda')}, 60 min) is one of our most requested treatments, and it's especially effective against shaving irritation, ingrown hairs, enlarged pores and pollution damage.`,
      'Everything happens in a private cabin and the therapist guides you from the start.',
    ],
    follow: [R('lf-profunda')],
  },
  {
    group: 'pena',
    label: "I don't want blackheads squeezed or extracted by hand",
    reply: [
      `Then the HydraFacial (${m('hidrafacial')}, 90 min): it cleanses, exfoliates, extracts impurities and hydrates with controlled suction and serums, instead of manual pressure.`,
      'And if you prefer deep cleansing, extraction is more uncomfortable than painful and only in the most congested areas, usually the nose and chin; you can ask for less intensity whenever you like.',
    ],
    follow: [R('hidrafacial'), R('lf-profunda')],
  },
]

// ─── "Help me choose": hair removal ───────────────────────────────────────────
const DEPILACION_GROUPS: HelpGroup[] = [
  { id: 'general', label: 'Wax, machine and aftercare', ask: 'Tell me, what do you need to know?', icon: 'leaf' },
  DELICATE_GROUP(),
]

const DEPILACION_HELP: HelpOpt[] = [
  {
    group: 'general',
    label: 'Wax or machine',
    reply: [
      `Good question. The machine clearly hurts less and is cheaper: a full leg costs ${m('dep-pierna', 'machine')} with the machine and ${m('dep-pierna', 'wax')} with wax.`,
      'In exchange, wax pulls the hair out from the root, so the result lasts weeks instead of days.',
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'See areas and prices' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: "It's my first time getting waxed",
    reply: [
      'The first session is always the most uncomfortable; from the second one the hair grows back finer and it hurts quite a bit less. If pain worries you, the machine clearly hurts less than wax.',
      "For wax, the hair should be between 5 mm and 1 cm long (about two or three weeks of growth), so don't shave in the days before your appointment.",
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'See areas and prices' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: 'Hair removal for men',
    reply: [
      `Yes, we wax men. The most requested areas are chest (${m('dep-pecho', 'wax')} with wax, ${m('dep-pecho', 'machine')} with the machine), back (${m('dep-espalda', 'wax')} and ${m('dep-espalda', 'machine')}) and full body (${m('dep-full', 'wax')} and ${m('dep-full', 'machine')}).`,
      'Everything happens in a private cabin, with a certified therapist. The back is one of the least sensitive areas, so it is among the most tolerable.',
    ],
    follow: [R('dep-pecho'), R('dep-espalda'), R('dep-full')],
  },
  {
    group: 'general',
    label: 'I want it to last longer',
    reply: [
      'Then wax: it pulls the hair out from the root and gives a clean, immediate result, ideal for a specific date like a trip or an event. The hair comes back in about three or four weeks.',
      'And if you keep up the rhythm, waxing every three or four weeks, the hair grows back finer and sparser, and sessions hurt less.',
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'See areas and prices' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: 'My skin gets irritated or I get ingrown hairs',
    reply: [
      'What helps most is aftercare: gently exfoliate two or three times a week starting 48 hours later, moisturize daily, and avoid very tight clothing for the first few days.',
      'Wait about 24 hours before working out: sweat and friction on freshly opened follicles are the main cause of irritation and small bumps. That same day also avoid pools, saunas and sun.',
    ],
    follow: [{ k: 'reserve' }],
  },
  // Things I'm embarrassed to mention
  {
    group: 'pena',
    label: 'I want to wax my intimate area',
    reply: [
      `It's booked as intimate-area waxing (${m('dep-bikini', 'wax')} with wax, ${m('dep-bikini', 'machine')} with the machine): it removes the hair from the whole area, front to back, and you decide the finish with the therapist before starting.`,
      "It's in a private cabin and you only undress the area that will be waxed. If pain worries you, the machine clearly hurts less than wax; the first session is the most uncomfortable.",
    ],
    follow: [R('dep-bikini')],
  },
  {
    group: 'pena',
    label: 'I want to wax the perianal area',
    reply: [
      `It's the removal of the hair around the anus and between the buttocks. It costs ${m('dep-perianal', 'wax')} with wax and ${m('dep-perianal', 'machine')} with the machine, and takes about 30 minutes.`,
      'It is one of the most sensitive areas, so the first session is usually the most uncomfortable; the machine clearly hurts less. Everything happens in a private cabin, with a certified therapist.',
    ],
    follow: [R('dep-perianal')],
  },
  {
    group: 'pena',
    label: "I'm embarrassed about my hair",
    reply: [
      "The therapist does this every day and nobody judges you. Just keep in mind that for wax the ideal is hair between 5 mm and 1 cm; if it's much longer, it hurts more.",
      "And don't shave in the days before your appointment.",
    ],
    follow: [{ k: 'reserve' }],
  },
]

export const BRANCHES: Record<Cat, Branch> = {
  masajes: {
    intro: 'Good choice. How can I help you with massages?',
    helpLabel: 'Help me choose',
    helpAsk: 'Tell me, what are you looking for in a massage? Tap the topic that fits best.',
    helpGroups: MASAJES_GROUPS,
    help: MASAJES_HELP,
    catalogLabel: 'See massages and prices',
    catalogIntro: 'These are our massages (prices in COP); tap the one that catches your eye.',
    doubts: [
      {
        label: 'Relaxing or deep tissue?',
        answer: ['Good question. The relaxing massage uses gentle movements to lower stress and feels good the whole time.', 'Deep tissue applies slower, firmer pressure on knots and chronic tension; it can feel intense in the most loaded spots.'],
        follow: [R('relaxing'), R('deep-tissue')],
      },
      {
        label: 'Does deep tissue hurt?',
        answer: ["It's normal to ask. It should feel like a strong but productive discomfort, the kind you can breathe through without a problem; never like sharp pain.", 'And you can ask for less pressure at any moment.'],
        follow: [R('deep-tissue')],
      },
      {
        label: 'Sports massage before or after training?',
        answer: ['Both work. Before, a short session that activates the muscle; after (a few hours later or the next day), a deeper one for fatigue.', 'Most people book it after.'],
        follow: [R('sports')],
      },
      {
        label: '30, 60 or 90 minutes?',
        answer: ['It depends on what you are looking for. For stress and deep tissue, 60 or 90 minutes do more.', 'With 30 minutes you can work one specific area, like neck and shoulders.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'How often should I get one?',
        answer: ['If you have constant tension, every two to four weeks.', 'If you are treating an active problem, one session a week for three or four weeks and then space them out.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'What is Four Hands and is it worth it?',
        answer: ['Two therapists work on your body at the same time and in sync; your mind stops following the movement and lets go faster. It is ideal if you have trouble switching off.', 'If what you have is a specific injury, deep tissue with a single therapist does more.'],
        follow: [R('four-hands')],
      },
      {
        label: 'What do I wear? Do I take everything off?',
        answer: ['It is very simple: you undress as far as you feel comfortable; most people keep their underwear on.', "We leave you alone to change and you're covered with towels: only the area being worked on is uncovered."],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Health conditions',
        answer: ["Thanks for asking, it's important. Tell us when you book if you have uncontrolled high blood pressure, varicose veins, thrombosis, recent surgery, fever or skin infections, or if you take blood thinners.", 'In most cases we adapt the technique.'],
        follow: [{ k: 'advisor' }, { k: 'reserve' }],
      },
      {
        label: 'Is it a 100% professional massage?', delicate: true,
        answer: [
          'Yes. Diamond Spa is a professional spa: our therapists are certified and our services are exclusively therapeutic and aesthetic.',
          "If you're looking for anything other than a professional massage, you won't find it here.",
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: "I'm self-conscious about my body", delicate: true,
        answer: [
          "It's more common than you think. Our therapists work with all kinds of bodies every day and focus on how you feel, not on how you look.",
          "Plus, you're covered with towels and only the area being worked on is uncovered.",
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'What if something makes me uncomfortable during the massage?', delicate: true,
        answer: [
          'You say so right then, no embarrassment: you can ask for more or less pressure, change the music or the temperature, or skip an area, and the therapist adjusts.',
          'If you would rather say it afterwards, you can also tell reception.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Do I have to shower first?', delicate: true,
        answer: ["Ideally you arrive freshly showered, as for any appointment with a professional. If you're coming from the gym or a long day, no problem: the important thing is that you arrive comfortable."],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Is it normal to fall asleep or snore?', delicate: true,
        answer: ["Very normal, and a good sign: it means you managed to let go. It happens all the time and there's nothing to worry about."],
        follow: [{ k: 'reserve' }],
      },
    ],
  },

  faciales: {
    intro: 'Good choice. How can I help you with your skin?',
    helpLabel: 'Help me choose',
    helpAsk: 'Tell me, how is your skin or what do you need? Tap the topic that fits best.',
    helpGroups: FACIALES_GROUPS,
    help: FACIALES_HELP,
    catalogLabel: 'See facials and prices',
    catalogIntro: 'These are our facials (prices in COP); tap the one that catches your eye.',
    doubts: [
      {
        label: 'What is the HydraFacial?',
        answer: ['It is a treatment that cleanses, exfoliates, extracts impurities and hydrates in a single session, with controlled suction and serums.', 'It is used for enlarged pores, blackheads, lack of radiance and dehydration, and leaves no days of redness.'],
        follow: [R('hidrafacial')],
      },
      {
        label: 'HydraFacial or deep cleansing?',
        answer: ['Good question. The HydraFacial is our most complete facial treatment and needs no recovery: you can put on makeup the same day.', 'Deep cleansing includes extractions, and afterwards it is best to wait about 24 hours before makeup.'],
        follow: [R('hidrafacial'), R('lf-profunda')],
      },
      {
        label: 'Does blackhead extraction hurt?',
        answer: ['In deep cleansing, extraction is more uncomfortable than painful, and only in the most congested areas, usually the nose and chin.', 'Beforehand the skin is softened with steam or an enzyme, and you can ask for less intensity whenever you like.'],
        follow: [R('lf-profunda')],
      },
      {
        label: 'Can I wear makeup afterwards?',
        answer: ['It depends on the treatment. After a deep cleansing with extractions, wait about 24 hours: pores are open and skin can look a bit red.', 'After a HydraFacial you can put on makeup the same day.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'How often should I get one?',
        answer: ['Deep cleansing, every four to six weeks (every month if your skin is oily or acne-prone, every two months if it is dry or sensitive).', 'The HydraFacial lasts about three to four weeks, so one session a month is usual.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'I have sensitive skin or acne',
        answer: ['Of course you can. For sensitive skin we recommend basic cleansing or hydration, with no aggressive extractions.', "With acne, cleansing helps as a support but doesn't replace the dermatologist; if you have active inflamed breakouts, let us know and we'll adapt the session."],
        follow: [R('lf-basica'), R('hidratacion'), { k: 'advisor' }],
      },
      {
        label: 'Is there a facial cleansing for men?',
        answer: ['Yes. Deep facial cleansing is one of the most requested by men: it helps with shaving irritation, ingrown hairs, enlarged pores and pollution damage.'],
        follow: [R('lf-profunda')],
      },
      {
        label: "I'm embarrassed about my skin", delicate: true,
        answer: [
          "It's what we do every day: our therapists see all kinds of skin and nobody judges you.",
          "Just tell them what bothers you and they'll adapt the treatment. If you have active inflamed breakouts, let us know and we'll adapt the session.",
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: "I've never had a facial and I know nothing", delicate: true,
        answer: ["You don't need to know anything. Tell the therapist how your skin feels and what bothers you, and she'll guide you to the right treatment and a basic routine for home care."],
        follow: [{ k: 'reserve' }],
      },
    ],
  },

  depilacion: {
    intro: 'Good choice. How can I help you with hair removal?',
    helpLabel: 'Help me choose',
    helpAsk: 'Tell me, what do you need? Tap the topic that fits best.',
    helpGroups: DEPILACION_GROUPS,
    help: DEPILACION_HELP,
    catalogLabel: 'See areas and prices',
    catalogIntro: 'These are the areas (prices in COP). When you book I will ask whether you want wax or machine.',
    doubts: [
      {
        label: 'Does hair removal hurt?',
        answer: ["It's normal to ask. The machine clearly hurts less than wax, and it also varies by area.", 'The first session is always the most uncomfortable; from the second one the hair grows back finer and it hurts quite a bit less.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'How long should my hair be?',
        answer: ['Between 5 mm and 1 cm, roughly two or three weeks of growth.', "And don't shave in the days before your appointment."],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'How often should I get waxed?',
        answer: ['Every three or four weeks on average.', 'If you keep up the rhythm, the hair grows back finer and sessions hurt less.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Can I work out afterwards?',
        answer: ['Better to wait about 24 hours.', 'That same day also avoid pools, saunas and sun exposure.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'How to avoid ingrown hairs',
        answer: ['Gently exfoliate two or three times a week starting 48 hours later, moisturize daily, and avoid very tight clothing for the first few days.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'What is a Brazilian wax?',
        answer: [`It removes the hair from the whole intimate area, front to back. It's booked as intimate-area waxing (${m('dep-bikini', 'wax')} with wax, ${m('dep-bikini', 'machine')} with the machine), and you decide the finish with the therapist before starting.`],
        follow: [R('dep-bikini')],
      },
      {
        label: 'And the full body?',
        answer: [`It costs ${m('dep-full', 'wax')} with wax and ${m('dep-full', 'machine')} with the machine.`, "It's our longest hair removal service, about 2 hours, so I recommend booking ahead."],
        follow: [R('dep-full')],
      },
      {
        label: "I'm embarrassed about intimate waxing", delicate: true,
        answer: [
          "It's completely normal to feel that way. The session is private, in a closed cabin, with a certified therapist who does this every day.",
          'You only undress the area that will be waxed and the therapist tells you how to position yourself.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: "I'm a man, is it embarrassing to get waxed?", delicate: true,
        answer: [
          'Not at all. We wax men and women, and chest, back and full body are among the most requested services by men.',
          'Everything happens in a private cabin, with a certified therapist.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'What is the perianal area?', delicate: true,
        answer: [
          "It's the removal of the hair around the anus and between the buttocks.",
          `It costs ${m('dep-perianal', 'wax')} with wax and ${m('dep-perianal', 'machine')} with the machine, and takes about 30 minutes.`,
        ],
        follow: [R('dep-perianal')],
      },
      {
        label: 'Does the intimate area hurt more?', delicate: true,
        answer: [
          'Yes: the intimate and perianal areas are among the most sensitive, so the first session is usually the most uncomfortable.',
          'The machine clearly hurts less than wax, and from the second session the hair grows back finer and it hurts quite a bit less.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Can I get waxed on my period?', delicate: true,
        answer: [
          'It depends on the area. In the intimate area the skin is more sensitive on those days and it usually hurts more, which is why many people prefer to wait a few days.',
          'If you want to confirm your case, an advisor can help you.',
        ],
        follow: [{ k: 'advisor' }, { k: 'reserve' }],
      },
    ],
  },
}

// ─── What each massage is (when picking it inside the booking) ────────────────
const prices3 = (id: string) => `${m(id, 30)} for 30 min, ${m(id, 60)} for 60 and ${m(id, 90)} for 90`

/** Text shown when picking a massage in the booking, before continuing with it. */
export const MASSAGE_ABOUT: Record<string, string[]> = {
  relaxing: [
    'The relaxing massage uses long, gentle, rhythmic movements to lower stress: the goal is calm, and it feels good the whole time.',
    `It costs ${prices3('relaxing')}. For stress, 60 or 90 minutes do more than 30.`,
  ],
  'deep-tissue': [
    'Deep tissue works the deeper muscle layers with slow, firm pressure on knots and chronic tension; it is great for the lower back, upper back and shoulders.',
    `It should feel like a strong but productive discomfort, never like sharp pain, and you can ask for less pressure whenever you like. It costs ${prices3('deep-tissue')}.`,
  ],
  sports: [
    'The sports massage is a deep-tissue session that adds a percussion gun and assisted stretching. It works before training, in a short session that activates the muscle, or after, for fatigue; most people book it after.',
    `It costs ${prices3('sports')}.`,
  ],
  'hot-stones': [
    "Volcanic stones are basalt stones that are heated, placed on key points and also used as an extension of the therapist's hand. It's deeper than the relaxing massage and works the nervous system more than specific knots.",
    `It costs ${prices3('hot-stones')}.`,
  ],
  'four-hands': [
    "Four Hands means two therapists working on your body at the same time, in sync. The mind can't keep up with four hands, stops tracking and lets go much faster: it's the most immersive session we offer.",
    `We recommend it from 60 minutes: ${m('four-hands', 60)} for 60 and ${m('four-hands', 90)} for 90. If what you need is to work on a specific injury, deep tissue with a single therapist does more.`,
  ],
  duo: [
    'The Duo Massage is for two people: the same private room, two massage tables and two therapists, and each of you picks your technique.',
    `${m('duo', 60)} for 60 min and ${m('duo', 90)} for 90, for both with the same technique. If you pick different techniques, the price changes and reception confirms it for you.`,
  ],
  sensitive: [
    'The sensitive massage is a full-body massage: gentle, slow movements to release tension, with no deep pressure and no rush.',
    `It costs ${prices3('sensitive')}.`,
  ],
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export const RES = {
  askContinue: 'Shall we continue with this massage or would you like to see others?',
  continueMassage: 'Continue with this massage',
  moreMassages: 'Back to see more massages',
  askPeople: "Let's get it ready! How many people is the booking for?",
  askPlan: 'Perfect. What would you like to do?',
  askCat: 'Which service would you like to book?',
  askSvc: 'Which one would you like?',
  askMinutes: 'How long would you prefer?',
  askWax: 'Would you like wax or machine?',
  askDate: 'Which day suits you best? No commitment: reception confirms availability.',
  askTime: 'What time would you like to come?',
  noSlots: 'There are no times left for that day. Shall we try another?',
  askNameReserve: 'Almost there. What is your name?',
  askNameAdvisor: 'Happy to help. What is your name?',
  askPhone: (name: string) => `${name ? `Nice to meet you, ${name}. ` : ''}What is your phone number? It is so reception can confirm on WhatsApp.`,
  badPhone: 'Hmm, that number is missing some digits. Could you type it in full?',
  group: [
    'Each cabin is for two people at most, but we can split you across other cabins if any are available.',
    'Reception confirms that: message us directly and we will check.',
  ],
  duoIntro: ['The Duo Massage is in a single private room, with two massage tables and two therapists.', "Let's start with person 1: which technique would they prefer?"],
  duoSecond: 'Now person 2: which technique would they prefer?',
  duoDiffPrice: "With different techniques the price differs from the Duo price with the same technique. Reception confirms the total for you on WhatsApp.",
  duoPriceTbc: 'to be confirmed by reception',
  duoNote: 'The Duo uses two therapists at once, so it is best to book two or three days ahead, more if it is a weekend.',
  sameIntro: 'Pick the service and the duration; it applies to both of you.',
  distinctIntro: "Let's start with person 1: which service and for how long?",
  distinctSecond: 'Now person 2: which service and for how long?',
  togetherNote: 'We want you to be together: reception checks that two therapists are free at that time and confirms with you.',
  doneHelp: 'We opened WhatsApp with your details already written; send them and reception will confirm availability.',
  advisorDone: (name: string) => `${name ? `Done, ${name}. ` : 'Done. '}We opened WhatsApp so you can talk to reception.`,
}
