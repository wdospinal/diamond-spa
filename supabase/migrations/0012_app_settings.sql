-- Configuración compartida de la aplicación.
--
-- Pares clave/valor que deben ser iguales para todo el equipo. El primer uso es
-- el día de corte del período contable (`ledger.cycle_start_day`): si cada quien
-- lo guardara en su navegador, dos personas verían totales distintos del mismo
-- «mes», que en contabilidad es inaceptable.
--
-- El valor va en JSONB para no crear una tabla por cada ajuste.

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  -- Usuario admin que hizo el último cambio, para poder rastrearlo.
  updated_by text
);

-- Igual que el resto de tablas: RLS activo sin políticas, solo entra la
-- service-role key desde el servidor.
alter table public.app_settings enable row level security;
