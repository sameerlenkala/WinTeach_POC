import uuid
from fastapi import HTTPException, status
from supabase import Client
from app.schemas.institute import InstituteCreate, InstituteUpdate, POCreate, PSOCreate


def create_institute(db: Client, payload: InstituteCreate) -> dict:
    row = {"id": str(uuid.uuid4()), **payload.model_dump()}
    result = db.table("institutes").insert(row).execute()
    return result.data[0]


def list_institutes(db: Client, user: dict) -> list[dict]:
    if user["role"] == "superadmin":
        return db.table("institutes").select("*").order("name").execute().data or []
    inst_id = user.get("institute_id")
    if not inst_id:
        return []
    return db.table("institutes").select("*").eq("id", inst_id).execute().data or []


def get_institute(db: Client, institute_id: str) -> dict:
    row = db.table("institutes").select("*").eq("id", institute_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institute not found")
    return row.data


def update_institute(db: Client, institute_id: str, payload: InstituteUpdate) -> dict:
    updates = payload.model_dump(exclude_none=True)
    if updates:
        db.table("institutes").update(updates).eq("id", institute_id).execute()
    return get_institute(db, institute_id)


def delete_institute(db: Client, institute_id: str) -> None:
    db.table("institutes").delete().eq("id", institute_id).execute()


# ── Program Outcomes ──────────────────────────────────────────────────────────

def list_pos(db: Client, institute_id: str) -> list[dict]:
    return (
        db.table("program_outcomes")
        .select("*")
        .eq("institute_id", institute_id)
        .order("code")
        .execute()
        .data or []
    )


def add_po(db: Client, institute_id: str, payload: POCreate) -> dict:
    row = {
        "id": str(uuid.uuid4()),
        "institute_id": institute_id,
        "code": payload.code,
        "text": payload.text,
    }
    result = db.table("program_outcomes").insert(row).execute()
    return result.data[0]


def delete_po(db: Client, institute_id: str, po_id: str) -> None:
    db.table("program_outcomes").delete().eq("id", po_id).eq("institute_id", institute_id).execute()


# ── Program Specific Outcomes ─────────────────────────────────────────────────

def list_psos(db: Client, institute_id: str) -> list[dict]:
    return (
        db.table("psos")
        .select("*")
        .eq("institute_id", institute_id)
        .order("code")
        .execute()
        .data or []
    )


def add_pso(db: Client, institute_id: str, payload: PSOCreate) -> dict:
    row = {
        "id": str(uuid.uuid4()),
        "institute_id": institute_id,
        "code": payload.code,
        "text": payload.text,
        "scope": payload.scope,
        "major": payload.major,
    }
    result = db.table("psos").insert(row).execute()
    return result.data[0]


def delete_pso(db: Client, institute_id: str, pso_id: str) -> None:
    db.table("psos").delete().eq("id", pso_id).eq("institute_id", institute_id).execute()
