from fastapi import APIRouter, Depends
from supabase import Client
from app.core.dependencies import get_db, require_role
from app.schemas.settings import SettingUpsert
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])

_admin_above = require_role("admin", "superadmin")


@router.get("")
def get_settings(
    user: dict = Depends(_admin_above),
    db: Client = Depends(get_db),
):
    return settings_service.get_settings(db, user)


@router.put("")
def upsert_setting(
    payload: SettingUpsert,
    user: dict = Depends(_admin_above),
    db: Client = Depends(get_db),
):
    return settings_service.upsert_setting(db, user, payload)
