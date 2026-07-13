"""Polish monotonicity gate: a net-harmful polish is reverted, a helpful one
kept. Exercises critique_and_polish_unit with _chat_json stubbed to a fixed
critic → polish → re-critique sequence (no network)."""

import pytest
from app.services import generation_service as gs

UNIT = {"concept_name": "Hashing", "complexity_tier": "moderate"}
CTX = {"course_name": "DBMS", "subject_domain": "databases"}

# 10-dimension score dicts (the notes rubric).
_DIMS = ["scenario_stakes", "definition_precision", "analogy_mapping",
         "teaches_not_documents", "example_diversity", "output_shown",
         "callouts_used", "takeaway_compression", "no_redundancy", "scope_discipline"]


def _scores(total_ones, zeros=0):
    """Build a score dict summing roughly to a target by setting values."""
    d = {k: 2 for k in _DIMS}
    # knock some down to hit a lowish total that triggers polish
    d["scenario_stakes"] = 0 if zeros else 1
    d["teaches_not_documents"] = 1
    d["example_diversity"] = 1
    return d


def _make_stub(rescore_scores):
    """Return a fake _chat_json: 1st call=critic, 2nd=polish, 3rd=re-critique."""
    calls = {"n": 0}

    def stub(client, system, user, temperature=0.4, schema=None, schema_name="output",
             light=False, effort=None):
        calls["n"] += 1
        if calls["n"] == 1:  # critic
            return {"scores": _scores(0, zeros=1),
                    "fixes": [{"path": "core.deep_dive.text",
                               "problem": "weak", "instruction": "improve"}]}
        if calls["n"] == 2:  # polish
            return {"patches": [{"path": "core.deep_dive.text", "new_value": "POLISHED"}]}
        return {"scores": rescore_scores}  # re-critique

    return stub, calls


@pytest.fixture
def unit_output():
    return {"opening": {}, "core": {"deep_dive": {"text": "ORIGINAL"}}, "closing": {}}


def test_polish_reverted_when_rescore_lower(monkeypatch, unit_output):
    # original total: scenario0+def2+analogy2+teaches1+example1+output2+callouts2
    #                 +takeaway2+noredundancy2+scope2 = 16
    # rescore total 12 < 16 → revert.
    worse = {k: 2 for k in _DIMS}
    for k in ("scenario_stakes", "definition_precision", "analogy_mapping", "teaches_not_documents"):
        worse[k] = 0  # drag total down to 12
    stub, calls = _make_stub(worse)
    monkeypatch.setattr(gs, "_chat_json", stub)

    rec = gs.critique_and_polish_unit(object(), unit_output, UNIT, CTX)

    assert calls["n"] == 3
    assert rec.get("polish_reverted") is True
    assert rec["polished"] is False
    assert unit_output["core"]["deep_dive"]["text"] == "ORIGINAL"   # reverted


def test_polish_kept_when_rescore_higher(monkeypatch, unit_output):
    better = {k: 2 for k in _DIMS}   # total 20 > original 16
    stub, calls = _make_stub(better)
    monkeypatch.setattr(gs, "_chat_json", stub)

    rec = gs.critique_and_polish_unit(object(), unit_output, UNIT, CTX)

    assert calls["n"] == 3
    assert rec.get("polish_reverted") is not True
    assert rec["polished"] is True
    assert rec["scores_after"] == better
    assert unit_output["core"]["deep_dive"]["text"] == "POLISHED"   # kept


def test_polish_kept_when_rescore_equal(monkeypatch, unit_output):
    # equal total → not worse → kept (monotonic on total).
    equal = _scores(0, zeros=1)   # same shape/total as the original critic
    stub, calls = _make_stub(equal)
    monkeypatch.setattr(gs, "_chat_json", stub)

    rec = gs.critique_and_polish_unit(object(), unit_output, UNIT, CTX)

    assert rec["polished"] is True
    assert unit_output["core"]["deep_dive"]["text"] == "POLISHED"
