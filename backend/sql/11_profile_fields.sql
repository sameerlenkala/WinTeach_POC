-- Profile self-service fields (PATCH /auth/me).
-- skills: student-curated tag list shown on the profile page.
-- (designation/phone/avatar_url already exist in 01_winnify_db.sql.)

alter table profiles add column if not exists skills jsonb not null default '[]'::jsonb;
