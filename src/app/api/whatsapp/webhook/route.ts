/**
 * Webhook de WhatsApp Cloud API — entrada de los comprobantes.
 *
 * La API oficial NO puede leer grupos: solo recibe mensajes que alguien manda
 * 1-a-1 al número del spa. Por eso el flujo es «mandar el comprobante al grupo
 * como siempre y reenviarlo también al bot»; el grupo sigue igual.
 *
 * Varias personas pueden reenviar a la vez: cada una tiene su conversación con
 * el bot y todas caen acá. Quién puede registrar se controla con
 * WHATSAPP_ALLOWED_SENDERS.
 *
 * Configuración en Meta: Webhooks → URL de esta ruta, verify token =
 * WHATSAPP_VERIFY_TOKEN, suscrito al campo `messages`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyMetaSignature } from '@/lib/meta-signature'
import { extractMessages, handleMessage } from '@/lib/whatsapp-router'
import { isAllowedSender } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Handshake de alta del webhook: Meta pide que le devuelvan el challenge. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const expected = process.env.WHATSAPP_VERIFY_TOKEN

  if (
    expected &&
    params.get('hub.mode') === 'subscribe' &&
    params.get('hub.verify_token') === expected
  ) {
    return new NextResponse(params.get('hub.challenge') ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret) {
    console.error('WHATSAPP_APP_SECRET sin configurar: el webhook queda cerrado.')
    return new NextResponse('Not configured', { status: 503 })
  }

  // La firma se calcula sobre el cuerpo crudo, así que hay que leerlo como
  // texto ANTES de parsear el JSON.
  const raw = await req.text()
  if (!verifyMetaSignature(raw, req.headers.get('x-hub-signature-256'), secret)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: true })
  }

  // A partir de aquí siempre se responde 200: cualquier error devuelto hace que
  // Meta reintente la misma entrega en bucle. Los fallos se registran en el log
  // y el comprobante se puede cargar a mano desde /admin/caja.
  try {
    for (const msg of extractMessages(payload)) {
      if (!isAllowedSender(msg.from)) continue
      await handleMessage(msg)
    }
  } catch (err) {
    console.error('Error procesando webhook de WhatsApp:', err)
  }

  return NextResponse.json({ ok: true })
}
