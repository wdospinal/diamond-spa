-- Cuentas iniciales del panel de administración.
--
-- Todas empiezan con la contraseña temporal `change-this-password`. Cada hash
-- usa un salt distinto y es compatible con verifyPasswordHash() en
-- src/lib/admin-users.ts. Las usuarias deben cambiarla desde /admin/account.
--
-- ON CONFLICT DO NOTHING hace esta migración idempotente y, sobre todo, evita
-- restaurar la contraseña temporal si una cuenta ya cambió la suya.

insert into public.admin_users (username, password_hash)
values
  (
    'sary',
    'scrypt$3956323db0951da4592cf7f0aa3a307e$68f0f15e763729d95a347318a3b418533be8480eb048c1e935bd6e5022babe948b5b88bbc665584250884ca8e4e90dc187a1375c7fcf9773cfdffcab399a9494'
  ),
  (
    'daniela',
    'scrypt$1ab90e1158257ebbc4612853e15836a4$290575053ebdeaac74e29730acf9204d9d7d2764da2b7ddea66e1c6610e6ce1559cacaf4d0e053554a40c4c3053f8a8cd71229866777e38a01bf2e4a507182da'
  ),
  (
    'copper',
    'scrypt$85a567755b222ac8fa9846fb8a95755d$27a61e30d9d2be9af11e2c43db38b8a3895533a4206d05fbcc089732167c79ce21e5978f773f5d401c4f7c7798747e2b9394e0497bec53b25dd0e0ec63eb1a06'
  ),
  (
    'daniel',
    'scrypt$0227b29894736cebfa7b96faa3881c6e$d1c4c95535115cac13fcb536ce3bbdfeefef1115ccd9a1aff58d84d1d252922648b4672592825a3cb6923fa2552a29a466e9ad2877b49de9442dd2428dd626ce'
  ),
  (
    'prueba',
    'scrypt$c8b7225e49bd21c02f254893ba6466ec$3e5549c400b5ea020ff56d36171ff6052be89aed9d18f6bb63cc7aafb26d267b103d638532c588b289b010d9ed0bee71f02f9415c03b512d24b7cc194fd69f88'
  )
on conflict (username) do nothing;
