"""Regression tests for the authorization hardening (audit fixes).

These use the mocked TestClient (conftest `client` + `mock_db`), overriding
get_current_user to impersonate a role, and stubbing the specific DB reads each
guard makes. They lock in three fixes:

  • demo login is gated by settings.demo_login_enabled
  • institute routes are scoped to the caller's own institute
  • generation job routes guard the owning course (cross-institute → 403)
"""

from unittest.mock import MagicMock

import pytest

from app.core.dependencies import get_current_user
from app.core.config import settings


def _as_user(app, user: dict):
    app.dependency_overrides[get_current_user] = lambda: user


# ── Demo-login gate ───────────────────────────────────────────────────────────

def test_demo_login_refused_when_disabled(client, monkeypatch):
    monkeypatch.setattr(settings, "demo_login_enabled", False)
    r = client.post("/api/v1/auth/demo",
                    json={"email": "superadmin@winnify.ai", "password": "demo@123"})
    assert r.status_code == 404


def test_demo_login_works_when_enabled(client, mock_db, monkeypatch):
    monkeypatch.setattr(settings, "demo_login_enabled", True)
    # The route upserts a profile then signs a token — mock returns are fine.
    mock_db.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])
    r = client.post("/api/v1/auth/demo",
                    json={"email": "superadmin@winnify.ai", "password": "demo@123"})
    assert r.status_code == 200
    assert r.json()["role"] == "superadmin"


# ── Institute scoping ─────────────────────────────────────────────────────────

def test_admin_cannot_read_other_institute(client, mock_db):
    from app.main import app
    _as_user(app, {"id": "u1", "role": "admin", "institute_id": "inst-A"})
    r = client.get("/api/v1/institutes/inst-B")
    assert r.status_code == 403
    app.dependency_overrides.pop(get_current_user, None)


def test_admin_can_read_own_institute(client, mock_db):
    from app.main import app
    _as_user(app, {"id": "u1", "role": "admin", "institute_id": "inst-A"})
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = \
        MagicMock(data={"id": "inst-A", "name": "A"})
    r = client.get("/api/v1/institutes/inst-A")
    assert r.status_code == 200
    app.dependency_overrides.pop(get_current_user, None)


# ── Generation job ownership ──────────────────────────────────────────────────

def test_get_job_blocks_cross_institute_faculty(client, mock_db):
    """A faculty from another institute who does not own the course is 403'd,
    not handed the job detail."""
    from app.main import app
    _as_user(app, {"id": "faculty-X", "role": "faculty", "institute_id": "inst-B"})

    # generation_jobs → topics → units → courses chain the guard walks.
    def _table(name):
        t = MagicMock()
        if name == "generation_jobs":
            t.select.return_value.eq.return_value.single.return_value.execute.return_value = \
                MagicMock(data={"id": "job1", "topic_id": "top1"})
        elif name == "topics":
            t.select.return_value.eq.return_value.single.return_value.execute.return_value = \
                MagicMock(data={"unit_id": "unit1"})
        elif name == "units":
            t.select.return_value.eq.return_value.single.return_value.execute.return_value = \
                MagicMock(data={"course_id": "course1"})
        elif name == "courses":
            t.select.return_value.eq.return_value.single.return_value.execute.return_value = \
                MagicMock(data={"id": "course1", "faculty_id": "faculty-owner",
                                "institute_id": "inst-A"})
        return t

    mock_db.table.side_effect = _table
    r = client.get("/api/v1/generate/jobs/job1")
    assert r.status_code == 403
    app.dependency_overrides.pop(get_current_user, None)
