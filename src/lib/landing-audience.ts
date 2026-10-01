/**
 * Audiencia de la página de pauta solo para hombres (/es/l/oferta-masajes y /en/l/oferta-masajes).
 *
 * Mientras esa pauta sea solo para hombres, esa página no muestra enlaces a las
 * secciones de mujeres (menú, menú móvil y pie de página) ni hereda las palabras
 * clave generales del sitio. Las demás páginas, incluidas otras landings, no cambian.
 * Para volver a mostrarlos basta con poner la bandera en false.
 */
export const HIDE_WOMEN_LINKS_ON_LANDINGS = true

/** Landings solo para hombres (el último tramo de /l/<slug>). */
export const MEN_ONLY_LANDING_SLUGS: readonly string[] = ['oferta-masajes']

/** ¿Este slug de landing (/l/<slug>) es de la pauta solo para hombres? */
export function isMenOnlyLandingSlug(slug: string | null | undefined): boolean {
  return !!slug && MEN_ONLY_LANDING_SLUGS.includes(slug)
}

/** ¿La ruta actual es la página de la pauta solo para hombres? */
export function isMenOnlyLandingPath(pathname: string | null | undefined): boolean {
  const m = pathname?.match(/^\/(?:es|en)\/l\/([^/?#]+)/)
  return isMenOnlyLandingSlug(m?.[1])
}

/** Enlaces del sitio que van dirigidos a mujeres. */
const WOMEN_HREF = /\/(masajes-para-mujeres|depilacion-mujeres)(\/|$)/

/** Quita de los menús los enlaces a mujeres cuando la ruta es la pauta solo para hombres. */
export function withoutWomenOnLanding<T extends { children?: { label: string; href: string }[] }>(
  links: T[],
  pathname: string | null | undefined,
): T[] {
  if (!HIDE_WOMEN_LINKS_ON_LANDINGS || !isMenOnlyLandingPath(pathname)) return links
  return links.map(l => (l.children ? { ...l, children: l.children.filter(c => !WOMEN_HREF.test(c.href)) } : l))
}
