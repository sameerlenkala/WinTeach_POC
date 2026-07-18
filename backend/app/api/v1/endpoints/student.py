"""Student delivery (item 3): read-only browsing of published (faculty-approved)
content plus per-student reading/quiz progress. Content itself is served by the
generation endpoints, which gate students to approved artifacts.

Self-Learning module (P1+P2) extends this with: Learn Home (resume + due-cards),
quiz attempt history, flashcard SRS, computed mastery, revision hub, analytics."""

import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from supabase import Client

from app.core.dependencies import get_db, get_current_user

router = APIRouter(prefix="/student", tags=["Student"])

# SM-2-lite: bucket 0..4 → days until the card is due again.
SRS_INTERVALS_DAYS = [0, 1, 3, 7, 21]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _topic_ids(course: dict) -> list[str]:
    return [t["id"] for u in course.get("units") or [] for t in u.get("topics") or []]


def _visible_to_student(user: dict, course: dict) -> bool:
    """Institute tenancy: get_db bypasses RLS, so hide courses from other
    institutes here. None on either side passes — demo personas and legacy
    rows carry institute_id=None."""
    inst, cinst = user.get("institute_id"), course.get("institute_id")
    return not (inst and cinst and inst != cinst)


def _scope_courses(q, user: dict):
    """Apply the same tenancy rule as a query filter: the student's institute
    plus institute-less (demo/legacy) courses; no institute → no filter."""
    inst = user.get("institute_id")
    return q.or_(f"institute_id.eq.{inst},institute_id.is.null") if inst else q


def _concept_sort_key(cid: str):
    digits = "".join(ch for ch in cid if ch.isdigit())
    return (int(digits) if digits else 0, cid)


def _progress_rows(db: Client, user_id: str, *, course_id: str | None = None,
                   topic_ids: list[str] | None = None) -> list[dict]:
    try:
        q = db.table("student_progress").select("*").eq("user_id", user_id)
        if course_id:
            q = q.eq("course_id", course_id)
        if topic_ids:
            q = q.in_("topic_id", topic_ids)
        return q.execute().data or []
    except Exception:
        return []


def _topic_mastery(rows: list[dict], published_lessons: int, published_quizzes: int) -> int:
    """Computed mastery 0..100 for one topic: 0.5·read + 0.3·best-quiz + 0.2·checkins.
    Quiz weight redistributes to reading when a topic has no quiz."""
    if published_lessons <= 0:
        return 0
    notes = [r for r in rows if r.get("artifact_type") == "student_notes"]
    read = min(len([r for r in notes if r.get("status") in ("viewed", "completed")]),
               published_lessons) / published_lessons
    completed = min(len([r for r in notes if r.get("status") == "completed"]),
                    published_lessons) / published_lessons

    quiz = [r for r in rows if r.get("artifact_type") == "quiz" and r.get("quiz_total")]
    if published_quizzes > 0:
        # The quiz counts even when unattempted — an untaken assessment is 0, not
        # redistributed. Only a quizless topic reallocates the weight to reading.
        ratios = [(r["quiz_score"] or 0) / r["quiz_total"] for r in quiz if r.get("quiz_total")]
        best = sum(ratios) / len(ratios) if ratios else 0.0
        score = 0.5 * read + 0.3 * best + 0.2 * completed
    else:
        # No quiz exists — reading + completion carry the whole weight.
        score = 0.7 * read + 0.3 * completed
    return round(min(max(score, 0.0), 1.0) * 100)


@router.get("/courses")
def list_courses(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Courses with a count of published lessons (approved student notes)."""
    q = db.table("courses").select(
        "id, name, code, credits, semester, status, institute_id, "
        "units(id, unit_number, title, topics(id, title))"
    )
    rows = _scope_courses(q, user).order("created_at", desc=True).execute().data or []

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
        "id, name, code, semester, institute_id, "
        "units(id, unit_number, title, topics(id, title, bloom_level))"
    ).eq("id", course_id).limit(1).execute()
    if not res.data or not _visible_to_student(user, res.data[0]):
        raise HTTPException(status_code=404, detail="Course not found")
    course = res.data[0]
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


# Topic-level artifacts a student may see. Faculty Diagnostic is intentionally
# excluded — it is a private pre-teaching self-check ("nothing reported upward")
# and must never be served to learners.
_STUDENT_TOPIC_ARTS = ("summary", "assignment", "flashcards")


def _topic_in_course(db: Client, user: dict, course_id: str, topic_id: str) -> dict | None:
    """Return {"course": ..., "topic": ...} when topic_id belongs to course_id
    and the course is visible to this student, else None — so a student can't
    read one course's topic through another, or across institutes."""
    res = db.table("courses").select(
        "id, name, code, institute_id, "
        "units(id, unit_number, title, topics(id, title, bloom_level))"
    ).eq("id", course_id).limit(1).execute()
    if not res.data or not _visible_to_student(user, res.data[0]):
        return None
    course = res.data[0]
    for u in course.get("units") or []:
        for t in u.get("topics") or []:
            if t["id"] == topic_id:
                return {"course": course, "topic": t}
    return None


def _sanitize_assignment(content: dict) -> dict:
    """Strip instructor-only material from a student-facing assignment: the
    per-task model-answer outlines and the legacy single model solution. Rubric
    criteria and the integrity policy are kept — students should see those."""
    c = dict(content or {})
    c.pop("model_solution", None)
    c["tasks"] = [{k: v for k, v in (t or {}).items() if k != "model_answer_outline"}
                  for t in (c.get("tasks") or [])]
    return c


@router.get("/courses/{course_id}/topic/{topic_id}")
def topic_detail(course_id: str, topic_id: str, user: dict = Depends(get_current_user),
                 db: Client = Depends(get_db)):
    """Student topic landing page: published subtopics (notes/slides/quiz) plus
    which topic-level artifacts are ready. Mirrors the faculty studio, gated to
    approved concept artifacts and student-safe topic artifacts."""
    found = _topic_in_course(db, user, course_id, topic_id)
    if not found:
        raise HTTPException(status_code=404, detail="Topic not found")
    course, topic = found["course"], found["topic"]

    # Approved concept artifacts → per-subtopic capabilities.
    by_concept: dict[str, set[str]] = {}
    for a in (db.table("concept_artifacts").select("concept_id, artifact_type")
              .eq("topic_id", topic_id).eq("approval_status", "approved")
              .execute().data or []):
        by_concept.setdefault(a["concept_id"], set()).add(a["artifact_type"])

    # The full subtopic roadmap comes from the topic plan's concept inventory
    # (in its pedagogical order); titles too. We surface every subtopic — the
    # ones without approved notes render as locked "not published yet" — so the
    # topic page shows the same complete structure the course page does.
    names: dict[str, str] = {}
    order: list[str] = []
    plan_rows = (db.table("artifacts").select("content")
                 .eq("topic_id", topic_id).eq("type", "topic_plan")
                 .limit(1).execute().data or [])
    if plan_rows:
        for c in (plan_rows[0].get("content") or {}).get("concept_inventory") or []:
            cid = c.get("concept_id")
            if cid and cid not in names:
                names[cid] = c.get("concept_name") or cid
                order.append(cid)
    # Any approved concept missing from the plan (older topics, plan edits) still
    # gets listed so a published lesson is never hidden.
    for cid in sorted(by_concept, key=_concept_sort_key):
        if cid not in names:
            names[cid] = cid
            order.append(cid)

    subtopics = []
    for cid in order:
        types = by_concept.get(cid, set())
        published = "student_notes" in types
        subtopics.append({
            "concept_id": cid, "title": names.get(cid, cid),
            "published": published, "has_notes": published,
            "has_slides": "slides" in types, "has_quiz": "quiz" in types,
        })
    first_published = next((s["concept_id"] for s in subtopics if s["published"]), None)

    # Topic artifacts are "published" for students once review_status is ready —
    # they derive from already-approved notes, so there is no separate approval.
    ready: set[str] = set()
    for a in (db.table("artifacts").select("type, review_status")
              .eq("topic_id", topic_id).in_("type", list(_STUDENT_TOPIC_ARTS))
              .execute().data or []):
        if a.get("review_status") == "ready":
            ready.add(a["type"])

    return {
        "course_id": course_id, "course_name": course["name"], "code": course.get("code"),
        "topic_id": topic_id, "title": topic["title"], "bloom_level": topic.get("bloom_level"),
        "subtopics": subtopics,
        "first_concept_id": first_published,
        "artifacts": {k: (k in ready) for k in _STUDENT_TOPIC_ARTS},
    }


@router.get("/courses/{course_id}/topic/{topic_id}/artifact/{kind}")
def topic_artifact(course_id: str, topic_id: str, kind: str,
                   user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Sanitized topic-level artifact content for a student. Only summary,
    assignment, and flashcards are servable; faculty_diagnostic is never
    exposed. An artifact must be review_status=ready to be published."""
    if kind not in _STUDENT_TOPIC_ARTS:
        raise HTTPException(status_code=404, detail="Artifact not available")
    found = _topic_in_course(db, user, course_id, topic_id)
    if not found:
        raise HTTPException(status_code=404, detail="Topic not found")
    rows = (db.table("artifacts").select("content, review_status")
            .eq("topic_id", topic_id).eq("type", kind).limit(1).execute().data or [])
    if not rows or rows[0].get("review_status") != "ready":
        raise HTTPException(status_code=404, detail="Not published yet")
    content = rows[0].get("content") or {}
    if kind == "assignment":
        content = _sanitize_assignment(content)
    return {"kind": kind, "content": content,
            "topic_title": found["topic"]["title"], "code": found["course"].get("code")}


class ProgressUpsert(BaseModel):
    course_id: str | None = None
    topic_id: str
    concept_id: str
    artifact_type: str = "student_notes"
    status: str | None = None          # viewed | completed
    quiz_score: int | None = None
    quiz_total: int | None = None
    scroll_pct: int | None = None      # reading telemetry (scroll+dwell completion)
    dwell_sec: int | None = None


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
    # Stamp completed_at once on the viewed→completed transition, so weekly
    # "completed this week" stats key off real completion, not telemetry churn.
    if status == "completed" and prev.get("status") != "completed":
        row["completed_at"] = datetime.now(timezone.utc).isoformat()
    if payload.scroll_pct is not None:
        row["scroll_pct"] = max(int(payload.scroll_pct), prev.get("scroll_pct") or 0)
    if payload.dwell_sec is not None:
        row["dwell_sec"] = max(int(payload.dwell_sec), prev.get("dwell_sec") or 0)

    db.table("student_progress").upsert(
        row, on_conflict="user_id,topic_id,concept_id,artifact_type").execute()

    # Keep the learner's resume pointer fresh on every notes touch. Pass scroll
    # only when reported — status-only writes must not zero a saved percentage.
    if payload.artifact_type == "student_notes":
        _save_resume(db, user["id"], payload.course_id, payload.topic_id,
                     payload.concept_id, payload.scroll_pct)
    return {"status": status, "quiz_score": quiz_score, "quiz_total": quiz_total}


# ── Self-Learning: resume, home, mastery, attempts, revision, flashcards ──────

def _save_resume(db: Client, user_id: str, course_id, topic_id, concept_id, scroll_pct):
    row = {
        "user_id": user_id, "resume_course_id": course_id,
        "resume_topic_id": topic_id, "resume_concept_id": concept_id,
        "updated_at": _now().isoformat(),
    }
    # Only touch the scroll % when the caller actually reported one; omitting the
    # column from the upsert preserves the last telemetry value on conflict
    # (status-only writes would otherwise reset it to 0).
    if scroll_pct is not None:
        row["resume_scroll_pct"] = int(scroll_pct)
    try:
        db.table("learner_state").upsert(row, on_conflict="user_id").execute()
    except Exception:
        pass


def _course_structures(db: Client, user: dict) -> list[dict]:
    q = db.table("courses").select(
        "id, name, code, semester, institute_id, "
        "units(id, unit_number, title, topics(id, title))"
    )
    return _scope_courses(q, user).order("created_at", desc=True).execute().data or []


def _approved_map(db: Client, topic_ids: list[str]) -> dict[str, dict]:
    """topic_id → {notes:[concept ids], slides:n, quiz:n}."""
    out: dict[str, dict] = {}
    if not topic_ids:
        return out
    arts = (db.table("concept_artifacts")
            .select("topic_id, concept_id, artifact_type")
            .in_("topic_id", topic_ids).eq("approval_status", "approved")
            .execute().data or [])
    for a in arts:
        slot = out.setdefault(a["topic_id"], {"notes": [], "slides": 0, "quiz": 0})
        if a["artifact_type"] == "student_notes":
            slot["notes"].append(a["concept_id"])
        elif a["artifact_type"] == "slides":
            slot["slides"] += 1
        elif a["artifact_type"] == "quiz":
            slot["quiz"] += 1
    return out


def _course_mastery(course: dict, approved: dict[str, dict],
                    prog_by_topic: dict[str, list[dict]]) -> dict:
    """Per-topic + rolled-up course mastery and read counts."""
    topics_out, mvals = [], []
    total_notes = read_notes = 0
    for u in course.get("units") or []:
        for t in u.get("topics") or []:
            slot = approved.get(t["id"], {"notes": [], "slides": 0, "quiz": 0})
            pl, pq = len(slot["notes"]), slot["quiz"]
            rows = prog_by_topic.get(t["id"], [])
            m = _topic_mastery(rows, pl, pq)
            read = min(len([r for r in rows if r.get("artifact_type") == "student_notes"]), pl)
            total_notes += pl
            read_notes += read
            if pl > 0:
                mvals.append(m)
                topics_out.append({"id": t["id"], "title": t["title"],
                                   "published_lessons": pl, "read": read, "mastery_pct": m})
    course_m = round(sum(mvals) / len(mvals)) if mvals else 0
    return {"mastery_pct": course_m, "topics": topics_out,
            "published_lessons": total_notes, "read_lessons": read_notes}


def _due_by_course(db: Client, uid: str, courses: list[dict],
                   approved: dict[str, dict]) -> dict[str, int]:
    """Per-course count of flashcards due now, WITHOUT fetching note content —
    reads the flashcard_count column and the user's review rows only. An unseen
    card (no review row) is due; a reviewed card is due when due_at ≤ now."""
    all_tids = [t["id"] for c in courses
                for t in (t2 for u in c.get("units") or [] for t2 in u.get("topics") or [])]
    counts: dict[str, dict] = {}  # topic_id → {concept_id → flashcard_count}
    if all_tids:
        try:
            for r in (db.table("concept_artifacts")
                      .select("topic_id, concept_id, flashcard_count")
                      .in_("topic_id", all_tids).eq("artifact_type", "student_notes")
                      .eq("approval_status", "approved").execute().data or []):
                counts.setdefault(r["topic_id"], {})[r["concept_id"]] = r.get("flashcard_count")
        except Exception:
            return {}

    now_iso = _now().isoformat()
    # Review rows grouped by "topic:concept:" prefix parsed from card_key.
    seen: dict[str, int] = {}
    due_reviewed: dict[str, int] = {}
    try:
        for r in (db.table("flashcard_reviews").select("card_key, due_at")
                  .eq("user_id", uid).execute().data or []):
            parts = (r.get("card_key") or "").split(":")
            if len(parts) < 3:
                continue
            scope = f"{parts[0]}:{parts[1]}:"
            seen[scope] = seen.get(scope, 0) + 1
            if (r.get("due_at") or now_iso) <= now_iso:
                due_reviewed[scope] = due_reviewed.get(scope, 0) + 1
    except Exception:
        pass

    out: dict[str, int] = {}
    for c in courses:
        total_due = 0
        for u in c.get("units") or []:
            for t in u.get("topics") or []:
                for cid, cnt in (counts.get(t["id"]) or {}).items():
                    if not cnt:
                        continue
                    scope = f"{t['id']}:{cid}:"
                    unseen = max(cnt - seen.get(scope, 0), 0)
                    total_due += unseen + due_reviewed.get(scope, 0)
        out[c["id"]] = total_due
    return out


@router.get("/home")
def learn_home(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Learn Home (SCR-01): resume pointer, due flashcards, this-week activity,
    and every course with computed mastery + read progress."""
    uid = user["id"]
    courses = _course_structures(db, user)
    all_tids = [t["id"] for c in courses for t in
                (t2 for u in c.get("units") or [] for t2 in u.get("topics") or [])]
    approved = _approved_map(db, all_tids)
    prog = _progress_rows(db, uid)
    prog_by_topic: dict[str, list[dict]] = {}
    for p in prog:
        prog_by_topic.setdefault(p["topic_id"], []).append(p)

    courses_out = []
    for c in courses:
        cm = _course_mastery(c, approved, prog_by_topic)
        if cm["published_lessons"] == 0:
            continue
        courses_out.append({
            "id": c["id"], "name": c["name"], "code": c.get("code"),
            "semester": c.get("semester"),
            "published_lessons": cm["published_lessons"],
            "read_lessons": cm["read_lessons"], "mastery_pct": cm["mastery_pct"],
        })

    # This week's activity from completed_at (the moment a lesson was completed),
    # NOT updated_at — telemetry flushes rewrite updated_at on old completions.
    week_start = _now() - timedelta(days=7)
    completed_this_week, active_days = 0, set()
    for p in prog:
        if p.get("artifact_type") == "student_notes" and p.get("status") == "completed":
            ts = p.get("completed_at") or p.get("updated_at")
            try:
                dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
            except Exception:
                continue
            if dt >= week_start:
                completed_this_week += 1
                active_days.add(dt.date().isoformat())

    # Resume pointer, enriched with names the ContinueCard needs.
    resume = None
    try:
        ls = (db.table("learner_state").select("*").eq("user_id", uid)
              .limit(1).execute().data or [])
        if ls and ls[0].get("resume_concept_id"):
            r = ls[0]
            cmatch = next((c for c in courses if c["id"] == r.get("resume_course_id")), None)
            tmatch = None
            if cmatch:
                tmatch = next((t for u in cmatch.get("units") or []
                               for t in u.get("topics") or []
                               if t["id"] == r.get("resume_topic_id")), None)
            # Only surface resume if that lesson is still published.
            if cmatch and tmatch and r["resume_concept_id"] in \
                    approved.get(tmatch["id"], {}).get("notes", []):
                resume = {
                    "course_id": r["resume_course_id"], "course_name": cmatch["name"],
                    "topic_id": r["resume_topic_id"], "topic_title": tmatch["title"],
                    "concept_id": r["resume_concept_id"],
                    "scroll_pct": r.get("resume_scroll_pct") or 0,
                }
    except Exception:
        pass

    # Per-course due counts (content-free). The Revision chip must open the same
    # course whose count it shows, so pick a single target: the resume course if
    # it has cards due, else the course with the most due.
    due_by_course = _due_by_course(db, uid, courses, approved)
    due_cards = sum(due_by_course.values())
    resume_cid = resume["course_id"] if resume else None
    if resume_cid and due_by_course.get(resume_cid, 0) > 0:
        target = resume_cid
    else:
        target = max(due_by_course, key=due_by_course.get) if due_by_course else None
    # Never point the chip at a course with no published lessons.
    published_ids = {c["id"] for c in courses_out}
    if target not in published_ids:
        target = courses_out[0]["id"] if courses_out else None
    revision = {"course_id": target, "due_cards": due_by_course.get(target, 0)} if target else None

    return {"resume": resume, "due_cards": due_cards, "revision": revision,
            "week": {"lessons_completed": completed_this_week,
                     "active_days": len(active_days)},
            "courses": courses_out}


@router.get("/courses/{course_id}/mastery")
def course_mastery(course_id: str, user: dict = Depends(get_current_user),
                   db: Client = Depends(get_db)):
    """Mastery Map (SCR-07): per-topic mastery + weakest topics for one course."""
    res = db.table("courses").select(
        "id, name, institute_id, units(id, unit_number, title, topics(id, title))"
    ).eq("id", course_id).limit(1).execute()
    if not res.data or not _visible_to_student(user, res.data[0]):
        raise HTTPException(status_code=404, detail="Course not found")
    course = res.data[0]
    tids = _topic_ids(course)
    approved = _approved_map(db, tids)
    prog = _progress_rows(db, user["id"], course_id=course_id)
    prog_by_topic: dict[str, list[dict]] = {}
    for p in prog:
        prog_by_topic.setdefault(p["topic_id"], []).append(p)
    cm = _course_mastery(course, approved, prog_by_topic)
    weak = sorted([t for t in cm["topics"] if t["read"] > 0],
                  key=lambda t: t["mastery_pct"])[:3]
    return {"course_id": course_id, "name": course["name"],
            "mastery_pct": cm["mastery_pct"], "topics": cm["topics"],
            "weak_topics": weak}


class QuizAttemptIn(BaseModel):
    course_id: str | None = None
    topic_id: str
    concept_id: str
    score: int
    total: int
    answers: list[dict] | None = None
    duration_sec: int | None = None

    @field_validator("total")
    @classmethod
    def _total_sane(cls, v: int) -> int:
        if not (1 <= v <= 200):
            raise ValueError("total out of range")
        return v

    @field_validator("score")
    @classmethod
    def _score_sane(cls, v: int) -> int:
        if v < 0:
            raise ValueError("score negative")
        return v


def _approved_quiz_len(db: Client, topic_id: str, concept_id: str) -> int | None:
    """MCQ count of the approved quiz for this concept. Three states:
      int  — approved quiz found, this many MCQs
      None — confirmed: no approved quiz exists (reject the attempt)
      -1   — lookup failed; caller should accept permissively (don't lose a real
             submission to a transient DB error)."""
    try:
        rows = (db.table("concept_artifacts").select("content")
                .eq("topic_id", topic_id).eq("concept_id", concept_id)
                .eq("artifact_type", "quiz").eq("approval_status", "approved")
                .limit(1).execute().data or [])
    except Exception:
        return -1
    if rows:
        return len((rows[0].get("content") or {}).get("mcq") or [])
    return None


@router.post("/quiz/attempts")
def record_quiz_attempt(payload: QuizAttemptIn, user: dict = Depends(get_current_user),
                        db: Client = Depends(get_db)):
    """Record a full quiz attempt (history), roll the best score into
    student_progress, AND mark the lesson (student_notes) completed."""
    if user.get("role") != "student":
        return {"skipped": True}
    uid = user["id"]
    # An attempt is only valid against a published quiz. Clamp total to its real
    # MCQ count and score into [0, total]; the client computes the score, so the
    # server must reject impossible ones rather than archive them into mastery.
    real = _approved_quiz_len(db, payload.topic_id, payload.concept_id)
    if real is None:
        raise HTTPException(status_code=404, detail="No published quiz for this lesson")
    total = min(payload.total, real) if real > 0 else payload.total  # real == -1: accept as-is
    score = max(0, min(payload.score, total))

    prior = 0
    try:
        prior = (db.table("quiz_attempts").select("id", count="exact")
                 .eq("user_id", uid).eq("concept_id", payload.concept_id)
                 .eq("topic_id", payload.topic_id).execute().count or 0)
    except Exception:
        pass
    attempt_no = prior + 1
    try:
        db.table("quiz_attempts").insert({
            "user_id": uid, "course_id": payload.course_id,
            "topic_id": payload.topic_id, "concept_id": payload.concept_id,
            "attempt_no": attempt_no, "score": score, "total": total,
            "answers": payload.answers, "duration_sec": payload.duration_sec,
        }).execute()
    except Exception:
        pass
    # Best quiz score (own progress row) + complete the LESSON (notes row) — the
    # two writes the old client made; the quiz row alone is not "lesson done".
    upsert_progress(ProgressUpsert(
        course_id=payload.course_id, topic_id=payload.topic_id,
        concept_id=payload.concept_id, artifact_type="quiz",
        quiz_score=score, quiz_total=total), user, db)
    upsert_progress(ProgressUpsert(
        course_id=payload.course_id, topic_id=payload.topic_id,
        concept_id=payload.concept_id, artifact_type="student_notes",
        status="completed"), user, db)
    return {"attempt_no": attempt_no, "score": score, "total": total}


def _flashcards_from_closing(closing: dict) -> list[dict]:
    """All revision cards for a note, in the SAME order the reader's
    buildFlashcards uses: generated flashcards, then glossary, then important
    definitions, then recall prompts — every source appended, empty backs
    dropped at the end (never an early return)."""
    cards: list[dict] = []
    for c in (closing.get("flashcard_section") or {}).get("cards") or []:
        if isinstance(c, dict) and c.get("front"):
            cards.append({"front": c["front"], "back": c.get("back", "")})
    for t in (closing.get("glossary_section") or {}).get("terms") or []:
        if isinstance(t, dict) and t.get("term"):
            cards.append({"front": t["term"],
                          "back": t.get("simple_explanation") or t.get("formal_definition") or ""})
    rev = closing.get("revision_section") or {}
    for d in rev.get("important_definitions") or []:
        if isinstance(d, dict) and d.get("term"):
            cards.append({"front": d["term"], "back": d.get("definition", "")})
    for p in rev.get("active_recall_prompts") or []:
        if isinstance(p, dict) and p.get("prompt"):
            cards.append({"front": p["prompt"], "back": p.get("answer_explanation", "")})
    # Dedup by front: card identity (and _card_key) hashes the front, so two
    # cards with the same front are one card — keeping both would desync the
    # flashcard_count from the distinct-key count and deal duplicate cards.
    out, seen_fronts = [], set()
    for c in cards:
        f = c["front"].strip()
        if c.get("back") and f not in seen_fronts:
            seen_fronts.add(f)
            out.append(c)
    return out


def flashcard_count_for(content: dict) -> int:
    """Number of revision cards a note yields — stored on concept_artifacts so
    Learn Home never has to pull note content just to count."""
    closing = ((content or {}).get("closing") or {}).get("sections") or {}
    return len(_flashcards_from_closing(closing))


def _card_key(topic_id: str, concept_id: str, front: str) -> str:
    """Globally-unique, content-stable flashcard identity. Concept ids repeat
    per topic (every topic has a C1), so the topic id disambiguates courses; the
    front-text hash keeps SRS state attached to the same card across republishes
    that reorder or insert cards. Colons only separate the fixed parts (topic id
    is a UUID, concept id has no colon), so the key parses back cleanly."""
    h = hashlib.sha1(front.strip().encode("utf-8")).hexdigest()[:12]
    return f"{topic_id}:{concept_id}:{h}"


def _concept_prefix(topic_id: str, concept_id: str) -> str:
    return f"{topic_id}:{concept_id}:"


@router.get("/revision/{course_id}")
def revision_hub(course_id: str, user: dict = Depends(get_current_user),
                 db: Client = Depends(get_db)):
    """Revision Hub (SCR-06): due flashcards (SRS), formula sheet, PYQ-style
    practice, and weak topics — assembled from approved artifact content."""
    uid = user["id"]
    res = db.table("courses").select(
        "id, name, institute_id, units(id, unit_number, title, topics(id, title))"
    ).eq("id", course_id).limit(1).execute()
    if not res.data or not _visible_to_student(user, res.data[0]):
        raise HTTPException(status_code=404, detail="Course not found")
    course = res.data[0]
    tids = _topic_ids(course)
    topic_title = {t["id"]: t["title"] for u in course.get("units") or []
                   for t in u.get("topics") or []}

    notes = []
    if tids:
        notes = (db.table("concept_artifacts")
                 .select("topic_id, concept_id, content")
                 .in_("topic_id", tids).eq("artifact_type", "student_notes")
                 .eq("approval_status", "approved").execute().data or [])

    # SRS state for this user, keyed by card_key.
    srs: dict[str, dict] = {}
    try:
        for r in (db.table("flashcard_reviews").select("*").eq("user_id", uid)
                  .execute().data or []):
            srs[r["card_key"]] = r
    except Exception:
        pass

    now_iso = _now().isoformat()
    due_cards, formulas, pyq = [], [], {"easy": [], "medium": [], "hard": []}
    # Notes generated before the prior-terms exclusion repeat glossary terms
    # across subtopics; dedupe fronts course-wide so the deck deals each once.
    seen_fronts: set[str] = set()
    for row in notes:
        cid, tid = row["concept_id"], row["topic_id"]
        content = row.get("content") or {}
        closing = (content.get("closing") or {}).get("sections") or {}
        # Flashcards: prefer generated cards; fall back to glossary + definitions
        # + recall prompts (mirrors the reader's buildFlashcards) so notes
        # predating the flashcard_section still populate the deck.
        cards = _flashcards_from_closing(closing)
        for card in cards:
            f = card["front"].strip().casefold()
            if f in seen_fronts:
                continue
            seen_fronts.add(f)
            key = _card_key(tid, cid, card["front"])
            st = srs.get(key)
            if st is None or (st.get("due_at") or now_iso) <= now_iso:
                due_cards.append({"card_key": key, "front": card["front"],
                                  "back": card.get("back", ""),
                                  "concept_id": cid, "topic_id": tid,
                                  "topic_title": topic_title.get(tid, ""),
                                  "bucket": (st or {}).get("bucket", 0)})
        # Formula sheet.
        for f in (closing.get("revision_section") or {}).get("important_formulas") or []:
            formulas.append({"topic_title": topic_title.get(tid, ""),
                             "formula": f if isinstance(f, str) else str(f)})
        # PYQ-style practice from graded practice questions.
        pqs = (closing.get("practice_questions") or {})
        for band in ("easy", "medium", "hard"):
            for q in pqs.get(band) or []:
                if isinstance(q, dict) and q.get("question"):
                    pyq[band].append({"topic_title": topic_title.get(tid, ""),
                                      "question": q["question"],
                                      "answer": q.get("answer_explanation", ""),
                                      "bloom_level": q.get("bloom_level")})

    approved = _approved_map(db, tids)
    prog = _progress_rows(db, uid, course_id=course_id)
    prog_by_topic: dict[str, list[dict]] = {}
    for p in prog:
        prog_by_topic.setdefault(p["topic_id"], []).append(p)
    cm = _course_mastery(course, approved, prog_by_topic)
    weak = sorted([t for t in cm["topics"] if t["read"] > 0],
                  key=lambda t: t["mastery_pct"])[:3]

    return {"course_id": course_id, "name": course["name"],
            "due_cards": due_cards, "formulas": formulas, "pyq": pyq,
            "weak_topics": weak}


class FlashcardReviewIn(BaseModel):
    course_id: str | None = None
    topic_id: str
    concept_id: str
    card_key: str
    result: str  # "again" | "got_it"


@router.post("/flashcards/review")
def review_flashcard(payload: FlashcardReviewIn, user: dict = Depends(get_current_user),
                     db: Client = Depends(get_db)):
    """SM-2-lite: 'got_it' advances the bucket (longer interval), 'again' resets
    to bucket 0 (due now) and records a lapse."""
    if user.get("role") != "student":
        return {"skipped": True}
    uid = user["id"]
    existing = []
    try:
        existing = (db.table("flashcard_reviews").select("*")
                    .eq("user_id", uid).eq("card_key", payload.card_key)
                    .limit(1).execute().data or [])
    except Exception:
        pass
    prev = existing[0] if existing else {}
    bucket = prev.get("bucket", 0)
    lapses = prev.get("lapses", 0)
    reviews = (prev.get("reviews", 0)) + 1
    if payload.result == "got_it":
        bucket = min(bucket + 1, len(SRS_INTERVALS_DAYS) - 1)
    else:
        bucket = 0
        lapses += 1
    due_at = _now() + timedelta(days=SRS_INTERVALS_DAYS[bucket])
    row = {"user_id": uid, "course_id": payload.course_id,
           "topic_id": payload.topic_id, "concept_id": payload.concept_id,
           "card_key": payload.card_key, "bucket": bucket,
           "due_at": due_at.isoformat(), "reviews": reviews, "lapses": lapses,
           "updated_at": _now().isoformat()}
    try:
        db.table("flashcard_reviews").upsert(
            row, on_conflict="user_id,card_key").execute()
    except Exception:
        pass
    return {"card_key": payload.card_key, "bucket": bucket, "due_at": due_at.isoformat()}


class EventsIn(BaseModel):
    events: list[dict]


@router.post("/events", status_code=202)
def record_events(payload: EventsIn, user: dict = Depends(get_current_user),
                  db: Client = Depends(get_db)):
    """Batch analytics ingest (learn_* events). Best-effort; never blocks UX."""
    if user.get("role") != "student":
        return {"skipped": True}
    rows = [{"user_id": user["id"], "event": str(e.get("event") or "")[:80],
             "props": {k: v for k, v in e.items() if k != "event"},
             "ts": e.get("ts") or _now().isoformat()}
            for e in (payload.events or []) if e.get("event")]
    if rows:
        try:
            db.table("learn_events").insert(rows).execute()
        except Exception:
            pass
    return {"accepted": len(rows)}
