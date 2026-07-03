from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None
_auth_client: Client | None = None


def get_client() -> Client:
    """Shared service-role client for all DATA operations (bypasses RLS).

    It must NEVER be used for user sign-in: supabase-py propagates a signed-in
    user's JWT onto this client's PostgREST/Storage sub-clients, which would make
    every subsequent write run as that user and hit row-level security. As a
    safeguard we also re-assert the service-role token on each hand-out, healing
    the client if any path contaminated it.
    """
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    else:
        try:
            _client.postgrest.auth(settings.supabase_service_key)
        except Exception:
            pass
    return _client


def get_auth_client() -> Client:
    """Separate client dedicated to user auth (sign_in_with_password), so setting
    a user session never contaminates the service-role data client. Prefers the
    anon key (the correct key for user sign-in) and falls back to the service key.
    """
    global _auth_client
    if _auth_client is None:
        _auth_client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key or settings.supabase_service_key,
        )
    return _auth_client
