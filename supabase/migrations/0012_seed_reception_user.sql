-- Cuenta de recepción para el panel de administración.
--
-- Empieza con la contraseña temporal `change-this-password`, con su propio
-- salt y compatible con verifyPasswordHash() en src/lib/admin-users.ts. Debe
-- cambiarse desde /admin/account.
--
-- ON CONFLICT DO NOTHING mantiene la migración idempotente y evita restaurar
-- la contraseña temporal si la cuenta ya cambió la suya.

insert into public.admin_users (username, password_hash)
values
  (
    'reception',
    'scrypt$b25737b85e6d1d2c0b37edcff3610a2a$3c971eb3282fa2f87dc32f1b583b5325c8df52385e2773617938c3cc15dea4ec6c935b0fada2d954e22498f212dba89bfac8682ba4bf3f80d2870c3b53c4f352'
  )
on conflict (username) do nothing;
