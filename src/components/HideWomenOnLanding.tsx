'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { HIDE_WOMEN_LINKS_ON_LANDINGS, isMenOnlyLandingPath } from '@/lib/landing-audience'

/**
 * Envuelve un enlace dirigido a mujeres (por ejemplo, en el pie de página) y lo
 * oculta solo en la pauta para hombres (/l/oferta-masajes). Ver `landing-audience.ts`.
 */
export default function HideWomenOnLanding({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (HIDE_WOMEN_LINKS_ON_LANDINGS && isMenOnlyLandingPath(pathname)) return null
  return <>{children}</>
}
