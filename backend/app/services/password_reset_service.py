"""Self-serve forgot-password flow.

Step 1 — request: the caller gives an email. If it belongs to a real account
we mint a random token, store only its SHA-256 hash with a short expiry, and
email the raw token in a link (via Resend). The HTTP response is identical
whether or not the account exists, and the lookup + send run *after* the
response so timing can't leak it either.

Step 2 — confirm: the link's token is hashed and matched against an unused,
unexpired row; the password is set through the Supabase admin API; the row is
marked used and every other outstanding token for that user is invalidated.

Tokens live in `password_resets` (sql/15_password_resets.sql) — service-role
only, RLS on with no policies, like the rest of the schema.
"""
import hashlib
import html
import logging
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import HTTPException, status
from gotrue.errors import AuthWeakPasswordError
from supabase import Client

from app.core.config import settings
from app.services import email_service

logger = logging.getLogger(__name__)

_TABLE = "password_resets"
_TOKEN_BYTES = 32
MIN_PASSWORD_LEN = 8

# Generic message returned by the request endpoint regardless of outcome.
REQUEST_MESSAGE = ("If an account exists for that email, a password reset link "
                   "has been sent. It expires in {minutes} minutes.")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _normalize_email(email: str) -> str:
    return (email or "").lower().strip()


def build_reset_url(token: str, app: str | None) -> str:
    params = {"token": token}
    if app == "study":
        params["app"] = "study"
    return f"{settings.frontend_url.rstrip('/')}/reset-password?{urlencode(params)}"


# ── Step 1: request ──────────────────────────────────────────────────────────

def _find_account(db: Client, email: str) -> dict | None:
    """Look the email up in profiles (indexed, service-role). Returns
    {id, email, full_name} or None. Any DB error is treated as 'not found'
    so the caller's generic response is preserved."""
    try:
        res = db.table("profiles").select("id,email,full_name").eq("email", email) \
            .limit(1).execute()
    except Exception:
        logger.exception("password-reset: profile lookup failed for %s", email)
        return None
    rows = res.data or []
    return rows[0] if rows else None


def _recent_request_count(db: Client, email: str) -> int:
    since = (_now() - timedelta(hours=1)).isoformat()
    try:
        res = db.table(_TABLE).select("id", count="exact").eq("email", email) \
            .gte("created_at", since).execute()
        return res.count if res.count is not None else len(res.data or [])
    except Exception:
        logger.exception("password-reset: rate-limit lookup failed for %s", email)
        return 0


def issue_reset(db: Client, email: str, app: str | None = None,
                requested_ip: str | None = None) -> None:
    """Mint + email a reset token if `email` belongs to an account. Never
    raises for user-attributable reasons; meant to run as a background task."""
    email = _normalize_email(email)
    account = _find_account(db, email)
    if not account:
        logger.info("password-reset: request for unknown email %s (no-op)", email)
        return

    if _recent_request_count(db, email) >= settings.password_reset_max_per_hour:
        logger.warning("password-reset: rate limit hit for %s (no-op)", email)
        return

    token = secrets.token_urlsafe(_TOKEN_BYTES)
    expires_at = _now() + timedelta(minutes=settings.password_reset_expiry_minutes)
    try:
        db.table(_TABLE).insert({
            "user_id": account["id"],
            "email": email,
            "token_hash": hash_token(token),
            "expires_at": expires_at.isoformat(),
            "requested_ip": requested_ip,
        }).execute()
    except Exception:
        logger.exception("password-reset: could not store token for %s "
                         "(run sql/15_password_resets.sql?)", email)
        return

    url = build_reset_url(token, app)
    name = (account.get("full_name") or "").strip() or None

    if not email_service.is_configured():
        if settings.demo_login_enabled:
            # Local/demo: surface the link in the server log so the flow is
            # testable end-to-end without a Resend account.
            logger.warning("password-reset: RESEND_API_KEY unset — reset link for %s: %s",
                           email, url)
        else:
            logger.error("password-reset: RESEND_API_KEY unset — reset email for %s "
                         "was NOT sent", email)
        return

    subject, html_body, text_body = render_reset_email(
        name=name, url=url, minutes=settings.password_reset_expiry_minutes)
    try:
        email_service.send_email(to=email, subject=subject, html=html_body,
                                 text=text_body, tags={"category": "password_reset"})
    except email_service.EmailNotSent:
        # Already logged with detail inside email_service.
        pass


# ── Step 2: confirm ──────────────────────────────────────────────────────────

def confirm_reset(db: Client, token: str, new_password: str) -> dict:
    token = (token or "").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This reset link is invalid or has expired.")
    if len(new_password) < MIN_PASSWORD_LEN:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Password must be at least {MIN_PASSWORD_LEN} characters.")

    try:
        res = db.table(_TABLE).select("*").eq("token_hash", hash_token(token)) \
            .limit(1).execute()
    except Exception:
        logger.exception("password-reset: token lookup failed")
        raise HTTPException(status_code=500, detail="Could not verify reset link.")
    rows = res.data or []
    row = rows[0] if rows else None

    invalid = HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This reset link is invalid or has expired.")
    if not row or row.get("used_at"):
        raise invalid
    expires_at = datetime.fromisoformat(str(row["expires_at"]).replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < _now():
        raise invalid

    user_id = row["user_id"]
    try:
        db.auth.admin.update_user_by_id(user_id, {"password": new_password})
    except AuthWeakPasswordError as e:
        # Supabase Auth enforces the project's password policy (length +
        # character classes, leaked-password check). Relay its rule verbatim
        # and leave the token live so the user can retry with a stronger one.
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Password too weak: {e.message}")
    except Exception:
        # e.g. a JWT-only demo persona with a profiles row but no auth.users row.
        logger.exception("password-reset: admin password update failed for %s", user_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This account's password can't be reset here. "
                                   "Contact your institution.")

    now_iso = _now().isoformat()
    try:
        # Consume this token and burn any other live tokens for the same user.
        db.table(_TABLE).update({"used_at": now_iso}).eq("id", row["id"]).execute()
        db.table(_TABLE).update({"used_at": now_iso}).eq("user_id", user_id) \
            .is_("used_at", "null").execute()
    except Exception:
        logger.exception("password-reset: failed to mark tokens used for %s", user_id)

    # Keep the in-memory demo map in sync so demo sign-in still matches.
    if settings.demo_login_enabled:
        from app.services.auth_service import update_demo_password
        update_demo_password(row.get("email", ""), new_password)

    return {"success": True, "email": row.get("email")}


# ── Email template ───────────────────────────────────────────────────────────

def render_reset_email(*, name: str | None, url: str, minutes: int) -> tuple[str, str, str]:
    """Returns (subject, html, text). Inline-styled table layout so it renders
    in Gmail/Outlook; brand colours match the sign-in page (winnify.ai violet)."""
    greeting = f"Hi {html.escape(name)}," if name else "Hi,"
    safe_url = html.escape(url, quote=True)
    subject = "Reset your Winnify password"

    html_body = f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f0eeff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1b1233;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0eeff;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid rgba(107,63,231,0.12);border-radius:20px;">
          <tr><td style="padding:32px 32px 8px;">
            <div style="font:600 22px Fredoka,ui-sans-serif,system-ui,sans-serif;color:#6b3fe7;">Winnify</div>
          </td></tr>
          <tr><td style="padding:8px 32px 0;">
            <h1 style="margin:0 0 12px;font:600 24px/1.25 Fredoka,ui-sans-serif,system-ui,sans-serif;color:#1b1233;">Reset your password</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">{greeting}</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
              We received a request to reset the password for your Winnify account.
              Click the button below to choose a new one. This link expires in
              <strong>{minutes} minutes</strong> and can only be used once.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
              <tr><td style="border-radius:999px;background:#6b3fe7;">
                <a href="{safe_url}" style="display:inline-block;padding:14px 28px;font:600 15px Inter,ui-sans-serif,system-ui,sans-serif;color:#ffffff;text-decoration:none;border-radius:999px;">Set a new password</a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:rgba(27,18,51,0.62);">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;line-height:1.5;word-break:break-all;">
              <a href="{safe_url}" style="color:#6b3fe7;">{safe_url}</a>
            </p>
            <p style="margin:0 0 32px;font-size:13px;line-height:1.6;color:rgba(27,18,51,0.62);">
              Didn't ask for this? You can safely ignore this email — your password
              won't change until you open the link and set a new one.
            </p>
          </td></tr>
          <tr><td style="padding:16px 32px 28px;border-top:1px solid rgba(107,63,231,0.12);font-size:12px;color:rgba(27,18,51,0.4);">
            © 2026 Winnify · winnify.ai
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
"""

    text_body = (
        f"{greeting}\n\n"
        "We received a request to reset the password for your Winnify account.\n"
        f"Open this link to choose a new one (expires in {minutes} minutes, single use):\n\n"
        f"{url}\n\n"
        "Didn't ask for this? Ignore this email — your password won't change until "
        "you open the link and set a new one.\n\n"
        "— Winnify · winnify.ai\n"
    )
    return subject, html_body, text_body
