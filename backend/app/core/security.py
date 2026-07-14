import jwt
from fastapi import HTTPException, status
from app.core.config import settings


def _keys_for_alg(alg: str) -> list[str]:
    """Verification key(s) to try for a given JWT `alg`, newest-first.

    - ES256/RS256 (current Supabase default): the project's asymmetric public
      key (PEM).
    - HS256: the legacy Supabase JWT secret for real user tokens, plus the anon
      key the backend itself uses to sign demo-persona tokens.

    Keys are kept strictly partitioned by algorithm family so a caller can never
    trigger an algorithm-confusion attack (e.g. presenting the public key as an
    HMAC secret) — an EC public key is never fed to HS256 verification.
    """
    if alg in ("ES256", "RS256"):
        return [k for k in (settings.supabase_jwt_public_key,) if k]
    if alg == "HS256":
        return [k for k in (settings.supabase_jwt_secret, settings.supabase_anon_key) if k]
    return []


def decode_supabase_jwt(token: str) -> dict:
    """Decode and cryptographically verify a Supabase (or backend-issued) JWT.

    The signature is verified against the key(s) matching the token's declared
    algorithm, and expiry is enforced. `alg: none` and any unrecognised
    algorithm are rejected because they map to no verification key.
    """
    try:
        alg = jwt.get_unverified_header(token).get("alg", "")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    keys = _keys_for_alg(alg)
    if not keys:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    for key in keys:
        try:
            return jwt.decode(
                token,
                key,
                algorithms=[alg],
                options={"verify_signature": True, "verify_aud": False, "verify_exp": True},
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.InvalidTokenError:
            continue  # try the next candidate key (e.g. anon-key demo token vs. jwt-secret user token)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
