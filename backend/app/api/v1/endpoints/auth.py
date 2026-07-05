import uuid
from datetime import datetime, timedelta, timezone

import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.config import settings
from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.auth import (
    LoginRequest, LoginResponse,
    RegisterRequest,
    InviteRequest, InviteResponse,
    CreateUserRequest,
    MeResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

# ── Demo accounts (mirror of frontend DEMO map) ───────────────────────────────
_DEMO_ACCOUNTS: dict[str, dict] = {
    "student@gmail.com":      {"name": "Aarav Gupta",      "role": "student",     "password": "demo@123"},
    "admin@ciet.ac.in":       {"name": "Dr. Priya Sharma", "role": "admin",       "password": "demo@123"},
    "superadmin@winnify.ai":  {"name": "Sai Teja",         "role": "superadmin",  "password": "demo@123"},
    "faculty@ciet.ac.in":     {"name": "Dr. Amit Singh",   "role": "faculty",     "password": "demo@123"},
}


class DemoLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/demo", response_model=LoginResponse)
def demo_login(payload: DemoLoginRequest, db: Client = Depends(get_db)):
    """
    Issue a signed JWT for known demo accounts so the frontend can call
    protected API endpoints without real Supabase credentials.
    The JWT is signed with the same supabase_anon_key the backend uses to
    verify all tokens, so it passes decode_supabase_jwt() cleanly.
    """
    demo = _DEMO_ACCOUNTS.get(payload.email.lower().strip())
    if not demo or payload.password != demo["password"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not a demo account")

    # Stable demo user ID (deterministic from email so re-logins are idempotent)
    demo_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"demo:{payload.email}"))

    # Upsert profile so get_current_user() can find it
    try:
        db.table("profiles").upsert({
            "id": demo_id,
            "email": payload.email,
            "full_name": demo["name"],
            "role": demo["role"],
        }, on_conflict="id").execute()
    except Exception:
        pass  # Profile table may not exist in local dev — safe to ignore

    # Sign a JWT with a 24h expiry using the same key/algorithm the backend validates
    now = datetime.now(timezone.utc)
    token_payload = {
        "sub": demo_id,
        "email": payload.email,
        "role": demo["role"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=24)).timestamp()),
    }
    token = pyjwt.encode(token_payload, settings.supabase_anon_key, algorithm=settings.jwt_algorithm)

    from app.schemas.common import ROLE_REDIRECT
    role = demo["role"]
    return LoginResponse(
        access_token=token,
        role=role,
        redirect=ROLE_REDIRECT.get(role, "/"),
        user={
            "id": demo_id,
            "email": payload.email,
            "full_name": demo["name"],
            "role": role,
            "institute_id": None,
            "institute_name": None,
        },
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Client = Depends(get_db)):
    return auth_service.login(db, payload.email, payload.password)


@router.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest, db: Client = Depends(get_db)):
    """Invite-token path keeps working for any role; without a token this is
    open self-signup — org-code gated, faculty/student only."""
    if payload.invite_token:
        return auth_service.register_with_invite(db, payload.email, payload.password,
                                                 payload.full_name, payload.invite_token)
    return auth_service.register_open(db, payload.email, payload.password,
                                      payload.full_name, payload.role, payload.org_code)


@router.get("/me", response_model=MeResponse)
def me(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return auth_service.get_me(db, user)


@router.post("/invite", response_model=InviteResponse)
def invite(
    payload: InviteRequest,
    user: dict = Depends(require_role("superadmin", "admin")),
    db: Client = Depends(get_db),
):
    return auth_service.create_invite(db, user, payload.email, payload.role, payload.institute_id)


@router.get("/invites")
def list_invites(
    user: dict = Depends(require_role("superadmin", "admin")),
    db: Client = Depends(get_db),
):
    return auth_service.list_invites(db, user)


@router.post("/create-user", status_code=201)
def create_user(
    payload: CreateUserRequest,
    user: dict = Depends(require_role("superadmin", "admin")),
    db: Client = Depends(get_db),
):
    return auth_service.create_user_directly(db, user, payload)


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Client = Depends(get_db)):
    email = payload.email.lower().strip()

    # Update demo account in-memory password
    demo = _DEMO_ACCOUNTS.get(email)
    if demo:
        _DEMO_ACCOUNTS[email]["password"] = payload.new_password
        # Also update in auth_service map
        auth_service.update_demo_password(email, payload.new_password)
        return {"success": True}

    # Real Supabase user — update via admin API
    try:
        page = db.auth.admin.list_users()
        user_map = {u.email: u.id for u in page}
    except Exception:
        raise HTTPException(status_code=500, detail="Could not reach auth service")

    if email not in user_map:
        raise HTTPException(status_code=404, detail="No account found with that email")

    try:
        db.auth.admin.update_user_by_id(user_map[email], {"password": payload.new_password})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update password: {e}")

    return {"success": True}
