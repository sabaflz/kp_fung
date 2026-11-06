-- ============================================================
-- deck_content: editable slide text for the in-app decks.
--   * anyone signed in can READ the text (so partners see edits)
--   * only the team can WRITE it (Edit mode in the deck)
-- One row per deck; `content` is a { path: text } map of overrides.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run. Assumes public.is_team() already exists
-- (from supabase_viewer_access.sql). If it does not, run that file first.
-- ============================================================

create table if not exists public.deck_content (
  deck_id    text primary key,
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.deck_content enable row level security;

-- Clear any previous policies so this file is safe to re-run.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'deck_content'
  loop
    execute format('drop policy if exists %I on public.deck_content', p.policyname);
  end loop;
end $$;

create policy "signed-in can read"
  on public.deck_content for select
  to authenticated
  using (true);

create policy "team can insert"
  on public.deck_content for insert
  to authenticated
  with check (public.is_team());

create policy "team can update"
  on public.deck_content for update
  to authenticated
  using (public.is_team())
  with check (public.is_team());
