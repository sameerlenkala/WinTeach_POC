from supabase import Client


def get_summary(db: Client, user: dict) -> dict:
    role = user["role"]

    if role == "superadmin":
        institutes = db.table("institutes").select("id", count="exact").execute()
        courses = db.table("courses").select("id", count="exact").execute()
        generating = db.table("generation_jobs").select("id", count="exact").eq("status", "running").execute()
        recent = (
            db.table("uploads")
            .select("id, filename, created_at, status")
            .order("created_at", desc=True)
            .limit(5)
            .execute()
            .data or []
        )
        return {
            "institute_count": institutes.count or 0,
            "course_count": courses.count or 0,
            "generating_count": generating.count or 0,
            "recent_additions": recent,
        }

    if role == "admin":
        inst_id = user.get("institute_id")
        courses = db.table("courses").select("id", count="exact").eq("institute_id", inst_id).execute()
        generating = (
            db.table("generation_jobs")
            .select("id", count="exact")
            .eq("status", "running")
            .execute()
        )
        recent = (
            db.table("uploads")
            .select("id, filename, created_at, status")
            .eq("institute_id", inst_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
            .data or []
        )
        return {
            "institute_count": 1,
            "course_count": courses.count or 0,
            "generating_count": generating.count or 0,
            "recent_additions": recent,
        }

    if role == "faculty":
        courses = db.table("courses").select("id", count="exact").eq("faculty_id", user["id"]).execute()
        generating = (
            db.table("generation_jobs")
            .select("id", count="exact")
            .eq("created_by", user["id"])
            .eq("status", "running")
            .execute()
        )
        recent = (
            db.table("uploads")
            .select("id, filename, created_at, status")
            .eq("faculty_id", user["id"])
            .order("created_at", desc=True)
            .limit(5)
            .execute()
            .data or []
        )
        course_list = (
            db.table("courses")
            .select("id, name, code, status")
            .eq("faculty_id", user["id"])
            .order("created_at", desc=True)
            .limit(5)
            .execute()
            .data or []
        )
        return {
            "institute_count": 0,
            "course_count": courses.count or 0,
            "generating_count": generating.count or 0,
            "recent_additions": recent,
            "recent_courses": course_list,
        }

    return {"institute_count": 0, "course_count": 0, "generating_count": 0, "recent_additions": []}
