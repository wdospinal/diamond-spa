-- Cuentas del panel de administración (/admin).
--
-- Hasta ahora las credenciales vivían solo en variables de entorno
-- (ADMIN_USERNAME/ADMIN_PASSWORD y ADMIN_USERS). Esas siguen sirviendo como
-- contraseña *inicial*: en cuanto una usuaria cambia la suya desde
-- /admin/account se crea aquí su fila y la del entorno deja de valer para ella.
--
-- El cambio de contraseña exige un código de 6 dígitos enviado al correo que
-- la usuaria escribe, y ese correo queda asociado a la cuenta. El código se
-- guarda hasheado (HMAC con ADMIN_SESSION_SECRET), nunca en claro, junto con
-- su caducidad y un contador de intentos.

create table if not exists public.admin_users (
  -- Usuario en minúsculas ('sary', 'daniela', 'copper'); el login normaliza.
  username        text primary key,
  -- Correo ya verificado con un código. Null hasta el primer cambio.
  email           text,
  -- 'scrypt$<salt hex>$<hash hex>'. Null => todavía usa la contraseña del entorno.
  password_hash   text,
  -- Correo a la espera de verificación, junto con el código en curso.
  pending_email   text,
  code_hash       text,
  code_expires_at timestamptz,
  code_attempts   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Un correo no puede quedar asociado a dos cuentas.
create unique index if not exists admin_users_email_idx
  on public.admin_users (lower(email)) where email is not null;

-- Igual que el resto de tablas: RLS activo sin políticas, solo entra la
-- service-role key desde el servidor.
alter table public.admin_users enable row level security;
