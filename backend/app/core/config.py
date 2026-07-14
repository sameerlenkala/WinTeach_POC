import re

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_PEM_RE = re.compile(r"-----BEGIN ([A-Z0-9 ]+)-----(.*?)-----END \1-----", re.DOTALL)


def _normalize_pem(raw: str) -> str:
    """Rebuild a PEM's line framing from a value whose newlines were mangled.

    Env-var UIs (Railway, some CI systems) routinely flatten a pasted multi-line
    PEM — collapsing the newlines to spaces, dropping them entirely, or storing a
    literal ``\\n``. `cryptography` then rejects it with "MalformedFraming". We
    extract the base64 body, strip all whitespace, and re-wrap at 64 columns so
    any of those manglings loads correctly. Non-PEM / empty values pass through.
    """
    if not raw or "-----BEGIN" not in raw:
        return raw
    s = raw.strip().replace("\\n", "\n")
    m = _PEM_RE.search(s)
    if not m:
        return s
    label = m.group(1).strip()
    body = re.sub(r"\s+", "", m.group(2))
    wrapped = "\n".join(body[i:i + 64] for i in range(0, len(body), 64))
    return f"-----BEGIN {label}-----\n{wrapped}\n-----END {label}-----"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_jwt_public_key: str = ""  # ECC public key PEM — for ES256 (current Supabase default)

    @field_validator("supabase_jwt_public_key")
    @classmethod
    def _fix_pem_framing(cls, v: str) -> str:
        return _normalize_pem(v)

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
    # Demo personas (hardcoded credentials incl. superadmin). Default OFF so a
    # real deployment is secure unless it explicitly opts in. Turn on ONLY for
    # local/demo environments via DEMO_LOGIN_ENABLED=true.
    demo_login_enabled: bool = False


settings = Settings()  # type: ignore[call-arg]
