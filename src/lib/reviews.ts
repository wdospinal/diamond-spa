export interface StaticReview {
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
    relativePublishTimeDescription: 'hace 1 mes',
    rating: 5,
    text: { text: 'El mejor spa de El Poblado, sin duda. El masaje de tejido profundo fue increíble, salí completamente relajado. El personal habla inglés, lo cual fue muy conveniente para mí.' },
    authorAttribution: { displayName: 'Andrés Restrepo', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '3 weeks ago',
    rating: 5,
    text: { text: "Amazing experience! The 4-hands massage was unlike anything I've tried before. Very professional staff and a beautifully calming atmosphere. Highly recommend for anyone visiting Medellín." },
    authorAttribution: { displayName: 'James W.', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 2 semanas',
    rating: 5,
    text: { text: 'Vine con mi pareja y los dos quedamos encantados. El masaje de parejas es perfecto para un momento especial. El lugar es elegante, muy limpio y el personal muy atento.' },
    authorAttribution: { displayName: 'María Camila Torres', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '1 month ago',
    rating: 5,
    text: { text: 'As a frequent traveler to Medellín, Diamond Spa is always my first stop. The deep tissue massage is exceptional — my therapist really listened to what I needed.' },
    authorAttribution: { displayName: 'Michael R.', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 3 semanas',
    rating: 5,
    text: { text: 'La limpieza facial fue espectacular. Mi piel quedó radiante y el proceso fue muy relajante. El precio es muy justo para la calidad del servicio. Volvería sin dudarlo.' },
    authorAttribution: { displayName: 'Valentina López', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '2 months ago',
    rating: 5,
    text: { text: "Best massage I've had in Colombia. The relaxing massage was the perfect way to end a long week. The space feels genuinely luxurious without being stuffy." },
    authorAttribution: { displayName: 'Daniel F.', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 1 semana',
    rating: 5,
    text: { text: 'El masaje deportivo fue exactamente lo que necesitaba después de tanto ejercicio. Los terapeutas saben exactamente dónde están los puntos de tensión. Servicio de primera.' },
    authorAttribution: { displayName: 'Sebastián Gómez', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '6 weeks ago',
    rating: 5,
    text: { text: "The location in El Poblado is perfect — easy to find and very elegant. I got the relaxing massage and felt completely renewed. Will definitely be back next time I'm in Medellín." },
    authorAttribution: { displayName: 'Sarah T.', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 2 meses',
    rating: 5,
    text: { text: 'Reservé el masaje de 4 manos para mi cumpleaños y fue una experiencia única. El ambiente es lujoso y tranquilo. Todo el equipo es muy atento y profesional. Muy recomendado.' },
    authorAttribution: { displayName: 'Isabella Martínez', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '3 months ago',
    rating: 5,
    text: { text: 'Outstanding service from start to finish. The reception team was welcoming and bilingual, the facilities are immaculate, and the massage was truly therapeutic. A hidden gem in Poblado.' },
    authorAttribution: { displayName: 'Thomas B.', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: 'hace 3 semanas',
    rating: 5,
    text: { text: 'Fui a probar la depilación masculina y el servicio fue excelente. Personal muy profesional y respetuoso. El lugar es muy cómodo y discreto. Lo recomiendo completamente.' },
    authorAttribution: { displayName: 'Felipe Cardona', photoUri: '' },
    isStatic: true,
  },
  {
    relativePublishTimeDescription: '5 weeks ago',
    rating: 5,
    text: { text: 'Found this place on a whim and it exceeded every expectation. The staff made me feel welcome immediately and the deep tissue massage was genuinely one of the best I have ever had.' },
    authorAttribution: { displayName: 'Lucas M.', photoUri: '' },
    isStatic: true,
  },
]
