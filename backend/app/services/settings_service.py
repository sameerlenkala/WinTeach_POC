from supabase import Client
from app.schemas.settings import SettingUpsert


def get_settings(db: Client, user: dict) -> list[dict]:
    scope_filter = user.get("institute_id") if user["role"] != "superadmin" else None
    query = db.table("settings").select("*")
    if scope_filter:
        query = query.or_(f"institute_id.eq.{scope_filter},scope.eq.global")
    return query.execute().data or []


def upsert_setting(db: Client, user: dict, payload: SettingUpsert) -> dict:
    institute_id = None if payload.scope == "global" else user.get("institute_id")
    existing = (
        db.table("settings")
        .select("id")
        .eq("key", payload.key)
        .eq("institute_id", institute_id or "")
        .execute()
    )
    if existing.data:
        row_id = existing.data[0]["id"]
        result = db.table("settings").update({"value": payload.value}).eq("id", row_id).execute()
    else:
        import uuid
        result = db.table("settings").insert({
            "id": str(uuid.uuid4()),
            "key": payload.key,
            "value": payload.value,
            "scope": payload.scope,
            "institute_id": institute_id,
            "updated_by": user["id"],
        }).execute()
    return result.data[0]
