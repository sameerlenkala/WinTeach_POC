"""
Stage-6 generation endpoints (pipeline doc §9). The surface matches the existing
frontend stub in winnify/src/api/generation.ts.

The advisory helpers (complexity, cos, hours, granularity) are fully functional
and dependency-light. The job endpoints create/drive a generation job from DB
state (never memory), so a server restart is safe (§6). Full node orchestration
runs in a background task off the created job.
"""

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from supabase import Client

from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.generation import (
    COGenerateRequest,
    ComplexityRequest,
    FinalizeRequest,
    GranularityRequest,
    HoursAllocateRequest,
    JobCreateRequest,
    ScopePatchRequest,
)
from app.services import generation_service as gen

router = APIRouter(prefix="/generate", tags=["Generation"])

_faculty_above = require_role("faculty", "admin", "superadmin")

_NON_TERMINAL = ("queued", "running")


# ── Advisory helpers ──────────────────────────────────────────────────────────

@router.post("/cos")
def generate_cos(payload: COGenerateRequest, user: dict = Depends(_faculty_above)):
    return gen.generate_cos(payload)


@router.post("/complexity")
def score_complexity(payload: ComplexityRequest, user: dict = Depends(get_current_user)):
    return gen.score_complexity(payload)


@router.post("/hours/allocate")
def allocate_hours(payload: HoursAllocateRequest, user: dict = Depends(get_current_user)):
    return gen.allocate_hours(payload.unit_total_hours, [t.model_dump() for t in payload.topics])


@router.post("/granularity/suggest")
def suggest_granularity(payload: GranularityRequest, user: dict = Depends(get_current_user)):
    return gen.suggest_granularity(payload.unit_total_hours, [t.model_dump() for t in payload.topics])


# ── Jobs ──────────────────────────────────────────────────────────────────────

@router.post("/jobs", status_code=201)
def create_job(payload: JobCreateRequest, user: dict = Depends(_faculty_above),
               db: Client = Depends(get_db)):
    """Create a generation job for one topic and kick off the Topic Plan.
    Rejects if an active (non-terminal) job already exists for the topic (§6)."""
    existing = (
        db.table("generation_jobs")
        .select("id,status")
        .eq("topic_id", payload.topic_id)
        .in_("status", list(_NON_TERMINAL))
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active generation job already exists for this topic.",
        )

    job_id = str(uuid.uuid4())
    db.table("generation_jobs").insert({
        "id": job_id,
        "topic_id": payload.topic_id,
        "triggered_by": user["id"],
        "status": "queued",
        "phase": "generating_topic_plan",
    }).execute()

    # Node orchestration runs off-request; the job is driven from DB state so a
    # poll/stream reflects progress and a restart resumes from the row.
    gen.enqueue_topic_job(job_id, payload.course_id, payload.topic_id)

    return {"id": job_id, "topic_id": payload.topic_id, "status": "queued",
            "phase": "generating_topic_plan", "artifact_types": payload.artifact_types}


@router.get("/jobs/{job_id}")
def get_job(job_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    result = db.table("generation_jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    artifacts = (
        db.table("artifacts").select("type,review_status,progress,is_stale,artifact_version")
        .eq("job_id", job_id).execute()
    )
    return {**result.data, "artifacts": artifacts.data or []}


@router.get("/jobs/{job_id}/stream")
def stream_job(job_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """SSE fallback: emits the current job snapshot. The board polls /jobs/{id}
    when EventSource is unavailable (§9)."""
    def _events():
        result = db.table("generation_jobs").select("*").eq("id", job_id).single().execute()
        payload = result.data or {"id": job_id, "status": "unknown"}
        yield f"event: snapshot\ndata: {json.dumps(payload)}\n\n"

    return StreamingResponse(_events(), media_type="text/event-stream")


@router.get("/jobs/{job_id}/artifact/{artifact_type}")
def get_artifact(job_id: str, artifact_type: str, user: dict = Depends(get_current_user),
                 db: Client = Depends(get_db)):
    result = (
        db.table("artifacts").select("*")
        .eq("job_id", job_id).eq("type", artifact_type).limit(1).execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Artifact not found")
    row = result.data[0]
    return {
        "content": row.get("content"),
        "status": row.get("review_status"),
        "validation": row.get("validation"),
        "version": row.get("artifact_version"),
        "derived_from": {
            "notes_version": row.get("derived_from_version"),
            "content_hash": row.get("derived_from_hash"),
        },
    }


@router.post("/jobs/{job_id}/artifact/{artifact_type}/finalize")
def finalize_artifact(job_id: str, artifact_type: str, payload: FinalizeRequest,
                      user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Drive the gates (§9). For student_notes, unit_id is required — approval is
    per-unit and fan-out fires automatically once the last unit is approved."""
    if artifact_type == "student_notes" and payload.decision in ("approve", "revise") \
            and not payload.unit_id:
        raise HTTPException(status_code=422,
                            detail="unit_id is required for per-unit student_notes decisions.")
    return gen.finalize(db, user, job_id, artifact_type, payload)
