import logging
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from supabase import Client
from app.core.config import settings
from app.schemas.common import ROLE_REDIRECT
from app.schemas.auth import LoginResponse, MeResponse, InviteResponse

logger = logging.getLogger(__name__)


# Superadmin is intentionally excluded — must exist in real Supabase auth (no auto-seed).
_DEMO_ACCOUNTS: dict[str, dict] = {
    "student@gmail.com":          {"name": "Aarav Gupta",      "role": "student",  "password": "demo@123"},
    "admin@vjit.ac.in":           {"name": "Dr. Priya Sharma", "role": "admin",    "password": "demo@123"},
    "faculty@vjit.ac.in":         {"name": "Dr. Amit Singh",   "role": "faculty",  "password": "demo@123"},
    "winnify.student@winnify.ai": {"name": "Winnify Student",  "role": "student",  "password": "Winnify@I23"},
    "winteach@winnify.ai":        {"name": "WinTeach Admin",   "role": "admin",    "password": "Winnify@I23"},
    "hod@winnify.ai":             {"name": "Winnify HOD",      "role": "faculty",  "password": "Winnify@I23"},
    "faculty@winnify.ai":         {"name": "Winnify Faculty",  "role": "faculty",  "password": "Winnify@I23"},
}
_DEMO_PASSWORD = "demo@123"


def update_demo_password(email: str, new_password: str) -> None:
    if email in _DEMO_ACCOUNTS:
        _DEMO_ACCOUNTS[email]["password"] = new_password


def _ensure_demo_user(db: Client, email: str, name: str, role: str) -> None:
    """
    Create the demo user in Supabase auth + profiles if they don't already exist.
    Uses the service-role key so email confirmation is bypassed.
    """
    # Check if user already exists in auth
    try:
        page = db.auth.admin.list_users()
        existing_ids = {u.email: u.id for u in page}
    except Exception:
        existing_ids = {}

    if email in existing_ids:
        user_id = str(existing_ids[email])
    else:
        resp = db.auth.admin.create_user({
            "email": email,
            "password": _DEMO_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"full_name": name, "role": role},
        })
        if not resp.user:
            raise HTTPException(status_code=500, detail=f"Could not seed demo user {email}")
        user_id = str(resp.user.id)

    # Upsert profile (safe — service key bypasses RLS)
    db.table("profiles").upsert({
        "id": user_id,
        "email": email,
        "full_name": name,
        "role": role,
    }, on_conflict="id").execute()


def login(db: Client, email: str, password: str) -> LoginResponse:
    # For known demo accounts (non-superadmin), seed the user in Supabase on first
    # login. Seeding is best-effort: if the admin API is throttled/unavailable and
    # the user already exists, we still let them sign in below.
    demo = _DEMO_ACCOUNTS.get(email.lower().strip())
    if demo and password == demo.get("password", _DEMO_PASSWORD):
        try:
            _ensure_demo_user(db, email, demo["name"], demo["role"])
        except Exception as e:
            logger.warning("demo user seeding failed for %s (continuing to sign-in): %s", email, e)

    try:
        auth_resp = db.auth.sign_in_with_password({"email": email, "password": password})
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if auth_resp.user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user = auth_resp.user
    session = auth_resp.session

    # Disambiguate the embed: profiles↔institutes has two FKs (institute_id and
    # institutes.created_by), so PostgREST needs the explicit relationship name.
    profile = db.table("profiles").select(
        "*, institutes!profiles_institute_id_fkey(name)"
    ).eq("id", user.id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    p = profile.data
    role = p["role"]

    return LoginResponse(
        access_token=session.access_token,
        role=role,
        redirect=ROLE_REDIRECT[role],
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": p.get("full_name", ""),
            "role": role,
            "institute_id": p.get("institute_id"),
            "institute_name": p.get("institutes", {}).get("name") if p.get("institutes") else None,
        },
    )


def get_me(db: Client, profile: dict) -> MeResponse:
    institute_name = None
    if profile.get("institute_id"):
        inst = db.table("institutes").select("name").eq("id", profile["institute_id"]).single().execute()
        institute_name = inst.data.get("name") if inst.data else None

    return MeResponse(
        id=profile["id"],
        email=profile["email"],
        full_name=profile.get("full_name", ""),
        role=profile["role"],
        institute_id=profile.get("institute_id"),
        institute_name=institute_name,
    )


def create_invite(db: Client, inviter: dict, email: str, role: str, institute_id: str | None) -> InviteResponse:
    inviter_role = inviter["role"]

    # Permission check
    if inviter_role == "admin":
        if role in ("superadmin", "admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot invite superadmin or another admin")
        if not institute_id:
            institute_id = inviter.get("institute_id")
    elif inviter_role != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only superadmin or admin can invite users")

    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.invite_expiry_days)

    db.table("invites").insert({
        "email": email,
        "role": role,
        "institute_id": institute_id,
        "token": token,
        "invited_by": inviter["id"],
        "expires_at": expires_at.isoformat(),
        "status": "pending",
    }).execute()

    signup_url = f"{settings.frontend_url}/signup/invite?invite={token}"
    return InviteResponse(
        id=token,
        email=email,
        role=role,
        signup_url=signup_url,
        expires_at=expires_at.isoformat(),
    )


def create_user_directly(db: Client, creator: dict, payload) -> dict:
    """Create a user directly with email + password — no invite link needed."""
    creator_role = creator["role"]

    # Admins can only create faculty/students within their institute
    if creator_role == "admin":
        if payload.role in ("superadmin", "admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot create admin or superadmin users")
        institute_id = payload.institute_id or creator.get("institute_id")
    else:
        institute_id = payload.institute_id

    # Create in Supabase auth
    try:
        resp = db.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True,
            "user_metadata": {"full_name": payload.full_name, "role": payload.role},
        })
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not create user: {e}")

    if not resp.user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User creation failed")

    user_id = str(resp.user.id)

    # Upsert profile (trigger may have already created it)
    db.table("profiles").upsert({
        "id": user_id,
        "email": payload.email,
        "full_name": payload.full_name,
        "role": payload.role,
        "institute_id": institute_id,
    }, on_conflict="id").execute()

    return {
        "id": user_id,
        "email": payload.email,
        "full_name": payload.full_name,
        "role": payload.role,
        "institute_id": institute_id,
    }


def list_invites(db: Client, user: dict) -> list[dict]:
    query = db.table("invites").select("*").eq("status", "pending")
    if user["role"] == "admin":
        query = query.eq("institute_id", user.get("institute_id"))
    return query.order("created_at", desc=True).execute().data or []


def register_with_invite(db: Client, email: str, password: str, full_name: str, invite_token: str) -> LoginResponse:
    invite_row = db.table("invites").select("*").eq("token", invite_token).eq("status", "pending").single().execute()
    if not invite_row.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired invite token")

    invite = invite_row.data
    expires_at = datetime.fromisoformat(invite["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token has expired")

    if invite["email"] != email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email does not match invite")

    # Create Supabase auth user
    auth_resp = db.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name},
    })
    if not auth_resp.user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")

    user_id = auth_resp.user.id

    # Update profile role and name (trigger already created the row)
    db.table("profiles").update({
        "full_name": full_name,
        "role": invite["role"],
        "institute_id": invite.get("institute_id"),
    }).eq("id", user_id).execute()

    # Mark invite as used
    db.table("invites").update({"status": "accepted", "accepted_by": user_id}).eq("token", invite_token).execute()

    # Sign in to get a session token
    return login(db, email, password)
