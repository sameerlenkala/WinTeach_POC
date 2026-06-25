from app.services.generation_service import score_complexity, generate_cos
from app.schemas.generation import ComplexityRequest, COGenerateRequest


def test_complexity_low():
    req = ComplexityRequest(topic="Introduction", bloom_level="L1", hours=1, subtopics=[])
    res = score_complexity(req)
    assert res.label == "Low"
    assert 0 <= res.score <= 1


def test_complexity_high():
    req = ComplexityRequest(topic="Advanced algorithm optimization theorem proof", bloom_level="L6", hours=8, subtopics=[f"sub{i}" for i in range(10)])
    res = score_complexity(req)
    assert res.label == "High"


def test_generate_cos_mock():
    req = COGenerateRequest(course_id="x", unit_titles=["Arrays", "Linked Lists"], bloom_target="L3", count=3)
    res = generate_cos(req)
    assert len(res.course_outcomes) == 3
    assert res.bloom_level == "L3"
