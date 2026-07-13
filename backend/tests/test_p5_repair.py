"""P5 coverage repair — reproduces the observed DBMS course gaps:
Unit V topics had no primary CO (bloom fell back to CO1/'Understand'),
CO5 (suggested AI outcome) was mapped to nothing, and the elective unit
had no mapping rows at all."""

from app.services import pipeline_service as ps


COS = [
    {"id": "CO1", "text": "Understand basic DBMS concepts", "bloom_level": "L2"},
    {"id": "CO2", "text": "Apply SQL to queries", "bloom_level": "L3"},
    {"id": "CO5", "text": "Develop AI-driven solutions for database tasks", "bloom_level": "L6"},
]

TOPICS = [
    {"unit_id": "UNIT-II", "unit_title": "Unit II", "topic_title": "BASIC SQL"},
    {"unit_id": "UNIT-V", "unit_title": "Unit V", "topic_title": "Transaction Concept"},
    {"unit_id": "UNIT-VI", "unit_title": "Industry & AI Electives", "topic_title": "Database Performance Tuning"},
]


def make_p5():
    return {
        "co_topic_mapping": [
            {"unit_id": "UNIT-II", "topic_title": "BASIC SQL",
             "mapped_cos": [{"co_id": "CO2", "contribution": "primary", "reason": "sql"}]},
            # Unit V: supporting only — no primary (the observed gap)
            {"unit_id": "UNIT-V", "topic_title": "Transaction Concept",
             "mapped_cos": [{"co_id": "CO1", "contribution": "supporting", "reason": "basics"}]},
            # UNIT-VI: no mapping row at all
        ],
        "co_coverage_summary": [],
    }


def test_gap_detection():
    uncovered, orphaned = ps._p5_gaps(make_p5(), TOPICS, COS)
    assert [t["topic_title"] for t in uncovered] == ["Transaction Concept", "Database Performance Tuning"]
    assert [c["id"] for c in orphaned] == ["CO5"]


def test_repair_merges_fixes(monkeypatch):
    def fake_chat(client, prompt, system=None):
        assert "Transaction Concept" in prompt and "CO5" in prompt
        return {
            "topic_fixes": [
                {"unit_id": "UNIT-V", "topic_title": "Transaction Concept",
                 "primary_co": "CO1", "reason": "transactions build on core concepts"},
                {"unit_id": "UNIT-VI", "topic_title": "Database Performance Tuning",
                 "primary_co": "CO2", "reason": "applied SQL tuning"},
            ],
            "co_fixes": [
                {"co_id": "CO5", "assignments": [
                    {"unit_id": "UNIT-VI", "topic_title": "Database Performance Tuning",
                     "contribution": "primary"}]},
            ],
            "unmappable_cos": [],
        }

    monkeypatch.setattr(ps, "_chat", fake_chat)
    p5 = ps.repair_p5_coverage(object(), make_p5(), TOPICS, COS)

    by_key = {(e["unit_id"], e["topic_title"]): e for e in p5["co_topic_mapping"]}
    # Unit V got its supporting CO1 promoted to primary
    unit5 = by_key[("UNIT-V", "Transaction Concept")]["mapped_cos"]
    assert any(m["co_id"] == "CO1" and m["contribution"] == "primary" for m in unit5)
    # Elective unit got a mapping row created with both fixes
    unit6 = by_key[("UNIT-VI", "Database Performance Tuning")]["mapped_cos"]
    assert any(m["co_id"] == "CO5" and m["contribution"] == "primary" for m in unit6)
    # Coverage summary rebuilt: CO5 no longer not_covered
    summary = {c["co_id"]: c for c in p5["co_coverage_summary"]}
    assert summary["CO5"]["coverage"] == "well_covered"
    assert summary["CO1"]["coverage"] == "well_covered"
    # No remaining gaps
    uncovered, orphaned = ps._p5_gaps(p5, TOPICS, COS)
    assert not uncovered and not orphaned


def test_repair_survives_llm_failure(monkeypatch):
    def boom(client, prompt, system=None):
        raise RuntimeError("llm down")
    monkeypatch.setattr(ps, "_chat", boom)
    original = make_p5()
    p5 = ps.repair_p5_coverage(object(), original, TOPICS, COS)
    assert p5["co_topic_mapping"] == make_p5()["co_topic_mapping"]  # untouched


def test_repair_rejects_invalid_fixes(monkeypatch):
    def fake_chat(client, prompt, system=None):
        return {
            "topic_fixes": [
                {"unit_id": "UNIT-V", "topic_title": "Transaction Concept",
                 "primary_co": "IO1"},  # industry outcome (IO) can't be primary
                {"unit_id": "UNIT-V", "topic_title": "Transaction Concept",
                 "primary_co": "CO99"},   # nonexistent CO
                {"unit_id": "UNIT-X", "topic_title": "Ghost Topic", "primary_co": "CO1"},
            ],
            "co_fixes": [{"co_id": "CO99", "assignments": []}],
        }
    monkeypatch.setattr(ps, "_chat", fake_chat)
    p5 = ps.repair_p5_coverage(object(), make_p5(), TOPICS, COS)
    unit5 = next(e for e in p5["co_topic_mapping"] if e["unit_id"] == "UNIT-V")
    assert not any(m["contribution"] == "primary" for m in unit5["mapped_cos"])
    assert not any(e["unit_id"] == "UNIT-X" for e in p5["co_topic_mapping"])
