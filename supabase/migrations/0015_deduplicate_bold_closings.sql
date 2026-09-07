-- Un mismo cierre puede entrar por IMAP y por carga manual con ids distintos.
-- Conservamos una sola fila por turno real y evitamos que vuelva a ocurrir.

with ranked as (
  select
    id,
    row_number() over (
      partition by day, coalesce(from_label, ''), coalesce(to_label, '')
      order by
        case when source = 'imap' then 0 else 1 end,
        received_at asc,
        created_at asc,
        id asc
    ) as duplicate_number
  from public.bold_closings
)
delete from public.bold_closings
where id in (
  select id
  from ranked
  where duplicate_number > 1
);

update public.bold_closings
set
  from_label = coalesce(from_label, ''),
  to_label = coalesce(to_label, '')
where from_label is null or to_label is null;

alter table public.bold_closings
  alter column from_label set default '',
  alter column from_label set not null,
  alter column to_label set default '',
  alter column to_label set not null;

alter table public.bold_closings
  add constraint bold_closings_shift_unique
  unique (day, from_label, to_label);
