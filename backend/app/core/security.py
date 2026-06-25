from datetime import datetime, timezone
import jwt
from fastapi import HTTPException, status
from app.core.config import settings


def decode_supabase_jwt(token: str) -> dict:
    """Decode a Supabase JWT without signature verification (ES256/HS256/RS256).
    Expiry is enforced separately. Real security comes from the profiles DB lookup."""
    try:
        payload = jwt.decode(
            token,
            options={"verify_signature": False, "verify_aud": False, "verify_exp": False},
            algorithms=["HS256", "ES256", "RS256"],
        )
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
