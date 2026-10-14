-- ============================================================
-- Benefits Interview Kit — Supabase schema
-- Paste this whole file into the Supabase SQL editor and run it once.
-- (Supabase dashboard -> SQL Editor -> New query -> paste -> Run)
-- ============================================================

-- Interviews: the shared database. One row per interview.
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  interviewer text,                 -- who ran it
  interview_date text,              -- free text like "10/13"
  who text,                         -- role/context, no real name
  plan text,                        -- current insurance
  got_it text,                      -- how they got the plan
  awareness text,                   -- coverage awareness
  last_use text,                    -- last time they used it
  services text,                    -- services used most
  benefits_want text,               -- benefits they want
  top_benefit text,                 -- single top benefit
  workaround text,                  -- what they do instead
  friction text,                    -- pain point
  surprise text,                    -- one surprise
  quote text,                       -- best verbatim quote
  followup text,                    -- follow-up needed
  bullseye text,                    -- tag: aging-off / first-time / medi-cal / other
  status text default 'logged',     -- logged / needs-followup / done
  transcript text                   -- optional raw transcript kept for reference
);

-- Question sets: shared across the team.
create table if not exists question_sets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  name text not null,
  question_ids text[] not null default '{}',
  note text
);

-- ============================================================
-- Row Level Security: any signed-in team member can read/write.
-- (Simple model for a small trusted team. Tighten later if needed.)
-- ============================================================
alter table interviews enable row level security;
alter table question_sets enable row level security;

drop policy if exists "team read interviews" on interviews;
drop policy if exists "team write interviews" on interviews;
drop policy if exists "team update interviews" on interviews;
drop policy if exists "team delete interviews" on interviews;
create policy "team read interviews"   on interviews for select using (auth.role() = 'authenticated');
create policy "team write interviews"  on interviews for insert with check (auth.role() = 'authenticated');
create policy "team update interviews" on interviews for update using (auth.role() = 'authenticated');
create policy "team delete interviews" on interviews for delete using (auth.role() = 'authenticated');

drop policy if exists "team read sets" on question_sets;
drop policy if exists "team write sets" on question_sets;
drop policy if exists "team update sets" on question_sets;
drop policy if exists "team delete sets" on question_sets;
create policy "team read sets"   on question_sets for select using (auth.role() = 'authenticated');
create policy "team write sets"  on question_sets for insert with check (auth.role() = 'authenticated');
create policy "team update sets" on question_sets for update using (auth.role() = 'authenticated');
create policy "team delete sets" on question_sets for delete using (auth.role() = 'authenticated');

-- Realtime so everyone sees changes live.
alter publication supabase_realtime add table interviews;
alter publication supabase_realtime add table question_sets;
