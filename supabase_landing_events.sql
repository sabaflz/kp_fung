-- ============================================================
-- landing_events: how people move through the flyer landing page
--
-- One row per thing someone does: arriving, opening a section,
-- starting the survey, leaving an email. Enough to measure interest
-- without tracking anybody.
--
-- WHAT IS DELIBERATELY NOT STORED: no IP address, no user agent, no
-- cookie, no fingerprint, nothing that identifies a person or follows
-- them anywhere else. `session` is a random id made in the browser that
-- lives until the tab is closed, and exists only so a click can be tied
-- to the visit it came from.
--
-- ANYONE can insert, because the landing page is public and has no
-- sign-in. Only the TEAM can read, so partners see the funnel on the
-- dashboard and nothing more.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run. Requires public.is_team() from supabase_access.sql.
-- ============================================================

create table if not exists public.landing_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session     text not null,            -- random per visit, not per person
  source      text,                     -- ?src= value: instagram, discord, supervised...
  event       text not null,            -- view | cta | survey | email | expand
  label       text,                     -- which call to action
  ms          integer,                  -- milliseconds from page load to this event
  variant     text                      -- reserved, for testing two flyers later
);

create index if not exists landing_events_created_idx on public.landing_events (created_at desc);
create index if not exists landing_events_session_idx on public.landing_events (session);
create index if not exists landing_events_source_idx  on public.landing_events (source);

alter table public.landing_events enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'landing_events'
  loop
    execute format('drop policy if exists %I on public.landing_events', p.policyname);
  end loop;
end $$;

-- The landing page is public, so an anonymous visitor must be able to record.
create policy "anyone can record"
  on public.landing_events for insert
  to anon, authenticated
  with check (true);

create policy "team can read"
  on public.landing_events for select
  to authenticated
  using (public.is_team());

create policy "team can delete"
  on public.landing_events for delete
  to authenticated
  using (public.is_team());

-- ============================================================
-- CHECK IT WORKED. Expect 0 rows and 3 policies.
-- ============================================================
select
  (select count(*) from public.landing_events) as rows_so_far,
  (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'landing_events') as policies;

-- ============================================================
-- USEFUL LATER
--
-- The funnel, by where the traffic came from:
--   select source,
--          count(*) filter (where event = 'view')   as visits,
--          count(*) filter (where event = 'cta')    as clicks,
--          count(*) filter (where event = 'survey') as started_survey,
--          count(*) filter (where event = 'email')  as left_email
--   from public.landing_events group by source order by visits desc;
--
-- Which call to action pulls:
--   select label, count(*) from public.landing_events
--   where event = 'cta' group by label order by count desc;
--
-- Clear test traffic before going live:
--   delete from public.landing_events where source = 'test';
-- ============================================================
