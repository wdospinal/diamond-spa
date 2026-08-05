/**
 * Central bilingual FAQ library for Diamond Spa.
 *
 * Single source of truth for every question/answer pair shown on the site.
 * Pages pick the categories they care about via `getFaqCategories()` and feed
 * the flattened list to `faqJsonLd()` so the rendered copy and the FAQPage
 * structured data can never drift apart.
 *
 * Prices, address, phones and hours are interpolated from `./spa` and
 * `./services` — never hardcode them in an answer.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OWNER REVIEW NEEDED — the answers tagged `@needs-confirmation` below describe
 * business policy that is not recorded anywhere in this repo (payment methods,
 * deposits, tipping, gift vouchers, cancellations, invoicing, home service,
 * prenatal massage, therapist preference). They are written conservatively and
 * defer to WhatsApp rather than promising anything. Replace them with the real
 * policy once confirmed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  SPA_ADDRESS,
  SPA_EMAIL,
  SPA_HOURS,
  SPA_PHONES,
  SPA_RATING,
} from './spa'
import { formatCop, getServicePrice } from './services'

/** A string in both supported locales. */
export type Localized = { en: string; es: string }

export type FaqEntry = {
  q: Localized
  a: Localized
}

export type FaqCategoryId =
  | 'discovery'
  | 'men'
  | 'women'
  | 'experiences'
  | 'gifts'
  | 'waxing'
  | 'facials'
  | 'booking'
  | 'payments'
  | 'location'
  | 'visitors'
  | 'trust'

export type FaqCategory = {
  id: FaqCategoryId
  /**
   * Material Symbols icon name. Must already be listed in
   * `./material-symbols`: the font is a self-hosted subset, so an icon outside
   * that list renders as its raw ligature text instead of a glyph.
   */
  icon: string
  label: Localized
  entries: FaqEntry[]
}

// ─── Price helpers ────────────────────────────────────────────────────────────

/** Formatted price for a duration-based service (e.g. `$ 200.000 COP`). */
const dur = (id: string, minutes: 30 | 60 | 90) =>
  formatCop(getServicePrice(id, minutes)!)

/** Formatted price for a flat-priced service. */
const flat = (id: string) => formatCop(getServicePrice(id, null)!)

/** Formatted price for a waxing service, by method. */
const hair = (id: string, method: 'wax' | 'machine') =>
  formatCop(getServicePrice(id, null, method)!)

const WA_1 = SPA_PHONES[0].display
const WA_2 = SPA_PHONES[1].display
const WEEK_HOURS = SPA_HOURS[0].display
const SUN_HOURS = SPA_HOURS[1].display

// ─── Categories ───────────────────────────────────────────────────────────────

export const FAQ_CATEGORIES: FaqCategory[] = [
  // ── 1. Discovery / area ────────────────────────────────────────────────────
  {
    id: 'discovery',
    icon: 'manage_search',
    label: { en: 'Spas in Medellín', es: 'Spas en Medellín' },
    entries: [
      {
        q: {
          en: 'What is the best spa in El Poblado, Medellín?',
          es: '¿Cuál es el mejor spa en El Poblado, Medellín?',
        },
        a: {
          en: `Diamond Spa is one of the highest-rated spas in El Poblado, with ${SPA_RATING.value} stars across ${SPA_RATING.count} Google reviews. We focus on therapeutic and relaxation massages, HydraFacial and professional hair removal, always in a private cabin with a certified therapist.`,
          es: `Diamond Spa es uno de los spas mejor calificados de El Poblado, con ${SPA_RATING.value} estrellas y ${SPA_RATING.count} reseñas en Google. Nos especializamos en masajes terapéuticos y de relajación, HydraFacial y depilación profesional, siempre en cabina privada y con terapeuta certificada.`,
        },
      },
      {
        q: {
          en: 'Where can I get a good massage in Medellín?',
          es: '¿Dónde dar un buen masaje en Medellín?',
        },
        a: {
          en: `El Poblado concentrates most of the city's professional spas. Diamond Spa is at ${SPA_ADDRESS.full}, a few minutes from Parque El Poblado, with private cabins and certified therapists for relaxing, deep tissue, sports, hot stone and four-hands massages.`,
          es: `El Poblado concentra la mayoría de los spas profesionales de la ciudad. Diamond Spa está en ${SPA_ADDRESS.full}, a pocos minutos del Parque El Poblado, con cabinas privadas y terapeutas certificadas para masajes relajantes, descontracturantes, deportivos, con piedras y a cuatro manos.`,
        },
      },
      {
        q: {
          en: 'How much does a massage cost in Medellín?',
          es: '¿Cuánto cuesta un masaje en Medellín?',
        },
        a: {
          en: `At Diamond Spa a massage starts at ${dur('relaxing', 30)} for 30 minutes. The most requested option, a 60-minute relaxing massage, is ${dur('relaxing', 60)}, and 90 minutes is ${dur('relaxing', 90)}. Deep tissue, sports and hot stone sessions are slightly higher.`,
          es: `En Diamond Spa un masaje empieza en ${dur('relaxing', 30)} por 30 minutos. La opción más pedida, el masaje relajante de 60 minutos, cuesta ${dur('relaxing', 60)}, y el de 90 minutos ${dur('relaxing', 90)}. Las sesiones descontracturantes, deportivas y con piedras tienen un valor un poco mayor.`,
        },
      },
      {
        q: {
          en: 'How much is an hour of massage in El Poblado?',
          es: '¿Cuánto vale una hora de masaje en El Poblado?',
        },
        a: {
          en: `A 60-minute session at Diamond Spa costs ${dur('relaxing', 60)} for a relaxing massage, ${dur('deep-tissue', 60)} for deep tissue and ${dur('sports', 60)} for a sports massage. The price includes the private cabin and the full session time — the clock starts when the massage starts.`,
          es: `Una sesión de 60 minutos en Diamond Spa cuesta ${dur('relaxing', 60)} en masaje relajante, ${dur('deep-tissue', 60)} en descontracturante y ${dur('sports', 60)} en deportivo. El precio incluye la cabina privada y el tiempo completo de sesión: el reloj empieza cuando empieza el masaje.`,
        },
      },
      {
        q: {
          en: 'What spas are near Parque Lleras?',
          es: '¿Qué spas hay cerca del Parque Lleras?',
        },
        a: {
          en: `Diamond Spa is a short walk from Parque Lleras, at ${SPA_ADDRESS.full}. It is a quiet street a few blocks away from the nightlife area, which keeps the space calm while staying central and easy to reach on foot.`,
          es: `Diamond Spa está a pocos minutos caminando del Parque Lleras, en ${SPA_ADDRESS.full}. Es una calle tranquila a unas cuadras de la zona de rumba, lo que mantiene el ambiente silencioso sin perder la ubicación céntrica y de fácil acceso a pie.`,
        },
      },
      {
        q: {
          en: 'Are there spas open on Sundays in Medellín?',
          es: '¿Hay spas abiertos los domingos en Medellín?',
        },
        a: {
          en: `Yes. Diamond Spa opens on Sundays from ${SUN_HOURS}. Sunday slots fill up faster than weekdays, so we recommend booking a day or two ahead.`,
          es: `Sí. Diamond Spa abre los domingos de ${SUN_HOURS}. Los turnos del domingo se llenan más rápido que entre semana, así que recomendamos reservar con uno o dos días de anticipación.`,
        },
      },
      {
        q: {
          en: 'Which spa in Medellín is open late, until 10 pm?',
          es: '¿Qué spa en Medellín abre hasta tarde / hasta las 10 de la noche?',
        },
        a: {
          en: `Diamond Spa is open Monday to Saturday ${WEEK_HOURS}, so you can book after work. On Sundays we close earlier, at ${SUN_HOURS.split('–')[1].trim()}.`,
          es: `Diamond Spa atiende de lunes a sábado en horario ${WEEK_HOURS}, así que puedes reservar después del trabajo. Los domingos cerramos más temprano, a las ${SUN_HOURS.split('–')[1].trim()}.`,
        },
      },
      {
        q: {
          en: 'Is there a spa near the Poblado metro station?',
          es: '¿Spa cerca de la estación Poblado del metro?',
        },
        a: {
          en: `Diamond Spa is a short ride from both the Poblado and Aguacatala metro stations — roughly 5 to 10 minutes by taxi or app. Walking from the station is possible but uphill, so most guests prefer a car.`,
          es: `Diamond Spa queda a pocos minutos de las estaciones Poblado y Aguacatala del metro: entre 5 y 10 minutos en taxi o aplicación. Se puede llegar caminando desde la estación, pero es subida, así que la mayoría prefiere ir en carro.`,
        },
      },
      {
        q: {
          en: 'Is it strange to go to a spa alone in Medellín?',
          es: 'Spa en Medellín para ir solo, ¿es raro?',
        },
        a: {
          en: 'Not at all — most of our guests come on their own. A massage is a private, one-to-one session in a closed cabin, so going alone is the norm rather than the exception.',
          es: 'Para nada: la mayoría de nuestros clientes viene solo. El masaje es una sesión privada, uno a uno, en cabina cerrada, así que venir solo es lo habitual y no la excepción.',
        },
      },
      {
        q: {
          en: 'What is the difference between a spa and a massage centre?',
          es: '¿Cuál es la diferencia entre un spa y un centro de masajes?',
        },
        a: {
          en: 'A massage centre usually offers only manual therapy. A spa combines massage with facial and body treatments, hair removal and a controlled environment — private cabins, showers, music, temperature and hygiene protocols. Diamond Spa works as a spa: massages, facials and waxing under one roof.',
          es: 'Un centro de masajes suele ofrecer solo terapia manual. Un spa combina masajes con tratamientos faciales y corporales, depilación y un ambiente controlado: cabinas privadas, duchas, música, temperatura y protocolos de higiene. Diamond Spa funciona como spa: masajes, faciales y depilación en un mismo lugar.',
        },
      },
    ],
  },

  // ── 2. Massages for men ────────────────────────────────────────────────────
  {
    id: 'men',
    icon: 'person',
    label: { en: 'Massages for men', es: 'Masajes para hombres' },
    entries: [
      {
        q: {
          en: 'Where can men get a massage in Medellín?',
          es: '¿Dónde dan masajes para hombres en Medellín?',
        },
        a: {
          en: `Diamond Spa offers massages for men in El Poblado: relaxing, deep tissue, sports, hot stone and four-hands. Sessions run in a private cabin with a certified therapist, at ${SPA_ADDRESS.full}.`,
          es: `Diamond Spa ofrece masajes para hombres en El Poblado: relajante, descontracturante, deportivo, con piedras y a cuatro manos. Las sesiones son en cabina privada con terapeuta certificada, en ${SPA_ADDRESS.full}.`,
        },
      },
      {
        q: {
          en: 'Do spas in Medellín take male guests on their own?',
          es: '¿Los spas en Medellín atienden hombres solos?',
        },
        a: {
          en: 'Yes. At Diamond Spa a large share of our guests are men booking on their own. It is a normal, professional appointment — you arrive, you are shown to a private cabin, and the session begins.',
          es: 'Sí. En Diamond Spa buena parte de nuestros clientes son hombres que reservan solos. Es una cita normal y profesional: llegas, te pasan a una cabina privada y comienza la sesión.',
        },
      },
      {
        q: {
          en: 'Which massage is best for back pain from sitting at a desk?',
          es: '¿Qué tipo de masaje es mejor para el dolor de espalda por trabajar sentado?',
        },
        a: {
          en: `Deep tissue is the usual choice (${dur('deep-tissue', 60)} for 60 minutes). It works slowly and firmly on the lumbar area, upper back and shoulders, which is where desk posture accumulates tension. Tell your therapist exactly where it hurts before starting.`,
          es: `El descontracturante o deep tissue es la opción habitual (${dur('deep-tissue', 60)} por 60 minutos). Trabaja de forma lenta y firme la zona lumbar, la espalda alta y los hombros, que es donde se acumula la tensión por postura de escritorio. Indícale a tu terapeuta exactamente dónde te duele antes de empezar.`,
        },
      },
      {
        q: {
          en: 'Which massage helps with knots in the neck and shoulders?',
          es: '¿Qué masaje sirve para contracturas en cuello y hombros?',
        },
        a: {
          en: `Deep tissue or the sports massage (${dur('sports', 60)} for 60 minutes), which adds a percussion gun and assisted stretching. Both target the trapezius and cervical area directly. A 30-minute session focused only on the upper body also works if you are short on time.`,
          es: `El descontracturante o el masaje deportivo (${dur('sports', 60)} por 60 minutos), que suma pistola de percusión y estiramientos asistidos. Ambos trabajan directamente el trapecio y la zona cervical. Si tienes poco tiempo, una sesión de 30 minutos enfocada solo en tren superior también funciona.`,
        },
      },
      {
        q: {
          en: 'What is the difference between a relaxing and a deep tissue massage?',
          es: '¿Cuál es la diferencia entre masaje relajante y descontracturante?',
        },
        a: {
          en: 'A relaxing massage uses long, gentle, rhythmic strokes to lower stress — the goal is calm. A deep tissue massage uses slower, firmer pressure on specific muscles to release knots and chronic tension — the goal is therapeutic relief. Relaxing feels pleasant throughout; deep tissue can be intense in the tightest spots.',
          es: 'El masaje relajante usa movimientos largos, suaves y rítmicos para bajar el estrés: el objetivo es la calma. El descontracturante aplica presión más lenta y firme sobre músculos específicos para liberar nudos y tensión crónica: el objetivo es el alivio terapéutico. El relajante se siente agradable todo el tiempo; el descontracturante puede ser intenso en los puntos más cargados.',
        },
      },
      {
        q: {
          en: 'What is a deep tissue massage and does it hurt?',
          es: '¿Qué es un masaje de tejido profundo (deep tissue) y duele?',
        },
        a: {
          en: 'It is a technique that works the deeper muscle layers with slow, sustained pressure. It should feel like a strong, "productive" discomfort you can breathe through — never sharp pain. Pressure is adjustable at any moment: say so and the therapist eases off.',
          es: 'Es una técnica que trabaja las capas musculares profundas con presión lenta y sostenida. Debe sentirse como una molestia fuerte pero "productiva", que puedes respirar sin problema, nunca como dolor agudo. La presión se ajusta en cualquier momento: solo dilo y la terapeuta la baja.',
        },
      },
      {
        q: {
          en: 'Sports massage before or after training?',
          es: '¿Masaje deportivo antes o después de entrenar?',
        },
        a: {
          en: 'Both work, with different goals. Before training, a short, brisk session activates the muscle and improves mobility. After training — ideally a few hours later or the next day — a deeper session helps clear fatigue and speeds recovery. Most guests book it after.',
          es: 'Sirven los dos, con objetivos distintos. Antes de entrenar, una sesión corta y activadora mejora la movilidad y prepara el músculo. Después de entrenar —idealmente unas horas más tarde o al día siguiente— una sesión más profunda ayuda a eliminar la fatiga y acelera la recuperación. La mayoría lo reserva después.',
        },
      },
      {
        q: {
          en: 'How often should I get a deep tissue massage?',
          es: '¿Cada cuánto debo hacerme un masaje descontracturante?',
        },
        a: {
          en: 'For ongoing tension from work or training, every two to four weeks keeps things under control. If you are treating an active problem, a tighter run of weekly sessions for three or four weeks works better, then spacing them out.',
          es: 'Para tensión constante por trabajo o entrenamiento, cada dos a cuatro semanas mantiene la situación bajo control. Si estás tratando un problema activo, funciona mejor una tanda más seguida —una sesión semanal durante tres o cuatro semanas— y luego ir espaciando.',
        },
      },
      {
        q: {
          en: 'Is it normal to feel sore after a deep tissue massage?',
          es: '¿Es normal quedar adolorido después de un masaje descontracturante?',
        },
        a: {
          en: 'Yes. Mild soreness for 24 to 48 hours, similar to the day after training, is common and expected. Drink water, avoid intense exercise that same day, and apply heat if needed. Sharp or lasting pain is not normal — tell us if that happens.',
          es: 'Sí. Una molestia leve durante 24 a 48 horas, parecida al día después de entrenar, es común y esperada. Toma agua, evita ejercicio intenso ese mismo día y aplica calor si lo necesitas. Un dolor agudo o que no cede no es normal: avísanos si ocurre.',
        },
      },
      {
        q: {
          en: 'What do I wear for a massage? Do I take off all my clothes?',
          es: '¿Qué me pongo para un masaje? ¿Me quito toda la ropa?',
        },
        a: {
          en: 'You undress to the level you are comfortable with — most people keep their underwear on. You are left alone in the cabin to change, and during the session the body is covered with towels: only the area being worked on is uncovered.',
          es: 'Te desvistes hasta donde te sientas cómodo; la mayoría conserva la ropa interior. Te dejamos solo en la cabina para cambiarte y, durante la sesión, el cuerpo permanece cubierto con toallas: solo se descubre la zona que se está trabajando.',
        },
      },
      {
        q: {
          en: 'Can I request a male or female therapist?',
          es: '¿Puedo pedir terapeuta hombre o mujer?',
          // @needs-confirmation — team composition and preference policy
        },
        a: {
          en: `You can tell us your preference when booking and we will confirm availability for that time slot. Our team is made up of certified female therapists, so let us know in advance by WhatsApp (${WA_1}) and we will tell you what we can arrange.`,
          es: `Puedes indicarnos tu preferencia al reservar y confirmamos la disponibilidad para ese horario. Nuestro equipo está conformado por terapeutas certificadas, así que escríbenos con anticipación por WhatsApp (${WA_1}) y te confirmamos qué podemos agendar.`,
        },
      },
    ],
  },

  // ── 3. Massages for women ──────────────────────────────────────────────────
  {
    id: 'women',
    icon: 'self_improvement',
    label: { en: 'Massages for women', es: 'Masajes para mujeres' },
    entries: [
      {
        q: {
          en: 'Where can I get a relaxing massage in El Poblado?',
          es: '¿Dónde hacerme un masaje relajante en El Poblado?',
        },
        a: {
          en: `At Diamond Spa, ${SPA_ADDRESS.full}. The relaxing massage is ${dur('relaxing', 30)} for 30 minutes, ${dur('relaxing', 60)} for 60 and ${dur('relaxing', 90)} for 90, always in a private cabin.`,
          es: `En Diamond Spa, ${SPA_ADDRESS.full}. El masaje relajante cuesta ${dur('relaxing', 30)} por 30 minutos, ${dur('relaxing', 60)} por 60 y ${dur('relaxing', 90)} por 90, siempre en cabina privada.`,
        },
      },
      {
        q: {
          en: 'Which massage is best for stress and anxiety?',
          es: '¿Qué masaje es mejor para el estrés y la ansiedad?',
        },
        a: {
          en: `The relaxing massage, and the hot stone massage (${dur('hot-stones', 60)} for 60 minutes) if you want something deeper. Both work on the nervous system rather than on specific knots. For stress, 60 or 90 minutes is noticeably better than 30 — the body needs time to let go.`,
          es: `El masaje relajante y, si quieres algo más profundo, el de piedras volcánicas (${dur('hot-stones', 60)} por 60 minutos). Ambos trabajan sobre el sistema nervioso más que sobre nudos puntuales. Para el estrés, 60 o 90 minutos rinde mucho más que 30: el cuerpo necesita tiempo para soltar.`,
        },
      },
      {
        q: {
          en: 'Can I get a massage while pregnant?',
          es: '¿Puedo hacerme un masaje si estoy embarazada?',
          // @needs-confirmation — prenatal massage policy
        },
        a: {
          en: `Tell us when booking. As a general rule massage is avoided during the first trimester, and from then on it should be gentle, in a side-lying position and with your doctor's clearance. Write to us on WhatsApp (${WA_1}) with your stage of pregnancy and we will confirm whether we can take the appointment.`,
          es: `Cuéntanos al reservar. Como regla general se evita el masaje durante el primer trimestre y, a partir de ahí, debe ser suave, en posición lateral y con autorización de tu médico. Escríbenos por WhatsApp (${WA_1}) indicando en qué semana vas y te confirmamos si podemos agendar la cita.`,
        },
      },
      {
        q: {
          en: 'How much is a hot stone massage in Medellín?',
          es: '¿Masaje con piedras calientes en Medellín, cuánto cuesta?',
        },
        a: {
          en: `At Diamond Spa the volcanic stone massage costs ${dur('hot-stones', 30)} for 30 minutes, ${dur('hot-stones', 60)} for 60 and ${dur('hot-stones', 90)} for 90. Heated basalt stones are placed on key points and also used as an extension of the therapist's hand.`,
          es: `En Diamond Spa el masaje con piedras volcánicas cuesta ${dur('hot-stones', 30)} por 30 minutos, ${dur('hot-stones', 60)} por 60 y ${dur('hot-stones', 90)} por 90. Las piedras de basalto se calientan, se ubican sobre puntos clave y se usan además como extensión de la mano de la terapeuta.`,
        },
      },
      {
        q: {
          en: 'Which massage helps with fluid retention?',
          es: '¿Qué masaje ayuda con la retención de líquidos?',
        },
        a: {
          en: 'A gentle drainage-oriented massage, worked slowly and always towards the lymph nodes, is the usual approach. Tell us your goal when booking so the therapist adapts pressure and direction — for fluid retention, light and consistent beats deep and occasional.',
          es: 'Lo habitual es un masaje suave orientado al drenaje, trabajado lentamente y siempre en dirección a los ganglios. Indícanos tu objetivo al reservar para que la terapeuta adapte la presión y la dirección: para retención de líquidos, funciona mejor lo suave y constante que lo profundo y esporádico.',
        },
      },
      {
        q: {
          en: 'Can I have a massage during my period?',
          es: '¿Se puede hacer masaje durante la menstruación?',
        },
        a: {
          en: 'Yes, there is no medical reason not to, and many people find it helps with cramps and lower back pain. Tell your therapist so she can adjust pressure on the abdomen and lumbar area, or simply skip that zone.',
          es: 'Sí, no hay ninguna razón médica que lo impida y a muchas personas les ayuda con los cólicos y el dolor lumbar. Coméntaselo a tu terapeuta para que ajuste la presión en abdomen y zona lumbar, o simplemente omita esa zona.',
        },
      },
      {
        q: {
          en: 'Do massage oils stain clothes or leave hair greasy?',
          es: '¿Los masajes con aceites manchan la ropa o el pelo?',
        },
        a: {
          en: 'We use oils that absorb well and we remove the excess with warm towels at the end of the session. The hair is not oiled unless you ask for scalp work. If you are heading somewhere straight after, tell us and we will keep the neckline and hairline clear.',
          es: 'Usamos aceites de buena absorción y retiramos el exceso con toallas tibias al final de la sesión. El cabello no se aceita salvo que pidas trabajo en cuero cabelludo. Si sales directo a otro compromiso, avísanos y dejamos libre la zona del escote y el nacimiento del pelo.',
        },
      },
    ],
  },

  // ── 4. Signature experiences ───────────────────────────────────────────────
  {
    id: 'experiences',
    icon: 'spa',
    label: { en: 'Signature experiences', es: 'Experiencias' },
    entries: [
      {
        q: {
          en: 'What is a four-hands massage and how does it work?',
          es: '¿Qué es un masaje a cuatro manos y cómo funciona?',
        },
        a: {
          en: `Two therapists work on your body at the same time, in mirrored synchrony. Because the mind cannot follow two sets of hands at once, it stops tracking and lets go — which is why it relaxes far faster than a single-therapist session. At Diamond Spa it costs ${dur('four-hands', 60)} for 60 minutes.`,
          es: `Dos terapeutas trabajan tu cuerpo al mismo tiempo, en sincronía espejo. Como la mente no puede seguir cuatro manos a la vez, deja de rastrear y se suelta: por eso relaja mucho más rápido que una sesión con una sola terapeuta. En Diamond Spa cuesta ${dur('four-hands', 60)} por 60 minutos.`,
        },
      },
      {
        q: {
          en: 'Is a four-hands massage worth it?',
          es: '¿Vale la pena el masaje a cuatro manos?',
        },
        a: {
          en: 'If you have trouble switching off, or you have limited time and want the deepest possible result, yes — it is the most immersive session we offer. If what you need is targeted therapeutic work on one specific injury, a deep tissue massage with a single therapist is the better use of the money.',
          es: 'Si te cuesta desconectar, o tienes poco tiempo y quieres el resultado más profundo posible, sí: es la sesión más inmersiva que ofrecemos. Si lo que necesitas es trabajo terapéutico puntual sobre una lesión específica, rinde más un descontracturante con una sola terapeuta.',
        },
      },
      {
        q: {
          en: 'What is a sensitive massage?',
          es: '¿Qué es un masaje sensitivo?',
        },
        a: {
          en: `It is a slow, enveloping full-body massage that works on skin sensitivity and the nervous system rather than on deep muscle. The emphasis is on continuous, unhurried contact and full-body awareness. It costs ${dur('sensitive', 60)} for 60 minutes.`,
          es: `Es un masaje de cuerpo completo, lento y envolvente, que trabaja la sensibilidad de la piel y el sistema nervioso más que el músculo profundo. El énfasis está en el contacto continuo, sin prisa, y en la conciencia corporal. Cuesta ${dur('sensitive', 60)} por 60 minutos.`,
        },
      },
      {
        q: {
          en: 'What is the difference between a sensitive and a relaxing massage?',
          es: '¿Cuál es la diferencia entre un masaje sensitivo y uno relajante?',
        },
        a: {
          en: 'A relaxing massage aims to release muscular tension with rhythmic strokes. A sensitive massage aims to heighten body awareness: slower, more continuous, with less focus on specific muscles. Both are professional treatments performed in a private cabin by a certified therapist.',
          es: 'El relajante busca liberar tensión muscular con movimientos rítmicos. El sensitivo busca despertar la conciencia corporal: más lento, más continuo y con menos foco en músculos específicos. Ambos son tratamientos profesionales realizados en cabina privada por terapeutas certificadas.',
        },
      },
      {
        q: {
          en: 'How long does a four-hands massage last?',
          es: '¿Cuánto dura un masaje a cuatro manos?',
        },
        a: {
          en: `You can book it for 30, 60 or 90 minutes (${dur('four-hands', 30)}, ${dur('four-hands', 60)} and ${dur('four-hands', 90)}). We recommend at least 60 minutes: the effect depends on the body having time to stop anticipating the movements.`,
          es: `Puedes reservarlo por 30, 60 o 90 minutos (${dur('four-hands', 30)}, ${dur('four-hands', 60)} y ${dur('four-hands', 90)}). Recomendamos mínimo 60 minutos: el efecto depende de que el cuerpo tenga tiempo de dejar de anticipar los movimientos.`,
        },
      },
      {
        q: {
          en: 'What does a full spa day include?',
          es: '¿Qué incluye un día de spa completo?',
        },
        a: {
          en: 'Our spa day packages combine at least one massage and one facial treatment in a private room, with robes, personal attention and an unhurried pace. They start from $ 330.000 COP for the Essential Day (1.5 hours) and go up to the Diamond Day (2.5 hours of treatments).',
          es: 'Nuestros paquetes de día de spa combinan al menos un masaje y un tratamiento facial en sala privada, con batas, atención personalizada y sin prisa. Empiezan desde $ 330.000 COP en el Essential Day (1,5 horas) y llegan hasta el Diamond Day (2,5 horas de tratamientos).',
        },
      },
    ],
  },

  // ── 5. Couples & gifts ─────────────────────────────────────────────────────
  {
    id: 'gifts',
    icon: 'star',
    label: { en: 'Couples & gifts', es: 'Parejas y regalos' },
    entries: [
      {
        q: {
          en: 'Where can we get a couples massage in Medellín?',
          es: '¿Dónde hacer un masaje en pareja en Medellín?',
        },
        a: {
          en: `At Diamond Spa the Duo massage is designed for exactly that: two people, side by side in the same private room, each with their own therapist. It costs ${dur('duo', 60)} for 60 minutes and ${dur('duo', 90)} for 90.`,
          es: `En Diamond Spa el Duo Masaje está pensado exactamente para eso: dos personas, lado a lado en la misma sala privada, cada una con su propia terapeuta. Cuesta ${dur('duo', 60)} por 60 minutos y ${dur('duo', 90)} por 90.`,
        },
      },
      {
        q: {
          en: 'Do spas in Medellín have a private room for couples?',
          es: '¿Los spas en Medellín tienen sala privada para parejas?',
        },
        a: {
          en: 'At Diamond Spa, yes — the Duo massage takes place in a closed room reserved only for the two of you, with two tables and two therapists. You can choose the same technique or different ones.',
          es: 'En Diamond Spa, sí: el Duo Masaje se realiza en una sala cerrada reservada solo para ustedes dos, con dos camillas y dos terapeutas. Pueden elegir la misma técnica o técnicas diferentes.',
        },
      },
      {
        q: {
          en: 'What can we do for an anniversary in Medellín?',
          es: 'Regalo de aniversario en Medellín, ¿qué hacer?',
        },
        a: {
          en: `A Duo massage (${dur('duo', 90)} for 90 minutes) or a spa day for two is the most requested anniversary plan. Tell us it is a special occasion when booking and we will prepare the room accordingly.`,
          es: `Un Duo Masaje (${dur('duo', 90)} por 90 minutos) o un día de spa para dos es el plan de aniversario más pedido. Cuéntanos al reservar que es una ocasión especial y preparamos la sala para el momento.`,
        },
      },
      {
        q: {
          en: 'Do you sell spa gift vouchers in Medellín?',
          es: '¿Venden bonos de regalo para spa en Medellín?',
          // @needs-confirmation — gift voucher mechanics
        },
        a: {
          en: `Write to us on WhatsApp (${WA_1}) and we will arrange it: you settle the session in advance and we hold the booking under the name of the person receiving it. We will confirm the available formats and validity when you contact us.`,
          es: `Escríbenos por WhatsApp (${WA_1}) y lo coordinamos: dejas la sesión pagada por anticipado y la reserva queda a nombre de quien la recibe. Al contactarnos te confirmamos los formatos disponibles y la vigencia.`,
        },
      },
      {
        q: {
          en: 'How do I gift a spa session to someone?',
          es: '¿Cómo regalar una sesión de spa a alguien?',
          // @needs-confirmation — gift voucher mechanics
        },
        a: {
          en: `Send us a WhatsApp (${WA_1}) with the service, the duration and the name of the person. We arrange payment in advance and coordinate the appointment directly with them, so the surprise stays intact.`,
          es: `Envíanos un WhatsApp (${WA_1}) con el servicio, la duración y el nombre de la persona. Coordinamos el pago por anticipado y agendamos la cita directamente con ella, para que la sorpresa se mantenga.`,
        },
      },
      {
        q: {
          en: 'A romantic evening plan in El Poblado',
          es: 'Plan romántico en El Poblado por la noche',
        },
        a: {
          en: `We are open until ${WEEK_HOURS.split('–')[1].trim()} Monday to Saturday, so a Duo massage works well as an evening plan before dinner in the area. Book ahead — evening slots are the first to go.`,
          es: `Atendemos hasta las ${WEEK_HOURS.split('–')[1].trim()} de lunes a sábado, así que un Duo Masaje funciona muy bien como plan de noche antes de cenar por la zona. Reserva con anticipación: los turnos de la noche son los primeros en agotarse.`,
        },
      },
      {
        q: {
          en: 'Can we hold a bachelorette party at the spa?',
          es: '¿Se puede hacer una despedida de soltera en un spa?',
          // @needs-confirmation — group capacity
        },
        a: {
          en: `We handle group bookings by arrangement, since it depends on how many cabins and therapists are free at that time. Write to us on WhatsApp (${WA_1}) with the date and the number of guests and we will put together a proposal.`,
          es: `Manejamos reservas de grupo bajo coordinación, ya que depende de cuántas cabinas y terapeutas estén libres en ese horario. Escríbenos por WhatsApp (${WA_1}) con la fecha y el número de personas y armamos una propuesta.`,
        },
      },
      {
        q: {
          en: "A Mother's Day gift in Medellín (spa)",
          es: 'Regalo para el día de la madre en Medellín (spa)',
        },
        a: {
          en: `The most requested options are a 90-minute relaxing massage (${dur('relaxing', 90)}), a hot stone massage (${dur('hot-stones', 60)}) or a HydraFacial (${flat('hidrafacial')}). Book early — it is one of the busiest weekends of the year.`,
          es: `Las opciones más pedidas son el masaje relajante de 90 minutos (${dur('relaxing', 90)}), el masaje con piedras volcánicas (${dur('hot-stones', 60)}) o un Hidrafacial (${flat('hidrafacial')}). Reserva con tiempo: es uno de los fines de semana de mayor demanda del año.`,
        },
      },
    ],
  },

  // ── 6. Waxing ──────────────────────────────────────────────────────────────
  {
    id: 'waxing',
    icon: 'electric_bolt',
    label: { en: 'Hair removal', es: 'Depilación' },
    entries: [
      {
        q: {
          en: 'How much does waxing cost in Medellín?',
          es: '¿Cuánto cuesta la depilación con cera en Medellín?',
        },
        a: {
          en: `At Diamond Spa waxing starts at ${hair('depilacion-axila', 'wax')} for underarms. Bikini is ${hair('depilacion-bikini', 'wax')}, half leg ${hair('depilacion-media-pierna', 'wax')}, full leg ${hair('depilacion-pierna-completa', 'wax')} and chest ${hair('depilacion-pecho', 'wax')}.`,
          es: `En Diamond Spa la depilación con cera empieza en ${hair('depilacion-axila', 'wax')} para axilas. Bikini cuesta ${hair('depilacion-bikini', 'wax')}, media pierna ${hair('depilacion-media-pierna', 'wax')}, pierna completa ${hair('depilacion-pierna-completa', 'wax')} y pecho ${hair('depilacion-pecho', 'wax')}.`,
        },
      },
      {
        q: {
          en: 'Laser or wax hair removal — which is better?',
          es: '¿Depilación láser o con cera, cuál es mejor?',
        },
        a: {
          en: 'Wax gives an immediate clean result on any hair colour and any skin type, at a low cost per session, but the hair comes back in three to four weeks. Laser reduces hair permanently over several sessions and costs more up front. If you want a result for a specific date, wax; if you want to stop shaving long term, laser.',
          es: 'La cera da un resultado limpio inmediato, sirve para cualquier color de vello y tipo de piel, y tiene bajo costo por sesión, pero el vello vuelve en tres o cuatro semanas. El láser reduce el vello de forma permanente en varias sesiones y cuesta más al inicio. Si quieres un resultado para una fecha puntual, cera; si quieres dejar de depilarte a largo plazo, láser.',
        },
      },
      {
        q: {
          en: 'Where can men get waxed in Medellín?',
          es: '¿Dónde hacen depilación masculina en Medellín?',
        },
        a: {
          en: `Diamond Spa does male waxing in El Poblado: chest (${hair('depilacion-pecho', 'wax')}), back (${hair('depilacion-espalda', 'wax')}), perianal area (${hair('depilacion-zona-perianal', 'wax')}) and full body (${hair('depilacion-cuerpo-completo', 'wax')}). All of it in a private cabin.`,
          es: `Diamond Spa realiza depilación masculina en El Poblado: pecho (${hair('depilacion-pecho', 'wax')}), espalda (${hair('depilacion-espalda', 'wax')}), zona perianal (${hair('depilacion-zona-perianal', 'wax')}) y cuerpo completo (${hair('depilacion-cuerpo-completo', 'wax')}). Todo en cabina privada.`,
        },
      },
      {
        q: {
          en: 'Does back waxing hurt for men?',
          es: '¿Duele la depilación de espalda para hombres?',
        },
        a: {
          en: 'The back is one of the least sensitive areas, so it is among the more tolerable zones. The first session is always the most uncomfortable; from the second onwards the hair grows back finer and it hurts noticeably less. The whole thing takes about 20 minutes.',
          es: 'La espalda es una de las zonas menos sensibles, así que está entre las más tolerables. La primera sesión siempre es la más incómoda; a partir de la segunda el vello sale más fino y duele bastante menos. En total toma unos 20 minutos.',
        },
      },
      {
        q: {
          en: 'How long does the hair need to be for waxing?',
          es: '¿Cuánto debe medir el vello para depilar con cera?',
        },
        a: {
          en: 'Between 5 mm and 1 cm — roughly two to three weeks of growth. Shorter than that and the wax cannot grip it; much longer and it hurts more. Do not shave in the days before your appointment.',
          es: 'Entre 5 mm y 1 cm, más o menos dos o tres semanas de crecimiento. Más corto que eso y la cera no alcanza a agarrarlo; mucho más largo y duele más. No te afeites en los días previos a la cita.',
        },
      },
      {
        q: {
          en: 'How often should I get waxed?',
          es: '¿Cada cuánto hay que depilarse con cera?',
        },
        a: {
          en: 'Every three to four weeks on average. Keeping a regular rhythm matters: when you always wax at the same point in the growth cycle, the hair comes back finer, sparser and the sessions become less painful.',
          es: 'Cada tres o cuatro semanas en promedio. Mantener un ritmo regular importa: al depilar siempre en el mismo punto del ciclo de crecimiento, el vello vuelve más fino, más escaso y las sesiones se vuelven menos dolorosas.',
        },
      },
      {
        q: {
          en: 'What is a Brazilian wax and what does it include?',
          es: '¿Qué es la depilación brasileña y qué incluye?',
        },
        a: {
          en: `It removes the hair from the entire intimate area, front to back, leaving either nothing or a small strip according to your preference. At Diamond Spa it is booked as bikini (${hair('depilacion-bikini', 'wax')}); you decide the finish with the therapist before starting.`,
          es: `Retira el vello de toda la zona íntima, de adelante hacia atrás, dejando la zona libre o con una franja según tu preferencia. En Diamond Spa se agenda como bikini (${hair('depilacion-bikini', 'wax')}); defines el acabado con la terapeuta antes de empezar.`,
        },
      },
      {
        q: {
          en: 'Can I exercise after waxing?',
          es: '¿Puedo hacer ejercicio después de depilarme?',
        },
        a: {
          en: 'Wait about 24 hours. Sweat, friction from clothing and gym surfaces on freshly opened follicles are the main cause of irritation and small pimples. Avoid pools, saunas and sun exposure that same day too.',
          es: 'Espera unas 24 horas. El sudor, el roce de la ropa y las superficies del gimnasio sobre folículos recién abiertos son la causa principal de irritación y pequeños granitos. Ese mismo día evita también piscina, sauna y exposición al sol.',
        },
      },
      {
        q: {
          en: 'How do I avoid ingrown hairs after waxing?',
          es: '¿Cómo evitar los vellos encarnados después de la cera?',
        },
        a: {
          en: 'Exfoliate gently two or three times a week starting 48 hours after the session, moisturise daily, and avoid very tight clothing in the first days. Keeping a regular waxing schedule also reduces ingrown hairs a lot.',
          es: 'Exfolia suavemente dos o tres veces por semana a partir de las 48 horas siguientes a la sesión, hidrata a diario y evita ropa muy ajustada los primeros días. Mantener una frecuencia regular de depilación también reduce bastante los vellos encarnados.',
        },
      },
      {
        q: {
          en: 'Wax or machine — which hurts less?',
          es: '¿Depilación con cera o con máquina, cuál duele menos?',
        },
        a: {
          en: `The machine is clearly less painful and it is also cheaper — full legs are ${hair('depilacion-pierna-completa', 'machine')} by machine versus ${hair('depilacion-pierna-completa', 'wax')} with wax. In exchange, wax pulls the hair from the root, so the result lasts weeks instead of days.`,
          es: `La máquina duele claramente menos y además es más económica: pierna completa cuesta ${hair('depilacion-pierna-completa', 'machine')} con máquina frente a ${hair('depilacion-pierna-completa', 'wax')} con cera. A cambio, la cera arranca el vello desde la raíz, así que el resultado dura semanas en lugar de días.`,
        },
      },
      {
        q: {
          en: 'How much does full body hair removal cost?',
          es: '¿Cuánto cuesta depilar el cuerpo completo?',
        },
        a: {
          en: `Full body is ${hair('depilacion-cuerpo-completo', 'wax')} with wax and ${hair('depilacion-cuerpo-completo', 'machine')} by machine. Book extra time: it is our longest hair removal service.`,
          es: `El cuerpo completo cuesta ${hair('depilacion-cuerpo-completo', 'wax')} con cera y ${hair('depilacion-cuerpo-completo', 'machine')} con máquina. Reserva tiempo adicional: es nuestro servicio de depilación más largo.`,
        },
      },
    ],
  },

  // ── 7. Facials ─────────────────────────────────────────────────────────────
  {
    id: 'facials',
    icon: 'face',
    label: { en: 'Facial treatments', es: 'Faciales' },
    entries: [
      {
        q: {
          en: 'How much does a HydraFacial cost in Medellín?',
          es: '¿Cuánto cuesta un Hidrafacial en Medellín?',
        },
        a: {
          en: `At Diamond Spa the HydraFacial costs ${flat('hidrafacial')}. It is our most complete facial treatment and needs no recovery time.`,
          es: `En Diamond Spa el Hidrafacial cuesta ${flat('hidrafacial')}. Es nuestro tratamiento facial más completo y no requiere tiempo de recuperación.`,
        },
      },
      {
        q: {
          en: 'What is a HydraFacial and what is it for?',
          es: '¿Qué es el Hidrafacial y para qué sirve?',
        },
        a: {
          en: 'It is a treatment that cleanses, exfoliates, extracts impurities and hydrates in a single session using controlled suction and serums, instead of manual squeezing. It is used for dilated pores, blackheads, dullness and dehydration, and it leaves the skin usable immediately — no redness for days.',
          es: 'Es un tratamiento que limpia, exfolia, extrae impurezas e hidrata en una sola sesión mediante succión controlada y sueros, en lugar de presión manual. Se usa para poros dilatados, puntos negros, falta de luminosidad y deshidratación, y deja la piel lista de inmediato, sin días de rojez.',
        },
      },
      {
        q: {
          en: 'How often should I get a deep facial cleansing?',
          es: '¿Cada cuánto hacerse una limpieza facial profunda?',
        },
        a: {
          en: `Every four to six weeks, which is roughly the skin's renewal cycle. Oily or acne-prone skin can go monthly; dry or sensitive skin does better every two months. Deep facial cleansing costs ${flat('limpieza-facial-profunda')}.`,
          es: `Cada cuatro a seis semanas, que es aproximadamente el ciclo de renovación de la piel. Las pieles grasas o con tendencia acneica pueden hacerlo mensualmente; las secas o sensibles rinden mejor cada dos meses. La limpieza facial profunda cuesta ${flat('limpieza-facial-profunda')}.`,
        },
      },
      {
        q: {
          en: 'Does blackhead extraction hurt during a facial cleansing?',
          es: '¿Duele la extracción de puntos negros en una limpieza facial?',
        },
        a: {
          en: 'It is uncomfortable rather than painful, and only in the most congested areas — usually the nose and chin. The skin is softened beforehand with steam or an enzyme so the extraction is much gentler. Tell the therapist at any point and she will ease off.',
          es: 'Es más incómodo que doloroso, y solo en las zonas más congestionadas, normalmente nariz y mentón. Antes se ablanda la piel con vapor o una enzima para que la extracción sea mucho más suave. Dilo en cualquier momento y la terapeuta baja la intensidad.',
        },
      },
      {
        q: {
          en: 'Can I wear makeup after a facial cleansing?',
          es: '¿Se puede maquillar después de una limpieza facial?',
        },
        a: {
          en: 'After a deep cleansing with extractions, wait about 24 hours — the pores are open and the skin may be slightly red. After a HydraFacial you can wear makeup the same day, which is why it works well before an event.',
          es: 'Después de una limpieza profunda con extracciones, espera unas 24 horas: los poros quedan abiertos y la piel puede estar algo roja. Después de un Hidrafacial puedes maquillarte el mismo día, y por eso funciona bien antes de un evento.',
        },
      },
      {
        q: {
          en: 'Facial cleansing for oily skin in Medellín?',
          es: '¿Limpieza facial para piel grasa en Medellín?',
        },
        a: {
          en: `Yes. For oily skin we work with deep cleansing (${flat('limpieza-facial-profunda')}) or HydraFacial (${flat('hidrafacial')}), adjusting the products to control sebum without stripping the skin — over-drying oily skin makes it produce more oil.`,
          es: `Sí. Para piel grasa trabajamos con limpieza profunda (${flat('limpieza-facial-profunda')}) o Hidrafacial (${flat('hidrafacial')}), ajustando los productos para controlar el sebo sin resecar: una piel grasa muy resecada termina produciendo más grasa.`,
        },
      },
      {
        q: {
          en: 'Does facial cleansing help with acne?',
          es: '¿La limpieza facial sirve para el acné?',
        },
        a: {
          en: 'It helps as support: it decongests pores, reduces blackheads and improves skin texture. It does not replace dermatological treatment for moderate or severe acne. If you have active inflamed lesions, tell us — we adapt the session or recommend waiting.',
          es: 'Ayuda como apoyo: descongestiona los poros, reduce puntos negros y mejora la textura de la piel. No reemplaza el tratamiento dermatológico en acné moderado o severo. Si tienes lesiones inflamadas activas, avísanos: adaptamos la sesión o recomendamos esperar.',
        },
      },
      {
        q: {
          en: 'How long does the effect of a HydraFacial last?',
          es: '¿Cuánto dura el efecto de un Hidrafacial?',
        },
        a: {
          en: 'The glow and smooth texture last around three to four weeks. To sustain the result, the usual schedule is one session a month combined with a basic home routine of cleansing, hydration and sunscreen.',
          es: 'La luminosidad y la textura suave duran alrededor de tres a cuatro semanas. Para sostener el resultado, lo habitual es una sesión al mes acompañada de una rutina básica en casa de limpieza, hidratación y protector solar.',
        },
      },
      {
        q: {
          en: 'Can I get a facial if I have sensitive skin?',
          es: '¿Puedo hacerme un facial si tengo la piel sensible?',
        },
        a: {
          en: `Yes. For sensitive skin we recommend basic facial cleansing (${flat('limpieza-facial-basica')}) or facial hydration (${flat('hidratacion-facial')}), without aggressive extractions. Tell us about any reactive skin condition or product you are using before we start.`,
          es: `Sí. Para piel sensible recomendamos limpieza facial básica (${flat('limpieza-facial-basica')}) o hidratación facial (${flat('hidratacion-facial')}), sin extracciones agresivas. Cuéntanos antes de empezar si tienes alguna condición reactiva o estás usando algún producto activo.`,
        },
      },
      {
        q: {
          en: 'Is there facial cleansing for men?',
          es: '¿Limpieza facial para hombres, existe?',
        },
        a: {
          en: `Yes, and it is one of our most requested treatments among male guests. It is particularly effective for shaving irritation, ingrown hairs, dilated pores and urban pollution damage. We also offer back cleansing (${flat('limpieza-espalda')}).`,
          es: `Sí, y es uno de nuestros tratamientos más pedidos por clientes hombres. Es especialmente efectivo contra la irritación por afeitado, los vellos encarnados, los poros dilatados y el daño por contaminación urbana. También ofrecemos limpieza de espalda (${flat('limpieza-espalda')}).`,
        },
      },
    ],
  },

  // ── 8. Booking & hours ─────────────────────────────────────────────────────
  {
    id: 'booking',
    icon: 'calendar_month',
    label: { en: 'Booking & hours', es: 'Reservas y horarios' },
    entries: [
      {
        q: {
          en: 'Do I need an appointment or can I just walk in?',
          es: '¿Necesito cita previa o puedo llegar directo?',
        },
        a: {
          en: 'We strongly recommend booking. We work with private cabins and a limited number of therapists, so walk-ins depend entirely on what happens to be free at that moment. Booking takes about a minute online.',
          es: 'Recomendamos reservar. Trabajamos con cabinas privadas y un número limitado de terapeutas, así que la atención sin cita depende por completo de lo que esté libre en ese momento. Reservar en línea toma alrededor de un minuto.',
        },
      },
      {
        q: {
          en: 'How do I book at Diamond Spa?',
          es: '¿Cómo reservar en Diamond Spa?',
        },
        a: {
          en: `Online from the booking page on this site, choosing service, duration, day and time. You can also write to us on WhatsApp (${WA_1} or ${WA_2}) or email ${SPA_EMAIL}.`,
          es: `En línea desde la página de reservas de este sitio, eligiendo servicio, duración, día y hora. También puedes escribirnos por WhatsApp (${WA_1} o ${WA_2}) o al correo ${SPA_EMAIL}.`,
        },
      },
      {
        q: {
          en: 'Can I book via WhatsApp?',
          es: '¿Puedo reservar por WhatsApp?',
        },
        a: {
          en: `Yes. Write to ${WA_1} or ${WA_2} telling us the service, the preferred day and time, and our receptionist will confirm availability.`,
          es: `Sí. Escribe a ${WA_1} o ${WA_2} indicando el servicio y el día y la hora que prefieres, y nuestra recepcionista te confirma la disponibilidad.`,
        },
      },
      {
        q: {
          en: 'How far in advance should I book for the weekend?',
          es: '¿Con cuánta anticipación debo reservar el fin de semana?',
        },
        a: {
          en: 'Two or three days ahead for Saturday and Sunday, and more if you need a specific time or a Duo massage, which requires two therapists at once. Weekday mornings are usually available on the same day.',
          es: 'Con dos o tres días de anticipación para sábado y domingo, y más si necesitas un horario específico o un Duo Masaje, que requiere dos terapeutas al mismo tiempo. Las mañanas entre semana suelen tener disponibilidad el mismo día.',
        },
      },
      {
        q: {
          en: 'What happens if I arrive late for my appointment?',
          es: '¿Qué pasa si llego tarde a mi cita de spa?',
          // @needs-confirmation — late arrival policy
        },
        a: {
          en: 'We hold your cabin, but the session ends at the originally scheduled time, since the next appointment is already booked. If you are running late, message us on WhatsApp — if the agenda allows it we will try to move things around.',
          es: 'Mantenemos tu cabina, pero la sesión termina a la hora programada originalmente, porque la siguiente cita ya está agendada. Si vas retrasado, escríbenos por WhatsApp: si la agenda lo permite, intentamos reacomodar.',
        },
      },
      {
        q: {
          en: 'Can I cancel or reschedule my appointment?',
          es: '¿Puedo cancelar o reprogramar mi cita?',
          // @needs-confirmation — cancellation window
        },
        a: {
          en: `Yes. Let us know as far ahead as you can on WhatsApp (${WA_1}) so we can free the slot for someone else. We will confirm the conditions when you book.`,
          es: `Sí. Avísanos con la mayor anticipación posible por WhatsApp (${WA_1}) para poder liberar el turno. Te confirmamos las condiciones al momento de reservar.`,
        },
      },
      {
        q: {
          en: 'Are you open on public holidays in Medellín?',
          es: '¿Atienden festivos en Medellín?',
        },
        a: {
          en: `We normally open on public holidays with Sunday hours (${SUN_HOURS}). For a specific holiday, confirm with us on WhatsApp before travelling.`,
          es: `Normalmente atendemos los festivos en horario de domingo (${SUN_HOURS}). Para un festivo puntual, confírmalo con nosotros por WhatsApp antes de desplazarte.`,
        },
      },
      {
        q: {
          en: 'What is the latest appointment you take?',
          es: '¿Hasta qué hora reciben la última reserva?',
        },
        a: {
          en: `The last appointment is scheduled so that the session finishes before we close — ${WEEK_HOURS.split('–')[1].trim()} Monday to Saturday and ${SUN_HOURS.split('–')[1].trim()} on Sundays. So for a 90-minute massage, the last slot starts an hour and a half before closing.`,
          es: `La última cita se agenda de modo que la sesión termine antes del cierre: ${WEEK_HOURS.split('–')[1].trim()} de lunes a sábado y ${SUN_HOURS.split('–')[1].trim()} los domingos. Es decir, para un masaje de 90 minutos, el último turno empieza hora y media antes de cerrar.`,
        },
      },
      {
        q: {
          en: 'Can I book for two people at the same time?',
          es: '¿Puedo reservar para dos personas al mismo tiempo?',
        },
        a: {
          en: `Yes — that is the Duo massage, in a private room with two tables and two therapists (${dur('duo', 60)} for 60 minutes). Because it uses two therapists at once, book it further ahead than a single session.`,
          es: `Sí: es el Duo Masaje, en sala privada con dos camillas y dos terapeutas (${dur('duo', 60)} por 60 minutos). Como ocupa dos terapeutas a la vez, resérvalo con más anticipación que una sesión individual.`,
        },
      },
    ],
  },

  // ── 9. Payments & prices ───────────────────────────────────────────────────
  {
    id: 'payments',
    icon: 'payments',
    label: { en: 'Payments & prices', es: 'Pagos y precios' },
    entries: [
      {
        q: {
          en: 'Do spas in Medellín accept credit cards?',
          es: '¿Aceptan tarjeta de crédito en los spas de Medellín?',
          // @needs-confirmation — accepted payment methods
        },
        a: {
          en: `We confirm the accepted payment methods when you book. If you need to be sure before arriving, ask us on WhatsApp (${WA_1}) and we will confirm right away.`,
          es: `Confirmamos los medios de pago aceptados al momento de reservar. Si necesitas asegurarte antes de venir, pregúntanos por WhatsApp (${WA_1}) y te confirmamos de inmediato.`,
        },
      },
      {
        q: {
          en: 'Can I pay with Nequi or Daviplata?',
          es: '¿Puedo pagar con Nequi o Daviplata?',
          // @needs-confirmation — accepted payment methods
        },
        a: {
          en: `Ask us on WhatsApp (${WA_1}) before your appointment and we will confirm which digital wallets we are currently accepting.`,
          es: `Pregúntanos por WhatsApp (${WA_1}) antes de tu cita y te confirmamos qué billeteras digitales estamos aceptando actualmente.`,
        },
      },
      {
        q: {
          en: 'Do you accept dollars or only Colombian pesos?',
          es: '¿Aceptan dólares o solo pesos colombianos?',
          // @needs-confirmation — foreign currency
        },
        a: {
          en: 'All our prices are set in Colombian pesos (COP) and that is the currency we work in. If you are arriving with foreign currency, message us beforehand so we can tell you the best option.',
          es: 'Todos nuestros precios están fijados en pesos colombianos (COP) y esa es la moneda en la que trabajamos. Si llegas con moneda extranjera, escríbenos antes y te indicamos la mejor opción.',
        },
      },
      {
        q: {
          en: 'Can I pay by bank transfer?',
          es: '¿Se puede pagar con transferencia bancaria?',
          // @needs-confirmation — accepted payment methods
        },
        a: {
          en: `Write to us on WhatsApp (${WA_1}) and we will confirm whether a transfer works for your booking and send you the details.`,
          es: `Escríbenos por WhatsApp (${WA_1}) y te confirmamos si la transferencia aplica para tu reserva, junto con los datos correspondientes.`,
        },
      },
      {
        q: {
          en: 'Do I need to leave a deposit to book?',
          es: '¿Hay que dejar depósito para reservar?',
          // @needs-confirmation — deposit policy
        },
        a: {
          en: 'Most appointments do not require one. For group bookings, gift vouchers or peak dates we may ask for an advance payment; we always tell you when confirming the booking, never on arrival.',
          es: 'La mayoría de las citas no lo requiere. Para reservas de grupo, bonos de regalo o fechas de alta demanda podemos solicitar un pago anticipado; siempre te lo informamos al confirmar la reserva, nunca al llegar.',
        },
      },
      {
        q: {
          en: 'Is tipping customary at a spa in Colombia?',
          es: '¿Se acostumbra dar propina en un spa en Colombia?',
        },
        a: {
          en: 'It is not mandatory and it is not automatically added. It is a common gesture when you are happy with the session, but nobody expects it and the price you were quoted is the full price.',
          es: 'No es obligatoria ni se agrega automáticamente. Es un gesto frecuente cuando quedas contento con la sesión, pero nadie la espera y el precio que te cotizamos es el precio completo.',
        },
      },
      {
        q: {
          en: 'How much do you tip a therapist in Medellín?',
          es: '¿Cuánto de propina se deja a un terapeuta en Medellín?',
        },
        a: {
          en: 'When people do tip, the usual range is around 10% of the service. It is entirely optional and can be handed directly to the therapist.',
          es: 'Cuando se da propina, el rango habitual ronda el 10% del servicio. Es totalmente opcional y puede entregarse directamente a la terapeuta.',
        },
      },
      {
        q: {
          en: 'Do you have packages or discounts for multiple sessions?',
          es: '¿Tienen paquetes o descuentos por varias sesiones?',
        },
        a: {
          en: `We have spa day packages that combine massage and facial from $ 330.000 COP. For a plan of several sessions over time, write to us on WhatsApp (${WA_1}) and we will put together a proposal.`,
          es: `Tenemos paquetes de día de spa que combinan masaje y facial desde $ 330.000 COP. Para un plan de varias sesiones en el tiempo, escríbenos por WhatsApp (${WA_1}) y armamos una propuesta.`,
        },
      },
      {
        q: {
          en: 'Do prices include tax?',
          es: '¿El precio incluye IVA?',
          // @needs-confirmation — tax treatment
        },
        a: {
          en: 'The prices shown on the site are the final prices you pay — there are no surprises added at the counter.',
          es: 'Los precios publicados en el sitio son los precios finales que pagas: no se agregan sorpresas al momento de pagar.',
        },
      },
      {
        q: {
          en: 'Do you issue electronic invoices?',
          es: '¿Hacen factura electrónica?',
          // @needs-confirmation — invoicing
        },
        a: {
          en: `Yes, if you request it. Tell us when booking or before paying, and provide the billing details so we can issue it correctly. You can also arrange it in advance on WhatsApp (${WA_1}).`,
          es: `Sí, si la solicitas. Indícalo al reservar o antes de pagar y entréganos los datos de facturación para emitirla correctamente. También puedes coordinarlo con anticipación por WhatsApp (${WA_1}).`,
        },
      },
    ],
  },

  // ── 10. Location & getting there ───────────────────────────────────────────
  {
    id: 'location',
    icon: 'location_on',
    label: { en: 'Location & getting here', es: 'Ubicación y cómo llegar' },
    entries: [
      {
        q: {
          en: 'How do I get to Cra 43C #10 in El Poblado?',
          es: '¿Cómo llegar a Cra 43C con 10 en El Poblado?',
        },
        a: {
          en: `We are at ${SPA_ADDRESS.full}, a few minutes from Parque El Poblado. Any taxi or ride app will find the address directly; you can also open our location on Google Maps from the location page of this site.`,
          es: `Estamos en ${SPA_ADDRESS.full}, a pocos minutos del Parque El Poblado. Cualquier taxi o aplicación de transporte encuentra la dirección directamente; también puedes abrir nuestra ubicación en Google Maps desde la página de ubicación de este sitio.`,
        },
      },
      {
        q: {
          en: 'Is there parking near the spa in El Poblado?',
          es: '¿Hay parqueadero cerca del spa en El Poblado?',
        },
        a: {
          en: 'Yes. There is parking right in front of the premises and a car park on the same block, plus several paid lots nearby.',
          es: 'Sí. Hay zona de parqueo justo frente al local y un parqueadero en la misma cuadra, además de varios parqueaderos pagos en los alrededores.',
        },
      },
      {
        q: {
          en: 'How much is a taxi from José María Córdova airport to El Poblado?',
          es: '¿Cuánto cuesta un taxi del aeropuerto José María Córdova a El Poblado?',
        },
        a: {
          en: 'The official airport taxi to El Poblado is usually around $ 100.000 COP and the trip takes 45 minutes to an hour, depending on traffic. Rates are set by the airport and can change, so confirm before getting in.',
          es: 'El taxi oficial del aeropuerto hasta El Poblado suele costar alrededor de $ 100.000 COP y el trayecto toma entre 45 minutos y una hora según el tráfico. Las tarifas las fija el aeropuerto y pueden cambiar, así que confírmalas antes de abordar.',
        },
      },
      {
        q: {
          en: 'Can I walk from Parque Lleras?',
          es: '¿Se puede llegar caminando desde el Parque Lleras?',
        },
        a: {
          en: 'Yes, it is a walkable distance of roughly 10 to 15 minutes. Keep in mind that El Poblado is hilly, so if you would rather arrive relaxed, a short taxi ride is easier.',
          es: 'Sí, es una distancia caminable de unos 10 a 15 minutos. Ten en cuenta que El Poblado tiene pendientes, así que si prefieres llegar descansado, un taxi corto resulta más cómodo.',
        },
      },
      {
        q: {
          en: 'Is it safe to walk around El Poblado at night?',
          es: '¿Es seguro caminar por El Poblado de noche?',
        },
        a: {
          en: 'El Poblado is one of the most active and best-lit areas of the city at night, and the main streets stay busy. As in any large city, keep your phone out of sight, avoid empty side streets and use a ride app late at night.',
          es: 'El Poblado es una de las zonas más activas e iluminadas de la ciudad en la noche, y las vías principales se mantienen concurridas. Como en cualquier ciudad grande, evita exhibir el celular, no tomes calles solitarias y usa aplicación de transporte si es muy tarde.',
        },
      },
      {
        q: {
          en: 'How much is an Uber from Laureles to El Poblado?',
          es: '¿Cuánto cobra un Uber de Laureles a El Poblado?',
        },
        a: {
          en: 'Usually between $ 20.000 and $ 35.000 COP, depending on the time of day and traffic. The trip takes about 20 to 30 minutes.',
          es: 'Normalmente entre $ 20.000 y $ 35.000 COP, según la hora y el tráfico. El trayecto toma unos 20 a 30 minutos.',
        },
      },
      {
        q: {
          en: 'Is the spa near hotels in El Poblado?',
          es: '¿El spa está cerca de hoteles en El Poblado?',
        },
        a: {
          en: 'Yes. We are in the middle of the area with the highest concentration of hotels and short-stay apartments in Medellín — most are within a 5 to 15 minute ride.',
          es: 'Sí. Estamos en plena zona con la mayor concentración de hoteles y apartamentos de estadía corta de Medellín: la mayoría queda a 5 o 15 minutos de trayecto.',
        },
      },
      {
        q: {
          en: 'Do you offer massages at home or at my hotel?',
          es: '¿Hacen masajes a domicilio o en el hotel?',
          // @needs-confirmation — home/hotel service
        },
        a: {
          en: `Our services are performed at our El Poblado location, in equipped private cabins — that is what lets us guarantee the hygiene and comfort standards. For any special arrangement, ask us on WhatsApp (${WA_1}).`,
          es: `Nuestros servicios se realizan en nuestra sede de El Poblado, en cabinas privadas equipadas: es lo que nos permite garantizar los estándares de higiene y comodidad. Para cualquier caso especial, consúltanos por WhatsApp (${WA_1}).`,
        },
      },
    ],
  },

  // ── 11. International visitors ─────────────────────────────────────────────
  {
    id: 'visitors',
    icon: 'flight',
    label: { en: 'International visitors', es: 'Visitantes extranjeros' },
    entries: [
      {
        q: {
          en: 'Best massage in El Poblado, Medellín',
          es: 'El mejor masaje en El Poblado, Medellín',
        },
        a: {
          en: `Diamond Spa holds ${SPA_RATING.value} stars across ${SPA_RATING.count} Google reviews, at ${SPA_ADDRESS.full}. Certified therapists, private cabins and published prices — you know the cost before you book.`,
          es: `Diamond Spa tiene ${SPA_RATING.value} estrellas con ${SPA_RATING.count} reseñas en Google, en ${SPA_ADDRESS.full}. Terapeutas certificadas, cabinas privadas y precios publicados: sabes el costo antes de reservar.`,
        },
      },
      {
        q: {
          en: 'Do spas in Medellín speak English?',
          es: '¿En los spas de Medellín hablan inglés?',
        },
        a: {
          en: 'At Diamond Spa we handle bookings and appointments in English and Spanish. This whole site is available in both languages, and you can write to us on WhatsApp in English.',
          es: 'En Diamond Spa atendemos reservas y citas en inglés y en español. Todo este sitio está disponible en ambos idiomas y puedes escribirnos por WhatsApp en inglés.',
        },
      },
      {
        q: {
          en: 'How much does a massage cost in Medellín in USD?',
          es: '¿Cuánto cuesta un masaje en Medellín en dólares?',
        },
        a: {
          en: `A 60-minute massage is ${dur('relaxing', 60)}, which is roughly 45 to 55 USD depending on the exchange rate. Prices on this site can be displayed in your currency, but payment is made in Colombian pesos.`,
          es: `Un masaje de 60 minutos cuesta ${dur('relaxing', 60)}, aproximadamente entre 45 y 55 USD según la tasa de cambio. Los precios de este sitio pueden mostrarse en tu moneda, pero el pago se realiza en pesos colombianos.`,
        },
      },
      {
        q: {
          en: 'Massage for men in Medellín — is it legitimate?',
          es: 'Masajes para hombres en Medellín, ¿son legítimos?',
        },
        a: {
          en: `Diamond Spa is a registered professional spa with certified therapists, a public address at ${SPA_ADDRESS.full}, published prices and ${SPA_RATING.count} verified Google reviews. Our services are therapeutic and aesthetic treatments only.`,
          es: `Diamond Spa es un spa profesional registrado, con terapeutas certificadas, dirección pública en ${SPA_ADDRESS.full}, precios publicados y ${SPA_RATING.count} reseñas verificadas en Google. Nuestros servicios son exclusivamente tratamientos terapéuticos y estéticos.`,
        },
      },
      {
        q: {
          en: 'Can I pay with a foreign credit card in Medellín?',
          es: '¿Puedo pagar con tarjeta de crédito extranjera en Medellín?',
          // @needs-confirmation — foreign card acceptance
        },
        a: {
          en: `Ask us on WhatsApp (${WA_1}) before your appointment and we will confirm the payment options available to you. Note that foreign cards are charged in Colombian pesos and your bank applies its own conversion.`,
          es: `Pregúntanos por WhatsApp (${WA_1}) antes de tu cita y te confirmamos las opciones de pago disponibles. Ten en cuenta que las tarjetas extranjeras se cobran en pesos colombianos y tu banco aplica su propia conversión.`,
        },
      },
      {
        q: {
          en: 'Best spa near Parque Lleras',
          es: 'El mejor spa cerca del Parque Lleras',
        },
        a: {
          en: 'Diamond Spa is a 10 to 15 minute walk from Parque Lleras, on a quiet street away from the noise but still central. Massages, facials and waxing, all by appointment.',
          es: 'Diamond Spa está a 10 o 15 minutos caminando del Parque Lleras, en una calle tranquila lejos del ruido pero igualmente céntrica. Masajes, faciales y depilación, todo con cita previa.',
        },
      },
      {
        q: {
          en: 'Couples massage Medellín price',
          es: 'Precio del masaje en pareja en Medellín',
        },
        a: {
          en: `The Duo massage — two people, one private room, two therapists — is ${dur('duo', 60)} for 60 minutes and ${dur('duo', 90)} for 90 minutes, covering both people.`,
          es: `El Duo Masaje —dos personas, una sala privada, dos terapeutas— cuesta ${dur('duo', 60)} por 60 minutos y ${dur('duo', 90)} por 90 minutos, para las dos personas.`,
        },
      },
      {
        q: {
          en: 'HydraFacial Medellín cost',
          es: 'Costo del Hidrafacial en Medellín',
        },
        a: {
          en: `${flat('hidrafacial')} at Diamond Spa, with no recovery time — you can go straight back out afterwards, which makes it a good option mid-trip.`,
          es: `${flat('hidrafacial')} en Diamond Spa, sin tiempo de recuperación: puedes salir directo después, lo que lo hace una buena opción durante un viaje.`,
        },
      },
      {
        q: {
          en: 'Do I need to tip at a spa in Colombia?',
          es: '¿Hay que dar propina en un spa en Colombia?',
        },
        a: {
          en: 'No. Tipping is not required and it is never added automatically. If you were happy with the session, around 10% is a common gesture, but the quoted price is complete on its own.',
          es: 'No. La propina no es obligatoria y nunca se agrega automáticamente. Si quedaste contento con la sesión, alrededor del 10% es un gesto frecuente, pero el precio cotizado es completo por sí solo.',
        },
      },
      {
        q: {
          en: 'Waxing for men in Medellín',
          es: 'Depilación masculina en Medellín',
        },
        a: {
          en: `We wax chest (${hair('depilacion-pecho', 'wax')}), back (${hair('depilacion-espalda', 'wax')}), perianal area (${hair('depilacion-zona-perianal', 'wax')}) and full body (${hair('depilacion-cuerpo-completo', 'wax')}), always in a private cabin. Hair should be about 5 mm long, so avoid shaving for two weeks before.`,
          es: `Depilamos pecho (${hair('depilacion-pecho', 'wax')}), espalda (${hair('depilacion-espalda', 'wax')}), zona perianal (${hair('depilacion-zona-perianal', 'wax')}) y cuerpo completo (${hair('depilacion-cuerpo-completo', 'wax')}), siempre en cabina privada. El vello debe medir unos 5 mm, así que evita afeitarte las dos semanas previas.`,
        },
      },
    ],
  },

  // ── 12. Trust, hygiene & first visit ───────────────────────────────────────
  {
    id: 'trust',
    icon: 'verified_user',
    label: { en: 'First visit & hygiene', es: 'Primera vez e higiene' },
    entries: [
      {
        q: {
          en: 'It is my first time at a spa — what should I know?',
          es: '¿Es mi primera vez en un spa, qué debo saber?',
        },
        a: {
          en: 'Arrive a few minutes early, tell us about any pain, injury or condition, and undress only to the level you are comfortable with — you will be left alone in the cabin and covered with towels throughout. You can adjust pressure, temperature and music at any moment.',
          es: 'Llega unos minutos antes, cuéntanos si tienes algún dolor, lesión o condición, y desvístete solo hasta donde te sientas cómodo: te dejamos solo en la cabina y permaneces cubierto con toallas durante toda la sesión. Puedes ajustar presión, temperatura y música en cualquier momento.',
        },
      },
      {
        q: {
          en: 'What should I bring to a spa appointment?',
          es: '¿Qué llevar a una cita de spa?',
        },
        a: {
          en: 'Nothing in particular — we provide towels and everything needed for the treatment. Comfortable clothing for afterwards helps, especially after an oil massage or a waxing session.',
          es: 'Nada en particular: nosotros proporcionamos toallas y todo lo necesario para el tratamiento. Ayuda traer ropa cómoda para después, sobre todo tras un masaje con aceites o una sesión de depilación.',
        },
      },
      {
        q: {
          en: 'Should I arrive before my appointment time?',
          es: '¿Debo llegar antes de la hora de mi cita?',
        },
        a: {
          en: 'Five to ten minutes early is ideal. That gives you time to settle, go over what you need with the therapist and start on time, since the session ends at the scheduled hour.',
          es: 'Lo ideal es llegar entre cinco y diez minutos antes. Así tienes tiempo de acomodarte, comentar con la terapeuta lo que necesitas y empezar puntual, ya que la sesión termina a la hora agendada.',
        },
      },
      {
        q: {
          en: 'Are the therapists certified?',
          es: '¿Los terapeutas están certificados?',
        },
        a: {
          en: '100% of our team holds professional certification. They are cosmetologists and therapists with years of experience, not improvised staff — which is exactly what separates a professional spa from an informal one.',
          es: 'El 100% de nuestro equipo cuenta con certificación profesional. Son cosmetólogas y terapeutas con años de experiencia, no personal improvisado, que es precisamente lo que separa a un spa profesional de uno informal.',
        },
      },
      {
        q: {
          en: 'How do I know if a spa in Medellín is serious and professional?',
          es: '¿Cómo sé si un spa en Medellín es serio y profesional?',
        },
        a: {
          en: 'Look for a public physical address, published prices, verifiable reviews, certified staff, a clear service menu and hygiene protocols you can ask about. If a place avoids any of those questions, that is your answer.',
          es: 'Busca dirección física pública, precios publicados, reseñas verificables, personal certificado, un menú de servicios claro y protocolos de higiene sobre los que puedas preguntar. Si un lugar esquiva alguna de esas preguntas, ahí tienes la respuesta.',
        },
      },
      {
        q: {
          en: 'What hygiene protocols do you follow?',
          es: '¿Qué protocolo de higiene manejan?',
        },
        a: {
          en: 'Linen and towels are changed for every guest, surfaces and tables are disinfected between appointments, waxing materials are single-use — we never return a spatula to the pot — and tools are sterilised. Our biosafety protocol follows Colombian regulations.',
          es: 'La lencería y las toallas se cambian con cada cliente, las superficies y camillas se desinfectan entre citas, los materiales de depilación son de un solo uso —nunca devolvemos una espátula al recipiente— y el instrumental se esteriliza. Nuestro protocolo de bioseguridad sigue la normativa colombiana.',
        },
      },
      {
        q: {
          en: 'Can I ask for more or less pressure during the massage?',
          es: '¿Puedo pedir más o menos presión durante el masaje?',
        },
        a: {
          en: 'Yes, at any moment, and you should. The therapist cannot feel what you feel, so saying "a bit softer" or "a bit stronger" is expected — it is the most useful thing you can do for the session.',
          es: 'Sí, en cualquier momento, y deberías hacerlo. La terapeuta no puede sentir lo que tú sientes, así que decir "un poco más suave" o "un poco más fuerte" es lo esperado: es lo más útil que puedes aportar a la sesión.',
        },
      },
      {
        q: {
          en: 'Should I talk or stay quiet during the massage?',
          es: '¿Puedo hablar o mejor quedarme callado durante el masaje?',
        },
        a: {
          en: 'Whatever you prefer. Most guests go quiet after a few minutes, and our therapists will not start a conversation unless you do. Speak up whenever something needs adjusting.',
          es: 'Lo que prefieras. La mayoría se queda en silencio después de unos minutos, y nuestras terapeutas no inician conversación salvo que tú lo hagas. Habla siempre que necesites ajustar algo.',
        },
      },
      {
        q: {
          en: 'Can I take my phone into the cabin?',
          es: '¿Puedo entrar con mi celular a la cabina?',
          // @needs-confirmation — phone policy
        },
        a: {
          en: 'Your belongings stay with you in the cabin. We recommend silencing the phone: interruptions break the effect of the session, which is the one thing you are paying for.',
          es: 'Tus pertenencias permanecen contigo en la cabina. Recomendamos silenciar el celular: las interrupciones rompen el efecto de la sesión, que es justamente lo que estás pagando.',
        },
      },
      {
        q: {
          en: 'Can I drink alcohol before or after a massage?',
          es: '¿Se puede tomar alcohol antes o después de un masaje?',
        },
        a: {
          en: 'Not before — alcohol alters your perception of pressure and pain, which makes the session harder to calibrate and less safe. Afterwards, wait a few hours and drink water first: massage mobilises fluids and alcohol dehydrates.',
          es: 'Antes no: el alcohol altera la percepción de la presión y del dolor, lo que hace la sesión más difícil de calibrar y menos segura. Después, espera unas horas y toma agua primero: el masaje moviliza líquidos y el alcohol deshidrata.',
        },
      },
      {
        q: {
          en: 'Can I eat before a massage?',
          es: '¿Puedo comer antes de un masaje?',
        },
        a: {
          en: 'Something light, yes. Avoid a heavy meal in the hour before, especially if the session includes abdominal work — lying face down on a full stomach is uncomfortable. Arriving completely fasted is not ideal either.',
          es: 'Algo ligero, sí. Evita una comida pesada en la hora previa, sobre todo si la sesión incluye trabajo abdominal: acostarse boca abajo con el estómago lleno es incómodo. Llegar completamente en ayunas tampoco es ideal.',
        },
      },
      {
        q: {
          en: 'Can I come to the spa if I have a cold?',
          es: '¿Puedo ir al spa si tengo gripa?',
        },
        a: {
          en: 'Better to reschedule. Massage mobilises circulation and tends to make symptoms worse, plus there is the risk to the therapist and other guests. Write to us and we will move your appointment.',
          es: 'Es mejor reprogramar. El masaje moviliza la circulación y suele empeorar los síntomas, además del riesgo para la terapeuta y los demás clientes. Escríbenos y trasladamos tu cita.',
        },
      },
      {
        q: {
          en: 'Do massages have contraindications?',
          es: '¿Los masajes tienen contraindicaciones?',
        },
        a: {
          en: 'Yes. Tell us if you have uncontrolled hypertension, varicose veins, thrombosis, recent surgery, fever, active skin infections, or if you are pregnant or on anticoagulants. In most cases we can adapt the technique, pressure and position — we just need to know beforehand.',
          es: 'Sí. Cuéntanos si tienes hipertensión no controlada, várices, trombosis, cirugías recientes, fiebre, infecciones activas en la piel, o si estás embarazada o tomas anticoagulantes. En la mayoría de los casos podemos adaptar la técnica, la presión y la posición: solo necesitamos saberlo antes.',
        },
      },
    ],
  },
]

// ─── Selectors ────────────────────────────────────────────────────────────────

type ResolvedFaq = { question: string; answer: string }

export type ResolvedFaqCategory = {
  id: FaqCategoryId
  icon: string
  label: string
  items: ResolvedFaq[]
}

/**
 * Resolve categories for a locale. Pass `ids` to select (and order) a subset —
 * useful for topic pages that only want the relevant slice.
 */
export function getFaqCategories(
  locale: 'en' | 'es',
  ids?: readonly FaqCategoryId[],
): ResolvedFaqCategory[] {
  const source = ids
    ? ids
        .map(id => FAQ_CATEGORIES.find(c => c.id === id))
        .filter((c): c is FaqCategory => Boolean(c))
    : FAQ_CATEGORIES

  return source.map(({ id, icon, label, entries }) => ({
    id,
    icon,
    label: label[locale],
    items: entries.map(({ q, a }) => ({ question: q[locale], answer: a[locale] })),
  }))
}

/** Flat question/answer list, ready for `faqJsonLd()`. */
export function getFaqItems(
  locale: 'en' | 'es',
  ids?: readonly FaqCategoryId[],
): ResolvedFaq[] {
  return getFaqCategories(locale, ids).flatMap(c => c.items)
}
