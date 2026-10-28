-- Analítica del chat de la pauta (PautaChatWidget en /l/oferta-masajes).
--
-- Una fila por clic o paso dentro del chat. La clave primaria (session_id, seq)
-- hace idempotente el envío: si el navegador reintenta un lote, no se duplica.
--
-- Privacidad: aquí NUNCA hay texto libre, nombre ni teléfono. `ev` es un evento
-- de una lista cerrada y `k` una etiqueta que ya existe en el chat (una duda, un
-- servicio, una fecha). El endpoint público /api/chat-hit descarta todo lo que
-- no esté en esas listas (ver src/lib/chat-events.ts). `session_id` es un valor
-- aleatorio que el navegador olvida al cerrar la pestaña; no se guarda IP.

create table if not exists public.chat_events (
  session_id text        not null,
  -- orden del evento dentro de la sesión (lo asigna el navegador)
  seq        int         not null,
  -- fecha civil de Bogotá, asignada en el servidor
  day        date        not null,
  created_at timestamptz not null default now(),
  -- evento de la lista cerrada de src/lib/chat-events.ts
  ev         text        not null,
  -- etiqueta del evento (duda, servicio, fecha, hora...), siempre de una lista conocida
  k          text,
  -- categoría o "general"
  cat        text,
  -- pantalla del chat donde estaba la persona al tocar
  node       text,
  lang       text,
  -- m = celular, d = computador
  dev        text,
  -- true si llegó desde un anuncio
  ads        boolean,
  adg        text,
  primary key (session_id, seq)
);

create index if not exists chat_events_day_idx on public.chat_events (day);
create index if not exists chat_events_ev_idx on public.chat_events (ev);

-- Solo el servidor (service role) lee y escribe; sin políticas, nadie más puede.
alter table public.chat_events enable row level security;
