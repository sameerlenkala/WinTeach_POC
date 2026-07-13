"""Node B (Student Notes) tests — mechanical validators, prompt assembly, and
topic assembly (Student Notes Prompt Spec + pipeline doc §7.2/§10.3)."""

from app.schemas.content_types import derive_flags
from app.services import generation_prompts as prompts
from app.services.generation_service import (
    assemble_notes,
    validate_notes_unit,
)


def _words(n, token="hashing"):
    return " ".join([token] * n)


def _p2_unit():
    return {
        "concept_id": "C1", "concept_name": "Hashing", "primary_content_type": "P2",
        "flags": derive_flags("P2"), "complexity_tier": "moderate",
        "proficiency_target": "implement a hash map", "serves_tlos": ["T1"],
        "scope_in": ["hashing"], "scope_out": ["perfect hashing"],
        "bloom_ceiling": "L3", "time_minutes": 60, "relative_weight_pct": 100,
    }


def _ctx():
    return {"course_name": "DSA", "subject_domain": "CSE", "subject_type_label": "",
            "topic_title": "Hash Tables", "unit_title": "Unit 3", "audience_level": "UG"}


def _valid_output():
    """A P2/moderate unit output meeting every required word minimum + flag block."""
    core = {
        "new_terms_introduced": ["Hashing"],
        "core_concept": {"formal_definition": _words(230), "mental_model_analogy": "a library index"},
        "deep_dive": {
            "architecture_and_mechanism": {
                "explanation": _words(290),
                "visuals": [{"visual_id": "V1", "type": "table", "title": "t",
                             "description": "d", "columns": ["a"], "rows": [["1"]],
                             "placement": "after_explanation"}],
            },
            "code_or_formalization": {
                "applicable": True, "type": "code", "language_or_system": "Python 3.11",
                "content": "def h(k): return k % 7", "explanation": _words(290),
                "complexity_grid": {"best_case_time": "O(1)", "worst_case_time": "O(n)",
                                    "average_case_time": "O(1)", "space_complexity": "O(n)",
                                    "justification": "load factor"},
            },
            "execution_trace": {"applicable": True, "dry_run_trace": _words(210),
                                "edge_case_matrix": [{"edge_input": "empty", "expected_behavior": "no-op"}],
                                "visuals": []},
        },
        "practical_understanding": {
            "worked_example": _words(210), "advantages": ["fast", "simple"],
            "disadvantages": ["collisions", "resize cost"], "applications": ["caches", "symbol tables"],
            "common_mistakes": [{"mistake": "m", "why_it_happens": "w", "correct_approach": "c", "exam_tip": "e"}],
        },
        "analysis": {"applicable": True, "discussion": _words(260), "complexity_note": "O(1) amortized"},
        "comparison": {"applicable": False, "compared_against": None,
                       "comparison_table": {"parameters": [], "rows": []}, "no_comparison_justification": "n/a"},
    }
    opening = {"sections": {"topic_overview": {"outcomes_checklist": [
        {"tlo_id": "T1", "bloom_level": "L3",
         "statement": "By the end of this subtopic, you will be able to apply hashing."}]}}}
    closing = {"sections": {"glossary_section": {"terms": [{"term": "Hashing"}]},
                            "practice_questions": {"easy": [{"question": "q", "bloom_level": "L2"}],
                                                   "medium": [], "hard": []}}}
    return {"opening": opening, "core": core, "closing": closing}


def test_valid_notes_unit_passes():
    res = validate_notes_unit(_valid_output(), _p2_unit(), _ctx())
    assert res.all_pass, [c.name for c in res.failures]


def test_word_minimum_shortfall_flags_expansion_field():
    out = _valid_output()
    out["core"]["core_concept"]["formal_definition"] = _words(10)
    res = validate_notes_unit(out, _p2_unit(), _ctx())
    assert not res.all_pass
    assert "formal_definition" in res.short_fields


def test_missing_code_block_fails_flag_conformance():
    out = _valid_output()
    out["core"]["deep_dive"]["code_or_formalization"]["content"] = None
    res = validate_notes_unit(out, _p2_unit(), _ctx())
    assert not res.all_pass
    assert any(c.name == "flag:code_block" for c in res.failures)


def test_scope_in_not_demonstrated_fails():
    out = _valid_output()
    unit = _p2_unit()
    unit["scope_in"] = ["open addressing"]   # never appears in the output text
    res = validate_notes_unit(out, unit, _ctx())
    assert not res.all_pass
    assert any(c.name == "scope:in_covered" for c in res.failures)


def test_glossary_consistency_fails_when_term_missing():
    out = _valid_output()
    out["closing"]["sections"]["glossary_section"]["terms"] = []   # term dropped
    res = validate_notes_unit(out, _p2_unit(), _ctx())
    assert not res.all_pass
    assert any(c.name == "glossary:consistency" for c in res.failures)


def test_banned_verb_outcome_fails():
    out = _valid_output()
    out["opening"]["sections"]["topic_overview"]["outcomes_checklist"][0]["statement"] = \
        "Understand hashing."
    res = validate_notes_unit(out, _p2_unit(), _ctx())
    assert not res.all_pass
    assert any(c.name == "verb:outcomes_bank" for c in res.failures)


def test_coding_override_requires_code_even_when_flag_false():
    unit = _p2_unit()
    unit["primary_content_type"] = "P1"
    unit["flags"] = derive_flags("P1")   # requires_code False
    ctx = _ctx()
    ctx["subject_type_label"] = "Applied Databases"   # coding subject → override
    out = _valid_output()
    out["core"]["deep_dive"]["code_or_formalization"]["content"] = None
    res = validate_notes_unit(out, unit, ctx)
    assert not res.all_pass
    assert any(c.name == "flag:code_block" for c in res.failures)


def test_prompt_builders_assemble():
    plan = {"tlo_set": [{"tlo_id": "T1", "statement": "Apply hashing.", "parent_co": "CO1",
                         "bloom_level": "L3"}], "front_matter": {"topic_plan_version": "1.0.0"}}
    unit = _p2_unit()
    ctx = _ctx()
    for builder in (
        lambda: prompts.build_opening_prompt(unit, ctx, plan, prev_title=None, next_title="Collisions"),
        lambda: prompts.build_core_prompt(unit, ctx, plan, prior_terms=["Array"]),
        lambda: prompts.build_closing_prompt(unit, ctx, prev_title=None, next_title="Collisions"),
    ):
        system, user = builder()
        assert isinstance(system, str) and "C1" in user

    # The legacy topic-level slides builder was retired; decks are built per
    # concept (build_concept_slides_chunk_prompt).
    assert not hasattr(prompts, "build_slides_prompt")


def test_core_prompt_selects_comparison_block():
    unit = _p2_unit()
    unit["flags"] = derive_flags("P4", overrides={"needs_comparison": True},
                                 comparison_target="Open addressing")
    _, user = prompts.build_core_prompt(unit, _ctx(), {"tlo_set": []}, prior_terms=[])
    assert "Open addressing" in user


def test_assemble_notes_builds_rollups_and_hash():
    rec = {"unit_ref": "C1", "closing": {"sections": {
        "glossary_section": {"terms": [{"term": "Hashing"}]},
        "practice_questions": {"easy": [{"question": "q1", "bloom_level": "L2"}],
                               "medium": [], "hard": []}}}}
    plan = {"co_mapping": [{"co_id": "CO1"}], "front_matter": {"topic_plan_version": "1.0.0"}}
    doc = assemble_notes([rec], plan, _ctx())
    assert doc["rollups"]["glossary_index"] == [{"term": "Hashing", "unit_ref": "C1"}]
    assert len(doc["rollups"]["question_bank_view"]) == 1
    assert doc["topic_header"]["content_hash"] and doc["topic_header"]["notes_version"] == "1.0.0"
