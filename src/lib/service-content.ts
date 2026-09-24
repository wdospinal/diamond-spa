/**
 * Long-form, hand-written content for individual /services/[serviceId] pages.
 *
 * `service-seo.ts` generates baseline copy for every service from its data.
 * That is enough for most of the menu, but for the queries we actually compete
 * on (e.g. "limpieza facial profunda medellín") the top Google results all
 * answer the same questions: what the treatment is, what happens step by step,
 * who it is for and who should wait, how long it takes, how often to repeat it
 * and how to care for the skin afterwards. A service listed here gets those
 * sections rendered by the components in `components/service-detail/`.
 *
 * Prices are never written here — they come from `services.ts`. Keep every
 * claim consistent with the facial FAQs in `faqs.ts` and the booking data.
 */

type Locale = 'en' | 'es'
type L<T = string> = Record<Locale, T>

export type QuickFact = { icon: string; label: L; value: L }
export type ProtocolStep = { title: L; body: L }
export type IconItem = { icon: string; title: L; body: L }

export type ServiceContent = {
  /** Session length as booked in BookClient (flat-priced services have no duration table). */
  durationMin: number
  /** H1 override — the menu name plus the city people search with. */
  h1: L
  /** Definition paragraph for the "What is it?" section. */
  whatIs: { title: L; body: L<string[]> }
  quickFacts: QuickFact[]
  benefits: { title: L; items: IconItem[] }
  protocol: { title: L; intro: L; steps: ProtocolStep[] }
  suitability: {
    title: L
    idealTitle: L
    ideal: L<string[]>
    waitTitle: L
    wait: L<string[]>
    note: L
  }
  aftercare: {
    title: L
    beforeTitle: L
    before: L<string[]>
    afterTitle: L
    after: L<string[]>
  }
  /** Other services to compare against, in display order (this service first). */
  compare: {
    title: L
    intro: L
    rows: { serviceId: string; durationMin: number; bestFor: L; extraction: L; downtime: L }[]
  }
  /** Extra FAQs appended after the generated price/location/booking ones. */
  faqs: { question: L; answer: L }[]
  /** Hub landing this page belongs to, linked with a descriptive anchor. */
  hub?: { path: string; anchor: L }
}

const DEEP_FACIAL: ServiceContent = {
  durationMin: 60,
  h1: {
    es: 'Limpieza facial profunda en Medellín',
    en: 'Deep facial cleansing in Medellín',
  },
  whatIs: {
    title: {
      es: '¿Qué es una limpieza facial profunda?',
      en: 'What is a deep facial cleansing?',
    },
    body: {
      es: [
        'Es un tratamiento profesional que retira lo que la limpieza de casa no alcanza: puntos negros, espinillas, sebo acumulado dentro del poro y células muertas. La diferencia con una limpieza básica es la extracción manual: después de ablandar la piel, la cosmetóloga vacía los poros congestionados uno a uno.',
        'La hacemos en cabina privada en El Poblado, dura alrededor de una hora y termina con mascarilla e hidratación para calmar la piel. No es un procedimiento médico ni invasivo, y puedes volver a tu rutina el mismo día.',
      ],
      en: [
        'It is a professional treatment that removes what at-home cleansing cannot reach: blackheads, whiteheads, sebum trapped inside the pore and dead skin cells. What sets it apart from a basic cleanse is manual extraction — once the skin is softened, the cosmetologist clears congested pores one by one.',
        'We do it in a private cabin in El Poblado. It takes about an hour and finishes with a mask and hydration to calm the skin. It is not a medical or invasive procedure, and you can go back to your day straight away.',
      ],
    },
  },
  quickFacts: [
    { icon: 'schedule', label: { es: 'Duración', en: 'Duration' }, value: { es: '60 minutos', en: '60 minutes' } },
    { icon: 'calendar_month', label: { es: 'Frecuencia', en: 'How often' }, value: { es: 'Cada 4–6 semanas', en: 'Every 4–6 weeks' } },
    { icon: 'water_drop', label: { es: 'Recuperación', en: 'Downtime' }, value: { es: 'Rojez leve unas horas', en: 'Mild redness for a few hours' } },
    { icon: 'face', label: { es: 'Ideal para', en: 'Best for' }, value: { es: 'Piel grasa, mixta o con puntos negros', en: 'Oily, combination or congested skin' } },
  ],
  benefits: {
    title: {
      es: 'Beneficios de la limpieza facial profunda',
      en: 'Benefits of a deep facial cleansing',
    },
    items: [
      {
        icon: 'filter_vintage',
        title: { es: 'Poros descongestionados', en: 'Clear pores' },
        body: {
          es: 'La extracción retira puntos negros y espinillas de nariz, mentón y frente, donde más se acumulan.',
          en: 'Extraction clears blackheads and whiteheads from the nose, chin and forehead, where they build up most.',
        },
      },
      {
        icon: 'eco',
        title: { es: 'Menos brillo', en: 'Less shine' },
        body: {
          es: 'Retirar el sebo acumulado ayuda a controlar la grasa sin resecar la piel.',
          en: 'Removing built-up sebum helps control oiliness without stripping the skin.',
        },
      },
      {
        icon: 'brightness_high',
        title: { es: 'Piel más luminosa', en: 'Brighter skin' },
        body: {
          es: 'La exfoliación elimina células muertas y deja una textura más suave y uniforme.',
          en: 'Exfoliation removes dead cells and leaves a smoother, more even texture.',
        },
      },
      {
        icon: 'science',
        title: { es: 'Mejor absorción', en: 'Better absorption' },
        body: {
          es: 'Con el poro limpio, tus sérums e hidratantes de casa penetran y rinden mejor.',
          en: 'With clean pores, your serums and moisturisers at home absorb and work better.',
        },
      },
    ],
  },
  protocol: {
    title: {
      es: 'Paso a paso: así es tu sesión',
      en: 'Step by step: what happens in your session',
    },
    intro: {
      es: 'Cada piel es distinta, así que la cosmetóloga ajusta productos e intensidad después de evaluarte. Este es el recorrido habitual de la sesión de 60 minutos:',
      en: 'Every skin is different, so the cosmetologist adjusts products and intensity after assessing you. This is the usual flow of the 60-minute session:',
    },
    steps: [
      {
        title: { es: 'Diagnóstico de piel', en: 'Skin assessment' },
        body: {
          es: 'Revisamos tu tipo de piel, zonas congestionadas y productos que estés usando para definir el tratamiento.',
          en: 'We look at your skin type, congested areas and any products you use to plan the treatment.',
        },
      },
      {
        title: { es: 'Desmaquillado y limpieza', en: 'Makeup removal and cleanse' },
        body: {
          es: 'Retiramos maquillaje, protector solar y grasa superficial para trabajar sobre piel limpia.',
          en: 'We remove makeup, sunscreen and surface oil so we work on clean skin.',
        },
      },
      {
        title: { es: 'Exfoliación', en: 'Exfoliation' },
        body: {
          es: 'Exfoliación suave para retirar células muertas y preparar el poro.',
          en: 'Gentle exfoliation to lift dead cells and prepare the pores.',
        },
      },
      {
        title: { es: 'Apertura del poro', en: 'Softening the pores' },
        body: {
          es: 'Con vapor o una enzima ablandamos el contenido del poro para que la extracción sea más suave.',
          en: 'Steam or an enzyme softens what is inside the pore so extraction is gentler.',
        },
      },
      {
        title: { es: 'Extracción manual', en: 'Manual extraction' },
        body: {
          es: 'Retiramos puntos negros y espinillas con técnica higiénica, sin forzar la piel inflamada.',
          en: 'We clear blackheads and whiteheads with a hygienic technique, never forcing inflamed skin.',
        },
      },
      {
        title: { es: 'Mascarilla calmante', en: 'Calming mask' },
        body: {
          es: 'Una mascarilla elegida para tu piel reduce la rojez y cierra la sesión de extracción.',
          en: 'A mask chosen for your skin reduces redness after the extraction.',
        },
      },
      {
        title: { es: 'Hidratación final', en: 'Hydration' },
        body: {
          es: 'Terminamos con sérum e hidratante, y te damos recomendaciones para los días siguientes.',
          en: 'We finish with serum and moisturiser, and give you advice for the following days.',
        },
      },
    ],
  },
  suitability: {
    title: {
      es: '¿Es para mí?',
      en: 'Is it right for me?',
    },
    idealTitle: { es: 'Recomendada si tienes', en: 'Recommended if you have' },
    ideal: {
      es: [
        'Piel grasa o mixta',
        'Puntos negros en nariz, mentón o frente',
        'Poros dilatados o piel opaca',
        'Acné leve, como apoyo a tu tratamiento',
        'Irritación o vellos encarnados por afeitado (hombres)',
      ],
      en: [
        'Oily or combination skin',
        'Blackheads on the nose, chin or forehead',
        'Enlarged pores or dull skin',
        'Mild acne, as support to your treatment',
        'Shaving irritation or ingrown hairs (men)',
      ],
    },
    waitTitle: { es: 'Mejor espera o consúltanos si', en: 'Better wait or ask us first if' },
    wait: {
      es: [
        'Tienes acné inflamado o lesiones abiertas',
        'Estás tomando isotretinoína o la dejaste hace menos de 6 meses',
        'Tienes quemadura solar o un peeling o láser reciente',
        'Tienes herpes labial activo',
        'Tu piel es muy sensible o tienes rosácea',
      ],
      en: [
        'You have inflamed acne or open lesions',
        'You are on isotretinoin or stopped less than 6 months ago',
        'You have a sunburn or a recent peel or laser treatment',
        'You have an active cold sore',
        'Your skin is very sensitive or you have rosacea',
      ],
    },
    note: {
      es: 'Si tu piel es sensible, la limpieza facial básica o la hidratación facial son mejores opciones, sin extracciones.',
      en: 'For sensitive skin, the basic facial cleansing or facial hydration are better options, with no extractions.',
    },
  },
  aftercare: {
    title: {
      es: 'Cuidados antes y después',
      en: 'Before and after care',
    },
    beforeTitle: { es: 'Antes de tu cita', en: 'Before your appointment' },
    before: {
      es: [
        'Suspende retinol y ácidos exfoliantes 2–3 días antes',
        'Evita depilar o afeitar la zona ese mismo día',
        'Puedes llegar maquillada: el desmaquillado está incluido',
        'Cuéntanos si usas algún medicamento o tratamiento dermatológico',
      ],
      en: [
        'Pause retinol and exfoliating acids 2–3 days before',
        'Avoid waxing or shaving the area that same day',
        'You can arrive wearing makeup — removal is included',
        'Tell us about any medication or dermatological treatment',
      ],
    },
    afterTitle: { es: 'Las primeras 24–48 horas', en: 'The first 24–48 hours' },
    after: {
      es: [
        'No te maquilles durante unas 24 horas',
        'Usa protector solar y evita el sol directo',
        'Evita gimnasio, sauna y piscina ese día',
        'No toques ni aprietes la piel tratada',
        'Hidrata con productos suaves y sin ácidos',
      ],
      en: [
        'Skip makeup for about 24 hours',
        'Wear sunscreen and avoid direct sun',
        'Avoid the gym, sauna and pool that day',
        'Do not touch or squeeze the treated skin',
        'Moisturise with gentle, acid-free products',
      ],
    },
  },
  compare: {
    title: {
      es: 'Limpieza profunda, básica o HydraFacial: ¿cuál elegir?',
      en: 'Deep cleansing, basic or HydraFacial: which one?',
    },
    intro: {
      es: 'Las tres limpian la piel, pero no hacen lo mismo. Esta tabla te ayuda a elegir según tu piel y tu agenda.',
      en: 'All three cleanse the skin, but they are not the same. Use this table to choose by skin type and schedule.',
    },
    rows: [
      {
        serviceId: 'limpieza-facial-profunda',
        durationMin: 60,
        bestFor: { es: 'Puntos negros y piel grasa', en: 'Blackheads and oily skin' },
        extraction: { es: 'Manual, completa', en: 'Manual, thorough' },
        downtime: { es: 'Sin maquillaje 24 h', en: 'No makeup for 24 h' },
      },
      {
        serviceId: 'limpieza-facial-basica',
        durationMin: 45,
        bestFor: { es: 'Mantenimiento y piel sensible', en: 'Maintenance and sensitive skin' },
        extraction: { es: 'No incluye', en: 'Not included' },
        downtime: { es: 'Ninguna', en: 'None' },
      },
      {
        serviceId: 'hidrafacial',
        durationMin: 90,
        bestFor: { es: 'Luminosidad antes de un evento', en: 'Glow before an event' },
        extraction: { es: 'Por succión, sin presión', en: 'Vacuum, no pressure' },
        downtime: { es: 'Ninguna, maquillaje el mismo día', en: 'None, makeup same day' },
      },
    ],
  },
  faqs: [
    {
      question: {
        es: '¿Cuánto dura una limpieza facial profunda?',
        en: 'How long does a deep facial cleansing take?',
      },
      answer: {
        es: 'La sesión dura 60 minutos, incluyendo diagnóstico, exfoliación, extracción, mascarilla e hidratación. Te recomendamos llegar 10 minutos antes.',
        en: 'The session lasts 60 minutes, including assessment, exfoliation, extraction, mask and hydration. We suggest arriving 10 minutes early.',
      },
    },
    {
      question: {
        es: '¿Duele la limpieza facial profunda?',
        en: 'Does a deep facial cleansing hurt?',
      },
      answer: {
        es: 'Es más incómoda que dolorosa, y solo durante la extracción en las zonas más congestionadas, normalmente nariz y mentón. Ablandamos la piel antes para que sea más suave, y puedes pedir que bajemos la intensidad en cualquier momento.',
        en: 'It is uncomfortable rather than painful, and only during extraction in the most congested areas — usually the nose and chin. We soften the skin first so it is gentler, and you can ask us to ease off at any time.',
      },
    },
    {
      question: {
        es: '¿Cada cuánto debo hacerme una limpieza facial profunda?',
        en: 'How often should I get a deep facial cleansing?',
      },
      answer: {
        es: 'Cada 4 a 6 semanas, que es más o menos lo que tarda la piel en renovarse. Si tu piel es grasa o con tendencia acneica puedes hacerla cada mes; si es seca o sensible, cada dos meses es suficiente.',
        en: 'Every 4 to 6 weeks, roughly the time it takes the skin to renew itself. Oily or acne-prone skin can go monthly; dry or sensitive skin is fine every two months.',
      },
    },
    {
      question: {
        es: '¿Qué diferencia hay entre la limpieza facial profunda y el HydraFacial?',
        en: 'What is the difference between a deep facial cleansing and a HydraFacial?',
      },
      answer: {
        es: 'La limpieza profunda usa extracción manual y es la mejor opción para puntos negros marcados y piel grasa, pero deja la piel algo roja unas horas. El HydraFacial extrae por succión e hidrata con sueros, no deja marcas y te puedes maquillar el mismo día, por eso se elige antes de un evento.',
        en: 'Deep cleansing uses manual extraction and is the best option for stubborn blackheads and oily skin, but leaves the skin a little red for a few hours. HydraFacial extracts by vacuum and hydrates with serums, leaves no marks and you can wear makeup the same day, which is why people choose it before an event.',
      },
    },
    {
      question: {
        es: '¿Puedo maquillarme después de la limpieza facial?',
        en: 'Can I wear makeup after the facial?',
      },
      answer: {
        es: 'Espera unas 24 horas. Después de la extracción los poros quedan abiertos y la piel puede estar algo roja; el maquillaje puede obstruirlos de nuevo o irritar.',
        en: 'Wait about 24 hours. After extraction the pores are open and the skin may be slightly red; makeup can clog them again or irritate.',
      },
    },
    {
      question: {
        es: '¿La limpieza facial profunda sirve para el acné?',
        en: 'Does deep facial cleansing help with acne?',
      },
      answer: {
        es: 'Ayuda como apoyo en acné leve porque descongestiona los poros y reduce los puntos negros. No reemplaza el tratamiento dermatológico en acné moderado o severo, y si tienes lesiones inflamadas activas adaptamos la sesión o te recomendamos esperar.',
        en: 'It helps as support for mild acne because it decongests pores and reduces blackheads. It does not replace dermatological treatment for moderate or severe acne, and if you have active inflamed lesions we adapt the session or recommend waiting.',
      },
    },
    {
      question: {
        es: '¿Hacen limpieza facial profunda para hombres?',
        en: 'Do you do deep facial cleansing for men?',
      },
      answer: {
        es: 'Sí. Es de los tratamientos que más piden nuestros clientes hombres, sobre todo por poros dilatados, piel grasa, vellos encarnados e irritación por afeitado. Para la espalda tenemos limpieza de espalda.',
        en: 'Yes. It is one of the treatments our male guests request most, especially for enlarged pores, oily skin, ingrown hairs and shaving irritation. For the back we offer a back cleansing.',
      },
    },
  ],
  hub: {
    path: '/limpieza-facial-medellin',
    anchor: {
      es: 'Ver todas las opciones de limpieza facial en Medellín',
      en: 'See all facial cleansing options in Medellín',
    },
  },
}

export const SERVICE_CONTENT: Partial<Record<string, ServiceContent>> = {
  'limpieza-facial-profunda': DEEP_FACIAL,
}

export function getServiceContent(serviceId: string): ServiceContent | undefined {
  return SERVICE_CONTENT[serviceId]
}
