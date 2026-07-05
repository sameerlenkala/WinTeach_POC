-- ============================================================
-- WinTeach — optional material grounding for generation (Phase 1)
--
-- Faculty attach reference PDFs/DOCX to a course; generation grounds
-- Node A (plan) and Node B (notes) prompts in retrieved chunks.
--   - materials: one row per uploaded file. course_id scopes the pool;
--     is_course_wide=true serves every topic in the course. Explicit
--     per-topic attachment lives in topic_materials (the only other
--     way a material reaches a topic — materials has no topic_id).
--   - material_chunks: ~500-800-token chunks on heading boundaries,
--     with a generated tsvector for ranked FTS retrieval. The
--     embedding column is a Phase-2 placeholder (pgvector is already
--     enabled in 01); its HNSW index is deferred with it.
--   - search_material_chunks(): PostgREST cannot ORDER BY ts_rank, so
--     ranked retrieval goes through this RPC.
-- Additive only. Fresh setup order: 01 → 02 → 03 → 04 → 05 → 06.
-- ============================================================

begin;

create table if not exists materials (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  institute_id  uuid references institutes(id),
  uploaded_by   uuid references profiles(id),
  filename      text not null,
  storage_path  text,
  file_type     text not null check (file_type in ('pdf','docx')),
  file_size     int,
  status        text not null default 'processing'
                check (status in ('processing','ready','error')),
  is_course_wide boolean not null default false,
  page_count    int,
  chunk_count   int,
  content_hash  text,
  error_message text,
  created_at    timestamptz not null default now()
);
create index if not exists materials_course on materials(course_id);

create table if not exists material_chunks (
  id           uuid primary key default gen_random_uuid(),
  material_id  uuid not null references materials(id) on delete cascade,
  chunk_index  int not null,
  heading      text,
  page_start   int,
  page_end     int,
  text         text not null,
  token_count  int not null default 0,
  embedding    vector(1536),          -- Phase 2; HNSW index deferred with it
  text_search  tsvector generated always as (
    to_tsvector('english', coalesce(heading, '') || ' ' || text)
  ) stored,
  unique (material_id, chunk_index)
);
create index if not exists material_chunks_fts on material_chunks using gin (text_search);
create index if not exists material_chunks_material on material_chunks(material_id);

-- Explicit topic attachment (topic tier). Course-wide materials need no rows here.
create table if not exists topic_materials (
  topic_id    uuid not null references topics(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (topic_id, material_id)
);
create index if not exists topic_materials_material on topic_materials(material_id);

-- Which materials a generation job was grounded in (provenance).
alter table generation_jobs add column if not exists material_ids jsonb;

-- Ranked FTS retrieval. `query` is a pre-built, sanitized OR-joined tsquery
-- string ('word1 | word2 | …') — websearch_to_tsquery would AND 30+ concept
-- terms and match nothing, so the caller builds OR semantics explicitly.
create or replace function search_material_chunks(
  mat_ids uuid[], query text, lim int default 24
) returns table (
  id uuid, material_id uuid, chunk_index int, heading text,
  page_start int, page_end int, chunk_text text, token_count int, rank real
) language sql stable as $$
  select c.id, c.material_id, c.chunk_index, c.heading,
         c.page_start, c.page_end, c.text, c.token_count,
         ts_rank(c.text_search, to_tsquery('english', query)) as rank
  from material_chunks c
  where c.material_id = any(mat_ids)
    and c.text_search @@ to_tsquery('english', query)
  order by rank desc
  limit lim;
$$;

commit;

select 'materials migration applied' as status;
