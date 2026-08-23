-- Privilegio para administrar cuentas del panel.
--
-- El valor por defecto es false para que toda cuenta nueva tenga los permisos
-- normales. Las operaciones privilegiadas vuelven a leer este valor de la base
-- de datos; no se copia a la cookie de sesión.

alter table public.admin_users
  add column if not exists is_superadmin boolean not null default false;

-- Bootstrap del primer superadmin. Esta actualización no toca su contraseña,
-- correo ni ningún cambio de contraseña que esté en curso.
update public.admin_users
set is_superadmin = true,
    updated_at = now()
where username = 'daniel';
