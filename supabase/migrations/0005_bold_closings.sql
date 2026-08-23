-- Cierres de venta de Bold (bold.co), leídos del correo diario del datáfono.
--
-- Una fila por correo de cierre. La PK es el `Message-ID` del correo, de modo
-- que volver a barrer el buzón (o reintentar el cron) es idempotente. Los
-- cierres cargados a mano usan un id sintético `manual:<hash>` derivado del
-- contenido, que cumple la misma función.
--
-- Los montos son pesos colombianos enteros: Bold no liquida en USD.

create table if not exists public.bold_closings (
  id           text primary key,
  -- YYYY-MM-DD (Bogotá) del inicio del turno: el día al que se imputa el cierre.
  day          date not null,
  received_at  timestamptz not null,
  gross_cop    bigint not null default 0,
  closing_cop  bigint not null default 0,
  transactions int    not null default 0,
  refunds_cop  bigint not null default 0,
  refund_count int    not null default 0,
  -- Texto tal cual del correo ("19 de agosto - 09:51 pm"), solo para mostrar.
  from_label   text,
  to_label     text,
  -- 'imap' | 'manual'
  source       text not null default 'imap',
  created_at   timestamptz not null default now()
);

create index if not exists bold_closings_day_idx on public.bold_closings (day);

-- Igual que el resto de tablas: RLS activo sin políticas, solo entra la
-- service-role key desde el servidor.
alter table public.bold_closings enable row level security;
