import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from supabase import Client
from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.upload import UploadCommit, ExtractionStatus, ReextractPayload
from app.services import extraction_service, upload_service, pipeline_service
from app.services.extraction_service import ScannedPDFError, EncryptedPDFError

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_MB = 10  # reduced from 20 MB

_faculty_above = require_role("faculty", "admin", "superadmin")


@router.post("", status_code=201)
async def upload_syllabus(
    file: UploadFile = File(...),
    user: dict = Depends(_faculty_above),
    db: Client = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF and DOCX files are supported",
        )

    content = await file.read()
    if len(content) > MAX_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {MAX_MB} MB",
        )

    upload_id = str(uuid.uuid4())
    storage_path = f"syllabi/{user['id']}/{upload_id}/{file.filename}"

    try:
        db.storage.from_("syllabi").upload(storage_path, content, {"content-type": file.content_type})
    except Exception:
        pass  # Storage optional in local dev

    # Insert upload row as processing
    db.table("uploads").insert({
        "id": upload_id,
        "faculty_id": user["id"],
        "institute_id": user.get("institute_id"),
        "filename": file.filename,
        "storage_path": storage_path,
        "status": "processing",
    }).execute()

    # Extract raw text from the file (needed for pipeline + legacy fallback)
    try:
        if file.content_type == "application/pdf":
            flat_text, _ = extraction_service._pdf_to_layout(content)
        else:
            flat_text, _ = extraction_service._docx_to_layout(content)
        if not flat_text.strip():
            raise ValueError("No text extracted from file")
    except ScannedPDFError as exc:
        db.table("uploads").update({"status": "failed"}).eq("id", upload_id).execute()
        raise HTTPException(status_code=422, detail=str(exc))
    except EncryptedPDFError as exc:
        db.table("uploads").update({"status": "failed"}).eq("id", upload_id).execute()
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        db.table("uploads").update({"status": "failed"}).eq("id", upload_id).execute()
        raise HTTPException(status_code=422, detail=f"Text extraction failed: {exc}")

    # ── Primary: 5-prompt pipeline (gpt-4o) ──────────────────────────────────
    pipeline_out = pipeline_service.run_pipeline(flat_text)

    if pipeline_out:
        extraction_dict = pipeline_out  # contains ai_extraction + pipeline_result
        ai_extraction_dict = pipeline_out.get("ai_extraction")
    else:
        # ── Fallback: single-prompt extraction (gpt-4o-mini / regex) ─────────
        try:
            if file.content_type == "application/pdf":
                extraction = extraction_service.extract_pdf(content)
            else:
                extraction = extraction_service.extract_docx(content)
        except Exception as exc:
            db.table("uploads").update({"status": "failed"}).eq("id", upload_id).execute()
            raise HTTPException(status_code=422, detail=f"Extraction failed: {exc}")
        extraction_dict = extraction.model_dump()
        ai_extraction_dict = extraction.ai_extraction.model_dump() if extraction.ai_extraction else None

    db.table("uploads").update({
        "status": "done",
        "extraction_result": extraction_dict,
    }).eq("id", upload_id).execute()

    return {
        "upload_id": upload_id,
        "filename": file.filename,
        "status": "done",
        "extraction": extraction_dict.get("p1_extraction") or extraction_dict,
        "ai_extraction": ai_extraction_dict,
        "pipeline_result": extraction_dict.get("pipeline_result"),
    }


@router.get("/{upload_id}/extraction", response_model=ExtractionStatus)
def get_extraction(
    upload_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    return upload_service.get_extraction(db, upload_id)


@router.post("/{upload_id}/commit")
def commit_upload(
    upload_id: str,
    payload: UploadCommit,
    user: dict = Depends(_faculty_above),
    db: Client = Depends(get_db),
):
    return upload_service.commit_upload(db, user, upload_id, payload)


@router.post("/{upload_id}/reextract")
def reextract_field(
    upload_id: str,
    payload: ReextractPayload,
    user: dict = Depends(_faculty_above),
    db: Client = Depends(get_db),
):
    """
    Re-extract a single field from user-selected text.

    Logic:
    - Tracks per-field attempt count in extraction_result["_reextract_attempts"].
    - After 2 failed attempts for the same field, returns {"manual_entry": True}.
    - Otherwise runs regex re-extraction, falls back to GPT if regex returns nothing.
    - Patches the extraction_result JSONB in Postgres with the new value.
    """
    # Fetch the upload row
    result = db.table("uploads").select("*").eq("id", upload_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Upload not found")

    row = result.data[0]
    extraction_result: dict = row.get("extraction_result") or {}

    # Read and update attempt counter
    attempts_map: dict = extraction_result.get("_reextract_attempts", {})
    field_attempt = attempts_map.get(payload.field_name, 0)

    if field_attempt >= 2:
        return {"manual_entry": True, "field_name": payload.field_name}

    # Run field-specific re-extraction
    value, confidence = extraction_service.reextract_field(
        payload.field_name, payload.selected_text
    )

    # Increment attempt counter regardless of result
    field_attempt += 1
    attempts_map[payload.field_name] = field_attempt

    # If still nothing after this attempt, decide whether to suggest manual entry
    if value is None and field_attempt >= 2:
        extraction_result["_reextract_attempts"] = attempts_map
        db.table("uploads").update({"extraction_result": extraction_result}).eq("id", upload_id).execute()
        return {"manual_entry": True, "field_name": payload.field_name}

    # Patch the specific field inside extraction_result
    if value is not None:
        # Map field_name to its SyllabusExtraction key
        field_key_map = {
            "cos": "course_outcomes",
            "hours": "total_hours",
            "books": "reference_books",
            "assessment": "assessment_scheme",
            "modules": "modules",
        }
        key = field_key_map.get(payload.field_name, payload.field_name)

        # Update nested ExtractedField dict
        extraction_result[key] = {"value": value, "confidence": confidence}

    extraction_result["_reextract_attempts"] = attempts_map

    db.table("uploads").update({"extraction_result": extraction_result}).eq("id", upload_id).execute()

    return {
        "field_name": payload.field_name,
        "value": value,
        "confidence": confidence,
        "attempt": field_attempt,
        "manual_entry": False,
    }
