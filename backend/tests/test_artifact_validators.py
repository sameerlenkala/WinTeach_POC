"""Deterministic quiz/assignment gates + the shared token-coverage matcher
(generation_service). All offline — no network, no DB."""

from app.services.generation_service import (
    _covered_in,
    normalize_quiz,
    validate_quiz,
    validate_and_fix_assignment,
)


def _mcq(i, answer="B", bloom="L2", question=None, hint="Think about uniqueness."):
    return {
        "id": i, "type": "mcq", "difficulty": "easy", "bloom_level": bloom,
        "question": question or f"Question {i} about keys?",
        "options": ["A) wrong", "B) right answer text", "C) also wrong", "D) nope"],
        "answer": answer, "explanation": "Because.", "hint": hint,
        "source_ref": "formal_definition",
    }


def _tf(i, answer="True"):
    return {
        "id": i, "type": "true_false", "difficulty": "medium", "bloom_level": "L2",
        "question": f"Statement {i} is definite.", "options": None,
        "answer": answer, "explanation": "Because.", "hint": "Consider the rule.",
        "source_ref": "common_misconceptions",
    }


UNIT = {"bloom_ceiling": "L3"}


# ── token coverage ─────────────────────────────────────────────────────────────

def test_covered_in_tolerates_rephrasing():
    text = "the scheduling of processes happens in the kernel"
    assert _covered_in(text, "Process scheduling")           # word-order free
    assert _covered_in(text, "process scheduling basics")    # stop word ignored
    assert not _covered_in(text, "deadlock prevention")


# ── quiz ───────────────────────────────────────────────────────────────────────

def test_quiz_valid_passes():
    content = {"questions": [_mcq(i, answer=l) for i, l in
                             enumerate("ABCDABCDAB", 1)] + [_tf(11), _tf(12, "False")]}
    v = validate_quiz(normalize_quiz(content), UNIT)
    assert v.all_pass
    by_name = {c.name: c for c in v.checks}
    assert by_name["quiz:answer_format"].passed
    assert by_name["quiz:bloom_ceiling"].passed


def test_quiz_bad_answer_format_blocks():
    q = _mcq(1, answer="E")  # not a valid letter
    v = validate_quiz({"questions": [q]}, UNIT)
    assert not v.all_pass
    assert any(c.name == "quiz:answer_format" and not c.passed for c in v.checks)


def test_quiz_bloom_above_ceiling_blocks():
    v = validate_quiz({"questions": [_mcq(1, bloom="L5")]}, UNIT)
    assert not v.all_pass
    assert any(c.name == "quiz:bloom_ceiling" and not c.passed for c in v.checks)


def test_quiz_hint_leak_flagged_nonblocking():
    q = _mcq(1, hint="Remember that right answer text matters here.")
    v = validate_quiz({"questions": [q]}, UNIT)
    leak = next(c for c in v.checks if c.name == "quiz:hint_leak")
    assert not leak.passed and not leak.blocking


def test_normalize_quiz_sorts_maq_and_nulls_tf_options():
    content = {"questions": [
        {"id": 9, "type": "maq", "difficulty": "hard", "bloom_level": "L3",
         "question": "Pick all. (Select all that apply.)",
         "options": ["A) a", "B) b", "C) c", "D) d"],
         "answer": ["C", "A", "C"], "explanation": "x", "hint": "y",
         "source_ref": "z"},
        {**_tf(2), "options": ["True", "False"]},
    ]}
    out = normalize_quiz(content)
    assert out["questions"][0]["answer"] == ["A", "C"]
    assert out["questions"][0]["id"] == 1          # resequenced
    assert out["questions"][1]["options"] is None


# ── assignment ────────────────────────────────────────────────────────────────

def test_assignment_rubric_rescaled_to_task_marks():
    content = {
        "title": "t", "total_marks": 99, "estimated_time_minutes": 120,
        "tasks": [
            {"id": 1, "title": "a", "scenario": "s", "prompt": "p", "marks": 10,
             "bloom_level": "L3", "subtopics": ["INSERT statement"],
             "deliverable": "d", "model_answer_outline": []},
            {"id": 2, "title": "b", "scenario": "s", "prompt": "p", "marks": 30,
             "bloom_level": "L4", "subtopics": ["SELECT queries"],
             "deliverable": "d", "model_answer_outline": []},
        ],
        "rubric": [{"criterion": "c1", "points": 10, "descriptor": "d"},
                   {"criterion": "c2", "points": 15, "descriptor": "d"}],
        "integrity_policy": "none",
    }
    plan = {"concept_inventory": [{"concept_name": "INSERT statement"},
                                  {"concept_name": "SELECT queries"}]}
    v = validate_and_fix_assignment(content, plan)
    assert v.all_pass
    assert content["total_marks"] == 40                       # derived from tasks
    assert sum(r["points"] for r in content["rubric"]) == 40  # rescaled exactly
    cov = next(c for c in v.checks if c.name == "assignment:subtopic_coverage")
    assert cov.passed


def test_assignment_uncovered_subtopic_flagged_nonblocking():
    content = {"tasks": [{"id": 1, "title": "a", "scenario": "s", "prompt": "p",
                          "marks": 10, "subtopics": ["INSERT statement"]}],
               "rubric": [], "total_marks": 10}
    plan = {"concept_inventory": [{"concept_name": "INSERT statement"},
                                  {"concept_name": "Deadlock prevention"}]}
    v = validate_and_fix_assignment(content, plan)
    cov = next(c for c in v.checks if c.name == "assignment:subtopic_coverage")
    assert not cov.passed and not cov.blocking
    assert v.all_pass  # coverage is telemetry, not a gate
