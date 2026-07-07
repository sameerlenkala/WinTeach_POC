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
from pydantic import BaseModel
from fastapi.responses import Response, StreamingResponse
from supabase import Client

from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.generation import (
    COGenerateRequest,
    ComplexityRequest,
    FinalizeRequest,
    GranularityRequest,
    HoursAllocateRequest,
    JobCreateRequest,
    PlanEditRequest,
    ScopePatchRequest,
)
from app.services import export_service
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
        # Optional grounding: non-empty restricts generation to these attached
        # materials; null/[] grounds in whatever is attached to the topic.
        "material_ids": payload.material_ids,
    }).execute()

    # Node orchestration runs off-request; the job is driven from DB state so a
    # poll/stream reflects progress and a restart resumes from the row.
    gen.enqueue_topic_job(job_id, payload.course_id, payload.topic_id)

    return {"id": job_id, "topic_id": payload.topic_id, "status": "queued",
            "phase": "generating_topic_plan", "artifact_types": payload.artifact_types}


@router.get("/courses/{course_id}/progress")
def course_progress(course_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Live per-topic generation progress for the course board."""
    return gen.course_progress(db, course_id)


@router.get("/dashboard")
def dashboard(user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Real aggregate metrics for the WinTeach dashboard."""
    return gen.faculty_dashboard(db, user)


@router.get("/topics/{topic_id}/job")
def get_topic_job(topic_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Latest generation job for a topic (so the studio can resume after reload)."""
    r = (
        db.table("generation_jobs").select("*").eq("topic_id", topic_id)
        .order("created_at", desc=True).limit(1).execute()
    )
    if not r.data:
        raise HTTPException(status_code=404, detail="No job for topic")
    return _job_detail(db, r.data[0])


@router.get("/jobs/{job_id}")
def get_job(job_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    result = db.table("generation_jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_detail(db, result.data)


def _job_detail(db: Client, job: dict) -> dict:
    """Job row (incl. token_count / cost_usd / est_cost_usd) + topic-level artifact
    summary + concept-level artifact states for the interactive studio."""
    topic_id = job["topic_id"]
    artifacts = (
        db.table("artifacts")
        .select("id,type,review_status,is_stale,artifact_version,cost_usd")
        .eq("topic_id", topic_id).execute().data or []
    )
    concept_artifacts = (
        db.table("concept_artifacts")
        # grounded_in: provenance stamp pulled out of the content JSON so the
        # studio can show which concepts were grounded without shipping content.
        # topic_id + updated_at drive stale-generation reconciliation below.
        .select("topic_id,concept_id,artifact_type,status,approval_status,updated_at,"
                "cost_usd,token_count,error,grounded_in:content->grounded_in")
        .eq("topic_id", topic_id).execute().data or []
    )
    # Orphaned 'generating' rows (worker died with its process) would otherwise
    # keep the studio polling forever — surface them as errors so it can retry.
    from app.services import generation_service as gen
    concept_artifacts = gen.reconcile_stale_generations(db, concept_artifacts)
    return {**job, "artifacts": artifacts, "concept_artifacts": concept_artifacts}


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


# ── Interactive studio: editable plan + on-demand concept/topic artifacts ─────

_CONCEPT_TYPES = {"student_notes", "slides", "quiz"}
_TOPIC_ART_TYPES = {"summary", "assignment", "faculty_diagnostic", "flashcards"}


def _topic_of(db: Client, job_id: str) -> str:
    r = db.table("generation_jobs").select("topic_id").eq("id", job_id).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return r.data["topic_id"]


@router.put("/jobs/{job_id}/plan")
def edit_plan(job_id: str, payload: PlanEditRequest,
              user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Persist faculty edits to the Topic Plan concepts (content type, secondary
    blocks, flags, complexity, scope). Read by later per-concept generation."""
    topic_id = _topic_of(db, job_id)
    return gen.save_plan_edits(db, topic_id, [c.model_dump() for c in payload.concepts])


@router.post("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/generate", status_code=202)
def gen_concept(job_id: str, concept_id: str, artifact_type: str,
                user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Generate or regenerate one concept-level artifact (notes/slides/quiz)."""
    if artifact_type not in _CONCEPT_TYPES:
        raise HTTPException(status_code=422, detail=f"artifact_type must be one of {_CONCEPT_TYPES}")
    topic_id = _topic_of(db, job_id)
    gen.enqueue_concept_artifact(job_id, topic_id, concept_id, artifact_type)
    return {"status": "generating", "concept_id": concept_id, "artifact_type": artifact_type}


@router.post("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/approve")
def approve_concept(job_id: str, concept_id: str, artifact_type: str,
                    user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    topic_id = _topic_of(db, job_id)
    return gen.approve_concept_artifact(db, user, topic_id, concept_id, artifact_type)


class ReviseRequest(BaseModel):
    instruction: str


@router.post("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/revise", status_code=202)
def revise_concept(job_id: str, concept_id: str, artifact_type: str, payload: ReviseRequest,
                   user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Targeted revision: apply one faculty instruction to the current artifact.
    The outgoing content is snapshotted to version history first."""
    if artifact_type not in _CONCEPT_TYPES:
        raise HTTPException(status_code=422, detail=f"artifact_type must be one of {_CONCEPT_TYPES}")
    if not payload.instruction.strip():
        raise HTTPException(status_code=422, detail="Instruction is required")
    topic_id = _topic_of(db, job_id)
    gen.enqueue_concept_revision(job_id, topic_id, concept_id, artifact_type,
                                 payload.instruction.strip())
    return {"status": "generating", "concept_id": concept_id, "artifact_type": artifact_type}


@router.get("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/versions")
def list_concept_versions(job_id: str, concept_id: str, artifact_type: str,
                          user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    topic_id = _topic_of(db, job_id)
    return gen.list_artifact_versions(db, topic_id, concept_id, artifact_type)


@router.post("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/versions/{version_no}/restore")
def restore_concept_version(job_id: str, concept_id: str, artifact_type: str, version_no: int,
                            user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    topic_id = _topic_of(db, job_id)
    try:
        return gen.restore_artifact_version(db, job_id, topic_id, concept_id, artifact_type, version_no)
    except ValueError:
        raise HTTPException(status_code=404, detail="Version not found")


@router.get("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}/export")
def export_concept(job_id: str, concept_id: str, artifact_type: str,
                   user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Download the artifact as an Office file: notes/quiz → .docx, slides → .pptx."""
    if artifact_type not in _CONCEPT_TYPES:
        raise HTTPException(status_code=422, detail=f"artifact_type must be one of {_CONCEPT_TYPES}")
    topic_id = _topic_of(db, job_id)
    data, filename, media = export_service.export_concept(db, job_id, topic_id, concept_id, artifact_type)
    return Response(content=data, media_type=media,
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/jobs/{job_id}/concepts/{concept_id}/{artifact_type}")
def get_concept(job_id: str, concept_id: str, artifact_type: str,
                user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    topic_id = _topic_of(db, job_id)
    row = gen._concept_row(db, topic_id, concept_id, artifact_type)
    if not row:
        raise HTTPException(status_code=404, detail="Not generated yet")
    # Students only ever see faculty-approved (published) content.
    if user.get("role") == "student" and row.get("approval_status") != "approved":
        raise HTTPException(status_code=404, detail="Not published yet")
    return {"content": row.get("content"), "status": row.get("status"),
            "approval_status": row.get("approval_status"),
            "cost_usd": row.get("cost_usd"), "error": row.get("error")}


@router.post("/jobs/{job_id}/topic/{artifact_type}/generate", status_code=202)
def gen_topic_artifact(job_id: str, artifact_type: str,
                       user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    """Generate or regenerate a topic-level artifact (summary/assignment/
    faculty_diagnostic/flashcards) from the concept notes."""
    if artifact_type not in _TOPIC_ART_TYPES:
        raise HTTPException(status_code=422, detail=f"artifact_type must be one of {_TOPIC_ART_TYPES}")
    topic_id = _topic_of(db, job_id)
    gen.enqueue_topic_artifact(job_id, topic_id, artifact_type)
    return {"status": "generating", "artifact_type": artifact_type}
