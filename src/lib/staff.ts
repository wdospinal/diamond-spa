/**
 * Equipo del spa, para la contabilidad.
 *
 * A propósito NO sale de `THERAPISTS` (la lista del equipo publicada en la web):
 * el chat nombra a personas que no están publicadas, y si alguien se quita de la
 * página sus movimientos pasados dejarían de reconocerse. La contabilidad
 * necesita su propia lista, que crece agregando una línea aquí.
 *
 * Los alias son cómo la nombran en los mensajes de WhatsApp, ya normalizados
 * (minúsculas, sin tildes). Se buscan como palabra completa, así que conviene
 * que sean el nombre de pila o el apodo, no fragmentos.
 *
 * Este módulo no importa nada: lo usan tanto el parser (servidor) como el
 * selector de /admin/caja (cliente).
 */

export interface StaffMember {
  /** Nombre para mostrar y para guardar en el movimiento. */
  name: string
  /** Cómo la escriben en el chat. `sarira` salió de un mensaje real. */
  aliases: string[]
}

export const STAFF: StaffMember[] = [
  { name: 'Daniela Salina', aliases: ['daniela', 'dani'] },
  { name: 'Sary Paez', aliases: ['sary'] },
  { name: 'Ana Maria', aliases: ['ana'] },
  { name: 'Sheyla Tinoco', aliases: ['sheyla', 'sheila'] },
  { name: 'Tatiana', aliases: ['tatiana'] },
  { name: 'Saira Bedoya', aliases: ['saira', 'sarira'] },
  { name: 'Nicol', aliases: ['nicol'] },
  { name: 'Angélica', aliases: ['angelica'] },
]

/** Nombres para poblar el selector del panel. */
export const STAFF_NAMES: string[] = STAFF.map(s => s.name)

/** alias → nombre. El orden de `STAFF` decide qué gana si dos alias chocan. */
export const STAFF_ALIASES: Map<string, string> = new Map(
  STAFF.flatMap(s => s.aliases.map(a => [a, s.name] as [string, string])),
)
