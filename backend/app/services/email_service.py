"""Outbound transactional email via Resend's REST API.

Uses httpx directly (already a dependency) rather than the `resend` SDK — the
surface we need is a single POST. Every send is best-effort: failures are
logged and raised as EmailNotSent so callers can decide whether the user
should ever learn about it (the password-reset flow deliberately does not).
"""
import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class EmailNotSent(Exception):
    pass


def is_configured() -> bool:
    return bool(settings.resend_api_key)


def send_email(*, to: str, subject: str, html: str, text: str,
               tags: dict[str, str] | None = None) -> str:
    """Send one email through Resend. Returns the Resend message id.

    Raises EmailNotSent when the API key is missing or Resend rejects the
    request (bad sender domain, invalid recipient, rate limit, outage…).
    """
    if not is_configured():
        raise EmailNotSent("RESEND_API_KEY is not configured")

    payload: dict = {
        "from": settings.resend_from_email,
        "to": [to],
        "subject": subject,
        "html": html,
        "text": text,
    }
    if settings.resend_reply_to:
        payload["reply_to"] = settings.resend_reply_to
    if tags:
        payload["tags"] = [{"name": k, "value": v} for k, v in tags.items()]

    try:
        resp = httpx.post(
            RESEND_API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            timeout=15.0,
        )
    except httpx.HTTPError as e:
        logger.error("resend: transport error sending %r to %s: %s", subject, to, e)
        raise EmailNotSent(str(e)) from e

    if resp.status_code >= 400:
        # Resend returns {"statusCode", "name", "message"} on errors.
        try:
            detail = resp.json().get("message", resp.text)
        except ValueError:
            detail = resp.text
        logger.error("resend: %s sending %r to %s: %s", resp.status_code, subject, to, detail)
        raise EmailNotSent(f"{resp.status_code}: {detail}")

    try:
        message_id = resp.json().get("id", "")
    except ValueError:
        message_id = ""
    logger.info("resend: sent %r to %s (id=%s)", subject, to, message_id or "?")
    return message_id
