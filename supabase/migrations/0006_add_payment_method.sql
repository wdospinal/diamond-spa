-- Agrega el método de pago (efectivo, transferencia, tarjeta) a las reservas.
-- Solo tiene sentido cuando payment_status = 'paid'; se deja NULL en cualquier
-- otro caso, por eso el constraint permite NULL explícitamente.

alter table if exists public.bookings add column if not exists payment_method text;
alter table if exists public.bookings drop constraint if exists bookings_payment_method_check;
alter table if exists public.bookings add constraint bookings_payment_method_check check (payment_method is null or payment_method in ('efectivo', 'transferencia', 'tarjeta'));
