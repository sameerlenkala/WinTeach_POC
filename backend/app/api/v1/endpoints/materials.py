"""
Reference-material endpoints (Phase 1 grounding). Upload → background
extract/chunk (status polled from the row, like syllabus uploads) → attach to
topics or mark course-wide → generation grounds its prompts in them.

get_db returns a service-role client that bypasses RLS, so EVERY route guards
course ownership explicitly (faculty own their courses; admins their
institute; superadmin anything) — same posture as library_service. Materials
are faculty-side grounding sources; students never need these routes.
"""

import hashlib
import logging
import re
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from supabase import Client

from app.core.dependencies import get_db, require_role
from app.schemas.material import MaterialUpdate
from app.services import material_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Materials"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
MAX_MB = 10  # matches syllabus uploads

# Content-type comes from the client and is spoofable — verify magic bytes.
_MAGIC = {"pdf": b"%PDF-", "docx": b"PK\x03\x04"}

_faculty_above = require_role("faculty", "admin", "superadmin")


def _course_or_404(db: Client, course_id: str) -> dict:
    r = db.table("courses").select("id,faculty_id,institute_id").eq("id", course_id) \
        .single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Course not found")
    return r.data


def _can_manage(user: dict, course: dict) -> bool:
    role = user.get("role")
    return (role == "superadmin"
            or (role == "admin" and course.get("institute_id") == user.get("institute_id"))
            or (role == "faculty" and course.get("faculty_id") == user["id"]))


def _guard_course(user: dict, course: dict) -> None:
    if not _can_manage(user, course):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not manage this course")


def _material_or_404(db: Client, material_id: str) -> dict:
    r = db.table("materials").select("*").eq("id", material_id).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Material not found")
    return r.data


def _course_id_of_topic(db: Client, topic_id: str) -> str:
    t = db.table("topics").select("unit_id").eq("id", topic_id).single().execute()
    if not t.data:
        raise HTTPException(status_code=404, detail="Topic not found")
    u = db.table("units").select("course_id").eq("id", t.data["unit_id"]).single().execute()
    if not u.data:
        raise HTTPException(status_code=404, detail="Unit not found for topic")
    return u.data["course_id"]


@router.post("/materials", status_code=201)
async def upload_material(
    file: UploadFile = File(...),
    course_id: str = Form(...),
    topic_id: str | None = Form(None),
    is_course_wide: bool = Form(False),
    user: dict = Depends(_faculty_above),
    db: Client = Depends(get_db),
):
    """Upload a reference material; extraction/chunking runs in the background —
    poll GET /materials/{id} until status is ready|error. Optionally links to a
    topic and/or marks the material course-wide in the same call."""
    file_type = ALLOWED_TYPES.get(file.content_type or "")
    if not file_type:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail="Only PDF and DOCX files are supported")
    content = await file.read()
    if len(content) > MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds {MAX_MB} MB")
    if not content.startswith(_MAGIC[file_type]):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail=f"File content is not a valid {file_type.upper()}")

    course = _course_or_404(db, course_id)
    _guard_course(user, course)
    if topic_id and _course_id_of_topic(db, topic_id) != course_id:
        raise HTTPException(status_code=422, detail="Topic does not belong to this course")

    # Same bytes already ingested for this course → point at the existing row
    # instead of re-extracting and double-grounding (error rows may retry).
    content_hash = hashlib.sha256(content).hexdigest()
    dup = (db.table("materials").select("id,filename,status")
           .eq("course_id", course_id).eq("content_hash", content_hash)
           .neq("status", "error").limit(1).execute().data or [])
    if dup:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail=f'This file is already uploaded to this course '
                                   f'as "{dup[0]["filename"]}"')

    material_id = str(uuid.uuid4())
    storage_path = f"materials/{user['id']}/{material_id}/{file.filename}"
    try:
        db.storage.from_("materials").upload(storage_path, content,
                                             {"content-type": file.content_type})
    except Exception:
        # Storage optional in local dev (same as syllabus uploads) — but say so,
        # a prod outage here means the file can never be viewed/downloaded.
        logger.warning("storage upload failed for material %s (%s) — "
                       "download/view will 404", material_id, file.filename,
                       exc_info=True)

    db.table("materials").insert({
        "id": material_id,
        "course_id": course_id,
        "institute_id": user.get("institute_id"),
        "uploaded_by": user["id"],
        "filename": file.filename,
        "storage_path": storage_path,
        "file_type": file_type,
        "file_size": len(content),
        "status": "processing",
        "is_course_wide": is_course_wide,
        "content_hash": content_hash,  # set at insert so dedup sees processing rows
    }).execute()

    if topic_id:
        db.table("topic_materials").insert(
            {"topic_id": topic_id, "material_id": material_id}).execute()

    material_service.enqueue_material_processing(material_id, content, file_type)
    return {"id": material_id, "course_id": course_id, "filename": file.filename,
            "file_type": file_type, "status": "processing",
            "is_course_wide": is_course_wide}


@router.get("/materials")
def list_my_materials(user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """The grounding repository: every material visible to this user, with its
    course and linked topics (faculty → own courses; admin → institute)."""
    q = db.table("materials").select(
        "*, courses(id,name,code), topic_materials(topics(id,title))")
    role = user.get("role")
    if role == "faculty":
        ids = [c["id"] for c in (db.table("courses").select("id")
               .eq("faculty_id", user["id"]).execute().data or [])]
        if not ids:
            return []
        q = q.in_("course_id", ids)
    elif role == "admin" and user.get("institute_id"):
        q = q.eq("institute_id", user["institute_id"])
    rows = material_service.sweep_stale_processing(
        db, q.order("created_at", desc=True).execute().data or [])
    out = []
    for r in rows:
        links = r.pop("topic_materials", None) or []
        out.append({**r, "course": r.pop("courses", None),
                    "linked_topics": [l["topics"] for l in links if l.get("topics")]})
    return out


@router.get("/material-chunks")
def get_material_chunks(ids: str, user: dict = Depends(_faculty_above),
                        db: Client = Depends(get_db)):
    """Resolve chunk ids (from an artifact's grounded_in stamp) to display
    metadata — material filename, heading, pages — for the coverage popover.
    Chunks of materials whose course the user doesn't manage are filtered out,
    not 403d — a popover with mixed provenance should show what it can."""
    id_list = [i.strip() for i in ids.split(",") if i.strip()][:64]
    if not id_list:
        return []
    rows = (db.table("material_chunks")
            .select("id,material_id,chunk_index,heading,page_start,page_end,token_count,"
                    "materials(filename,course_id)")
            .in_("id", id_list).execute().data or [])
    course_ids = {(r.get("materials") or {}).get("course_id") for r in rows}
    courses = {c["id"]: c for c in
               (db.table("courses").select("id,faculty_id,institute_id")
                .in_("id", [c for c in course_ids if c]).execute().data or [])}
    out = []
    for r in rows:
        mat = r.pop("materials", None) or {}
        course = courses.get(mat.get("course_id"))
        if course and _can_manage(user, course):
            out.append({**r, "filename": mat.get("filename")})
    return out


@router.get("/materials/{material_id}")
def get_material(material_id: str, user: dict = Depends(_faculty_above),
                 db: Client = Depends(get_db)):
    material = _material_or_404(db, material_id)
    _guard_course(user, _course_or_404(db, material["course_id"]))
    return material_service.sweep_stale_processing(db, [material])[0]


_MEDIA_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.get("/materials/{material_id}/download")
def download_material(material_id: str, user: dict = Depends(_faculty_above),
                      db: Client = Depends(get_db)):
    """The original uploaded file, streamed from Supabase Storage. Served
    inline so PDFs open in the browser (the client falls back to saving for
    DOCX). 404s when the file predates the storage bucket — re-upload."""
    material = _material_or_404(db, material_id)
    _guard_course(user, _course_or_404(db, material["course_id"]))
    path = material.get("storage_path")
    try:
        data = db.storage.from_("materials").download(path) if path else None
    except Exception:
        data = None
    if not data:
        raise HTTPException(status_code=404,
                            detail="File is not in storage (uploaded before storage was "
                                   "enabled). Re-upload the material to fix this.")
    # Neutralize header-injection characters in the user-supplied filename.
    safe_name = re.sub(r'[\r\n"\\;]', "_", material.get("filename") or "material")
    return Response(
        content=data,
        media_type=_MEDIA_TYPES.get(material.get("file_type"), "application/octet-stream"),
        headers={"Content-Disposition": f'inline; filename="{safe_name}"'},
    )


def _course_materials_with_topics(db: Client, course_id: str) -> list[dict]:
    """Course materials, each carrying linked_topics [{id,title}] so the UI can
    say WHICH topics a topic-specific file grounds (not just that it's scoped)."""
    rows = material_service.sweep_stale_processing(
        db, db.table("materials").select("*, topic_materials(topics(id,title))")
        .eq("course_id", course_id)
        .order("created_at", desc=True).execute().data or [])
    out = []
    for r in rows:
        links = r.pop("topic_materials", None) or []
        out.append({**r, "linked_topics": [l["topics"] for l in links if l.get("topics")]})
    return out


@router.get("/courses/{course_id}/materials")
def list_course_materials(course_id: str, user: dict = Depends(_faculty_above),
                          db: Client = Depends(get_db)):
    _guard_course(user, _course_or_404(db, course_id))
    return _course_materials_with_topics(db, course_id)


@router.get("/topics/{topic_id}/materials")
def list_topic_materials(topic_id: str, user: dict = Depends(_faculty_above),
                         db: Client = Depends(get_db)):
    """Materials serving this topic: explicitly linked (tier 'topic') plus the
    course-wide pool (tier 'course') — the same resolution generation uses."""
    course_id = _course_id_of_topic(db, topic_id)
    _guard_course(user, _course_or_404(db, course_id))
    out = []
    for r in _course_materials_with_topics(db, course_id):
        if any(t.get("id") == topic_id for t in r["linked_topics"]):
            out.append({**r, "tier": "topic"})
        elif r.get("is_course_wide"):
            out.append({**r, "tier": "course"})
    return out


@router.patch("/materials/{material_id}")
def update_material(material_id: str, payload: MaterialUpdate,
                    user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    material = _material_or_404(db, material_id)
    _guard_course(user, _course_or_404(db, material["course_id"]))
    db.table("materials").update({"is_course_wide": payload.is_course_wide}) \
        .eq("id", material_id).execute()
    return {**material, "is_course_wide": payload.is_course_wide}


@router.delete("/materials/{material_id}", status_code=204)
def delete_material(material_id: str, user: dict = Depends(_faculty_above),
                    db: Client = Depends(get_db)):
    material = _material_or_404(db, material_id)
    _guard_course(user, _course_or_404(db, material["course_id"]))
    db.table("materials").delete().eq("id", material_id).execute()  # chunks+links cascade
    # Remove the stored file too — DB cascade doesn't touch Storage, and
    # orphaned objects accumulate forever. Best-effort: the row is gone either way.
    path = material.get("storage_path")
    if path:
        try:
            db.storage.from_("materials").remove([path])
        except Exception:
            logger.warning("storage removal failed for material %s (%s)",
                           material_id, path, exc_info=True)


@router.post("/topics/{topic_id}/materials/{material_id}", status_code=201)
def link_material(topic_id: str, material_id: str,
                  user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    material = _material_or_404(db, material_id)
    course_id = _course_id_of_topic(db, topic_id)
    if material["course_id"] != course_id:
        raise HTTPException(status_code=422, detail="Material belongs to a different course")
    _guard_course(user, _course_or_404(db, course_id))
    existing = (db.table("topic_materials").select("material_id")
                .eq("topic_id", topic_id).eq("material_id", material_id).execute())
    if not existing.data:
        db.table("topic_materials").insert(
            {"topic_id": topic_id, "material_id": material_id}).execute()
    return {"topic_id": topic_id, "material_id": material_id, "linked": True}


@router.delete("/topics/{topic_id}/materials/{material_id}", status_code=204)
def unlink_material(topic_id: str, material_id: str,
                    user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    _guard_course(user, _course_or_404(db, _course_id_of_topic(db, topic_id)))
    db.table("topic_materials").delete().eq("topic_id", topic_id) \
        .eq("material_id", material_id).execute()
