-- Student delivery + faculty revision safety (items 3 + 4).
begin;

-- Per-student reading/quiz progress on published (approved) content.
create table if not exists student_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,          -- profiles/auth id (no FK: demo personas allowed)
  course_id     uuid,
  topic_id      uuid not null,
  concept_id    text not null,          -- C1, C2…
  artifact_type text not null default 'student_notes',
  status        text not null default 'viewed',   -- viewed | completed
  quiz_score    int,
  quiz_total    int,
  updated_at    timestamptz default now()
);
create unique index if not exists student_progress_unique
  on student_progress(user_id, topic_id, concept_id, artifact_type);
create index if not exists student_progress_course on student_progress(user_id, course_id);

-- Version history for concept artifacts: a snapshot is written before every
-- regenerate / revise / restore, so faculty can always roll back.
create table if not exists concept_artifact_versions (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null,
  concept_id    text not null,
  artifact_type text not null,
  version_no    int not null,
  content       jsonb,
  note          text,                   -- e.g. "pre-regenerate", "pre-revise: <instruction>"
  created_at    timestamptz default now()
);
create index if not exists cav_lookup
  on concept_artifact_versions(topic_id, concept_id, artifact_type, version_no desc);

commit;
