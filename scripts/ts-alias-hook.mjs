/**
 * Resuelve los imports `@/…` cuando las pruebas corren con el runner de Node.
 *
 * El proyecto no tiene runner de pruebas ni bundler fuera de Next, y la regla es
 * no agregar dependencias. Node ya sabe ejecutar TypeScript (borra los tipos) y
 * traer `node:test`; lo único que le falta es el alias `@/` del tsconfig, que
 * son estas 20 líneas.
 *
 *   node --experimental-strip-types --import ./scripts/ts-alias-hook.mjs \
 *        --test src/lib/ledger-parser.test.ts
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CANDIDATES = ['.ts', '.tsx', '.mjs', '.js', '/index.ts']

function firstExisting(base) {
  for (const ext of CANDIDATES) {
    if (existsSync(base + ext)) return { url: pathToFileURL(base + ext).href, shortCircuit: true }
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // Alias del tsconfig: `@/lib/x` → `<root>/src/lib/x`.
    if (specifier.startsWith('@/')) {
      const hit = firstExisting(join(root, 'src', specifier.slice(2)))
      if (hit) return hit
    }
    // TypeScript deja escribir `./constants/durations` sin extensión; Node no.
    if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier) && context.parentURL) {
      const hit = firstExisting(join(dirname(fileURLToPath(context.parentURL)), specifier))
      if (hit) return hit
    }
    return nextResolve(specifier, context)
  },
})
