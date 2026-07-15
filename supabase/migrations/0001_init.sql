-- Diamond Spa — initial Supabase schema.
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → paste → Run),
-- or with the Supabase CLI: `supabase db push`.
--
-- All access goes through the Next.js API routes using the service-role key,
-- which bypasses RLS. RLS is enabled with NO policies so the public anon key
-- (if it ever leaks into the client) can read/write nothing.

-- ─── Bookings (reservas made by users on /book) ──────────────────────────────

create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  -- YYYY-MM-DD session date as chosen on the calendar (Bogota civil date)
  date_key         text not null,
  time_slot        text not null,
  scheduled_at     timestamptz not null,
  service_id       text not null,
  service_name     text not null,
  -- 30 / 60 / 90 — null for flat-rate and wax/machine services
  duration_minutes int,
  -- 'wax' | 'machine' — only for hair-removal services
  hair_method      text,
  price_cop        numeric not null,
  -- USD equivalent at booking time (used by dashboard stats)
  price_usd        numeric not null,
  duration         text not null,
  name             text,
  -- legacy split-name fields, kept so older records still render
  first_name       text,
  last_name        text,
  email            text,
  phone            text not null,
  requests         text,
  status           text check (status in ('pending', 'arrived', 'cancelled', 'completed')),
  payment_status   text check (payment_status in ('pending', 'paid')),
  source           text check (source in ('organic', 'ads'))
);

create index if not exists bookings_date_key_idx     on public.bookings (date_key);
create index if not exists bookings_scheduled_at_idx on public.bookings (scheduled_at);
create index if not exists bookings_created_at_idx   on public.bookings (created_at);

-- ─── Blog posts (admin-authored content) ─────────────────────────────────────
-- Full BlogPost object lives in `data`; generated columns expose the fields
-- worth filtering on in the Supabase table editor.

create table if not exists public.blog_posts (
  -- app-generated id; usually a UUID but not guaranteed (legacy/seed rows), so text
  id           text primary key,
  data         jsonb not null,
  slug         text generated always as (data->>'slug') stored,
  is_draft     boolean generated always as ((data->>'isDraft')::boolean) stored,
  published_at text generated always as (data->>'publishedAt') stored,
  updated_at   timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

-- ─── Landing page configs (SEO / SEM / content blocks) ───────────────────────

create table if not exists public.landings (
  -- app-generated id; usually a UUID but not guaranteed (legacy/seed rows), so text
  id         text primary key,
  data       jsonb not null,
  path       text generated always as (data->>'path') stored,
  is_active  boolean generated always as ((data->>'isActive')::boolean) stored,
  updated_at timestamptz not null default now()
);

create index if not exists landings_path_idx on public.landings (path);

-- ─── Web-push subscriptions ──────────────────────────────────────────────────

create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

-- ─── Lock everything down (service-role key bypasses RLS) ────────────────────

alter table public.bookings           enable row level security;
alter table public.blog_posts         enable row level security;
alter table public.landings           enable row level security;
alter table public.push_subscriptions enable row level security;
