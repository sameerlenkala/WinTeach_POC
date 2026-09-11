from pydantic import BaseModel, EmailStr
from app.schemas.common import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    # Supabase access tokens expire in ~1 hour; the refresh token lets the
    # frontend hand the session to supabase-js, which then auto-refreshes.
    # Without it every login silently died after an hour. None for the
    # backend-signed demo JWT path.
    refresh_token: str | None = None
    token_type: str = "bearer"
    role: UserRole
    redirect: str
    user: dict


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    # Two paths: an invite token (any role, from admin/superadmin), or open
    # self-signup gated by the org code — faculty/student only.
    invite_token: str | None = None
    role: UserRole | None = None
    org_code: str | None = None


class InviteRequest(BaseModel):
    email: EmailStr
    role: UserRole
    institute_id: str | None = None


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    institute_id: str | None = None


class InviteResponse(BaseModel):
    id: str
    email: str
    role: str
    signup_url: str
    expires_at: str


class MeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    institute_id: str | None = None
    institute_name: str | None = None
    designation: str | None = None   # student headline ("B.Tech CSE · 2026") / staff title
    phone: str | None = None
    avatar_url: str | None = None
    skills: list[str] = []


class UpdateMeRequest(BaseModel):
    """Self-service profile edit — only the caller's own cosmetic fields.
    Role/email/institute intentionally absent: those move via admin flows."""
    full_name: str | None = None
    designation: str | None = None
    phone: str | None = None
    skills: list[str] | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class PasswordResetRequest(BaseModel):
    """Forgot-password step 1: request a reset email. `app` tells the link
    which sign-in to return to afterwards (web /signin vs. mobile studio)."""
    email: EmailStr
    app: str | None = None  # "web" (default) | "study"


class PasswordResetConfirm(BaseModel):
    """Forgot-password step 2: consume the emailed token and set a new password."""
    token: str
    new_password: str
