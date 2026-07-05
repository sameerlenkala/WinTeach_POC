-- ============================================================
-- WinTeach — material grounding Phase 2: pgvector retrieval
--
-- Chunks now carry OpenAI text-embedding-3-small vectors (column added in
-- 06; populated at ingest). Retrieval goes vector-first through
-- match_material_chunks; the Phase-1 FTS RPC stays as the fallback for
-- chunks ingested before this migration or when embedding fails.
-- Additive only. Fresh setup order: 01 → … → 06 → 07.
-- ============================================================

begin;

-- ANN index, deferred from 06. Cosine ops — OpenAI embeddings are normalized.
create index if not exists material_chunks_embedding_hnsw
  on material_chunks using hnsw (embedding vector_cosine_ops);

-- Ranked vector retrieval; same row shape as search_material_chunks so the
-- Python retrieval pipeline is source-agnostic.
create or replace function match_material_chunks(
  mat_ids uuid[], query_embedding vector(1536), lim int default 24
) returns table (
  id uuid, material_id uuid, chunk_index int, heading text,
  page_start int, page_end int, chunk_text text, token_count int, rank real
) language sql stable as $$
  select c.id, c.material_id, c.chunk_index, c.heading,
         c.page_start, c.page_end, c.text, c.token_count,
         (1 - (c.embedding <=> query_embedding))::real as rank
  from material_chunks c
  where c.material_id = any(mat_ids)
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit lim;
$$;

commit;

select 'material embeddings migration applied' as status;
