-- Movimientos de caja (ingresos y egresos) capturados desde WhatsApp.
--
-- Una fila por mensaje reenviado al número bot. La PK es el `wamid` de
-- WhatsApp, así que reprocesar un webhook (Meta reintenta ante cualquier error)
-- es idempotente. Las altas manuales usan `manual:<uuid>` y las importadas de
-- un export del chat `zip:<hash>`, que cumplen la misma función.
--
-- Los montos son pesos colombianos enteros. Los pagos con datáfono NO entran
-- aquí: los trae Bold por IMAP a `bold_closings` y se unifican al leer.

create table if not exists public.ledger_entries (
  id               text primary key,
  -- YYYY-MM-DD (Bogotá) al que se imputa el movimiento.
  day              date not null,
  occurred_at      timestamptz not null,
  -- 'income' | 'expense'
  kind             text not null,
  -- 0 mientras status = 'needs_amount': un movimiento sin monto no suma.
  amount_cop       bigint not null default 0,
  -- 'transfer' | 'bold' | 'cash'
  channel          text not null default 'transfer',
  -- Ingresos: service | tip | other. Egresos: rent | marketing | payroll |
  -- commission | supplies | utilities | equipment | food | other.
  category_id      text not null default 'other',
  -- Id del catálogo de src/lib/services.ts. Null cuando el servicio del mensaje
  -- no existe en el catálogo (p. ej. "envolvente premium"); ahí manda service_label.
  service_id       text,
  service_label    text,
  duration_minutes int,
  quantity         int not null default 1,
  therapist        text,
  -- Texto original del mensaje, íntegro. Es la evidencia de qué se interpretó.
  note             text not null default '',
  -- 'whatsapp' | 'manual' | 'zip'
  source           text not null default 'whatsapp',
  author           text not null default '',
  -- Id del adjunto en Meta (~30 días de vida), servido por /api/whatsapp/media/[id].
  media_id         text,
  -- 'active' | 'needs_amount' | 'void'
  status           text not null default 'active',
  -- 'high' | 'low' — qué tan seguro quedó el parser. Ordena la revisión.
  confidence       text not null default 'high',
  -- Dato que el bot está esperando por WhatsApp ('kind' | 'category' | 'amount'),
  -- y el id del mensaje con que lo preguntó: la respuesta del usuario llega con
  -- ese id en `context.id`.
  pending_field    text,
  prompt_wamid     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists ledger_entries_day_idx on public.ledger_entries (day);

-- Índice parcial: solo las filas con una pregunta abierta. Resolver la
-- respuesta del bot es entonces una sola consulta sobre muy pocas filas.
create index if not exists ledger_entries_prompt_idx
  on public.ledger_entries (prompt_wamid)
  where prompt_wamid is not null;

-- Igual que el resto de tablas: RLS activo sin políticas, solo entra la
-- service-role key desde el servidor.
alter table public.ledger_entries enable row level security;
