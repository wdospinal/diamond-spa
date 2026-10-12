/**
 * Hand-written content for the waxing detail pages (/services/depilacion-*).
 *
 * Search Console left several of these in "Crawled - currently not indexed" or
 * "Discovered - currently not indexed": the eight pages shared about half of
 * their text (same template, only the zone and price changed). Each zone here
 * answers what people actually ask about it — how long it takes, how much it
 * hurts and how to make it hurt less, care before and after, and how often to
 * come back — so every page carries its own copy.
 *
 * Keep it consistent with the waxing FAQs in `faqs.ts`: wax lasts 3–4 weeks,
 * hair should be 5 mm–1 cm, single-use materials, private cabin. Durations
 * match the booking slots in BookClient. Prices are never written here.
 */

import type { ServiceContent } from './service-content'

type Locale = 'en' | 'es'
type L<T = string> = Record<Locale, T>

const l = (es: string, en: string): L => ({ es, en })
const list = (es: string[], en: string[]): L<string[]> => ({ es, en })

// Labels shared by every waxing page; the values below are per zone.
const FACT = {
  duration: { icon: 'schedule', label: l('Duración', 'Duration') },
  frequency: { icon: 'calendar_month', label: l('Frecuencia', 'How often') },
  pain: { icon: 'sentiment_neutral', label: l('Dolor', 'Pain') },
  hair: { icon: 'straighten', label: l('Largo del vello', 'Hair length') },
}

const HAIR_LENGTH = l('5 mm a 1 cm', '5 mm to 1 cm')

const SUITABILITY_TITLES = {
  title: l('¿Puedo depilarme hoy?', 'Can I get waxed today?'),
  idealTitle: l('Es buen momento si', 'Good time to come if'),
  waitTitle: l('Mejor espera o avísanos si', 'Better wait or tell us first if'),
}

const AFTERCARE_TITLES = {
  title: l('Cuidados antes y después', 'Before and after care'),
  beforeTitle: l('Antes de tu cita', 'Before your appointment'),
  afterTitle: l('Las primeras 24–48 horas', 'The first 24–48 hours'),
}

const UNDERARM: ServiceContent = {
  durationMin: 20,
  h1: l('Depilación de axila en Medellín', 'Underarm waxing in Medellín'),
  whatIs: {
    title: l('Depilación de axila: rápida y con resultado de semanas', 'Underarm waxing: quick, and it lasts for weeks'),
    body: list(
      [
        'La axila es una zona pequeña pero exigente: el vello es grueso, crece en varias direcciones y la piel es fina. Por eso la depilamos por secciones, siguiendo el sentido de cada remolino, para sacar el vello desde la raíz sin repasar la misma piel varias veces.',
        'Es nuestro servicio de depilación más corto: el turno es de 20 minutos y sales sin vello y sin el sombreado que deja la cuchilla. Con cera, el resultado dura de tres a cuatro semanas; con máquina es más suave para la piel y más económico, pero el vello vuelve antes.',
      ],
      [
        'The underarm is a small area but a demanding one: the hair is coarse, grows in several directions and the skin is thin. That is why we wax it in sections, following each growth pattern, so the hair comes out from the root without going over the same skin again and again.',
        'It is our shortest waxing service: the slot is 20 minutes and you leave with no hair and none of the shadow a razor leaves. With wax the result lasts three to four weeks; the machine is gentler on the skin and cheaper, but the hair comes back sooner.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('20 minutos', '20 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Moderado, solo segundos', 'Moderate, just seconds') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele la depilación de axila? Cómo hacer que duela menos', 'Does underarm waxing hurt? How to make it hurt less'),
    items: [
      {
        icon: 'timer',
        title: l('Es un dolor corto', 'The pain is brief'),
        body: l(
          'La piel de la axila es sensible, pero cada tirón dura un segundo y la zona se termina en pocos minutos. La primera vez es la más intensa.',
          'Underarm skin is sensitive, but each pull lasts a second and the area is done in a few minutes. The first time is the most intense.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('No te afeites antes', 'Do not shave beforehand'),
        body: l(
          'Si el vello está muy corto, la cera no lo agarra y hay que repasar. Deja crecer unas dos o tres semanas, hasta 5 mm o 1 cm.',
          'If the hair is too short the wax cannot grip it and the area needs a second pass. Let it grow for two or three weeks, to 5 mm or 1 cm.',
        ),
      },
      {
        icon: 'event_available',
        title: l('Elige bien el día', 'Pick the right day'),
        body: l(
          'La piel está más sensible en los días previos a la menstruación. Si puedes, agenda la semana siguiente.',
          'Skin is more sensitive in the days before your period. If you can, book the week after.',
        ),
      },
      {
        icon: 'repeat',
        title: l('La constancia ayuda', 'Consistency helps'),
        body: l(
          'Depilando cada tres o cuatro semanas el vello sale más fino y escaso, y cada sesión molesta menos que la anterior.',
          'Waxing every three or four weeks makes the hair grow back finer and sparser, and each session is easier than the last.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de axila', 'What happens in your underarm session'),
    intro: l(
      'Son 20 minutos en cabina privada, con materiales de un solo uso.',
      'It takes 20 minutes in a private cabin, with single-use materials.',
    ),
    steps: [
      {
        title: l('Limpieza y secado', 'Cleanse and dry'),
        body: l(
          'Retiramos desodorante y sudor, y secamos bien la piel: la cera no se adhiere sobre humedad ni residuos.',
          'We remove deodorant and sweat and dry the skin well, because wax will not stick over moisture or residue.',
        ),
      },
      {
        title: l('Lectura del vello', 'Reading the hair growth'),
        body: l(
          'La cosmetóloga revisa hacia dónde crece el vello en cada parte de la axila, que casi nunca es en una sola dirección.',
          'The cosmetologist checks which way the hair grows in each part of the underarm, which is almost never one direction.',
        ),
      },
      {
        title: l('Cera por secciones', 'Wax in sections'),
        body: l(
          'Aplicamos la cera en dos o tres zonas pequeñas y retiramos en contra del crecimiento, sosteniendo la piel tensa para que duela menos.',
          'We apply wax to two or three small sections and pull against the growth, holding the skin taut so it hurts less.',
        ),
      },
      {
        title: l('Repaso y calma', 'Tidy-up and soothe'),
        body: l(
          'Retiramos con pinza los vellos sueltos y aplicamos un producto calmante para bajar la rojez.',
          'We tweeze any stray hairs and apply a soothing product to bring the redness down.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Tu vello mide entre 5 mm y 1 cm',
        'Te cansaste del sombreado y la irritación de la cuchilla',
        'Quieres un resultado que dure semanas, no días',
        'Tienes un viaje, la piscina o un evento en los próximos días',
      ],
      [
        'Your hair is between 5 mm and 1 cm long',
        'You are tired of razor shadow and irritation',
        'You want a result that lasts weeks, not days',
        'You have a trip, the pool or an event in the next few days',
      ],
    ),
    wait: list(
      [
        'Tienes heridas, irritación o granitos en la axila',
        'Usas retinoides o isotretinoína (la piel se puede levantar)',
        'Te hiciste láser, peeling o quemadura solar en la zona hace poco',
        'Te afeitaste hace menos de dos semanas',
      ],
      [
        'You have cuts, irritation or bumps in the underarm',
        'You use retinoids or isotretinoin (the skin can lift)',
        'You had laser, a peel or a sunburn on the area recently',
        'You shaved less than two weeks ago',
      ],
    ),
    note: l(
      'Si tu piel se irrita con facilidad, la máquina es una alternativa más suave para la axila.',
      'If your skin gets irritated easily, the machine is a gentler option for the underarm.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Deja crecer el vello dos o tres semanas',
        'Ven sin desodorante, o lo retiramos al empezar',
        'No exfolies la zona el mismo día',
        'Usa una camiseta suelta para después',
      ],
      [
        'Let the hair grow for two or three weeks',
        'Come without deodorant, or we remove it first',
        'Do not exfoliate the area on the day',
        'Wear a loose top for afterwards',
      ],
    ),
    after: list(
      [
        'Evita desodorante con alcohol o perfume por 24 horas',
        'No vayas al gimnasio ese día: el sudor irrita el folículo abierto',
        'Evita sol, piscina y sauna por 24–48 horas',
        'Desde el tercer día, exfolia suave dos veces por semana para evitar vellos encarnados',
      ],
      [
        'Skip deodorant with alcohol or fragrance for 24 hours',
        'No gym that day: sweat irritates the open follicle',
        'Avoid sun, pool and sauna for 24–48 hours',
        'From the third day, exfoliate gently twice a week to prevent ingrown hairs',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Puedo usar desodorante después de depilarme las axilas?', 'Can I use deodorant after underarm waxing?'),
      answer: l(
        'Espera unas 24 horas. Justo después el folículo está abierto y el alcohol o el perfume del desodorante pueden arder y causar granitos. Si lo necesitas, usa uno sin alcohol ni fragancia.',
        'Wait about 24 hours. Right after waxing the follicle is open, and the alcohol or fragrance in deodorant can sting and cause bumps. If you need one, use an alcohol-free, unscented deodorant.',
      ),
    },
    {
      question: l('¿Por qué me salen granitos en la axila después de la cera?', 'Why do I get bumps in my underarm after waxing?'),
      answer: l(
        'Es la reacción del folículo al retirar el vello y suele bajar en uno o dos días. Aparecen más si sudas, haces ejercicio o usas desodorante justo después. Si duran más de una semana o duelen, escríbenos.',
        'It is the follicle reacting to the hair being removed and usually settles in a day or two. They show up more if you sweat, exercise or use deodorant right after. If they last more than a week or hurt, message us.',
      ),
    },
    {
      question: l('¿La cera deja la axila más oscura?', 'Does waxing darken the underarm?'),
      answer: l(
        'No. El oscurecimiento suele venir de la irritación repetida de la cuchilla o del roce, y de la sombra del vello cortado bajo la piel. Al sacar el vello desde la raíz, esa sombra desaparece.',
        'No. Darkening usually comes from repeated razor irritation or friction, and from the shadow of cut hair under the skin. Removing the hair from the root gets rid of that shadow.',
      ),
    },
    {
      question: l('¿Puedo depilarme la axila si me afeité hace poco?', 'Can I get waxed if I shaved recently?'),
      answer: l(
        'Si te afeitaste hace menos de dos semanas, el vello todavía está muy corto para la cera. Espera a que mida al menos 5 mm o reserva con máquina.',
        'If you shaved less than two weeks ago, the hair is still too short for wax. Wait until it is at least 5 mm long, or book the machine.',
      ),
    },
  ],
}

const CHEST: ServiceContent = {
  durationMin: 30,
  h1: l('Depilación de pecho en Medellín', 'Chest waxing in Medellín'),
  whatIs: {
    title: l('Depilación de pecho para hombres y mujeres', 'Chest waxing for men and women'),
    body: list(
      [
        'Depilamos el pecho completo o solo la zona que quieras: centro, pectorales, alrededor de los pezones o hasta el abdomen. Antes de empezar defines con la cosmetóloga el acabado, para que el resultado se vea natural y no quede una línea marcada donde termina la cera.',
        'Es una buena opción si entrenas, nadas o tienes un viaje o evento, o si te cansaste de la picazón del vello que vuelve a crecer tras afeitarte. El turno es de 30 minutos y, con cera, el pecho queda liso de tres a cuatro semanas.',
      ],
      [
        'We wax the full chest or only the part you want: the centre, the pecs, around the nipples or down to the stomach. Before starting you agree the finish with the cosmetologist, so the result looks natural and there is no hard line where the wax stops.',
        'It is a good option if you train, swim or have a trip or event coming up, or if you are tired of the itch of regrowth after shaving. The slot is 30 minutes and, with wax, the chest stays smooth for three to four weeks.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('30 minutos', '30 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Moderado la primera vez', 'Moderate the first time') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele depilarse el pecho? Qué esperar', 'Does chest waxing hurt? What to expect'),
    items: [
      {
        icon: 'looks_one',
        title: l('La primera sesión es la más fuerte', 'The first session is the hardest'),
        body: l(
          'Si nunca te has depilado, el vello es grueso y está muy anclado. Desde la segunda sesión sale más fino y molesta bastante menos.',
          'If you have never waxed, the hair is coarse and deeply rooted. From the second session it comes back finer and is much easier.',
        ),
      },
      {
        icon: 'my_location',
        title: l('El centro y los pezones, lo más sensible', 'Centre and nipples are most sensitive'),
        body: l(
          'El esternón y la zona alrededor de los pezones molestan más; los pectorales y el abdomen mucho menos. Ahí trabajamos en secciones pequeñas.',
          'The breastbone and the area around the nipples are the most sensitive; the pecs and stomach much less. We work those in small sections.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('Si el vello es largo, lo recortamos', 'Long hair gets trimmed first'),
        body: l(
          'Si el vello pasa de 1 cm lo recortamos antes de la cera: el tirón es más limpio y duele menos.',
          'If the hair is longer than 1 cm we trim it before waxing, so the pull is cleaner and hurts less.',
        ),
      },
      {
        icon: 'air',
        title: l('Respira con cada tirón', 'Breathe out on each pull'),
        body: l(
          'Soltar el aire en el momento del tirón y mantener la piel tensa reduce mucho la sensación. La cosmetóloga te avisa antes de cada uno.',
          'Breathing out at the moment of the pull and keeping the skin taut makes a big difference. The cosmetologist warns you before each one.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de pecho', 'What happens in your chest session'),
    intro: l(
      'Son 30 minutos en cabina privada. Puedes pedir que paremos un momento cuando quieras.',
      'It takes 30 minutes in a private cabin. You can ask us to pause at any time.',
    ),
    steps: [
      {
        title: l('Definir el acabado', 'Agree the finish'),
        body: l(
          'Acordamos qué zona depilar y hasta dónde, y si quieres un resultado completamente liso o solo reducir el vello del centro.',
          'We agree which area to wax and where to stop, and whether you want a completely smooth result or just to clear the centre.',
        ),
      },
      {
        title: l('Recorte y limpieza', 'Trim and cleanse'),
        body: l(
          'Recortamos el vello si está muy largo y limpiamos la piel para retirar cremas, sudor y grasa, que impiden que la cera agarre.',
          'We trim the hair if it is too long and cleanse the skin to remove creams, sweat and oil, which stop the wax from gripping.',
        ),
      },
      {
        title: l('Cera por zonas', 'Wax area by area'),
        body: l(
          'Empezamos por los pectorales, que son menos sensibles, y dejamos el centro y los pezones para el final, en secciones pequeñas.',
          'We start with the pecs, which are less sensitive, and leave the centre and nipples for last, in small sections.',
        ),
      },
      {
        title: l('Pinza y calmante', 'Tweeze and soothe'),
        body: l(
          'Retiramos los vellos sueltos con pinza y aplicamos un calmante. Es normal ver puntitos rojos durante unas horas.',
          'We tweeze stray hairs and apply a soothing product. Small red dots for a few hours are normal.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Entrenas, nadas o quieres que se note la definición del pecho',
        'Te pica el vello cuando vuelve a crecer después de afeitarte',
        'Tienes un viaje, una sesión de fotos o un evento',
        'Tu vello mide entre 5 mm y 1 cm',
      ],
      [
        'You train, swim or want your chest definition to show',
        'Regrowth itches after shaving',
        'You have a trip, a photo shoot or an event',
        'Your hair is between 5 mm and 1 cm long',
      ],
    ),
    wait: list(
      [
        'Tienes quemadura solar en el pecho',
        'Tienes acné, heridas o irritación en la zona',
        'Usas retinoides o isotretinoína',
        'Tomas anticoagulantes (consúltanos antes de reservar)',
      ],
      [
        'You have a sunburn on your chest',
        'You have acne, cuts or irritation on the area',
        'You use retinoids or isotretinoin',
        'You take blood thinners (ask us before booking)',
      ],
    ),
    note: l(
      'Si es tu primera vez y te preocupa el dolor, la máquina es más suave; también puedes empezar con cera solo en el centro.',
      'If it is your first time and you are worried about pain, the machine is gentler, or you can start with wax on the centre only.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'No te afeites en las dos o tres semanas previas',
        'No apliques cremas ni aceites en el pecho ese día',
        'Evita el sol directo en la zona los días anteriores',
        'Trae una camiseta de algodón suelta',
      ],
      [
        'Do not shave in the two or three weeks before',
        'Do not put creams or oils on your chest that day',
        'Avoid direct sun on the area in the days before',
        'Bring a loose cotton T-shirt',
      ],
    ),
    after: list(
      [
        'No entrenes ese día: el sudor y el roce causan granitos',
        'Evita sol, piscina y sauna por 24–48 horas',
        'Usa ropa suelta de algodón',
        'Desde el tercer día, exfolia suave dos o tres veces por semana',
        'Hidrata con una crema sin perfume',
      ],
      [
        'Do not train that day: sweat and friction cause bumps',
        'Avoid sun, pool and sauna for 24–48 hours',
        'Wear loose cotton clothing',
        'From the third day, exfoliate gently two or three times a week',
        'Moisturise with an unscented cream',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Es mejor afeitarse o depilarse el pecho con cera?', 'Is it better to shave or wax the chest?'),
      answer: l(
        'Afeitarse es rápido, pero el vello vuelve en uno o dos días con punta dura que pica y deja sombra. La cera lo saca desde la raíz: el pecho queda liso tres o cuatro semanas y, con sesiones regulares, el vello sale más fino.',
        'Shaving is quick, but the hair comes back in a day or two with a blunt tip that itches and leaves a shadow. Wax pulls it from the root: the chest stays smooth for three or four weeks and, with regular sessions, the hair grows back finer.',
      ),
    },
    {
      question: l('¿Pueden depilar el pecho y el abdomen en la misma cita?', 'Can you wax the chest and stomach in the same appointment?'),
      answer: l(
        'Sí. Dinos al reservar o al llegar hasta dónde quieres depilar; si es una zona grande, te confirmamos el tiempo y el precio antes de empezar.',
        'Yes. Tell us when you book or when you arrive how far down you want to go; for a large area we confirm the time and price before starting.',
      ),
    },
    {
      question: l('¿Puedo ir al gimnasio después de depilarme el pecho?', 'Can I go to the gym after chest waxing?'),
      answer: l(
        'Mejor espera 24 horas. El sudor y el roce de la camiseta sobre los folículos abiertos son la causa principal de granitos e irritación después de la cera.',
        'Better wait 24 hours. Sweat and the friction of a T-shirt on open follicles are the main cause of bumps and irritation after waxing.',
      ),
    },
    {
      question: l('¿Cuánto tarda en volver a salir el vello del pecho?', 'How long until chest hair grows back?'),
      answer: l(
        'Con cera empieza a notarse a las tres o cuatro semanas. Con máquina el vello vuelve antes, pero la sesión es más suave y económica.',
        'With wax it starts to show again after three or four weeks. With the machine it comes back sooner, but the session is gentler and cheaper.',
      ),
    },
  ],
  hub: {
    path: '/depilacion-hombres',
    anchor: l('Depilación masculina en Medellín: todas las zonas', 'Waxing for men in Medellín: all areas'),
  },
}

const FULL_LEG: ServiceContent = {
  durationMin: 45,
  h1: l('Depilación de pierna completa en Medellín', 'Full leg waxing in Medellín'),
  whatIs: {
    title: l('Depilación de pierna completa: del tobillo a la ingle', 'Full leg waxing: ankle to groin'),
    body: list(
      [
        'Incluye ambas piernas completas: pies y dedos, tobillo, pantorrilla, rodilla y muslo por delante y por detrás, hasta el límite de la ingle. Si también quieres la zona del bikini, se reserva como servicio aparte y se puede hacer en la misma cita.',
        'Es una zona grande, así que el turno es de 45 minutos. La piel de las piernas tolera bien la cera, por eso es de las depilaciones menos dolorosas, y el resultado dura de tres a cuatro semanas. Si solo necesitas de la rodilla para abajo, la media pierna es más rápida y económica.',
      ],
      [
        'It covers both legs in full: feet and toes, ankle, calf, knee and thigh front and back, up to the edge of the groin. If you also want the bikini area, it is booked as a separate service and can be done in the same appointment.',
        'It is a large area, so the slot is 45 minutes. Leg skin tolerates wax well, which makes it one of the least painful areas, and the result lasts three to four weeks. If you only need knee down, the half leg is quicker and cheaper.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('45 minutos', '45 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Bajo, algo más en el muslo interno', 'Low, a bit more on the inner thigh') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele la depilación de piernas? Zona por zona', 'Does leg waxing hurt? Area by area'),
    items: [
      {
        icon: 'directions_walk',
        title: l('Pantorrilla y muslo externo', 'Calf and outer thigh'),
        body: l(
          'Son las zonas más tolerables: piel firme y vello que sale con facilidad. La mayoría de personas las describe como una molestia leve.',
          'These are the easiest areas: firm skin and hair that comes out easily. Most people describe them as a mild discomfort.',
        ),
      },
      {
        icon: 'my_location',
        title: l('Rodilla, tobillo y muslo interno', 'Knee, ankle and inner thigh'),
        body: l(
          'La piel es más fina o se mueve más, así que ahí trabajamos en tiras pequeñas y con la pierna en la posición que tense la piel.',
          'The skin is thinner or moves more, so we work in small strips there, with the leg positioned to keep the skin taut.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('No llegues afeitada', 'Do not arrive shaved'),
        body: l(
          'Con vello de 5 mm a 1 cm la cera lo saca en una pasada. Si está más corto hay que repasar, y eso es lo que más irrita.',
          'With hair between 5 mm and 1 cm the wax takes it in one pass. If it is shorter we have to go over it again, and that is what irritates most.',
        ),
      },
      {
        icon: 'repeat',
        title: l('Cada sesión es más fácil', 'Each session gets easier'),
        body: l(
          'Con citas cada tres o cuatro semanas el vello vuelve más fino y escaso, y la sesión es más rápida y cómoda.',
          'With appointments every three or four weeks the hair comes back finer and sparser, and the session is quicker and more comfortable.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de pierna completa', 'What happens in your full leg session'),
    intro: l(
      'Son 45 minutos en cabina privada. Trabajamos una pierna completa y luego la otra, por delante y por detrás.',
      'It takes 45 minutes in a private cabin. We do one whole leg and then the other, front and back.',
    ),
    steps: [
      {
        title: l('Limpieza', 'Cleanse'),
        body: l(
          'Limpiamos las piernas para retirar cremas y sudor, y revisamos que no haya heridas, várices marcadas o irritación.',
          'We cleanse the legs to remove creams and sweat, and check for cuts, prominent varicose veins or irritation.',
        ),
      },
      {
        title: l('Parte delantera', 'Front of the legs'),
        body: l(
          'Empezamos boca arriba: empeine, tobillo, espinilla, rodilla y muslo, en tiras que siguen la dirección del vello.',
          'We start face up: top of the foot, ankle, shin, knee and thigh, in strips that follow the direction of the hair.',
        ),
      },
      {
        title: l('Parte trasera', 'Back of the legs'),
        body: l(
          'Te giras y seguimos con pantorrilla, corva y parte trasera del muslo, donde el vello suele crecer en direcciones distintas.',
          'You turn over and we continue with the calf, back of the knee and back of the thigh, where hair often grows in different directions.',
        ),
      },
      {
        title: l('Repaso y calmante', 'Tidy-up and soothe'),
        body: l(
          'Revisamos con buena luz, retiramos con pinza los vellos sueltos y aplicamos un producto calmante en toda la pierna.',
          'We check under good light, tweeze any stray hairs and apply a soothing product over the whole leg.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Quieres las piernas lisas por semanas para un viaje o la playa',
        'Te salen puntos rojos o vellos encarnados al afeitarte',
        'Tu vello mide entre 5 mm y 1 cm',
        'Quieres combinarla con bikini o axila en una sola cita',
      ],
      [
        'You want smooth legs for weeks for a trip or the beach',
        'Shaving gives you red dots or ingrown hairs',
        'Your hair is between 5 mm and 1 cm long',
        'You want to combine it with bikini or underarm in one visit',
      ],
    ),
    wait: list(
      [
        'Tienes várices marcadas o flebitis (consúltalo con tu médico; la máquina puede ser opción)',
        'Tienes quemadura solar, heridas o raspones en las piernas',
        'Usas retinoides o isotretinoína',
        'Tienes diabetes o mala circulación (avísanos antes)',
      ],
      [
        'You have prominent varicose veins or phlebitis (check with your doctor; the machine may be an option)',
        'You have a sunburn, cuts or grazes on your legs',
        'You use retinoids or isotretinoin',
        'You have diabetes or poor circulation (tell us beforehand)',
      ],
    ),
    note: l(
      'Si solo necesitas de la rodilla para abajo, reserva media pierna: es más rápida y económica.',
      'If you only need knee down, book the half leg: it is quicker and cheaper.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Deja de afeitarte dos o tres semanas antes',
        'Exfolia suave dos días antes (no el mismo día)',
        'No te apliques crema ni aceite el día de la cita',
        'Ven con ropa suelta, mejor falda o pantalón ancho',
      ],
      [
        'Stop shaving two or three weeks before',
        'Exfoliate gently two days before (not on the day)',
        'Do not apply cream or oil on the day of your appointment',
        'Wear loose clothes, ideally a skirt or wide trousers',
      ],
    ),
    after: list(
      [
        'Evita jeans y leggings ajustados ese día',
        'No hagas ejercicio intenso, piscina ni sauna por 24 horas',
        'Protege las piernas del sol 48 horas',
        'Hidrata a diario y exfolia dos veces por semana desde el tercer día',
      ],
      [
        'Avoid tight jeans and leggings that day',
        'No intense exercise, pool or sauna for 24 hours',
        'Keep your legs out of the sun for 48 hours',
        'Moisturise daily and exfoliate twice a week from the third day',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Qué incluye la depilación de pierna completa?', 'What does a full leg wax include?'),
      answer: l(
        'Ambas piernas desde los pies hasta el límite de la ingle, por delante y por detrás, incluyendo rodillas, empeine y dedos. La zona del bikini no está incluida y se reserva aparte.',
        'Both legs from the feet up to the edge of the groin, front and back, including knees, tops of the feet and toes. The bikini area is not included and is booked separately.',
      ),
    },
    {
      question: l('¿Qué diferencia hay entre media pierna y pierna completa?', 'What is the difference between half leg and full leg?'),
      answer: l(
        'La media pierna cubre de la rodilla al tobillo o de la rodilla a la parte alta del muslo, en 30 minutos. La pierna completa cubre todo, del tobillo a la ingle, en 45 minutos.',
        'The half leg covers knee to ankle or knee to upper thigh, in 30 minutes. The full leg covers everything, ankle to groin, in 45 minutes.',
      ),
    },
    {
      question: l('¿Puedo hacerme la pierna completa y el bikini el mismo día?', 'Can I get full leg and bikini on the same day?'),
      answer: l(
        'Sí. Reserva los dos servicios en la misma cita y cuenta con unos 75 minutos en total.',
        'Yes. Book both services in the same appointment and allow about 75 minutes in total.',
      ),
    },
    {
      question: l('¿Puedo ir a la playa o la piscina después de la depilación?', 'Can I go to the beach or pool after waxing?'),
      answer: l(
        'Mejor depílate dos o tres días antes del viaje. Las primeras 24–48 horas la piel está sensible al sol y al cloro, y es cuando más se irrita.',
        'It is best to wax two or three days before your trip. For the first 24–48 hours the skin is sensitive to sun and chlorine, and that is when it gets irritated most.',
      ),
    },
  ],
}

const BIKINI: ServiceContent = {
  durationMin: 30,
  h1: l('Depilación de bikini en Medellín', 'Bikini waxing in Medellín'),
  whatIs: {
    title: l('Depilación de bikini: tú eliges el acabado', 'Bikini waxing: you choose the finish'),
    body: list(
      [
        'Con el mismo servicio hacemos desde el bikini clásico, que solo retira el vello que se ve fuera del vestido de baño, hasta la depilación brasileña completa, de adelante hacia atrás, dejando la zona libre o con una franja. Antes de empezar lo hablas con la cosmetóloga, sin prisa y en cabina privada.',
        'El turno es de 30 minutos y, con cera, el resultado dura de tres a cuatro semanas. Es una zona delicada, por eso usamos materiales de un solo uso y nunca devolvemos una espátula al recipiente de cera.',
      ],
      [
        'The same service covers anything from a classic bikini line, which only removes the hair that shows outside a swimsuit, to a full Brazilian, front to back, leaving the area bare or with a strip. You talk it through with the cosmetologist before starting, unhurried and in a private cabin.',
        'The slot is 30 minutes and, with wax, the result lasts three to four weeks. It is a delicate area, so we use single-use materials and never put a spatula back in the wax pot.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('30 minutos', '30 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Medio a alto, baja con la constancia', 'Medium to high, eases with regular visits') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele la depilación de bikini? Cómo hacer que duela menos', 'Does bikini waxing hurt? How to make it hurt less'),
    items: [
      {
        icon: 'looks_one',
        title: l('La primera vez es la más intensa', 'The first time is the most intense'),
        body: l(
          'Es una de las zonas más sensibles. Desde la segunda o tercera sesión el vello sale más fino y la molestia baja bastante.',
          'It is one of the most sensitive areas. From the second or third session the hair comes back finer and it gets much easier.',
        ),
      },
      {
        icon: 'event_available',
        title: l('Evita los días antes del periodo', 'Avoid the days before your period'),
        body: l(
          'La sensibilidad aumenta justo antes y durante la menstruación. Si puedes, agenda la semana después.',
          'Sensitivity goes up just before and during your period. If you can, book the week after.',
        ),
      },
      {
        icon: 'local_cafe',
        title: l('Sin cafeína ni alcohol antes', 'No caffeine or alcohol beforehand'),
        body: l(
          'Ambos aumentan la sensibilidad de la piel. Llega hidratada y tranquila, y respira hondo en cada tirón.',
          'Both make the skin more sensitive. Arrive hydrated and relaxed, and breathe out on each pull.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('El vello en su punto', 'Hair at the right length'),
        body: l(
          'Entre 5 mm y 1 cm. Si está más largo lo recortamos antes; si está muy corto la cera no agarra y hay que repasar.',
          'Between 5 mm and 1 cm. If it is longer we trim it first; if it is too short the wax cannot grip and needs a second pass.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de bikini', 'What happens in your bikini session'),
    intro: l(
      'Son 30 minutos en cabina privada, con materiales de un solo uso. Puedes pedir una pausa cuando quieras.',
      'It takes 30 minutes in a private cabin, with single-use materials. You can ask for a pause at any time.',
    ),
    steps: [
      {
        title: l('Elegir el acabado', 'Choose the finish'),
        body: l(
          'Defines si quieres bikini clásico, completo o brasileño, y si prefieres dejar una franja.',
          'You decide between a classic line, full bikini or Brazilian, and whether you want to keep a strip.',
        ),
      },
      {
        title: l('Recorte y limpieza', 'Trim and cleanse'),
        body: l(
          'Recortamos el vello si está largo y limpiamos la zona.',
          'We trim the hair if it is long and cleanse the area.',
        ),
      },
      {
        title: l('Cera en secciones pequeñas', 'Wax in small sections'),
        body: l(
          'Trabajamos de afuera hacia adentro en tiras pequeñas, sosteniendo la piel tensa para que el tirón sea limpio.',
          'We work from the outside in, in small strips, holding the skin taut so each pull is clean.',
        ),
      },
      {
        title: l('Pinza y calmante', 'Tweeze and soothe'),
        body: l(
          'Retiramos los vellos sueltos con pinza y aplicamos un producto calmante.',
          'We tweeze stray hairs and apply a soothing product.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Vas a la playa, la piscina o de viaje en los próximos días',
        'Te salen vellos encarnados o irritación con la cuchilla',
        'Tu vello mide entre 5 mm y 1 cm',
        'Estás fuera de los días de menstruación',
      ],
      [
        'You are going to the beach, the pool or travelling soon',
        'Razors give you ingrown hairs or irritation',
        'Your hair is between 5 mm and 1 cm long',
        'You are not on your period',
      ],
    ),
    wait: list(
      [
        'Tienes una infección, herpes o lesiones activas en la zona',
        'Estás embarazada (se puede, pero avísanos: la piel está más sensible)',
        'Usas retinoides o isotretinoína',
        'Tuviste láser o quemadura solar reciente en la zona',
      ],
      [
        'You have an infection, herpes or active lesions in the area',
        'You are pregnant (it is possible, but tell us: the skin is more sensitive)',
        'You use retinoids or isotretinoin',
        'You had laser or a sunburn on the area recently',
      ],
    ),
    note: l(
      'Si tu piel es muy sensible o es tu primera vez, puedes empezar con bikini clásico o con máquina, que es más suave.',
      'If your skin is very sensitive or it is your first time, you can start with a classic line or the machine, which is gentler.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Deja crecer el vello dos o tres semanas',
        'Ducha normal antes de la cita, sin cremas ni aceites en la zona',
        'Evita cafeína y alcohol unas horas antes',
        'Si estás menstruando, puedes venir con tampón o copa, o reprogramar',
      ],
      [
        'Let the hair grow for two or three weeks',
        'Shower as usual before the appointment, no creams or oils on the area',
        'Avoid caffeine and alcohol for a few hours before',
        'If you are on your period you can come with a tampon or cup, or reschedule',
      ],
    ),
    after: list(
      [
        'Usa ropa interior de algodón y ropa suelta',
        'Evita relaciones sexuales, gimnasio, piscina y sauna por 24 horas',
        'No te expongas al sol en la zona por 48 horas',
        'Desde el tercer día, exfolia suave dos o tres veces por semana para evitar vellos encarnados',
      ],
      [
        'Wear cotton underwear and loose clothes',
        'Avoid sex, the gym, pool and sauna for 24 hours',
        'Keep the area out of the sun for 48 hours',
        'From the third day, exfoliate gently two or three times a week to prevent ingrown hairs',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Qué diferencia hay entre bikini clásico, completo y brasileño?', 'What is the difference between a classic, full and Brazilian bikini wax?'),
      answer: l(
        'El clásico retira solo el vello que se ve fuera del vestido de baño. El completo llega más adentro por delante. El brasileño retira todo el vello de la zona íntima, de adelante hacia atrás, dejando la zona libre o con una franja. Todos se reservan como bikini y eliges el acabado en la cabina.',
        'A classic line removes only the hair that shows outside a swimsuit. A full bikini goes further in at the front. A Brazilian removes all the hair in the intimate area, front to back, leaving it bare or with a strip. All are booked as bikini and you choose the finish in the cabin.',
      ),
    },
    {
      question: l('¿Puedo depilarme el bikini con la menstruación?', 'Can I get a bikini wax on my period?'),
      answer: l(
        'Sí, con tampón o copa menstrual, aunque esos días la piel está más sensible y molesta más. Si puedes elegir, agenda la semana después del periodo.',
        'Yes, with a tampon or menstrual cup, although your skin is more sensitive on those days and it hurts more. If you can choose, book the week after your period.',
      ),
    },
    {
      question: l('¿Quién hace la depilación de bikini?', 'Who does the bikini wax?'),
      answer: l(
        'Una cosmetóloga certificada, en cabina privada con la puerta cerrada. Te explicamos cada paso y puedes pedir una pausa cuando quieras.',
        'A certified cosmetologist, in a private cabin with the door closed. We explain each step and you can ask for a pause at any time.',
      ),
    },
    {
      question: l('¿Cómo evito los vellos encarnados en el bikini?', 'How do I avoid ingrown hairs in the bikini area?'),
      answer: l(
        'Es la zona donde más aparecen por el roce de la ropa. Usa ropa interior de algodón, exfolia suave dos o tres veces por semana desde el tercer día, hidrata a diario y mantén las citas cada tres o cuatro semanas.',
        'It is the area where they appear most, because of friction from clothing. Wear cotton underwear, exfoliate gently two or three times a week from the third day, moisturise daily and keep appointments every three or four weeks.',
      ),
    },
  ],
  hub: {
    path: '/depilacion-mujeres',
    anchor: l('Depilación para mujeres en Medellín: todas las zonas', 'Waxing for women in Medellín: all areas'),
  },
}

const HALF_LEG: ServiceContent = {
  durationMin: 30,
  h1: l('Depilación de media pierna en Medellín', 'Half leg waxing in Medellín'),
  whatIs: {
    title: l('Media pierna: de la rodilla al tobillo, o al muslo', 'Half leg: knee to ankle, or knee to thigh'),
    body: list(
      [
        'La media pierna cubre ambas piernas desde la rodilla hasta el tobillo, que es lo que más se ve con falda, short o vestido. Si lo prefieres, puede ser la mitad de arriba, de la rodilla al muslo. Incluye la rodilla.',
        'Es una de las depilaciones más tolerables y rápidas: el turno es de 30 minutos y, con cera, la piel queda lisa de tres a cuatro semanas. Si quieres todo, del tobillo a la ingle, la pierna completa toma 45 minutos.',
      ],
      [
        'The half leg covers both legs from the knee to the ankle, which is what shows most in a skirt, shorts or a dress. If you prefer, it can be the upper half, knee to thigh. The knee is included.',
        'It is one of the quickest and most tolerable waxing services: the slot is 30 minutes and, with wax, the skin stays smooth for three to four weeks. If you want everything from ankle to groin, the full leg takes 45 minutes.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('30 minutos', '30 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Bajo', 'Low') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele depilarse la media pierna?', 'Does half leg waxing hurt?'),
    items: [
      {
        icon: 'sentiment_satisfied',
        title: l('Es de lo más tolerable', 'One of the easiest areas'),
        body: l(
          'La pantorrilla y la espinilla tienen piel firme y el vello sale con facilidad. Es buena zona para empezar si nunca te has depilado con cera.',
          'The calf and shin have firm skin and the hair comes out easily. It is a good place to start if you have never waxed.',
        ),
      },
      {
        icon: 'my_location',
        title: l('Rodilla y tobillo, con cuidado', 'Knee and ankle, with care'),
        body: l(
          'Son las partes donde la piel se mueve más. Las trabajamos con la pierna flexionada o estirada para mantener la piel tensa.',
          'These are the parts where the skin moves most. We work them with the leg bent or straight to keep the skin taut.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('Deja de afeitarte antes', 'Stop shaving beforehand'),
        body: l(
          'Con dos o tres semanas de crecimiento la cera saca el vello en una sola pasada y la piel se irrita menos.',
          'With two or three weeks of growth the wax takes the hair in a single pass and the skin gets less irritated.',
        ),
      },
      {
        icon: 'repeat',
        title: l('Menos vello con el tiempo', 'Less hair over time'),
        body: l(
          'Con sesiones regulares el vello vuelve más fino y escaso, y te puedes olvidar de la cuchilla.',
          'With regular sessions the hair comes back finer and sparser, and you can forget about the razor.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de media pierna', 'What happens in your half leg session'),
    intro: l(
      'Son 30 minutos en cabina privada.',
      'It takes 30 minutes in a private cabin.',
    ),
    steps: [
      {
        title: l('Limpieza', 'Cleanse'),
        body: l(
          'Limpiamos la piel para retirar cremas y sudor, y revisamos que no haya heridas ni irritación.',
          'We cleanse the skin to remove creams and sweat, and check for cuts or irritation.',
        ),
      },
      {
        title: l('Parte delantera', 'Front'),
        body: l(
          'Empeine, tobillo, espinilla y rodilla, en tiras que siguen la dirección del vello.',
          'Top of the foot, ankle, shin and knee, in strips that follow the direction of the hair.',
        ),
      },
      {
        title: l('Parte trasera', 'Back'),
        body: l(
          'Te giras y seguimos con la pantorrilla y la parte de atrás de la rodilla.',
          'You turn over and we continue with the calf and the back of the knee.',
        ),
      },
      {
        title: l('Repaso y calmante', 'Tidy-up and soothe'),
        body: l(
          'Retiramos con pinza los vellos sueltos y aplicamos un producto calmante.',
          'We tweeze stray hairs and apply a soothing product.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Usas falda, short o vestido y solo necesitas de la rodilla para abajo',
        'Es tu primera depilación con cera',
        'Quieres algo rápido antes de un evento',
        'Tu vello mide entre 5 mm y 1 cm',
      ],
      [
        'You wear skirts, shorts or dresses and only need knee down',
        'It is your first time waxing',
        'You want something quick before an event',
        'Your hair is between 5 mm and 1 cm long',
      ],
    ),
    wait: list(
      [
        'Tienes várices marcadas en la pantorrilla (consúltalo; la máquina puede ser opción)',
        'Tienes quemadura solar, heridas o raspones',
        'Usas retinoides o isotretinoína',
        'Tienes diabetes o mala circulación (avísanos antes)',
      ],
      [
        'You have prominent varicose veins on the calf (ask first; the machine may be an option)',
        'You have a sunburn, cuts or grazes',
        'You use retinoids or isotretinoin',
        'You have diabetes or poor circulation (tell us beforehand)',
      ],
    ),
    note: l(
      'Si también quieres el muslo, reserva pierna completa: sale mejor que sumar dos medias piernas.',
      'If you also want the thigh, book the full leg: it works out better than adding two half legs.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Deja de afeitarte dos o tres semanas antes',
        'Exfolia suave dos días antes',
        'No te apliques crema ni aceite el día de la cita',
        'Ven con falda, short o pantalón ancho',
      ],
      [
        'Stop shaving two or three weeks before',
        'Exfoliate gently two days before',
        'Do not apply cream or oil on the day of your appointment',
        'Wear a skirt, shorts or wide trousers',
      ],
    ),
    after: list(
      [
        'Evita pantalones ajustados ese día',
        'Sin ejercicio intenso, piscina ni sauna por 24 horas',
        'Protege la piel del sol 48 horas',
        'Hidrata a diario y exfolia dos veces por semana desde el tercer día',
      ],
      [
        'Avoid tight trousers that day',
        'No intense exercise, pool or sauna for 24 hours',
        'Keep the skin out of the sun for 48 hours',
        'Moisturise daily and exfoliate twice a week from the third day',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿La media pierna incluye la rodilla?', 'Does the half leg include the knee?'),
      answer: l(
        'Sí. Cubre de la rodilla al tobillo, incluyendo la rodilla y el empeine. Si prefieres la mitad de arriba, de la rodilla al muslo, avísanos al llegar.',
        'Yes. It covers knee to ankle, including the knee and the top of the foot. If you prefer the upper half, knee to thigh, let us know when you arrive.',
      ),
    },
    {
      question: l('¿Media pierna o pierna completa?', 'Half leg or full leg?'),
      answer: l(
        'Si solo se te ven las piernas de la rodilla para abajo, la media pierna es suficiente y tarda 30 minutos. Para playa, piscina o short corto, la pierna completa cubre del tobillo a la ingle en 45 minutos.',
        'If only your lower legs show, the half leg is enough and takes 30 minutes. For the beach, the pool or short shorts, the full leg covers ankle to groin in 45 minutes.',
      ),
    },
    {
      question: l('¿Es buena zona para mi primera depilación con cera?', 'Is it a good area for my first wax?'),
      answer: l(
        'Sí, es de las más tolerables. Te sirve para conocer la sensación de la cera antes de pasar a zonas más sensibles como axila o bikini.',
        'Yes, it is one of the most tolerable. It lets you get used to how wax feels before moving on to more sensitive areas like the underarm or bikini.',
      ),
    },
  ],
}

const BACK: ServiceContent = {
  durationMin: 30,
  h1: l('Depilación de espalda en Medellín', 'Back waxing in Medellín'),
  whatIs: {
    title: l('Depilación de espalda completa', 'Full back waxing'),
    body: list(
      [
        'Depilamos la espalda completa, desde la nuca y los hombros hasta la zona lumbar, una zona que es imposible dejar pareja por tu cuenta con cuchilla. La cosmetóloga trabaja por secciones para que el resultado quede uniforme, sin parches.',
        'La espalda es de las zonas menos sensibles, así que es de las más tolerables aunque el área sea grande. El turno es de 30 minutos y, con cera, el resultado dura de tres a cuatro semanas.',
      ],
      [
        'We wax the whole back, from the nape and shoulders down to the lower back, an area that is impossible to get even on your own with a razor. The cosmetologist works in sections so the result is uniform, with no patches.',
        'The back is one of the least sensitive areas, so it is among the most tolerable even though it is large. The slot is 30 minutes and, with wax, the result lasts three to four weeks.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('30 minutos', '30 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Bajo a moderado', 'Low to moderate') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('¿Duele la depilación de espalda?', 'Does back waxing hurt?'),
    items: [
      {
        icon: 'sentiment_satisfied',
        title: l('Zona poco sensible', 'A low-sensitivity area'),
        body: l(
          'La piel de la espalda es gruesa, así que la mayoría la tolera bien. Los hombros y la columna molestan un poco más.',
          'Back skin is thick, so most people tolerate it well. The shoulders and spine are a little more sensitive.',
        ),
      },
      {
        icon: 'looks_one',
        title: l('La primera vez, más vello y más tirón', 'More hair and pull the first time'),
        body: l(
          'Si nunca te has depilado, la primera sesión es la más incómoda. Desde la segunda el vello sale más fino y duele bastante menos.',
          'If you have never waxed, the first session is the most uncomfortable. From the second one the hair comes back finer and hurts much less.',
        ),
      },
      {
        icon: 'content_cut',
        title: l('Recortamos si está largo', 'We trim if it is long'),
        body: l(
          'Si el vello pasa de 1 cm lo recortamos antes de la cera, para que el tirón sea más limpio.',
          'If the hair is longer than 1 cm we trim it before waxing, so each pull is cleaner.',
        ),
      },
      {
        icon: 'spa',
        title: l('Combínala con limpieza de espalda', 'Pair it with a back cleansing'),
        body: l(
          'Si tienes granitos o puntos negros en la espalda, puedes reservar también la limpieza de espalda en otra cita.',
          'If you get spots or blackheads on your back, you can also book a back cleansing on another visit.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de espalda', 'What happens in your back session'),
    intro: l(
      'Son 30 minutos en cabina privada, boca abajo en la camilla.',
      'It takes 30 minutes in a private cabin, lying face down.',
    ),
    steps: [
      {
        title: l('Definir hasta dónde', 'Agree the area'),
        body: l(
          'Acordamos si incluye hombros, nuca y zona lumbar, y cómo dejar el límite con el cuello para que se vea natural.',
          'We agree whether to include shoulders, nape and lower back, and how to finish at the neck so it looks natural.',
        ),
      },
      {
        title: l('Recorte y limpieza', 'Trim and cleanse'),
        body: l(
          'Recortamos el vello si está muy largo y limpiamos la espalda para retirar sudor y cremas.',
          'We trim the hair if it is too long and cleanse the back to remove sweat and creams.',
        ),
      },
      {
        title: l('Cera por secciones', 'Wax in sections'),
        body: l(
          'Trabajamos de abajo hacia arriba y de la columna hacia los lados, siguiendo la dirección del vello en cada zona.',
          'We work from the bottom up and from the spine outwards, following the direction of the hair in each area.',
        ),
      },
      {
        title: l('Repaso y calmante', 'Tidy-up and soothe'),
        body: l(
          'Revisamos que no queden parches, retiramos vellos sueltos con pinza y aplicamos un calmante.',
          'We check there are no patches left, tweeze stray hairs and apply a soothing product.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Tienes un viaje, playa o evento y quieres la espalda limpia',
        'No puedes afeitarte la espalda tú mismo',
        'Te molesta el vello en hombros y espalda al entrenar o nadar',
        'Tu vello mide entre 5 mm y 1 cm',
      ],
      [
        'You have a trip, the beach or an event and want a clean back',
        'You cannot shave your own back',
        'Back and shoulder hair bothers you when you train or swim',
        'Your hair is between 5 mm and 1 cm long',
      ],
    ),
    wait: list(
      [
        'Tienes quemadura solar en la espalda',
        'Tienes acné inflamado, heridas o irritación en la zona',
        'Usas retinoides o isotretinoína',
        'Tomas anticoagulantes (consúltanos antes de reservar)',
      ],
      [
        'You have a sunburn on your back',
        'You have inflamed acne, cuts or irritation on the area',
        'You use retinoids or isotretinoin',
        'You take blood thinners (ask us before booking)',
      ],
    ),
    note: l(
      'Si tienes acné activo en la espalda, mejor trátalo primero; la limpieza de espalda ayuda a descongestionar la piel.',
      'If you have active acne on your back, treat it first; a back cleansing helps decongest the skin.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'No te afeites la espalda en las dos o tres semanas previas',
        'Evita el sol en la espalda los días antes',
        'No te apliques cremas ni aceites ese día',
        'Trae una camiseta de algodón suelta',
      ],
      [
        'Do not shave your back in the two or three weeks before',
        'Avoid sun on your back in the days before',
        'Do not apply creams or oils that day',
        'Bring a loose cotton T-shirt',
      ],
    ),
    after: list(
      [
        'No entrenes ese día: el sudor y el roce de la mochila o la camiseta causan granitos',
        'Evita sol, piscina y sauna por 24–48 horas',
        'Usa ropa suelta de algodón',
        'Desde el tercer día, exfolia suave con un cepillo de mango largo',
      ],
      [
        'Do not train that day: sweat and friction from a backpack or T-shirt cause bumps',
        'Avoid sun, pool and sauna for 24–48 hours',
        'Wear loose cotton clothing',
        'From the third day, exfoliate gently with a long-handled brush',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿La depilación de espalda incluye los hombros?', 'Does back waxing include the shoulders?'),
      answer: l(
        'Sí, incluye hombros, parte alta y zona lumbar. Antes de empezar acordamos hasta dónde llegar en la nuca para que el límite se vea natural.',
        'Yes, it includes the shoulders, upper back and lower back. Before starting we agree how far up the neck to go so the edge looks natural.',
      ),
    },
    {
      question: l('¿Me puedo depilar la espalda si tengo granitos?', 'Can I wax my back if I have spots?'),
      answer: l(
        'Si son pocos y no están inflamados, sí: trabajamos alrededor. Si tienes acné inflamado o lesiones abiertas, mejor espera; la cera puede irritarlas más.',
        'If there are just a few and they are not inflamed, yes, we work around them. If you have inflamed acne or open lesions, better wait, as wax can irritate them further.',
      ),
    },
    {
      question: l('¿Cada cuánto debo depilarme la espalda?', 'How often should I wax my back?'),
      answer: l(
        'Cada tres o cuatro semanas. Si es para una fecha concreta, como un viaje o un evento, depílate dos o tres días antes para que la piel ya esté calmada.',
        'Every three or four weeks. For a specific date like a trip or an event, wax two or three days before so the skin has settled.',
      ),
    },
  ],
  hub: {
    path: '/depilacion-hombres',
    anchor: l('Depilación masculina en Medellín: todas las zonas', 'Waxing for men in Medellín: all areas'),
  },
}

const PERIANAL: ServiceContent = {
  durationMin: 30,
  h1: l('Depilación de zona perianal en Medellín', 'Perianal waxing in Medellín'),
  whatIs: {
    title: l('Depilación perianal: discreta y con higiene estricta', 'Perianal waxing: discreet, with strict hygiene'),
    body: list(
      [
        'Retiramos el vello de la zona perianal y entre los glúteos, para hombres y mujeres. Muchas personas lo piden por comodidad e higiene, porque reduce el sudor y la irritación por roce, y es una zona que no se puede depilar bien por cuenta propia.',
        'Lo hacemos en cabina privada, con la puerta cerrada y una cosmetóloga certificada. Los materiales son de un solo uso y nunca devolvemos una espátula al recipiente de cera. El turno es de 30 minutos y el resultado con cera dura de tres a cuatro semanas.',
      ],
      [
        'We remove the hair around the perianal area and between the buttocks, for men and women. Many people ask for it for comfort and hygiene, because it reduces sweat and friction irritation, and it is an area you cannot wax properly on your own.',
        'We do it in a private cabin, with the door closed and a certified cosmetologist. Materials are single-use and we never put a spatula back in the wax pot. The slot is 30 minutes and the result with wax lasts three to four weeks.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('30 minutos', '30 minutes') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Moderado, breve', 'Moderate, brief') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('Lo que preguntan antes de su primera vez', 'What people ask before their first time'),
    items: [
      {
        icon: 'lock',
        title: l('Privacidad total', 'Complete privacy'),
        body: l(
          'Cabina privada con puerta cerrada, y te cubrimos con toalla todo lo que no se está trabajando.',
          'A private cabin with the door closed, and we keep everything not being worked on covered with a towel.',
        ),
      },
      {
        icon: 'clean_hands',
        title: l('Higiene de un solo uso', 'Single-use hygiene'),
        body: l(
          'Guantes, espátulas y bandas se desechan después de cada cliente. Nunca se reutiliza cera.',
          'Gloves, spatulas and strips are thrown away after each client. Wax is never reused.',
        ),
      },
      {
        icon: 'timer',
        title: l('Molesta, pero es rápido', 'Uncomfortable, but quick'),
        body: l(
          'La piel es sensible, pero el área es pequeña y se trabaja en pocos tirones. Desde la segunda sesión molesta menos.',
          'The skin is sensitive, but the area is small and done in a few pulls. From the second session it is easier.',
        ),
      },
      {
        icon: 'sentiment_satisfied',
        title: l('Sin vergüenza', 'Nothing to be embarrassed about'),
        body: l(
          'Es un servicio de rutina para nuestras cosmetólogas. Te explicamos la posición antes y puedes pedir una pausa cuando quieras.',
          'It is a routine service for our cosmetologists. We explain the position beforehand and you can ask for a pause at any time.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión', 'What happens in your session'),
    intro: l(
      'Son 30 minutos en cabina privada, con materiales de un solo uso.',
      'It takes 30 minutes in a private cabin, with single-use materials.',
    ),
    steps: [
      {
        title: l('Explicación y posición', 'Explanation and position'),
        body: l(
          'Te explicamos cómo acomodarte en la camilla y te dejamos a solas para que te prepares.',
          'We explain how to lie on the table and leave you alone to get ready.',
        ),
      },
      {
        title: l('Limpieza', 'Cleanse'),
        body: l(
          'Limpiamos la zona con un producto suave y recortamos el vello si está muy largo.',
          'We cleanse the area with a gentle product and trim the hair if it is too long.',
        ),
      },
      {
        title: l('Cera en tiras pequeñas', 'Wax in small strips'),
        body: l(
          'Aplicamos la cera en secciones muy pequeñas, con la piel tensa, para que cada tirón sea corto y limpio.',
          'We apply wax in very small sections, with the skin held taut, so each pull is short and clean.',
        ),
      },
      {
        title: l('Calmante', 'Soothe'),
        body: l(
          'Revisamos que no queden vellos y aplicamos un producto calmante.',
          'We check no hairs are left and apply a soothing product.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Quieres más comodidad y menos sudor en la zona',
        'Te depilas el bikini o el cuerpo completo y quieres un resultado parejo',
        'Tu vello mide entre 5 mm y 1 cm',
        'No tienes molestias ni lesiones en la zona',
      ],
      [
        'You want more comfort and less sweat in the area',
        'You wax the bikini or full body and want an even result',
        'Your hair is between 5 mm and 1 cm long',
        'You have no discomfort or lesions in the area',
      ],
    ),
    wait: list(
      [
        'Tienes hemorroides inflamadas, fisuras o heridas en la zona',
        'Tienes una infección o lesiones activas',
        'Usas retinoides o isotretinoína',
        'Estás menstruando y prefieres esperar (es opcional)',
      ],
      [
        'You have inflamed haemorrhoids, fissures or cuts in the area',
        'You have an infection or active lesions',
        'You use retinoids or isotretinoin',
        'You are on your period and prefer to wait (optional)',
      ],
    ),
    note: l(
      'Si es tu primera vez, la máquina es una opción más suave y económica para esta zona.',
      'If it is your first time, the machine is a gentler and cheaper option for this area.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Ducha normal antes de la cita',
        'No apliques cremas ni talcos en la zona',
        'Deja crecer el vello dos o tres semanas',
        'Usa ropa interior de algodón',
      ],
      [
        'Shower as usual before the appointment',
        'Do not apply creams or talc on the area',
        'Let the hair grow for two or three weeks',
        'Wear cotton underwear',
      ],
    ),
    after: list(
      [
        'Usa ropa interior de algodón y ropa suelta',
        'Evita ejercicio intenso, bicicleta, piscina y sauna por 24 horas',
        'Usa papel suave o toallitas sin alcohol ni perfume esos días',
        'Desde el tercer día, exfolia suave para evitar vellos encarnados',
      ],
      [
        'Wear cotton underwear and loose clothing',
        'Avoid intense exercise, cycling, pool and sauna for 24 hours',
        'Use soft paper or alcohol-free, unscented wipes for those days',
        'From the third day, exfoliate gently to prevent ingrown hairs',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Hacen depilación perianal a hombres?', 'Do you do perianal waxing for men?'),
      answer: l(
        'Sí, para hombres y mujeres, siempre en cabina privada. Muchos clientes la combinan con pecho, espalda o cuerpo completo.',
        'Yes, for men and women, always in a private cabin. Many clients combine it with chest, back or full body.',
      ),
    },
    {
      question: l('¿Es incómodo depilarse la zona perianal?', 'Is perianal waxing awkward?'),
      answer: l(
        'Es normal sentir algo de pudor la primera vez. Para la cosmetóloga es un servicio más: te explicamos todo antes, mantenemos cubierto lo que no se trabaja y termina en pocos minutos.',
        'It is normal to feel a little self-conscious the first time. For the cosmetologist it is just another service: we explain everything first, keep you covered where we are not working and it is over in a few minutes.',
      ),
    },
    {
      question: l('¿Se puede combinar con la depilación de bikini?', 'Can it be combined with a bikini wax?'),
      answer: l(
        'Sí. Si quieres una depilación brasileña completa, de adelante hacia atrás, se reserva como bikini; si solo quieres la zona perianal, resérvala sola.',
        'Yes. If you want a full Brazilian, front to back, book it as bikini; if you only want the perianal area, book it on its own.',
      ),
    },
  ],
}

const FULL_BODY: ServiceContent = {
  durationMin: 120,
  h1: l('Depilación de cuerpo completo en Medellín', 'Full body waxing in Medellín'),
  whatIs: {
    title: l('Todo el cuerpo en una sola cita', 'Your whole body in one appointment'),
    body: list(
      [
        'Depilamos en una sola sesión piernas completas, brazos, axilas, bikini, abdomen, pecho y espalda, según lo que necesites. Antes de empezar defines con la cosmetóloga qué zonas incluir y qué acabado quieres en cada una.',
        'Es nuestro servicio de depilación más largo: reserva dos horas. Cuesta lo mismo que piernas, axila, bikini, pecho y espalda por separado, pero además incluye los brazos, y con cera te deja todo el cuerpo liso de tres a cuatro semanas.',
      ],
      [
        'In one session we wax full legs, arms, underarms, bikini, stomach, chest and back, depending on what you need. Before starting you agree with the cosmetologist which areas to include and the finish you want on each.',
        'It is our longest waxing service: allow two hours. It costs the same as legs, underarm, bikini, chest and back booked separately but also includes the arms, and with wax it leaves your whole body smooth for three to four weeks.',
      ],
    ),
  },
  quickFacts: [
    { ...FACT.duration, value: l('2 horas', '2 hours') },
    { ...FACT.frequency, value: l('Cada 3–4 semanas', 'Every 3–4 weeks') },
    { ...FACT.pain, value: l('Varía por zona', 'Varies by area') },
    { ...FACT.hair, value: HAIR_LENGTH },
  ],
  benefits: {
    title: l('Por qué hacerlo todo en una cita', 'Why do it all in one visit'),
    items: [
      {
        icon: 'savings',
        title: l('Brazos incluidos', 'Arms included'),
        body: l(
          'Por el precio de piernas, axila, bikini, pecho y espalda por separado, también depilamos los brazos, que no están en el menú como zona suelta.',
          'For the price of legs, underarm, bikini, chest and back separately, we also wax the arms, which are not on the menu as a single area.',
        ),
      },
      {
        icon: 'event_available',
        title: l('Un solo día de cuidados', 'One day of aftercare'),
        body: l(
          'Te organizas una vez: un día sin gimnasio ni sol, y todo el cuerpo queda en el mismo ciclo de crecimiento.',
          'You plan once: one day without gym or sun, and your whole body is on the same growth cycle.',
        ),
      },
      {
        icon: 'flight',
        title: l('Ideal antes de un viaje', 'Ideal before a trip'),
        body: l(
          'Depílate dos o tres días antes de viajar y llegas a la playa con la piel lisa y ya calmada.',
          'Wax two or three days before you travel and arrive at the beach with smooth, settled skin.',
        ),
      },
      {
        icon: 'self_care',
        title: l('Empezamos por lo más fácil', 'We start with the easiest areas'),
        body: l(
          'Arrancamos por piernas y espalda, que molestan menos, y dejamos las zonas sensibles para cuando ya te acostumbraste.',
          'We begin with legs and back, which hurt less, and leave the sensitive areas for when you are used to it.',
        ),
      },
    ],
  },
  protocol: {
    title: l('Así es tu sesión de cuerpo completo', 'What happens in your full body session'),
    intro: l(
      'Son unas dos horas en cabina privada. Puedes pedir una pausa para estirarte o tomar agua cuando quieras.',
      'It takes about two hours in a private cabin. You can ask for a break to stretch or have some water at any time.',
    ),
    steps: [
      {
        title: l('Plan de zonas', 'Plan the areas'),
        body: l(
          'Acordamos qué zonas incluir, el acabado del bikini y el orden.',
          'We agree which areas to include, the bikini finish and the order.',
        ),
      },
      {
        title: l('Piernas y brazos', 'Legs and arms'),
        body: l(
          'Empezamos por las zonas grandes y más tolerables.',
          'We start with the large, more tolerable areas.',
        ),
      },
      {
        title: l('Espalda, pecho y abdomen', 'Back, chest and stomach'),
        body: l(
          'Seguimos con el torso, por secciones y siguiendo la dirección del vello.',
          'We continue with the torso, in sections and following the direction of the hair.',
        ),
      },
      {
        title: l('Axilas y bikini', 'Underarms and bikini'),
        body: l(
          'Terminamos con las zonas más sensibles, en tiras pequeñas, y aplicamos un calmante en todo el cuerpo.',
          'We finish with the most sensitive areas, in small strips, and apply a soothing product all over.',
        ),
      },
    ],
  },
  suitability: {
    ...SUITABILITY_TITLES,
    ideal: list(
      [
        'Tienes un viaje, luna de miel o vacaciones de playa',
        'Quieres dejar la cuchilla en todo el cuerpo',
        'Tu vello mide entre 5 mm y 1 cm en todas las zonas',
        'Tienes dos horas libres sin prisa',
      ],
      [
        'You have a trip, honeymoon or beach holiday',
        'You want to stop shaving everywhere',
        'Your hair is between 5 mm and 1 cm on every area',
        'You have two unhurried hours free',
      ],
    ),
    wait: list(
      [
        'Tienes quemadura solar en alguna zona',
        'Usas retinoides o isotretinoína',
        'Tienes várices marcadas, diabetes o mala circulación (avísanos antes)',
        'Estás en tus días de menstruación y prefieres esperar por el bikini',
      ],
      [
        'You have a sunburn anywhere',
        'You use retinoids or isotretinoin',
        'You have prominent varicose veins, diabetes or poor circulation (tell us beforehand)',
        'You are on your period and prefer to wait for the bikini area',
      ],
    ),
    note: l(
      'Si es tu primera vez con cera, considera la máquina para el cuerpo completo: es más suave y más económica.',
      'If it is your first time waxing, consider the machine for full body: it is gentler and cheaper.',
    ),
  },
  aftercare: {
    ...AFTERCARE_TITLES,
    before: list(
      [
        'Deja de afeitarte dos o tres semanas antes en todas las zonas',
        'Exfolia suave dos días antes',
        'No te apliques cremas ni aceites el día de la cita',
        'Come algo antes y trae ropa suelta',
      ],
      [
        'Stop shaving every area two or three weeks before',
        'Exfoliate gently two days before',
        'Do not apply creams or oils on the day of your appointment',
        'Eat something beforehand and bring loose clothes',
      ],
    ),
    after: list(
      [
        'Nada de gimnasio, piscina, sauna ni sol por 24–48 horas',
        'Usa ropa suelta de algodón',
        'Evita desodorante con alcohol por 24 horas',
        'Hidrata a diario y exfolia dos veces por semana desde el tercer día',
      ],
      [
        'No gym, pool, sauna or sun for 24–48 hours',
        'Wear loose cotton clothing',
        'Skip deodorant with alcohol for 24 hours',
        'Moisturise daily and exfoliate twice a week from the third day',
      ],
    ),
  },
  faqs: [
    {
      question: l('¿Qué zonas incluye la depilación de cuerpo completo?', 'Which areas does full body waxing include?'),
      answer: l(
        'Piernas completas, brazos, axilas, bikini, abdomen, pecho y espalda. Si no necesitas alguna zona, la dejamos fuera; antes de empezar acordamos el plan con la cosmetóloga.',
        'Full legs, arms, underarms, bikini, stomach, chest and back. If you do not need an area we leave it out; we agree the plan with the cosmetologist before starting.',
      ),
    },
    {
      question: l('¿Cuánto tiempo debo reservar?', 'How much time should I allow?'),
      answer: l(
        'Unas dos horas. Llega 10 minutos antes y no agendes nada justo después: es un servicio largo y conviene salir sin prisa.',
        'About two hours. Arrive 10 minutes early and do not schedule anything right after: it is a long service and it is better to leave unhurried.',
      ),
    },
    {
      question: l('¿Cuántos días antes de un viaje debo depilarme?', 'How many days before a trip should I wax?'),
      answer: l(
        'Entre dos y cinco días antes. Así la piel ya está calmada para el sol y el mar, y el resultado te dura todo el viaje.',
        'Two to five days before. That way your skin has settled for sun and sea, and the result lasts the whole trip.',
      ),
    },
  ],
}

export const WAXING_CONTENT: Partial<Record<string, ServiceContent>> = {
  'depilacion-axila': UNDERARM,
  'depilacion-pecho': CHEST,
  'depilacion-pierna-completa': FULL_LEG,
  'depilacion-bikini': BIKINI,
  'depilacion-media-pierna': HALF_LEG,
  'depilacion-espalda': BACK,
  'depilacion-zona-perianal': PERIANAL,
  'depilacion-cuerpo-completo': FULL_BODY,
}
