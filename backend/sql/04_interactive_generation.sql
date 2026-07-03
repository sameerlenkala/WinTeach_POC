-- ============================================================
-- WinTeach — interactive generation studio (per-subtopic control + cost)
--
-- Reshapes Stage-6 from a batch pipeline into an on-demand studio:
--   - concept-level artifacts (notes/slides/quiz) generated per subtopic
--   - per-job + per-artifact token/cost tracking
-- Additive only. Fresh setup order: 01 → 02 → 03 → 04.
-- ============================================================

begin;

-- Concept-level artifacts: one row per (topic, concept, artifact_type).
create table if not exists concept_artifacts (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references generation_jobs(id) on delete cascade,
  topic_id        uuid references topics(id) on delete cascade,
  concept_id      text not null,                       -- C1, C2…
  artifact_type   text not null,                       -- student_notes | slides | quiz
  content         jsonb,
  status          text default 'not_generated',        -- not_generated | generating | ready | error
  approval_status text default 'pending',              -- pending | approved
  token_count     int default 0,
  cost_usd        numeric default 0,
  error           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create unique index if not exists concept_artifacts_unique
  on concept_artifacts(topic_id, concept_id, artifact_type);
create index if not exists concept_artifacts_job on concept_artifacts(job_id);

-- Per-job cost roll-up + upfront estimate.
alter table generation_jobs add column if not exists token_count  int default 0;
alter table generation_jobs add column if not exists cost_usd      numeric default 0;
alter table generation_jobs add column if not exists est_cost_usd  numeric;

-- Per-(topic) artifact cost (topic-level artifacts already have token_count).
alter table artifacts add column if not exists cost_usd numeric;

commit;

select 'interactive-generation migration applied' as status;
