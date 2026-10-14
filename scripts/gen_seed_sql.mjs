import { POOL } from '../src/data/pool.js'
import { writeFileSync } from 'node:fs'

const esc = (s) => s.replace(/'/g, "''")

const header = `-- ============================================================
-- Benefits Interview Kit: questions table migration
-- Run this ONCE in the Supabase SQL editor, after the first schema.
-- It creates the shared question pool, lets any signed-in teammate
-- add / edit / delete, turns on live sync, and seeds the starter set.
-- ============================================================

create table if not exists questions (
  id text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  grp text not null default 'Custom',   -- the group/section it belongs to
  body text not null,                    -- the question text
  ord bigint not null default 0          -- sort order
);

alter table questions enable row level security;

drop policy if exists "team read questions" on questions;
drop policy if exists "team write questions" on questions;
drop policy if exists "team update questions" on questions;
drop policy if exists "team delete questions" on questions;
create policy "team read questions"   on questions for select using (auth.role() = 'authenticated');
create policy "team write questions"  on questions for insert with check (auth.role() = 'authenticated');
create policy "team update questions" on questions for update using (auth.role() = 'authenticated');
create policy "team delete questions" on questions for delete using (auth.role() = 'authenticated');

-- Live sync. (If you ever re-run this file, this one line may error
-- because the table is already published, which is harmless.)
alter publication supabase_realtime add table questions;

-- Seed the built-in questions. Safe to re-run: existing ids are skipped.`

const values = POOL
  .map((q, i) => `  ('${esc(q[0])}', '${esc(q[1])}', '${esc(q[2])}', ${i + 1})`)
  .join(',\n')

const seed = `insert into questions (id, grp, body, ord) values\n${values}\non conflict (id) do nothing;\n`

const out = `${header}\n${seed}`
writeFileSync(new URL('../supabase_questions_migration.sql', import.meta.url), out)
console.log('Wrote supabase_questions_migration.sql (' + POOL.length + ' questions seeded)')
