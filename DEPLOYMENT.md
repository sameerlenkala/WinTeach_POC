# Deployment Guide

WinTeach is two deployables plus hosted Supabase:

| Piece      | Where        | Root dir    |
|------------|--------------|-------------|
| Frontend   | Vercel       | `winnify/`  |
| Backend    | Railway      | `backend/`  |
| Database   | Supabase     | (existing hosted project) |

Deploy the **backend first** — you need its public URL to configure the frontend.

---

## 1. Backend → Railway

1. Push this repo to GitHub (Railway deploys from a repo).
2. On [railway.app](https://railway.app): **New Project → Deploy from GitHub repo** → pick this repo.
3. In the service **Settings → Root Directory**, set `backend`.
   - `railway.toml`, `.python-version` (3.11.9) and `Procfile` are already in `backend/`, so build/start/health-check are auto-configured. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. **Variables** tab — add:

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | `https://<project>.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key |
   | `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
   | `SUPABASE_JWT_PUBLIC_KEY` | ES256 public key PEM (Supabase → Settings → JWT Keys). **Required** — current Supabase projects sign user tokens with ES256; without this every request after login 401s and the app logs out instantly. |
   | `SUPABASE_JWT_SECRET` | Supabase → Settings → JWT Keys → JWT Secret (only needed for legacy HS256 projects) |
   | `OPENAI_API_KEY` | `sk-...` (key with gpt-5.6-terra/luna + gpt-5.4-nano access) |
   | `FRONTEND_URL` | Vercel URL from step 2 below (add after that deploy exists) |
   | `DEMO_LOGIN_ENABLED` | `false` ← **required for any real deployment** |

   Do **not** set `GENERATION_MODEL` — the code default (gpt-5.6-luna on every lane) already matches the key's access. Set `GENERATION_MODEL=gpt-5.6-terra` only if heavy-lane quality needs a lift. (`OCR_MODEL` no longer exists; luna is multimodal.)
5. Deploy. Confirm `https://<service>.up.railway.app/health` returns `{"status":"ok"}`.

## 2. Frontend → Vercel (new account)

1. On the new Vercel account: **Add New → Project** → import this GitHub repo.
2. **Root Directory:** `winnify`. Framework preset auto-detects Vite (build `npm run build`, output `dist`). The SPA rewrite is already in `winnify/vercel.json`.
3. **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_BACKEND_URL` | the Railway URL from step 1 (e.g. `https://<service>.up.railway.app`) |
   | `VITE_SUPABASE_URL` | `https://<project>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `VITE_DAILY_API_KEY` | (only if using Daily.co video) |

4. Deploy. Copy the production URL and set it as `FRONTEND_URL` in Railway (step 1.4), then redeploy the backend.

## 3. CORS

No change needed. `backend/app/main.py` already allows any `https://*.vercel.app` origin via `allow_origin_regex`, plus whatever `FRONTEND_URL` you set. Once the app has a stable custom domain, tighten the allowlist.

---

## Pre-launch checklist

- [ ] `DEMO_LOGIN_ENABLED=false` on Railway (hardcoded superadmin persona otherwise)
- [ ] `FRONTEND_URL` on Railway points at the live Vercel URL
- [ ] `VITE_BACKEND_URL` on Vercel points at the live Railway URL
- [ ] `/health` returns ok; frontend loads and can log in against the backend
- [ ] Env files (`backend/.env`, `winnify/.env`) stay untracked — secrets live only in the host dashboards
