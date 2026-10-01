/**
 * Elige los textos del chat según el idioma de la página.
 *
 * El español (chat-flow-es.ts) es la referencia; el inglés (chat-flow-en.ts)
 * tiene que exportar exactamente lo mismo: si falta algo o cambia de forma,
 * TypeScript avisa.
 */
import type { Cat, Locale } from './chat-catalog'
import * as es from './chat-flow-es'
import * as en from './chat-flow-en'

export type ChatFlow = {
  GREETING: string[]
  ASK_MENU: string
  ASK_GENERAL: string
  ASK_DOUBT: string
  ASK_BACK: string
  DELICATE_LABEL: string
  ASK_DELICATE: string
  HELP_DELICATE_LABEL: string
  GENERAL: (es.Doubt & { id: string })[]
  BRANCHES: Record<Cat, es.Branch>
  MASSAGE_ABOUT: Record<string, string[]>
  RES: typeof es.RES
}

const ES: ChatFlow = es
const EN: ChatFlow = en

export function flowFor(locale: Locale): ChatFlow {
  return locale === 'en' ? EN : ES
}
