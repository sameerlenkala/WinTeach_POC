from fastapi import APIRouter, Depends
from supabase import Client
from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.course import CourseCreate, CourseUpdate, CourseStatusPatch, COCreate, COUpdate, COMappingUpdate
from app.services import course_service

router = APIRouter(prefix="/courses", tags=["Courses"])

_faculty_above = require_role("faculty", "admin", "superadmin")


@router.post("", status_code=201)
def create_course(payload: CourseCreate, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.create_course(db, user, payload)


@router.get("")
def list_courses(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return course_service.list_courses(db, user)


@router.get("/{course_id}")
def get_course(course_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return course_service.get_course(db, user, course_id)


@router.patch("/{course_id}")
def update_course(course_id: str, payload: CourseUpdate, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.update_course(db, user, course_id, payload)


@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: str, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    course_service.delete_course(db, user, course_id)


@router.patch("/{course_id}/status")
def patch_status(course_id: str, payload: CourseStatusPatch, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.patch_status(db, user, course_id, payload)


# ── Course Outcomes ───────────────────────────────────────────────────────────

@router.get("/{course_id}/cos")
def list_cos(course_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return course_service.list_cos(db, user, course_id)


@router.post("/{course_id}/cos", status_code=201)
def add_cos(course_id: str, payload: list[COCreate], user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.add_cos(db, user, course_id, payload)


@router.patch("/{course_id}/cos/{co_id}")
def update_co(course_id: str, co_id: str, payload: COUpdate, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.update_co(db, user, course_id, co_id, payload)


@router.delete("/{course_id}/cos/{co_id}", status_code=204)
def delete_co(course_id: str, co_id: str, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    course_service.delete_co(db, user, course_id, co_id)


# ── Units & Topics ───────────────────────────────────────────────────────────

@router.get("/{course_id}/units")
def list_units(course_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    units = (
        db.table("units").select("*").eq("course_id", course_id).order("unit_number").execute().data or []
    )
    for unit in units:
        topics = (
            db.table("topics").select("*").eq("unit_id", unit["id"]).order("order").execute().data or []
        )
        for topic in topics:
            topic["subtopics"] = (
                db.table("subtopics").select("*").eq("topic_id", topic["id"]).order("order").execute().data or []
            )
        unit["topics"] = topics
    return units


@router.get("/{course_id}/topics/{topic_id}")
def get_topic(course_id: str, topic_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    from fastapi import HTTPException
    topic = db.table("topics").select("*").eq("id", topic_id).single().execute().data
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic["subtopics"] = db.table("subtopics").select("*").eq("topic_id", topic_id).order("order").execute().data or []
    # Attach unit info
    if topic.get("unit_id"):
        unit = db.table("units").select("id, title, unit_number").eq("id", topic["unit_id"]).single().execute().data
        topic["unit"] = unit
    # Attach first CO that matches by co_number == unit_number (common Indian syllabus convention)
    unit_number = (topic.get("unit") or {}).get("unit_number") or topic.get("order", 1)
    cos = db.table("course_outcomes").select("id, co_number, description, bloom_level").eq("course_id", course_id).order("co_number").execute().data or []
    matched_co = next((c for c in cos if c["co_number"] == unit_number), cos[0] if cos else None)
    topic["linked_co"] = matched_co
    return topic


# ── CO ↔ PO/PSO Mapping ───────────────────────────────────────────────────────

@router.get("/{course_id}/co-map")
def get_co_map(course_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return course_service.get_co_map(db, user, course_id)


@router.post("/{course_id}/co-map")
def save_co_map(course_id: str, payload: COMappingUpdate, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.save_co_map(db, user, course_id, payload)


# ── Structure Lock ────────────────────────────────────────────────────────────

@router.post("/{course_id}/structure/lock")
def lock_structure(course_id: str, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return course_service.lock_structure(db, user, course_id)
