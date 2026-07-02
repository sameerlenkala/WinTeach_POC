-- ============================================================
-- WinTeach — app-compat migration
--
-- The backend services + frontend were written against an evolved schema
-- that 01_winnify_db.sql never captured (PGRST204 "column not found" on
-- course create / syllabus commit). This migration adds the columns the
-- application code actually reads/writes. Additive only — the original
-- columns stay for anything already using them.
-- Fresh setup order: 01 → 02 → 03.
-- ============================================================

begin;

-- courses: code writes faculty_id / semester (text) / structure_locked
alter table courses add column if not exists faculty_id uuid references profiles(id);
alter table courses add column if not exists semester text;
alter table courses add column if not exists structure_locked boolean default false;

-- units: code writes hours (schema had contact_hours)
alter table units add column if not exists hours numeric;

-- topics: code writes "order" + bloom_level text (schema had sort_order / bloom_target int)
alter table topics add column if not exists "order" int;
alter table topics add column if not exists bloom_level text;

-- subtopics: code orders by "order" (schema had sort_order)
alter table subtopics add column if not exists "order" int;

-- course_outcomes: code writes description + bloom_level as a text label
-- (the original text column stays for 01-schema rows but can't be required)
alter table course_outcomes add column if not exists description text;
alter table course_outcomes alter column text drop not null;
alter table course_outcomes alter column bloom_level type text using bloom_level::text;

-- co_mappings: code keys by course_id and writes po_code/pso_code/level
-- (schema had only co_id/outcome_code/weight)
alter table co_mappings add column if not exists course_id uuid references courses(id) on delete cascade;
alter table co_mappings add column if not exists po_code text;
alter table co_mappings add column if not exists pso_code text;
alter table co_mappings add column if not exists level int;

-- uploads: commit + extraction-status fields the code writes/reads, plus the
-- filename + institute_id the dashboard selects/filters on
alter table uploads add column if not exists committed_to_course uuid references courses(id);
alter table uploads add column if not exists committed_by uuid references profiles(id);
alter table uploads add column if not exists error_message text;
alter table uploads add column if not exists filename text;
alter table uploads add column if not exists institute_id uuid references institutes(id);

-- invites: code writes accepted_by on accept
alter table invites add column if not exists accepted_by uuid references profiles(id);

-- co_library: library feature is built around description/domain/tags
alter table co_library add column if not exists description text;
alter table co_library add column if not exists domain text;
alter table co_library add column if not exists tags jsonb default '[]'::jsonb;

-- library_sources: code writes/reads added_by
alter table library_sources add column if not exists added_by uuid references profiles(id);

-- settings: code scopes by institute_id/scope and stamps updated_by
alter table settings add column if not exists institute_id uuid references institutes(id);
alter table settings add column if not exists scope text;
alter table settings add column if not exists updated_by uuid references profiles(id);

commit;

select 'app-compat migration applied' as status;
