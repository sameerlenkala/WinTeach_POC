-- Self-Learning module (P1 + P2): quiz attempt history, flashcard SRS,
-- learner resume/goal state, analytics events. All keyed by user_id from the
-- JWT (no FK — demo personas allowed, matching student_progress).
begin;

-- Full quiz attempts (not just the best score kept on student_progress).
create table if not exists quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  course_id    uuid,
  topic_id     uuid not null,
  concept_id   text not null,
  attempt_no   int  not null default 1,
  score        int  not null,
  total        int  not null,
  answers      jsonb,                 -- [{q_index, picked, correct}]
  duration_sec int,
  created_at   timestamptz default now()
);
create index if not exists quiz_attempts_user
  on quiz_attempts(user_id, concept_id, attempt_no desc);
create index if not exists quiz_attempts_course
  on quiz_attempts(user_id, course_id);

-- Spaced-repetition state, one row per (user, flashcard). SM-2-lite: bucket
-- 0..4 maps to review intervals [0, 1, 3, 7, 21] days.
create table if not exists flashcard_reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  course_id   uuid,
  topic_id    uuid not null,
  concept_id  text not null,
  card_key    text not null,          -- `${concept_id}:fc:${index}` — stable
  bucket      int  not null default 0,
  due_at      timestamptz not null default now(),
  reviews     int  not null default 0,
  lapses      int  not null default 0,
  updated_at  timestamptz default now()
);
create unique index if not exists flashcard_reviews_unique
  on flashcard_reviews(user_id, card_key);
create index if not exists flashcard_reviews_due
  on flashcard_reviews(user_id, due_at);

-- One row per learner: last position (resume) and weekly goal. Streak/XP
-- fields intentionally omitted — gamification is deferred.
create table if not exists learner_state (
  user_id             uuid primary key,
  resume_course_id    uuid,
  resume_topic_id     uuid,
  resume_concept_id   text,
  resume_scroll_pct   int  default 0,
  weekly_goal_minutes int  default 90,
  updated_at          timestamptz default now()
);

-- Append-only analytics events (batched from the client).
create table if not exists learn_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  event      text not null,
  props      jsonb,
  ts         timestamptz default now()
);
create index if not exists learn_events_user on learn_events(user_id, ts desc);

-- Reading telemetry added to student_progress for scroll+dwell completion.
alter table student_progress add column if not exists scroll_pct int default 0;
alter table student_progress add column if not exists dwell_sec  int default 0;

commit;
