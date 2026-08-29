/**
 * Sirve la foto del comprobante dentro del panel.
 *
 * Meta no da una URL pública: hay que pedirla con el token y vive unos minutos.
 * En vez de descargar y almacenar cada imagen, esta ruta hace de proxy contra
 * Graph cuando alguien abre /admin/caja — sin almacenamiento de archivos.
 *
 * Límite conocido: Meta conserva el adjunto ~30 días. Pasado ese plazo la
 * miniatura deja de cargar; el movimiento y su texto quedan igual.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminCookieName, verifySessionToken } from '@/lib/admin-session'
import { fetchMedia } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(adminCookieName())?.value
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
  }

  const media = await fetchMedia(id)
  if (!media) {
    return NextResponse.json({ error: 'No disponible' }, { status: 404 })
  }

  return new NextResponse(media.body, {
    headers: {
      'Content-Type': media.mimeType,
      // Privado y corto: la imagen es de un comprobante y el id caduca.
      'Cache-Control': 'private, max-age=300',
    },
  })
}
