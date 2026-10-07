-- Compras individuales de Bold, leídas de los correos "Compra por $ X en
-- Diamond spa" que el datáfono manda por cada pago aprobado.
--
-- Sirven para ver las ventas del día en curso antes de que llegue el correo de
-- cierre. El cierre (bold_closings) sigue siendo la cifra oficial: el panel
-- solo suma las compras posteriores al último cierre.
--
-- La PK es el "ID Transacción Bold" del comprobante, así que volver a barrer el
-- buzón es idempotente.

create table if not exists public.bold_sales (
  id           text primary key,
  -- YYYY-MM-DD (Bogotá) de la compra.
  day          date not null,
  occurred_at  timestamptz not null,
  received_at  timestamptz not null,
  subtotal_cop bigint not null default 0,
  tip_cop      bigint not null default 0,
  total_cop    bigint not null default 0,
  card_label   text not null default '',
  last4        text not null default '',
  message_id   text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists bold_sales_occurred_at_idx on public.bold_sales (occurred_at);

alter table public.bold_sales enable row level security;
