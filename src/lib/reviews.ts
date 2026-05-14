interface StaticReview {
  relativePublishTimeDescription: string
  rating: number
  text?: { text: string }
  authorAttribution: {
    displayName: string
    photoUri: string
  }
  isStatic?: true
}

export const STATIC_REVIEWS: StaticReview[] = [
  {
    relativePublishTimeDescription: 'hace 2 semanas',
    rating: 5,
    text: {
      text: 'Una experiencia absolutamente transformadora. Llegué agotada después de una semana de trabajo muy intensa y salí sintiéndome completamente renovada. El masaje de tejido profundo fue exactamente lo que necesitaba: la terapeuta identificó cada punto de tensión y trabajó con una precisión increíble. El ambiente es impecable, muy tranquilo y privado, con aromas suaves y música relajante. El cuarto estaba preparado al detalle. Sin duda el mejor spa que he visitado en Medellín. Ya tengo mi próxima cita agendada.',
    },
    authorAttribution: {
      displayName: 'Valentina Ríos',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=ValentinaRios&backgroundColor=e8d5c4&textColor=5a3e2b&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '1 month ago',
    rating: 5,
    text: {
      text: 'I visited Diamond Spa as part of my trip to Medellín and it was one of the highlights of my entire trip. The four-hands massage was an experience I had never tried before — it requires incredible synchronization between therapists and these two were absolutely flawless. The private room was elegant and serene, nothing like the crowded day spas back home. Staff spoke perfect English, which I appreciated. The HydraFacial left my skin glowing for days afterward. If you are visiting El Poblado and want to treat yourself, this is the place.',
    },
    authorAttribution: {
      displayName: 'Sarah Mitchell',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=SarahMitchell&backgroundColor=d4e8d4&textColor=2b5a2b&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 3 semanas',
    rating: 5,
    text: {
      text: 'Llevé a mi pareja para un día de spa como regalo de aniversario y superó todas nuestras expectativas. Nos dieron la opción de hacer los tratamientos juntos en la misma sala privada, lo que hizo la experiencia mucho más especial e íntima. El masaje relajante fue increíble, nunca me había quedado tan profundamente dormida en una camilla. La limpieza facial que recibí dejó mi piel brillante y sin ninguna imperfección. El equipo es muy profesional, discreto y amable. El espacio es elegante sin ser ostentoso. Totalmente recomendado para ocasiones especiales.',
    },
    authorAttribution: {
      displayName: 'Camila Montoya',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=CamilaMontoya&backgroundColor=e4d4e8&textColor=4a2b5a&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '3 weeks ago',
    rating: 5,
    text: {
      text: 'As a frequent traveler to Medellín for business, I have tried several spas in El Poblado. Diamond Spa stands out for its attention to detail and genuine commitment to quality. The deep tissue massage addressed my chronic lower back issues with technique I have only experienced at luxury resorts abroad. The therapist asked thorough questions about pressure preferences and any sensitive areas before starting — that level of care is rare. The facility is spotlessly clean and the room felt truly private. I have now made it a routine to book here whenever I am in the city.',
    },
    authorAttribution: {
      displayName: 'James Carter',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=JamesCarter&backgroundColor=d4dce8&textColor=2b3b5a&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 1 mes',
    rating: 5,
    text: {
      text: 'El HydraFacial fue una revelación total. Tenía la piel muy opaca y con puntos negros difíciles de tratar, y después de una sola sesión el resultado fue visible e inmediato. La esteticista explicó cada paso del proceso con mucha paciencia y me dio recomendaciones personalizadas para el cuidado en casa. El masaje deportivo que combiné con el facial fue igualmente excelente — perfecto para recuperarse después del ejercicio intenso. El ambiente del spa transmite calma desde el momento en que entras. Precios muy razonables para la calidad que ofrecen.',
    },
    authorAttribution: {
      displayName: 'Daniela Herrera',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=DanielaHerrera&backgroundColor=e8e4d4&textColor=5a4e2b&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '2 months ago',
    rating: 5,
    text: {
      text: 'Came here on a recommendation from my hotel concierge and I am so glad I listened. The sports massage was exactly what I needed after a long week of hiking around Antioquia. The therapist worked methodically through muscle groups and the pressure was perfectly calibrated to therapeutic without being painful. What impressed me most was the consultation beforehand — they actually listened and tailored the session accordingly. The facility is modern, immaculate and the private room setup means you feel completely at ease. Bilingual staff made everything effortless. Already planning my next visit.',
    },
    authorAttribution: {
      displayName: 'Tom Brennan',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=TomBrennan&backgroundColor=d4e8e4&textColor=2b5a4e&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 5 semanas',
    rating: 5,
    text: {
      text: 'Vine por primera vez sin saber muy bien qué esperar y me fui completamente enamorada del lugar. El masaje de cuatro manos fue algo que nunca había vivido y la coordinación entre las dos terapeutas fue perfecta, como una coreografía. Es difícil explicar la sensación — simplemente desconectas por completo. La sala era acogedora, con temperatura perfecta y aromas muy agradables. Después del masaje me ofrecieron té de hierbas mientras descansaba, un detalle que me pareció muy considerado. Ya hice la reserva para el próximo mes con una amiga.',
    },
    authorAttribution: {
      displayName: 'Isabella Vargas',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=IsabellaVargas&backgroundColor=e8d4d4&textColor=5a2b2b&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '6 weeks ago',
    rating: 5,
    text: {
      text: 'My wife and I celebrated our anniversary with the couple\'s spa day package and it was genuinely one of the best experiences we have had together. Everything was arranged beautifully — the room, the timing of each treatment, even the small touches like the ambient lighting and the scent diffusers. The relaxing massages were deeply soothing, and the facial treatments left us both looking noticeably refreshed. The staff were warm, professional and never intrusive. It felt like a private retreat right in the middle of El Poblado. Highly recommend for special occasions.',
    },
    authorAttribution: {
      displayName: 'Michael Torres',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=MichaelTorres&backgroundColor=dce4e8&textColor=2b4a5a&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 2 meses',
    rating: 5,
    text: {
      text: 'Soy médico y tengo estándares muy altos cuando se trata de tratamientos corporales. Diamond Spa cumplió con todos ellos. La terapeuta del masaje de tejido profundo demostró un conocimiento anatómico serio — supo exactamente dónde aplicar presión y cuándo modularla. No hubo ningún momento incómodo o mal ejecutado. El espacio cumple con estándares de higiene impecables, algo que valoro enormemente. La limpieza facial profunda fue igualmente técnica y precisa. Es un lugar donde se nota que el personal tiene formación real. Lo recomendaré activamente a mis pacientes que buscan bienestar.',
    },
    authorAttribution: {
      displayName: 'Andrés Gómez',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=AndresGomez&backgroundColor=d4e8d8&textColor=2b5a34&size=40',
    },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '7 weeks ago',
    rating: 5,
    text: {
      text: 'I booked the express facial on a whim while visiting Medellín and ended up staying for a full deep cleanse because the esthetician recommended it after assessing my skin. Best spontaneous decision I made on this trip. She explained exactly what she was doing and why, which I really appreciated — it felt educational as well as relaxing. My skin felt softer than it has in years and the redness I normally deal with was significantly reduced. The waiting area and treatment room were both immaculate. Prices are very fair for the quality you receive. Will make this a regular stop when I am in Colombia.',
    },
    authorAttribution: {
      displayName: 'Emma Lawson',
      photoUri: 'https://api.dicebear.com/7.x/initials/png?seed=EmmaLawson&backgroundColor=e8dcd4&textColor=5a3e2b&size=40',
    },
    isStatic: true,
  },
]
