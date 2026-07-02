-- ============================================================
-- WINNIFY DB — Complete Schema
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "vector";   -- for CO Library similarity search

-- ── Enums ───────────────────────────────────────────────────
create type user_role as enum ('student', 'superadmin', 'admin', 'faculty');
create type course_status as enum ('draft', 'active', 'archived');
create type topic_status as enum ('pending', 'generating', 'ready');
create type artifact_type as enum ('notes', 'preassess', 'quiz', 'flash');
create type job_status as enum ('queued', 'running', 'done', 'failed');
create type upload_status as enum ('uploading', 'extracting', 'review', 'committed', 'failed');
create type pso_scope as enum ('common', 'major');
create type invite_status as enum ('pending', 'accepted', 'expired');
create type co_state as enum ('well-formed', 'vague', 'wrong-level', 'absent-inferred', 'absent-minimal');

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null unique,
  role          user_role not null default 'student',
  institute_id  uuid,                          -- null for superadmin
  avatar_url    text,
  phone         text,
  designation   text,                          -- "HOD - CSE", "Faculty - ECE" etc.
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on Supabase signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- 2. INSTITUTES (colleges on the platform)
-- ============================================================
create table institutes (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  short          text not null,                -- e.g. "VJIT", "CIET"
  type           text default 'Engineering College',
  location       text,
  regulation     text,                         -- e.g. "CIET R24", "JNTU R20"
  accreditation  text,                         -- e.g. "NBA / NAAC"
  status         text default 'active',
  subscription   text default 'trial',         -- trial | basic | pro
  created_by     uuid references profiles(id),
  created_at     timestamptz default now()
);

-- FK back to institutes (after table exists)
alter table profiles
  add constraint profiles_institute_id_fkey
  foreign key (institute_id) references institutes(id) on delete set null;

-- ============================================================
-- 3. PROGRAM OUTCOMES (PO) — institute level
-- ============================================================
create table program_outcomes (
  id            uuid primary key default gen_random_uuid(),
  institute_id  uuid not null references institutes(id) on delete cascade,
  code          text not null,   -- PO1, PO2 …
  text          text not null,
  sort_order    int default 0
);

-- ============================================================
-- 4. PSOs — programme-specific outcomes
-- ============================================================
create table psos (
  id            uuid primary key default gen_random_uuid(),
  institute_id  uuid not null references institutes(id) on delete cascade,
  code          text not null,   -- PSO1, PSO2 …
  text          text not null,
  scope         pso_scope not null default 'common',
  major         text,            -- "CSE", "ECE" — null when scope='common'
  sort_order    int default 0
);

-- ============================================================
-- 5. COURSES
-- ============================================================
create table courses (
  id            uuid primary key default gen_random_uuid(),
  institute_id  uuid references institutes(id) on delete set null,
  created_by    uuid references profiles(id),  -- faculty who created it
  code          text not null,
  name          text not null,
  program       text,            -- "B.Tech CSE"
  major         text,            -- "CSE"
  sem           int,
  credits       int,
  regulation    text,
  lab_flag      boolean default false,
  status        course_status default 'draft',
  syllabus_url  text,            -- Supabase Storage path
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- 6. COURSE OUTCOMES (CO)
-- ============================================================
create table course_outcomes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  co_number     int not null,
  text          text not null,
  bloom_level   int,             -- 1=Remember … 6=Create
  bloom_label   text,            -- "Understand", "Apply" etc.
  state         co_state default 'well-formed',
  sort_order    int default 0
);

-- ============================================================
-- 7. CO ↔ PO / PSO MAPPING (many-to-many)
-- ============================================================
create table co_mappings (
  id            uuid primary key default gen_random_uuid(),
  co_id         uuid not null references course_outcomes(id) on delete cascade,
  outcome_code  text not null,   -- "PO1", "PSO2" etc.
  weight        int default 0    -- 0=none, 1=low, 2=medium, 3=high
);
create unique index co_mappings_unique on co_mappings(co_id, outcome_code);

-- ============================================================
-- 8. UNITS
-- ============================================================
create table units (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  unit_number   text not null,   -- "I", "II", "III" or "E" for electives
  title         text not null,
  contact_hours int,
  sort_order    int default 0
);

-- ============================================================
-- 9. TOPICS
-- ============================================================
create table topics (
  id               uuid primary key default gen_random_uuid(),
  unit_id          uuid not null references units(id) on delete cascade,
  title            text not null,
  bloom_target     int,          -- target Bloom level for generation
  bloom_label      text,
  co_id            uuid references course_outcomes(id),
  complexity_score int,          -- 1–5 (4-signal weighted avg)
  contact_hours    numeric(4,1),
  status           topic_status default 'pending',
  sort_order       int default 0
);

-- ============================================================
-- 10. SUBTOPICS
-- ============================================================
create table subtopics (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references topics(id) on delete cascade,
  title         text not null,
  sort_order    int default 0
);

-- ============================================================
-- 11. CO LIBRARY (reusable COs across courses)
-- ============================================================
create table co_library (
  id            uuid primary key default gen_random_uuid(),
  institute_id  uuid references institutes(id),  -- null = global
  text          text not null,
  bloom_level   int,
  bloom_label   text,
  subject_area  text,
  usage_count   int default 0,
  embedding     vector(1536),    -- for similarity search
  created_at    timestamptz default now()
);

-- ============================================================
-- 12. LIBRARY SOURCES (books / references)
-- ============================================================
create table library_sources (
  id            uuid primary key default gen_random_uuid(),
  institute_id  uuid references institutes(id),
  title         text not null,
  authors       text,
  publisher     text,
  year          int,
  category      text,            -- "AI", "Industry", "Textbook"
  url           text,
  created_at    timestamptz default now()
);

-- Subtopic → source reference
create table subtopic_sources (
  subtopic_id   uuid references subtopics(id) on delete cascade,
  source_id     uuid references library_sources(id) on delete cascade,
  primary key (subtopic_id, source_id)
);

-- ============================================================
-- 13. UPLOADS (syllabus files)
-- ============================================================
create table uploads (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid references courses(id),
  uploaded_by       uuid references profiles(id),
  file_url          text not null,   -- Supabase Storage path
  file_type         text,            -- "pdf" | "docx"
  file_size         int,
  status            text default 'uploading',   -- free text: uploading|processing|done|committed|failed

  extraction_result jsonb,           -- full structured result with confidence
  committed_at      timestamptz,
  created_at        timestamptz default now()
);

-- ============================================================
-- 14. GENERATION JOBS
-- ============================================================
create table generation_jobs (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references topics(id) on delete cascade,
  triggered_by  uuid references profiles(id),
  status        job_status default 'queued',
  path          text,             -- "A" (retrieval) | "B" (elicitation)
  error_msg     text,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz default now()
);

-- ============================================================
-- 15. ARTIFACTS (4 types per topic)
-- ============================================================
create table artifacts (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references generation_jobs(id) on delete cascade,
  topic_id      uuid not null references topics(id) on delete cascade,
  type          artifact_type not null,
  progress      int default 0,   -- 0–100
  content       jsonb,           -- generated content
  word_count    int,
  token_count   int,
  model_used    text,
  generated_at  timestamptz,
  created_at    timestamptz default now()
);
create unique index artifacts_unique on artifacts(topic_id, type);

-- ============================================================
-- 16. INVITES (for superadmin / admin inviting users)
-- ============================================================
create table invites (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  role          user_role not null,
  institute_id  uuid references institutes(id),
  invited_by    uuid references profiles(id),
  token         text unique default encode(gen_random_bytes(32), 'hex'),
  status        invite_status default 'pending',
  expires_at    timestamptz default (now() + interval '7 days'),
  accepted_at   timestamptz,
  created_at    timestamptz default now()
);

-- ============================================================
-- 17. PLATFORM TABLES (superadmin only)
-- ============================================================
create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references profiles(id),
  action        text not null,   -- "created_course", "invited_user" etc.
  entity_type   text,
  entity_id     uuid,
  metadata      jsonb,
  created_at    timestamptz default now()
);

create table announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text,
  target_role   user_role,       -- null = all roles
  institute_id  uuid references institutes(id),  -- null = all institutes
  published_at  timestamptz,
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);

create table settings (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  key           text not null,
  value         jsonb,
  updated_at    timestamptz default now(),
  unique(owner_id, key)
);

-- ============================================================
-- 18. ROW LEVEL SECURITY
-- ============================================================

-- Helper: get role of current user
-- security definer + pinned search_path so the internal read of `profiles`
-- bypasses RLS — otherwise the profiles policies (which call auth_role) recurse.
create or replace function auth_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: get institute_id of current user
create or replace function auth_institute() returns uuid
  language sql stable security definer set search_path = public as $$
  select institute_id from public.profiles where id = auth.uid();
$$;

-- profiles
alter table profiles enable row level security;
create policy "users see own profile"
  on profiles for select using (id = auth.uid() or auth_role() in ('superadmin', 'admin'));
create policy "users update own profile"
  on profiles for update using (id = auth.uid());
create policy "superadmin full access"
  on profiles for all using (auth_role() = 'superadmin');

-- institutes
alter table institutes enable row level security;
create policy "superadmin sees all"
  on institutes for all using (auth_role() = 'superadmin');
create policy "admin sees own institute"
  on institutes for select using (id = auth_institute() and auth_role() = 'admin');
create policy "faculty sees own institute"
  on institutes for select using (id = auth_institute() and auth_role() = 'faculty');

-- courses
alter table courses enable row level security;
create policy "superadmin all"
  on courses for all using (auth_role() = 'superadmin');
create policy "admin sees institute courses"
  on courses for all using (institute_id = auth_institute() and auth_role() = 'admin');
create policy "faculty sees own courses"
  on courses for all using (created_by = auth.uid() and auth_role() = 'faculty');

-- generation_jobs
alter table generation_jobs enable row level security;
create policy "faculty sees own jobs"
  on generation_jobs for all using (triggered_by = auth.uid());
create policy "admin sees institute jobs"
  on generation_jobs for select using (auth_role() in ('admin', 'superadmin'));

-- invites
alter table invites enable row level security;
create policy "superadmin manages all invites"
  on invites for all using (auth_role() = 'superadmin');
create policy "admin manages institute invites"
  on invites for all using (
    institute_id = auth_institute() and auth_role() = 'admin'
  );

-- audit_logs
alter table audit_logs enable row level security;
create policy "superadmin sees all logs"
  on audit_logs for select using (auth_role() = 'superadmin');
create policy "admin sees institute logs"
  on audit_logs for select using (auth_role() = 'admin');

-- ============================================================
-- 19. INDEXES
-- ============================================================
create index on courses(institute_id);
create index on courses(created_by);
create index on course_outcomes(course_id);
create index on units(course_id);
create index on topics(unit_id);
create index on subtopics(topic_id);
create index on generation_jobs(topic_id);
create index on generation_jobs(status);
create index on artifacts(topic_id);
create index on invites(token);
create index on invites(email);
create index on audit_logs(actor_id);
create index on audit_logs(created_at desc);

-- ============================================================
-- 20. SEED: default superadmin invite (run separately after setup)
-- ============================================================
-- insert into invites (email, role)
-- values ('your-email@winnify.ai', 'superadmin');
