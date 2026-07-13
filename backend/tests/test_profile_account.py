"""Tests for the profile self-service endpoints: PATCH /auth/me and
POST /auth/change-password (mocked TestClient, per conftest)."""

from unittest.mock import MagicMock

from app.core.config import settings
from app.core.dependencies import get_current_user

_STUDENT = {"id": "u-1", "email": "student@gmail.com",
            "full_name": "Aarav Gupta", "role": "student", "institute_id": None}


def _as(app, user):
    app.dependency_overrides[get_current_user] = lambda: user


def _clear(app):
    app.dependency_overrides.pop(get_current_user, None)


def test_update_me_persists_and_returns_profile(client, mock_db):
    from app.main import app
    _as(app, dict(_STUDENT))

    fresh = {**_STUDENT, "designation": "B.Tech CSE · 2027", "skills": ["Python", "SQL"]}
    profiles = MagicMock()
    profiles.upsert.return_value.execute.return_value = MagicMock(data=[fresh])
    profiles.select.return_value.eq.return_value.single.return_value.execute.return_value = \
        MagicMock(data=fresh)
    mock_db.table.return_value = profiles

    r = client.patch("/api/v1/auth/me",
                     json={"designation": "B.Tech CSE · 2027", "skills": ["Python", "SQL"]})
    assert r.status_code == 200
    body = r.json()
    assert body["designation"] == "B.Tech CSE · 2027"
    assert body["skills"] == ["Python", "SQL"]
    # The upsert carried the edited fields
    sent = profiles.upsert.call_args[0][0]
    assert sent["designation"] == "B.Tech CSE · 2027"
    _clear(app)


def test_update_me_rejects_blank_name(client, mock_db):
    from app.main import app
    _as(app, dict(_STUDENT))
    r = client.patch("/api/v1/auth/me", json={"full_name": "   "})
    assert r.status_code == 422
    _clear(app)


def test_change_password_rejects_wrong_current(client, mock_db, monkeypatch):
    from app.main import app
    monkeypatch.setattr(settings, "demo_login_enabled", True)
    _as(app, dict(_STUDENT))
    r = client.post("/api/v1/auth/change-password",
                    json={"current_password": "wrong", "new_password": "newpass123"})
    # 400, not 401 — the frontend treats 401 as session expiry and signs out.
    assert r.status_code == 400
    _clear(app)


def test_change_password_rejects_short_new(client, mock_db):
    from app.main import app
    _as(app, dict(_STUDENT))
    r = client.post("/api/v1/auth/change-password",
                    json={"current_password": "demo@123", "new_password": "short"})
    assert r.status_code == 422
    _clear(app)


def test_change_password_demo_happy_path(client, mock_db, monkeypatch):
    from app.main import app
    from app.services import auth_service
    monkeypatch.setattr(settings, "demo_login_enabled", True)
    # Isolate the in-memory map so this test doesn't leak a changed password.
    monkeypatch.setitem(auth_service._DEMO_ACCOUNTS, "student@gmail.com",
                        {"name": "Aarav Gupta", "role": "student", "password": "demo@123"})
    _as(app, dict(_STUDENT))
    r = client.post("/api/v1/auth/change-password",
                    json={"current_password": "demo@123", "new_password": "newpass123"})
    assert r.status_code == 200 and r.json()["success"] is True
    assert auth_service._DEMO_ACCOUNTS["student@gmail.com"]["password"] == "newpass123"
    _clear(app)


def test_demo_seed_never_overwrites_profile_edits(mock_db):
    """Login-time demo seeding must be insert-only (ignore_duplicates): a plain
    upsert here reverted the user's profile edits on every login."""
    from app.services import auth_service

    mock_db.auth.admin.list_users.return_value = []
    created = MagicMock()
    created.user.id = "u-9"
    mock_db.auth.admin.create_user.return_value = created

    auth_service._ensure_demo_user(mock_db, "faculty@ciet.ac.in", "Dr. Amit Singh",
                                   "faculty", "demo@123")

    upsert = mock_db.table.return_value.upsert
    assert upsert.call_args.kwargs.get("ignore_duplicates") is True
    # The auth user is seeded with the account's own password, not a default —
    # otherwise map entries with non-default passwords could never sign in.
    assert mock_db.auth.admin.create_user.call_args[0][0]["password"] == "demo@123"


def test_update_me_profile_less_persona_gets_clear_400(client, mock_db):
    """JWT-only personas (superadmin) have no auth.users row, so the profiles
    FK rejects the insert — must surface as a 400, not a 500."""
    from app.main import app
    _as(app, {"id": "demo-1", "email": "superadmin@winnify.ai",
              "full_name": "Sai Teja", "role": "superadmin", "institute_id": None})

    profiles = MagicMock()
    profiles.upsert.return_value.execute.side_effect = Exception("FK violation")
    profiles.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_db.table.return_value = profiles

    r = client.patch("/api/v1/auth/me", json={"designation": "Head of Platform"})
    assert r.status_code == 400
    assert "profile" in r.json()["detail"].lower()
    _clear(app)
