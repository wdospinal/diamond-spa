/**
 * depilacion-gender.ts
 * ─────────────────────
 * Audience-framing SEO copy for /depilacion-hombres and /depilacion-mujeres.
 * Both pages show the exact same 8 hair-removal services (services.ts,
 * categoryId: 'hair-removal') — this file exists purely for the gender
 * distinction in framing/copy, mirroring the proven masajes-para-hombres /
 * masajes-para-mujeres pattern. No dedicated keyword export was researched
 * for this vertical yet (unlike Masajes); head terms below are a reasonable,
 * defensible mirror of that already-working pattern, not fresh research.
 */

export type DepilacionGender = 'hombres' | 'mujeres'

export const DEPILACION_GENDER_SEO: Record<DepilacionGender, {
  metaTitle: { es: string; en: string }
  metaDescription: { es: string; en: string }
  h1: { es: string; en: string }
  intro: { es: string; en: string }
  keywords: string
}> = {
  hombres: {
    metaTitle: {
      es: 'Depilación para Hombres en Medellín | Diamond Spa',
      en: 'Hair Removal for Men in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Depilación masculina en El Poblado: axila, espalda, pecho y más. Cera o máquina, en un ambiente privado pensado para hombres. Reserva en línea.',
      en: 'Men\u2019s hair removal in El Poblado: underarm, back, chest and more. Wax or machine, in a private setting made for men. Book online.',
    },
    h1: { es: 'Depilación para Hombres en Medellín', en: 'Hair Removal for Men in Medellín' },
    intro: {
      es: 'Depilación masculina profesional en El Poblado, con la misma técnica y cuidado que el resto de nuestros servicios — solo que pensada para el cuerpo y la comodidad de un hombre.',
      en: 'Professional men\u2019s hair removal in El Poblado, with the same technique and care as the rest of our services — just designed for a man\u2019s body and comfort.',
    },
    keywords: 'depilación para hombres, depilación masculina medellín, depilación hombres el poblado, cera para hombres medellín',
  },
  mujeres: {
    metaTitle: {
      es: 'Depilación para Mujeres en Medellín | Diamond Spa',
      en: 'Hair Removal for Women in Medellín | Diamond Spa',
    },
    metaDescription: {
      es: 'Depilación femenina en El Poblado: bikini, piernas, axila y más. Cera o máquina, en un ambiente privado pensado para ti. Reserva en línea.',
      en: 'Women\u2019s hair removal in El Poblado: bikini, legs, underarm and more. Wax or machine, in a private setting made for you. Book online.',
    },
    h1: { es: 'Depilación para Mujeres en Medellín', en: 'Hair Removal for Women in Medellín' },
    intro: {
      es: 'Depilación profesional en El Poblado, con el mismo cuidado y técnica que el resto de nuestros servicios — en un espacio pensado para tu comodidad.',
      en: 'Professional hair removal in El Poblado, with the same care and technique as the rest of our services — in a space designed for your comfort.',
    },
    keywords: 'depilación para mujeres, depilación femenina medellín, depilación mujeres el poblado, cera para mujeres medellín',
  },
}
