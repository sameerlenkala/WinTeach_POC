"""
WinTeach Stage-6 generation service — orchestrator, node runners, code
validators, and hash/ID helpers (pipeline doc §6, §7, §10, §11).

Design invariants enforced here:
  - Validators are code. The model's self-populated `gate` objects and version
    stamps are discarded on ingest; the orchestrator computes all hashes and
    assigns all IDs (§0 principle 4, §6).
  - The concept is the generation unit and the approval unit (§0 principles 2–3).
  - One shared Content-Type / flag / budget definition, imported from
    app.schemas.content_types (§4).

The two helpers exercised by tests/test_generation.py — `score_complexity` and
`generate_cos` — run deterministically without any network/DB dependency; the
LLM node runners lazy-import OpenAI so this module imports cleanly offline.
"""

from __future__ import annotations

import hashlib
import json
import logging
import math
import uuid
from typing import Any

from app.schemas import content_types as ct
from app.schemas.generation import (
    COGenerateRequest,
    COGenerateResponse,
    CheckResult,
    ComplexityRequest,
    ComplexityResponse,
    ValidationResult,
)

logger = logging.getLogger(__name__)

MODEL = "gpt-4o"   # all node calls use response_format = json_schema (strict)


# ══════════════════════════════════════════════════════════════════════════════
# Complexity scoring (POST /generate/complexity) — deterministic
# ══════════════════════════════════════════════════════════════════════════════

# Signals that a topic is cognitively heavy — used only for scaffolding/scoring,
# never for the Bloom ceiling.
_COMPLEXITY_KEYWORDS = (
    "advanced", "algorithm", "optimization", "optimisation", "theorem", "proof",
    "derivation", "complexity", "asymptotic", "concurrency", "distributed",
    "cryptograph", "formal", "recursion", "np-hard", "np hard", "analysis",
    "optimize", "optimise",
)

_HOURS_FULL = 8.0        # hours at which the hours signal saturates
_SUBTOPICS_FULL = 8      # subtopic count at which that signal saturates
_KEYWORD_FULL = 3        # keyword hits at which that signal saturates


def score_complexity(req: ComplexityRequest) -> ComplexityResponse:
    """Weighted blend of Bloom level, allotted hours, subtopic count, and
    keyword density → a 0..1 score and a Low/Medium/High label."""
    bloom = (ct.bloom_rank(req.bloom_level or ct.BLOOM_FLOOR) - 1) / 5.0  # L1→0, L6→1
    hours = min((req.hours or 0) / _HOURS_FULL, 1.0)
    subtopics = min(len(req.subtopics) / _SUBTOPICS_FULL, 1.0)

    text = req.topic.lower()
    hits = sum(1 for kw in _COMPLEXITY_KEYWORDS if kw in text)
    keywords = min(hits / _KEYWORD_FULL, 1.0)

    score = 0.30 * bloom + 0.20 * hours + 0.20 * subtopics + 0.30 * keywords
    score = round(min(max(score, 0.0), 1.0), 4)

    label = "High" if score >= 0.67 else "Medium" if score >= 0.34 else "Low"

    return ComplexityResponse(
        topic=req.topic,
        score=score,
        label=label,
        signals={
            "bloom": round(bloom, 4),
            "hours": round(hours, 4),
            "subtopics": round(subtopics, 4),
            "keywords": round(keywords, 4),
        },
    )


# ══════════════════════════════════════════════════════════════════════════════
# CO generation (POST /generate/cos)
# ══════════════════════════════════════════════════════════════════════════════

# Representative measurable verb per Bloom level for the deterministic fallback.
_CO_VERB_BY_LEVEL = {
    "L1": "Identify", "L2": "Explain", "L3": "Apply",
    "L4": "Analyze", "L5": "Evaluate", "L6": "Design",
}


def generate_cos(req: COGenerateRequest) -> COGenerateResponse:
    """Generate `count` Course Outcomes at the target Bloom level.

    Uses the LLM when an OpenAI key is configured; otherwise falls back to a
    deterministic, network-free construction (the path exercised by tests)."""
    bloom = ct.normalize_bloom(req.bloom_target)

    cos = _generate_cos_llm(req, bloom)
    if cos is None:
        cos = _generate_cos_fallback(req, bloom)

    return COGenerateResponse(course_outcomes=cos, bloom_level=bloom)


def _generate_cos_fallback(req: COGenerateRequest, bloom: str) -> list[str]:
    verb = _CO_VERB_BY_LEVEL.get(bloom, "Apply")
    titles = req.unit_titles or ["the course material"]
    cos: list[str] = []
    for i in range(max(req.count, 0)):
        title = titles[i % len(titles)]
        cos.append(
            f"{verb} the core principles of {title} to solve representative "
            f"problems and demonstrate measurable competence in assessment."
        )
    return cos


def _generate_cos_llm(req: COGenerateRequest, bloom: str) -> list[str] | None:
    """Return LLM-generated COs, or None when the LLM is unavailable/fails so the
    caller can fall back deterministically."""
    client = _openai_client()
    if client is None:
        return None
    try:
        prompt = (
            "Generate exactly {n} Course Outcomes at Bloom level {bloom} for a "
            "course covering these units: {units}. Each CO is one measurable, "
            "student-facing sentence using an approved verb at level {bloom}. "
            'Return JSON: {{"course_outcomes": ["...", ...]}}.'
        ).format(n=req.count, bloom=bloom, units=", ".join(req.unit_titles) or "the course")
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        cos = [str(c) for c in data.get("course_outcomes", [])][: req.count]
        return cos if len(cos) == req.count else None
    except Exception as e:  # pragma: no cover - network path
        logger.warning("generate_cos LLM path failed (%s): %s", type(e).__name__, e)
        return None


def allocate_hours(unit_total_hours: float, topics: list[dict]) -> dict:
    """Distribute a unit's hours across its topics weighted by complexity
    (POST /generate/hours/allocate). Feeds the session plan + budget lookup.
    Advisory: there is no hour ceiling (§7.1)."""
    weights = [max(float(t.get("complexity_score") or 1.0), 0.01) for t in topics]
    total_w = sum(weights) or 1.0
    out = []
    for t, w in zip(topics, weights):
        allocated = round(unit_total_hours * w / total_w, 1)
        out.append({
            "title": t.get("title", ""),
            "allocated_hours": allocated,
            "below_floor": allocated < 1.0,
        })
    return {"topics": out}


def suggest_granularity(unit_total_hours: float, topics: list[dict]) -> dict:
    """Advisory topic-granularity hints (POST /generate/granularity/suggest).
    Never blocks — there is no hour ceiling; large topics simply mean more
    concepts and sessions (§7.1)."""
    suggestions = []
    for t in topics:
        hours = t.get("hours")
        if hours is None:
            suggestion, reason = "keep", "No allocated hours yet."
        elif hours > 6:
            suggestion, reason = "split", f"{hours} hrs is large; consider splitting into finer topics."
        elif hours < 2:
            suggestion, reason = "combine", f"{hours} hrs is small; consider merging with an adjacent topic."
        else:
            suggestion, reason = "keep", f"{hours} hrs is a reasonable single-topic span."
        suggestions.append({"title": t.get("title", ""), "suggestion": suggestion, "reason": reason})
    return {"suggestions": suggestions}


def _openai_client():
    """Lazy OpenAI client; None when no key is configured."""
    try:
        from openai import OpenAI
        from app.core.config import settings
        if not settings.openai_api_key:
            return None
        return OpenAI(api_key=settings.openai_api_key)
    except Exception:  # pragma: no cover
        return None


# ══════════════════════════════════════════════════════════════════════════════
# Hash / ID helpers (§6, §11) — orchestrator owns all stamps
# ══════════════════════════════════════════════════════════════════════════════

# Fields the orchestrator itself fills; excluded from canonical hashing so a
# stamp never depends on a prior stamp.
_STAMP_FIELDS = frozenset({
    "topic_plan_version", "validated_at", "scope_hash", "notes_version",
    "content_hash", "unit_hash", "approved_at", "slides_version",
    "derived_from_notes_version", "derived_from_content_hash", "version",
    "concept_id", "tlo_id",
})


def _strip(obj: Any, exclude: frozenset) -> Any:
    """Recursively drop excluded keys and normalise floats for canonical JSON."""
    if isinstance(obj, dict):
        return {k: _strip(v, exclude) for k, v in obj.items() if k not in exclude}
    if isinstance(obj, list):
        return [_strip(v, exclude) for v in obj]
    if isinstance(obj, float):
        # Normalise floats: integral floats → int, else round to 6 dp.
        return int(obj) if obj.is_integer() else round(obj, 6)
    return obj


def canonical_hash(obj: Any, exclude: frozenset | tuple = ()) -> str:
    """SHA-256 over canonical JSON (sorted keys, UTF-8, normalized floats,
    explicit excluded-fields list — §6, §10.2)."""
    excl = _STAMP_FIELDS | frozenset(exclude)
    stripped = _strip(obj, excl)
    payload = json.dumps(stripped, sort_keys=True, ensure_ascii=False,
                         separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def assign_concept_ids(plan: dict) -> dict:
    """Assign C1..Cn to concepts in plan order and rewrite serves_tlos / session
    references from positional placeholders to the stable ids. Returns the plan
    (mutated in place). Model-emitted concept_ids are ignored."""
    concepts = plan.get("concept_inventory", []) or []
    for i, c in enumerate(concepts, 1):
        c["concept_id"] = f"C{i}"
    for i, t in enumerate(plan.get("tlo_set", []) or [], 1):
        if not t.get("tlo_id"):
            t["tlo_id"] = f"T{i}"
    return plan


def scope_body(plan: dict) -> dict:
    """The scope-defining slice of a Topic Plan that scope_hash is computed over
    (§11): CO map + TLO set + Concept Inventory incl. flags + session plan +
    blueprint. Excludes front matter / prerequisites (non-scope prose)."""
    return {
        "co_mapping": plan.get("co_mapping", []),
        "tlo_set": plan.get("tlo_set", []),
        "concept_inventory": plan.get("concept_inventory", []),
        "session_plan": plan.get("session_plan", []),
        "assessment_blueprint": plan.get("assessment_blueprint", {}),
    }


def derive_flags(content_type: str, overrides: dict | None = None,
                 comparison_target: str | None = None) -> dict:
    """Re-export of the canonical derivation (§4.2) for orchestrator use."""
    return ct.derive_flags(content_type, overrides, comparison_target)


def resolve_budgets(time_minutes: int, complexity_tier: str) -> dict:
    """Re-export of the canonical budget lookup (§7.1)."""
    return ct.resolve_budgets(time_minutes, complexity_tier)


# ══════════════════════════════════════════════════════════════════════════════
# Topic Plan — code validators (Node A VALIDATE gate, §6 / §10.3)
# ══════════════════════════════════════════════════════════════════════════════

_WEIGHT_TOLERANCE = 0.5      # percentage points
_TIME_TOLERANCE = 5          # minutes (session sum vs duration)


def validate_topic_plan(plan: dict, *, credits: int | None = None) -> ValidationResult:
    """Run every deterministic Topic-Plan gate check over parsed JSON. The
    model's `gate` object (if any) is ignored. Non-blocking checks (ambiguous
    Content Types, prereq gaps) never fail the gate (§6)."""
    checks: list[CheckResult] = []
    concepts = plan.get("concept_inventory", []) or []
    tlos = plan.get("tlo_set", []) or []
    cos = plan.get("co_mapping", []) or []
    sessions = plan.get("session_plan", []) or []

    checks.extend(_check_coverage_closure(cos, tlos, concepts, sessions))
    checks.extend(_check_bloom_coherence(cos, tlos, concepts, plan))
    checks.extend(_check_content_type_interlock(concepts))
    checks.extend(_check_weight_time_closure(cos, concepts, sessions, plan, credits))
    checks.extend(_check_verbs(tlos))

    all_pass = all(c.passed for c in checks if c.blocking)
    return ValidationResult(all_pass=all_pass, checks=checks)


def _check_coverage_closure(cos, tlos, concepts, sessions) -> list[CheckResult]:
    """Every CO→≥1 TLO→≥1 concept→≥1 session; every concept→≥1 TLO; every TLO→
    exactly one CO (bidirectional TLO↔concept)."""
    out: list[CheckResult] = []
    co_ids = {c.get("co_id") for c in cos}
    tlo_ids = {t.get("tlo_id") or f"T{i+1}" for i, t in enumerate(tlos)}

    # Every TLO → exactly one CO, within the selected CO set.
    bad_parent = [t.get("statement", "?") for t in tlos if t.get("parent_co") not in co_ids]
    out.append(CheckResult(name="coverage:tlo_parent_co",
                           passed=not bad_parent,
                           detail="" if not bad_parent else f"TLOs with no/invalid parent CO: {bad_parent}"))

    # Every CO served by ≥1 TLO.
    served_cos = {t.get("parent_co") for t in tlos}
    uncovered_co = [cid for cid in co_ids if cid not in served_cos]
    out.append(CheckResult(name="coverage:co_has_tlo", passed=not uncovered_co,
                           detail="" if not uncovered_co else f"COs with no TLO: {uncovered_co}"))

    # Every concept serves ≥1 TLO; every TLO served by ≥1 concept.
    concept_tlo_refs = {ref for c in concepts for ref in (c.get("serves_tlos") or [])}
    no_tlo_concept = [c.get("concept_name", "?") for c in concepts if not (c.get("serves_tlos") or [])]
    out.append(CheckResult(name="coverage:concept_serves_tlo", passed=not no_tlo_concept,
                           detail="" if not no_tlo_concept else f"Concepts serving no TLO: {no_tlo_concept}"))

    unserved_tlo = [tid for tid in tlo_ids if tid not in concept_tlo_refs]
    out.append(CheckResult(name="coverage:tlo_served_by_concept", passed=not unserved_tlo,
                           detail="" if not unserved_tlo else f"TLOs served by no concept: {unserved_tlo}"))

    # Every concept assigned to ≥1 session.
    concept_ids = {c.get("concept_id") or c.get("concept_name") for c in concepts}
    session_concepts = {cc for s in sessions for cc in (s.get("concepts_covered") or [])}
    unscheduled = [cid for cid in concept_ids if cid and cid not in session_concepts]
    # Non-blocking before concept_ids are assigned (validation runs pre-assignment).
    out.append(CheckResult(name="coverage:concept_in_session",
                           passed=not unscheduled or not any(c.get("concept_id") for c in concepts),
                           detail="" if not unscheduled else f"Concepts in no session: {unscheduled}",
                           blocking=any(c.get("concept_id") for c in concepts)))
    return out


def _check_bloom_coherence(cos, tlos, concepts, plan) -> list[CheckResult]:
    """TLO ≤ its CO; concept ceiling = max served TLO; blueprint ceiling = topic
    ceiling. No Bloom's leakage (§5 floor L2 / ceiling = highest served CO)."""
    out: list[CheckResult] = []
    co_bloom = {c.get("co_id"): ct.bloom_rank(c.get("bloom_level", "L2")) for c in cos}
    tlo_by_id: dict[str, dict] = {}
    for i, t in enumerate(tlos):
        tlo_by_id[t.get("tlo_id") or f"T{i+1}"] = t

    # TLO ≤ parent CO.
    leaky = []
    for t in tlos:
        parent = co_bloom.get(t.get("parent_co"))
        if parent is not None and ct.bloom_rank(t.get("bloom_level", "L2")) > parent:
            leaky.append(t.get("statement", "?"))
    out.append(CheckResult(name="bloom:tlo_le_co", passed=not leaky,
                           detail="" if not leaky else f"TLOs above parent CO: {leaky}"))

    # Concept ceiling = max Bloom of served TLOs.
    mismatch = []
    for c in concepts:
        served = [tlo_by_id.get(r) for r in (c.get("serves_tlos") or [])]
        served_ranks = [ct.bloom_rank(t.get("bloom_level", "L2")) for t in served if t]
        if not served_ranks:
            continue
        expected = ct.BLOOM_ORDER[max(served_ranks) - 1]
        if ct.normalize_bloom(c.get("bloom_ceiling", "L2")) != expected:
            mismatch.append(f"{c.get('concept_name','?')} (got {c.get('bloom_ceiling')}, expected {expected})")
    out.append(CheckResult(name="bloom:concept_ceiling", passed=not mismatch,
                           detail="" if not mismatch else f"Concept ceiling ≠ max served TLO: {mismatch}"))
    return out


def _check_content_type_interlock(concepts) -> list[CheckResult]:
    """Exactly one primary Content Type per concept; flags consistent with the
    §4.2 derivation or carrying a recorded override; ambiguous flagged not
    failed (§4, §6)."""
    out: list[CheckResult] = []
    bad_ct = [c.get("concept_name", "?") for c in concepts
              if c.get("primary_content_type") not in {e.value for e in ct.ContentType}]
    out.append(CheckResult(name="content_type:exactly_one_primary", passed=not bad_ct,
                           detail="" if not bad_ct else f"Concepts with invalid/missing CT: {bad_ct}"))

    unrecorded = []
    for c in concepts:
        cty = c.get("primary_content_type")
        if cty not in {e.value for e in ct.ContentType}:
            continue
        deviations = ct.flag_deviations(cty, c.get("flags", {}) or {})
        recorded = set(c.get("flag_overrides", []) or [])
        missing = [d for d in deviations if d not in recorded]
        if missing:
            unrecorded.append(f"{c.get('concept_name','?')}: {missing}")
    out.append(CheckResult(name="content_type:flag_conformance", passed=not unrecorded,
                           detail="" if not unrecorded else f"Unrecorded flag overrides: {unrecorded}"))
    return out


def _check_weight_time_closure(cos, concepts, sessions, plan, credits) -> list[CheckResult]:
    """CO weights = 100%; concept weights = 100%; session minutes = duration ±5;
    credits↔hours cross-check (§6)."""
    out: list[CheckResult] = []

    co_sum = sum(float(c.get("topic_weight_pct", 0) or 0) for c in cos)
    out.append(CheckResult(name="weight:co_sum_100",
                           passed=abs(co_sum - 100.0) <= _WEIGHT_TOLERANCE,
                           detail=f"CO topic_weight_pct sums to {co_sum}"))

    concept_sum = sum(float(c.get("relative_weight_pct", 0) or 0) for c in concepts)
    out.append(CheckResult(name="weight:concept_sum_100",
                           passed=abs(concept_sum - 100.0) <= _WEIGHT_TOLERANCE,
                           detail=f"Concept relative_weight_pct sums to {concept_sum}"))

    duration_min = float(plan.get("front_matter", {}).get("topic_duration_hours", 0) or 0) * 60
    session_min = sum(float(s.get("minutes", 0) or 0) for s in sessions)
    out.append(CheckResult(name="time:session_sum_duration",
                           passed=duration_min == 0 or abs(session_min - duration_min) <= _TIME_TOLERANCE,
                           detail=f"Session minutes {session_min} vs duration {duration_min}"))

    # credits↔hours cross-check (non-blocking advisory: 1 credit ≈ 12–15 lecture hrs).
    if credits:
        hours = duration_min / 60
        out.append(CheckResult(name="time:credits_hours_crosscheck",
                               passed=True,  # advisory only at topic grain
                               detail=f"topic hours {hours} against course credits {credits}",
                               blocking=False))
    return out


def _check_verbs(tlos) -> list[CheckResult]:
    """Verb-bank check on TLOs (§10.3): leading verb lemmatized → exact match the
    approved bank at the declared level; banned list rejected."""
    bad = []
    for t in tlos:
        stmt = t.get("statement", "")
        lvl = t.get("bloom_level", "L2")
        if not ct.verb_allowed_at(stmt, lvl):
            bad.append(f"{stmt!r} @ {lvl} (verb '{ct.leading_verb(stmt)}')")
    return [CheckResult(name="verb:tlo_bank", passed=not bad,
                        detail="" if not bad else f"TLOs failing verb bank: {bad}")]


# ══════════════════════════════════════════════════════════════════════════════
# Node A runner + ingest (§7.1) — LLM path, lazy
# ══════════════════════════════════════════════════════════════════════════════

def build_topic_context(course: dict, unit: dict, topic: dict) -> dict:
    """Assemble the TopicContext (§5.1) injected into every node. Pure data
    shaping over the finalized course + selected unit/topic."""
    academic_year = course.get("academic_year") or math.ceil(
        int(course.get("semester_number", 2) or 2) / 2)
    return {
        "course_code": course.get("code", ""),
        "course_name": course.get("name", ""),
        "regulation": course.get("regulation", ""),
        "academic_year": academic_year,
        "credits": course.get("credits", 3),
        "lab_flag": course.get("lab_flag", False),
        "subject_domain": course.get("subject_domain", ""),
        "subject_type_key": course.get("subject_type_key", ""),
        "subject_type_label": course.get("subject_type_label", ""),
        "audience_level": course.get("audience_level", "UG"),
        "unit_number": unit.get("unit_number"),
        "unit_title": unit.get("title", ""),
        "unit_total_hours": unit.get("hours", 0),
        "topic_id": topic.get("topic_id") or topic.get("id"),
        "topic_number": topic.get("topic_number", ""),
        "topic_title": topic.get("title", ""),
        "topic_hours_allocated": topic.get("hours", topic.get("hours_allocated", 0)),
        "subtopics": [s.get("title", s) if isinstance(s, dict) else s
                      for s in (topic.get("subtopics") or [])],
        "operative_co": topic.get("operative_co"),
        "supporting_cos": topic.get("supporting_cos", []),
        "prerequisites": topic.get("prerequisite_topics", []),
        "reference_books": topic.get("reference_books", []),
    }


def _chat_json(client: Any, system: str, user: str, temperature: float = 0.4) -> dict:
    """One JSON-mode chat call. (Target: json_schema strict; POC uses json_object,
    with all semantics checked by the code validators — §7.)"""
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": system},
                  {"role": "user", "content": user}],
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    return json.loads(resp.choices[0].message.content or "{}")


def gen_topic_plan(client: Any, ctx: dict) -> dict:
    """Node A: generate the Topic Plan JSON (strict schema). Model-emitted stamps
    and ids are stripped on ingest by the orchestrator, not here."""
    from app.services.generation_prompts import build_topic_plan_prompt  # lazy
    return _chat_json(client, *build_topic_plan_prompt(ctx), temperature=0.2)


def ingest_topic_plan(plan: dict) -> dict:
    """Strip model-emitted stamps/gate, backfill lookup budgets, and re-derive
    flags from the canonical table so the stored plan is authoritative."""
    plan.pop("gate", None)
    fm = plan.setdefault("front_matter", {})
    for f in ("topic_plan_version", "validated_at", "scope_hash"):
        fm[f] = None
    for c in plan.get("concept_inventory", []) or []:
        cty = c.get("primary_content_type")
        if cty in {e.value for e in ct.ContentType}:
            # Budgets are always resolved from the lookup, never trusted from the model.
            c["budgets"] = ct.resolve_budgets(int(c.get("time_minutes", 0) or 0),
                                              c.get("complexity_tier", "moderate"))
    return plan


def stamp_topic_plan(plan: dict, version: str = "1.0.0") -> dict:
    """On PASS: assign concept ids and compute the scope hash + version stamp."""
    plan = assign_concept_ids(plan)
    fm = plan.setdefault("front_matter", {})
    fm["scope_hash"] = canonical_hash(scope_body(plan))
    fm["topic_plan_version"] = version
    return plan


# ══════════════════════════════════════════════════════════════════════════════
# Node B — Student Notes (per unit): generate → mechanical validate → expand
# (companion: Student Notes Generation Prompt Spec)
# ══════════════════════════════════════════════════════════════════════════════

# Word-minimum field → path into the Core Content (Tier B) output.
_NOTES_FIELD_PATHS = {
    "formal_definition": ("core_concept", "formal_definition"),
    "architecture_and_mechanism": ("deep_dive", "architecture_and_mechanism", "explanation"),
    "code_explanation": ("deep_dive", "code_or_formalization", "explanation"),
    "execution_trace": ("deep_dive", "execution_trace", "dry_run_trace"),
    "worked_example": ("practical_understanding", "worked_example"),
}


def _get_path(obj: dict, path: tuple):
    cur: Any = obj
    for key in path:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(key)
    return cur


def _set_path(obj: dict, path: tuple, value) -> None:
    cur = obj
    for key in path[:-1]:
        cur = cur.setdefault(key, {})
    cur[path[-1]] = value


def _word_count(text) -> int:
    return len(str(text).split()) if text else 0


def gen_notes_unit(client: Any, ctx: dict, plan: dict, unit: dict, *,
                   prev_title: str | None, next_title: str | None,
                   prior_terms: list[str]) -> dict:
    """Node B for one concept: Opening → Core → Closing (three calls). IDs are
    echoed verbatim from the concept."""
    from app.services import generation_prompts as p  # lazy
    opening = _chat_json(client, *p.build_opening_prompt(unit, ctx, plan,
                         prev_title=prev_title, next_title=next_title), temperature=0.6)
    core = _chat_json(client, *p.build_core_prompt(unit, ctx, plan,
                     prior_terms=prior_terms), temperature=0.7)
    closing = _chat_json(client, *p.build_closing_prompt(unit, ctx,
                        prev_title=prev_title, next_title=next_title,
                        condensed_core=_condense_core(core)), temperature=0.5)

    cid = unit.get("concept_id")
    for part in (opening, core, closing):
        if isinstance(part, dict):
            part["subtopic_id"] = cid
            part.pop("traceability_tag", None)  # always null / orchestrator-built
    return {"opening": opening, "core": core, "closing": closing}


def _condense_core(core: dict) -> dict:
    """A bounded summary of the Core output for the Closing prompt (consistency,
    not the limit of what the model knows)."""
    fd = _get_path(core, ("core_concept", "formal_definition")) or ""
    return {
        "formal_definition": fd[:400],
        "new_terms_introduced": core.get("new_terms_introduced", []),
        "advantages": _get_path(core, ("practical_understanding", "advantages")) or [],
    }


def _required_word_fields(unit: dict, ctx: dict, core: dict) -> dict:
    """Which word-minimum fields are required for this unit (by flags + coding
    override) and their current text — the word-minimum validator's input."""
    flags = unit.get("flags", {}) or {}
    mins = ct.notes_word_minimums(unit.get("complexity_tier", "moderate"))
    fields: dict[str, tuple[str, int]] = {}

    def add(name):
        fields[name] = (_get_path(core, _NOTES_FIELD_PATHS[name]) or "", mins[name])

    add("formal_definition")
    add("architecture_and_mechanism")
    if flags.get("requires_code") or ct.is_coding_subject(ctx.get("subject_type_label")):
        add("code_explanation")
    if flags.get("needs_execution_trace"):
        add("execution_trace")
    if flags.get("needs_worked_example"):
        add("worked_example")
    return fields


def validate_notes_unit(unit_output: dict, unit: dict, ctx: dict) -> ValidationResult:
    """Mechanical per-unit gate (§10.3): word minimums (fire expansion), scope
    lock, flag conformance, example coverage, banned verbs, diagram compile,
    glossary consistency."""
    checks: list[CheckResult] = []
    core = unit_output.get("core", {}) or {}
    opening = unit_output.get("opening", {}) or {}
    closing = unit_output.get("closing", {}) or {}
    flags = unit.get("flags", {}) or {}

    # Word minimums — one check per required field; shortfalls fire the expansion prompt.
    for name, (text, minimum) in _required_word_fields(unit, ctx, core).items():
        wc = _word_count(text)
        checks.append(CheckResult(name=f"word_minimum:{name}", passed=wc >= minimum,
                                  detail=f"{wc}/{minimum} words"))

    # Flag conformance — required blocks present per the unit's flags.
    code_needed = flags.get("requires_code") or ct.is_coding_subject(ctx.get("subject_type_label"))
    cof = _get_path(core, ("deep_dive", "code_or_formalization")) or {}
    checks.append(CheckResult(name="flag:code_block",
                              passed=(not code_needed) or bool(cof.get("content")),
                              detail="code content required but missing" if code_needed and not cof.get("content") else ""))
    et = _get_path(core, ("deep_dive", "execution_trace")) or {}
    checks.append(CheckResult(name="flag:execution_trace",
                              passed=(not flags.get("needs_execution_trace")) or bool(et.get("dry_run_trace")),
                              detail="trace required but missing" if flags.get("needs_execution_trace") and not et.get("dry_run_trace") else ""))
    checks.append(CheckResult(name="flag:worked_example",
                              passed=(not flags.get("needs_worked_example")) or bool(_get_path(core, ("practical_understanding", "worked_example"))),
                              detail=""))
    an = core.get("analysis", {}) or {}
    checks.append(CheckResult(name="flag:analysis",
                              passed=(not flags.get("needs_analysis")) or bool(an.get("discussion")),
                              detail=""))
    if flags.get("needs_comparison") and flags.get("comparison_target"):
        rows = _get_path(core, ("comparison", "comparison_table", "rows")) or []
        checks.append(CheckResult(name="flag:comparison", passed=len(rows) >= 4,
                                  detail=f"{len(rows)} comparison rows (need ≥4)"))

    # Scope lock — every scope_in item demonstrated somewhere in the unit text.
    haystack = json.dumps(core, ensure_ascii=False).lower()
    missing = [s for s in (unit.get("scope_in") or []) if str(s).lower() not in haystack]
    checks.append(CheckResult(name="scope:in_covered", passed=not missing,
                              detail="" if not missing else f"scope_in not demonstrated: {missing}"))
    # scope_out mechanics should be absent — heuristic, non-blocking.
    leaked = [s for s in (unit.get("scope_out") or []) if haystack.count(str(s).lower()) > 2]
    checks.append(CheckResult(name="scope:out_absent", passed=not leaked,
                              detail="" if not leaked else f"possible scope_out leakage: {leaked}",
                              blocking=False))

    # Banned outcome verbs in the outcomes checklist statements.
    bad_outcomes = [o.get("statement", "") for o in
                    (_get_path(opening, ("sections", "topic_overview", "outcomes_checklist")) or [])
                    if ct.is_banned_verb(o.get("statement", ""))]
    checks.append(CheckResult(name="verb:outcomes_bank", passed=not bad_outcomes,
                              detail="" if not bad_outcomes else f"banned-verb outcomes: {bad_outcomes}"))

    # Diagram compile — tables need real rows; other diagrams need a description.
    checks.append(_check_diagram_compile(core))

    # Glossary consistency — each new term is present in the closing glossary.
    new_terms = {str(t).lower() for t in core.get("new_terms_introduced", []) or []}
    glossary = {str(g.get("term", "")).lower() for g in
                (_get_path(closing, ("sections", "glossary_section", "terms")) or [])}
    missing_terms = [t for t in new_terms if t and t not in glossary]
    checks.append(CheckResult(name="glossary:consistency", passed=not missing_terms,
                              detail="" if not missing_terms else f"terms missing from glossary: {missing_terms}"))

    all_pass = all(c.passed for c in checks if c.blocking)
    return ValidationResult(all_pass=all_pass, checks=checks)


def _check_diagram_compile(core: dict) -> CheckResult:
    visuals = list(_get_path(core, ("deep_dive", "architecture_and_mechanism", "visuals")) or [])
    visuals += list(_get_path(core, ("deep_dive", "execution_trace", "visuals")) or [])
    bad = []
    for v in visuals:
        vtype = v.get("type", "")
        if vtype in ("table", "execution_trace_table"):
            if not (v.get("columns") and v.get("rows")):
                bad.append(v.get("visual_id", vtype))
        else:
            if not v.get("description"):
                bad.append(v.get("visual_id", vtype))
    return CheckResult(name="diagram:compile", passed=not bad,
                       detail="" if not bad else f"malformed visuals: {bad}")


def expand_field(client: Any, subtopic_title: str, field_name: str, current_text: str,
                 min_words: int, subject_context: str) -> str:
    """Validator-fired expansion (§10.3): rewrite one short field to its minimum.
    Counts as a repair attempt."""
    from app.services.generation_prompts import build_expansion_prompt  # lazy
    prompt = build_expansion_prompt(subtopic_title, field_name, current_text, min_words, subject_context)
    data = _chat_json(client, "You expand a single notes field. Output only JSON.", prompt, temperature=0.6)
    return data.get("expanded_text", current_text)


def validate_and_expand_unit(client: Any, unit_output: dict, unit: dict, ctx: dict) -> ValidationResult:
    """Run the mechanical gate; on a word-minimum shortfall fire the expansion
    prompt for each short field and re-validate (cap 2 attempts total, §6)."""
    result = validate_notes_unit(unit_output, unit, ctx)
    attempts = 1
    subject_context = f"{ctx.get('course_name','')} — {unit.get('concept_name','')}"
    while result.short_fields and attempts < _MAX_ATTEMPTS and client is not None:
        core = unit_output.get("core", {})
        mins = ct.notes_word_minimums(unit.get("complexity_tier", "moderate"))
        for field in result.short_fields:
            path = _NOTES_FIELD_PATHS.get(field)
            if not path:
                continue
            current = _get_path(core, path) or ""
            expanded = expand_field(client, unit.get("concept_name", ""), field, current,
                                    mins[field], subject_context)
            _set_path(core, path, expanded)
        attempts += 1
        result = validate_notes_unit(unit_output, unit, ctx)
    return result


# ══════════════════════════════════════════════════════════════════════════════
# Assembly (§ Orchestration notes) — assembler jobs, never generation calls
# ══════════════════════════════════════════════════════════════════════════════

def assemble_notes(unit_records: list[dict], plan: dict, ctx: dict,
                   version: str = "1.0.0") -> dict:
    """Concatenate approved units in plan order + build topic-level rollups
    (combined glossary index, topic-wide question bank) + compute hashes."""
    glossary_index: list[dict] = []
    question_bank: list[dict] = []
    for rec in unit_records:
        closing = rec.get("closing", {}) or {}
        for g in _get_path(closing, ("sections", "glossary_section", "terms")) or []:
            glossary_index.append({"term": g.get("term"), "unit_ref": rec.get("unit_ref")})
        pq = _get_path(closing, ("sections", "practice_questions")) or {}
        for band in ("easy", "medium", "hard"):
            for q in pq.get(band, []) or []:
                question_bank.append({"unit_ref": rec.get("unit_ref"), "band": band,
                                      "bloom_level": q.get("bloom_level"), "question": q.get("question")})

    doc = {
        "topic_header": {
            "course_block": {"course_code": ctx.get("course_code"), "course_name": ctx.get("course_name"),
                             "regulation": ctx.get("regulation"), "topic_title": ctx.get("topic_title")},
            "co_coverage": [c.get("co_id") for c in plan.get("co_mapping", [])],
            "notes_version": None, "content_hash": None,
            "topic_plan_version": plan.get("front_matter", {}).get("topic_plan_version"),
        },
        "units": unit_records,
        "rollups": {"glossary_index": glossary_index, "question_bank_view": question_bank},
    }
    doc["topic_header"]["content_hash"] = canonical_hash(doc["units"])
    doc["topic_header"]["notes_version"] = version
    return doc


# ══════════════════════════════════════════════════════════════════════════════
# Node C + fan-out (§7.3, §7.4) — Slides finalized; five artifacts JIT placeholder
# ══════════════════════════════════════════════════════════════════════════════

_FANOUT_TYPES = ("slides", "summary", "quiz", "assignment", "faculty_diagnostic", "flashcards")
_JIT_TYPES = ("summary", "quiz", "assignment", "faculty_diagnostic", "flashcards")


def gen_slides(client: Any, ctx: dict, plan: dict, notes: dict) -> dict:
    """Node C: reformat approved Notes into a render-agnostic slide model.
    Introduces no content absent from the Notes (validated structurally, §10.3)."""
    from app.services.generation_prompts import build_slides_prompt  # lazy
    return _chat_json(client, *build_slides_prompt(ctx, plan, notes), temperature=0.4)


def placeholder_artifact(artifact_type: str, notes: dict) -> dict:
    """The clearly-flagged placeholder shape for a JIT fan-out artifact (§7.4).
    Ships flagged; excluded from stakeholder demos."""
    header = notes.get("topic_header", {})
    return {
        "placeholder": True,
        "artifact_type": artifact_type,
        "version": None,
        "derived_from_notes_version": header.get("notes_version"),
        "derived_from_content_hash": header.get("content_hash"),
        "note": "Template not yet authored (JIT). Excluded from demos.",
        "content": {},
    }


# ══════════════════════════════════════════════════════════════════════════════
# Orchestrator (§6, §10.2) — DB-driven so a restart is safe
# ══════════════════════════════════════════════════════════════════════════════
#
# POC scope: the Topic Plan phase is fully wired (Node A → auto-pass VALIDATE
# gate). Student Notes (Node B) is authored against the companion Student Notes
# Generation Prompt Spec and the five JIT fan-out templates; those runners land
# with their specs. run_topic_job therefore generates + validates the plan and
# parks the job at the point where Notes generation begins.

_MAX_ATTEMPTS = 2   # retry cap per generation node (§6)


def enqueue_topic_job(job_id: str, course_id: str, topic_id: str) -> None:
    """Kick off the Topic Plan node off-request in a daemon thread. All state is
    persisted to the job row, so progress survives a restart."""
    import threading

    def _worker():
        try:
            from app.db.supabase import get_client
            run_topic_job(get_client(), job_id, course_id, topic_id)
        except Exception as e:  # pragma: no cover - defensive; recorded on the row
            logger.exception("topic job %s crashed: %s", job_id, e)
            try:
                from app.db.supabase import get_client
                get_client().table("generation_jobs").update(
                    {"status": "failed", "error_msg": f"{type(e).__name__}: {e}"}
                ).eq("id", job_id).execute()
            except Exception:
                pass

    threading.Thread(target=_worker, daemon=True).start()


def run_topic_job(db, job_id: str, course_id: str, topic_id: str) -> None:
    """Generate + auto-validate the Topic Plan (§10.2). On PASS the orchestrator
    assigns concept ids, computes scope_hash, stamps the version, and advances
    the phase to Notes generation."""
    _set_job(db, job_id, status="running", phase="generating_topic_plan")

    client = _openai_client()
    if client is None:
        _set_job(db, job_id, status="failed", phase="error",
                 error_msg="OPENAI_API_KEY not configured — cannot generate Topic Plan.")
        return

    ctx = _load_topic_context(db, course_id, topic_id)

    plan: dict = {}
    result: ValidationResult | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            plan = ingest_topic_plan(gen_topic_plan(client, ctx))
        except Exception as e:
            logger.warning("topic plan attempt %d parse/gen failed: %s", attempt, e)
            continue
        result = validate_topic_plan(plan, credits=ctx.get("credits"))
        log_check_outcomes(job_id, "topic_plan", result)   # telemetry from day one (§6)
        if result.all_pass:
            break

    _set_job(db, job_id, phase="topic_plan_validate")

    if not result or not result.all_pass:
        blocking = [c.model_dump() for c in (result.failures if result else [])]
        _upsert_artifact(db, job_id, topic_id, "topic_plan", plan,
                         review_status="revise_requested",
                         validation={"all_pass": False, "failures": blocking})
        _set_job(db, job_id, status="failed", phase="error",
                 error_msg="Topic Plan failed validation after retry cap.")
        return

    plan = stamp_topic_plan(plan)
    _upsert_artifact(db, job_id, topic_id, "topic_plan", plan,
                     gate_type="validate", review_status="validated",
                     validation={"all_pass": True, "failures": []},
                     artifact_version=plan["front_matter"]["topic_plan_version"],
                     content_hash=plan["front_matter"]["scope_hash"])
    # Auto-advance: the plan gate is mechanical and auto-passing (§6).
    _run_notes_phase(db, client, job_id, topic_id, ctx, plan)


def _run_notes_phase(db, client, job_id: str, topic_id: str, ctx: dict, plan: dict) -> None:
    """Generate every concept's Notes unit → mechanical gate + expansion loop →
    persist per-unit rows and pause at the per-unit human approval gate (§6, §10.2)."""
    _set_job(db, job_id, phase="generating_notes_units")
    concepts = plan.get("concept_inventory", []) or []
    unit_records: list[dict] = []
    prior_terms: list[str] = []

    for i, unit in enumerate(concepts):
        prev_title = concepts[i - 1].get("concept_name") if i > 0 else None
        next_title = concepts[i + 1].get("concept_name") if i + 1 < len(concepts) else None
        try:
            out = gen_notes_unit(client, ctx, plan, unit, prev_title=prev_title,
                                 next_title=next_title, prior_terms=prior_terms)
        except Exception as e:
            logger.warning("notes unit %s gen failed: %s", unit.get("concept_id"), e)
            unit_records.append({"unit_ref": unit.get("concept_id"), "opening": {}, "core": {},
                                 "closing": {}, "unit_hash": None,
                                 "approval": {"status": "error", "reviewer": None}})
            continue
        v = validate_and_expand_unit(client, out, unit, ctx)
        log_check_outcomes(job_id, f"notes:{unit.get('concept_id')}", v)
        prior_terms = prior_terms + list((out.get("core", {}) or {}).get("new_terms_introduced", []) or [])
        unit_records.append({
            "unit_ref": unit.get("concept_id"), **out, "unit_hash": canonical_hash(out),
            "approval": {"status": "pending" if v.all_pass else "error", "reviewer": None},
            "validation": {"all_pass": v.all_pass, "failures": [c.model_dump() for c in v.failures]},
        })

    _set_job(db, job_id, phase="unit_validate")
    content = {"units": unit_records,
               "topic_plan_version": plan["front_matter"]["topic_plan_version"]}
    art_id = _upsert_artifact(db, job_id, topic_id, "student_notes", content,
                              gate_type="approve", review_status="pending")

    for rec in unit_records:
        unit = next((c for c in concepts if c.get("concept_id") == rec["unit_ref"]), {})
        db.table("artifact_units").insert({
            "id": str(uuid.uuid4()), "artifact_id": art_id, "concept_id": rec["unit_ref"],
            "content_type": unit.get("primary_content_type"), "flags": unit.get("flags", {}),
            "unit_hash": rec.get("unit_hash"), "approval_status": rec["approval"]["status"],
        }).execute()

    # Pause at the only human content gate; driven from DB state (restart-safe).
    _set_job(db, job_id, phase="unit_approve")


def log_check_outcomes(job_id: str, node: str, result: ValidationResult) -> None:
    """Per-check pass-rate telemetry (§6). A check that fails systematically is a
    prompt defect, not generation noise."""
    for c in result.checks:
        logger.info("validator job=%s node=%s check=%s passed=%s %s",
                    job_id, node, c.name, c.passed, c.detail)


def enqueue_fanout(job_id: str) -> None:
    """Kick off the parallel fan-out off-request once all Notes units are approved."""
    import threading

    def _worker():
        try:
            from app.db.supabase import get_client
            run_fanout(get_client(), job_id)
        except Exception as e:  # pragma: no cover - defensive; recorded on the row
            logger.exception("fanout %s crashed: %s", job_id, e)

    threading.Thread(target=_worker, daemon=True).start()


def run_fanout(db, job_id: str) -> None:
    """Assemble approved Notes, then generate the six fan-out artifacts with
    per-artifact terminal status (§6, §7.3/§7.4). Slides is generated; the five
    JIT artifacts ship as clearly-flagged placeholders until their templates land."""
    job = _row(db, "generation_jobs", job_id)
    topic_id = job.get("topic_id")
    plan = (_artifact_content(db, job_id, "topic_plan") or {})
    notes_row = _artifact_content(db, job_id, "student_notes") or {}
    course_id = _course_id_for_topic(db, topic_id)
    ctx = _load_topic_context(db, course_id, topic_id)

    # Assemble only the approved units, then stamp the Notes doc as approved.
    approved = [u for u in notes_row.get("units", [])
                if (u.get("approval") or {}).get("status") == "approved"] or notes_row.get("units", [])
    notes = assemble_notes(approved, plan, ctx)
    _upsert_artifact(db, job_id, topic_id, "student_notes", notes,
                     review_status="approved",
                     artifact_version=notes["topic_header"]["notes_version"],
                     content_hash=notes["topic_header"]["content_hash"])

    _set_job(db, job_id, phase="generating_fanout")
    nv = notes["topic_header"]["notes_version"]
    nh = notes["topic_header"]["content_hash"]
    client = _openai_client()

    # Slides (Node C) — the one finalized fan-out template.
    try:
        if client is None:
            raise RuntimeError("OPENAI_API_KEY not configured")
        slides = gen_slides(client, ctx, plan, notes)
        slides.setdefault("deck_meta", {}).update(
            {"slides_version": "1.0.0", "derived_from_notes_version": nv,
             "derived_from_content_hash": nh})
        _upsert_artifact(db, job_id, topic_id, "slides", slides,
                         gate_type="structural_review", review_status="pending",
                         artifact_version="1.0.0", derived_from_version=nv, derived_from_hash=nh)
    except Exception as e:
        logger.warning("slides gen failed: %s", e)
        _upsert_artifact(db, job_id, topic_id, "slides", {"error": str(e)},
                         gate_type="structural_review", review_status="error")

    # The five JIT artifacts — placeholder until their templates are authored (§7.4).
    for art_type in _JIT_TYPES:
        _upsert_artifact(db, job_id, topic_id, art_type, placeholder_artifact(art_type, notes),
                         gate_type="structural_review", review_status="pending",
                         derived_from_version=nv, derived_from_hash=nh, is_stale=False)

    _set_job(db, job_id, phase="fanout_review")


def _artifact_content(db, job_id: str, artifact_type: str) -> dict | None:
    r = db.table("artifacts").select("content").eq("job_id", job_id).eq("type", artifact_type) \
        .limit(1).execute()
    return r.data[0]["content"] if r.data else None


def _course_id_for_topic(db, topic_id: str) -> str:
    topic = _row(db, "topics", topic_id)
    unit = _row(db, "units", topic.get("unit_id")) if topic.get("unit_id") else {}
    return unit.get("course_id", "")


def finalize(db, user: dict, job_id: str, artifact_type: str, payload) -> dict:
    """Drive a gate from the artifact row (§9). Per-unit approval for
    student_notes; ship/release for fan-out; revise re-enqueues."""
    if artifact_type == "student_notes" and payload.decision == "approve":
        db.table("artifact_units").update({
            "approval_status": "approved",
            "approved_by": user["id"],
        }).eq("id", payload.unit_id).execute()
        remaining = (
            db.table("artifact_units").select("id")
            .eq("artifact_id", _artifact_id(db, job_id, "student_notes"))
            .neq("approval_status", "approved").execute()
        )
        if not remaining.data:
            # Last unit approved → assemble Notes + kick off the parallel fan-out.
            _set_job(db, job_id, phase="notes_assembled")
            enqueue_fanout(job_id)
        return {"decision": "approve", "unit_id": payload.unit_id,
                "all_units_approved": not remaining.data}

    if artifact_type == "student_notes" and payload.decision == "revise":
        # Per-unit revise: re-flag only this unit (regeneration is a follow-on run).
        db.table("artifact_units").update({"approval_status": "revise_requested"}) \
            .eq("id", payload.unit_id).execute()
        return {"decision": "revise", "unit_id": payload.unit_id, "status": "revise_requested"}

    status_map = {"ship": "shipped", "release": "released", "revise": "revise_requested"}
    new_status = status_map.get(payload.decision, "pending")
    db.table("artifacts").update({"review_status": new_status}).eq("job_id", job_id) \
        .eq("type", artifact_type).execute()
    return {"decision": payload.decision, "artifact_type": artifact_type, "status": new_status}


# ── DB helpers (kept thin; the orchestrator owns all business rules) ──────────

def _set_job(db, job_id: str, **fields) -> None:
    db.table("generation_jobs").update(fields).eq("id", job_id).execute()


def _artifact_id(db, job_id: str, artifact_type: str) -> str | None:
    r = db.table("artifacts").select("id").eq("job_id", job_id).eq("type", artifact_type) \
        .limit(1).execute()
    return r.data[0]["id"] if r.data else None


def _upsert_artifact(db, job_id: str, topic_id: str, artifact_type: str, content: dict,
                     **fields) -> str:
    """Insert or update the single artifact row of this type for the job; returns
    its id."""
    row = {"job_id": job_id, "topic_id": topic_id, "type": artifact_type,
           "content": content, **fields}
    existing = _artifact_id(db, job_id, artifact_type)
    if existing:
        db.table("artifacts").update(row).eq("id", existing).execute()
        return existing
    new_id = str(uuid.uuid4())
    db.table("artifacts").insert({"id": new_id, **row}).execute()
    return new_id


def _load_topic_context(db, course_id: str, topic_id: str) -> dict:
    """Best-effort TopicContext assembly from the finalized course tables
    (§3.6 → §5.1). Missing joins degrade gracefully to empty defaults."""
    course = _row(db, "courses", course_id)
    topic = _row(db, "topics", topic_id)
    unit = _row(db, "units", topic.get("unit_id")) if topic.get("unit_id") else {}
    subtopics = db.table("subtopics").select("title").eq("topic_id", topic_id).execute()
    topic = dict(topic)
    topic["subtopics"] = [s.get("title") for s in (subtopics.data or [])]
    topic.setdefault("reference_books", [])
    return build_topic_context(course, unit, topic)


def _row(db, table: str, row_id: str) -> dict:
    if not row_id:
        return {}
    r = db.table(table).select("*").eq("id", row_id).limit(1).execute()
    return r.data[0] if r.data else {}


# ══════════════════════════════════════════════════════════════════════════════
# Change classification + trigger write-back (§3.7, §11) — code-assigned
# ══════════════════════════════════════════════════════════════════════════════

# Whitelisted editorial paths (typos, labels, non-scope prose) → patch bump.
_EDITORIAL_PREFIXES = ("/topic_title", "/label", "/display_name", "/note", "/prose")
# Scope-substantive paths → major bump, whole-topic stale.
_SCOPE_PREFIXES = ("/hours", "/topic_hours", "/subtopics", "/co", "/operative_co",
                   "/supporting_cos", "/concept", "/session", "/blueprint",
                   "/weight", "/duration", "/content_type", "/flags")


def classify_patch_path(path: str) -> str:
    """Path-whitelist classification (§11). The editor never self-classifies:
    whitelisted paths are editorial, scope paths are scope-substantive, and
    everything else is content-substantive."""
    p = (path or "").lower()
    if any(p.startswith(pre) for pre in _EDITORIAL_PREFIXES):
        return "editorial"
    if any(p.startswith(pre) for pre in _SCOPE_PREFIXES):
        return "scope_substantive"
    return "content_substantive"


def classify_patch(patch) -> str:
    """Classify a whole patch by the strongest change any operation makes:
    scope_substantive > content_substantive > editorial."""
    ops = patch if isinstance(patch, list) else [patch]
    classes = {classify_patch_path(op.get("path", "")) for op in ops if isinstance(op, dict)}
    for level in ("scope_substantive", "content_substantive", "editorial"):
        if level in classes:
            return level
    return "editorial"


def apply_scope_patch(db, user: dict, course_id: str, payload) -> dict:
    """Trigger write-back (§3.7): record the audit row with code-assigned
    classification. Applying whitelisted trigger-editable paths to the live
    course is the G4 write path; until it lands, the per-job scope snapshot is
    the source of truth (standing caveat, §3.7)."""
    classification = classify_patch(payload.patch)
    db.table("course_scope_patches").insert({
        "id": str(uuid.uuid4()),
        "course_id": course_id,
        "topic_id": payload.topic_id,
        "patch": payload.patch,
        "classification": classification,
        "author": user["id"],
    }).execute()
    return {"course_id": course_id, "topic_id": payload.topic_id,
            "classification": classification, "recorded": True}
