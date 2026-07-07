"""Strict OpenAI json_schema definitions for the Student Notes nodes (§7).

These enforce mechanically what the prompt templates ask for rhetorically —
the observed failure mode of json_object mode is the model ignoring structured
shapes (e.g. emitting formal_definition as prose instead of {core, elaboration}).

Strict-mode rules honored throughout: every object sets additionalProperties
false and lists every property in required; optionality is expressed as a
nullable type union, never by omitting the field.
"""

from __future__ import annotations


def _obj(props: dict) -> dict:
    """An object schema with all fields required (strict-mode requirement)."""
    return {"type": "object", "properties": props,
            "required": list(props.keys()), "additionalProperties": False}


def _arr(items: dict) -> dict:
    return {"type": "array", "items": items}


_STR = {"type": "string"}
_NUM = {"type": "number"}
_BOOL = {"type": "boolean"}
_STR_NULL = {"type": ["string", "null"]}
_STR_ARR = _arr(_STR)


def _enum(*values: str) -> dict:
    return {"type": "string", "enum": list(values)}


_LEVEL = _enum("Low", "Medium", "High")
_BLOOM = _enum("L1", "L2", "L3", "L4", "L5", "L6")

# ── Opening (Tier A) ──────────────────────────────────────────────────────────

OPENING_SCHEMA = _obj({
    "subtopic_id": _STR,
    "subtopic_title": _STR,
    "sections": _obj({
        "topic_overview": _obj({
            "subtopic_metadata": _obj({
                "subtopic_title": _STR,
                "proficiency_target": _STR,
                "complexity_tier": _STR,
                "total_hours": _NUM,
                "difficulty": _STR,
                "reading_time_minutes": _NUM,
                "placement_relevance": _LEVEL,
                "placement_justification": _STR,
                "university_importance": _LEVEL,
                "university_justification": _STR,
            }),
            "outcomes_checklist": _arr(_obj({
                "tlo_id": _STR, "bloom_level": _BLOOM, "statement": _STR,
            })),
        }),
        "problem_statement": _obj({"scenario": _STR, "gap_statement": _STR}),
        "introduction": _obj({
            "connectivity_matrix": _obj({
                "foundation": _STR_ARR,
                "this_subtopic": _STR_ARR,
                "builds_toward": _STR_ARR,
            }),
            "narrative_intro": _STR,
        }),
    }),
})

# ── Core (Tier B) ─────────────────────────────────────────────────────────────

_VISUAL = _obj({
    "visual_id": _STR,
    "type": _enum("table", "flowchart", "hierarchy_diagram", "memory_diagram",
                  "syntax_diagram", "execution_trace_table", "mermaid_flowchart",
                  "mermaid_sequence", "mermaid_state", "mermaid_er", "mermaid_class"),
    "title": _STR,
    "description": _STR,
    "mermaid_code": _STR_NULL,
    "columns": _STR_ARR,
    "rows": _arr(_STR_ARR),
    "placement": _enum("before_explanation", "after_explanation", "after_worked_example"),
})

CORE_SCHEMA = _obj({
    "subtopic_id": _STR,
    "subtopic_title": _STR,
    "proficiency_target": _STR,
    "complexity_tier": _STR,
    "traceability_tag": {"type": ["string", "null"]},
    "new_terms_introduced": _STR_ARR,
    "core_concept": _obj({
        "formal_definition": _obj({"core": _STR, "elaboration": _STR_ARR}),
        "mental_model_analogy": _STR_ARR,
    }),
    "deep_dive": _obj({
        "architecture_and_mechanism": _obj({
            "explanation": _STR_ARR,
            "visuals": _arr(_VISUAL),
        }),
        "code_or_formalization": _obj({
            "applicable": _BOOL,
            "type": _enum("code", "pseudocode", "formal_math", "na_conceptual"),
            "language_or_system": _STR_NULL,
            "content": _STR_NULL,
            "explanation": {"type": ["array", "null"], "items": _STR},
            "sample_output": _STR_NULL,
            "complexity_grid": _obj({
                "best_case_time": _STR, "worst_case_time": _STR,
                "average_case_time": _STR, "space_complexity": _STR,
                "justification": _STR,
            }),
        }),
        "execution_trace": _obj({
            "applicable": _BOOL,
            "dry_run_trace": {"type": ["array", "null"], "items": _STR},
            "edge_case_matrix": _arr(_obj({
                "edge_input": _STR, "expected_behavior": _STR,
            })),
            "visuals": _arr(_VISUAL),
        }),
        "pause_and_think": _arr(_obj({"question": _STR, "answer": _STR})),
    }),
    "practical_understanding": _obj({
        "worked_example": {"type": ["array", "null"], "items": _STR},
        "advantages": _STR_ARR,
        "disadvantages": _STR_ARR,
        "applications": _STR_ARR,
        "common_mistakes": _arr(_obj({
            "mistake": _STR, "why_it_happens": _STR,
            "correct_approach": _STR, "exam_tip": _STR,
        })),
    }),
    "analysis": _obj({
        "applicable": _BOOL, "discussion": _STR_NULL, "complexity_note": _STR_NULL,
    }),
    "comparison": _obj({
        "applicable": _BOOL,
        "compared_against": _STR_NULL,
        "comparison_table": _obj({
            "parameters": _STR_ARR,
            "rows": _arr(_obj({
                "parameter": _STR, "option_a": _STR, "option_b": _STR,
            })),
        }),
        "no_comparison_justification": _STR_NULL,
    }),
})

# ── Closing (Tier C) ──────────────────────────────────────────────────────────

_PRACTICE_Q = _obj({
    "question": _STR, "subtopic_id": _STR,
    "bloom_level": _BLOOM, "answer_explanation": _STR,
})

CLOSING_SCHEMA = _obj({
    "subtopic_id": _STR,
    "subtopic_title": _STR,
    "sections": _obj({
        "common_mistakes": _arr(_obj({
            "wrong_way": _STR, "why_it_fails": _STR,
            "right_way": _STR, "why_it_works": _STR,
        })),
        "revision_section": _obj({
            "key_takeaways": _STR_ARR,
            "important_formulas": _STR_ARR,
            "important_definitions": _arr(_obj({"term": _STR, "definition": _STR})),
            "active_recall_prompts": _arr(_obj({
                "prompt": _STR, "answer_explanation": _STR,
            })),
        }),
        "glossary_section": _obj({
            "terms": _arr(_obj({
                "term": _STR, "formal_definition": _STR,
                "simple_explanation": _STR, "used_in": _STR_ARR,
                "related_terms": _STR_ARR,
            })),
        }),
        "practice_questions": _obj({
            "easy": _arr(_PRACTICE_Q),
            "medium": _arr(_PRACTICE_Q),
            "hard": _arr(_PRACTICE_Q),
        }),
        "related_topics": _obj({
            "previous_subtopic": _STR, "previous_connection": _STR,
            "next_subtopic": _STR, "next_connection": _STR,
            "builds_toward": _STR_ARR, "industry_relevance": _STR,
        }),
        "flashcard_section": _obj({
            "cards": _arr(_obj({"front": _STR, "back": _STR})),
        }),
    }),
})

# ── Validator-fired expansion + notes critic ──────────────────────────────────

EXPANSION_SCHEMA = _obj({"expanded_text": _STR})

# Shape-preserving variants — an expansion must give back the field's original
# JSON shape, never flatten a structured field to prose.
EXPANSION_POINTS_SCHEMA = _obj({"expanded_points": _STR_ARR})
EXPANSION_DEFINITION_SCHEMA = _obj({"core": _STR, "elaboration": _STR_ARR})

_SCORE = {"type": "integer", "enum": [0, 1, 2]}

CRITIC_SCHEMA = _obj({
    "scores": _obj({
        "scenario_stakes": _SCORE, "definition_precision": _SCORE,
        "analogy_mapping": _SCORE, "teaches_not_documents": _SCORE,
        "example_diversity": _SCORE, "output_shown": _SCORE,
        "callouts_used": _SCORE, "takeaway_compression": _SCORE,
        "no_redundancy": _SCORE, "scope_discipline": _SCORE,
    }),
    "fixes": _arr(_obj({
        "path": _STR, "problem": _STR, "instruction": _STR,
    })),
})

# ── Topic cheat sheet (summary artifact) ──────────────────────────────────────
# Panels are a tagged union — one object shape per panel type, discriminated by
# the single-value "type" enum. "subtopic" is "" for topic-wide panels.


def _panel(ptype: str, extra: dict) -> dict:
    return _obj({"type": _enum(ptype), "subtopic": _STR, "title": _STR, **extra})


CHEATSHEET_SCHEMA = _obj({
    "topic_title": _STR,
    "panels": _arr({"anyOf": [
        _panel("definition", {"body": _STR}),
        _panel("keyterms", {"terms": _arr(_obj({"term": _STR, "def": _STR}))}),
        _panel("bullets", {"items": _STR_ARR}),
        _panel("code", {"language": _STR, "code": _STR}),
        _panel("formula", {"formulas": _arr(_obj({"formula": _STR, "meaning": _STR}))}),
        _panel("table", {"headers": _STR_ARR, "rows": _arr(_STR_ARR)}),
        _panel("mistakes", {"items": _arr(_obj({"wrong": _STR, "right": _STR}))}),
        _panel("steps", {"items": _STR_ARR}),
    ]}),
})

# ── Topic assignment (scenario tasks + criterion rubric) ──────────────────────

_INT = {"type": "integer"}

ASSIGNMENT_SCHEMA = _obj({
    "title": _STR,
    "total_marks": _INT,
    "estimated_time_minutes": _INT,
    "tasks": _arr(_obj({
        "id": _INT,
        "title": _STR,
        "scenario": _STR,
        "prompt": _STR,
        "marks": _INT,
        "bloom_level": _BLOOM,
        "subtopics": _STR_ARR,
        "deliverable": _STR,
        "model_answer_outline": _STR_ARR,
    })),
    "rubric": _arr(_obj({"criterion": _STR, "points": _INT, "descriptor": _STR})),
    "integrity_policy": _STR,
})

# ── Faculty diagnostic (private pre-teaching self-check) ──────────────────────

FACULTY_DIAGNOSTIC_SCHEMA = _obj({
    "dimensions": _arr(_obj({
        "name": _enum("content_mastery", "misconception_awareness",
                      "pedagogical_readiness", "connection_depth"),
        "items": _arr(_obj({
            "probe": _STR,
            "what_good_looks_like": _STR,
            "red_flags": _STR,
            "remediation": _STR,
            "subtopic": _STR,
        })),
    })),
    "gap_map": _arr(_obj({
        "subtopic": _STR,
        "likely_student_struggle": _STR,
        "classroom_countermeasure": _STR,
    })),
})

# ── Topic flashcards (interview Q&A deck) ─────────────────────────────────────

FLASHCARDS_SCHEMA = _obj({
    "cards": _arr(_obj({
        "id": _INT,
        "question": _STR,
        "answer": _STR,
        "key_points": _STR_ARR,
        "difficulty": _enum("basic", "intermediate", "advanced"),
        "subtopic": _STR,
        "follow_up": _STR,
    })),
})

# ── Concept quiz (mcq / maq / true_false) ─────────────────────────────────────
# `options` is null for true_false; `answer` is a single letter for mcq, an
# alphabetically sorted letter array for maq, "True"/"False" for true_false —
# the anyOf covers both shapes (strict mode forbids optional fields).

CONCEPT_QUIZ_SCHEMA = _obj({
    "concept_id": _STR,
    "questions": _arr(_obj({
        "id": {"type": "integer"},
        "type": _enum("mcq", "maq", "true_false"),
        "difficulty": _enum("easy", "medium", "hard"),
        "bloom_level": _BLOOM,
        "question": _STR,
        "options": {"type": ["array", "null"], "items": _STR},
        "answer": {"anyOf": [_STR, _STR_ARR]},
        "explanation": _STR,
        "hint": _STR,
        "source_ref": _STR,
    })),
})
