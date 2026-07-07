-- Audit fixes for the self-learning module.
-- completed_at: set once when a lesson transitions to completed, so weekly
-- stats stop counting updated_at rewrites from telemetry flushes.
begin;

alter table student_progress add column if not exists completed_at timestamptz;

-- Backfill: existing completed rows get their last update as the best guess.
update student_progress set completed_at = updated_at
  where status = 'completed' and completed_at is null;

-- flashcard_count: number of revision cards a note yields, written at generation
-- time so Learn Home's due-card count never has to pull note content.
alter table concept_artifacts add column if not exists flashcard_count int;

commit;
