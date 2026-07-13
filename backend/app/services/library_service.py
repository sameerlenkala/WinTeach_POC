import uuid
from fastapi import HTTPException, status
from supabase import Client
from app.schemas.library import LibrarySourceCreate, COLibraryEntry


def create_source(db: Client, user: dict, payload: LibrarySourceCreate) -> dict:
    row = {
        "id": str(uuid.uuid4()),
        "institute_id": user.get("institute_id"),
        "added_by": user["id"],
        **payload.model_dump(),
    }
    result = db.table("library_sources").insert(row).execute()
    return result.data[0]


def list_sources(db: Client, user: dict) -> list[dict]:
    query = db.table("library_sources").select("*")
    if user["role"] in ("faculty", "admin"):
        inst = user.get("institute_id")
        # A null institute_id must filter for NULL, not the literal string "None"
        # (which Postgres rejects as an invalid uuid).
        query = query.eq("institute_id", inst) if inst else query.is_("institute_id", "null")
    return query.order("title").execute().data or []


def _guard_source_visible(user: dict, row: dict) -> None:
    """Same tenancy rule as list_sources: faculty/admin only see their own
    institute's sources (NULL-institute rows are shared/demo). 404, not 403 —
    don't confirm a foreign source exists."""
    if user["role"] in ("faculty", "admin") and row.get("institute_id") \
            and row["institute_id"] != user.get("institute_id"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")


def get_source(db: Client, user: dict, source_id: str) -> dict:
    row = db.table("library_sources").select("*").eq("id", source_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    _guard_source_visible(user, row.data)
    return row.data


def get_source_references(db: Client, user: dict, source_id: str) -> list[dict]:
    """Return all subtopics that reference this library source."""
    get_source(db, user, source_id)  # tenancy check (404s foreign sources)
    result = (
        db.table("subtopic_sources")
        .select("*, subtopics(id, title, topics(id, title, units(id, title, courses(id, name, code))))")
        .eq("source_id", source_id)
        .execute()
    )
    return result.data or []


def delete_source(db: Client, user: dict, source_id: str) -> None:
    row = db.table("library_sources").select("id, added_by").eq("id", source_id).single().execute()
    if not row.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    if user["role"] not in ("superadmin",) and row.data["added_by"] != user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's source")
    db.table("library_sources").delete().eq("id", source_id).execute()


_SEED_COS = [
    {"description": "Apply object-oriented programming concepts to design and implement software solutions.", "bloom_level": "Apply", "domain": "Programming", "tags": ["OOP", "Software Design"]},
    {"description": "Analyze algorithms for time and space complexity using asymptotic notation.", "bloom_level": "Analyze", "domain": "Algorithms", "tags": ["Complexity", "Big-O"]},
    {"description": "Design and implement database schemas using normalization principles.", "bloom_level": "Create", "domain": "Database", "tags": ["SQL", "Normalization"]},
    {"description": "Understand the fundamental concepts of computer networks and protocols.", "bloom_level": "Understand", "domain": "Networks", "tags": ["TCP/IP", "OSI"]},
    {"description": "Apply machine learning algorithms to solve real-world classification and regression problems.", "bloom_level": "Apply", "domain": "AI/ML", "tags": ["ML", "Classification"]},
    {"description": "Implement data structures such as trees, graphs, and hash tables.", "bloom_level": "Apply", "domain": "Data Structures", "tags": ["Trees", "Graphs"]},
    {"description": "Evaluate software design patterns and apply them to improve code maintainability.", "bloom_level": "Evaluate", "domain": "Software Engineering", "tags": ["Design Patterns"]},
    {"description": "Create RESTful APIs using standard HTTP methods and status codes.", "bloom_level": "Create", "domain": "Web Development", "tags": ["REST", "API"]},
    {"description": "Analyze and mitigate common security vulnerabilities in software systems.", "bloom_level": "Analyze", "domain": "Security", "tags": ["OWASP", "Cybersecurity"]},
    {"description": "Understand operating system concepts including processes, threads, and memory management.", "bloom_level": "Understand", "domain": "Operating Systems", "tags": ["Processes", "Memory"]},
]


def get_co_suggestions(db: Client, course_id: str | None, limit: int) -> list[dict]:
    """Return CO library entries relevant to the course. Falls back to all entries if no match."""
    all_rows = db.table("co_library").select("id, description, bloom_level, domain, tags").limit(200).execute().data or []

    if not all_rows:
        import uuid as _uuid
        seed_rows = [{"id": str(_uuid.uuid4()), "institute_id": None, "added_by": None, **co} for co in _SEED_COS]
        try:
            db.table("co_library").insert(seed_rows).execute()
            all_rows = db.table("co_library").select("id, description, bloom_level, domain, tags").limit(200).execute().data or []
        except Exception:
            all_rows = [{"id": str(i), **co} for i, co in enumerate(_SEED_COS)]

    if not course_id:
        return all_rows[:limit]

    # Fetch course name + topics to build keywords for matching
    keywords: set[str] = set()
    try:
        course = db.table("courses").select("name, code").eq("id", course_id).single().execute().data or {}
        for field in (course.get("name", ""), course.get("code", "")):
            for word in field.lower().split():
                if len(word) > 3:
                    keywords.add(word)

        unit_ids = [u["id"] for u in (db.table("units").select("id").eq("course_id", course_id).execute().data or [])]
        if unit_ids:
            topics = db.table("topics").select("title").in_("unit_id", unit_ids).limit(50).execute().data or []
            for t in topics:
                for word in (t.get("title") or "").lower().split():
                    if len(word) > 3:
                        keywords.add(word)
    except Exception:
        pass

    if not keywords:
        return all_rows[:limit]

    # Score each library entry by keyword overlap
    def score(entry: dict) -> int:
        text = (entry.get("description", "") + " " + " ".join(entry.get("tags") or [])).lower()
        return sum(1 for kw in keywords if kw in text)

    scores = {entry["id"]: score(entry) for entry in all_rows}
    scored = sorted(all_rows, key=lambda e: scores[e["id"]], reverse=True)
    matched = [r for r in scored if scores[r["id"]] > 0]
    rest = [r for r in scored if scores[r["id"]] == 0]
    return (matched + rest)[:limit]


def search_co_library(db: Client, query: str, limit: int = 20) -> list[dict]:
    result = (
        db.table("co_library")
        .select("id, description, bloom_level, domain, tags")
        .ilike("description", f"%{query}%")
        .limit(limit)
        .execute()
    )
    return result.data or []


def add_co_entry(db: Client, user: dict, payload: COLibraryEntry) -> dict:
    row = {
        "id": str(uuid.uuid4()),
        "institute_id": user.get("institute_id"),
        "added_by": user["id"],
        **payload.model_dump(),
    }
    result = db.table("co_library").insert(row).execute()
    return result.data[0]
