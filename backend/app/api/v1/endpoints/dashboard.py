from fastapi import APIRouter, Depends
from supabase import Client
from app.core.dependencies import get_db, get_current_user
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_summary(user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    return dashboard_service.get_summary(db, user)
