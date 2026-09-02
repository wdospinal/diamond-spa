import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { readBookings } from '@/lib/bookings-store'
import { sortBookingsForAdmin } from '@/lib/booking-types'

/**
 * Stream de reservas en vivo (Server-Sent Events).
 *
 * El tablero de /admin/bookings lo miran varias personas a la vez (recepción,
 * terapeutas, quien gestiona la pauta) y las tarjetas se mueven durante el día.
 * En vez de que cada pestaña pida la lista completa cada 15 s, abre una sola
 * conexión aquí: el servidor consulta el almacén y solo empuja bytes cuando el
 * contenido cambia de verdad (se compara un hash), así que una pestaña en
 * reposo recibe únicamente un `: ping` de vez en cuando.
 *
 * La conexión se cierra sola antes del límite de la función; EventSource
 * reconecta solo (`retry`), y el cliente mantiene un sondeo de respaldo por si
 * la red o un proxy corta el stream.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Vercel corta la función en este tope; el ciclo termina antes (MAX_LIFETIME_MS).
export const maxDuration = 300

/** Cada cuánto releemos el almacén buscando cambios. */
const POLL_MS = Number(process.env.BOOKINGS_STREAM_POLL_MS) || 3000
/** Sin cambios, mandamos un comentario para que proxies y móviles no cierren. */
const HEARTBEAT_MS = 20000
/** Se cierra el stream antes de que la plataforma lo mate, para reconectar limpio. */
const MAX_LIFETIME_MS = 4 * 60 * 1000
/** Sugerencia de reconexión que respeta EventSource. */
const RETRY_MS = 3000

function fingerprint(payload: unknown): string {
  return createHash('sha1').update(JSON.stringify(payload)).digest('hex')
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    if (signal.aborted) return resolve()
    const timer = setTimeout(done, ms)
    function done() {
      clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
    signal.addEventListener('abort', done)
  })
}

export async function GET(req: NextRequest) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const onAbort = () => {
        closed = true
      }
      req.signal.addEventListener('abort', onAbort)

      const send = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // El cliente cerró la pestaña entre el chequeo y el enqueue.
          closed = true
        }
      }
      const sendEvent = (event: string, data: unknown) => {
        send(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      }

      send(`retry: ${RETRY_MS}\n\n`)

      const startedAt = Date.now()
      let lastHash = ''
      let lastWrite = Date.now()

      while (!closed) {
        try {
          const bookings = sortBookingsForAdmin(await readBookings())
          const hash = fingerprint(bookings)
          if (hash !== lastHash) {
            lastHash = hash
            sendEvent('bookings', { bookings })
            lastWrite = Date.now()
          } else if (Date.now() - lastWrite >= HEARTBEAT_MS) {
            send(': ping\n\n')
            lastWrite = Date.now()
          }
        } catch (err) {
          // Un fallo del almacén no debe tumbar el stream: el cliente conserva
          // la última lista buena y el siguiente ciclo reintenta.
          console.error('bookings stream read failed', err)
        }

        if (Date.now() - startedAt >= MAX_LIFETIME_MS) {
          // Cierre planificado: se avisa para que el cliente reconecte al
          // instante en vez de tratarlo como una caída de red.
          sendEvent('rotate', { reason: 'max-lifetime' })
          break
        }
        await sleep(POLL_MS, req.signal)
      }

      req.signal.removeEventListener('abort', onAbort)
      closed = true
      try {
        controller.close()
      } catch {
        /* ya cerrado por el cliente */
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
      // Nginx y algunos proxies bufferizan SSE si no se les dice lo contrario.
      'X-Accel-Buffering': 'no',
    },
  })
}
