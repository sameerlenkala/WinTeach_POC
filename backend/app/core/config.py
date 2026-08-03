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
    # Routing history:
    #  - 2026-07-12 canary (concept C1, n=20): terra 17/20, luna 14/20,
    #    gpt-4o 9/20 (since revoked). Terra won on quality.
    #  - 2026-07-31: defaults switched to luna on verified pricing — luna runs
    #    at ~10% of terra's cost ($0.20/$1.20 vs $2.00/$12.00 per 1M in/out),
    #    not the ~40% the stale rate table implied. Luna is also confirmed
    #    multimodal, so one model now covers heavy + light + OCR lanes.
    #    Quality escape hatch: set GENERATION_MODEL=gpt-5.6-terra to restore
    #    the 17/20 heavy lane; no code change needed.
    # Both terra and luna reject `temperature` (the llm_compat shim drops it),
    # so the pipeline's temperature tuning is inert on gpt-5.6 lanes.
    generation_model: str = "gpt-5.6-luna"
    generation_light_model: str = "gpt-5.6-luna"
    # When a concept artifact fails its blocking gates, the whole node is rerun
    # once on this model (2026-07-31: luna's first live run shipped 9/10 clean;
    # the one failure had three blocking gate misses terra is expected to fix).
    # Empty string disables escalation. Must differ from generation_model to
    # have any effect — same-model reruns are not retried.
    generation_escalation_model: str = "gpt-5.6-terra"
    # The Topic Plan is the root artifact: its concept inventory, TLO set and
    # session allocation are consumed verbatim by every downstream artifact,
    # and the deterministic plan gates check structure, not planning quality.
    # One ~12K-token call per topic (< $0.10 on terra) steers the whole
    # topic's output — the pipeline's best cost-per-leverage, so it stays on
    # the premium tier while volume lanes run luna. Empty = follow
    # generation_model.
    generation_plan_model: str = "gpt-5.6-terra"

    # App
    frontend_url: str = "http://localhost:5173"
    jwt_algorithm: str = "HS256"
    invite_expiry_days: int = 7
    # Demo personas (hardcoded credentials incl. superadmin). Default OFF so a
    # real deployment is secure unless it explicitly opts in. Turn on ONLY for
    # local/demo environments via DEMO_LOGIN_ENABLED=true.
    demo_login_enabled: bool = False


settings = Settings()  # type: ignore[call-arg]
