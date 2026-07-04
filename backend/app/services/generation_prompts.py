"""
Prompt builders for the Stage-6 generation nodes (pipeline doc §7).

The global preamble (§7.0) is prepended to every node's system block. Any
gate/self-check language in a node prompt is advisory pressure only — the
authoritative check is always the code validator (§10.3).
"""

from __future__ import annotations

import json
from typing import Any

from app.schemas import content_types as ct


# ── §7.0 Global system preamble (prepend to every artifact prompt) ────────────

GLOBAL_PREAMBLE = """SYSTEM — WINTEACH CONTENT ENGINE (GLOBAL INVARIANTS)

You generate accreditation-grade teaching material for Indian university engineering
students and faculty in the course's own discipline ({subject_domain}), under
Outcome-Based Education (OBE), Bloom's Revised Taxonomy, and NBA/NAAC conventions.
Calibrate every example, notation, and toolchain to {subject_domain} — never assume
a fixed discipline.

VOICE
- Academically precise, exam-aware, warm. Teach, do not lecture down.
- Use SI units and the syllabus's own terminology. Define a term before using it.
- Build intuition before formalism. Clarity over cleverness.

HARD INVARIANTS
1. SCOPE LOCK. Stay strictly within the scope you are given. Reference prerequisites
   ("> Recall: …") — do not re-teach them. Never mutate a CO's statement or Bloom level.
2. BLOOM BAND. Ceiling = highest CO Bloom for this topic; foundational/introductory
   concepts may carry L1/L2 TLOs (a definitional concept still gets a measurable outcome,
   just at a lower level). No Bloom's leakage: assessment element ≤ its TLO ≤ its parent CO;
   concept ceiling = max served TLOs.
3. VERB RULES. Outcome statements use approved verb-bank verbs at their declared level;
   banned verbs (understand, know, learn, be familiar with, be aware of, appreciate,
   study, grasp, comprehend, realize, be exposed to) never appear as outcome verbs.
4. CONTENT TYPE + FLAGS. Each concept carries one primary Content Type (P1–P5) and its
   derived generation flags, assigned by the Topic Plan. CONSUME them verbatim.
5. SINGLE SOURCE OF TRUTH. Fan-out artifacts introduce NO content absent from the
   approved Student Notes. Every element carries a Notes source_ref.
6. ELEMENT-LEVEL TRACEABILITY. Model-authored traceability tags are placeholders (null);
   the orchestrator constructs them from verified data.
7. NO FABRICATION. Ground content in the concepts, COs, TLOs, and reference books
   provided. Do not invent facts, citations, or sources. If unsure, omit.
8. IDS AND STAMPS. IDs are pre-assigned — echo them verbatim, never invent or renumber.
   Version stamps and hashes are computed by the orchestrator, not by you.
9. OUTPUT = VALID JSON matching the node's strict schema. No prose outside JSON."""


def preamble(ctx: dict) -> str:
    return GLOBAL_PREAMBLE.format(subject_domain=ctx.get("subject_domain") or "the course discipline")


def _j(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


# ── Bloom proportion profile (companion docs: Topic Plan §profile, Notes §context) ─
# Advisory distribution of depth across Bloom levels up to the topic's CO ceiling.
# The plan uses it to set proficiency targets; Notes uses it to weight depth.

_BLOOM_PROFILES: dict[str, dict[str, int]] = {
    "L1": {"L1": 100},
    "L2": {"L1": 30, "L2": 70},
    "L3": {"L1": 15, "L2": 35, "L3": 50},
    "L4": {"L1": 10, "L2": 25, "L3": 35, "L4": 30},
    "L5": {"L1": 5, "L2": 20, "L3": 30, "L4": 25, "L5": 20},
    "L6": {"L1": 5, "L2": 15, "L3": 25, "L4": 25, "L5": 15, "L6": 15},
}


def bloom_profile(co_bloom_level: str | None) -> dict[str, int]:
    return _BLOOM_PROFILES.get((co_bloom_level or "L3").upper(), _BLOOM_PROFILES["L3"])


# ── §7.1 Node A — Topic Plan ──────────────────────────────────────────────────

_TOPIC_PLAN_SYSTEM = """You are an expert curriculum architect producing the SCOPE PLAN for ONE topic in a
{subject_domain} course at {audience_level} level, year {academic_year}. You plan scope
and assessment; you do NOT write teaching content. You draw the box; Student Notes fills it.
academic_year sets scaffolding depth, never the Bloom level.

Produce, in this order:
- hero_block: administrative metadata — program_year_sem (e.g. "B.Tech, Year {academic_year}"),
  course_code_title, unit_identifier, total_hours (the allocated topic hours), obe_framework
  ("NBA / NAAC Compliance"), bloom_ceiling (the topic's CO Bloom ceiling).
- co_mapping: one row for EVERY CO given (operative and supporting). Topic Weight % sums
  to 100. COs and Bloom levels are AUTHORITATIVE — never invent or change them. For each:
  contribution_level (High|Medium|Low — as the mapping genuinely implies, do NOT default
  everything to High), operational_verb (the actual verb used in that CO's text), and
  alignment_justification (one sentence on why this topic serves this CO at that level).
  CRITICAL: every CO listed — primary or supporting — must end up with at least one TLO in
  tlo_set whose parent_co is that CO. Supporting-CO TLOs may sit at a lower Bloom level.
- tlo_set: decompose the selected COs into measurable TLOs — enough to cover every concept
  (minimum one TLO per concept; 4–8 typical). Each TLO traces to EXACTLY ONE parent CO; its
  Bloom level never exceeds the parent's. Approved verb-bank verbs only. Foundational or
  definitional concepts still get a TLO — just at L1/L2 (e.g. "List the components of a
  database schema"); a concept left with zero TLOs is a compliance failure.
- concept_inventory: decompose the topic into concepts in canonical teaching order. For EACH:
  exactly one primary Content Type (P1–P5) + secondary blocks; the derived generation flags
  (requires_code, needs_execution_trace, needs_worked_example, needs_analysis,
  needs_comparison + comparison_target) — start from the canonical derivation for the Content
  Type and override an individual flag ONLY where the material demands it, listing every such
  flag name in flag_overrides; complexity_tier (simple|moderate|complex); proficiency_target
  (Introductory|Working|Mastery — use the Bloom proportion profile: concepts serving lower
  Bloom levels get Introductory/Working, concepts carrying the topic's primary Bloom level
  get Mastery); scope_in and scope_out (scope_out lists what is DELIBERATELY excluded —
  things that sound related but belong to a later topic — to prevent Notes scope creep);
  bloom_ceiling = max Bloom of served TLOs; time_minutes (proportional to proficiency —
  Mastery gets more); relative_weight_pct (sums to 100).
  BE DECISIVE — judge each concept on how much real content it has to teach:
  "simple" = a single fact, basic definition, or short command/syntax with little internal
  mechanism; "moderate" = a concept with some mechanism or a few facets; "complex" = a
  genuine algorithm, multi-step protocol, or concept with significant internals or
  mathematical depth. Do NOT default everything to "moderate" — a topic with 4 concepts
  should rarely have all 4 at the same tier. Likewise judge flags per concept, not per
  course: requires_code true only where actual code/syntax genuinely teaches THIS concept
  (a named algorithm still gets code even in a non-programming course);
  needs_execution_trace true only for stepwise/algorithmic behavior, never as filler for
  definitional or comparative concepts. Flag ambiguous Content Types ct_low_confidence:true.
  Every concept serves ≥1 TLO; every TLO is served by ≥1 concept. Cover every subtopic.
- hour_allocation_blueprint: split the topic hours into lecture_hours, tutorial_hours,
  self_study_hours, assessment_hours — these four MUST sum exactly to the topic hours.
- session_plan: sessions of realistic classroom length (40–60 minutes) whose minutes sum to
  the topic duration (±5), every concept assigned to ≥1 session, in order. For each also
  give instruction_type (Lecture|Tutorial|Assessment), title, pre_class_prep (what the
  student does before this session, or "None"), and in_class_activities (2–4 concrete
  activities, e.g. "Architecture diagram walkthrough", "Live trace on whiteboard").
  There is NO topic-hour ceiling.
- resource_hub: prescribed_textbooks (from the reference books given, with inferred relevant
  chapters if you can reasonably infer them, else "Chapters not specified"); reference_books
  (any beyond those); official_documentation (1–2 real, well-known canonical references —
  only if genuinely standard, else an empty list).
- assessment_blueprint: Bloom × CO coverage matrix at the topic ceiling; quiz_bloom_range;
  assignment_skew; co_weighting matching the Topic Weights; must_assess_concepts;
  quiz_blueprint (format description, target_tlos, attainment_benchmark); and
  assignment_or_lab_blueprint (a one-paragraph practical/engineering task spec if this topic
  has a lab or practical dimension, else null). Author NO questions.
- prerequisite_boundary: SELECT only the genuinely required prerequisites (2–6) — do not
  include unrelated earlier topics. Each has knowledge, taught_in_topic (the earlier topic
  that taught it; prereq_gap:true where none exists), curricular_origin (which unit it came
  from), and scope_boundary (the precise slice of that prior topic the student must already
  have mastered — not the whole topic).
- compliance_gate: self-check booleans (advisory — the orchestrator re-validates):
  tlo_verbs_testable, hours_reconciled, session_minutes_reconciled, prerequisites_mapped,
  tlo_subtopic_bidirectional, bloom_ceiling_respected; outcome "PASS" only if all are true,
  else "FAIL" with blocking_items naming the failed checks.

Use WORKING IDs so the cross-references validate: give each TLO a tlo_id "T1","T2",… in
order and each concept a concept_id "C1","C2",… in order. Reference those exact ids in every
concept's serves_tlos, in each TLO's served_by_concepts, and in the session_plan
(concepts_covered / tlos_advanced). The orchestrator canonicalizes these ids after validation.
Budgets are resolved by the orchestrator from a lookup — you may omit them."""

# Exact output keys the code validators + strict schema expect (§7.5). Node A must
# emit these verbatim — do not rename fields (this is what a prior model got wrong).
_TOPIC_PLAN_OUTPUT = """
Output ONLY this JSON — no explanation, no markdown. Use these EXACT field names:
{{
  "front_matter": {{"topic": "{topic_title}", "course": "{code} {name}", "subject_domain": "{domain}",
    "audience_level": "{level}", "topic_duration_hours": {topic_hours}}},
  "hero_block": {{"program_year_sem": "text", "course_code_title": "{code} {name}",
    "unit_identifier": "unit title", "total_hours": {topic_hours},
    "obe_framework": "NBA / NAAC Compliance", "bloom_ceiling": "L1..L6"}},
  "co_mapping": [{{"co_id": "CO1", "co_statement": "verbatim CO text", "bloom_level": "L2..L6",
    "source": "Faculty-finalized", "topic_weight_pct": 100,
    "contribution_level": "High|Medium|Low", "operational_verb": "verb",
    "alignment_justification": "one sentence"}}],
  "tlo_set": [{{"tlo_id": "T1", "statement": "<approved verb-first, measurable>", "parent_co": "CO1",
    "bloom_level": "L1..L6", "served_by_concepts": ["C1"]}}],
  "concept_inventory": [{{"concept_id": "C1", "concept_name": "short concept name",
    "serves_tlos": ["T1"], "primary_content_type": "P1|P2|P3|P4|P5", "secondary_blocks": [],
    "flags": {{"requires_code": false, "needs_execution_trace": false, "needs_worked_example": true,
      "needs_analysis": false, "needs_comparison": false, "comparison_target": null}},
    "flag_overrides": [], "complexity_tier": "simple|moderate|complex",
    "proficiency_target": "Introductory|Working|Mastery", "scope_in": ["item", "item"], "scope_out": ["item"],
    "bloom_ceiling": "L1..L6", "time_minutes": 30, "relative_weight_pct": 25, "ct_low_confidence": false}}],
  "hour_allocation_blueprint": {{"lecture_hours": 0.0, "tutorial_hours": 0.0,
    "self_study_hours": 0.0, "assessment_hours": 0.0}},
  "session_plan": [{{"session_no": 1, "minutes": 60, "instruction_type": "Lecture|Tutorial|Assessment",
    "title": "session title", "pre_class_prep": "text or None",
    "in_class_activities": ["activity 1", "activity 2"],
    "concepts_covered": ["C1"], "tlos_advanced": ["T1"]}}],
  "resource_hub": {{"prescribed_textbooks": ["Author — Title (Edition) — Chapters X-Y"],
    "reference_books": ["Author — Title (Edition)"], "official_documentation": []}},
  "assessment_blueprint": {{"bloom_co_matrix": [], "quiz_bloom_range": "L2-L3", "assignment_skew": "text",
    "co_weighting": [], "must_assess_concepts": ["C1"],
    "quiz_blueprint": {{"format": "text", "target_tlos": ["T1"], "attainment_benchmark": "text"}},
    "assignment_or_lab_blueprint": "text or null"}},
  "prerequisite_boundary": [{{"knowledge": "text", "taught_in_topic": null, "prereq_gap": false,
    "curricular_origin": "Unit X — inferred", "scope_boundary": "precise slice of knowledge required"}}],
  "compliance_gate": {{"tlo_verbs_testable": true, "hours_reconciled": true,
    "session_minutes_reconciled": true, "prerequisites_mapped": true,
    "tlo_subtopic_bidirectional": true, "bloom_ceiling_respected": true,
    "outcome": "PASS", "blocking_items": []}}
}}
Rules: scope_in and scope_out are ARRAYS of strings. tlo_set statements lead with an approved
verb-bank verb at the declared level (never understand/know/learn/appreciate/be aware of).
co_mapping topic_weight_pct sums to 100; concept relative_weight_pct sums to 100. This topic is
{topic_total_minutes} minutes long: your session_plan minutes MUST sum to {topic_total_minutes}
(±5) and your concept time_minutes MUST also sum to {topic_total_minutes}. Every concept serves
≥1 TLO; every TLO is served by ≥1 concept; every concept appears in ≥1 session."""


def build_topic_plan_prompt(ctx: dict) -> tuple[str, str]:
    """Return (system, user) for Node A given a TopicContext (§5.1)."""
    system = preamble(ctx) + "\n\n" + _TOPIC_PLAN_SYSTEM.format(
        subject_domain=ctx.get("subject_domain") or "the course discipline",
        audience_level=ctx.get("audience_level", "UG"),
        academic_year=ctx.get("academic_year", 2),
    )
    user = (
        "course: {code} {name} | reg {reg} | domain {domain} | subject_type {stype} | "
        "level {level} | year {year}\n"
        "unit: {unit_no} — {unit_title} (unit total {unit_hours} hrs)\n"
        "topic: {topic_no} — {topic_title} | allocated {topic_hours} hrs\n"
        "subtopics (raw, to decompose into concepts): {subtopics}\n"
        "finalized_COs (AUTHORITATIVE — select a subset, never edit): operative {op_co}, "
        "supporting {sup_cos}\n"
        "bloom_proportion_profile (advisory — drives proficiency targets): {profile}\n"
        "prerequisites: {prereqs}\n"
        "reference_books: {refs}\n"
        + _TOPIC_PLAN_OUTPUT
    ).format(
        code=ctx.get("course_code", ""), name=ctx.get("course_name", ""),
        reg=ctx.get("regulation", ""), domain=ctx.get("subject_domain", ""),
        stype=ctx.get("subject_type_label", ""), level=ctx.get("audience_level", "UG"),
        year=ctx.get("academic_year", 2),
        unit_no=ctx.get("unit_number", ""), unit_title=ctx.get("unit_title", ""),
        unit_hours=ctx.get("unit_total_hours", 0),
        topic_no=ctx.get("topic_number", ""), topic_title=ctx.get("topic_title", ""),
        topic_hours=ctx.get("topic_hours_allocated", 0),
        subtopics=_j(ctx.get("subtopics", [])),
        op_co=_j(ctx.get("operative_co")), sup_cos=_j(ctx.get("supporting_cos", [])),
        profile=_j(bloom_profile((ctx.get("operative_co") or {}).get("bloom_level")
                                 if isinstance(ctx.get("operative_co"), dict) else None)),
        prereqs=_j(ctx.get("prerequisites", [])), refs=_j(ctx.get("reference_books", [])),
        topic_total_minutes=int(round(float(ctx.get("topic_hours_allocated", 0) or 0) * 60)),
    )
    return system, user


# ══════════════════════════════════════════════════════════════════════════════
# Node B — Student Notes (per unit): Opening / Core / Closing / Expansion
# (companion: WinTeach - Student Notes Generation Prompt Spec.md)
# ══════════════════════════════════════════════════════════════════════════════
#
# One generation unit = one concept from the Topic Plan's Concept Inventory. The
# prompt slots call it SUBTOPIC (compat with existing pipeline slot names). IDs
# are orchestrator-assigned and echoed verbatim; traceability tags are null;
# semantics are checked by code validators, never trusted from the model.


def _relevant_tlos(plan: dict, unit: dict) -> list[dict]:
    """The TLO objects this concept serves (for the outcomes checklist)."""
    by_id = {}
    for i, t in enumerate(plan.get("tlo_set", []) or [], 1):
        by_id[t.get("tlo_id") or f"T{i}"] = t
    return [by_id[r] for r in (unit.get("serves_tlos") or []) if r in by_id]


# ── Opening Sections (Tier A) ─────────────────────────────────────────────────

_OPENING_TEMPLATE = """You are an expert {subject_label} educator writing the OPENING sections for one
self-contained subtopic note in a TEXTBOOK-REPLACEMENT notes set.

You are writing ONLY for this ONE subtopic: "{subtopic_title}".
Do NOT write about the parent topic "{parent_topic}" broadly — the student is here
specifically to learn "{subtopic_title}".

CONTEXT
Course: {course_name}
Unit: {unit_title}
Parent Topic: {parent_topic}
THIS subtopic: {subtopic_title} (id: {subtopic_id} — pre-assigned; echo it verbatim, never change it)
Proficiency target: {proficiency_target}
Complexity tier: {complexity_tier}
Estimated reading time: {reading_time_minutes} minutes | Time allocated: {time_minutes} minutes

Hero block (admin metadata for the parent topic — use selectively):
{hero_block}

TLOs served by THIS subtopic ONLY (use only these for the outcomes checklist):
{relevant_tlos}

Scope this subtopic covers:
{scope_in}

Prerequisite concepts (for the Introduction's connectivity matrix):
{prerequisites}

Previous subtopic: {prev_subtopic}
Next subtopic: {next_subtopic}

TOPIC OVERVIEW (subtopic-level only). Fill subtopic_metadata for THIS subtopic only;
do NOT repeat course/program-level fields. total_hours = {total_hours} and
reading_time_minutes = {reading_time_minutes} are pre-computed — do not change them.
outcomes_checklist: list ONLY the TLOs above, each restated as "By the end of this
subtopic, you will be able to…" tagged with bloom_level. If the TLO list is empty,
output []. Do not invent TLOs.

PROBLEM STATEMENT: a 100–200 word motivating problem THIS SPECIFIC concept solves.
Open with a real scenario where NOT knowing it causes a tangible problem; end by naming
"{subtopic_title}" as the solution. Do NOT open with a definition.

INTRODUCTION: connectivity_matrix (foundation / this_subtopic / builds_toward) +
narrative_intro (100–200 words) starting from what the student knows, showing the gap
this subtopic fills, naming each scope_in item once as a forward reference, ending by
pointing to the next subtopic. Never use banned verbs: understand, learn, know,
appreciate, be aware of.

Output ONLY this JSON — no explanation, no markdown:
{{
  "subtopic_id": "{subtopic_id}",
  "subtopic_title": "{subtopic_title}",
  "sections": {{
    "topic_overview": {{
      "subtopic_metadata": {{
        "subtopic_title": "{subtopic_title}",
        "proficiency_target": "{proficiency_target}",
        "complexity_tier": "{complexity_tier}",
        "total_hours": {total_hours},
        "difficulty": "X/5",
        "reading_time_minutes": {reading_time_minutes},
        "placement_relevance": "Low|Medium|High",
        "placement_justification": "one sentence specific to this subtopic",
        "university_importance": "Low|Medium|High",
        "university_justification": "one sentence specific to this subtopic"
      }},
      "outcomes_checklist": [
        {{"tlo_id": "TLO_id", "bloom_level": "L1..L6", "statement": "By the end of this subtopic, you will be able to…"}}
      ]
    }},
    "problem_statement": {{
      "scenario": "100-200 word motivating scenario specific to {subtopic_title}",
      "gap_statement": "one or two sentences naming {subtopic_title} as the solution"
    }},
    "introduction": {{
      "connectivity_matrix": {{
        "foundation": ["what the student must already know"],
        "this_subtopic": ["specific concepts this subtopic covers"],
        "builds_toward": ["next subtopic and downstream applications"]
      }},
      "narrative_intro": "100-200 word connective prose"
    }}
  }}
}}"""


def build_opening_prompt(unit: dict, ctx: dict, plan: dict, *, prev_title: str | None,
                         next_title: str | None) -> tuple[str, str]:
    budgets = unit.get("budgets") or ct.resolve_budgets(int(unit.get("time_minutes", 0) or 0),
                                                        unit.get("complexity_tier", "moderate"))
    system = preamble(ctx)
    user = _OPENING_TEMPLATE.format(
        subject_label=ctx.get("subject_type_label") or ctx.get("subject_domain") or "the discipline",
        subtopic_title=unit.get("concept_name", ""), parent_topic=ctx.get("topic_title", ""),
        subtopic_id=unit.get("concept_id", ""), course_name=ctx.get("course_name", ""),
        unit_title=ctx.get("unit_title", ""), proficiency_target=unit.get("proficiency_target", ""),
        complexity_tier=unit.get("complexity_tier", "moderate"),
        reading_time_minutes=budgets.get("reading_time_minutes", 5),
        time_minutes=unit.get("time_minutes", 0),
        hero_block=_j(plan.get("hero_block") or {}),
        total_hours=round(int(unit.get("time_minutes", 0) or 0) / 60, 2),
        relevant_tlos=_j(_relevant_tlos(plan, unit)), scope_in=_j(unit.get("scope_in", [])),
        prerequisites=_j(ctx.get("prerequisites", [])),
        prev_subtopic=prev_title or "None — this is the first subtopic",
        next_subtopic=next_title or "None — this is the last subtopic",
    )
    return system, user


# ── Core Content (Tier B) — conditional blocks selected by the unit's flags ────

_CORE_EXEC_TRACE_ON = """EXECUTION TRACE (REQUIRED): execution_trace.applicable = true. Use a DIFFERENT
scenario and data from the code block. Provide a step-by-step dry-run showing every
intermediate state, plus an edge-case/failure-mode matrix. Minimum {trace_min} words for
the trace narrative. NUMERICAL ACCURACY: state the formula first, apply it per entity
before aggregating, and re-check your arithmetic — internally inconsistent numbers = a
failed trace."""

_CORE_EXEC_TRACE_OFF = """EXECUTION TRACE (NOT REQUIRED): execution_trace.applicable = false. Set dry_run_trace
to null, edge_case_matrix and visuals to empty lists. Make architecture_and_mechanism and
the worked example proportionally more thorough to compensate."""

_CORE_CODE_ON = """CODE / PSEUDOCODE / FORMAL FORMULATION (REQUIRED): code_or_formalization.applicable =
true. Runnable idiomatic code for applied subtopics; numbered pseudocode for systems;
formal notation/proofs for theoretical. Explanation minimum {code_min} words (excluding the
code). Include a complexity_grid where applicable, else "N/A" per field."""

_CORE_CODE_OVERRIDE = """SYNTAX / CODE EXAMPLE (REQUIRED — practical subject override):
code_or_formalization.applicable = true. Even though this subtopic is conceptual, this
subject type requires students to see real code. Write 2–5 lines of clean, runnable,
idiomatic {subject_label} syntax demonstrating the scope_in concepts. Minimum {code_min}
words of explanation (excluding the code). Do NOT write pseudocode — write real syntax."""

_CORE_CODE_OFF = """CODE / PSEUDOCODE / FORMAL FORMULATION (NOT REQUIRED):
code_or_formalization.applicable = false. Set type to "na_conceptual", content and
language_or_system to null, explanation to null, complexity_grid fields to "N/A". Do NOT
write any code, pseudocode, or formal notation anywhere. Use that space to make
architecture_and_mechanism and the worked example more thorough in prose."""

_CORE_WORKED_ON = """worked_example: a full worked example, minimum {worked_min} words, every step shown per
the numerical-accuracy requirement. Use a THIRD DISTINCT scenario — different from both the
code block and the execution trace — covering a scope_in item or edge case not already
covered. Never jump to the final answer."""

_CORE_WORKED_OFF = """worked_example: set this to null. The Topic Plan determined this subtopic does not need a
separate worked example. Do NOT invent a forced example."""

_CORE_ANALYSIS_ON = """ANALYSIS (REQUIRED): analysis.applicable = true. Produce a genuine analytical discussion
— complexity analysis, trade-off reasoning, or diagnostic discussion — whichever fits.
Minimum 250 words; every sentence must add analytical value."""

_CORE_ANALYSIS_OFF = """ANALYSIS (NOT REQUIRED): analysis.applicable = false. Set discussion and complexity_note
to null."""

_CORE_COMPARISON_ON = """COMPARISON (REQUIRED): comparison.applicable = true. Compare this subtopic specifically
against: {comparison_target}. Produce a real comparison table across criteria that genuinely
differentiate this pair. Minimum 4 rows; every row a real, meaningful difference."""

_CORE_COMPARISON_OFF = """COMPARISON (NOT REQUIRED): comparison.applicable = false. Set compared_against to null and
comparison_table parameters/rows to empty."""

_CORE_TEMPLATE = """You are an expert {subject_label} educator writing ONE SUBTOPIC SECTION of an exhaustive
STUDENT NOTES chapter at TEXTBOOK-REPLACEMENT depth for an Indian engineering university
course. Write ONLY this single subtopic — no front matter, no end-of-topic synthesis.

CONTEXT
Course: {course_name} | Unit: {unit_title} | Parent Topic: {parent_topic}
Subject Type: {subject_label}

HERO BLOCK (parent-topic admin metadata — use selectively, never repeat it as content):
{hero_block}

BLOOM PROPORTION PROFILE for this topic (advisory — how depth distributes across levels):
{bloom_profile}

THIS SUBTOPIC — SCOPE LOCK
subtopic_id: {subtopic_id} (pre-assigned; echo verbatim, never change or renumber)
subtopic_title: {subtopic_title}
proficiency_target: {proficiency_target}
complexity_tier: {complexity_tier} (drives genuine depth — do not pad a simple concept)
time_minutes allocated: {time_minutes}

served_tlos (each must be fully achievable from your content alone):
{relevant_tlos}

scope_in — you MUST cover ALL of these:
{scope_in}

scope_out — you MUST NOT explain any of these, even briefly (mention existence + "covered
in a later topic" only):
{scope_out}

Terms already defined in earlier subtopics (reference by name, do not re-teach):
{prior_terms}

NO-REPETITION RULE: each part must add genuinely NEW information — never restate the
definition inside the mechanism, never restate the mechanism inside the worked example.

EXAMPLE COVERAGE AND DIVERSITY RULE: your examples (code, execution trace, worked example)
must COLLECTIVELY demonstrate EVERY distinct scope_in item at least once, each using a
DIFFERENT scenario. For moderate/complex tiers include one typical case and one boundary/
edge case. Tag each example with the scope_in item it covers.

DEPTH REQUIREMENT: these notes are the ONLY learning resource. Every first-use term must be
explained when introduced; every term in new_terms_introduced must be demonstrated with a
concrete example. Never use banned verbs: understand, learn, know, appreciate, be aware of.

CONTENT ORDER: introduce the idea → why it exists → intuition → formal theory → internal
working → worked example (if applicable) → common mistakes → applications → limitations.

CORE CONCEPT (always): formal_definition (rigorous, minimum {formal_min} words) +
mental_model_analogy (real-world analogy building intuition before restating the definition
in plain language).

DEEP DIVE: architecture_and_mechanism (always; minimum {arch_min} words) — how this maps to
the machine/formal system, respecting scope_in/scope_out exactly, with a visuals array per
the DIAGRAM RULES.

{code_block}

{exec_trace_block}

PRACTICAL UNDERSTANDING:
- {worked_block}
- advantages: ≥2 items, specific to "{subtopic_title}", never empty.
- disadvantages: ≥2 items, never empty.
- applications: ≥2 specific real-world use cases, never empty.
- common_mistakes: ≥2 entries, each with mistake / why_it_happens / correct_approach / exam_tip.

{analysis_block}
{comparison_block}

DIAGRAM RULES: every visuals entry is a structured cue for a downstream renderer — do NOT
draw ASCII art and do NOT emit placeholders. Types: table, flowchart, hierarchy_diagram,
memory_diagram, syntax_diagram, execution_trace_table, mermaid_flowchart, mermaid_sequence.
- "mermaid_flowchart" / "mermaid_sequence": write complete, VALID Mermaid syntax in the
  "mermaid_code" field. Use mermaid_flowchart for process flows, decision trees, algorithm
  steps, state transitions, and data flow; mermaid_sequence for protocol exchanges and
  function-call chains. PREFER Mermaid for anything with nodes, arrows, or ordered steps.
  "description" is a one-sentence caption of what the diagram shows; columns[]/rows[][]
  stay empty for Mermaid types.
- "table" / "execution_trace_table": columns[] and rows[][] MUST contain real data — never
  empty; mermaid_code is null.
- "flowchart", "hierarchy_diagram", "memory_diagram", "syntax_diagram" (non-Mermaid
  fallbacks): fill columns/rows as a real table where possible (syntax_diagram: one row per
  command or clause with the actual syntax in the cell). A placeholder one-liner like
  "Diagram showing X" is INVALID — if you cannot fill real content, emit a Mermaid version
  instead or omit the visual entirely.

TRACEABILITY TAG: output null — it is generated automatically after this call.

WORD COUNT ENFORCEMENT: the minimums above are hard. An automated check will re-ask you to
expand any short field, so treat them as genuinely required.

Output ONLY this JSON — no explanation, no markdown:
{{
  "subtopic_id": "{subtopic_id}",
  "subtopic_title": "{subtopic_title}",
  "proficiency_target": "{proficiency_target}",
  "complexity_tier": "{complexity_tier}",
  "traceability_tag": null,
  "new_terms_introduced": ["term 1", "term 2"],
  "core_concept": {{"formal_definition": "text", "mental_model_analogy": "text"}},
  "deep_dive": {{
    "architecture_and_mechanism": {{
      "explanation": "text",
      "visuals": [{{"visual_id": "V1", "type": "table|flowchart|hierarchy_diagram|memory_diagram|syntax_diagram|execution_trace_table|mermaid_flowchart|mermaid_sequence", "title": "title", "description": "one-sentence caption", "mermaid_code": "valid Mermaid syntax, or null for non-Mermaid types", "columns": ["col1"], "rows": [["val1"]], "placement": "before_explanation|after_explanation|after_worked_example"}}]
    }},
    "code_or_formalization": {{
      "applicable": true, "type": "code|pseudocode|formal_math|na_conceptual",
      "language_or_system": "e.g. Python 3.11 or null", "content": "code/pseudocode/proof or null",
      "explanation": "text or null",
      "complexity_grid": {{"best_case_time": "O(..) or N/A", "worst_case_time": "O(..) or N/A", "average_case_time": "O(..) or N/A", "space_complexity": "O(..) or N/A", "justification": "text or N/A"}}
    }},
    "execution_trace": {{
      "applicable": true, "dry_run_trace": "text or null",
      "edge_case_matrix": [{{"edge_input": "e.g. empty input", "expected_behavior": "text"}}],
      "visuals": [{{"visual_id": "V2", "type": "execution_trace_table|mermaid_flowchart", "title": "title", "description": "description", "mermaid_code": "Mermaid syntax or null", "columns": ["Step"], "rows": [["1"]], "placement": "after_worked_example"}}]
    }}
  }},
  "practical_understanding": {{
    "worked_example": "text or null", "advantages": [], "disadvantages": [], "applications": [],
    "common_mistakes": [{{"mistake": "text", "why_it_happens": "text", "correct_approach": "text", "exam_tip": "text"}}]
  }},
  "analysis": {{"applicable": true, "discussion": "text or null", "complexity_note": "text or null"}},
  "comparison": {{"applicable": true, "compared_against": "target or null", "comparison_table": {{"parameters": [], "rows": [{{"parameter": "p", "option_a": "v", "option_b": "v"}}]}}, "no_comparison_justification": "text or null"}}
}}"""


def build_core_prompt(unit: dict, ctx: dict, plan: dict, *, prior_terms: list[str]) -> tuple[str, str]:
    tier = unit.get("complexity_tier", "moderate")
    mins = ct.notes_word_minimums(tier)
    flags = unit.get("flags", {}) or {}
    subject_label = ctx.get("subject_type_label") or ctx.get("subject_domain") or "the discipline"

    # Code block selection: requires_code OR the coding-subject override.
    if flags.get("requires_code"):
        code_block = _CORE_CODE_ON.format(code_min=mins["code_explanation"])
    elif ct.is_coding_subject(ctx.get("subject_type_label")):
        code_block = _CORE_CODE_OVERRIDE.format(code_min=mins["code_explanation"], subject_label=subject_label)
    else:
        code_block = _CORE_CODE_OFF

    exec_block = (_CORE_EXEC_TRACE_ON.format(trace_min=mins["execution_trace"])
                  if flags.get("needs_execution_trace") else _CORE_EXEC_TRACE_OFF)
    worked_block = (_CORE_WORKED_ON.format(worked_min=mins["worked_example"])
                    if flags.get("needs_worked_example") else _CORE_WORKED_OFF)
    analysis_block = _CORE_ANALYSIS_ON if flags.get("needs_analysis") else _CORE_ANALYSIS_OFF
    if flags.get("needs_comparison") and flags.get("comparison_target"):
        comparison_block = _CORE_COMPARISON_ON.format(comparison_target=flags.get("comparison_target"))
    else:
        comparison_block = _CORE_COMPARISON_OFF

    system = preamble(ctx)
    user = _CORE_TEMPLATE.format(
        subject_label=subject_label, course_name=ctx.get("course_name", ""),
        unit_title=ctx.get("unit_title", ""), parent_topic=ctx.get("topic_title", ""),
        hero_block=_j(plan.get("hero_block") or {}),
        bloom_profile=_j(bloom_profile(unit.get("bloom_ceiling"))),
        subtopic_id=unit.get("concept_id", ""), subtopic_title=unit.get("concept_name", ""),
        proficiency_target=unit.get("proficiency_target", ""), complexity_tier=tier,
        time_minutes=unit.get("time_minutes", 0), relevant_tlos=_j(_relevant_tlos(plan, unit)),
        scope_in=_j(unit.get("scope_in", [])), scope_out=_j(unit.get("scope_out", [])),
        prior_terms=_j(prior_terms), formal_min=mins["formal_definition"],
        arch_min=mins["architecture_and_mechanism"], code_block=code_block,
        exec_trace_block=exec_block, worked_block=worked_block,
        analysis_block=analysis_block, comparison_block=comparison_block,
    )
    return system, user


# ── Closing Sections (Tier C) ─────────────────────────────────────────────────

_CLOSING_TEMPLATE = """You are an expert {subject_label} educator. You have just finished teaching
"{subtopic_title}" in {course_name} and are writing the CLOSING SECTIONS — practice,
revision, and consolidation. Use the summary below to stay consistent, not as the limit of
what you know.

WHAT YOU TAUGHT
Course: {course_name} | Subtopic: {subtopic_title} (id: {subtopic_id} — echo verbatim)
Proficiency target: {proficiency_target} | Bloom ceiling: {bloom_ceiling}
Concepts covered: {scope_in}
Left for later: {scope_out}
Previous lesson: {prev_subtopic} | Next lesson: {next_subtopic}

Summary of what was taught (for consistency):
{condensed_core}

COMMON MISTAKES: 3–5 Wrong-Way / Right-Way pairs, each DISTINCT. Show the wrong approach
concretely, why it fails, the right way, and why it works.

REVISION SECTION: key_takeaways (3–5 distinct one-liners); important_formulas (or []);
important_definitions (2–4, crisp one-liners); active_recall_prompts (2–4, each with a real
60–100 word answer_explanation that teaches).

GLOSSARY: one entry per new term this lesson introduced — formal_definition,
simple_explanation, used_in ["{subtopic_id}"], related_terms. If none, output empty terms.

PRACTICE QUESTIONS about "{subtopic_title}", each tagged subtopic_id "{subtopic_id}", none
exceeding Bloom {bloom_ceiling}: easy (L1/L2) 2 + 60+ word explanations; medium (L3) 2
applied + 100+ word explanations; hard 1–2 + 150+ word explanations.

RELATED TOPICS: previous_connection, next_connection, builds_toward (1–2), industry_relevance
(one paragraph specific to "{subtopic_title}" naming concrete systems/roles).

Output ONLY this JSON — no explanation, no markdown:
{{
  "subtopic_id": "{subtopic_id}",
  "subtopic_title": "{subtopic_title}",
  "sections": {{
    "common_mistakes": [{{"wrong_way": "text or code", "why_it_fails": "text", "right_way": "text or code", "why_it_works": "text"}}],
    "revision_section": {{
      "key_takeaways": [], "important_formulas": [],
      "important_definitions": [{{"term": "term", "definition": "one line"}}],
      "active_recall_prompts": [{{"prompt": "self-test question", "answer_explanation": "60-100 word explanation"}}]
    }},
    "glossary_section": {{"terms": [{{"term": "term", "formal_definition": "text", "simple_explanation": "plain English", "used_in": ["{subtopic_id}"], "related_terms": []}}]}},
    "practice_questions": {{
      "easy": [{{"question": "text", "subtopic_id": "{subtopic_id}", "bloom_level": "L1|L2", "answer_explanation": "60+ words"}}],
      "medium": [{{"question": "text", "subtopic_id": "{subtopic_id}", "bloom_level": "L3", "answer_explanation": "100+ words"}}],
      "hard": [{{"question": "text", "subtopic_id": "{subtopic_id}", "bloom_level": "L3", "answer_explanation": "150+ words"}}]
    }},
    "related_topics": {{
      "previous_subtopic": "{prev_subtopic}", "previous_connection": "one sentence",
      "next_subtopic": "{next_subtopic}", "next_connection": "one sentence",
      "builds_toward": ["downstream topic or skill"], "industry_relevance": "one paragraph specific to {subtopic_title}"
    }}
  }}
}}"""


def build_closing_prompt(unit: dict, ctx: dict, *, prev_title: str | None, next_title: str | None,
                         condensed_core: dict | None = None) -> tuple[str, str]:
    system = preamble(ctx)
    user = _CLOSING_TEMPLATE.format(
        subject_label=ctx.get("subject_type_label") or ctx.get("subject_domain") or "the discipline",
        subtopic_title=unit.get("concept_name", ""), course_name=ctx.get("course_name", ""),
        subtopic_id=unit.get("concept_id", ""), proficiency_target=unit.get("proficiency_target", ""),
        bloom_ceiling=unit.get("bloom_ceiling", "L3"), scope_in=_j(unit.get("scope_in", [])),
        scope_out=_j(unit.get("scope_out", [])),
        prev_subtopic=prev_title or "None — this is the first subtopic",
        next_subtopic=next_title or "None — this is the last subtopic",
        condensed_core=_j(condensed_core or {}),
    )
    return system, user


# ── Expansion prompt (validator-fired) ────────────────────────────────────────

_EXPANSION_TEMPLATE = """You previously wrote the following field as part of student notes for the subtopic
"{subtopic_title}". It is too short and must be expanded.

FIELD: {field_label}
CURRENT TEXT ({current_wc} words — BELOW THE REQUIRED MINIMUM):
\"\"\"{current_text}\"\"\"

CONTEXT
{subject_context}

TASK: Rewrite and substantially EXPAND this field to at least {min_words} words. Do NOT pad
with filler or restate the same sentence differently — that is a failed expansion. Genuinely
elaborate with real teaching content: more mechanism-level detail, additional edge cases,
precise terminology, concrete numbers/examples. Cover the concept completely for a student
who has ONLY this text. Never use banned verbs: understand, learn, know, appreciate, be
aware of. Stay strictly within "{field_label}" for this subtopic.

Output ONLY this JSON — no explanation, no markdown:
{{"expanded_text": "the full rewritten field text, {min_words}+ words, self-contained"}}"""


def build_expansion_prompt(subtopic_title: str, field_label: str, current_text: str,
                           min_words: int, subject_context: str) -> str:
    return _EXPANSION_TEMPLATE.format(
        subtopic_title=subtopic_title, field_label=field_label,
        current_wc=len((current_text or "").split()), current_text=current_text or "",
        subject_context=subject_context, min_words=min_words,
    )


# ══════════════════════════════════════════════════════════════════════════════
# Node C — Slides (fan-out; structural-review gate, §7.3)
# ══════════════════════════════════════════════════════════════════════════════

_SLIDES_SYSTEM = """You are an expert educator converting APPROVED Student Notes into a classroom delivery deck
for {subject_domain} at {audience_level} level. You REFORMAT for delivery; you NEVER add
content beyond the Notes. Slides are the only artifact whose job is SUBTRACTION.

Source of truth: the assembled approved Notes. Every slide derives from the Notes and carries
a source_ref to the Notes unit/section it came from. Introduce NO definition, example, proof
step, complexity claim, or diagram not present in the Notes.

Read each unit's Content Type from the Notes — DO NOT re-derive it. Build each unit's slide
sequence per its inherited profile (P2: code excerpt → trace → complexity → edge cases;
P3: proof one step per build; P4: full-bleed diagram built incrementally → trade-off;
P5: environment → procedure → expected output → failure modes).

Deck structure: Opening (Title → Roadmap → Why-This-Matters → Learning Outcomes → optional
Prereq Recall) → one Concept Sequence per unit in Notes order (definition → 1–3 core builds →
≥1 Misconception as Myth→Reality + profile slides) → Applied → Synthesis → Closing.
Face limit: ≤6 lines, ≤~10 words/line, 1 visual, code ≤~12 lines, body ≥24pt. Explanatory
depth goes to speaker_notes (uncapped). Stage content as build_steps; split slides rather than
shrinking font; section breaks on session-plan boundaries."""

_SLIDES_USER = """student_notes (the ONLY content source):
{student_notes}

topic_plan (session plan + budgets + blueprint emphasis):
{topic_plan}

topic: {topic_title} | duration {topic_hours} hrs

Return ONLY the Slides JSON (render-agnostic model): deck_meta, opening, concept_sequences
(each with unit_ref, inherited_content_type, slides[]), applied_sequence, synthesis_sequence,
closing_sequence. Every unit sequenced in Notes order; every content slide source_ref'd; ≥1
misconception slide per sequence. Leave all *_version fields null."""


def build_slides_prompt(ctx: dict, plan: dict, notes: dict) -> tuple[str, str]:
    system = preamble(ctx) + "\n\n" + _SLIDES_SYSTEM.format(
        subject_domain=ctx.get("subject_domain") or "the discipline",
        audience_level=ctx.get("audience_level", "UG"),
    )
    user = _SLIDES_USER.format(
        student_notes=_j(notes), topic_plan=_j(plan),
        topic_title=ctx.get("topic_title", ""), topic_hours=ctx.get("topic_hours_allocated", 0),
    )
    return system, user


# ══════════════════════════════════════════════════════════════════════════════
# Concept-level fan-out — Slides + Quiz for ONE subtopic (interactive studio)
# Source of truth: that concept's approved Student Notes. Introduce no content
# absent from the notes (§7.4 SSOT).
# ══════════════════════════════════════════════════════════════════════════════

_CONCEPT_SLIDES_SYSTEM = """You convert ONE subtopic's approved Student Notes into a short classroom slide
sequence for {subject_domain} at {audience_level}. REFORMAT for delivery — introduce NO
definition, example, code, or claim absent from the notes. Build the sequence per the concept's
Content Type ({content_type}): definition → 1–3 core builds → ≥1 misconception (Myth→Reality) →
profile slides (P2 code+trace+complexity; P3 proof one step per build; P4 diagram+trade-off;
P5 environment→procedure→output). Face ≤6 lines, ≤~10 words/line; depth goes to speaker_notes."""

_CONCEPT_SLIDES_USER = """concept: {concept_name}  (Content Type {content_type})
approved notes for this concept (the ONLY content source):
{notes}

Return ONLY JSON: {{"concept_id": "{concept_id}", "inherited_content_type": "{content_type}",
"slides": [{{"slide_no": 1, "role": "definition|core|misconception|code|trace|proof|diagram|complexity|closing",
"title": "a claim, not a generic noun", "body_blocks": ["≤6 lines"], "build_steps": ["one reveal each"],
"speaker_notes": "teaching script", "source_ref": "notes section"}}]}}. ≥1 misconception slide."""


def build_concept_slides_prompt(unit: dict, ctx: dict, notes: dict) -> tuple[str, str]:
    ct_ = unit.get("primary_content_type", "P1")
    system = preamble(ctx) + "\n\n" + _CONCEPT_SLIDES_SYSTEM.format(
        subject_domain=ctx.get("subject_domain") or "the discipline",
        audience_level=ctx.get("audience_level", "UG"), content_type=ct_)
    user = _CONCEPT_SLIDES_USER.format(concept_id=unit.get("concept_id", ""),
        concept_name=unit.get("concept_name", ""), content_type=ct_, notes=_j(notes))
    return system, user


_CONCEPT_QUIZ_SYSTEM = """You write a short formative quiz for ONE subtopic, answerable from its approved
Student Notes ALONE. Every item is source_ref'd to a notes section; distractors map to the notes'
common-misconceptions. Stay at or below Bloom {bloom_ceiling}. Item types key off the Content Type
({content_type}): P2/P3 → trace-and-predict / complexity / spot-the-bug; P4 → diagram-reading;
P1 → compare/classify/define. Never test anything not in the notes."""

_CONCEPT_QUIZ_USER = """concept: {concept_name} (Content Type {content_type}, Bloom ceiling {bloom_ceiling})
approved notes (the ONLY source):
{notes}

Return ONLY JSON: {{"concept_id": "{concept_id}",
"mcq": [{{"question": "text", "options": ["A","B","C","D"], "answer_index": 0,
"explanation": "why, teaching the misconception", "bloom_level": "L2..L{ceil}", "source_ref": "section"}}],
"short_answer": [{{"question": "text", "model_answer": "text", "bloom_level": "L2..L{ceil}", "source_ref": "section"}}]}}.
3–5 MCQs + 1–2 short-answer."""


def build_concept_quiz_prompt(unit: dict, ctx: dict, notes: dict) -> tuple[str, str]:
    ct_ = unit.get("primary_content_type", "P1")
    ceiling = (unit.get("bloom_ceiling") or "L3").replace("L", "")
    system = preamble(ctx) + "\n\n" + _CONCEPT_QUIZ_SYSTEM.format(
        content_type=ct_, bloom_ceiling=unit.get("bloom_ceiling", "L3"))
    user = _CONCEPT_QUIZ_USER.format(concept_id=unit.get("concept_id", ""),
        concept_name=unit.get("concept_name", ""), content_type=ct_,
        bloom_ceiling=unit.get("bloom_ceiling", "L3"), ceil=ceiling, notes=_j(notes))
    return system, user


# ══════════════════════════════════════════════════════════════════════════════
# Topic-level artifacts — Summary / Assignment / Faculty Diagnostic / Flashcards
# Source: the assembled approved Notes across all concepts (§7.4).
# ══════════════════════════════════════════════════════════════════════════════

def _topic_source(ctx: dict, notes: dict) -> str:
    return f"topic: {ctx.get('topic_title','')} | domain {ctx.get('subject_domain','')}\n" \
           f"assembled approved notes (the ONLY content source):\n{_j(notes)}"


def build_summary_prompt(ctx: dict, plan: dict, notes: dict) -> tuple[str, str]:
    system = preamble(ctx) + "\n\nYou compress the approved Student Notes into a one-page revision " \
        "cheat-sheet (~10–15% length) for {d}. Every row carries a notes_ref; add nothing new.".format(
            d=ctx.get("subject_domain") or "the discipline")
    user = _topic_source(ctx, notes) + '\n\nReturn ONLY JSON: {"key_concepts":[{"concept":"","one_liner":"","notes_ref":""}],' \
        '"formulas_or_syntax":[""],"common_mistakes":[""],"exam_pointers":[""]}.'
    return system, user


def build_assignment_prompt(ctx: dict, plan: dict, notes: dict) -> tuple[str, str]:
    system = preamble(ctx) + "\n\nYou write a topic assignment that APPLIES the approved Notes (never " \
        "reproduces them), skewing one Bloom level above the quiz, with a criterion-referenced rubric " \
        "whose points sum to the task marks. No Bloom's leakage above the topic ceiling."
    user = _topic_source(ctx, notes) + '\n\nReturn ONLY JSON: {"tasks":[{"prompt":"","marks":10,' \
        '"bloom_level":"L3","source_refs":[""]}],"rubric":[{"criterion":"","points":5,"descriptor":""}],' \
        '"model_solution":"instructor copy","integrity_policy":""}.'
    return system, user


def build_faculty_diagnostic_prompt(ctx: dict, plan: dict, notes: dict) -> tuple[str, str]:
    system = preamble(ctx) + "\n\nYou write a PRIVATE faculty self-check (no pass/fail, nothing reported " \
        "upward) across four dimensions: content mastery at the topic ceiling, misconception awareness " \
        "from the notes' pitfalls, pedagogical readiness (this topic's teaching), and connection/depth. " \
        "Every item ends in actionable remediation with a notes_ref."
    user = _topic_source(ctx, notes) + '\n\nReturn ONLY JSON: {"dimensions":[{"name":"content_mastery|' \
        'misconception_awareness|pedagogical_readiness|connection_depth","items":[{"prompt":"",' \
        '"what_good_looks_like":"","remediation":"","notes_ref":""}]}],"gap_map":[""]}.'
    return system, user


def build_flashcards_prompt(ctx: dict, plan: dict, notes: dict) -> tuple[str, str]:
    system = preamble(ctx) + "\n\nYou make 10–15 spaced-repetition flashcards from the approved Notes ONLY. " \
        "Front ≤15 words, back ≤50 words, low Bloom band, even coverage across concepts."
    user = _topic_source(ctx, notes) + '\n\nReturn ONLY JSON: {"cards":[{"front":"","back":"",' \
        '"concept_ref":"","bloom_level":"L1|L2","source_ref":""}]}.'
    return system, user


# ══════════════════════════════════════════════════════════════════════════════
# Plan preparation + repair prompts
# (companions: Subtopic Decomposition doc, TLO Alignment doc — adapted to the
# working-ID plan schema: "subtopic" in the doc maps to a concept_inventory row)
# ══════════════════════════════════════════════════════════════════════════════

_SUBTOPIC_SPLIT_TEMPLATE = """You are preparing a syllabus subtopic list for the topic "{topic_title}"
so that each concept can be taught as its own individually deep mini-lesson.
Many Indian university syllabi write MULTIPLE distinct concepts as a single
bullet point, using commas or parenthetical lists. For example:
  "Simple Database schema, data types, table definitions (create, alter)"
    -> really 4 distinct things: schema design, data types, CREATE TABLE, ALTER TABLE
  "Different DML operations (insert, delete, update)"
    -> really 3 distinct things: INSERT, DELETE, UPDATE
  "Process scheduling algorithms (FCFS, SJF, Round Robin, Priority)"
    -> really 4 distinct things, one per named algorithm
  "Error detection and correction (parity check, CRC, checksum)"
    -> really 3 distinct things, one per named technique

This pattern shows up across every CS/engineering subject — it is not specific
to any one course. Your job applies the same logic regardless of subject.

━━━ SUBTOPICS AS WRITTEN IN THE SYLLABUS ━━━
{subtopics_str}

━━━ TASK ━━━
For each subtopic above, decide whether it is ALREADY a single, atomic,
individually-teachable concept, or whether it BUNDLES multiple distinct
concepts together (via commas, "and", or a parenthetical list of named
items/variants/operations).

If it bundles multiple concepts, split it into separate atomic subtopic
titles — one per concept, each specific and nameable on its own (e.g.
"CREATE TABLE statement", not just "create"; "FCFS Scheduling", not just
"FCFS"). Preserve the original terminology from the syllabus wherever
possible rather than inventing new names.

If a subtopic is already atomic, keep it EXACTLY as given, unchanged.

Do NOT over-split: a single coherent concept whose description happens to
contain a comma (not an enumeration of separate teachable things) must stay
as one item. Only split genuine enumerations/bundles of otherwise-separate
concepts. When in doubt about whether something is a genuine bundle, prefer
NOT splitting it.

Output ONLY this JSON — no explanation, no markdown:
{{
  "atomic_subtopics": ["subtopic 1", "subtopic 2", "..."]
}}"""


def build_subtopic_split_prompt(topic_title: str, subtopics: list[str]) -> str:
    return _SUBTOPIC_SPLIT_TEMPLATE.format(
        topic_title=topic_title,
        subtopics_str="\n".join(f"- {s}" for s in subtopics),
    )


_TLO_REALIGN_TEMPLATE = """You are checking a curriculum Topic Plan for a specific, previously-observed
mapping error: TLOs (Topic Learning Outcomes) sometimes get tagged to the WRONG
subtopic — for example, a TLO whose text explicitly says "apply deadlock
prevention" being tagged to a "Deadlock Detection" subtopic instead of the
"Deadlock Prevention" subtopic. Your job is to catch and correct this.

━━━ TLOs (their exact wording is the ground truth) ━━━
{tlo_list_str}

━━━ SUBTOPICS (with their CURRENT, possibly WRONG, tagged TLOs) ━━━
{subtopic_list_str}

━━━ TASK ━━━
For each subtopic, ignore the "currently tagged" list if it looks wrong. Decide,
based purely on matching each TLO's actual wording (its verb and subject
matter) against the subtopic's title and scope_in, which TLO(s) this subtopic
GENUINELY serves. A subtopic may serve more than one TLO if genuinely
relevant, or just one.

Every TLO whose subject matter is clearly covered by one of the subtopics
above must end up assigned to that subtopic — do not leave a clearly-matching
TLO unassigned just because the original tagging missed it.

If a TLO's subject matter is not genuinely covered by ANY subtopic's scope_in
— a real gap in the plan, not just a missing tag — list its id in
"uncovered_tlos" instead of forcing a bad match onto an unrelated subtopic.

Output ONLY this JSON — no explanation, no markdown:
{{
  "corrected_assignments": [
    {{"subtopic_id": "C1", "served_tlos": ["T2"]}}
  ],
  "uncovered_tlos": []
}}"""


def build_tlo_realign_prompt(tlos: list[dict], concepts: list[dict]) -> str:
    tlo_lines = [
        f"- {t.get('tlo_id')}: [{t.get('bloom_level', '?')}] {t.get('statement', '')}"
        for t in tlos
    ]
    sub_lines = [
        f"- {c.get('concept_id')}: \"{c.get('concept_name', '')}\" | "
        f"scope_in: {_j(c.get('scope_in') or [])} | "
        f"currently tagged: {_j(c.get('serves_tlos') or [])}"
        for c in concepts
    ]
    return _TLO_REALIGN_TEMPLATE.format(
        tlo_list_str="\n".join(tlo_lines),
        subtopic_list_str="\n".join(sub_lines),
    )


_MISSING_CO_TLO_TEMPLATE = """You are fixing a gap in a curriculum Topic Plan: this Course Outcome is
marked as primary for this topic but currently has no Topic Learning Outcome
(TLO) tracing to it. Write ONE new TLO that authentically serves this CO, and
attach it to whichever EXISTING subtopic below is the best genuine fit.

━━━ THE UNCOVERED COURSE OUTCOME ━━━
CO id: {co_id}
CO text: {co_text}
CO Bloom level: {co_bloom}

━━━ EXISTING SUBTOPICS (do not invent a new one — pick the best fit from this list) ━━━
{subtopics_str}

━━━ TASK ━━━
1. Pick the single existing subtopic whose scope most naturally supports this
   CO. If genuinely none of them fit — the CO is about something this topic's
   subtopics don't cover at all — set best_subtopic_id to null and explain why
   in justification, rather than forcing a bad match.
2. Write outcome_statement: ONE measurable sentence starting with an approved
   action verb appropriate to the bloom_level you choose. NEVER use: understand,
   learn, know, appreciate, be aware of, be familiar with, study, grasp,
   comprehend, realize, be exposed to, gain knowledge of, become acquainted with.
   L1: list, recall, identify, name, define, state
   L2: explain, describe, classify, summarize, distinguish, illustrate
   L3: apply, compute, solve, implement, demonstrate, construct, trace
   L4: analyse, compare, differentiate, debug, diagnose, examine
   L5: evaluate, justify, critique, assess, benchmark
   L6: design, formulate, devise, architect, synthesize
3. bloom_level must NOT exceed the CO's Bloom level given above.
4. If the chosen subtopic's scope_in doesn't already cover what this TLO
   needs, suggest ONE short phrase to add to its scope_in so the TLO becomes
   genuinely achievable from that subtopic's content. If scope_in already
   covers it, set this to null.

Output ONLY this JSON — no explanation, no markdown:
{{
  "best_subtopic_id": "concept id or null",
  "bloom_level": "L1..L6, not exceeding the CO's bloom level",
  "outcome_statement": "measurable sentence with an approved verb",
  "scope_in_addition": "short phrase to add, or null if not needed",
  "justification": "one sentence on why this subtopic fits, or why none do"
}}"""


def build_missing_co_tlo_prompt(co: dict, concepts: list[dict]) -> str:
    sub_lines = [
        f"- {c.get('concept_id')}: \"{c.get('concept_name', '')}\" | "
        f"scope_in: {_j(c.get('scope_in') or [])}"
        for c in concepts
    ]
    return _MISSING_CO_TLO_TEMPLATE.format(
        co_id=co.get("co_id", ""),
        co_text=co.get("co_statement") or co.get("text", ""),
        co_bloom=co.get("bloom_level", "L2"),
        subtopics_str="\n".join(sub_lines),
    )


_SUBTOPIC_TLO_TEMPLATE = """Write ONE Topic Learning Outcome (TLO) for this subtopic.

Subtopic: "{subtopic_title}"
Scope covered: {scope_in}
Required Bloom level: {bloom_target}
Approved verbs for {bloom_target}: {verbs}

Rules:
- ONE sentence only, starting with one of the approved verbs above
- Measurable and specific to the scope_in items listed
- Never use: understand, learn, know, appreciate, be aware of, be familiar with
- Must be achievable from a {proficiency}-level treatment of this subtopic

Output ONLY this JSON:
{{
  "outcome_statement": "By the end of this subtopic, you will be able to [verb] [specific content].",
  "bloom_level": "{bloom_target}"
}}"""


def build_subtopic_tlo_prompt(concept: dict, bloom_target: str, verbs: list[str]) -> str:
    return _SUBTOPIC_TLO_TEMPLATE.format(
        subtopic_title=concept.get("concept_name", ""),
        scope_in=_j(concept.get("scope_in") or []),
        bloom_target=bloom_target,
        verbs=", ".join(verbs),
        proficiency=concept.get("proficiency_target") or "Working",
    )
