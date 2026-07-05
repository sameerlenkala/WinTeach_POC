from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.db.supabase import get_client
from app.core.security import decode_supabase_jwt

bearer = HTTPBearer()


def get_db() -> Client:
    return get_client()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Client = Depends(get_db),
) -> dict:
    payload = decode_supabase_jwt(credentials.credentials)
    user_id: str = payload.get("sub", "")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    try:
        result = db.table("profiles").select("*").eq("id", user_id).single().execute()
        if result.data:
            return result.data
    except Exception:
        pass  # .single() raises on zero rows — fall through to the claims check

    # Demo personas (e.g. superadmin) may have no profiles row because
    # profiles.id FKs to real auth.users. Their JWTs are signed by this backend
    # and carry an app role claim, so the claims are trustworthy. Supabase
    # tokens carry role="authenticated", which never matches an app role.
    role = payload.get("role")
    if role in ("superadmin", "admin", "faculty", "student"):
        email = payload.get("email", "")
        return {"id": user_id, "email": email,
                "full_name": email.split("@")[0] if email else "User",
                "role": role, "institute_id": None}

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User profile not found")


def require_role(*roles: str):
    """Dependency factory — raises 403 if the current user's role is not in `roles`."""
    async def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {list(roles)}",
            )
        return user
    return _check
