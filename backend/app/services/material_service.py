"""
Material grounding service (Phase 1) — extract, chunk, and retrieve faculty
reference materials so generation prompts can be grounded in them.

Pipeline: upload → extract page-aware blocks (PyMuPDF / python-docx, reusing
the scanned/encrypted detection from extraction_service) → chunk on heading
boundaries (~500-800 tokens, sliding-window fallback) → store rows with a
generated tsvector → retrieve per concept through the search_material_chunks
RPC (PostgREST cannot ORDER BY ts_rank).

Token counts are approximated as len(text)//4 — budgets here are soft caps on
prompt size, not billing, so a tokenizer dependency isn't warranted.
"""

from __future__ import annotations

import hashlib
import io
import logging
import re
import threading
import uuid

from app.services.extraction_service import ScannedPDFError, EncryptedPDFError, _is_scanned

logger = logging.getLogger(__name__)

# ── Config constants ──────────────────────────────────────────────────────────

CHUNK_TARGET_TOKENS = 650            # aim per chunk (range 500-800)
CHUNK_MAX_TOKENS = 800               # hard split above this
CHUNK_OVERLAP_RATIO = 0.12           # sliding-window fallback overlap

GROUNDING_TOTAL_BUDGET_TOKENS = 2500 # max grounding tokens injected per prompt
GROUNDING_TOPIC_BUDGET_RATIO = 0.7   # topic-tier share of the budget
GROUNDING_MAX_MATERIAL_SHARE = 0.6   # per-material cap within a tier (>1 material)
OUTLINE_BUDGET_TOKENS = 800          # Node A compact outline cap

EMBEDDING_MODEL = "text-embedding-3-small"   # Phase 2 semantic retrieval
_EMBED_BATCH = 256                           # inputs per embeddings request
_INSERT_BATCH = 100                          # chunk rows per insert round trip

# Processing runs in an in-process daemon thread with no persistent queue, so a
# server restart mid-extraction would strand the row in 'processing' forever.
# Reads sweep those: anything processing for longer than this is marked error.
STALE_PROCESSING_MINUTES = 10

_HEADING_SIZE_FACTOR = 1.15          # font size ≥ body × this ⇒ heading (PDF)


def approx_tokens(text: str) -> int:
    return max(1, len(text) // 4)


# ══════════════════════════════════════════════════════════════════════════════
# Extraction — page-aware blocks: [{"text", "heading": bool, "page": int|None}]
# ══════════════════════════════════════════════════════════════════════════════

def _pdf_blocks(content: bytes) -> tuple[list[dict], int]:
    """Line-level blocks with page numbers, headings detected by the same
    font-size clustering idea as extraction_service (body = modal size)."""
    import fitz
    from collections import Counter

    doc = fitz.open(stream=content, filetype="pdf")
    if doc.needs_pass:
        raise EncryptedPDFError("PDF is password-protected. Remove the password and re-upload.")
    if _is_scanned(doc):
        raise ScannedPDFError("This PDF has no selectable text (scanned image). "
                              "Please upload a digital PDF.")

    lines: list[dict] = []   # {"text", "size", "bold", "page"}
    for page_no, page in enumerate(doc, 1):
        # sort=True yields blocks in reading order (top-to-bottom, then
        # left-to-right) so multi-column layouts don't interleave columns.
        for block in page.get_text("dict", sort=True)["blocks"]:
            for line in block.get("lines", []):
                spans = [s for s in line.get("spans", []) if s["text"].strip()]
                if not spans:
                    continue
                lines.append({
                    "text": " ".join(s["text"].strip() for s in spans),
                    "size": round(max(s["size"] for s in spans), 1),
                    "bold": any(bool(s["flags"] & 2**4) for s in spans),
                    "page": page_no,
                })

    if not lines:
        return [], len(doc)

    body_size = Counter(l["size"] for l in lines).most_common(1)[0][0]
    blocks = [{
        "text": l["text"],
        "heading": l["size"] >= body_size * _HEADING_SIZE_FACTOR
                   or (l["bold"] and l["size"] > body_size and len(l["text"]) < 120),
        "page": l["page"],
    } for l in lines]
    return blocks, len(doc)


def _docx_blocks(content: bytes) -> tuple[list[dict], int]:
    """Paragraph AND table blocks in document order (iter_inner_content —
    doc.paragraphs alone silently drops tables, and textbook DOCX is
    table-heavy). Tables render one row per block, cells pipe-joined. DOCX has
    no stable page numbers, so page is None."""
    from docx import Document
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    doc = Document(io.BytesIO(content))
    blocks = []
    for item in doc.iter_inner_content():
        if isinstance(item, Paragraph):
            text = item.text.strip()
            if not text:
                continue
            style = item.style.name if item.style else ""
            blocks.append({"text": text, "heading": style.startswith("Heading"), "page": None})
        elif isinstance(item, Table):
            for row in item.rows:
                seen_tc = set()  # merged cells repeat the same underlying tc element
                cells = []
                for c in row.cells:
                    if id(c._tc) in seen_tc:
                        continue
                    seen_tc.add(id(c._tc))
                    cells.append(c.text.strip())
                text = " | ".join(c for c in cells if c)
                if text:
                    blocks.append({"text": text, "heading": False, "page": None})
    return blocks, 0


def extract_blocks(content: bytes, file_type: str) -> tuple[list[dict], int]:
    """(blocks, page_count). Raises ScannedPDFError / EncryptedPDFError /
    ValueError like the syllabus extractor."""
    if file_type == "pdf":
        return _pdf_blocks(content)
    return _docx_blocks(content)


# ══════════════════════════════════════════════════════════════════════════════
# Chunking — heading boundaries first, sliding window as fallback
# ══════════════════════════════════════════════════════════════════════════════

def _window_split(text: str, heading: str | None, page_start, page_end) -> list[dict]:
    """Fixed-size sliding window with overlap, for heading-less or oversized text."""
    words = text.split()
    if not words:
        return []
    win = CHUNK_TARGET_TOKENS * 4 // 5          # tokens→words (~0.8 words/token at //4 chars)
    step = max(1, int(win * (1 - CHUNK_OVERLAP_RATIO)))
    out = []
    for start in range(0, len(words), step):
        piece = " ".join(words[start:start + win])
        if not piece:
            break
        out.append({"heading": heading, "page_start": page_start, "page_end": page_end,
                    "text": piece, "token_count": approx_tokens(piece)})
        if start + win >= len(words):
            break
    return out


def chunk_blocks(blocks: list[dict]) -> list[dict]:
    """Chunk extracted blocks to ~CHUNK_TARGET_TOKENS on heading boundaries.
    If heading detection produced too few or too many boundaries to be a real
    document outline, fall back to a sliding window over the whole text."""
    if not blocks:
        return []

    n_headings = sum(1 for b in blocks if b["heading"])
    usable_outline = 2 <= n_headings <= max(2, len(blocks) // 2)

    if not usable_outline:
        full = " ".join(b["text"] for b in blocks)
        pages = [b["page"] for b in blocks if b["page"]]
        chunks = _window_split(full, None, min(pages) if pages else None,
                               max(pages) if pages else None)
    else:
        # Sections: a heading starts a new section; body lines accumulate.
        sections: list[dict] = []
        current = {"heading": None, "parts": [], "pages": []}
        for b in blocks:
            if b["heading"]:
                if current["parts"]:
                    sections.append(current)
                current = {"heading": b["text"][:200], "parts": [], "pages": []}
                if b["page"]:
                    current["pages"].append(b["page"])
            else:
                current["parts"].append(b["text"])
                if b["page"]:
                    current["pages"].append(b["page"])
        if current["parts"]:
            sections.append(current)

        chunks = []
        for sec in sections:
            text = " ".join(sec["parts"])
            pages = sec["pages"]
            ps, pe = (min(pages), max(pages)) if pages else (None, None)
            if approx_tokens(text) <= CHUNK_MAX_TOKENS:
                chunks.append({"heading": sec["heading"], "page_start": ps, "page_end": pe,
                               "text": text, "token_count": approx_tokens(text)})
            else:
                chunks.extend(_window_split(text, sec["heading"], ps, pe))

    # Drop noise fragments and number the survivors.
    chunks = [c for c in chunks if c["token_count"] >= 20]
    for i, c in enumerate(chunks):
        c["chunk_index"] = i
    return chunks


# ══════════════════════════════════════════════════════════════════════════════
# Background processing (same daemon-thread pattern as generation jobs)
# ══════════════════════════════════════════════════════════════════════════════

def enqueue_material_processing(material_id: str, content: bytes, file_type: str) -> None:
    def _worker():
        from app.db.supabase import get_client
        db = get_client()
        try:
            process_material(db, material_id, content, file_type)
        except (ScannedPDFError, EncryptedPDFError) as e:
            _set_material(db, material_id, status="error", error_message=str(e))
        except Exception as e:  # pragma: no cover — recorded on the row
            logger.exception("material %s processing failed: %s", material_id, e)
            _set_material(db, material_id, status="error",
                          error_message=f"{type(e).__name__}: {e}")
    threading.Thread(target=_worker, daemon=True).start()


def _embed_texts(texts: list[str]) -> list[list[float]] | None:
    """OpenAI embeddings for retrieval (Phase 2). None when no key is
    configured or the call fails — ingestion and retrieval then run on FTS
    alone, so embeddings are strictly best-effort."""
    if not texts:
        return None
    try:
        from openai import OpenAI
        from app.core.config import settings
        if not settings.openai_api_key:
            return None
        client = OpenAI(api_key=settings.openai_api_key)
        out: list[list[float]] = []
        for i in range(0, len(texts), _EMBED_BATCH):
            batch = [t[:8000] for t in texts[i:i + _EMBED_BATCH]]
            resp = client.embeddings.create(model=EMBEDDING_MODEL, input=batch)
            out.extend(d.embedding for d in resp.data)
        return out
    except Exception:
        logger.warning("embedding call failed — falling back to FTS", exc_info=True)
        return None


def process_material(db, material_id: str, content: bytes, file_type: str) -> None:
    blocks, page_count = extract_blocks(content, file_type)
    chunks = chunk_blocks(blocks)
    if not chunks:
        raise ValueError("No text could be extracted from this file.")

    vectors = _embed_texts([f"{c['heading'] or ''} {c['text']}".strip() for c in chunks])
    db.table("material_chunks").delete().eq("material_id", material_id).execute()
    rows = [{
        "id": str(uuid.uuid4()), "material_id": material_id,
        "chunk_index": c["chunk_index"], "heading": c["heading"],
        "page_start": c["page_start"], "page_end": c["page_end"],
        "text": c["text"], "token_count": c["token_count"],
        "embedding": vectors[i] if vectors else None,
    } for i, c in enumerate(chunks)]
    # Batched inserts — one round trip per _INSERT_BATCH chunks instead of one
    # per chunk (a textbook is hundreds of chunks).
    for i in range(0, len(rows), _INSERT_BATCH):
        db.table("material_chunks").insert(rows[i:i + _INSERT_BATCH]).execute()

    _set_material(db, material_id, status="ready", page_count=page_count or None,
                  chunk_count=len(chunks), error_message=None,
                  content_hash=hashlib.sha256(content).hexdigest())


def _set_material(db, material_id: str, **fields) -> None:
    db.table("materials").update(fields).eq("id", material_id).execute()


_STALE_ERROR = ("Processing was interrupted (server restarted). "
                "Delete this material and re-upload it.")


def sweep_stale_processing(db, rows: list[dict]) -> list[dict]:
    """Flip rows stuck in 'processing' beyond STALE_PROCESSING_MINUTES to
    'error', in the DB and in the returned copies. Materials are processed
    exactly once, at upload, so created_at is the processing start time.
    Called from the read endpoints — no background sweeper needed."""
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=STALE_PROCESSING_MINUTES)
    out = []
    for r in rows:
        if r.get("status") == "processing" and r.get("created_at"):
            try:
                started = datetime.fromisoformat(str(r["created_at"]).replace("Z", "+00:00"))
            except ValueError:
                started = None
            if started and started < cutoff:
                r = {**r, "status": "error", "error_message": _STALE_ERROR}
                _set_material(db, r["id"], status="error", error_message=_STALE_ERROR)
        out.append(r)
    return out


# ══════════════════════════════════════════════════════════════════════════════
# Resolution + retrieval
# ══════════════════════════════════════════════════════════════════════════════

def resolve_topic_materials(db, topic_id: str, course_id: str,
                            only_ids: list[str] | None = None) -> dict[str, str]:
    """material_id → tier ('topic' | 'course') for every READY material serving
    this topic: explicitly linked rows (topic tier, wins on overlap) plus the
    course's is_course_wide pool. only_ids restricts to a faculty-chosen subset."""
    linked = {r["material_id"] for r in
              (db.table("topic_materials").select("material_id")
               .eq("topic_id", topic_id).execute().data or [])}
    rows = (db.table("materials").select("id,is_course_wide,status")
            .eq("course_id", course_id).eq("status", "ready").execute().data or [])
    tier_map: dict[str, str] = {}
    for r in rows:
        if r["id"] in linked:
            tier_map[r["id"]] = "topic"
        elif r.get("is_course_wide"):
            tier_map[r["id"]] = "course"
    if only_ids is not None:
        allowed = set(only_ids)
        tier_map = {k: v for k, v in tier_map.items() if k in allowed}
    return tier_map


# Generic tokens carry no retrieval signal (mirrors the concept-coverage stop
# set in generation_service).
_STOP = {"and", "the", "for", "with", "into", "from", "that", "this", "are",
         "was", "were", "will", "statement", "statements", "operation",
         "operations", "concept", "concepts", "basic", "basics", "introduction",
         "overview", "types", "different", "using", "able", "student",
         "students", "end", "you"}


def build_tsquery(terms: list[str]) -> str:
    """OR-joined, sanitized tsquery string. to_tsquery ANDs by default and
    websearch_to_tsquery ANDs its words too — 30+ concept terms would match
    nothing, so we OR the distinctive tokens explicitly."""
    words: list[str] = []
    seen = set()
    for term in terms:
        for w in re.findall(r"[a-z0-9]{3,}", str(term).casefold()):
            if w not in _STOP and w not in seen:
                seen.add(w)
                words.append(w)
    return " | ".join(words[:48])


def _dedup(chunks: list[dict]) -> list[dict]:
    """Drop near-identical chunks (same heading + same opening text), e.g. from
    a re-uploaded copy of the same book."""
    seen = set()
    out = []
    for c in chunks:
        key = ((c.get("heading") or "").strip().casefold(),
               re.sub(r"\s+", " ", c["text"][:120]).casefold())
        if key in seen:
            continue
        seen.add(key)
        out.append(c)
    return out


def _fill_tier(chunks: list[dict], budget: int, cap_per_material: int | None) -> list[dict]:
    """Greedy by rank within a tier, respecting the tier budget and the
    per-material cap (cap is None when the tier has a single material)."""
    picked: list[dict] = []
    spent = 0
    per_mat: dict[str, int] = {}
    for c in chunks:
        tok = c["token_count"]
        if spent + tok > budget:
            continue
        if cap_per_material is not None and per_mat.get(c["material_id"], 0) + tok > cap_per_material:
            continue
        picked.append(c)
        spent += tok
        per_mat[c["material_id"]] = per_mat.get(c["material_id"], 0) + tok
    return picked


_RRF_K = 60          # standard reciprocal-rank-fusion constant
_MAX_SUB_QUERIES = 4  # embedding sub-queries per retrieval (one embeddings call)


def _rrf_fuse(result_lists: list[list[dict]], k: int = _RRF_K) -> list[dict]:
    """Reciprocal-rank fusion across ranked result lists: score(id) =
    Σ 1/(k + rank). Rewards chunks that rank well for several sub-queries."""
    scores: dict[str, float] = {}
    row_by_id: dict[str, dict] = {}
    for rows in result_lists:
        for rank, r in enumerate(rows):
            row_by_id.setdefault(r["id"], r)
            scores[r["id"]] = scores.get(r["id"], 0.0) + 1.0 / (k + rank + 1)
    return [row_by_id[i] for i in sorted(scores, key=lambda i: scores[i], reverse=True)]


def _sub_queries(query_terms: list[str]) -> list[str]:
    """Split the concept's terms into a few focused embedding queries instead
    of one averaged blob: one big joined query for recall, plus per-facet
    queries (short scope/concept items are grouped, long TLO statements stand
    alone) for precision. Capped at _MAX_SUB_QUERIES."""
    terms = [str(t).strip() for t in query_terms if str(t).strip()]
    if not terms:
        return []
    queries = [" ".join(terms)[:4000]]
    short = [t for t in terms if len(t) <= 80]
    long_ = [t for t in terms if len(t) > 80]
    # Group short items in threes so each sub-query stays focused.
    for i in range(0, len(short), 3):
        queries.append(" ".join(short[i:i + 3]))
    queries += long_
    # Dedup, keep order, cap.
    seen: set[str] = set()
    out = []
    for q in queries:
        if q not in seen:
            seen.add(q)
            out.append(q)
    return out[:_MAX_SUB_QUERIES]


def _search_chunks(db, mat_ids: list[str], query_terms: list[str],
                   lim: int = 40) -> list[dict]:
    """Ranked candidate rows, hybrid: multi-query semantic retrieval fused with
    reciprocal-rank fusion (a single averaged embedding dilutes distinctive
    scope items), then FTS matches not already found. FTS always runs — the
    vector RPC filters `embedding is not null`, so chunks ingested without
    embeddings (no key / API failure) would otherwise be invisible whenever any
    sibling material has vectors. Both RPCs return the same row shape."""
    if not query_terms:
        return []
    rows: list[dict] = []
    queries = _sub_queries(query_terms)
    vectors = _embed_texts(queries)
    if vectors:
        lists: list[list[dict]] = []
        for vec in vectors:
            try:
                lists.append(db.rpc("match_material_chunks", {
                    "mat_ids": mat_ids, "query_embedding": vec, "lim": lim,
                }).execute().data or [])
            except Exception:
                logger.warning("vector retrieval failed — serving FTS only", exc_info=True)
                lists = []
                break
        rows = _rrf_fuse(lists) if lists else []
    query = build_tsquery(query_terms)
    if query:
        try:
            fts = db.rpc("search_material_chunks", {
                "mat_ids": mat_ids, "query": query, "lim": lim,
            }).execute().data or []
        except Exception:
            logger.warning("FTS retrieval failed — serving vector only", exc_info=True)
            fts = []
        seen = {r["id"] for r in rows}
        rows += [r for r in fts if r["id"] not in seen]
    return rows[:lim]


def retrieve_chunks(db, tier_map: dict[str, str], query_terms: list[str],
                    budget_tokens: int = GROUNDING_TOTAL_BUDGET_TOKENS) -> list[dict]:
    """Ranked, budgeted grounding chunks for one prompt. Topic-tier materials
    get ~70% of the budget and are returned first; either tier absorbs the
    other's share when one is empty. Returns dicts with filename + tier for
    prompt labelling and provenance."""
    if not tier_map:
        return []
    rows = _search_chunks(db, list(tier_map), query_terms)
    if not rows:
        return []

    names = {r["id"]: r["filename"] for r in
             (db.table("materials").select("id,filename")
              .in_("id", list(tier_map)).execute().data or [])}
    chunks = [{
        "chunk_id": r["id"], "material_id": r["material_id"],
        "heading": r.get("heading"), "page_start": r.get("page_start"),
        "page_end": r.get("page_end"), "text": r["chunk_text"],
        "token_count": r.get("token_count") or approx_tokens(r["chunk_text"]),
        "rank": r.get("rank", 0), "tier": tier_map.get(r["material_id"], "course"),
        "filename": names.get(r["material_id"], "material"),
    } for r in rows]
    chunks = _dedup(chunks)

    topic = [c for c in chunks if c["tier"] == "topic"]
    course = [c for c in chunks if c["tier"] == "course"]
    topic_budget = int(budget_tokens * GROUNDING_TOPIC_BUDGET_RATIO)
    if not course:
        topic_budget = budget_tokens
    if not topic:
        topic_budget = 0

    def cap(tier_chunks, tier_budget):
        mats = {c["material_id"] for c in tier_chunks}
        return int(tier_budget * GROUNDING_MAX_MATERIAL_SHARE) if len(mats) > 1 else None

    picked_topic = _fill_tier(topic, topic_budget, cap(topic, topic_budget))
    course_budget = budget_tokens - sum(c["token_count"] for c in picked_topic)
    picked_course = _fill_tier(course, course_budget, cap(course, course_budget))
    return picked_topic + picked_course


def _first_sentence(text: str, limit: int = 160) -> str:
    m = re.match(r"(.{20,}?[.!?])\s", text)
    s = m.group(1) if m else text[:limit]
    return s[:limit].strip()


def build_outline(db, tier_map: dict[str, str],
                  budget_tokens: int = OUTLINE_BUDGET_TOKENS) -> str:
    """Compact material outline for Node A: per material, headings + first
    sentence per chunk, topic tier first, capped at budget_tokens."""
    if not tier_map:
        return ""
    ordered = sorted(tier_map, key=lambda m: 0 if tier_map[m] == "topic" else 1)
    lines: list[str] = []
    spent = 0
    for mat_id in ordered:
        mat = (db.table("materials").select("filename").eq("id", mat_id)
               .single().execute().data or {})
        rows = (db.table("material_chunks")
                .select("heading,page_start,text")
                .eq("material_id", mat_id).order("chunk_index").execute().data or [])
        header = f"Material: {mat.get('filename', 'material')}"
        for text in [header] + [
            f"- {(r.get('heading') or ('p.' + str(r['page_start']) if r.get('page_start') else 'section'))}: "
            f"{_first_sentence(r['text'])}" for r in rows
        ]:
            tok = approx_tokens(text)
            if spent + tok > budget_tokens:
                return "\n".join(lines)
            lines.append(text)
            spent += tok
    return "\n".join(lines)
