"""P5 topic_bloom consumption in _to_ai_extraction: the per-topic taught level
wins when present and within the primary CO's ceiling; inheritance otherwise."""

from app.services.pipeline_service import _to_ai_extraction


P1 = {
    "course_name": "DBMS", "course_code": "CS221", "credits": 4,
    "semester": "II", "regulation": "R22",
    "module_tree": {"value": [{
        "unit_id": "UNIT-I", "title": "Unit I", "contact_hours": 9,
        "topics": [
            {"title": "Introduction to Databases", "subtopics": ["History", "Terminology"]},
            {"title": "ER Modeling", "subtopics": ["Entities", "Relationships"]},
            {"title": "Unmapped Topic", "subtopics": ["Stray"]},
        ]}], "confidence": "high"},
    "contact_hours": {"value": {"total": 45}},
    "reference_books": {"value": []},
    "lab_flag": {"value": False},
}

P4 = {"evaluated_cos": [
    {"co_id": "CO1", "final_text": "Analyse database designs", "bloom_level": "L4"},
]}

P5 = {"co_topic_mapping": [
    # introductory topic under an L4 CO, taught at L2 → keeps L2
    {"unit_id": "UNIT-I", "topic_title": "Introduction to Databases",
     "topic_bloom": "L2",
     "mapped_cos": [{"co_id": "CO1", "contribution": "primary"}]},
    # model over-declares L6 above the CO's L4 ceiling → clamped to Analyze
    {"unit_id": "UNIT-I", "topic_title": "ER Modeling",
     "topic_bloom": "L6",
     "mapped_cos": [{"co_id": "CO1", "contribution": "primary"}]},
    # no topic_bloom, no mapping row for "Unmapped Topic" → unit fallback
]}


def test_topic_bloom_respected_and_capped():
    out = _to_ai_extraction(P1, P4, P5)
    topics = {t["title"]: t for t in out["units"][0]["topics"]}

    # Declared L2 under an L4 CO → stays Understand, not inherited Analyze.
    assert topics["Introduction to Databases"]["bloom_level"] == "Understand"
    # Declared L6 above the CO's L4 → clamped to the ceiling (Analyze).
    assert topics["ER Modeling"]["bloom_level"] == "Analyze"
    # Unmapped topic falls back to the unit's primary-CO bloom.
    assert topics["Unmapped Topic"]["bloom_level"] == "Analyze"


def test_no_topic_bloom_backward_compatible():
    p5_legacy = {"co_topic_mapping": [
        {"unit_id": "UNIT-I", "topic_title": "Introduction to Databases",
         "mapped_cos": [{"co_id": "CO1", "contribution": "primary"}]},
    ]}
    out = _to_ai_extraction(P1, P4, p5_legacy)
    topics = {t["title"]: t for t in out["units"][0]["topics"]}
    # Old behaviour preserved when P5 carries no topic_bloom.
    assert topics["Introduction to Databases"]["bloom_level"] == "Analyze"
