from fastapi import APIRouter, Depends
from supabase import Client
from app.core.dependencies import get_db, require_role
from app.schemas.institute import InstituteCreate, InstituteUpdate, POCreate, PSOCreate
from app.services import institute_service

router = APIRouter(prefix="/institutes", tags=["Institutes"])

_admin_above        = require_role("admin", "superadmin")
_faculty_above      = require_role("faculty", "admin", "superadmin")
_superadmin         = require_role("superadmin")


@router.post("", status_code=201)
def create_institute(payload: InstituteCreate, user: dict = Depends(_superadmin), db: Client = Depends(get_db)):
    return institute_service.create_institute(db, payload)


@router.get("")
def list_institutes(user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    # Faculty can only see their own institute; admin/superadmin see all
    return institute_service.list_institutes(db, user)


@router.get("/{institute_id}")
def get_institute(institute_id: str, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return institute_service.get_institute(db, institute_id)


@router.patch("/{institute_id}")
def update_institute(institute_id: str, payload: InstituteUpdate, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    return institute_service.update_institute(db, institute_id, payload)


@router.delete("/{institute_id}", status_code=204)
def delete_institute(institute_id: str, user: dict = Depends(_superadmin), db: Client = Depends(get_db)):
    institute_service.delete_institute(db, institute_id)


# ── Program Outcomes ──────────────────────────────────────────────────────────

@router.get("/{institute_id}/pos")
def list_pos(institute_id: str, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    return institute_service.list_pos(db, institute_id)


@router.post("/{institute_id}/pos", status_code=201)
def add_po(institute_id: str, payload: POCreate, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    return institute_service.add_po(db, institute_id, payload)


@router.delete("/{institute_id}/pos/{po_id}", status_code=204)
def delete_po(institute_id: str, po_id: str, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    institute_service.delete_po(db, institute_id, po_id)


# ── PSOs ──────────────────────────────────────────────────────────────────────

@router.get("/{institute_id}/psos")
def list_psos(institute_id: str, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    return institute_service.list_psos(db, institute_id)


@router.post("/{institute_id}/psos", status_code=201)
def add_pso(institute_id: str, payload: PSOCreate, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    return institute_service.add_pso(db, institute_id, payload)


@router.delete("/{institute_id}/psos/{pso_id}", status_code=204)
def delete_pso(institute_id: str, pso_id: str, user: dict = Depends(_admin_above), db: Client = Depends(get_db)):
    institute_service.delete_pso(db, institute_id, pso_id)
