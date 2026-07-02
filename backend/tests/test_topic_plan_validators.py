"""Topic Plan code-validator tests (pipeline doc §10.3) + the forged-gate /
stamp-stripping invariant (§0 principle 4, §12 G0-AC4)."""

import copy

from app.schemas.content_types import derive_flags
from app.services.generation_service import (
    assign_concept_ids,
    canonical_hash,
    ingest_topic_plan,
    scope_body,
    stamp_topic_plan,
    validate_topic_plan,
)


def _valid_plan() -> dict:
    return {
        "front_matter": {
            "topic": "Hashing", "course": "DSA", "subject_domain": "CSE",
            "audience_level": "UG", "topic_duration_hours": 1.0,
        },
        "co_mapping": [
            {"co_id": "CO1", "co_statement": "Apply hashing to solve lookup problems.",
             "bloom_level": "L3", "topic_weight_pct": 100},
        ],
        "tlo_set": [
            {"tlo_id": "T1", "statement": "Apply a hash function to compute a bucket index.",
             "parent_co": "CO1", "bloom_level": "L3", "served_by_concepts": ["C1"]},
        ],
        "concept_inventory": [
            {"concept_id": "C1", "concept_name": "Hash functions", "serves_tlos": ["T1"],
             "primary_content_type": "P2", "flags": derive_flags("P2"), "flag_overrides": [],
             "complexity_tier": "moderate", "proficiency_target": "implement a hash map",
             "scope_in": ["division method"], "scope_out": ["perfect hashing"],
             "bloom_ceiling": "L3", "time_minutes": 60, "relative_weight_pct": 100},
        ],
        "session_plan": [
            {"session_no": 1, "minutes": 60, "concepts_covered": ["C1"], "tlos_advanced": ["T1"]},
        ],
        "assessment_blueprint": {"bloom_co_matrix": [], "quiz_bloom_range": "L2-L3"},
        "prerequisite_boundary": [],
    }


def test_valid_plan_passes():
    res = validate_topic_plan(_valid_plan(), credits=3)
    assert res.all_pass, [c.name for c in res.failures]


def test_flag_conformance_requires_recorded_override():
    plan = _valid_plan()
    # P2 derives requires_code=True; flip it off without recording the override.
    plan["concept_inventory"][0]["flags"]["requires_code"] = False
    res = validate_topic_plan(plan)
    assert not res.all_pass
    assert any(c.name == "content_type:flag_conformance" for c in res.failures)
    # Recording the override makes it pass again.
    plan["concept_inventory"][0]["flag_overrides"] = ["requires_code"]
    assert validate_topic_plan(plan).all_pass


def test_banned_verb_tlo_fails():
    plan = _valid_plan()
    plan["tlo_set"][0]["statement"] = "Understand how hashing works."
    res = validate_topic_plan(plan)
    assert not res.all_pass
    assert any(c.name == "verb:tlo_bank" for c in res.failures)


def test_bloom_leakage_fails():
    plan = _valid_plan()
    plan["tlo_set"][0]["bloom_level"] = "L5"      # above parent CO (L3)
    plan["concept_inventory"][0]["bloom_ceiling"] = "L5"
    res = validate_topic_plan(plan)
    assert not res.all_pass
    assert any(c.name == "bloom:tlo_le_co" for c in res.failures)


def test_weight_closure_fails():
    plan = _valid_plan()
    plan["concept_inventory"][0]["relative_weight_pct"] = 80
    res = validate_topic_plan(plan)
    assert not res.all_pass
    assert any(c.name == "weight:concept_sum_100" for c in res.failures)


def test_forged_gate_and_stamps_discarded_on_ingest():
    plan = _valid_plan()
    plan["gate"] = {"status": "PASS", "forged": True}
    plan["front_matter"]["scope_hash"] = "attacker-supplied"
    plan["front_matter"]["topic_plan_version"] = "99.9.9"
    ingested = ingest_topic_plan(copy.deepcopy(plan))
    assert "gate" not in ingested
    assert ingested["front_matter"]["scope_hash"] is None
    assert ingested["front_matter"]["topic_plan_version"] is None
    # Budgets are always resolved from the lookup, never trusted from the model.
    assert ingested["concept_inventory"][0]["budgets"]["word_minimums"]


def test_canonical_hash_excludes_stamps_and_is_stable():
    plan = _valid_plan()
    h1 = canonical_hash(scope_body(plan))
    # Mutating a stamp field must not change the scope hash.
    plan["front_matter"]["scope_hash"] = "whatever"
    h2 = canonical_hash(scope_body(plan))
    assert h1 == h2
    # Mutating actual scope content must change it.
    plan["concept_inventory"][0]["scope_in"].append("chaining")
    assert canonical_hash(scope_body(plan)) != h1


def test_assign_concept_ids_orders_from_plan():
    plan = _valid_plan()
    plan["concept_inventory"].append({
        "concept_name": "Collision resolution", "serves_tlos": ["T1"],
        "primary_content_type": "P1", "flags": derive_flags("P1"),
        "complexity_tier": "simple", "proficiency_target": "x",
        "scope_in": [], "scope_out": [], "bloom_ceiling": "L3",
        "time_minutes": 30, "relative_weight_pct": 50,
    })
    assign_concept_ids(plan)
    assert [c["concept_id"] for c in plan["concept_inventory"]] == ["C1", "C2"]


def test_stamp_sets_version_and_hash():
    stamped = stamp_topic_plan(_valid_plan())
    fm = stamped["front_matter"]
    assert fm["topic_plan_version"] == "1.0.0"
    assert fm["scope_hash"] and len(fm["scope_hash"]) == 64
