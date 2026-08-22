-- Update status check constraint on bookings table to support the 5 Kanban stages:
-- 'pending' (Nuevo Lead)
-- 'contacted' (En Conversación / Cotizando)
-- 'arrived' (Cita Agendada / Cualificado)
-- 'completed' (Servicio Pagado / Venta)
-- 'cancelled' (Cancelado / Perdido)

alter table if exists public.bookings drop constraint if exists bookings_status_check;
alter table if exists public.bookings add constraint bookings_status_check check (status in ('pending', 'contacted', 'arrived', 'completed', 'cancelled'));
