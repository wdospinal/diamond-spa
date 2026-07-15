-- Add tracking fields to bookings table for offline conversion tracking
alter table public.bookings
  add column if not exists gclid text,
  add column if not exists adgroup text;
