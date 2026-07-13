from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_jwt_public_key: str = ""  # ECC public key PEM — for ES256 (current Supabase default)

    # OpenAI
    openai_api_key: str = ""
    # Generation model routing — heavy nodes author student-facing content;
    # light nodes do mechanical repairs (verb fixes, TLO retagging, subtopic
    # splitting) and OCR transcription. Override per deployment via env.
    # Validated on the WinTeach pipeline (2026-07-12 canary, concept C1):
    # terra shipped 17/20 vs gpt-4o 9/20 and passed a gate gpt-4o failed; luna
    # scored 14/20 at ~40% of terra's cost. terra rejects `temperature` (the
    # llm_compat shim drops it), so the pipeline's temperature tuning is inert
    # on the heavy lane — acceptable given the quality result.
    generation_model: str = "gpt-5.6-terra"
    generation_light_model: str = "gpt-5.4-nano"
    # OCR must run on a model with confirmed image input. Empty = use the light
    # model. Pinned to luna because gpt-5.4-nano's vision support is unverified.
    ocr_model: str = "gpt-5.6-luna"

    # App
    frontend_url: str = "http://localhost:5173"
    jwt_algorithm: str = "HS256"
    invite_expiry_days: int = 7
    # Demo personas (hardcoded credentials incl. superadmin) — on for local/demo
    # deployments, MUST be false in any real deployment: DEMO_LOGIN_ENABLED=false.
    demo_login_enabled: bool = True


settings = Settings()  # type: ignore[call-arg]
