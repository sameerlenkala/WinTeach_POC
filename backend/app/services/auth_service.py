import logging
import os
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
    "admin@ciet.ac.in":           {"name": "Dr. Priya Sharma", "role": "admin",    "password": "demo@123"},
    "faculty@ciet.ac.in":         {"name": "Dr. Amit Singh",   "role": "faculty",  "password": "demo@123"},
    "winnify.student@winnify.ai": {"name": "Winnify Student",  "role": "student",  "password": "Winnify@I23"},
    "winteach@winnify.ai":        {"name": "WinTeach Admin",   "role": "admin",    "password": "Winnify@I23"},
    "hod@winnify.ai":             {"name": "Winnify HOD",      "role": "faculty",  "password": "Winnify@I23"},
    "faculty@winnify.ai":         {"name": "Winnify Faculty",  "role": "faculty",  "password": "Winnify@I23"},
}
_DEMO_PASSWORD = "demo@123"


def update_demo_password(email: str, new_password: str) -> None:
    if email in _DEMO_ACCOUNTS:
        _DEMO_ACCOUNTS[email]["password"] = new_password


def _ensure_demo_user(db: Client, email: str, name: str, role: str,
                      password: str = _DEMO_PASSWORD) -> None:
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
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": name, "role": role},
        })
        if not resp.user:
            raise HTTPException(status_code=500, detail=f"Could not seed demo user {email}")
        user_id = str(resp.user.id)

    # Seed the profile row only if it doesn't exist yet (ignore_duplicates =
    # ON CONFLICT DO NOTHING). A plain upsert here clobbered self-service
    # profile edits with the hardcoded demo name on every login.
    db.table("profiles").upsert({
        "id": user_id,
        "email": email,
        "full_name": name,
        "role": role,
    }, on_conflict="id", ignore_duplicates=True).execute()


_SUPERADMIN_DEMO = {"email": "superadmin@winnify.ai", "name": "Sai Teja",
                    "role": "superadmin", "password": "demo@123"}


def _demo_jwt_login(db: Client, email: str, name: str, role: str) -> LoginResponse:
    """Issue a backend-signed JWT for a demo persona that has no Supabase auth
    user (superadmin is never auto-seeded). Mirrors the /auth/demo route so the
    plain login form works for every persona."""
    import jwt as pyjwt
    demo_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"demo:{email}"))
    try:
        # Insert-only seed: never overwrite a row the user has since edited.
        db.table("profiles").upsert({
            "id": demo_id, "email": email, "full_name": name, "role": role,
        }, on_conflict="id", ignore_duplicates=True).execute()
        row = db.table("profiles").select("full_name").eq("id", demo_id).single().execute()
        if row.data and row.data.get("full_name"):
            name = row.data["full_name"]
    except Exception:
        pass
    now = datetime.now(timezone.utc)
    token = pyjwt.encode({
        "sub": demo_id, "email": email, "role": role,
        "iat": int(now.timestamp()), "exp": int((now + timedelta(hours=24)).timestamp()),
    }, settings.supabase_anon_key, algorithm=settings.jwt_algorithm)
    return LoginResponse(
        access_token=token, role=role, redirect=ROLE_REDIRECT.get(role, "/"),
        user={"id": demo_id, "email": email, "full_name": name, "role": role,
              "institute_id": None, "institute_name": None},
    )


def login(db: Client, email: str, password: str) -> LoginResponse:
    # Superadmin demo persona has no Supabase auth user by design — issue the
    # backend-signed demo JWT directly so the normal login form works for it.
    # Both demo paths are dead when DEMO_LOGIN_ENABLED=false (real deployments).
    if (settings.demo_login_enabled
            and email.lower().strip() == _SUPERADMIN_DEMO["email"]
            and password == _SUPERADMIN_DEMO["password"]):
        return _demo_jwt_login(db, _SUPERADMIN_DEMO["email"],
                               _SUPERADMIN_DEMO["name"], _SUPERADMIN_DEMO["role"])

    # For known demo accounts (non-superadmin), seed the user in Supabase on first
    # login. Seeding is best-effort: if the admin API is throttled/unavailable and
    # the user already exists, we still let them sign in below.
    demo = _DEMO_ACCOUNTS.get(email.lower().strip()) if settings.demo_login_enabled else None
    demo_password_ok = bool(demo) and password == demo.get("password", _DEMO_PASSWORD)
    if demo_password_ok:
        try:
            _ensure_demo_user(db, email, demo["name"], demo["role"],
                              demo.get("password", _DEMO_PASSWORD))
        except Exception as e:
            logger.warning("demo user seeding failed for %s (continuing to sign-in): %s", email, e)

    try:
        # Sign in on a DEDICATED client so the user's session is never propagated
        # onto the shared service-role data client (which would make later DB
        # writes run as this user and violate RLS).
        from app.db.supabase import get_auth_client
        try:
            auth_resp = get_auth_client().auth.sign_in_with_password({"email": email, "password": password})
        except Exception:
            # Demo accounts whose Supabase user was seeded with a different
            # password than the demo map (or changed since): the map is the
            # source of truth, so sync Supabase and retry once.
            if not demo_password_ok:
                raise
            _admin_set_password(db, email, password)
            auth_resp = get_auth_client().auth.sign_in_with_password({"email": email, "password": password})
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
        designation=profile.get("designation"),
        phone=profile.get("phone"),
        avatar_url=profile.get("avatar_url"),
        skills=profile.get("skills") or [],
    )


def update_me(db: Client, profile: dict, payload) -> MeResponse:
    """Self-service edit of the caller's own profile row. Upserts so demo
    personas whose row was never seeded still get one; skills lives in a
    jsonb column added by sql/11_profile_fields.sql — environments that
    haven't run it degrade gracefully (skills silently dropped)."""
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items()
               if v is not None}
    if "full_name" in updates and not updates["full_name"].strip():
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    if "full_name" in updates:
        updates["full_name"] = updates["full_name"].strip()

    if updates:
        row = {"id": profile["id"], "email": profile["email"],
               "full_name": profile.get("full_name", ""), "role": profile["role"],
               **updates}
        try:
            try:
                db.table("profiles").upsert(row, on_conflict="id").execute()
            except Exception:
                if "skills" not in row:
                    raise
                logger.warning("profile upsert failed — retrying without skills "
                               "(run sql/11_profile_fields.sql)", exc_info=True)
                row.pop("skills")
                db.table("profiles").upsert(row, on_conflict="id").execute()
        except Exception:
            # JWT-only demo personas (e.g. superadmin) have no auth.users row,
            # so the profiles.id FK rejects the insert. Surface that clearly
            # instead of a 500.
            has_row = db.table("profiles").select("id").eq("id", profile["id"]).execute()
            if not (has_row.data or []):
                raise HTTPException(status_code=400,
                                    detail="This demo account has no editable profile.")
            raise

    try:
        fresh = db.table("profiles").select("*").eq("id", profile["id"]).single().execute().data
    except Exception:
        fresh = None  # .single() raises on zero rows (profile-less personas)
    return get_me(db, fresh or {**profile, **updates})


def change_password(db: Client, profile: dict, current_password: str, new_password: str) -> dict:
    """Authenticated password change: proves knowledge of the current password
    before setting the new one (unlike the demo-only reset flow)."""
    if len(new_password) < 8:
        raise HTTPException(status_code=422, detail="New password must be at least 8 characters")
    email = (profile.get("email") or "").lower().strip()

    # Demo personas (in-memory / JWT-only, e.g. superadmin) — update the maps.
    if settings.demo_login_enabled:
        demo = _DEMO_ACCOUNTS.get(email)
        if email == _SUPERADMIN_DEMO["email"]:
            if current_password != _SUPERADMIN_DEMO["password"]:
                raise HTTPException(status_code=400, detail="Current password is incorrect")
            _SUPERADMIN_DEMO["password"] = new_password
            return {"success": True}
        if demo:
            if current_password != demo["password"]:
                raise HTTPException(status_code=400, detail="Current password is incorrect")
            demo["password"] = new_password
            # Demo users also exist in Supabase auth (seeded on login) — keep
            # both in sync so either path accepts the new password.
            try:
                _admin_set_password(db, email, new_password)
            except Exception:
                logger.warning("supabase password sync failed for demo %s", email, exc_info=True)
            return {"success": True}

    # Real user: verify the current password via a real sign-in, then update.
    from app.db.supabase import get_auth_client
    try:
        resp = get_auth_client().auth.sign_in_with_password(
            {"email": email, "password": current_password})
        if resp.user is None:
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    try:
        db.auth.admin.update_user_by_id(profile["id"], {"password": new_password})
    except Exception:
        logger.exception("change-password: admin update failed for %s", profile.get("id"))
        raise HTTPException(status_code=500, detail="Failed to update password")
    return {"success": True}


def _admin_set_password(db: Client, email: str, new_password: str) -> None:
    page = db.auth.admin.list_users()
    ids = {u.email: u.id for u in page}
    if email in ids:
        db.auth.admin.update_user_by_id(ids[email], {"password": new_password})


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
    except Exception:
        logger.exception("create_user_directly: auth create_user failed for %s", payload.email)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Could not create user (the email may already be in use)")

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


# ── Open self-signup (org-code gated; faculty/student only) ───────────────────

_ORG_SIGNUP_CODE = os.getenv("WINTEACH_ORG_CODE", "MAVIGUN")
_OPEN_SIGNUP_ROLES = ("faculty", "student")


def register_open(db: Client, email: str, password: str, full_name: str,
                  role: str | None, org_code: str | None) -> LoginResponse:
    """Self-serve account creation. Gated by the static org code and limited to
    faculty/student — admin and superadmin accounts remain invite/created-only."""
    if not role or role not in _OPEN_SIGNUP_ROLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Choose a role: faculty or student. Admin accounts are created by invitation.")
    if not org_code or org_code.strip().upper() != _ORG_SIGNUP_CODE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid organization code.")
    if len(password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Password must be at least 8 characters.")

    email = email.lower().strip()

    # Duplicate guard with a friendly message (create_user would 400 cryptically).
    try:
        page = db.auth.admin.list_users()
        if any((u.email or "").lower() == email for u in page):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="An account with this email already exists. Try signing in.")
    except HTTPException:
        raise
    except Exception:
        pass  # listing unavailable — fall through; create_user will surface duplicates

    try:
        resp = db.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name, "role": role},
        })
    except Exception:
        logger.exception("register_open: auth create_user failed for %s", email)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Could not create account (the email may already be in use)")
    if not resp.user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Account creation failed.")

    user_id = str(resp.user.id)
    db.table("profiles").upsert({
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "role": role,
    }, on_conflict="id").execute()

    # Sign in immediately so the user lands in their portal.
    return login(db, email, password)
