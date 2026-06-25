import uuid
from fastapi import HTTPException, status
from supabase import Client
from app.schemas.upload import UploadCommit, ExtractionStatus
from app.services.extraction_service import extract_pdf, extract_docx


def get_extraction(db: Client, upload_id: str) -> ExtractionStatus:
    row = db.table("uploads").select("*").eq("id", upload_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    upload = row.data
    extraction_result = upload.get("extraction_result") or {}
    return ExtractionStatus(
        upload_id=upload_id,
        status=upload.get("status", "processing"),
        extraction=extraction_result,
        ai_extraction=extraction_result.get("ai_extraction"),
        error=upload.get("error_message"),
    )


def commit_upload(db: Client, user: dict, upload_id: str, payload: UploadCommit) -> dict:
    upload_row = db.table("uploads").select("*").eq("id", upload_id).single().execute()
    if not upload_row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    if upload_row.data.get("status") != "done":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Extraction not complete yet")

    course_row = db.table("courses").select("*").eq("id", payload.course_id).single().execute()
    if not course_row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    committed_cos: list[str] = []
    committed_topics: list[str] = []

    # ── Course Outcomes ───────────────────────────────────────────────────────
    if payload.cos:
        if payload.replace_cos:
            db.table("course_outcomes").delete().eq("course_id", payload.course_id).execute()

        existing = db.table("course_outcomes").select("id").eq("course_id", payload.course_id).execute()
        next_num = len(existing.data or []) + 1

        for i, co in enumerate(payload.cos):
            text = co.text.strip()
            if not text:
                continue  # skip blank COs
            bloom = co.bloom.strip().capitalize()
            if bloom not in {"Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"}:
                bloom = "Understand"  # sanitize invalid bloom values

            co_id = str(uuid.uuid4())
            db.table("course_outcomes").insert({
                "id": co_id,
                "course_id": payload.course_id,
                "co_number": next_num + i,
                "description": text,
                "bloom_level": bloom,
            }).execute()
            committed_cos.append(co_id)

    # ── Units (create from payload; upsert by unit_number) ───────────────────
    if payload.units:
        # Delete existing units+topics for this course if replacing
        if payload.replace_topics:
            existing_units = (
                db.table("units").select("id").eq("course_id", payload.course_id).execute().data or []
            )
            for eu in existing_units:
                db.table("topics").delete().eq("unit_id", eu["id"]).execute()
            db.table("units").delete().eq("course_id", payload.course_id).execute()

        for u in payload.units:
            db.table("units").insert({
                "id": str(uuid.uuid4()),
                "course_id": payload.course_id,
                "unit_number": u.unit_index + 1,
                "title": u.title.strip(),
                "hours": u.hours,
            }).execute()

    # ── Topics (from frontend commit payload) ─────────────────────────────────
    if payload.topics:
        units = (
            db.table("units")
            .select("id, unit_number")
            .eq("course_id", payload.course_id)
            .order("unit_number")
            .execute()
            .data or []
        )
        unit_map = {u["unit_number"]: u["id"] for u in units}

        if payload.replace_topics and not payload.units:
            # units block already cleared topics above; only clear here if no units payload
            for unit_id in unit_map.values():
                db.table("topics").delete().eq("unit_id", unit_id).execute()

        for topic in payload.topics:
            unit_id = unit_map.get(topic.unit_index + 1)
            if not unit_id:
                continue  # unit index out of range — skip silently

            title = topic.title.strip()
            if not title:
                continue  # skip blank topics

            bloom = topic.bloom.strip().capitalize()
            if bloom not in {"Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"}:
                bloom = "Understand"

            existing_topics = db.table("topics").select("id").eq("unit_id", unit_id).execute()
            order = len(existing_topics.data or []) + 1
            topic_id = str(uuid.uuid4())

            db.table("topics").insert({
                "id": topic_id,
                "unit_id": unit_id,
                "title": title,
                "bloom_level": bloom,
                "order": order,
            }).execute()

            for j, sub in enumerate(topic.subtopics):
                sub = sub.strip()
                if not sub:
                    continue
                db.table("subtopics").insert({
                    "id": str(uuid.uuid4()),
                    "topic_id": topic_id,
                    "title": sub,
                    "order": j + 1,
                }).execute()

            committed_topics.append(topic_id)

    # ── Mark upload committed ─────────────────────────────────────────────────
    db.table("uploads").update({
        "status": "committed",
        "committed_to_course": payload.course_id,
        "committed_by": user["id"],
    }).eq("id", upload_id).execute()

    return {
        "upload_id": upload_id,
        "course_id": payload.course_id,
        "cos_committed": len(committed_cos),
        "topics_committed": len(committed_topics),
    }
