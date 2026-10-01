/**
 * Textos y ramas del chat de la pauta (español).
 *
 * Todo lo que dice el chat vive aquí, con la voz de la recepción de Diamond
 * Spa: frases cortas, de tú, una pregunta a la vez. Los precios salen del
 * catálogo (chat-catalog.ts), no se escriben a mano.
 */
import { m, type Cat } from './chat-catalog'

/** Botones que pueden aparecer debajo de una respuesta. */
export type Follow =
  | { k: 'reserve'; svc?: string }
  | { k: 'reserveCat'; cat: Cat }
  | { k: 'catalog'; cat: Cat; label?: string }
  | { k: 'doubt'; scope: Cat | 'general' }
  | { k: 'menu' }
  | { k: 'maps' }
  | { k: 'advisor' }
  | { k: 'direct' }
  | { k: 'change' }
  | { k: 'people'; n: 2 | 3 }

/** Nombre del icono de línea (ver ChatIcon en el componente). */
export type IconName =
  | 'pin' | 'clock' | 'calendar' | 'tag' | 'card' | 'refresh' | 'sparkles'
  | 'users' | 'help' | 'hand' | 'leaf' | 'back' | 'external' | 'chat' | 'user'

export type Doubt = {
  label: string
  answer: string[]
  follow: Follow[]
  icon?: IconName
  bare?: boolean
  /** Va en la lista aparte "Cosas que da pena preguntar", no en la principal. */
  delicate?: boolean
}

export const GREETING = [
  '¡Hola! Soy la recepción en línea de Diamond Spa.',
  'Te ayudo a resolver dudas y a dejar tu reserva lista en un minuto. ¿Con qué te ayudo hoy?',
]
export const ASK_MENU = '¿Con qué te ayudo hoy?'
export const ASK_GENERAL = 'Claro, ¿qué te gustaría saber?'
export const ASK_DOUBT = 'Claro. Toca la que más se parezca a tu duda.'
export const ASK_BACK = '¿Qué prefieres?'
export const DELICATE_LABEL = 'Cosas que da pena preguntar'
export const ASK_DELICATE = 'Aquí puedes preguntar con confianza, nadie te juzga. Toca la que más se parezca a tu duda.'

// ─── Dudas generales ──────────────────────────────────────────────────────────
export const GENERAL: (Doubt & { id: string })[] = [
  {
    id: 'donde', label: 'Dónde queda', icon: 'pin',
    answer: [
      'Estamos en Cra 43C #10-42, en El Poblado, Medellín. Desde el Parque Lleras son unos 10 minutos caminando, y en carro llegas en pocos minutos desde el Parque El Poblado.',
      'Tienes parqueo frente al local y parqueadero en la misma cuadra.',
    ],
    follow: [{ k: 'maps' }, { k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'horarios', label: 'Horarios', icon: 'clock',
    answer: [
      'Abrimos de lunes a sábado de 10:00 a. m. a 10:00 p. m., y los domingos de 10:00 a. m. a 7:00 p. m.',
      'En festivos normalmente abrimos como en domingo; si vienes en un festivo, escríbenos antes para confirmarlo.',
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'como', label: 'Cómo reservar', icon: 'calendar', bare: true,
    answer: [
      'Es muy fácil: me cuentas qué servicio quieres, cuánto tiempo y qué día y hora te quedan bien.',
      'Al final me dejas tu nombre y tu celular, y se abre WhatsApp con tu solicitud ya escrita; recepción te confirma la disponibilidad.',
      'Te recomiendo reservar con tiempo: las cabinas son privadas y tenemos un número limitado de terapeutas. ¿Con qué servicio empezamos?',
    ],
    follow: [
      { k: 'reserveCat', cat: 'masajes' },
      { k: 'reserveCat', cat: 'faciales' },
      { k: 'reserveCat', cat: 'depilacion' },
    ],
  },
  {
    id: 'precios', label: 'Precios', icon: 'tag', bare: true,
    answer: [
      `Los masajes van desde ${m('relaxing', 30)} (30 min), y el más pedido, el relajante de 60 min, cuesta ${m('relaxing', 60)}.`,
      `Los faciales empiezan en ${m('lf-basica')}. La depilación, desde ${m('dep-axila', 'machine')}, según la zona y si es con cera o con máquina. ¿Cuál te gustaría ver?`,
    ],
    follow: [
      { k: 'catalog', cat: 'masajes' },
      { k: 'catalog', cat: 'faciales' },
      { k: 'catalog', cat: 'depilacion' },
    ],
  },
  {
    id: 'pagos', label: 'Pagos y factura', icon: 'card',
    answer: [
      'Aceptamos tarjeta, Nequi, Daviplata, efectivo y transferencia, y también recibimos dólares.',
      'Los precios ya incluyen IVA, no hay costos ocultos y no pedimos anticipo para reservar. Si necesitas factura, puedes solicitarla en caja.',
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'propina', label: 'Propina', icon: 'card',
    answer: [
      'No pedimos propina y no es obligatoria.',
      'El precio que te cotizamos es el precio completo.',
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'cambiar', label: 'Cambiar mi cita o llegar tarde', icon: 'refresh',
    answer: ['Claro. Si necesitas reprogramar tu cita o vas a llegar tarde, escríbenos directo por WhatsApp y así te guardamos tu cita.'],
    follow: [{ k: 'change' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'primera', label: 'Primera vez en un spa', icon: 'sparkles',
    answer: [
      '¡Qué bueno que te animes! Llega 5 a 10 minutos antes; no necesitas traer nada, nosotros ponemos toallas y todo lo necesario.',
      'Te desvistes solo hasta donde te sientas a gusto, quedas cubierto con toallas y puedes pedir más o menos presión cuando quieras. Las terapeutas son certificadas y la cabina es privada.',
    ],
    follow: [{ k: 'reserve' }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'grupo', label: 'Reservar para dos o más personas', icon: 'users', bare: true,
    answer: [
      `Cada cabina es para máximo dos personas. Para dos tenemos el Duo Masaje: misma sala privada, dos camillas y dos terapeutas (${m('duo', 60)} por 60 min y ${m('duo', 90)} por 90 min, para los dos con la misma técnica). Si cada uno quiere una técnica distinta, el precio cambia y te lo confirma recepción.`,
      'Si son 3 o más, los repartimos en otras cabinas según haya disponibles, y eso lo confirma recepción por WhatsApp. ¿Cuántos son?',
    ],
    follow: [{ k: 'people', n: 2 }, { k: 'people', n: 3 }, { k: 'doubt', scope: 'general' }],
  },
  {
    id: 'otra', label: 'Otra pregunta', icon: 'help', bare: true,
    answer: ['Claro. Eso lo resuelve mejor una persona de recepción: te conecto por WhatsApp.'],
    follow: [{ k: 'advisor' }, { k: 'reserve' }],
  },
]

// ─── Ramas por categoría ──────────────────────────────────────────────────────
/** Un problema o necesidad de "Ayúdame a elegir", con su respuesta y los botones que le siguen. */
export type HelpOpt = { label: string; reply: string[]; follow: Follow[]; group?: string }

/** Tema que agrupa varios problemas de "Ayúdame a elegir" (por ejemplo "Dolor o tensión en el cuerpo"). */
export type HelpGroup = { id: string; label: string; ask: string; icon?: IconName }

export const HELP_DELICATE_LABEL = 'Cosas que me da pena contar'
const HELP_DELICATE_ASK = 'Aquí puedes contarme con confianza, nadie te juzga. Toca la que más se parezca a tu situación.'
const DELICATE_GROUP = (): HelpGroup => ({ id: 'pena', label: HELP_DELICATE_LABEL, ask: HELP_DELICATE_ASK, icon: 'chat' })

export type Branch = {
  intro: string
  helpLabel: string
  /** Pregunta de "Ayúdame a elegir"; si falta, la rama responde directo con `direct`. */
  helpAsk?: string
  /** Si hay grupos, "Ayúdame a elegir" muestra primero los temas y luego los problemas de cada uno. */
  helpGroups?: HelpGroup[]
  help?: HelpOpt[]
  direct?: { reply: string[]; follow: Follow[] }
  catalogLabel: string
  catalogIntro: string
  doubts: Doubt[]
}

const R = (svc: string): Follow => ({ k: 'reserve', svc })

// ─── "Ayúdame a elegir": masajes, por tipo de necesidad ───────────────────────
// Cada problema recomienda el masaje que de verdad le sirve, con base en las
// preguntas frecuentes del sitio. Entre todos cubren los siete masajes.
const MASAJES_GROUPS: HelpGroup[] = [
  { id: 'dolor', label: 'Dolor o tensión en el cuerpo', ask: 'Cuéntame, ¿dónde lo sientes o qué te pasa?', icon: 'hand' },
  { id: 'estres', label: 'Estrés, ansiedad y mente', ask: 'Cuéntame, ¿cómo te sientes?', icon: 'leaf' },
  { id: 'deporte', label: 'Entrenamiento y deporte', ask: '¿En qué momento entrenas o compites?', icon: 'refresh' },
  { id: 'personas', label: 'Para dos o más personas', ask: '¿Cómo van a venir?', icon: 'users' },
  { id: 'especial', label: 'Primera vez y experiencias especiales', ask: 'Cuéntame, ¿qué te gustaría vivir?', icon: 'sparkles' },
  DELICATE_GROUP(),
]

const MASAJES_HELP: HelpOpt[] = [
  // Dolor o tensión en el cuerpo
  {
    group: 'dolor',
    label: 'Aliviar dolor de espalda o contracturas',
    reply: [
      `Para eso va muy bien el tejido profundo o descontracturante (${m('deep-tissue', 60)} por 60 min): trabaja lento y firme la zona lumbar, la espalda alta y los hombros.`,
      'Cuéntale a la terapeuta exactamente dónde te duele antes de empezar.',
    ],
    follow: [R('deep-tissue')],
  },
  {
    group: 'dolor',
    label: 'Cuello y hombros cargados por el trabajo',
    reply: [
      `El tejido profundo (${m('deep-tissue', 60)} por 60 min) o el deportivo (${m('sports', 60)} por 60 min, con pistola de percusión y estiramientos asistidos) trabajan directamente el trapecio y la zona cervical.`,
      `Si tienes poco tiempo, una sesión de 30 minutos enfocada solo en tren superior también funciona (${m('deep-tissue', 30)} en tejido profundo).`,
    ],
    follow: [R('deep-tissue'), R('sports')],
  },
  {
    group: 'dolor',
    label: 'Una lesión o molestia en un punto',
    reply: [
      `Cuando el problema es una lesión o una molestia puntual, rinde más un descontracturante con una sola terapeuta: el tejido profundo (${m('deep-tissue', 60)} por 60 min) trabaja ese punto lento y firme.`,
      'Cuéntanos al reservar si tienes algún dolor, lesión o condición, y dile a la terapeuta exactamente dónde para que adapte la técnica y la presión.',
    ],
    follow: [R('deep-tissue'), { k: 'advisor' }],
  },
  // Estrés, ansiedad y mente
  {
    group: 'estres',
    label: 'Relajarme, bajar el estrés',
    reply: [
      `Para soltar el estrés te va a encantar el masaje relajante (${m('relaxing', 60)} por 60 min). Y si te gusta el calor, están las piedras volcánicas (${m('hot-stones', 60)} por 60 min): piedras de basalto calientes sobre puntos clave.`,
      'Un consejo: para el estrés rinden más 60 o 90 minutos que 30.',
    ],
    follow: [R('relaxing'), R('hot-stones')],
  },
  {
    group: 'estres',
    label: 'Me cuesta desconectar la mente',
    reply: [
      `Para eso está el masaje 4 Manos (${m('four-hands', 60)} por 60 min): dos terapeutas trabajan tu cuerpo a la vez y en sincronía, y la mente deja de seguir el movimiento y se suelta mucho más rápido.`,
      'Es la sesión más inmersiva que ofrecemos y lo recomendamos desde 60 minutos.',
    ],
    follow: [R('four-hands')],
  },
  {
    group: 'estres',
    label: 'Algo más profundo que un relajante, pero sin presión fuerte',
    reply: [
      `Entonces las piedras volcánicas (${m('hot-stones', 60)} por 60 min): piedras de basalto que se calientan, se ponen sobre puntos clave y se usan además como extensión de la mano de la terapeuta.`,
      'Es más profundo que el relajante y trabaja más el sistema nervioso que los nudos puntuales, así que no es un masaje de presión fuerte como el descontracturante.',
    ],
    follow: [R('hot-stones')],
  },
  // Entrenamiento y deporte
  {
    group: 'deporte',
    label: 'Recuperarme después de entrenar',
    reply: [`Lo tuyo es el masaje deportivo (${m('sports', 60)} por 60 min): suma pistola de percusión y estiramientos asistidos, y la mayoría lo reserva justo después de entrenar.`],
    follow: [R('sports')],
  },
  {
    group: 'deporte',
    label: 'Prepararme antes de entrenar o competir',
    reply: [
      `Antes de entrenar sirve una sesión corta y activadora: mejora la movilidad y prepara el músculo. El masaje deportivo (${m('sports', 30)} por 30 min y ${m('sports', 60)} por 60) suma pistola de percusión y estiramientos asistidos.`,
      'Después de entrenar, unas horas más tarde o al día siguiente, rinde una sesión más profunda para la fatiga.',
    ],
    follow: [R('sports')],
  },
  // Para dos o más personas
  {
    group: 'personas',
    label: 'Masaje para dos o más personas',
    reply: [
      `Para dos personas está el Duo Masaje (${m('duo', 60)} por 60 min y ${m('duo', 90)} por 90 min, para los dos): misma sala privada, dos camillas y dos terapeutas, y cada uno escoge su técnica.`,
      'Con la misma técnica para los dos el precio es el del Duo; si escogen técnicas distintas, el precio cambia y te lo confirma recepción.',
      'Si son 3 o más, los repartimos en otras cabinas según haya disponibles, y eso lo confirma recepción por WhatsApp.',
    ],
    follow: [R('duo'), { k: 'people', n: 3 }],
  },
  {
    group: 'personas',
    label: 'Somos dos y cada uno quiere algo distinto',
    reply: [
      `Se puede: en el Duo Masaje cada uno escoge su técnica (relajante, tejido profundo, deportivo, piedras volcánicas o sensitivo), en la misma sala privada con dos camillas y dos terapeutas.`,
      `Con técnicas distintas el precio es diferente al del Duo con la misma técnica (${m('duo', 60)} por 60 min y ${m('duo', 90)} por 90, para los dos), y recepción te confirma el total por WhatsApp.`,
    ],
    follow: [R('duo')],
  },
  // Primera vez y experiencias especiales
  {
    group: 'especial',
    label: 'Es mi primera vez y no sé cuál elegir',
    reply: [
      `Para empezar te recomiendo el masaje relajante (${m('relaxing', 60)} por 60 min): es el más pedido, con movimientos largos y suaves que se sienten agradables todo el tiempo.`,
      'Y en cualquier momento puedes pedir más o menos presión: solo se lo dices a la terapeuta.',
    ],
    follow: [R('relaxing')],
  },
  {
    group: 'especial',
    label: 'Tengo poco tiempo',
    reply: [
      `Con 30 minutos puedes trabajar una zona puntual, como cuello y hombros: el relajante cuesta ${m('relaxing', 30)} y el tejido profundo ${m('deep-tissue', 30)}.`,
      'Eso sí: para el estrés en general, 60 o 90 minutos rinden mucho más que 30, porque el cuerpo necesita tiempo para soltar.',
    ],
    follow: [R('relaxing'), R('deep-tissue')],
  },
  {
    group: 'especial',
    label: 'Quiero algo especial, distinto a un masaje normal',
    reply: [
      `Tres opciones: el 4 Manos (${m('four-hands', 60)} por 60 min), con dos terapeutas trabajando a la vez y en sincronía; las piedras volcánicas (${m('hot-stones', 60)} por 60 min), con piedras de basalto calientes; y el sensitivo (${m('sensitive', 60)} por 60 min), de movimientos suaves y lentos para soltar la tensión.`,
    ],
    follow: [R('four-hands'), R('hot-stones'), R('sensitive')],
  },
  {
    group: 'especial',
    label: 'Una experiencia lenta de cuerpo completo',
    reply: [`Entonces el masaje sensitivo (${m('sensitive', 60)} por 60 min): es de movimientos suaves y lentos para soltar la tensión, sin presión profunda.`],
    follow: [R('sensitive')],
  },
  // Cosas que me da pena contar
  {
    group: 'pena',
    label: 'Tengo ansiedad o me siento muy agobiado',
    reply: [
      `Gracias por contarlo. Para el estrés y la ansiedad va muy bien el masaje relajante (${m('relaxing', 60)} por 60 min) y, si quieres algo más profundo, las piedras volcánicas (${m('hot-stones', 60)} por 60 min): los dos trabajan sobre el sistema nervioso más que sobre nudos puntuales.`,
      'Rinden más 60 o 90 minutos que 30, porque el cuerpo necesita tiempo para soltar. Un masaje ayuda a relajarte, pero no reemplaza el acompañamiento de un profesional de la salud si lo necesitas.',
    ],
    follow: [R('relaxing'), R('hot-stones')],
  },
  {
    group: 'pena',
    label: 'Me da pena ir solo',
    reply: [
      'Para nada: la mayoría de nuestros clientes viene solo. El masaje es una sesión privada, uno a uno, en cabina cerrada, así que venir solo es lo habitual y no la excepción.',
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'Me da miedo que duela o no aguanto la presión fuerte',
    reply: [
      `Entonces elige uno suave: el relajante (${m('relaxing', 60)} por 60 min) se siente agradable todo el tiempo, y el sensitivo (${m('sensitive', 60)} por 60 min) es lento y suave, sin presión profunda.`,
      'Y en cualquiera puedes pedir más o menos presión en el momento que quieras: solo lo dices y la terapeuta lo ajusta.',
    ],
    follow: [R('relaxing'), R('sensitive')],
  },
  {
    group: 'pena',
    label: 'Me pone nervioso que me toque una terapeuta que no conozco',
    reply: [
      'Es más común de lo que crees. La sesión es privada, uno a uno, en cabina cerrada y con una terapeuta certificada que hace esto todos los días; quedas cubierto con toallas y solo se descubre la zona que se trabaja.',
      'Y en cualquier momento puedes pedir que pare, cambiar la presión o que no se trabaje alguna zona.',
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'Me duele una zona que me da pena que me toquen',
    reply: [
      'Cuéntale a la terapeuta exactamente dónde te duele antes de empezar: ella ajusta la técnica y la presión, y puedes pedir que no se trabaje alguna zona. Quedas cubierto con toallas y solo se descubre la zona que se trabaja.',
      `Para un dolor muscular profundo suele rendir el tejido profundo (${m('deep-tissue', 60)} por 60 min).`,
    ],
    follow: [R('deep-tissue')],
  },
  {
    group: 'pena',
    label: 'Me da pena mi cuerpo',
    reply: [
      'Es más común de lo que crees. Las terapeutas trabajan con todo tipo de cuerpos todos los días y se enfocan en cómo te sientes, no en cómo te ves.',
      'Además, quedas cubierto con toallas y solo se descubre la zona que se trabaja.',
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'Vengo sudado del gimnasio o del trabajo',
    reply: [
      'No pasa nada: lo ideal es llegar aseado, pero si vienes del gimnasio o de un día largo lo importante es que llegues cómodo. Es algo que las terapeutas ven todos los días.',
    ],
    follow: [{ k: 'reserve' }],
  },
  {
    group: 'pena',
    label: 'Tengo cicatrices o marcas en la piel',
    reply: [
      'Las terapeutas trabajan con todo tipo de cuerpos todos los días y se enfocan en cómo te sientes, no en cómo te ves.',
      'Si la cicatriz es de una cirugía reciente, cuéntanoslo al reservar: en la mayoría de los casos adaptamos la técnica, la presión y la posición.',
    ],
    follow: [{ k: 'reserve' }, { k: 'advisor' }],
  },
]

// ─── "Ayúdame a elegir": faciales ─────────────────────────────────────────────
const FACIALES_GROUPS: HelpGroup[] = [
  { id: 'piel', label: 'Cómo está mi piel', ask: 'Cuéntame, ¿cómo está tu piel?', icon: 'sparkles' },
  { id: 'ocasion', label: 'Una ocasión o una zona', ask: 'Cuéntame, ¿qué necesitas?', icon: 'calendar' },
  DELICATE_GROUP(),
]

const FACIALES_HELP: HelpOpt[] = [
  {
    group: 'piel',
    label: 'Piel grasa, poros dilatados o puntos negros',
    reply: [`Para eso funciona muy bien la limpieza facial profunda (${m('lf-profunda')}, 60 min) o el HydraFacial (${m('hidrafacial')}, 90 min). Ajustamos los productos para controlar el sebo sin resecar la piel.`],
    follow: [R('lf-profunda'), R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'Piel sensible',
    reply: [`Con piel sensible vamos con calma: la limpieza facial básica (${m('lf-basica')}, 45 min) o la hidratación facial (${m('hidratacion')}, 45 min), sin extracciones agresivas.`, 'Si usas algún producto activo, cuéntaselo a la terapeuta.'],
    follow: [R('lf-basica'), R('hidratacion')],
  },
  {
    group: 'piel',
    label: 'Piel apagada o quiero resultado inmediato',
    reply: [`Entonces el HydraFacial (${m('hidrafacial')}, 90 min): limpia, exfolia e hidrata en una sola sesión, sin días de rojez.`, 'No requiere recuperación: puedes maquillarte el mismo día.'],
    follow: [R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'Piel seca o deshidratada',
    reply: [
      `La hidratación facial (${m('hidratacion')}, 45 min) va directo a eso. Y si además la ves opaca, el HydraFacial (${m('hidrafacial')}, 90 min) también se usa para la deshidratación y la falta de luminosidad.`,
      'Con piel seca rinde mejor hacerse una limpieza profunda cada dos meses que cada mes.',
    ],
    follow: [R('hidratacion'), R('hidrafacial')],
  },
  {
    group: 'piel',
    label: 'Tengo acné',
    reply: [
      `La limpieza facial profunda (${m('lf-profunda')}, 60 min) ayuda como apoyo: descongestiona los poros, reduce los puntos negros y mejora la textura de la piel. Si tu piel es grasa o con tendencia acneica, lo habitual es hacerla cada mes.`,
      'No reemplaza el tratamiento del dermatólogo en acné moderado o severo. Si tienes lesiones inflamadas activas, avísanos y adaptamos la sesión o te recomendamos esperar.',
    ],
    follow: [R('lf-profunda'), { k: 'advisor' }],
  },
  {
    group: 'piel',
    label: 'No sé qué necesita mi piel',
    reply: [
      'Sin problema, no necesitas saber nada: cuéntale a la terapeuta cómo sientes tu piel y qué te molesta, y ella te orienta y te da una rutina básica para el cuidado en casa.',
      `Si quieres empezar suave, la limpieza facial básica (${m('lf-basica')}, 45 min) va sin extracciones agresivas; y si quieres el tratamiento más completo, el HydraFacial (${m('hidrafacial')}, 90 min).`,
    ],
    follow: [R('lf-basica'), R('hidrafacial')],
  },
  {
    group: 'ocasion',
    label: 'Tengo un evento y quiero verme bien',
    reply: [
      `El HydraFacial (${m('hidrafacial')}, 90 min) es el indicado: no tiene recuperación y puedes maquillarte el mismo día, así que funciona muy bien antes de un evento.`,
      'La limpieza profunda incluye extracciones: después la piel puede verse algo roja y conviene esperar unas 24 horas para maquillarte, así que hazla con un día de anticipación.',
    ],
    follow: [R('hidrafacial'), R('lf-profunda')],
  },
  {
    group: 'ocasion',
    label: 'Irritación por afeitado o vellos encarnados',
    reply: [`La limpieza facial profunda (${m('lf-profunda')}, 60 min) ayuda con la irritación por afeitado, los vellos encarnados y los poros dilatados; es de las más pedidas por hombres.`],
    follow: [R('lf-profunda')],
  },
  {
    group: 'ocasion',
    label: 'Limpiar la espalda',
    reply: [`Para la espalda tenemos la limpieza de espalda (${m('lf-espalda')}, 60 min).`],
    follow: [R('lf-espalda')],
  },
  // Cosas que me da pena contar
  {
    group: 'pena',
    label: 'Tengo granos en la espalda y me da pena mostrarla',
    reply: [
      `Para eso tenemos la limpieza de espalda (${m('lf-espalda')}, 60 min). Las terapeutas ven todo tipo de pieles todos los días y nadie te juzga: solo cuéntales qué te molesta.`,
      'Si tienes lesiones inflamadas activas, avísanos y adaptamos la sesión o te recomendamos esperar.',
    ],
    follow: [R('lf-espalda')],
  },
  {
    group: 'pena',
    label: 'Me da pena hacerme un facial',
    reply: [
      `Es más común de lo que crees entre nuestros clientes hombres: la limpieza facial profunda (${m('lf-profunda')}, 60 min) es de los tratamientos más pedidos, y es especialmente efectiva contra la irritación por afeitado, los vellos encarnados, los poros dilatados y el daño de la contaminación.`,
      'Todo es en cabina privada y la terapeuta te orienta desde el principio.',
    ],
    follow: [R('lf-profunda')],
  },
  {
    group: 'pena',
    label: 'No quiero que me aprieten ni me extraigan los puntos negros a mano',
    reply: [
      `Entonces el HydraFacial (${m('hidrafacial')}, 90 min): limpia, exfolia, extrae impurezas e hidrata con succión controlada y sueros, en lugar de presión manual.`,
      'Y si prefieres la limpieza profunda, la extracción es más incómoda que dolorosa y solo en las zonas más congestionadas, normalmente nariz y mentón; puedes pedir menos intensidad cuando quieras.',
    ],
    follow: [R('hidrafacial'), R('lf-profunda')],
  },
]

// ─── "Ayúdame a elegir": depilación ───────────────────────────────────────────
const DEPILACION_GROUPS: HelpGroup[] = [
  { id: 'general', label: 'Cera, máquina y cuidados', ask: 'Cuéntame, ¿qué necesitas saber?', icon: 'leaf' },
  DELICATE_GROUP(),
]

const DEPILACION_HELP: HelpOpt[] = [
  {
    group: 'general',
    label: 'Cera o máquina',
    reply: [
      `Buena pregunta. La máquina duele claramente menos y es más económica: la pierna completa cuesta ${m('dep-pierna', 'machine')} con máquina y ${m('dep-pierna', 'wax')} con cera.`,
      'A cambio, la cera arranca el vello desde la raíz, así que el resultado dura semanas en lugar de días.',
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'Ver zonas y precios' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: 'Es mi primera vez depilándome',
    reply: [
      'La primera sesión siempre es la más incómoda; desde la segunda el vello sale más fino y duele bastante menos. Si te preocupa el dolor, la máquina duele claramente menos que la cera.',
      'Para la cera, el vello debe medir entre 5 mm y 1 cm (unas dos o tres semanas de crecimiento), así que no te afeites en los días previos a la cita.',
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'Ver zonas y precios' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: 'Depilación para hombres',
    reply: [
      `Sí, depilamos hombres. Las zonas más pedidas son pecho (${m('dep-pecho', 'wax')} con cera, ${m('dep-pecho', 'machine')} con máquina), espalda (${m('dep-espalda', 'wax')} y ${m('dep-espalda', 'machine')}) y cuerpo completo (${m('dep-full', 'wax')} y ${m('dep-full', 'machine')}).`,
      'Todo es en cabina privada, con una terapeuta certificada. La espalda es de las zonas menos sensibles, así que está entre las más tolerables.',
    ],
    follow: [R('dep-pecho'), R('dep-espalda'), R('dep-full')],
  },
  {
    group: 'general',
    label: 'Quiero que me dure más tiempo',
    reply: [
      'Entonces la cera: arranca el vello desde la raíz y da un resultado limpio inmediato, ideal para una fecha puntual como un viaje o un evento. El vello vuelve en unas tres o cuatro semanas.',
      'Y si mantienes el ritmo, depilándote cada tres o cuatro semanas, el vello vuelve más fino y escaso, y las sesiones duelen menos.',
    ],
    follow: [{ k: 'catalog', cat: 'depilacion', label: 'Ver zonas y precios' }, { k: 'reserve' }],
  },
  {
    group: 'general',
    label: 'Se me irrita la piel o me salen vellos encarnados',
    reply: [
      'Lo que más ayuda es el cuidado de después: exfolia suavemente dos o tres veces por semana desde las 48 horas siguientes, hidrata a diario y evita la ropa muy ajustada los primeros días.',
      'Espera unas 24 horas para hacer ejercicio: el sudor y el roce sobre los folículos recién abiertos son la causa principal de irritación y pequeños granitos. Ese mismo día evita también piscina, sauna y sol.',
    ],
    follow: [{ k: 'reserve' }],
  },
  // Cosas que me da pena contar
  {
    group: 'pena',
    label: 'Quiero depilarme la zona íntima',
    reply: [
      `Se agenda como depilación de zona íntima (${m('dep-bikini', 'wax')} con cera, ${m('dep-bikini', 'machine')} con máquina): retira el vello de toda la zona, de adelante hacia atrás, y el acabado lo defines con la terapeuta antes de empezar.`,
      'Es en cabina privada y te desvistes solo la zona que se va a depilar. Si te preocupa el dolor, la máquina duele claramente menos que la cera; la primera sesión es la más incómoda.',
    ],
    follow: [R('dep-bikini')],
  },
  {
    group: 'pena',
    label: 'Quiero depilarme la zona perianal',
    reply: [
      `Es la depilación del vello que hay alrededor del ano y entre los glúteos. Cuesta ${m('dep-perianal', 'wax')} con cera y ${m('dep-perianal', 'machine')} con máquina, y dura unos 30 minutos.`,
      'Es una de las zonas más sensibles, así que la primera sesión suele ser la más incómoda; la máquina duele claramente menos. Todo es en cabina privada, con una terapeuta certificada.',
    ],
    follow: [R('dep-perianal')],
  },
  {
    group: 'pena',
    label: 'Me da pena cómo tengo el vello',
    reply: [
      'La terapeuta hace esto todos los días y nadie te juzga. Solo ten en cuenta que para la cera lo ideal es que el vello mida entre 5 mm y 1 cm; si está mucho más largo, duele más.',
      'Y no te afeites en los días previos a la cita.',
    ],
    follow: [{ k: 'reserve' }],
  },
]

export const BRANCHES: Record<Cat, Branch> = {
  masajes: {
    intro: 'Buena elección. ¿Cómo te ayudo con los masajes?',
    helpLabel: 'Ayúdame a elegir',
    helpAsk: 'Cuéntame, ¿qué buscas con el masaje? Toca el tema que más se parezca.',
    helpGroups: MASAJES_GROUPS,
    help: MASAJES_HELP,
    catalogLabel: 'Ver masajes y precios',
    catalogIntro: 'Estos son nuestros masajes; toca el que te llame la atención.',
    doubts: [
      {
        label: '¿Relajante o descontracturante?',
        answer: ['Buena pregunta. El relajante usa movimientos suaves para bajar el estrés y se siente agradable todo el tiempo.', 'El descontracturante aplica presión más lenta y firme sobre nudos y tensión crónica; puede sentirse intenso en los puntos más cargados.'],
        follow: [R('relaxing'), R('deep-tissue')],
      },
      {
        label: '¿Duele el tejido profundo?',
        answer: ['Es normal preguntarlo. Debe sentirse como una molestia fuerte pero productiva, de esas que puedes respirar sin problema; nunca como dolor agudo.', 'Y puedes pedir menos presión en cualquier momento.'],
        follow: [R('deep-tissue')],
      },
      {
        label: '¿Deportivo antes o después de entrenar?',
        answer: ['Sirven los dos. Antes, una sesión corta que activa el músculo; después (unas horas más tarde o al día siguiente), una más profunda para la fatiga.', 'La mayoría lo reserva después.'],
        follow: [R('sports')],
      },
      {
        label: '¿30, 60 o 90 minutos?',
        answer: ['Depende de lo que busques. Para el estrés y el descontracturante rinden más 60 o 90 minutos.', 'Con 30 minutos puedes trabajar una zona puntual, como cuello y hombros.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Cada cuánto me lo hago?',
        answer: ['Si tienes tensión constante, cada dos a cuatro semanas.', 'Si estás tratando un problema activo, una sesión por semana durante tres o cuatro semanas y luego espaciar.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Qué es 4 Manos y vale la pena?',
        answer: ['Dos terapeutas trabajan tu cuerpo a la vez y en sincronía; la mente deja de seguir el movimiento y se suelta más rápido. Es ideal si te cuesta desconectar.', 'Si lo que tienes es una lesión puntual, rinde más un descontracturante con una sola terapeuta.'],
        follow: [R('four-hands')],
      },
      {
        label: '¿Qué me pongo? ¿Me quito toda la ropa?',
        answer: ['Es muy sencillo: te desvistes hasta donde te sientas a gusto; la mayoría conserva la ropa interior.', 'Te dejamos solo para cambiarte y quedas cubierto con toallas: solo se descubre la zona que se trabaja.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Condiciones de salud',
        answer: ['Gracias por preguntarlo, es importante. Cuéntanos al reservar si tienes hipertensión no controlada, várices, trombosis, cirugías recientes, fiebre o infecciones en la piel, o si tomas anticoagulantes.', 'En la mayoría de los casos adaptamos la técnica.'],
        follow: [{ k: 'advisor' }, { k: 'reserve' }],
      },
      {
        label: '¿Es un masaje 100 % profesional?', delicate: true,
        answer: [
          'Sí. Diamond Spa es un spa profesional: las terapeutas son certificadas y nuestros servicios son exclusivamente terapéuticos y estéticos.',
          'Si buscas algo distinto a un masaje profesional, aquí no lo vas a encontrar.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Me da pena mi cuerpo', delicate: true,
        answer: [
          'Es más común de lo que crees. Las terapeutas trabajan con todo tipo de cuerpos todos los días y se enfocan en cómo te sientes, no en cómo te ves.',
          'Además, quedas cubierto con toallas y solo se descubre la zona que se trabaja.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Y si algo me incomoda durante el masaje?', delicate: true,
        answer: [
          'Lo dices en el momento, sin pena: puedes pedir más o menos presión, cambiar la música o la temperatura, o que no se trabaje alguna zona, y la terapeuta lo ajusta.',
          'Si prefieres decirlo después, también puedes contárselo a recepción.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Tengo que bañarme antes?', delicate: true,
        answer: ['Lo ideal es llegar aseado, como a cualquier cita con un profesional. Si vienes del gimnasio o de un día largo, no pasa nada: lo importante es que llegues cómodo.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Es normal quedarme dormido o roncar?', delicate: true,
        answer: ['Muy normal, y es buena señal: significa que lograste soltarte. Pasa seguido y no hay nada de qué preocuparse.'],
        follow: [{ k: 'reserve' }],
      },
    ],
  },

  faciales: {
    intro: 'Buena elección. ¿Cómo te ayudo con tu piel?',
    helpLabel: 'Ayúdame a elegir',
    helpAsk: 'Cuéntame, ¿cómo está tu piel o qué necesitas? Toca el tema que más se parezca.',
    helpGroups: FACIALES_GROUPS,
    help: FACIALES_HELP,
    catalogLabel: 'Ver faciales y precios',
    catalogIntro: 'Estos son nuestros faciales; toca el que te llame la atención.',
    doubts: [
      {
        label: '¿Qué es el HydraFacial?',
        answer: ['Es un tratamiento que limpia, exfolia, extrae impurezas e hidrata en una sola sesión, con succión controlada y sueros.', 'Se usa para poros dilatados, puntos negros, falta de luminosidad y deshidratación, y no deja días de rojez.'],
        follow: [R('hidrafacial')],
      },
      {
        label: '¿HydraFacial o limpieza profunda?',
        answer: ['Buena pregunta. El HydraFacial es nuestro tratamiento facial más completo y no requiere recuperación: puedes maquillarte el mismo día.', 'La limpieza profunda incluye extracciones, y después conviene esperar unas 24 horas para maquillarte.'],
        follow: [R('hidrafacial'), R('lf-profunda')],
      },
      {
        label: '¿Duele la extracción de puntos negros?',
        answer: ['En la limpieza profunda, la extracción es más incómoda que dolorosa, y solo en las zonas más congestionadas, normalmente nariz y mentón.', 'Antes se ablanda la piel con vapor o una enzima, y puedes pedir menos intensidad cuando quieras.'],
        follow: [R('lf-profunda')],
      },
      {
        label: '¿Me puedo maquillar después?',
        answer: ['Depende del tratamiento. Después de una limpieza profunda con extracciones, espera unas 24 horas: los poros quedan abiertos y la piel puede verse algo roja.', 'Después de un HydraFacial puedes maquillarte el mismo día.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Cada cuánto me lo hago?',
        answer: ['La limpieza profunda, cada cuatro a seis semanas (cada mes si la piel es grasa o con tendencia acneica, cada dos meses si es seca o sensible).', 'El HydraFacial dura unas tres a cuatro semanas, así que lo habitual es una sesión al mes.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Tengo piel sensible o acné',
        answer: ['Claro que puedes. Para piel sensible recomendamos limpieza básica o hidratación, sin extracciones agresivas.', 'Con acné, la limpieza ayuda como apoyo pero no reemplaza al dermatólogo; si tienes lesiones inflamadas activas, avísanos y adaptamos la sesión.'],
        follow: [R('lf-basica'), R('hidratacion'), { k: 'advisor' }],
      },
      {
        label: '¿Hay limpieza facial para hombres?',
        answer: ['Sí. La limpieza facial profunda es de las más pedidas por hombres: ayuda con la irritación por afeitado, los vellos encarnados, los poros dilatados y el daño de la contaminación.'],
        follow: [R('lf-profunda')],
      },
      {
        label: 'Me da pena cómo tengo la piel', delicate: true,
        answer: [
          'Es lo que hacemos todos los días: las terapeutas ven todo tipo de pieles y nadie te juzga.',
          'Solo cuéntales qué te molesta y adaptan el tratamiento. Si tienes lesiones inflamadas activas, avísanos y adaptamos la sesión.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Nunca me he hecho un facial y no sé nada', delicate: true,
        answer: ['No necesitas saber nada. Cuéntale a la terapeuta cómo sientes tu piel y qué te molesta, y ella te orienta con el tratamiento que te conviene y con una rutina básica para el cuidado en casa.'],
        follow: [{ k: 'reserve' }],
      },
    ],
  },

  depilacion: {
    intro: 'Buena elección. ¿Cómo te ayudo con la depilación?',
    helpLabel: 'Ayúdame a elegir',
    helpAsk: 'Cuéntame, ¿qué necesitas? Toca el tema que más se parezca.',
    helpGroups: DEPILACION_GROUPS,
    help: DEPILACION_HELP,
    catalogLabel: 'Ver zonas y precios',
    catalogIntro: 'Estas son las zonas. Al reservar te pregunto si la quieres con cera o con máquina.',
    doubts: [
      {
        label: '¿Duele la depilación?',
        answer: ['Es normal preguntarlo. La máquina duele claramente menos que la cera, y también cambia según la zona.', 'La primera sesión siempre es la más incómoda; desde la segunda el vello sale más fino y duele bastante menos.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Cuánto debe medir el vello?',
        answer: ['Entre 5 mm y 1 cm, más o menos dos o tres semanas de crecimiento.', 'Y no te afeites en los días previos a la cita.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Cada cuánto me depilo?',
        answer: ['Cada tres o cuatro semanas en promedio.', 'Si mantienes el ritmo, el vello vuelve más fino y las sesiones duelen menos.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Puedo hacer ejercicio después?',
        answer: ['Mejor espera unas 24 horas.', 'Ese mismo día evita también piscina, sauna y exposición al sol.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Cómo evitar vellos encarnados',
        answer: ['Exfolia suavemente dos o tres veces por semana desde las 48 horas siguientes, hidrata a diario y evita la ropa muy ajustada los primeros días.'],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Qué es la depilación brasileña?',
        answer: [`Retira el vello de toda la zona íntima, de adelante hacia atrás. Se agenda como depilación de zona íntima (${m('dep-bikini', 'wax')} con cera, ${m('dep-bikini', 'machine')} con máquina), y el acabado lo defines con la terapeuta antes de empezar.`],
        follow: [R('dep-bikini')],
      },
      {
        label: '¿Y el cuerpo completo?',
        answer: [`Cuesta ${m('dep-full', 'wax')} con cera y ${m('dep-full', 'machine')} con máquina.`, 'Es nuestro servicio de depilación más largo, unas 2 horas, así que te recomiendo reservar con tiempo.'],
        follow: [R('dep-full')],
      },
      {
        label: 'Me da pena la depilación íntima', delicate: true,
        answer: [
          'Es totalmente normal sentirlo. La sesión es privada, en cabina cerrada, con una terapeuta certificada que hace esto todos los días.',
          'Te desvistes solo la zona que se va a depilar y la terapeuta te va indicando cómo acomodarte.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: 'Soy hombre, ¿me da pena depilarme?', delicate: true,
        answer: [
          'Para nada. Depilamos hombres y mujeres, y los servicios de pecho, espalda y cuerpo completo son de los más pedidos por hombres.',
          'Todo es en cabina privada, con una terapeuta certificada.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Qué es la zona perianal?', delicate: true,
        answer: [
          'Es la depilación del vello que hay alrededor del ano y entre los glúteos.',
          `Cuesta ${m('dep-perianal', 'wax')} con cera y ${m('dep-perianal', 'machine')} con máquina, y dura unos 30 minutos.`,
        ],
        follow: [R('dep-perianal')],
      },
      {
        label: '¿Duele más la zona íntima?', delicate: true,
        answer: [
          'Sí: la zona íntima y la perianal están entre las más sensibles, así que la primera sesión suele ser la más incómoda.',
          'La máquina duele claramente menos que la cera, y desde la segunda sesión el vello sale más fino y duele bastante menos.',
        ],
        follow: [{ k: 'reserve' }],
      },
      {
        label: '¿Puedo depilarme con la regla?', delicate: true,
        answer: [
          'Depende de la zona. En la zona íntima la piel está más sensible esos días y suele doler más, por eso muchas personas prefieren esperar unos días.',
          'Si quieres confirmar tu caso, una asesora te ayuda.',
        ],
        follow: [{ k: 'advisor' }, { k: 'reserve' }],
      },
    ],
  },
}

// ─── Qué es cada masaje (al elegirlo dentro de la reserva) ────────────────────
const prices3 = (id: string) => `${m(id, 30)} por 30 min, ${m(id, 60)} por 60 y ${m(id, 90)} por 90`

/** Texto que se muestra al elegir un masaje en la reserva, antes de seguir con él. */
export const MASSAGE_ABOUT: Record<string, string[]> = {
  relaxing: [
    'El masaje relajante usa movimientos largos, suaves y rítmicos para bajar el estrés: el objetivo es la calma, y se siente agradable todo el tiempo.',
    `Cuesta ${prices3('relaxing')}. Para el estrés rinden más 60 o 90 minutos que 30.`,
  ],
  'deep-tissue': [
    'El tejido profundo trabaja las capas musculares profundas con presión lenta y firme sobre nudos y tensión crónica; va muy bien para la zona lumbar, la espalda alta y los hombros.',
    `Debe sentirse como una molestia fuerte pero productiva, nunca como dolor agudo, y puedes pedir menos presión cuando quieras. Cuesta ${prices3('deep-tissue')}.`,
  ],
  sports: [
    'El masaje deportivo es un descontracturante que suma pistola de percusión y estiramientos asistidos. Sirve antes de entrenar, en una sesión corta que activa el músculo, o después, para la fatiga; la mayoría lo reserva después.',
    `Cuesta ${prices3('sports')}.`,
  ],
  'hot-stones': [
    'Las piedras volcánicas son piedras de basalto que se calientan, se ponen sobre puntos clave y se usan además como extensión de la mano de la terapeuta. Es una opción más profunda que el relajante y trabaja más el sistema nervioso que los nudos puntuales.',
    `Cuesta ${prices3('hot-stones')}.`,
  ],
  'four-hands': [
    'El 4 Manos es tener dos terapeutas trabajando tu cuerpo al mismo tiempo, en sincronía. La mente no alcanza a seguir cuatro manos, deja de rastrear y se suelta mucho más rápido: es la sesión más inmersiva que ofrecemos.',
    `Lo recomendamos desde 60 minutos: ${m('four-hands', 60)} por 60 y ${m('four-hands', 90)} por 90. Si lo que necesitas es trabajar una lesión puntual, rinde más un descontracturante con una sola terapeuta.`,
  ],
  duo: [
    'El Duo Masaje es para dos personas: misma sala privada, dos camillas y dos terapeutas, y cada uno escoge su técnica.',
    `${m('duo', 60)} por 60 min y ${m('duo', 90)} por 90, para los dos con la misma técnica. Si escogen técnicas distintas, el precio cambia y recepción te lo confirma.`,
  ],
  sensitive: [
    'El masaje sensitivo es de cuerpo completo: movimientos suaves y lentos para soltar la tensión, sin presión profunda y sin prisa.',
    `Cuesta ${prices3('sensitive')}.`,
  ],
}

// ─── Reserva ──────────────────────────────────────────────────────────────────
export const RES = {
  askContinue: '¿Continuamos con este masaje o prefieres ver otros?',
  continueMassage: 'Continuar con este masaje',
  moreMassages: 'Regresar a ver más masajes',
  askPeople: '¡Vamos a dejarlo listo! ¿Para cuántas personas es la reserva?',
  askPlan: 'Perfecto. ¿Qué quieren hacer?',
  askCat: '¿Qué servicio te gustaría reservar?',
  askSvc: '¿Cuál te gustaría?',
  askMinutes: '¿Cuánto tiempo prefieres?',
  askWax: '¿La quieres con cera o con máquina?',
  askDate: '¿Qué día te queda mejor? Sin compromiso: recepción te confirma la disponibilidad.',
  askTime: '¿A qué hora te gustaría venir?',
  noSlots: 'Para ese día ya no quedan horas. ¿Probamos con otro?',
  askNameReserve: 'Ya casi. ¿Cómo te llamas?',
  askNameAdvisor: 'Con gusto. ¿Cómo te llamas?',
  askPhone: (name: string) => `${name ? `Mucho gusto, ${name}. ` : ''}¿Cuál es tu celular? Es para que recepción te confirme por WhatsApp.`,
  badPhone: 'Mmm, a ese número le faltan dígitos. ¿Me lo escribes completo?',
  group: [
    'Cada cabina es para máximo dos personas, pero podemos repartirlos en otras cabinas si hay disponibles.',
    'Eso lo confirma recepción: escríbenos directo y lo revisamos.',
  ],
  duoIntro: ['El Duo Masaje es en una misma sala privada, con dos camillas y dos terapeutas.', 'Empecemos por la persona 1: ¿qué técnica prefiere?'],
  duoSecond: 'Ahora la persona 2: ¿qué técnica prefiere?',
  duoDiffPrice: 'Con técnicas distintas el precio es diferente al del Duo con la misma técnica. Recepción te confirma el total por WhatsApp.',
  duoPriceTbc: 'por confirmar con recepción',
  duoNote: 'El Duo usa dos terapeutas a la vez, así que conviene reservar con dos o tres días de anticipación, más si es fin de semana.',
  sameIntro: 'Elijan el servicio y la duración; vale para los dos.',
  distinctIntro: 'Empecemos por la persona 1: ¿qué servicio y cuánto tiempo?',
  distinctSecond: 'Ahora la persona 2: ¿qué servicio y cuánto tiempo?',
  togetherNote: 'Queremos que estén juntos: recepción revisa que haya dos terapeutas libres a esa hora y te confirma.',
  doneHelp: 'Te abrimos WhatsApp con tus datos ya escritos; si quieres, envíalos y recepción te confirma la disponibilidad.',
  advisorDone: (name: string) => `${name ? `Listo, ${name}. ` : 'Listo. '}Te abrimos WhatsApp para que hables con recepción.`,
}
