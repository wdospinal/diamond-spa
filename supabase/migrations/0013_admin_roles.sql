-- Tres roles para el panel: recepcionista, ads_manager y superadmin.
--
-- Sustituye al booleano `is_superadmin` de la migración 0010. La columna
-- antigua se conserva y la app la sigue escribiendo (true solo para
-- superadmin), de modo que una versión anterior desplegada en paralelo durante
-- el despliegue no pierda el privilegio.

alter table public.admin_users
  add column if not exists role text not null default 'recepcionista';

-- Backfill desde el booleano antes de exigir el check.
update public.admin_users
set role = case when is_superadmin then 'superadmin' else 'recepcionista' end,
    updated_at = now()
where role is null or role not in ('recepcionista', 'ads_manager', 'superadmin');

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('recepcionista', 'ads_manager', 'superadmin'));
