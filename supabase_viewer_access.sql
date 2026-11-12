-- ============================================================
-- SUPERSEDED. DO NOT RUN THIS FILE. Run supabase_access.sql instead.
--
-- This file used to define who is on the team, and it shipped with the
-- example address 'YOUR_ADMIN_EMAIL@example.com' as the entire list.
-- Every table in the project checks that list, so running this file as
-- written locks out the whole team.
--
-- It also only covered the five original tables, and it left reads open
-- to anyone who signed in, which with magic-link sign-in means anyone
-- with any email address.
--
-- supabase_access.sql replaces it completely: one file, every table,
-- real addresses for the team, the KP partners as read-only viewers.
--
-- The contents of this file are deliberately gone rather than commented
-- out, so that nobody can run it by accident. Running it now does
-- nothing except print the line below.
-- ============================================================

do $$
begin
  raise notice 'This file is superseded and did nothing. Run supabase_access.sql instead.';
end $$;
