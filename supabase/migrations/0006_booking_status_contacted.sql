-- Añade el estado 'contacted' a bookings.status.
-- El check original (0001_init.sql) solo permitía pending/arrived/cancelled/completed.

alter table if exists public.bookings
  drop constraint if exists bookings_status_check;

alter table if exists public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'contacted', 'arrived', 'completed', 'cancelled'));
