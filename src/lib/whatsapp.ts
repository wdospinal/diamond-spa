/**
 * Cliente mínimo de la WhatsApp Cloud API sobre `fetch` — sin dependencia npm,
 * igual que los clientes de Supabase y KV.
 *
 * Solo se usa desde el servidor: el token da acceso a mandar mensajes en nombre
 * del número del spa.
 *
 * Nada de lo que hay aquí lanza hacia afuera. Si Meta falla, el movimiento ya
 * quedó guardado y lo único que se pierde es el acuse por WhatsApp: hacer
 * fallar el webhook sería peor, porque Meta lo reintenta en bucle.
 */

// TODO: cambiar a la versión más reciente
const GRAPH = "https://graph.facebook.com/v21.0";

export interface WhatsappConn {
  token: string;
  phoneNumberId: string;
}

export function whatsappEnv(): WhatsappConn | null {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  return token && phoneNumberId ? { token, phoneNumberId } : null;
}

export function whatsappConfigured(): boolean {
  return whatsappEnv() !== null;
}

/**
 * Números autorizados a registrar movimientos, de `WHATSAPP_ALLOWED_SENDERS`.
 * Se guardan solo con dígitos para que dé igual cómo se escriban en la variable
 * (`+57 305 454 1635`, `573054541635`, …).
 */
export function allowedSenders(): string[] {
  return (process.env.WHATSAPP_ALLOWED_SENDERS ?? "")
    .split(",")
    .map((s) => s.replace(/\D/g, ""))
    .filter(Boolean);
}

/**
 * ¿Este número puede registrar movimientos?
 *
 * Se comparan los últimos 10 dígitos: Meta entrega el `from` en E.164 sin `+`,
 * pero el indicativo puede venir escrito distinto en la variable de entorno, y
 * en Colombia el móvil de 10 dígitos identifica sin ambigüedad.
 */
export function isAllowedSender(from: string): boolean {
  const list = allowedSenders();
  if (list.length === 0) return false;
  const tail = (n: string) => n.replace(/\D/g, "").slice(-10);
  const incoming = tail(from);
  return incoming.length === 10 && list.some((n) => tail(n) === incoming);
}

async function graph(path: string, init?: RequestInit): Promise<Response> {
  const conn = whatsappEnv();
  if (!conn) throw new Error("WhatsApp not configured");
  return fetch(`${GRAPH}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${conn.token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

/** Manda un mensaje ya armado. Devuelve el `wamid` del mensaje enviado, o null. */
async function send(payload: Record<string, unknown>): Promise<string | null> {
  const conn = whatsappEnv();
  if (!conn) return null;
  try {
    const res = await graph(`${conn.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    });
    if (!res.ok) {
      console.error("WhatsApp send failed:", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { messages?: { id: string }[] };
    return json.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return null;
  }
}

export function sendText(to: string, body: string): Promise<string | null> {
  return send({ to, type: "text", text: { body, preview_url: false } });
}

export interface ReplyOption {
  id: string;
  title: string;
  description?: string;
}

/** Botones de respuesta rápida. La Cloud API admite 3 como máximo. */
export function sendButtons(
  to: string,
  body: string,
  options: ReplyOption[],
): Promise<string | null> {
  return send({
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: options.slice(0, 3).map((o) => ({
          type: "reply",
          // Los títulos de botón no pasan de 20 caracteres.
          reply: { id: o.id, title: o.title.slice(0, 20) },
        })),
      },
    },
  });
}

/** Lista desplegable. La Cloud API admite 10 filas como máximo. */
export function sendList(
  to: string,
  body: string,
  buttonLabel: string,
  options: ReplyOption[],
): Promise<string | null> {
  return send({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: [
          {
            title: "Opciones",
            rows: options.slice(0, 10).map((o) => ({
              id: o.id,
              title: o.title.slice(0, 24),
              ...(o.description
                ? { description: o.description.slice(0, 72) }
                : {}),
            })),
          },
        ],
      },
    },
  });
}

/**
 * Descarga un adjunto. Son dos saltos: el id da una URL firmada que vive unos
 * minutos, y esa URL se baja con el mismo token. El id en cambio dura ~30 días,
 * así que es lo que se guarda en la base.
 */
export async function fetchMedia(
  mediaId: string,
): Promise<{ body: ArrayBuffer; mimeType: string } | null> {
  const conn = whatsappEnv();
  // Sin credenciales no hay nada que traer, y no es un error que valga la pena
  // registrar: en local es lo normal.
  if (!conn) return null;

  try {
    const meta = await graph(mediaId);
    if (!meta.ok) return null;
    const { url, mime_type } = (await meta.json()) as {
      url?: string;
      mime_type?: string;
    };
    if (!url) return null;

    const file = await fetch(url, {
      headers: { Authorization: `Bearer ${conn.token}` },
      cache: "no-store",
    });
    if (!file.ok) return null;
    return {
      body: await file.arrayBuffer(),
      mimeType: mime_type ?? "image/jpeg",
    };
  } catch (err) {
    console.error("WhatsApp media error:", err);
    return null;
  }
}
