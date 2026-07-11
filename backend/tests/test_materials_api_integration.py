"""Lightweight integration tests for the material endpoint guards.

Unlike test_materials.py (pure service-layer units), these exercise the real
FastAPI routes against a RUNNING backend + seeded Postgres — the fidelity the
mocked TestClient can't give, since the guards read course ownership from the
DB. They assert the auth/validation wiring: student→403, spoofed file→415,
duplicate→409, and that the happy path cleans up after itself.

Skips cleanly (never fails) when the backend isn't up, so `pytest` stays green
in CI / offline. To run them, start the backend and the seeded DB, then:

    WINNIFY_API=http://localhost:8000 pytest -m integration

Demo credentials come from the seed data (see winteach-frontend-dev-setup).
Override with WINNIFY_FACULTY_EMAIL / _STUDENT_EMAIL / _PASSWORD if yours differ.
"""

import os

import httpx
import pytest

pytestmark = pytest.mark.integration

BASE = os.environ.get("WINNIFY_API", "http://localhost:8000").rstrip("/")
API = f"{BASE}/api/v1"
FACULTY_EMAIL = os.environ.get("WINNIFY_FACULTY_EMAIL", "faculty@ciet.ac.in")
STUDENT_EMAIL = os.environ.get("WINNIFY_STUDENT_EMAIL", "student@gmail.com")
PASSWORD = os.environ.get("WINNIFY_PASSWORD", "demo@123")


def _login(client: httpx.Client, email: str) -> str:
    r = client.post(f"{API}/auth/login", json={"email": email, "password": PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"cannot log in as {email} ({r.status_code}) — check seed data")
    return r.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _make_tiny_pdf(text: str) -> bytes:
    """A real, digital (non-scanned) 1-page PDF the extractor will accept."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    # Enough selectable text that _is_scanned() passes and a chunk survives.
    page.insert_text((72, 72), (text + " ") * 40, fontsize=11)
    return doc.tobytes()


# Built ONCE and reused byte-for-byte: PyMuPDF stamps a non-deterministic
# document id/timestamp, so re-generating would change the sha256 and the
# duplicate-detection (409) test would silently pass against different bytes.
_PDF_BYTES = _make_tiny_pdf("B-Trees balanced index nodes")


@pytest.fixture(scope="module")
def client():
    c = httpx.Client(timeout=15)
    try:
        c.get(f"{BASE}/docs")  # cheap reachability probe
    except httpx.HTTPError:
        c.close()
        pytest.skip(f"backend not reachable at {BASE} — skipping integration tests")
    yield c
    c.close()


@pytest.fixture(scope="module")
def faculty_token(client):
    return _login(client, FACULTY_EMAIL)


@pytest.fixture(scope="module")
def student_token(client):
    return _login(client, STUDENT_EMAIL)


@pytest.fixture(scope="module")
def course_id(client, faculty_token):
    r = client.get(f"{API}/courses", headers=_auth(faculty_token))
    courses = r.json() if r.status_code == 200 else []
    if not courses:
        pytest.skip("seeded faculty owns no courses — cannot test course-scoped guards")
    return courses[0]["id"]


@pytest.fixture
def material(client, faculty_token, course_id):
    """Upload a course-wide material, yield its id, delete it afterwards."""
    files = {"file": ("guard-test.pdf", _PDF_BYTES, "application/pdf")}
    r = client.post(f"{API}/materials", headers=_auth(faculty_token),
                    files=files, data={"course_id": course_id, "is_course_wide": "true"})
    assert r.status_code == 201, r.text
    mid = r.json()["id"]
    yield mid
    client.delete(f"{API}/materials/{mid}", headers=_auth(faculty_token))


# ── Read guards: a student in another tenant is refused ───────────────────────

def test_student_cannot_get_material(client, material, student_token):
    r = client.get(f"{API}/materials/{material}", headers=_auth(student_token))
    assert r.status_code == 403


def test_student_cannot_download_material(client, material, student_token):
    r = client.get(f"{API}/materials/{material}/download", headers=_auth(student_token))
    assert r.status_code == 403


def test_student_cannot_list_course_materials(client, course_id, student_token):
    r = client.get(f"{API}/courses/{course_id}/materials", headers=_auth(student_token))
    assert r.status_code == 403


def test_faculty_can_get_own_material(client, material, faculty_token):
    r = client.get(f"{API}/materials/{material}", headers=_auth(faculty_token))
    assert r.status_code == 200
    assert r.json()["id"] == material


# ── Upload validation ─────────────────────────────────────────────────────────

def test_spoofed_content_type_rejected(client, faculty_token, course_id):
    """PDF content-type on non-PDF bytes → 415 (magic-byte sniff)."""
    files = {"file": ("fake.pdf", b"this is plainly not a pdf", "application/pdf")}
    r = client.post(f"{API}/materials", headers=_auth(faculty_token),
                    files=files, data={"course_id": course_id})
    assert r.status_code == 415


def test_duplicate_upload_conflicts(client, faculty_token, course_id, material):
    """Re-uploading identical bytes to the same course → 409, not a second row.
    Uses the same buffer the `material` fixture uploaded, so the hashes match."""
    files = {"file": ("guard-test.pdf", _PDF_BYTES, "application/pdf")}
    r = client.post(f"{API}/materials", headers=_auth(faculty_token),
                    files=files, data={"course_id": course_id})
    assert r.status_code == 409
