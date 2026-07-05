"""Material grounding: chunker, tsquery building, tiered/budgeted retrieval
(vector-first with FTS fallback), and the no-op guarantee — ungrounded prompts
stay byte-identical."""

import pytest

from app.services import material_service as ms
from app.services import generation_prompts as gp


@pytest.fixture(autouse=True)
def no_embeddings(monkeypatch):
    """Hermetic default: no embedding client, so retrieval exercises the FTS
    path. Vector-path tests override _embed_texts explicitly."""
    monkeypatch.setattr(ms, "_embed_texts", lambda texts: None)


# ── Chunking ──────────────────────────────────────────────────────────────────

def _body(words: int, page: int = 1) -> dict:
    return {"text": "word " * words, "heading": False, "page": page}


def test_chunk_on_heading_boundaries():
    blocks = []
    for i, heading in enumerate(["B-Trees", "Hashing", "Indexing"], 1):
        blocks.append({"text": heading, "heading": True, "page": i})
        blocks.append(_body(400, page=i))
    chunks = ms.chunk_blocks(blocks)
    assert [c["heading"] for c in chunks] == ["B-Trees", "Hashing", "Indexing"]
    assert [c["chunk_index"] for c in chunks] == [0, 1, 2]
    assert all(c["token_count"] >= 20 for c in chunks)
    assert chunks[0]["page_start"] == 1 and chunks[2]["page_start"] == 3


def test_oversized_section_window_split_keeps_heading():
    blocks = [{"text": "Intro", "heading": True, "page": 1}, _body(300, page=1),
              {"text": "Big Section", "heading": True, "page": 2}, _body(4000, page=2)]
    chunks = ms.chunk_blocks(blocks)
    big = [c for c in chunks if c["heading"] == "Big Section"]
    assert len(big) > 1  # oversized section window-split, heading retained
    assert all(c["token_count"] <= ms.CHUNK_MAX_TOKENS for c in chunks)


def test_headingless_doc_falls_back_to_sliding_window():
    chunks = ms.chunk_blocks([_body(3000)])
    assert len(chunks) > 1
    assert all(c["heading"] is None for c in chunks)
    # Overlap: consecutive windows share their boundary words.
    first, second = chunks[0]["text"].split(), chunks[1]["text"].split()
    assert first[-1] in second[: len(first)]


def test_empty_blocks():
    assert ms.chunk_blocks([]) == []


# ── tsquery construction ──────────────────────────────────────────────────────

def test_build_tsquery_or_joins_and_filters():
    q = ms.build_tsquery(["B-Tree Insertion", "the basics of indexing", "B-Tree"])
    assert " | " in q
    assert "tree" in q and "insertion" in q and "indexing" in q
    assert "the" not in q.split(" | ") and "basics" not in q.split(" | ")
    assert q.count("tree") == 1  # deduplicated


def test_build_tsquery_empty_when_only_stopwords():
    assert ms.build_tsquery(["the and for"]) == ""


# ── Retrieval: tiers, budgets, caps, dedup ────────────────────────────────────

class _Exec:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, name):        # select/eq/in_/order/single → chainable
        return lambda *a, **k: self

    def execute(self):
        return _Exec(self._data)


class _FakeDB:
    def __init__(self, rpc_rows, materials):
        self._rpc_rows = rpc_rows
        self._materials = materials

    def rpc(self, name, params):
        assert name == "search_material_chunks"
        assert params["query"], "must never call the RPC with an empty tsquery"
        return _Query(self._rpc_rows)

    def table(self, name):
        return _Query(self._materials if name == "materials" else [])


def _rpc_row(i, mat, tok, rank):
    return {"id": f"ch{i}", "material_id": mat, "chunk_index": i,
            "heading": f"H{i}", "page_start": i, "page_end": i,
            "chunk_text": f"chunk {i} text about trees", "token_count": tok,
            "rank": rank}


def test_retrieve_topic_tier_first_and_budgeted():
    rows = [_rpc_row(1, "mat-topic", 900, 0.9), _rpc_row(2, "mat-course", 900, 0.8),
            _rpc_row(3, "mat-topic", 900, 0.7), _rpc_row(4, "mat-course", 900, 0.6),
            _rpc_row(5, "mat-topic", 900, 0.5)]
    db = _FakeDB(rows, [{"id": "mat-topic", "filename": "topic.pdf"},
                        {"id": "mat-course", "filename": "course.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-topic": "topic", "mat-course": "course"},
                             ["binary trees"], budget_tokens=2500)
    assert sum(c["token_count"] for c in got) <= 2500
    tiers = [c["tier"] for c in got]
    assert tiers == sorted(tiers, key=lambda t: 0 if t == "topic" else 1)
    # topic tier gets ~70% (1750) → one 900-token topic chunk fits, then course fills
    assert tiers[0] == "topic" and "course" in tiers


def test_retrieve_single_tier_absorbs_full_budget():
    rows = [_rpc_row(i, "mat-topic", 800, 1 - i / 10) for i in range(1, 5)]
    db = _FakeDB(rows, [{"id": "mat-topic", "filename": "t.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-topic": "topic"}, ["trees"], budget_tokens=2500)
    assert sum(c["token_count"] for c in got) <= 2500
    assert len(got) == 3  # 3×800 fits, 4th doesn't


def test_retrieve_per_material_cap_when_multiple_in_tier():
    rows = ([_rpc_row(i, "mat-a", 700, 0.9) for i in range(1, 5)]
            + [_rpc_row(i, "mat-b", 700, 0.5) for i in range(10, 14)])
    db = _FakeDB(rows, [{"id": "mat-a", "filename": "a.pdf"},
                        {"id": "mat-b", "filename": "b.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-a": "topic", "mat-b": "topic"},
                             ["trees"], budget_tokens=2500)
    by_mat = {}
    for c in got:
        by_mat[c["material_id"]] = by_mat.get(c["material_id"], 0) + c["token_count"]
    assert by_mat.get("mat-b"), "capped material must not starve the other"
    assert all(v <= 2500 * ms.GROUNDING_MAX_MATERIAL_SHARE for v in by_mat.values())


def test_retrieve_dedups_identical_chunks():
    a = _rpc_row(1, "mat-a", 100, 0.9)
    b = {**_rpc_row(2, "mat-b", 100, 0.8),
         "heading": a["heading"], "chunk_text": a["chunk_text"]}
    db = _FakeDB([a, b], [{"id": "mat-a", "filename": "a.pdf"},
                          {"id": "mat-b", "filename": "b.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-a": "topic", "mat-b": "topic"}, ["trees"])
    assert len(got) == 1


def test_retrieve_no_materials_or_no_terms():
    db = _FakeDB([], [])
    assert ms.retrieve_chunks(db, {}, ["trees"]) == []
    assert ms.retrieve_chunks(db, {"m": "topic"}, ["the and"]) == []


# ── Phase 2: vector-first retrieval, FTS fallback ─────────────────────────────

class _VectorDB(_FakeDB):
    """Serves match_material_chunks; fails if FTS is consulted (vector won)."""

    def rpc(self, name, params):
        assert name == "match_material_chunks"
        assert isinstance(params["query_embedding"], list)
        return _Query(self._rpc_rows)


class _BrokenVectorDB(_FakeDB):
    """Vector RPC raises (e.g. 07 migration not applied) → FTS must serve."""

    def rpc(self, name, params):
        if name == "match_material_chunks":
            raise RuntimeError("function does not exist")
        return super().rpc(name, params)


def test_retrieve_prefers_vector_when_query_embeds(monkeypatch):
    monkeypatch.setattr(ms, "_embed_texts", lambda texts: [[0.1] * 8])
    db = _VectorDB([_rpc_row(1, "mat-a", 100, 0.95)], [{"id": "mat-a", "filename": "a.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-a": "topic"}, ["binary trees"])
    assert len(got) == 1 and got[0]["chunk_id"] == "ch1"


def test_retrieve_falls_back_to_fts_when_vector_fails(monkeypatch):
    monkeypatch.setattr(ms, "_embed_texts", lambda texts: [[0.1] * 8])
    db = _BrokenVectorDB([_rpc_row(1, "mat-a", 100, 0.9)], [{"id": "mat-a", "filename": "a.pdf"}])
    got = ms.retrieve_chunks(db, {"mat-a": "topic"}, ["binary trees"])
    assert len(got) == 1  # served by search_material_chunks


# ── Prompt no-op guarantee (ungrounded = byte-identical) ─────────────────────

_CTX = {"course_code": "CS301", "course_name": "DBMS", "topic_title": "Indexing",
        "subject_domain": "CSE", "subtopics": ["B-Trees"], "topic_hours_allocated": 2}

_UNIT = {"concept_id": "C1", "concept_name": "B-Trees", "complexity_tier": "moderate",
         "time_minutes": 30, "scope_in": ["insertion"], "flags": {}}

_PLAN = {"tlo_set": [], "concept_inventory": [_UNIT], "co_mapping": []}

_CHUNKS = [{"chunk_id": "ch1", "material_id": "m1", "heading": "B-Trees",
            "page_start": 3, "page_end": 4, "text": "A B-Tree is a balanced tree.",
            "token_count": 8, "tier": "topic", "filename": "book.pdf"}]


def test_topic_plan_prompt_ungrounded_is_identical():
    base = gp.build_topic_plan_prompt(_CTX)
    assert base == gp.build_topic_plan_prompt({**_CTX, "grounding_outline": ""})
    assert "REFERENCE MATERIAL" not in base[1]
    grounded = gp.build_topic_plan_prompt({**_CTX, "grounding_outline": "Material: book.pdf"})
    assert "REFERENCE MATERIAL OUTLINE" in grounded[1]
    assert grounded[1].startswith(base[1])  # purely additive


def test_notes_prompts_ungrounded_are_identical():
    for builder, kwargs in (
        (gp.build_opening_prompt, {"prev_title": None, "next_title": None}),
        (gp.build_core_prompt, {"prior_terms": []}),
    ):
        base = builder(_UNIT, _CTX, _PLAN, **kwargs)
        assert base == builder(_UNIT, _CTX, _PLAN, grounding=None, **kwargs)
        assert base == builder(_UNIT, _CTX, _PLAN, grounding=[], **kwargs)
        assert "REFERENCE MATERIAL" not in base[1]
        grounded = builder(_UNIT, _CTX, _PLAN, grounding=_CHUNKS, **kwargs)
        assert "REFERENCE MATERIAL" in grounded[1]
        assert "book.pdf p.3-4" in grounded[1]
        assert grounded[1].startswith(base[1])
        assert "tier" not in gp.format_grounding_block(_CHUNKS)
        assert "ch1" not in gp.format_grounding_block(_CHUNKS)  # ids never reach the model


def test_revision_prompt_grounding_additive():
    base = gp.build_revision_prompt("student_notes", {"core": {}}, "fix the trace", _CTX)
    assert base == gp.build_revision_prompt("student_notes", {"core": {}}, "fix the trace",
                                            _CTX, grounding=None)
    grounded = gp.build_revision_prompt("student_notes", {"core": {}}, "fix the trace",
                                        _CTX, grounding=_CHUNKS)
    assert "REFERENCE MATERIAL" in grounded[1]
    assert grounded[1].startswith(base[1])
