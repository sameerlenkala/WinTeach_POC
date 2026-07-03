import uuid
from fastapi import HTTPException, status
from supabase import Client
from app.schemas.course import CourseCreate, CourseUpdate, CourseStatusPatch, COCreate, COUpdate, COMappingUpdate


# ── Course CRUD ───────────────────────────────────────────────────────────────

def create_course(db: Client, user: dict, payload: CourseCreate) -> dict:
    course_id = str(uuid.uuid4())
    db.table("courses").insert({
        "id": course_id,
        "faculty_id": user["id"],
        "institute_id": user.get("institute_id"),
        "name": payload.name,
        "code": payload.code,
        "credits": payload.credits,
        "semester": payload.semester,
        "regulation": payload.regulation,
        "status": payload.status,
    }).execute()

    for unit in payload.units:
        unit_id = str(uuid.uuid4())
        db.table("units").insert({
            "id": unit_id,
            "course_id": course_id,
            "title": unit.title,
            "unit_number": unit.unit_number,
            "hours": unit.hours,
        }).execute()
        for i, title in enumerate(unit.topics):
            db.table("topics").insert({
                "id": str(uuid.uuid4()),
                "unit_id": unit_id,
                "title": title,
                "order": i + 1,
            }).execute()

    for i, co_item in enumerate(payload.course_outcomes):
        if isinstance(co_item, str):
            co_text, bloom_level = co_item, None
        else:
            co_text, bloom_level = co_item.text, co_item.bloom or None
        row = {
            "id": str(uuid.uuid4()),
            "course_id": course_id,
            "co_number": i + 1,
            "description": co_text,
        }
        if bloom_level:
            row["bloom_level"] = bloom_level
        db.table("course_outcomes").insert(row).execute()

    return get_course(db, user, course_id)


def list_courses(db: Client, user: dict) -> list[dict]:
    q = db.table("courses").select("id, name, code, credits, semester, regulation, status, created_at, units(id, title, unit_number, hours, topics(id, title, order, bloom_level, subtopics(id, title, order)))")
    if user["role"] == "faculty":
        q = q.or_(f"faculty_id.eq.{user['id']},faculty_id.is.null")
    elif user["role"] == "admin":
        q = q.eq("institute_id", user.get("institute_id"))
    return q.order("created_at", desc=True).execute().data or []


def get_course(db: Client, user: dict, course_id: str) -> dict:
    row = db.table("courses").select(
        "*, units(*, topics(*)), course_outcomes(*)"
    ).eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    return row.data


def update_course(db: Client, user: dict, course_id: str, payload: CourseUpdate) -> dict:
    row = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    updates = payload.model_dump(exclude_none=True)
    if updates:
        db.table("courses").update(updates).eq("id", course_id).execute()
    return get_course(db, user, course_id)


def delete_course(db: Client, user: dict, course_id: str) -> None:
    row = db.table("courses").select("id, faculty_id, institute_id").eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    # Delete child rows first to avoid FK constraint violations.
    # Topics before course_outcomes (topics.co_id -> course_outcomes has no cascade).
    unit_rows = db.table("units").select("id").eq("course_id", course_id).execute().data or []
    for u in unit_rows:
        db.table("topics").delete().eq("unit_id", u["id"]).execute()
    db.table("units").delete().eq("course_id", course_id).execute()
    db.table("course_outcomes").delete().eq("course_id", course_id).execute()
    db.table("co_mappings").delete().eq("course_id", course_id).execute()
    # uploads.course_id / uploads.committed_to_course reference courses(id) WITHOUT
    # on-delete-cascade, so they must be cleared or the course delete raises a 500.
    db.table("uploads").delete().eq("course_id", course_id).execute()
    db.table("uploads").delete().eq("committed_to_course", course_id).execute()
    db.table("courses").delete().eq("id", course_id).execute()


def patch_status(db: Client, user: dict, course_id: str, payload: CourseStatusPatch) -> dict:
    row = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    db.table("courses").update({"status": payload.status}).eq("id", course_id).execute()
    return get_course(db, user, course_id)


# ── Course Outcomes ───────────────────────────────────────────────────────────

def list_cos(db: Client, user: dict, course_id: str) -> list[dict]:
    _require_course(db, user, course_id)
    return (
        db.table("course_outcomes")
        .select("*")
        .eq("course_id", course_id)
        .order("co_number")
        .execute()
        .data or []
    )


def add_cos(db: Client, user: dict, course_id: str, cos: list[COCreate]) -> list[dict]:
    _require_course(db, user, course_id)
    existing = db.table("course_outcomes").select("id").eq("course_id", course_id).execute()
    next_num = len(existing.data or []) + 1
    rows = []
    for i, co in enumerate(cos):
        row = {
            "id": str(uuid.uuid4()),
            "course_id": course_id,
            "co_number": next_num + i,
            "description": co.text,
            "bloom_level": co.bloom,
        }
        db.table("course_outcomes").insert(row).execute()
        rows.append(row)
    return rows


def update_co(db: Client, user: dict, course_id: str, co_id: str, payload: COUpdate) -> dict:
    _require_course(db, user, course_id)
    row = db.table("course_outcomes").select("*").eq("id", co_id).eq("course_id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course outcome not found")
    updates: dict = {}
    if payload.text is not None:
        updates["description"] = payload.text
    if payload.bloom is not None:
        updates["bloom_level"] = payload.bloom
    if updates:
        db.table("course_outcomes").update(updates).eq("id", co_id).execute()
    return db.table("course_outcomes").select("*").eq("id", co_id).single().execute().data


def delete_co(db: Client, user: dict, course_id: str, co_id: str) -> None:
    _require_course(db, user, course_id)
    db.table("course_outcomes").delete().eq("id", co_id).eq("course_id", course_id).execute()
    # Renumber remaining
    remaining = (
        db.table("course_outcomes")
        .select("id")
        .eq("course_id", course_id)
        .order("co_number")
        .execute()
        .data or []
    )
    for i, r in enumerate(remaining):
        db.table("course_outcomes").update({"co_number": i + 1}).eq("id", r["id"]).execute()


# ── CO ↔ PO/PSO Mapping ───────────────────────────────────────────────────────

def get_co_map(db: Client, user: dict, course_id: str) -> list[dict]:
    _require_course(db, user, course_id)
    return db.table("co_mappings").select("*").eq("course_id", course_id).execute().data or []


def save_co_map(db: Client, user: dict, course_id: str, payload: COMappingUpdate) -> list[dict]:
    _require_course(db, user, course_id)
    # Replace all mappings for this course
    db.table("co_mappings").delete().eq("course_id", course_id).execute()
    rows = []
    for entry in payload.mappings:
        for po_code in entry.po_codes:
            row = {
                "id": str(uuid.uuid4()),
                "course_id": course_id,
                "co_id": entry.co_id,
                "po_code": po_code,
                "pso_code": None,
                "level": entry.levels.get(po_code, 1),
            }
            db.table("co_mappings").insert(row).execute()
            rows.append(row)
        for pso_code in entry.pso_codes:
            row = {
                "id": str(uuid.uuid4()),
                "course_id": course_id,
                "co_id": entry.co_id,
                "po_code": None,
                "pso_code": pso_code,
                "level": entry.levels.get(pso_code, 1),
            }
            db.table("co_mappings").insert(row).execute()
            rows.append(row)
    return rows


# ── Structure Lock ────────────────────────────────────────────────────────────

def lock_structure(db: Client, user: dict, course_id: str) -> dict:
    row = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    db.table("courses").update({"structure_locked": True}).eq("id", course_id).execute()
    return {"course_id": course_id, "structure_locked": True}


# ── Internal helpers ──────────────────────────────────────────────────────────

def _require_course(db: Client, user: dict, course_id: str) -> dict:
    row = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    _check_access(user, row.data)
    return row.data


def _check_access(user: dict, course: dict) -> None:
    role = user["role"]
    if role == "superadmin":
        return
    if role == "admin" and course.get("institute_id") == user.get("institute_id"):
        return
    if role == "faculty":
        # Allow if this faculty created it, or if faculty_id is unset (legacy/demo courses)
        if course.get("faculty_id") in (user["id"], None, ""):
            return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
