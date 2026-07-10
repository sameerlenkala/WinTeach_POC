import httpx
from postgrest.utils import SyncClient as PostgrestSyncClient
from supabase import create_client, Client
from app.core.config import settings

_client: Client | None = None
_auth_client: Client | None = None


def _harden_postgrest_session(client: Client) -> None:
    """Rebuild the PostgREST httpx session on HTTP/1.1 with a short keep-alive
    expiry.

    supabase-py defaults the PostgREST client to an HTTP/2 session that keeps
    connections alive indefinitely. Supabase's edge silently drops idle
    connections, and httpcore's HTTP/2 pool does not notice until the next
    request — which then blows up with `RemoteProtocolError: Server
    disconnected` (surfacing to the frontend as a spurious "Generation failed"
    on the status poll, and killing in-flight generation workers mid-run).

    HTTP/1.1's pool detects a closed keep-alive connection and transparently
    reconnects, and expiring idle connections quickly means we rarely reuse a
    stale one in the first place.
    """
    old = client.postgrest.session
    session = PostgrestSyncClient(
        base_url=old.base_url,
        headers=old.headers,
        timeout=old.timeout,
        follow_redirects=True,
        http2=False,
        limits=httpx.Limits(max_keepalive_connections=5, keepalive_expiry=15.0),
    )
    client.postgrest.session = session
    try:
        old.close()
    except Exception:
        pass


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
        _harden_postgrest_session(_client)
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
