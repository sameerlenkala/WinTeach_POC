-- ============================================================
-- WinTeach — Stage 6 generation migration (pipeline doc §8)
--
-- 1. Recreate the artifact_type enum with the eight POC types.
-- 2. Add gate / version / staleness columns to artifacts.
-- 3. Add per-unit granularity (artifact_units).
-- 4. Add the job phase column + one-active-job-per-topic index.
-- 5. Add the trigger write-back audit trail (course_scope_patches).
--
-- Idempotent where practical; run once against 01_winnify_db.sql.
-- ============================================================

begin;

-- ── 1. Recreate artifact_type enum (no incremental ADD VALUE) ────────────────
-- old: ('notes','preassess','quiz','flash')
-- new: ('topic_plan','student_notes','slides','summary','quiz','assignment',
--       'faculty_diagnostic','flashcards')
-- rename mapping: notes→student_notes, preassess→faculty_diagnostic, flash→flashcards

alter type artifact_type rename to artifact_type_old;

create type artifact_type as enum (
  'topic_plan', 'student_notes', 'slides', 'summary',
  'quiz', 'assignment', 'faculty_diagnostic', 'flashcards'
);

alter table artifacts
  alter column type type artifact_type
  using (
    case type::text
      when 'notes'     then 'student_notes'
      when 'preassess' then 'faculty_diagnostic'
      when 'flash'     then 'flashcards'
      when 'quiz'      then 'quiz'
      else 'student_notes'
    end
  )::artifact_type;

drop type artifact_type_old;

-- ── 2. Gates, versions, and propagation on artifacts (§8.2) ──────────────────
alter table artifacts add column if not exists gate_type            text;                       -- validate|approve|structural_review|review
alter table artifacts add column if not exists review_status        text default 'pending';     -- pending|validated|approved|shipped|released|revise_requested|error
alter table artifacts add column if not exists validation           jsonb;                      -- code-validator results (model gate object never stored)
alter table artifacts add column if not exists finalized_at         timestamptz;
alter table artifacts add column if not exists finalized_by         uuid references profiles(id);

alter table artifacts add column if not exists artifact_version     text;
alter table artifacts add column if not exists content_hash         text;                       -- scope_hash for topic_plan
alter table artifacts add column if not exists derived_from_version text;
alter table artifacts add column if not exists derived_from_hash    text;
alter table artifacts add column if not exists is_stale             boolean default false;

-- ── 3. Per-unit granularity: generation, approval, staleness at this grain ───
create table if not exists artifact_units (
  id              uuid primary key default gen_random_uuid(),
  artifact_id     uuid references artifacts(id) on delete cascade,
  concept_id      text not null,                 -- C1, C2… orchestrator-assigned
  content_type    text not null,                 -- P1..P5 (assigned once; inherited everywhere)
  flags           jsonb not null,                -- derived generation flags (frozen at plan validation)
  unit_hash       text,                          -- canonical hash of this unit's content
  approval_status text default 'pending',        -- pending|validated|approved|revise_requested|error
  approved_by     uuid references profiles(id),
  approved_at     timestamptz,
  created_at      timestamptz default now()
);
create index if not exists artifact_units_artifact on artifact_units(artifact_id);

-- ── 4. Job phase + one active job per topic (§6) ─────────────────────────────
alter table generation_jobs add column if not exists phase text;
-- generating_topic_plan | topic_plan_validate | generating_notes_units | unit_validate
-- | unit_approve | notes_assembled | generating_fanout | fanout_review | ready | error

create unique index if not exists one_active_job_per_topic
  on generation_jobs(topic_id)
  where status not in ('done', 'failed');

-- ── 5. Trigger write-back audit trail (§3.7) ─────────────────────────────────
create table if not exists course_scope_patches (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references courses(id) on delete cascade,
  topic_id        uuid references topics(id) on delete cascade,
  patch           jsonb not null,                -- JSON-patch style, per-field / per-concept
  classification  text not null,                 -- editorial|scope_substantive|content_substantive (path-whitelist, code-assigned)
  author          uuid references profiles(id),
  applied_at      timestamptz default now(),
  before_snapshot jsonb,
  after_snapshot  jsonb
);
create index if not exists course_scope_patches_topic on course_scope_patches(topic_id);

commit;
