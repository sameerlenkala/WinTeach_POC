-- Self-serve forgot-password tokens (backend/app/services/password_reset_service.py).
-- Only the SHA-256 hash of the emailed token is stored; rows are single-use
-- and short-lived. Written/read exclusively by the backend's service-role
-- client — RLS is on with no policies so the anon key (shipped in the frontend
-- bundle) can neither read nor forge them.
create table if not exists public.password_resets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  email         text not null,
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  requested_ip  text,
  created_at    timestamptz not null default now()
);

create index if not exists password_resets_user_id_idx on public.password_resets(user_id);
-- Rolling per-email rate limit reads (email, created_at).
create index if not exists password_resets_email_created_idx on public.password_resets(email, created_at desc);

alter table public.password_resets enable row level security;

-- profiles.email lookups back the request step; make sure they're indexed.
create index if not exists profiles_email_idx on public.profiles(email);
