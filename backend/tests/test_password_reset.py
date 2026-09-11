"""Forgot-password flow: POST /auth/password-reset/request and
POST /auth/password-reset/confirm (mocked TestClient, per conftest), plus the
Resend transport."""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import httpx
import pytest

from app.core.config import settings
from app.services import email_service, password_reset_service as prs


def _profiles(mock_db, rows):
    table = MagicMock()
    table.select.return_value.eq.return_value.limit.return_value.execute.return_value = \
        MagicMock(data=rows)
    return table


def _resets(count=0, rows=None):
    table = MagicMock()
    # rate-limit query: select(..., count="exact").eq().gte().execute()
    table.select.return_value.eq.return_value.gte.return_value.execute.return_value = \
        MagicMock(data=[], count=count)
    # token lookup: select("*").eq().limit().execute()
    table.select.return_value.eq.return_value.limit.return_value.execute.return_value = \
        MagicMock(data=rows or [])
    return table


def _route_tables(mock_db, profiles, resets):
    mock_db.table.side_effect = lambda name: {"profiles": profiles,
                                              "password_resets": resets}[name]


# ── request ──────────────────────────────────────────────────────────────────

def test_request_is_generic_and_202_for_unknown_email(client, mock_db, monkeypatch):
    sent = []
    monkeypatch.setattr(email_service, "send_email", lambda **kw: sent.append(kw) or "id")
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    _route_tables(mock_db, _profiles(mock_db, []), _resets())

    r = client.post("/api/v1/auth/password-reset/request", json={"email": "nobody@x.io"})
    assert r.status_code == 202
    assert "If an account exists" in r.json()["message"]
    assert sent == []  # nothing minted, nothing emailed


def test_request_mints_hashed_token_and_emails_link(client, mock_db, monkeypatch):
    sent = []
    monkeypatch.setattr(email_service, "send_email", lambda **kw: sent.append(kw) or "id")
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    monkeypatch.setattr(settings, "frontend_url", "https://app.winnify.ai")
    profiles = _profiles(mock_db, [{"id": "u-1", "email": "a@b.io", "full_name": "Asha"}])
    resets = _resets()
    _route_tables(mock_db, profiles, resets)

    r = client.post("/api/v1/auth/password-reset/request",
                    json={"email": "A@B.io ", "app": "study"})
    assert r.status_code == 202

    inserted = resets.insert.call_args[0][0]
    assert inserted["user_id"] == "u-1"
    assert inserted["email"] == "a@b.io"
    assert len(inserted["token_hash"]) == 64  # sha256 hex, never the raw token

    assert len(sent) == 1
    msg = sent[0]
    assert msg["to"] == "a@b.io"
    assert "Reset your Winnify password" == msg["subject"]
    assert "Hi Asha," in msg["text"]
    # The emailed link carries the raw token whose hash was stored, plus the app hint.
    token = msg["text"].split("reset-password?token=")[1].split("&")[0]
    assert prs.hash_token(token) == inserted["token_hash"]
    assert "https://app.winnify.ai/reset-password?token=" in msg["html"]
    assert "app=study" in msg["text"]


def test_request_respects_per_email_rate_limit(client, mock_db, monkeypatch):
    sent = []
    monkeypatch.setattr(email_service, "send_email", lambda **kw: sent.append(kw) or "id")
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    profiles = _profiles(mock_db, [{"id": "u-1", "email": "a@b.io", "full_name": ""}])
    resets = _resets(count=settings.password_reset_max_per_hour)
    _route_tables(mock_db, profiles, resets)

    r = client.post("/api/v1/auth/password-reset/request", json={"email": "a@b.io"})
    assert r.status_code == 202  # same answer as a success
    resets.insert.assert_not_called()
    assert sent == []


def test_request_without_resend_key_still_stores_token_but_does_not_send(client, mock_db, monkeypatch, caplog):
    monkeypatch.setattr(settings, "resend_api_key", "")
    monkeypatch.setattr(settings, "demo_login_enabled", True)
    profiles = _profiles(mock_db, [{"id": "u-1", "email": "a@b.io", "full_name": ""}])
    resets = _resets()
    _route_tables(mock_db, profiles, resets)
    posted = []
    monkeypatch.setattr(httpx, "post", lambda *a, **k: posted.append(a) or MagicMock())

    with caplog.at_level("WARNING"):
        r = client.post("/api/v1/auth/password-reset/request", json={"email": "a@b.io"})
    assert r.status_code == 202
    resets.insert.assert_called_once()
    assert posted == []
    # Demo mode logs the link so local dev can complete the flow.
    assert any("/reset-password?token=" in rec.getMessage() for rec in caplog.records)


def test_request_rejects_malformed_email(client, mock_db):
    r = client.post("/api/v1/auth/password-reset/request", json={"email": "not-an-email"})
    assert r.status_code == 422


# ── confirm ──────────────────────────────────────────────────────────────────

def _live_row(token="tok", **over):
    row = {"id": "r-1", "user_id": "u-1", "email": "a@b.io",
           "token_hash": prs.hash_token(token), "used_at": None,
           "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()}
    row.update(over)
    return row


def test_confirm_happy_path_sets_password_and_burns_tokens(client, mock_db):
    resets = _resets(rows=[_live_row("tok")])
    _route_tables(mock_db, _profiles(mock_db, []), resets)

    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "tok", "new_password": "longenough1"})
    assert r.status_code == 200, r.text
    assert r.json()["success"] is True
    mock_db.auth.admin.update_user_by_id.assert_called_once_with("u-1", {"password": "longenough1"})
    # Row consumed + every other live token for the user invalidated.
    updates = [c.args[0] for c in resets.update.call_args_list]
    assert len(updates) == 2 and all("used_at" in u for u in updates)


@pytest.mark.parametrize("row", [
    None,
    _live_row("tok", used_at="2026-01-01T00:00:00+00:00"),
    _live_row("tok", expires_at=(datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()),
])
def test_confirm_rejects_missing_used_or_expired_token(client, mock_db, row):
    resets = _resets(rows=[row] if row else [])
    _route_tables(mock_db, _profiles(mock_db, []), resets)

    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "tok", "new_password": "longenough1"})
    assert r.status_code == 400
    assert "invalid or has expired" in r.json()["detail"]
    mock_db.auth.admin.update_user_by_id.assert_not_called()


def test_confirm_rejects_short_password_before_touching_db(client, mock_db):
    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "tok", "new_password": "short"})
    assert r.status_code == 422
    mock_db.table.assert_not_called()


def test_confirm_wrong_token_does_not_match_hash(client, mock_db):
    resets = _resets(rows=[])  # lookup by hash("wrong") finds nothing
    _route_tables(mock_db, _profiles(mock_db, []), resets)
    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "wrong", "new_password": "longenough1"})
    assert r.status_code == 400


def test_confirm_surfaces_admin_update_failure_as_400(client, mock_db):
    resets = _resets(rows=[_live_row("tok")])
    _route_tables(mock_db, _profiles(mock_db, []), resets)
    mock_db.auth.admin.update_user_by_id.side_effect = RuntimeError("no auth user")

    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "tok", "new_password": "longenough1"})
    assert r.status_code == 400
    resets.update.assert_not_called()  # token stays live for a retry via support


def test_confirm_relays_supabase_password_policy_as_422(client, mock_db):
    from gotrue.errors import AuthWeakPasswordError
    resets = _resets(rows=[_live_row("tok")])
    _route_tables(mock_db, _profiles(mock_db, []), resets)
    mock_db.auth.admin.update_user_by_id.side_effect = AuthWeakPasswordError(
        "Password should contain at least one uppercase letter", 422, ["uppercase"])

    r = client.post("/api/v1/auth/password-reset/confirm",
                    json={"token": "tok", "new_password": "alllowercase1!"})
    assert r.status_code == 422
    assert "uppercase" in r.json()["detail"]
    resets.update.assert_not_called()  # token survives for a retry


# ── Resend transport ─────────────────────────────────────────────────────────

def test_send_email_posts_to_resend(monkeypatch):
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    monkeypatch.setattr(settings, "resend_from_email", "Winnify <no-reply@winnify.ai>")
    calls = []

    def fake_post(url, json, headers, timeout):
        calls.append((url, json, headers))
        return MagicMock(status_code=200, json=lambda: {"id": "msg_1"})
    monkeypatch.setattr(httpx, "post", fake_post)

    mid = email_service.send_email(to="a@b.io", subject="s", html="<b>h</b>", text="t",
                                   tags={"category": "password_reset"})
    assert mid == "msg_1"
    url, body, headers = calls[0]
    assert url == email_service.RESEND_API_URL
    assert headers["Authorization"] == "Bearer re_test"
    assert body["from"] == "Winnify <no-reply@winnify.ai>"
    assert body["to"] == ["a@b.io"]
    assert body["tags"] == [{"name": "category", "value": "password_reset"}]


def test_send_email_raises_on_resend_error(monkeypatch):
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    monkeypatch.setattr(httpx, "post", lambda *a, **k: MagicMock(
        status_code=403, json=lambda: {"message": "domain not verified"}, text="x"))
    with pytest.raises(email_service.EmailNotSent, match="domain not verified"):
        email_service.send_email(to="a@b.io", subject="s", html="h", text="t")


def test_send_email_raises_when_unconfigured(monkeypatch):
    monkeypatch.setattr(settings, "resend_api_key", "")
    with pytest.raises(email_service.EmailNotSent):
        email_service.send_email(to="a@b.io", subject="s", html="h", text="t")


def test_old_demo_reset_endpoint_is_gone(client):
    r = client.post("/api/v1/auth/reset-password", json={"email": "a@b.io", "new_password": "x"})
    assert r.status_code == 404
