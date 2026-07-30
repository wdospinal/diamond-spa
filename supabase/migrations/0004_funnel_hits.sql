-- Sales-funnel analytics storage.
--
-- One row per (day, stage, session) — the primary key makes the insert
-- idempotent, so a visitor refreshing the page cannot inflate the funnel. The
-- dashboard reports unique sessions, i.e. the row count per (day, stage).
--
-- No IP, user-agent, or any other identifier is stored: `session_id` is a
-- random value the browser keeps in sessionStorage and forgets when the tab
-- closes, which keeps this within the "anónimas / anonymous" promise made by
-- the cookie banner.

create table if not exists public.funnel_hits (
  -- YYYY-MM-DD, Bogota civil date (assigned server-side, never trusted from the client)
  day        date not null,
  -- one of the keys in src/lib/funnel-stages.ts
  stage      text not null,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (day, stage, session_id)
);

create index if not exists funnel_hits_day_idx on public.funnel_hits (day);

alter table public.funnel_hits enable row level security;

-- Pre-aggregated counts. PostgREST cannot GROUP BY, so the read path selects
-- from this view instead of pulling every row down to the API route.
create or replace view public.funnel_daily as
  select day, stage, count(*)::int as count
    from public.funnel_hits
   group by day, stage;
