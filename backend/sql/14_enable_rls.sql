-- Enable RLS on every public table that was exposed to PostgREST without it
-- (flagged by Supabase advisors before beta). The anon key ships in the
-- frontend bundle, so with RLS off anyone could read/write these tables via
-- the auto-generated REST API. No legitimate path is affected: the frontend
-- uses Supabase only for auth, and the backend uses the service-role key,
-- which bypasses RLS. Applied to the live project 2026-07-20.
alter table public.program_outcomes enable row level security;
alter table public.psos enable row level security;
alter table public.course_outcomes enable row level security;
alter table public.co_mappings enable row level security;
alter table public.units enable row level security;
alter table public.topics enable row level security;
alter table public.subtopics enable row level security;
alter table public.co_library enable row level security;
alter table public.library_sources enable row level security;
alter table public.subtopic_sources enable row level security;
alter table public.uploads enable row level security;
alter table public.artifacts enable row level security;
alter table public.announcements enable row level security;
alter table public.settings enable row level security;
alter table public.artifact_units enable row level security;
alter table public.course_scope_patches enable row level security;
alter table public.concept_artifacts enable row level security;
alter table public.student_progress enable row level security;
alter table public.concept_artifact_versions enable row level security;
alter table public.materials enable row level security;
alter table public.material_chunks enable row level security;
alter table public.topic_materials enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.learner_state enable row level security;
alter table public.learn_events enable row level security;
alter table public.validator_outcomes enable row level security;
