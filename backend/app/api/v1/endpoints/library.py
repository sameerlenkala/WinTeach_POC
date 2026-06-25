from fastapi import APIRouter, Depends, Query
from supabase import Client
from app.core.dependencies import get_db, get_current_user, require_role
from app.schemas.library import LibrarySourceCreate, COLibraryEntry
from app.services import library_service

router = APIRouter(prefix="/library", tags=["Library"])

_faculty_above = require_role("faculty", "admin", "superadmin")


@router.get("/sources")
def list_sources(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return library_service.list_sources(db, user)


@router.post("/sources", status_code=201)
def create_source(payload: LibrarySourceCreate, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return library_service.create_source(db, user, payload)


@router.get("/sources/{source_id}")
def get_source(source_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return library_service.get_source(db, source_id)


@router.get("/sources/{source_id}/references")
def get_source_references(source_id: str, user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return library_service.get_source_references(db, source_id)


@router.delete("/sources/{source_id}", status_code=204)
def delete_source(source_id: str, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    library_service.delete_source(db, user, source_id)


@router.get("/co/suggestions")
def co_suggestions(
    course_id: str | None = Query(None),
    limit: int = Query(4, le=4),
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    return library_service.get_co_suggestions(db, course_id, limit)


@router.get("/co")
def search_co_library(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=100),
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    return library_service.search_co_library(db, q, limit)


@router.post("/co", status_code=201)
def add_co_entry(payload: COLibraryEntry, user: dict = Depends(_faculty_above), db: Client = Depends(get_db)):
    return library_service.add_co_entry(db, user, payload)
