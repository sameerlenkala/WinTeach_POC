-- ============================================================
-- WinTeach — Supabase Storage buckets
--
-- The API uploads originals best-effort; without these buckets the upload
-- silently skips and only extracted text is kept. Private buckets: files are
-- served through the API (GET /materials/{id}/download), never public URLs.
--   - materials: faculty reference documents (grounding, 06+)
--   - syllabi:   syllabus uploads (endpoints/uploads.py, pre-existing path)
-- Additive only. Fresh setup order: 01 → … → 07 → 08.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('syllabi', 'syllabi', false)
on conflict (id) do nothing;

select 'storage buckets ensured' as status;
