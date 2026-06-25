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

    # App
    frontend_url: str = "http://localhost:5173"
    jwt_algorithm: str = "HS256"
    invite_expiry_days: int = 7


settings = Settings()  # type: ignore[call-arg]
