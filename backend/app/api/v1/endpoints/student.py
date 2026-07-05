"""Student delivery (item 3): read-only browsing of published (faculty-approved)
content plus per-student reading/quiz progress. Content itself is served by the
generation endpoints, which gate students to approved artifacts."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.core.dependencies import get_db, get_current_user

router = APIRouter(prefix="/student", tags=["Student"])


def _topic_ids(course: dict) -> list[str]:
    return [t["id"] for u in course.get("units") or [] for t in u.get("topics") or []]


@router.get("/courses")
def list_courses(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Courses with a count of published lessons (approved student notes)."""
    rows = db.table("courses").select(
        "id, name, code, credits, semester, status, "
        "units(id, unit_number, title, topics(id, title))"
    ).order("created_at", desc=True).execute().data or []

    out = []
    for c in rows:
        tids = _topic_ids(c)
        published = 0
        if tids:
            arts = (db.table("concept_artifacts").select("id", count="exact")
                    .in_("topic_id", tids).eq("artifact_type", "student_notes")
                    .eq("approval_status", "approved").execute())
            published = arts.count or 0
        out.append({
            "id": c["id"], "name": c["name"], "code": c.get("code"),
            "semester": c.get("semester"), "status": c.get("status"),
            "unit_count": len(c.get("units") or []), "topic_count": len(tids),
            "published_lessons": published,
        })
    return out


@router.get("/courses/{course_id}")
def course_detail(course_id: str, user: dict = Depends(get_current_user),
                  db: Client = Depends(get_db)):
    """Units → topics with per-topic published lesson counts and this student's
    progress, so the Courses tab can render a syllabus with read-state."""
    res = db.table("courses").select(
        "id, name, code, semester, "
        "units(id, unit_number, title, topics(id, title, bloom_level))"
    ).eq("id", course_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Course not found")
    course = res.data
    tids = _topic_ids(course)

    approved: dict[str, dict] = {}   # topic_id -> {notes: [concept ids], slides: n, quiz: n}
    if tids:
        arts = (db.table("concept_artifacts")
                .select("topic_id, concept_id, artifact_type")
                .in_("topic_id", tids).eq("approval_status", "approved")
                .execute().data or [])
        for a in arts:
            slot = approved.setdefault(a["topic_id"], {"notes": [], "slides": 0, "quiz": 0})
            if a["artifact_type"] == "student_notes":
                slot["notes"].append(a["concept_id"])
            elif a["artifact_type"] == "slides":
                slot["slides"] += 1
            elif a["artifact_type"] == "quiz":
                slot["quiz"] += 1

    progress_rows = []
    try:
        progress_rows = (db.table("student_progress").select("*")
                         .eq("user_id", user["id"]).eq("course_id", course_id)
                         .execute().data or [])
    except Exception:
        pass  # table optional in older environments

    def concept_sort_key(cid: str):
        digits = "".join(ch for ch in cid if ch.isdigit())
        return (int(digits) if digits else 0, cid)

    units_out = []
    for u in sorted(course.get("units") or [], key=lambda x: x.get("unit_number") or 0):
        topics_out = []
        for t in u.get("topics") or []:
            slot = approved.get(t["id"], {"notes": [], "slides": 0, "quiz": 0})
            notes_ids = sorted(slot["notes"], key=concept_sort_key)
            topics_out.append({
                "id": t["id"], "title": t["title"], "bloom_level": t.get("bloom_level"),
                "published_lessons": len(notes_ids),
                "published_slides": slot["slides"], "published_quizzes": slot["quiz"],
                "first_concept_id": notes_ids[0] if notes_ids else None,
            })
        units_out.append({"id": u["id"], "unit_number": u.get("unit_number"),
                          "title": u.get("title"), "topics": topics_out})

    return {"id": course["id"], "name": course["name"], "code": course.get("code"),
            "semester": course.get("semester"), "units": units_out,
            "progress": progress_rows}


class ProgressUpsert(BaseModel):
    course_id: str | None = None
    topic_id: str
    concept_id: str
    artifact_type: str = "student_notes"
    status: str | None = None          # viewed | completed
    quiz_score: int | None = None
    quiz_total: int | None = None


@router.post("/progress")
def upsert_progress(payload: ProgressUpsert, user: dict = Depends(get_current_user),
                    db: Client = Depends(get_db)):
    """Record reading/quiz progress. Only student accounts are recorded —
    faculty previewing content never pollutes analytics."""
    if user.get("role") != "student":
        return {"skipped": True}

    existing = (db.table("student_progress").select("*")
                .eq("user_id", user["id"]).eq("topic_id", payload.topic_id)
                .eq("concept_id", payload.concept_id)
                .eq("artifact_type", payload.artifact_type)
                .limit(1).execute().data or [])
    prev = existing[0] if existing else {}

    # Never downgrade completed → viewed; keep the best quiz score.
    status = payload.status or prev.get("status") or "viewed"
    if prev.get("status") == "completed":
        status = "completed"
    quiz_score, quiz_total = prev.get("quiz_score"), prev.get("quiz_total")
    if payload.quiz_score is not None:
        if quiz_score is None or payload.quiz_score > quiz_score:
            quiz_score, quiz_total = payload.quiz_score, payload.quiz_total
        status = "completed"

    row = {
        "user_id": user["id"], "course_id": payload.course_id,
        "topic_id": payload.topic_id, "concept_id": payload.concept_id,
        "artifact_type": payload.artifact_type, "status": status,
        "quiz_score": quiz_score, "quiz_total": quiz_total,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    db.table("student_progress").upsert(
        row, on_conflict="user_id,topic_id,concept_id,artifact_type").execute()
    return {"status": status, "quiz_score": quiz_score, "quiz_total": quiz_total}
