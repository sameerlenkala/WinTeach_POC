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

import copy
import hashlib
import json
import logging
import math
import re
import threading
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

# Prompt version stamped on every generated artifact (excluded from hashing) so
# validator telemetry and quality regressions can be attributed to the prompt
# set that produced them.
from app.services.generation_prompts import PROMPT_VERSION  # noqa: E402

# Offline/test fallbacks only — live runs route via settings.generation_model /
# settings.generation_light_model (see _model). Values mirror the config
# defaults; the API key has no access to gpt-4o / gpt-4o-mini anymore.
MODEL = "gpt-5.6-terra"
LIGHT_MODEL = "gpt-5.4-nano"


def _model(light: bool = False) -> str:
    """Per-node model routing: heavy nodes author student-facing content; light
    nodes do mechanical repairs (verb fixes, TLO retagging, subtopic splits)."""
    try:
        from app.core.config import settings
        return settings.generation_light_model if light else settings.generation_model
    except Exception:  # pragma: no cover - settings unavailable offline
        return LIGHT_MODEL if light else MODEL


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
        verbs = ", ".join(sorted(ct.APPROVED_VERBS.get(bloom, ct.APPROVED_VERBS["L3"]))[:10])
        prompt = (
            "You are an expert OBE curriculum designer for Indian engineering "
            "universities. Generate exactly {n} Course Outcomes at Bloom level "
            "{bloom} for a course covering these units: {units}.\n\n"
            "Rules:\n"
            "- Each CO is written from the student perspective and starts with "
            "an approved {bloom} verb — choose from: {verbs}.\n"
            "- NEVER use: understand, learn, know, appreciate, be familiar with, "
            "be aware of, study, grasp, comprehend, be exposed to.\n"
            "- Each CO is specific to the actual unit content named above — "
            "never generic filler that fits any course.\n"
            "- Each CO must be assessable: an examiner could set a question "
            "testing exactly this.\n"
            "- One sentence per CO, no numbering inside the text.\n"
            'Return JSON: {{"course_outcomes": ["...", ...]}}.'
        ).format(n=req.count, bloom=bloom, verbs=verbs,
                 units=", ".join(req.unit_titles) or "the course")
        from app.services import llm_compat
        resp = llm_compat.create_chat_completion(
            client, model=_model(),
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
    "concept_id", "tlo_id", "grounded_in", "prompt_version",
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


# ── Token/cost meter — thread-local so each background generate action totals
# only its own LLM calls (§ cost tracking). ──────────────────────────────────
_meter = threading.local()


def meter_reset() -> None:
    _meter.prompt = 0
    _meter.completion = 0
    _meter.cost = 0.0


def _meter_add(prompt_tokens: int, completion_tokens: int, model: str = MODEL) -> None:
    _meter.prompt = getattr(_meter, "prompt", 0) + (prompt_tokens or 0)
    _meter.completion = getattr(_meter, "completion", 0) + (completion_tokens or 0)
    # Cost is accumulated per call at that call's model rate — a job that mixes
    # heavy and light models bills each call correctly.
    _meter.cost = getattr(_meter, "cost", 0.0) + ct.usd_cost(prompt_tokens or 0,
                                                             completion_tokens or 0, model)


def meter_read() -> tuple[int, int, float]:
    """(prompt_tokens, completion_tokens, usd_cost) since the last reset."""
    p = getattr(_meter, "prompt", 0)
    c = getattr(_meter, "completion", 0)
    return p, c, round(getattr(_meter, "cost", 0.0), 4)


# Transient OpenAI errors worth a backoff-retry (matched by name so this module
# still imports cleanly without the openai package).
_TRANSIENT_ERRORS = ("RateLimitError", "APITimeoutError", "APIConnectionError",
                     "InternalServerError", "APIError")


def _is_transient(e: Exception) -> bool:
    return type(e).__name__ in _TRANSIENT_ERRORS


def _chat_json(client: Any, system: str, user: str, temperature: float = 0.4,
               schema: dict | None = None, schema_name: str = "output",
               light: bool = False, effort: str | None = None) -> dict:
    """One JSON-mode chat call. When `schema` is given, strict json_schema mode
    enforces the output shape mechanically (json_object mode demonstrably lets
    the model drop structured shapes, e.g. prose formal_definition); otherwise
    json_object with semantics checked by the code validators — §7. Token usage
    is accumulated into the thread-local meter at the call's model rate.

    Failure handling: transient API errors are retried with backoff; invalid
    JSON is retried with the parse error fed back so the model can correct it
    (a blind identical retry demonstrably repeats the same failure); a
    truncated response (finish_reason=length) is told to compress prose."""
    import time
    model = _model(light)
    if schema is not None:
        response_format: dict = {"type": "json_schema", "json_schema": {
            "name": schema_name, "strict": True, "schema": schema}}
    else:
        response_format = {"type": "json_object"}
    messages = [{"role": "system", "content": system},
                {"role": "user", "content": user}]
    last_err: Exception | None = None
    api_retries = 0
    from app.services import llm_compat
    for attempt in range(3):
        try:
            resp = llm_compat.create_chat_completion(
                client, model=model,
                messages=messages,
                temperature=temperature,
                reasoning_effort=effort,
                max_tokens=16000,  # output cap for cost control; the SDK default truncates large core/polish payloads mid-string
                response_format=response_format,
            )
        except Exception as e:
            if _is_transient(e) and api_retries < 2:
                api_retries += 1
                logger.warning("_chat_json transient API error (%s), retry %d", type(e).__name__, api_retries)
                time.sleep(2 * api_retries)
                continue
            raise
        u = getattr(resp, "usage", None)
        if u is not None:
            _meter_add(getattr(u, "prompt_tokens", 0), getattr(u, "completion_tokens", 0), model)
        choice = resp.choices[0]
        content = choice.message.content or "{}"
        finish = getattr(choice, "finish_reason", None)
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            last_err = e
            logger.warning("_chat_json invalid JSON (attempt %d, finish_reason=%s): %s",
                           attempt + 1, finish, e)
            # Feed the failure back instead of blindly re-asking.
            if finish == "length":
                note = ("Your previous response was cut off before the JSON completed. "
                        "Re-emit the COMPLETE JSON object, compressing prose fields "
                        "enough to fit — never truncate the structure itself.")
            else:
                note = (f"Your previous response was not valid JSON (parse error: {e}). "
                        "Re-emit the COMPLETE, corrected JSON object — nothing else.")
            messages = messages[:2] + [
                {"role": "assistant", "content": content[:6000]},
                {"role": "user", "content": note},
            ]
    raise last_err  # all attempts unparseable


def split_subtopics(client: Any, topic_title: str, subtopics: list[str]) -> list[dict]:
    """Subtopic Decomposition (companion doc): for each syllabus subtopic, list
    the atomic concepts bundled inside it ("insert, delete, update" → three
    concepts). The SUBTOPIC stays the generation unit — the concepts become its
    coverage checklist. Best-effort: failures fall back to one concept per
    subtopic (itself). Output order and titles mirror the input exactly."""
    from app.services.generation_prompts import build_subtopic_split_prompt  # lazy
    fallback = [{"title": s, "concepts": [s]} for s in subtopics]
    if not subtopics:
        return []
    try:
        r = _chat_json(
            client,
            "You are an expert curriculum architect. Output ONLY valid JSON.",
            build_subtopic_split_prompt(topic_title, subtopics),
            temperature=0.1, light=True, effort="low",
        )
        by_title = {(e.get("title") or "").strip().casefold(): e
                    for e in (r.get("subtopics") or []) if isinstance(e, dict)}
        out = []
        for s in subtopics:
            e = by_title.get(s.strip().casefold()) or {}
            concepts = [c.strip() for c in (e.get("concepts") or [])
                        if isinstance(c, str) and c.strip()]
            out.append({"title": s, "concepts": concepts or [s]})
        return out
    except Exception:
        logger.warning("subtopic decomposition failed — one concept per subtopic", exc_info=True)
    return fallback


def gen_topic_plan(client: Any, ctx: dict) -> dict:
    """Node A: generate the Topic Plan JSON (strict schema). Model-emitted stamps
    and ids are stripped on ingest by the orchestrator, not here. Each subtopic
    is annotated with its bundled concepts first (companion doc) so the plan
    emits one row per subtopic with a concepts_covered checklist."""
    from app.services.generation_prompts import build_topic_plan_prompt  # lazy
    mapping = split_subtopics(client, ctx.get("topic_title", ""), ctx.get("subtopics") or [])
    if mapping:
        ctx = {**ctx, "subtopic_concepts": mapping}
    return _chat_json(client, *build_topic_plan_prompt(ctx), temperature=0.2)


def _normalize_weights(items: list, field: str) -> None:
    """Rescale a set of percentage weights so they sum to exactly 100, absorbing
    the rounding drift into the last item. Integer weights across many items
    rarely sum to 100 on their own; the orchestrator owns the invariant so the
    weight-closure gate isn't tripped by model rounding."""
    vals = [float(i.get(field) or 0) for i in items]
    total = sum(vals)
    if not items or total <= 0:
        return
    scaled = [round(v * 100 / total) for v in vals]
    scaled[-1] += 100 - sum(scaled)   # push residual onto the last item
    for i, s in zip(items, scaled):
        i[field] = s


def _normalize_plan_keys(plan: dict) -> dict:
    """Defensive key normalization — map common model aliases onto the canonical
    field names the validators expect, and coerce scope fields to arrays. The
    prompt demands the exact keys; this is a belt-and-braces guard against drift."""
    def as_list(v):
        if v is None:
            return []
        return v if isinstance(v, list) else [v]

    for c in plan.get("concept_inventory", []) or []:
        if not c.get("concept_name"):
            c["concept_name"] = c.get("text") or c.get("name") or ""
        if not c.get("flags"):
            c["flags"] = c.get("derived_flags") or {}
        c["serves_tlos"] = as_list(c.get("serves_tlos"))
        c["scope_in"] = as_list(c.get("scope_in"))
        c["scope_out"] = as_list(c.get("scope_out"))
        c["flag_overrides"] = as_list(c.get("flag_overrides"))
        # Subtopic-level generation: each row's coverage checklist defaults to
        # the subtopic itself when the model omits it.
        c["concepts_covered"] = as_list(c.get("concepts_covered"))
        if not c["concepts_covered"] and c.get("concept_name"):
            c["concepts_covered"] = [c["concept_name"]]
    for t in plan.get("tlo_set", []) or []:
        if not t.get("statement"):
            t["statement"] = t.get("text") or t.get("tlo_statement") or ""
        t["served_by_concepts"] = as_list(t.get("served_by_concepts"))
        # Canonicalize the Bloom representation — the model sometimes emits the
        # name ("Apply") instead of the code ("L3"); store the code so the verb
        # gate, coherence checks, and reader display all agree.
        if t.get("bloom_level"):
            t["bloom_level"] = ct.normalize_bloom(t["bloom_level"])
    for m in plan.get("co_mapping", []) or []:
        if not m.get("co_statement"):
            m["co_statement"] = m.get("text") or m.get("statement") or ""
        if m.get("bloom_level"):
            m["bloom_level"] = ct.normalize_bloom(m["bloom_level"])
    for c in plan.get("concept_inventory", []) or []:
        if c.get("bloom_ceiling"):
            c["bloom_ceiling"] = ct.normalize_bloom(c["bloom_ceiling"])
    return plan


def ingest_topic_plan(plan: dict) -> dict:
    """Strip model-emitted stamps/gate, normalize keys, backfill lookup budgets,
    and re-derive flags from the canonical table so the stored plan is authoritative."""
    plan.pop("gate", None)
    _normalize_plan_keys(plan)
    fm = plan.setdefault("front_matter", {})
    for f in ("topic_plan_version", "validated_at", "scope_hash"):
        fm[f] = None
    _normalize_weights(plan.get("co_mapping", []) or [], "topic_weight_pct")
    _normalize_weights(plan.get("concept_inventory", []) or [], "relative_weight_pct")
    for c in plan.get("concept_inventory", []) or []:
        cty = c.get("primary_content_type")
        if cty in {e.value for e in ct.ContentType}:
            # Flags are DERIVED from the Content Type (§4 "one classification, two
            # projections"), not trusted from the model. Only flags the model
            # explicitly records in flag_overrides may deviate from the canonical
            # derivation — so conformance holds by construction.
            model_flags = c.get("flags", {}) or {}
            overrides = {name: model_flags.get(name) for name in (c.get("flag_overrides") or [])
                         if name in ct.FLAG_NAMES and model_flags.get(name) is not None}
            c["flags"] = ct.derive_flags(cty, overrides=overrides,
                                         comparison_target=model_flags.get("comparison_target"))
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
    fm["prompt_version"] = PROMPT_VERSION
    return plan


# ── Plan repair passes (companion: TLO Alignment doc) ─────────────────────────
# Three LLM-driven repairs between ingest and validation. "Subtopic" in the doc
# maps to a concept_inventory row. All passes are best-effort: any failure
# leaves the plan unchanged for the code validators to judge.

def _next_tlo_id(tlos: list[dict]) -> str:
    mx = 0
    for t in tlos:
        m = re.match(r"^T(\d+)$", str(t.get("tlo_id") or ""))
        if m:
            mx = max(mx, int(m.group(1)))
    return f"T{mx + 1}"


def _sync_plan_links(plan: dict) -> None:
    """Rebuild each TLO's served_by_concepts from the concepts' serves_tlos and
    re-derive every concept's bloom_ceiling as the max Bloom of its served TLOs
    (the invariant bloom:concept_ceiling validates)."""
    tlos = plan.get("tlo_set") or []
    concepts = plan.get("concept_inventory") or []
    tlo_by_id = {t.get("tlo_id"): t for t in tlos}
    for t in tlos:
        t["served_by_concepts"] = []
    for c in concepts:
        for tid in c.get("serves_tlos") or []:
            t = tlo_by_id.get(tid)
            if t is not None and c.get("concept_id") not in t["served_by_concepts"]:
                t["served_by_concepts"].append(c.get("concept_id"))
        ranks = [ct.bloom_rank(tlo_by_id[tid].get("bloom_level", "L2"))
                 for tid in (c.get("serves_tlos") or []) if tid in tlo_by_id]
        if ranks:
            c["bloom_ceiling"] = ct.BLOOM_ORDER[max(ranks) - 1]


def repair_plan_alignment(client: Any, plan: dict) -> dict:
    """TLO Alignment repairs: (1) re-tag TLO↔concept assignments whose wording
    doesn't match; (2) author a TLO for any mapped CO with none tracing to it;
    (3) author a TLO for any concept serving none."""
    from app.services import generation_prompts as gp  # lazy

    tlos = plan.get("tlo_set") or []
    concepts = plan.get("concept_inventory") or []
    if not tlos or not concepts:
        return plan
    sys_msg = "You are an expert in curriculum alignment. Output ONLY valid JSON."

    # Pass 1 — verify/correct TLO-concept tagging against the TLOs' wording.
    try:
        r = _chat_json(client, sys_msg, gp.build_tlo_realign_prompt(tlos, concepts),
                       temperature=0.1, light=True, effort="low")
        tlo_ids = {t.get("tlo_id") for t in tlos}
        corrected = {a.get("subtopic_id"): [t for t in (a.get("served_tlos") or []) if t in tlo_ids]
                     for a in (r.get("corrected_assignments") or [])
                     if isinstance(a, dict) and a.get("subtopic_id")}
        if corrected:
            for c in concepts:
                new = corrected.get(c.get("concept_id"))
                if new:  # never strip a concept down to zero TLOs here
                    c["serves_tlos"] = new
    except Exception:
        logger.warning("TLO realign pass failed — keeping original tagging", exc_info=True)

    # Pass 2 — every mapped CO (primary or supporting) needs ≥1 TLO tracing to it.
    for co in plan.get("co_mapping") or []:
        try:
            covered = {t.get("parent_co") for t in plan.get("tlo_set") or []}
            if not co.get("co_id") or co.get("co_id") in covered:
                continue
            r = _chat_json(client, sys_msg, gp.build_missing_co_tlo_prompt(co, concepts),
                           temperature=0.2, light=True, effort="low")
            best = r.get("best_subtopic_id")
            stmt = (r.get("outcome_statement") or "").strip()
            target = next((c for c in concepts if c.get("concept_id") == best), None)
            if not stmt or target is None:
                continue
            co_rank = ct.bloom_rank(co.get("bloom_level", "L2"))
            new_rank = min(ct.bloom_rank(r.get("bloom_level", "L2")), co_rank)
            new_id = _next_tlo_id(plan["tlo_set"])
            plan["tlo_set"].append({
                "tlo_id": new_id, "statement": stmt, "parent_co": co.get("co_id"),
                "bloom_level": ct.BLOOM_ORDER[new_rank - 1], "served_by_concepts": [best],
            })
            target.setdefault("serves_tlos", []).append(new_id)
            addition = r.get("scope_in_addition")
            if addition and isinstance(addition, str):
                target.setdefault("scope_in", []).append(addition)
        except Exception:
            logger.warning("uncovered-CO TLO pass failed for %s", co.get("co_id"), exc_info=True)

    # Pass 3 — every concept must serve ≥1 TLO (L1/L2 fine for foundational ones).
    for c in concepts:
        try:
            if c.get("serves_tlos"):
                continue
            bloom_target = ct.normalize_bloom(c.get("bloom_ceiling") or "L2")
            verbs = sorted(ct.APPROVED_VERBS.get(bloom_target, ct.APPROVED_VERBS["L2"]))[:8]
            r = _chat_json(client, sys_msg,
                           gp.build_subtopic_tlo_prompt(c, bloom_target, verbs),
                           temperature=0.2, light=True, effort="low")
            stmt = (r.get("outcome_statement") or "").strip()
            if not stmt:
                continue
            parent = next((m.get("co_id") for m in plan.get("co_mapping") or [] if m.get("co_id")), None)
            if parent is None:
                continue
            new_id = _next_tlo_id(plan["tlo_set"])
            plan["tlo_set"].append({
                "tlo_id": new_id, "statement": stmt, "parent_co": parent,
                "bloom_level": bloom_target, "served_by_concepts": [c.get("concept_id")],
            })
            c["serves_tlos"] = [new_id]
        except Exception:
            logger.warning("concept-TLO pass failed for %s", c.get("concept_id"), exc_info=True)

    # Pass 4 — verb-bank repair: rewrite any TLO whose leading verb isn't
    # approved at its declared level, so a single stray verb ("perform",
    # "create" outside its level) rewrites one statement instead of failing the
    # whole plan after the retry cap. Best-effort; unfixable TLOs fall through
    # to the code validator.
    for t in plan.get("tlo_set") or []:
        try:
            stmt, lvl = t.get("statement", ""), ct.normalize_bloom(t.get("bloom_level", "L2"))
            if not stmt or ct.verb_allowed_at(stmt, lvl):
                continue
            verbs = sorted(ct.APPROVED_VERBS.get(lvl, ct.APPROVED_VERBS["L2"]))
            r = _chat_json(client, sys_msg,
                           gp.build_tlo_verb_fix_prompt(stmt, lvl, verbs[:12]),
                           temperature=0.1, light=True, effort="low")
            fixed = (r.get("outcome_statement") or "").strip()
            if fixed and ct.verb_allowed_at(fixed, lvl):
                t["statement"] = fixed
        except Exception:
            logger.warning("verb-fix pass failed for %s", t.get("tlo_id"), exc_info=True)

    _sync_plan_links(plan)
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


def _flatten_text(value) -> str:
    """Notes fields may be prose (legacy), arrays of points, or {core, elaboration}
    objects (structured schema) — flatten any shape to plain text."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(_flatten_text(v) for v in value if v)
    if isinstance(value, dict):
        return "\n".join(_flatten_text(v) for v in value.values() if v)
    return str(value)


def _word_count(text) -> int:
    return len(_flatten_text(text).split()) if text else 0


# Generic curriculum filler carries no coverage signal — only distinctive tokens
# decide whether a named concept/scope item is demonstrated in the text.
_COVERAGE_STOP = {"and", "the", "for", "with", "into", "from", "statement", "statements",
                  "operation", "operations", "concept", "concepts", "basic", "basics",
                  "introduction", "overview", "types", "different", "using"}


def _covered_in(haystack: str, name: str) -> bool:
    """Loose token coverage: every distinctive word of `name` appears somewhere
    in `haystack` (already casefolded). 'INSERT statement' is covered when
    'insert' appears — a verbatim-substring test would fail legitimate phrasing
    like 'scheduling of processes' for 'process scheduling'."""
    words = [w for w in re.findall(r"[a-z0-9+#]+", str(name).casefold())
             if len(w) >= 3 and w not in _COVERAGE_STOP]
    return not words or all(w in haystack for w in words)


def gen_notes_unit(client: Any, ctx: dict, plan: dict, unit: dict, *,
                   prev_title: str | None, next_title: str | None,
                   prior_terms: list[str],
                   grounding: list[dict] | None = None) -> dict:
    """Node B for one concept: Opening → Core → Closing (three calls). IDs are
    echoed verbatim from the concept. `grounding` (optional) carries retrieved
    reference-material chunks into the Opening and Core prompts."""
    from app.services import generation_prompts as p  # lazy
    from app.schemas import notes_json_schemas as njs  # lazy
    opening = _chat_json(client, *p.build_opening_prompt(unit, ctx, plan,
                         prev_title=prev_title, next_title=next_title,
                         grounding=grounding), temperature=0.6,
                         schema=njs.OPENING_SCHEMA, schema_name="notes_opening")
    core = _chat_json(client, *p.build_core_prompt(unit, ctx, plan,
                     prior_terms=prior_terms, grounding=grounding), temperature=0.7,
                     schema=njs.CORE_SCHEMA, schema_name="notes_core")
    closing = _chat_json(client, *p.build_closing_prompt(unit, ctx,
                        prev_title=prev_title, next_title=next_title,
                        condensed_core=_condense_core(core),
                        grounding=grounding), temperature=0.5,
                        schema=njs.CLOSING_SCHEMA, schema_name="notes_closing")

    cid = unit.get("concept_id")
    for part in (opening, core, closing):
        if isinstance(part, dict):
            part["subtopic_id"] = cid
            part.pop("traceability_tag", None)  # always null / orchestrator-built
    return {"opening": opening, "core": core, "closing": closing}


def _condense_core(core: dict) -> dict:
    """A bounded summary of the Core output for the Closing prompt (consistency,
    not the limit of what the model knows)."""
    fd = _flatten_text(_get_path(core, ("core_concept", "formal_definition")))
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

    # Structured-shape conformance (advisory) — the schema asks for
    # {core, elaboration} definitions and point/step arrays; the renderer
    # tolerates legacy prose, but telemetry should count the drift.
    drift = []
    fd = _get_path(core, ("core_concept", "formal_definition"))
    if fd is not None and not (isinstance(fd, dict) and fd.get("core")):
        drift.append("formal_definition")
    for label, path in (("mental_model_analogy", ("core_concept", "mental_model_analogy")),
                        ("architecture_explanation", ("deep_dive", "architecture_and_mechanism", "explanation")),
                        ("worked_example", ("practical_understanding", "worked_example"))):
        val = _get_path(core, path)
        if isinstance(val, str) and val.strip():
            drift.append(label)
    checks.append(CheckResult(name="shape:structured", passed=not drift,
                              detail=f"legacy prose in {drift}" if drift else "",
                              blocking=False))

    # Flag conformance — required blocks present per the unit's flags.
    code_needed = flags.get("requires_code") or ct.is_coding_subject(ctx.get("subject_type_label"))
    cof = _get_path(core, ("deep_dive", "code_or_formalization")) or {}
    checks.append(CheckResult(name="flag:code_block",
                              passed=(not code_needed) or bool(cof.get("content")),
                              detail="code content required but missing" if code_needed and not cof.get("content") else ""))
    # SHOW THE OUTPUT (advisory) — running code must be paired with its result;
    # the observed failure mode is code blocks shipping with sample_output null.
    has_code = bool(cof.get("content")) and cof.get("type") in ("code", "pseudocode")
    checks.append(CheckResult(name="output:sample_shown",
                              passed=(not has_code) or bool(cof.get("sample_output")),
                              detail="code present but sample_output missing" if has_code and not cof.get("sample_output") else "",
                              blocking=False))
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
    # Token-based (same matcher as concept coverage): a verbatim-substring test
    # blocks notes that teach the item under legitimately different phrasing.
    haystack = json.dumps(core, ensure_ascii=False).casefold()
    missing = [s for s in (unit.get("scope_in") or []) if not _covered_in(haystack, s)]
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


def expand_field(client: Any, subtopic_title: str, field_name: str, original,
                 min_words: int, subject_context: str):
    """Validator-fired expansion (§10.3): rewrite one short field to its minimum,
    RETURNING THE FIELD'S ORIGINAL JSON SHAPE — a flat-string rewrite of a
    structured field would undo the strict generation schema. Counts as a
    repair attempt."""
    from app.services.generation_prompts import build_expansion_prompt  # lazy
    from app.schemas import notes_json_schemas as njs  # lazy
    current_text = _flatten_text(original)
    if isinstance(original, dict) and "core" in original:
        shape, schema = "definition", njs.EXPANSION_DEFINITION_SCHEMA
    elif isinstance(original, list):
        shape, schema = "points", njs.EXPANSION_POINTS_SCHEMA
    else:
        shape, schema = "text", njs.EXPANSION_SCHEMA
    prompt = build_expansion_prompt(subtopic_title, field_name, current_text,
                                    min_words, subject_context, shape=shape)
    data = _chat_json(client, "You expand a single notes field. Output only JSON.", prompt,
                      temperature=0.6, schema=schema, schema_name=f"notes_expansion_{shape}")
    if shape == "definition":
        return data if data.get("core") else original
    if shape == "points":
        return data.get("expanded_points") or original
    return data.get("expanded_text", current_text)


def _get_dotted(obj: dict, path: str):
    cur: Any = obj
    for key in path.split("."):
        if not isinstance(cur, dict) or key not in cur:
            return None, False
        cur = cur[key]
    return cur, True


def _set_dotted(obj: dict, path: str, value) -> bool:
    keys = path.split(".")
    cur: Any = obj
    for key in keys[:-1]:
        if not isinstance(cur, dict) or key not in cur:
            return False
        cur = cur[key]
    if not isinstance(cur, dict):
        return False
    cur[keys[-1]] = value
    return True


def critique_and_polish_unit(client: Any, unit_output: dict, unit: dict, ctx: dict) -> dict:
    """LLM quality gate: rubric-score the assembled note; one polish round rewrites
    the flagged sections in place. Returns the critique record stored on the
    artifact (scores + what was patched)."""
    from app.services import generation_prompts as p  # lazy
    from app.schemas import notes_json_schemas as njs  # lazy
    note = {k: unit_output.get(k) for k in ("opening", "core", "closing")}
    try:
        review = _chat_json(client, *p.build_notes_critic_prompt(unit, ctx, note),
                            temperature=0.2, schema=njs.CRITIC_SCHEMA,
                            schema_name="notes_critique", effort="low")
    except Exception:
        logger.warning("notes critic failed", exc_info=True)
        return {"scores": None, "polished": False, "error": "critic_failed"}

    scores = review.get("scores") or {}
    fixes = [f for f in (review.get("fixes") or [])
             if isinstance(f, dict) and f.get("path") and f.get("instruction")]
    record: dict = {"scores": scores, "polished": False, "patched_paths": []}
    total = sum(v for v in scores.values() if isinstance(v, (int, float)))
    has_zero = any(v == 0 for v in scores.values())
    # The dimensions that most predict whether a note actually teaches — a 1
    # here reads "mediocre", which is below the product's bar even when the
    # total is otherwise strong.
    weak_signal = any(scores.get(d, 2) <= 1 for d in
                      ("scenario_stakes", "teaches_not_documents", "example_diversity"))
    # Polish when genuinely below the bar — any zero, a weak total, or a
    # high-signal dimension at 1.
    if fixes and (has_zero or total < 15 or weak_signal):
        # Snapshot the pre-polish content so a net-harmful polish can be
        # reverted. Polish is done by the SAME model that generated the note,
        # so a strong model improves it (observed terra 12→17) but a weaker one
        # can degrade it (observed luna 14→13). The gate makes polish monotonic:
        # keep it only when the re-score didn't drop.
        pre_polish = copy.deepcopy({k: unit_output.get(k) for k in ("opening", "core", "closing")})
        try:
            result = _chat_json(client, *p.build_notes_polish_prompt(unit, ctx, note, fixes),
                                temperature=0.5)
            for patch in result.get("patches") or []:
                path, value = patch.get("path"), patch.get("new_value")
                if not path or value in (None, "", []):
                    continue
                old, existed = _get_dotted(note, path)
                # Only rewrite fields that already exist — a hallucinated path
                # would plant junk the renderer never reads. Shape guard: a
                # patch never changes a field's JSON shape.
                if not existed:
                    continue
                if old is not None and type(old) is not type(value):
                    continue
                if _set_dotted(note, path, value):
                    record["patched_paths"].append(path)
            record["polished"] = bool(record["patched_paths"])
        except Exception:
            logger.warning("notes polish failed", exc_info=True)
            record["error"] = "polish_failed"
        # Monotonicity gate: re-score the polished note; revert if worse.
        if record["polished"]:
            try:
                rescore = _chat_json(client, *p.build_notes_critic_prompt(unit, ctx, note),
                                     temperature=0.2, schema=njs.CRITIC_SCHEMA,
                                     schema_name="notes_critique", effort="low")
                after = rescore.get("scores") or {}
                total_after = sum(v for v in after.values() if isinstance(v, (int, float)))
                if total_after < total:
                    # Net-harmful polish — restore the pre-polish content. Because
                    # `note` shares nested objects with unit_output, reassigning
                    # the three top-level keys reverts the shipped artifact.
                    for k in ("opening", "core", "closing"):
                        unit_output[k] = pre_polish[k]
                    record["polished"] = False
                    record["polish_reverted"] = True
                    record["rejected_scores_after"] = after
                    logger.info("notes polish reverted (%d → %d)", total, total_after)
                else:
                    record["scores_after"] = after
            except Exception:
                logger.warning("notes re-critique failed", exc_info=True)
    return record


# ── Slides deck: chunked generation + deterministic gate + critic ────────────

_MERMAID_STARTS = ("graph", "flowchart", "sequenceDiagram", "stateDiagram",
                   "erDiagram", "classDiagram")


def gen_concept_slides(client: Any, unit: dict, ctx: dict, notes: dict) -> dict:
    """Generate one concept's deck in phase chunks (1–3, 4–6, 7–8): long single
    outputs decay toward the tail. Each chunk sees prior titles and the running
    example thread; slide_no is renumbered after assembly."""
    from app.services import generation_prompts as p  # lazy
    slides: list[dict] = []
    running_example: str | None = None
    prior_titles: list[str] = []
    for lo, hi in p.SLIDE_PHASE_CHUNKS:
        data = _chat_json(client, *p.build_concept_slides_chunk_prompt(
            unit, ctx, notes, phase_lo=lo, phase_hi=hi,
            running_example=running_example, prior_titles=prior_titles),
            temperature=0.5)
        chunk = [s for s in (data.get("slides") or []) if isinstance(s, dict)]
        slides.extend(chunk)
        running_example = running_example or data.get("running_example")
        prior_titles += [str(s.get("title") or "") for s in chunk]
    for i, s in enumerate(slides):
        s["slide_no"] = i + 1
    return {"concept_id": unit.get("concept_id", ""),
            "inherited_content_type": unit.get("primary_content_type", "P1"),
            "running_example": running_example, "slides": slides}


def _mermaid_lint(code: str) -> bool:
    """Cheap structural lint — full compile needs a JS runtime, but the failure
    modes we see are empty code, wrong header, or unbalanced brackets."""
    c = (code or "").strip()
    if not c.startswith(_MERMAID_STARTS):
        return False
    return all(c.count(a) == c.count(b) for a, b in (("[", "]"), ("(", ")"), ("{", "}")))


def validate_slides_deck(content: dict, unit: dict) -> ValidationResult:
    """Mechanical deck gate: count, phase order, arc endpoints, misconception
    slide, Mermaid lint, face limits, quiz MCQ format."""
    slides: list[dict] = [s for s in (content.get("slides") or []) if isinstance(s, dict)]
    checks: list[CheckResult] = []
    n = len(slides)
    checks.append(CheckResult(name="deck:count", passed=14 <= n <= 30, detail=f"{n} slides"))

    phases = [s.get("phase") for s in slides if isinstance(s.get("phase"), int)]
    checks.append(CheckResult(name="deck:phase_order",
                              passed=bool(phases) and phases == sorted(phases),
                              detail=f"phases {phases}" if phases != sorted(phases) else ""))
    checks.append(CheckResult(name="deck:opens_with_title",
                              passed=bool(slides) and slides[0].get("layout") == "statement",
                              detail="" if slides and slides[0].get("layout") == "statement"
                              else f"first layout={slides[0].get('layout') if slides else None}"))
    checks.append(CheckResult(name="deck:ends_with_assignment",
                              passed=bool(slides) and slides[-1].get("role") == "assignment",
                              detail="" if slides and slides[-1].get("role") == "assignment"
                              else f"last role={slides[-1].get('role') if slides else None}"))
    checks.append(CheckResult(name="deck:myth_reality",
                              passed=any(s.get("layout") == "myth_reality" for s in slides),
                              detail="no misconception slide" if not any(
                                  s.get("layout") == "myth_reality" for s in slides) else ""))

    bad_mermaid = [s.get("slide_no") for s in slides
                   if str((s.get("visual") or {}).get("type") or "").startswith("mermaid")
                   and not _mermaid_lint((s.get("visual") or {}).get("mermaid_code") or "")]
    checks.append(CheckResult(name="deck:mermaid_lint", passed=not bad_mermaid,
                              detail=f"slides {bad_mermaid}" if bad_mermaid else ""))

    # Face limits — 20-word tolerance over the prompt's 16-word rule. Quiz,
    # practice and assignment slides legitimately need more bullets (question +
    # option format); they get a higher cap.
    def _cap(s: dict) -> int:
        return 12 if s.get("role") in ("quiz", "practice", "assignment") else 7
    over = [s.get("slide_no") for s in slides
            if len([b for b in (s.get("body_blocks") or []) if isinstance(b, str)]) > _cap(s)
            or any(len(str(b).split()) > 20 for b in (s.get("body_blocks") or []))]
    checks.append(CheckResult(name="deck:face_limits", passed=not over,
                              detail=f"slides {over}" if over else "", blocking=False))

    # Role coverage — the arc's required slides must exist; code concepts (P2/P5)
    # must carry an implementation slide. Placeholder leaks fail hard.
    roles = {s.get("role") for s in slides}
    required = {"definition", "terminology", "practice", "quiz", "summary", "assignment"}
    missing = sorted(required - roles)
    checks.append(CheckResult(name="deck:role_coverage", passed=not missing,
                              detail=f"missing {missing}" if missing else ""))
    if unit.get("primary_content_type") in ("P2", "P5"):
        checks.append(CheckResult(name="deck:code_slides",
                                  passed="code" in roles or "syntax" in roles,
                                  detail="" if ("code" in roles or "syntax" in roles)
                                  else "P2/P5 concept without a code slide"))
    leaked = [s.get("slide_no") for s in slides
              if "program ·" in str(s.get("takeaway") or "").lower()]
    checks.append(CheckResult(name="deck:placeholder_leak", passed=not leaked,
                              detail=f"slides {leaked}" if leaked else ""))

    # Quiz slide (7.3): MCQ options must be their own "A)".."D)" bullets.
    quiz = [s for s in slides if s.get("role") == "quiz"
            and "answer" not in str(s.get("title") or "").lower()]
    quiz_ok = True
    for s in quiz:
        bullets = [str(b).strip() for b in (s.get("body_blocks") or [])]
        has_mcq = any(re.match(r"^Q\d+\.", b) and b.rstrip().endswith("?") for b in bullets)
        options = [b for b in bullets if re.match(r"^[A-D]\)", b)]
        if has_mcq and len(options) < 4:
            quiz_ok = False
    checks.append(CheckResult(name="deck:quiz_mcq_format", passed=quiz_ok,
                              detail="MCQ options must be separate A)–D) bullets" if not quiz_ok else ""))
    return ValidationResult(all_pass=all(c.passed for c in checks if c.blocking), checks=checks)


def critique_and_polish_deck(client: Any, content: dict, unit: dict, ctx: dict) -> dict:
    """LLM deck gate mirroring the notes critic: rubric scores + one polish round
    replacing flagged slides in place."""
    from app.services import generation_prompts as p  # lazy
    try:
        review = _chat_json(client, *p.build_deck_critic_prompt(unit, ctx, content),
                            temperature=0.2, effort="low")
    except Exception:
        logger.warning("deck critic failed", exc_info=True)
        return {"scores": None, "polished": False, "error": "critic_failed"}

    scores = review.get("scores") or {}
    fixes = [f for f in (review.get("fixes") or [])
             if isinstance(f, dict) and f.get("slide_no") and f.get("instruction")]
    record: dict = {"scores": scores, "polished": False, "patched_slides": []}
    total = sum(v for v in scores.values() if isinstance(v, (int, float)))
    has_zero = any(v == 0 for v in scores.values())
    # High-signal deck dimensions: a 1 on any of these means a deck a professor
    # can't comfortably teach from, regardless of the total.
    weak_signal = any(scores.get(d, 2) <= 1 for d in
                      ("speaker_scripts", "running_example", "phase_completeness"))
    if fixes and (has_zero or total < 15 or weak_signal):
        pre_polish_slides = copy.deepcopy(content.get("slides") or [])
        try:
            result = _chat_json(client, *p.build_deck_polish_prompt(unit, ctx, content, fixes),
                                temperature=0.5)
            by_no = {s.get("slide_no"): i for i, s in enumerate(content.get("slides") or [])}
            for patch in result.get("patches") or []:
                no, new_slide = patch.get("slide_no"), patch.get("new_slide")
                # Shape guard: replacement must be a real slide for an existing slot.
                if no not in by_no or not isinstance(new_slide, dict) \
                        or not new_slide.get("title") or not new_slide.get("layout"):
                    continue
                new_slide["slide_no"] = no
                content["slides"][by_no[no]] = new_slide
                record["patched_slides"].append(no)
            record["polished"] = bool(record["patched_slides"])
        except Exception:
            logger.warning("deck polish failed", exc_info=True)
            record["error"] = "polish_failed"
        # Monotonicity gate (same rationale as the notes polish): re-score and
        # revert a polish that lowered the total.
        if record["polished"]:
            try:
                rescore = _chat_json(client, *p.build_deck_critic_prompt(unit, ctx, content),
                                     temperature=0.2, effort="low")
                after = rescore.get("scores") or {}
                total_after = sum(v for v in after.values() if isinstance(v, (int, float)))
                if total_after < total:
                    content["slides"] = pre_polish_slides
                    record["polished"] = False
                    record["polish_reverted"] = True
                    record["rejected_scores_after"] = after
                    logger.info("deck polish reverted (%d → %d)", total, total_after)
                else:
                    record["scores_after"] = after
            except Exception:
                logger.warning("deck re-critique failed", exc_info=True)
    return record


# ── Quiz: deterministic normalization + gate (mirrors the notes/deck gates) ───

_QUIZ_LETTERS = ("A", "B", "C", "D")


def normalize_quiz(content: dict) -> dict:
    """Deterministic repairs the orchestrator owns: MAQ answers deduped/sorted
    (the prompt asks for alphabetical order but the model drifts), true/false
    options nulled, ids resequenced."""
    for i, q in enumerate((content.get("questions") or []), 1):
        if not isinstance(q, dict):
            continue
        q["id"] = i
        if q.get("type") == "maq" and isinstance(q.get("answer"), list):
            q["answer"] = sorted({str(a).strip().upper()[:1] for a in q["answer"]
                                  if str(a).strip()})
        if q.get("type") == "true_false":
            q["options"] = None
    return content


def _quiz_correct_texts(q: dict) -> list[str]:
    """The text of the correct option(s), labels stripped — for hint-leak checks."""
    options = q.get("options") or []
    by_letter = {}
    for o in options:
        m = re.match(r"^\s*([A-D])\)\s*(.+)$", str(o))
        if m:
            by_letter[m.group(1)] = m.group(2).strip()
    ans = q.get("answer")
    letters = ans if isinstance(ans, list) else [ans]
    return [by_letter[l] for l in letters if l in by_letter]


def validate_quiz(content: dict, unit: dict) -> ValidationResult:
    """Mechanical quiz gate: every rule the prompt states that code can check —
    structural answer formats (blocking), Bloom ceiling (blocking), and the
    quality heuristics (counts, answer balance, duplicate stems, hint leaks)
    as non-blocking telemetry."""
    checks: list[CheckResult] = []
    qs = [q for q in (content.get("questions") or []) if isinstance(q, dict)]

    checks.append(CheckResult(name="quiz:nonempty", passed=bool(qs),
                              detail=f"{len(qs)} questions"))
    checks.append(CheckResult(name="quiz:count_band", passed=10 <= len(qs) <= 18,
                              detail=f"{len(qs)} questions (target 10-18)", blocking=False))

    # Structural answer-format rules per type.
    bad_format = []
    for q in qs:
        t, opts, ans = q.get("type"), q.get("options"), q.get("answer")
        ok = bool(q.get("question")) and bool(q.get("explanation"))
        if t == "mcq":
            ok = ok and isinstance(opts, list) and len(opts) == 4 \
                and isinstance(ans, str) and ans in _QUIZ_LETTERS
        elif t == "maq":
            ok = ok and isinstance(opts, list) and len(opts) == 4 \
                and isinstance(ans, list) and 2 <= len(ans) <= 3 \
                and all(a in _QUIZ_LETTERS for a in ans)
        elif t == "true_false":
            ok = ok and ans in ("True", "False")
        else:
            ok = False
        if not ok:
            bad_format.append(q.get("id"))
    checks.append(CheckResult(name="quiz:answer_format", passed=not bad_format,
                              detail=f"malformed questions: {bad_format}" if bad_format else ""))

    # Bloom ceiling — no item above the concept's ceiling.
    ceiling = ct.bloom_rank(unit.get("bloom_ceiling", "L3"))
    over = [q.get("id") for q in qs
            if ct.bloom_rank(q.get("bloom_level", "L1")) > ceiling]
    checks.append(CheckResult(name="quiz:bloom_ceiling", passed=not over,
                              detail=f"items above ceiling: {over}" if over else ""))

    # Duplicate stems — the prompt forbids testing the same fact twice.
    stems = [re.sub(r"\s+", " ", str(q.get("question", ""))).casefold() for q in qs]
    dups = len(stems) - len(set(stems))
    checks.append(CheckResult(name="quiz:duplicate_stems", passed=dups == 0,
                              detail=f"{dups} duplicated stems" if dups else "", blocking=False))

    # Answer-letter balance across MCQs (prompt: no letter > ~35%).
    mcq_answers = [q.get("answer") for q in qs if q.get("type") == "mcq"]
    if len(mcq_answers) >= 4:
        from collections import Counter
        top = Counter(mcq_answers).most_common(1)[0]
        checks.append(CheckResult(name="quiz:answer_balance",
                                  passed=top[1] / len(mcq_answers) <= 0.5,
                                  detail=f"letter {top[0]} correct {top[1]}/{len(mcq_answers)} times",
                                  blocking=False))

    # True/False balance (prompt: roughly half and half).
    tf = [q.get("answer") for q in qs if q.get("type") == "true_false"]
    if len(tf) >= 3:
        trues = sum(1 for a in tf if a == "True")
        checks.append(CheckResult(name="quiz:tf_balance",
                                  passed=0 < trues < len(tf),
                                  detail=f"{trues}/{len(tf)} True", blocking=False))

    # Hint leak — the hint must never contain the answer.
    leaks = []
    for q in qs:
        hint = str(q.get("hint") or "").casefold()
        if not hint:
            continue
        for correct in _quiz_correct_texts(q):
            if len(correct) >= 4 and correct.casefold() in hint:
                leaks.append(q.get("id"))
                break
    checks.append(CheckResult(name="quiz:hint_leak", passed=not leaks,
                              detail=f"hints containing the answer: {leaks}" if leaks else "",
                              blocking=False))

    return ValidationResult(all_pass=all(c.passed for c in checks if c.blocking), checks=checks)


# ── Assignment: deterministic normalization + gate ────────────────────────────

def validate_and_fix_assignment(content: dict, plan: dict) -> ValidationResult:
    """Mechanical assignment gate with orchestrator-owned repairs: total_marks
    is derived from the task marks and the rubric is rescaled to sum exactly to
    it (same normalization the plan weights get) — the prompt-only 'sums
    EXACTLY' rule demonstrably drifts. Subtopic coverage is telemetry."""
    checks: list[CheckResult] = []
    tasks = [t for t in (content.get("tasks") or []) if isinstance(t, dict)]
    rubric = [r for r in (content.get("rubric") or []) if isinstance(r, dict)]

    checks.append(CheckResult(name="assignment:has_tasks", passed=bool(tasks),
                              detail=f"{len(tasks)} tasks"))

    marks_sum = sum(int(t.get("marks") or 0) for t in tasks)
    if marks_sum > 0 and content.get("total_marks") != marks_sum:
        content["total_marks"] = marks_sum   # tasks are the source of truth
    checks.append(CheckResult(name="assignment:marks_reconciled", passed=marks_sum > 0,
                              detail=f"task marks sum {marks_sum}"))

    rubric_sum = sum(int(r.get("points") or 0) for r in rubric)
    if rubric and marks_sum > 0 and rubric_sum > 0 and rubric_sum != marks_sum:
        scaled = [round(int(r.get("points") or 0) * marks_sum / rubric_sum) for r in rubric]
        scaled[-1] += marks_sum - sum(scaled)
        for r, s in zip(rubric, scaled):
            r["points"] = s
        rubric_sum = marks_sum
    checks.append(CheckResult(name="assignment:rubric_sum",
                              passed=not rubric or rubric_sum == marks_sum,
                              detail=f"rubric {rubric_sum} vs total {marks_sum}"))

    # Every subtopic exercised by ≥1 task (prompt rule; token-matched).
    concept_names = [c.get("concept_name", "") for c in
                     (plan.get("concept_inventory") or []) if isinstance(c, dict)]
    task_text = json.dumps([{k: t.get(k) for k in ("title", "scenario", "prompt", "subtopics")}
                            for t in tasks], ensure_ascii=False).casefold()
    untouched = [n for n in concept_names if n and not _covered_in(task_text, n)]
    checks.append(CheckResult(name="assignment:subtopic_coverage", passed=not untouched,
                              detail=f"subtopics no task exercises: {untouched}" if untouched else "",
                              blocking=False))

    return ValidationResult(all_pass=all(c.passed for c in checks if c.blocking), checks=checks)


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
            expanded = expand_field(client, unit.get("concept_name", ""), field,
                                    _get_path(core, path), mins[field], subject_context)
            _set_path(core, path, expanded)
        attempts += 1
        result = validate_notes_unit(unit_output, unit, ctx)

    # Concept-coverage guarantee (subtopic-level generation): every concept the
    # plan bundled into this subtopic must actually be taught. Loose token match
    # (all significant words of the concept name appear somewhere in the core
    # JSON); one LLM repair extends the mechanism for anything missing.
    concepts = [c for c in (unit.get("concepts_covered") or [])
                if isinstance(c, str) and c.strip()]
    if len(concepts) > 1 and client is not None:
        def _uncovered(core_obj) -> list[str]:
            text = json.dumps(core_obj, ensure_ascii=False).casefold()
            return [cname for cname in concepts if not _covered_in(text, cname)]

        core = unit_output.get("core", {})
        missing = _uncovered(core)
        if missing:
            try:
                from app.services.generation_prompts import build_concept_coverage_prompt
                current = _flatten_text(_get_path(core, _NOTES_FIELD_PATHS["architecture_and_mechanism"]))
                r = _chat_json(client, "You are an expert educator. Output ONLY valid JSON.",
                               build_concept_coverage_prompt(unit.get("concept_name", ""), missing, current),
                               temperature=0.4)
                fixed = (r.get("expanded_text") or "").strip()
                if fixed:
                    _set_path(core, _NOTES_FIELD_PATHS["architecture_and_mechanism"], fixed)
                still = _uncovered(core)
                if still:
                    logger.warning("concept coverage still incomplete after repair: %s", still)
            except Exception:
                logger.warning("concept coverage repair failed", exc_info=True)
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

# The legacy topic-level gen_slides was retired: it bypassed the deck
# validators/critic and contradicted the concept-deck face limits. Decks are
# generated per concept (gen_concept_slides) in the interactive studio.


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


# ── Material grounding (Phase 1) ──────────────────────────────────────────────
# Optional: when materials are attached to the topic/course, prompts carry
# retrieved excerpts. No materials attached ⇒ prompts are byte-identical to the
# ungrounded pipeline.

def _grounding_tiers(db, job_id, course_id: str, topic_id: str) -> dict[str, str]:
    """material_id → tier for this generation action. A non-empty material_ids
    list on the job (the faculty's explicit pick at job creation) restricts the
    set; otherwise whatever is currently attached grounds the prompts."""
    from app.services import material_service as ms  # lazy
    only = None
    if job_id:
        mids = _row(db, "generation_jobs", job_id).get("material_ids")
        if isinstance(mids, list) and mids:
            only = mids
    return ms.resolve_topic_materials(db, topic_id, course_id, only_ids=only)


def _concept_query_terms(plan: dict, unit: dict) -> list[str]:
    """Retrieval query for one concept: name + coverage checklist + scope_in +
    the statements of the TLOs it serves."""
    tlo_by_id = {t.get("tlo_id"): t for t in plan.get("tlo_set", []) or []}
    terms = [unit.get("concept_name", "")]
    terms += list(unit.get("concepts_covered") or [])
    terms += list(unit.get("scope_in") or [])
    terms += [str((tlo_by_id.get(r) or {}).get("statement", ""))
              for r in (unit.get("serves_tlos") or [])]
    return [t for t in terms if t]


def _grounded_stamp(db, tier_map: dict[str, str],
                    chunks: list[dict] | None = None) -> list[dict]:
    """Provenance for grounded artifacts: which materials (by content_hash) and
    which chunks fed the prompt. Orchestrator-written, excluded from canonical
    hashing (_STAMP_FIELDS), never round-tripped through the model."""
    used = {c["material_id"] for c in chunks} if chunks is not None else set(tier_map)
    if not used:
        return []
    rows = (db.table("materials").select("id,content_hash")
            .in_("id", list(used)).execute().data or [])
    by_id = {r["id"]: r.get("content_hash") for r in rows}
    out = []
    for mid in sorted(used):
        entry = {"material_id": mid, "content_hash": by_id.get(mid)}
        if chunks is not None:
            entry["chunk_ids"] = [c["chunk_id"] for c in chunks
                                  if c["material_id"] == mid]
        out.append(entry)
    return out


def grounding_check(content: Any, chunks: list[dict]) -> CheckResult:
    """Non-blocking heuristic (grounding:material_used): the share of the
    injected material's distinctive terms that surface in the generated
    artifact. Logged for telemetry; never fails a gate."""
    from collections import Counter
    from app.services.material_service import _STOP  # shared stop set
    text = json.dumps(content, ensure_ascii=False).casefold()
    counter: Counter = Counter()
    for c in chunks:
        counter.update(w for w in re.findall(r"[a-z0-9]{4,}", c["text"].casefold())
                       if w not in _STOP)
    key_terms = [w for w, _ in counter.most_common(20)]
    if not key_terms:
        return CheckResult(name="grounding:material_used", passed=True,
                           detail="no distinctive material terms", blocking=False)
    hit = sum(1 for w in key_terms if w in text) / len(key_terms)
    return CheckResult(name="grounding:material_used", passed=hit >= 0.4,
                       detail=f"{hit:.0%} of material key terms appear in the artifact",
                       blocking=False)


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
    meter_reset()

    client = _openai_client()
    if client is None:
        _set_job(db, job_id, status="failed", phase="error",
                 error_msg="OPENAI_API_KEY not configured — cannot generate Topic Plan.")
        return

    ctx = _load_topic_context(db, course_id, topic_id)

    # Optional grounding: a compact outline of the attached materials steers
    # the concept inventory toward the faculty's reference (Node A).
    tier_map = _grounding_tiers(db, job_id, course_id, topic_id)
    if tier_map:
        from app.services import material_service as ms
        outline = ms.build_outline(db, tier_map)
        if outline:
            ctx = {**ctx, "grounding_outline": outline}

    plan: dict = {}
    result: ValidationResult | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            plan = ingest_topic_plan(gen_topic_plan(client, ctx))
            plan = repair_plan_alignment(client, plan)
        except Exception as e:
            logger.warning("topic plan attempt %d parse/gen failed: %s", attempt, e)
            continue
        result = validate_topic_plan(plan, credits=ctx.get("credits"))
        log_check_outcomes(job_id, "topic_plan", result, db=db)   # telemetry from day one (§6)
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
    if tier_map:
        plan["grounded_in"] = _grounded_stamp(db, tier_map)
    p_tok, c_tok, cost = meter_read()
    _upsert_artifact(db, job_id, topic_id, "topic_plan", plan,
                     gate_type="validate", review_status="validated",
                     validation={"all_pass": True, "failures": []},
                     artifact_version=plan["front_matter"]["topic_plan_version"],
                     content_hash=plan["front_matter"]["scope_hash"],
                     token_count=p_tok + c_tok, cost_usd=cost)
    # Interactive studio: the pipeline STOPS at a validated plan. Every artifact
    # after this is generated by an explicit user action (no auto fan-out).
    _add_job_cost(db, job_id, p_tok + c_tok, cost)
    _set_job(db, job_id, status="done", phase="plan_ready",
             est_cost_usd=estimate_topic_cost(plan, grounded=bool(tier_map)))


def estimate_topic_cost(plan: dict, grounded: bool = False) -> float:
    """Upfront estimate: plan + per-concept (notes+slides+quiz) + topic artifacts.
    Grounded jobs pay ~GROUNDING_TOTAL_BUDGET_TOKENS extra prompt tokens on each
    grounded node call (plan + three notes calls per concept)."""
    n = len(plan.get("concept_inventory", []) or [])
    per_concept = sum(ct.estimate_artifact_cost(t) for t in ("student_notes", "slides", "quiz"))
    topic_arts = sum(ct.estimate_artifact_cost(t)
                     for t in ("summary", "assignment", "faculty_diagnostic", "flashcards"))
    total = ct.estimate_artifact_cost("topic_plan") + n * per_concept + topic_arts
    if grounded:
        from app.services.material_service import GROUNDING_TOTAL_BUDGET_TOKENS
        total += ct.usd_cost(GROUNDING_TOTAL_BUDGET_TOKENS * (1 + 3 * n), 0)
    return round(total, 4)


def _add_job_cost(db, job_id: str, tokens: int, cost: float) -> None:
    """Increment the job's running token/cost totals."""
    j = _row(db, "generation_jobs", job_id)
    _set_job(db, job_id,
             token_count=(j.get("token_count") or 0) + tokens,
             cost_usd=round(float(j.get("cost_usd") or 0) + cost, 4))


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
        log_check_outcomes(job_id, f"notes:{unit.get('concept_id')}", v, db=db)
        critique = critique_and_polish_unit(client, out, unit, ctx)
        if critique.get("polished"):
            # Polish rewrites fields freely and can shrink them below the word
            # minimums — re-run the mechanical gate so validation describes the
            # note that ships, and expansion repairs any shrunk field.
            v = validate_and_expand_unit(client, out, unit, ctx)
            log_check_outcomes(job_id, f"notes:{unit.get('concept_id')}:post_polish", v, db=db)
        prior_terms = prior_terms + list((out.get("core", {}) or {}).get("new_terms_introduced", []) or [])
        unit_records.append({
            "unit_ref": unit.get("concept_id"), **out, "unit_hash": canonical_hash(out),
            "critique": critique,
            "approval": {"status": "pending" if v.all_pass else "error", "reviewer": None},
            "validation": {"all_pass": v.all_pass, "failures": [c.model_dump() for c in v.failures]},
        })

    _set_job(db, job_id, phase="unit_validate")
    content = {"units": unit_records,
               "topic_plan_version": plan["front_matter"]["topic_plan_version"]}
    art_id = _upsert_artifact(db, job_id, topic_id, "student_notes", content,
                              gate_type="approve", review_status="pending")

    # Clear any per-unit rows from a prior run (the artifact row is reused).
    db.table("artifact_units").delete().eq("artifact_id", art_id).execute()

    for rec in unit_records:
        unit = next((c for c in concepts if c.get("concept_id") == rec["unit_ref"]), {})
        db.table("artifact_units").insert({
            "id": str(uuid.uuid4()), "artifact_id": art_id, "concept_id": rec["unit_ref"],
            "content_type": unit.get("primary_content_type"), "flags": unit.get("flags", {}),
            "unit_hash": rec.get("unit_hash"), "approval_status": rec["approval"]["status"],
        }).execute()

    # Pause at the only human content gate; driven from DB state (restart-safe).
    _set_job(db, job_id, phase="unit_approve")


def log_check_outcomes(job_id: str, node: str, result: ValidationResult, db=None) -> None:
    """Per-check pass-rate telemetry (§6). A check that fails systematically is a
    prompt defect, not generation noise. When `db` is given the outcomes are
    also persisted to validator_outcomes (best-effort — telemetry never blocks
    generation) so pass rates can be aggregated per prompt version."""
    for c in result.checks:
        logger.info("validator job=%s node=%s check=%s passed=%s %s",
                    job_id, node, c.name, c.passed, c.detail)
    if db is None or not result.checks:
        return
    try:
        db.table("validator_outcomes").insert([{
            "id": str(uuid.uuid4()), "job_id": job_id, "node": node,
            "check_name": c.name, "passed": c.passed, "blocking": c.blocking,
            "detail": (c.detail or "")[:500], "prompt_version": PROMPT_VERSION,
            "model": _model(),  # attributes pass rates to the generating model (A/B canary)
        } for c in result.checks]).execute()
    except Exception:  # pragma: no cover - table may not exist yet
        logger.debug("validator telemetry persist failed", exc_info=True)


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

    # Slides: the legacy topic-level deck was retired (no validators/critic,
    # stale face limits). Fan-out stores a pointer placeholder; real decks are
    # generated per concept in the studio with the full quality gates.
    _upsert_artifact(db, job_id, topic_id, "slides",
                     {**placeholder_artifact("slides", notes),
                      "note": "Generated per concept in the studio (concept decks)."},
                     gate_type="structural_review", review_status="pending",
                     derived_from_version=nv, derived_from_hash=nh)

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
    if artifact_type == "student_notes" and payload.decision in ("approve", "revise"):
        # unit_id is the concept_id (C1, C2…) the reviewer sees — resolve it to
        # this job's student_notes artifact_units row.
        notes_id = _artifact_id(db, job_id, "student_notes")
        new_unit_status = "approved" if payload.decision == "approve" else "revise_requested"
        patch = {"approval_status": new_unit_status}
        if payload.decision == "approve":
            patch["approved_by"] = user["id"]
        db.table("artifact_units").update(patch) \
            .eq("artifact_id", notes_id).eq("concept_id", payload.unit_id).execute()

        if payload.decision == "revise":
            return {"decision": "revise", "unit_id": payload.unit_id, "status": "revise_requested"}

        remaining = (
            db.table("artifact_units").select("concept_id")
            .eq("artifact_id", notes_id).neq("approval_status", "approved").execute()
        )
        if not remaining.data:
            # Last unit approved → assemble Notes + kick off the parallel fan-out.
            _set_job(db, job_id, phase="notes_assembled")
            enqueue_fanout(job_id)
        return {"decision": "approve", "unit_id": payload.unit_id,
                "all_units_approved": not remaining.data}

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
    """Insert or update the single artifact of this type for the TOPIC; returns
    its id. Artifacts are unique per (topic_id, type), so a re-run under a new
    job must overwrite the existing row (repointing job_id) rather than insert a
    duplicate — otherwise the unique constraint aborts the job."""
    row = {"job_id": job_id, "topic_id": topic_id, "type": artifact_type,
           "content": content, **fields}
    existing = (
        db.table("artifacts").select("id").eq("topic_id", topic_id)
        .eq("type", artifact_type).limit(1).execute()
    )
    if existing.data:
        art_id = existing.data[0]["id"]
        db.table("artifacts").update(row).eq("id", art_id).execute()
        return art_id
    new_id = str(uuid.uuid4())
    db.table("artifacts").insert({"id": new_id, **row}).execute()
    return new_id


_BLOOM_INT_TO_LABEL = {1: "Remember", 2: "Understand", 3: "Apply",
                       4: "Analyze", 5: "Evaluate", 6: "Create"}


def _co_context(co_row: dict) -> dict:
    """Shape a course_outcomes row into the operative_co block the prompts expect.
    bloom_level may be an int (1–6) or a text label depending on the write path."""
    bloom = co_row.get("bloom_label")
    raw = co_row.get("bloom_level")
    if not bloom:
        if isinstance(raw, int) or (isinstance(raw, str) and raw.isdigit()):
            bloom = _BLOOM_INT_TO_LABEL.get(int(raw), "Understand")
        else:
            bloom = raw or "Understand"
    return {"co_id": f"CO{co_row.get('co_number')}",
            "text": co_row.get("text") or co_row.get("description", ""),
            "bloom_level": bloom}


def _load_topic_context(db, course_id: str, topic_id: str) -> dict:
    """Assemble the TopicContext (§5.1) from the finalized course tables
    (§3.6). Reads both column vocabularies: the 01-schema names
    (contact_hours/sem/co_id) and the app-compat names (hours/semester)."""
    course = _row(db, "courses", course_id)
    topic = _row(db, "topics", topic_id)
    unit = _row(db, "units", topic.get("unit_id")) if topic.get("unit_id") else {}
    subtopics = db.table("subtopics").select("title").eq("topic_id", topic_id).execute()

    operative_co = None
    if topic.get("co_id"):
        operative_co = _co_context(_row(db, "course_outcomes", topic["co_id"]))
    else:
        # App-created topics carry no co_id — fall back to the co_number ==
        # unit_number heuristic the courses API uses, else the first CO.
        cos = db.table("course_outcomes").select("*").eq("course_id", course_id) \
            .order("co_number").execute().data or []
        if cos:
            unit_no = unit.get("unit_number")
            unit_no = int(unit_no) if str(unit_no).isdigit() else None
            match = next((c for c in cos if c.get("co_number") == unit_no), cos[0])
            operative_co = _co_context(match)

    sem = course.get("sem")
    if not sem:
        digits = "".join(ch for ch in str(course.get("semester") or "") if ch.isdigit())
        sem = int(digits) if digits else None
    academic_year = math.ceil(int(sem) / 2) if sem else 2
    unit_hours = unit.get("contact_hours") or unit.get("hours") or 0
    topic_hours = float(topic.get("contact_hours") or 0) or max(round(unit_hours / 3, 1), 2)

    # Industry skills from the committed upload's pipeline run (P3) — the notes
    # closing prompt uses them to ground industry_relevance in the course's own
    # skill mapping instead of generic guesses.
    industry_skills: list[str] = []
    try:
        ups = (db.table("uploads").select("extraction_result")
               .eq("committed_to_course", course_id).limit(1).execute().data or [])
        if ups:
            er = ups[0].get("extraction_result") or {}
            if isinstance(er, str):
                er = json.loads(er)
            p3 = (er.get("pipeline_result") or {}).get("p3_industry_skills") or {}
            industry_skills = [s.get("skill_name") for s in (p3.get("industry_skills") or [])
                               if s.get("skill_name")]
    except Exception:
        logger.warning("industry skills lookup failed for course %s", course_id, exc_info=True)

    return {
        "industry_skills": industry_skills,
        "course_code": course.get("code", ""),
        "course_name": course.get("name", ""),
        "regulation": course.get("regulation", ""),
        "academic_year": academic_year,
        "credits": course.get("credits", 3),
        "lab_flag": course.get("lab_flag", False),
        # No dedicated subject-type config in the POC schema — derive from `major`.
        "subject_domain": course.get("major") or course.get("program") or "",
        "subject_type_key": course.get("major", ""),
        "subject_type_label": course.get("major", ""),
        "audience_level": "UG",
        "unit_number": unit.get("unit_number", ""),
        "unit_title": unit.get("title", ""),
        "unit_total_hours": unit_hours,
        "topic_id": topic_id,
        "topic_number": str(topic.get("sort_order", "")),
        "topic_title": topic.get("title", ""),
        "topic_hours_allocated": topic_hours,
        "subtopics": [s.get("title") for s in (subtopics.data or [])],
        "operative_co": operative_co,
        "supporting_cos": [],
        "prerequisites": [],
        "reference_books": [],
    }


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


# ══════════════════════════════════════════════════════════════════════════════
# Interactive studio — plan edits + on-demand concept/topic artifacts
# ══════════════════════════════════════════════════════════════════════════════

_CONCEPT_TYPES = ("student_notes", "slides", "quiz")
_TOPIC_ARTIFACT_TYPES = ("summary", "assignment", "faculty_diagnostic", "flashcards")
_EDITABLE_CONCEPT_FIELDS = ("primary_content_type", "secondary_blocks", "flags",
                            "flag_overrides", "complexity_tier", "scope_in", "scope_out")


def _topic_plan_content(db, topic_id: str) -> dict:
    r = db.table("artifacts").select("content").eq("topic_id", topic_id) \
        .eq("type", "topic_plan").limit(1).execute()
    return (r.data[0]["content"] if r.data else {}) or {}


def save_plan_edits(db, topic_id: str, concept_patches: list[dict]) -> dict:
    """Apply faculty edits (content type, secondary blocks, flags, complexity,
    scope) to the stored Topic Plan concepts so later per-concept generation
    reads them. Recomputes budgets when the complexity tier changed."""
    plan = _topic_plan_content(db, topic_id)
    by_id = {p.get("concept_id"): p for p in concept_patches}
    for c in plan.get("concept_inventory", []) or []:
        patch = by_id.get(c.get("concept_id"))
        if not patch:
            continue
        for f in _EDITABLE_CONCEPT_FIELDS:
            if f in patch and patch[f] is not None:
                c[f] = patch[f]
        # keep the derived generation flags authoritative but honor explicit toggles
        c["budgets"] = ct.resolve_budgets(int(c.get("time_minutes", 0) or 0),
                                          c.get("complexity_tier", "moderate"))
    art_id = _artifact_id_by_topic(db, topic_id, "topic_plan")
    if art_id:
        db.table("artifacts").update({"content": plan}).eq("id", art_id).execute()
    return plan


def _artifact_id_by_topic(db, topic_id: str, artifact_type: str) -> str | None:
    r = db.table("artifacts").select("id").eq("topic_id", topic_id) \
        .eq("type", artifact_type).limit(1).execute()
    return r.data[0]["id"] if r.data else None


def _concept_row(db, topic_id: str, concept_id: str, artifact_type: str) -> dict:
    r = (db.table("concept_artifacts").select("*").eq("topic_id", topic_id)
         .eq("concept_id", concept_id).eq("artifact_type", artifact_type).limit(1).execute())
    return r.data[0] if r.data else {}


# Concept generation runs in an in-process daemon thread (enqueue_concept_artifact).
# If that process dies mid-run — a crash, a deploy, or a uvicorn --reload restart in
# dev — the row is orphaned in status="generating" with no worker left to finish it,
# and the studio polls it forever. A healthy per-concept run finishes in ~2-4 min, so
# any "generating" row untouched for longer than this is unrecoverable and is flipped
# to "error" so the UI stops looping and offers a retry.
_GENERATION_STALE_AFTER_SEC = 600


def reconcile_stale_generations(db, concept_artifacts: list[dict]) -> list[dict]:
    """Flip orphaned 'generating' rows (no live worker) to 'error' in place and
    best-effort in the DB. Idempotent: already-errored rows are untouched. Rows
    must carry `updated_at`; rows without it are left alone."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    for row in concept_artifacts:
        if row.get("status") != "generating":
            continue
        ts = row.get("updated_at")
        if not ts:
            continue
        try:
            updated = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        except ValueError:
            continue
        if (now - updated).total_seconds() < _GENERATION_STALE_AFTER_SEC:
            continue
        msg = "Generation was interrupted (server restart or crash). Please regenerate."
        row["status"] = "error"
        row["error"] = msg
        try:
            (db.table("concept_artifacts").update({"status": "error", "error": msg})
             .eq("topic_id", row.get("topic_id")).eq("concept_id", row.get("concept_id"))
             .eq("artifact_type", row.get("artifact_type")).eq("status", "generating")
             .execute())
        except Exception:  # pragma: no cover - reconciliation must never break a read
            logger.warning("stale-generation reconcile persist failed for %s/%s",
                           row.get("concept_id"), row.get("artifact_type"), exc_info=True)
    return concept_artifacts


def _upsert_concept(db, job_id, topic_id, concept_id, artifact_type, **fields) -> None:
    existing = _concept_row(db, topic_id, concept_id, artifact_type)
    fields["updated_at"] = "now()"
    fields.pop("updated_at", None)  # let DB default handle; avoid string cast issues
    # Materialize the revision-card count for student notes so Learn Home's
    # due-count never has to pull note content (see student.flashcard_count_for).
    if artifact_type == "student_notes" and isinstance(fields.get("content"), dict):
        try:
            from app.api.v1.endpoints.student import flashcard_count_for
            fields["flashcard_count"] = flashcard_count_for(fields["content"])
        except Exception:
            pass
    row = {"job_id": job_id, "topic_id": topic_id, "concept_id": concept_id,
           "artifact_type": artifact_type, **fields}
    if existing:
        db.table("concept_artifacts").update(row).eq("id", existing["id"]).execute()
    else:
        db.table("concept_artifacts").insert({"id": str(uuid.uuid4()), **row}).execute()


def _neighbors(plan: dict, concept_id: str) -> tuple[str | None, str | None]:
    concepts = plan.get("concept_inventory", []) or []
    idx = next((i for i, c in enumerate(concepts) if c.get("concept_id") == concept_id), None)
    if idx is None:
        return None, None
    prev = concepts[idx - 1].get("concept_name") if idx > 0 else None
    nxt = concepts[idx + 1].get("concept_name") if idx + 1 < len(concepts) else None
    return prev, nxt


def _prior_terms(db, topic_id: str, plan: dict, concept_id: str) -> list[str]:
    """Terms introduced by earlier concepts' generated notes (for scope-lock)."""
    order = [c.get("concept_id") for c in plan.get("concept_inventory", []) or []]
    stop = order.index(concept_id) if concept_id in order else len(order)
    terms: list[str] = []
    for cid in order[:stop]:
        nt = _concept_row(db, topic_id, cid, "student_notes").get("content") or {}
        terms += list((nt.get("core", {}) or {}).get("new_terms_introduced", []) or [])
    return terms


def enqueue_concept_artifact(job_id, topic_id, concept_id, artifact_type) -> None:
    """Generate/regenerate one concept artifact off-request; status is driven from
    the concept_artifacts row so the studio can poll."""
    def _worker():
        from app.db.supabase import get_client
        db = get_client()
        try:
            _snapshot_version(db, topic_id, concept_id, artifact_type, "pre-regenerate")
            generate_concept_artifact(db, job_id, topic_id, concept_id, artifact_type)
        except Exception as e:  # pragma: no cover - recorded on the row
            logger.exception("concept artifact %s/%s failed: %s", concept_id, artifact_type, e)
            _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                            status="error", error=f"{type(e).__name__}: {e}")
    threading.Thread(target=_worker, daemon=True).start()


def generate_concept_artifact(db, job_id, topic_id, concept_id, artifact_type) -> None:
    _upsert_concept(db, job_id, topic_id, concept_id, artifact_type, status="generating", error=None)
    client = _openai_client()
    if client is None:
        _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                        status="error", error="OPENAI_API_KEY not configured")
        return

    plan = _topic_plan_content(db, topic_id)
    unit = next((c for c in plan.get("concept_inventory", []) or []
                 if c.get("concept_id") == concept_id), None)
    if not unit:
        _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                        status="error", error="concept not found in plan")
        return

    course_id = _course_id_for_topic(db, topic_id)
    ctx = _load_topic_context(db, course_id, topic_id)
    meter_reset()

    if artifact_type == "student_notes":
        prev, nxt = _neighbors(plan, concept_id)
        grounding: list[dict] = []
        tier_map = _grounding_tiers(db, job_id, course_id, topic_id)
        if tier_map:
            from app.services import material_service as ms
            grounding = ms.retrieve_chunks(db, tier_map, _concept_query_terms(plan, unit))
        out = gen_notes_unit(client, ctx, plan, unit, prev_title=prev, next_title=nxt,
                             prior_terms=_prior_terms(db, topic_id, plan, concept_id),
                             grounding=grounding or None)
        v = validate_and_expand_unit(client, out, unit, ctx)
        log_check_outcomes(job_id, f"notes:{concept_id}", v, db=db)
        critique = critique_and_polish_unit(client, out, unit, ctx)
        if critique.get("polished"):
            # Polish can shrink fields below the word minimums — re-gate and
            # re-expand so the stored validation matches the shipped note.
            v = validate_and_expand_unit(client, out, unit, ctx)
        content = {**out, "unit_hash": canonical_hash(out),
                   "critique": critique,
                   "validation": {"all_pass": v.all_pass,
                                  "failures": [c.model_dump() for c in v.failures]}}
        if grounding:
            g = grounding_check(out, grounding)
            logger.info("validator job=%s node=notes:%s check=%s passed=%s %s",
                        job_id, concept_id, g.name, g.passed, g.detail)
            content["validation"]["grounding"] = g.model_dump()
            content["grounded_in"] = _grounded_stamp(db, tier_map, grounding)
    else:
        notes = _concept_row(db, topic_id, concept_id, "student_notes").get("content")
        if not notes:
            _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                            status="error", error="Generate this concept's Notes first.")
            return
        from app.services import generation_prompts as p
        if artifact_type == "slides":
            content = gen_concept_slides(client, unit, ctx, notes)
            dv = validate_slides_deck(content, unit)
            log_check_outcomes(job_id, f"slides:{concept_id}", dv, db=db)
            content["critique"] = critique_and_polish_deck(client, content, unit, ctx)
            content["validation"] = {"all_pass": dv.all_pass,
                                     "failures": [c.model_dump() for c in dv.failures]}
        else:
            from app.schemas import notes_json_schemas as njs  # lazy
            content = _chat_json(client, *p.build_concept_quiz_prompt(unit, ctx, notes),
                                 temperature=0.4, schema=njs.CONCEPT_QUIZ_SCHEMA,
                                 schema_name="concept_quiz")
            content = normalize_quiz(content)
            qv = validate_quiz(content, unit)
            log_check_outcomes(job_id, f"quiz:{concept_id}", qv, db=db)
            content["validation"] = {"all_pass": qv.all_pass,
                                     "failures": [c.model_dump() for c in qv.failures]}

    content["prompt_version"] = PROMPT_VERSION
    p_tok, c_tok, cost = meter_read()
    _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                    status="ready", approval_status="pending", content=content,
                    token_count=p_tok + c_tok, cost_usd=cost, error=None)
    _add_job_cost(db, job_id, p_tok + c_tok, cost)


def approve_concept_artifact(db, user, topic_id, concept_id, artifact_type) -> dict:
    _upsert_concept(db, None, topic_id, concept_id, artifact_type, approval_status="approved")
    return {"concept_id": concept_id, "artifact_type": artifact_type, "approval_status": "approved"}


# ── Version history + targeted revision (item 4) ─────────────────────────────
# A snapshot is written before every regenerate / revise / restore so faculty
# can always roll back. Snapshots are best-effort: a missing table or an empty
# artifact never blocks generation.

def _snapshot_version(db, topic_id, concept_id, artifact_type, note: str) -> None:
    try:
        row = _concept_row(db, topic_id, concept_id, artifact_type)
        if not row.get("content"):
            return
        prev = (db.table("concept_artifact_versions").select("version_no")
                .eq("topic_id", topic_id).eq("concept_id", concept_id)
                .eq("artifact_type", artifact_type)
                .order("version_no", desc=True).limit(1).execute().data or [])
        next_no = (prev[0]["version_no"] + 1) if prev else 1
        db.table("concept_artifact_versions").insert({
            "topic_id": topic_id, "concept_id": concept_id, "artifact_type": artifact_type,
            "version_no": next_no, "content": row["content"], "note": note,
        }).execute()
    except Exception:
        logger.warning("version snapshot failed for %s/%s", concept_id, artifact_type, exc_info=True)


def list_artifact_versions(db, topic_id, concept_id, artifact_type) -> list[dict]:
    try:
        return (db.table("concept_artifact_versions")
                .select("version_no, note, created_at")
                .eq("topic_id", topic_id).eq("concept_id", concept_id)
                .eq("artifact_type", artifact_type)
                .order("version_no", desc=True).execute().data or [])
    except Exception:
        return []


def restore_artifact_version(db, job_id, topic_id, concept_id, artifact_type, version_no: int) -> dict:
    v = (db.table("concept_artifact_versions").select("content")
         .eq("topic_id", topic_id).eq("concept_id", concept_id)
         .eq("artifact_type", artifact_type).eq("version_no", version_no)
         .limit(1).execute().data or [])
    if not v or not v[0].get("content"):
        raise ValueError("Version not found")
    _snapshot_version(db, topic_id, concept_id, artifact_type, f"pre-restore of v{version_no}")
    _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                    status="ready", approval_status="pending",
                    content=v[0]["content"], error=None)
    return {"restored": version_no}


def enqueue_concept_revision(job_id, topic_id, concept_id, artifact_type, instruction: str) -> None:
    """Targeted revision: apply one faculty instruction to the current artifact,
    snapshotting the outgoing content first. Off-request like generation — the
    row's status drives the studio/reader polling."""
    def _worker():
        from app.db.supabase import get_client
        db = get_client()
        try:
            revise_concept_artifact(db, job_id, topic_id, concept_id, artifact_type, instruction)
        except Exception as e:  # pragma: no cover — recorded on the row
            logger.exception("revision %s/%s failed: %s", concept_id, artifact_type, e)
            _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                            status="error", error=f"{type(e).__name__}: {e}")
    threading.Thread(target=_worker, daemon=True).start()


def revise_concept_artifact(db, job_id, topic_id, concept_id, artifact_type, instruction: str) -> None:
    row = _concept_row(db, topic_id, concept_id, artifact_type)
    current = row.get("content")
    if not current:
        _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                        status="error", error="Nothing to revise — generate this artifact first.")
        return
    client = _openai_client()
    if client is None:
        _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                        status="error", error="OPENAI_API_KEY not configured")
        return

    _snapshot_version(db, topic_id, concept_id, artifact_type, f"pre-revise: {instruction[:80]}")
    _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                    status="generating", error=None)
    meter_reset()

    from app.services.generation_prompts import build_revision_prompt  # lazy
    course_id = _course_id_for_topic(db, topic_id)
    ctx = _load_topic_context(db, course_id, topic_id)
    # Orchestrator-owned fields never round-trip through the model.
    payload = ({k: v for k, v in current.items()
                if k not in ("unit_hash", "validation", "grounded_in")}
               if artifact_type == "student_notes" else current)
    # Grounded revisions ("revise per the textbook") only apply to notes —
    # slides/quiz derive from approved notes and inherit their grounding.
    grounding = None
    if artifact_type == "student_notes":
        tier_map = _grounding_tiers(db, job_id, course_id, topic_id)
        if tier_map:
            plan = _topic_plan_content(db, topic_id)
            unit = next((c for c in plan.get("concept_inventory", []) or []
                         if c.get("concept_id") == concept_id), None)
            if unit:
                from app.services import material_service as ms
                grounding = ms.retrieve_chunks(
                    db, tier_map, _concept_query_terms(plan, unit) + [instruction]) or None
    revised = _chat_json(client, *build_revision_prompt(artifact_type, payload, instruction,
                                                        ctx, grounding=grounding),
                         temperature=0.4)
    if artifact_type == "quiz":
        revised = normalize_quiz(revised)
    if artifact_type == "student_notes":
        revised = {**revised, "unit_hash": canonical_hash(revised),
                   "validation": current.get("validation", {})}
        if grounding:
            revised["grounded_in"] = _grounded_stamp(db, tier_map, grounding)
        elif current.get("grounded_in"):
            revised["grounded_in"] = current["grounded_in"]

    p_tok, c_tok, cost = meter_read()
    _upsert_concept(db, job_id, topic_id, concept_id, artifact_type,
                    status="ready", approval_status="pending", content=revised,
                    token_count=p_tok + c_tok, cost_usd=cost, error=None)
    _add_job_cost(db, job_id, p_tok + c_tok, cost)


def enqueue_topic_artifact(job_id, topic_id, artifact_type) -> None:
    def _worker():
        from app.db.supabase import get_client
        db = get_client()
        try:
            generate_topic_artifact(db, job_id, topic_id, artifact_type)
        except Exception as e:  # pragma: no cover
            logger.exception("topic artifact %s failed: %s", artifact_type, e)
            _upsert_artifact(db, job_id, topic_id, artifact_type, {"error": str(e)},
                             review_status="error")
    threading.Thread(target=_worker, daemon=True).start()


def generate_topic_artifact(db, job_id, topic_id, artifact_type) -> None:
    _upsert_artifact(db, job_id, topic_id, artifact_type, {}, review_status="generating")
    client = _openai_client()
    if client is None:
        _upsert_artifact(db, job_id, topic_id, artifact_type, {"error": "no OPENAI_API_KEY"},
                         review_status="error")
        return
    plan = _topic_plan_content(db, topic_id)
    course_id = _course_id_for_topic(db, topic_id)
    ctx = _load_topic_context(db, course_id, topic_id)

    # Topic-level artifacts distill the WHOLE topic — every subtopic's Notes must
    # be ready, else the artifact silently omits the missing subtopics. Hard-gate:
    # collect ready notes and the concepts still missing them in one pass.
    concepts = plan.get("concept_inventory", []) or []
    if not concepts:
        _upsert_artifact(db, job_id, topic_id, artifact_type,
                         {"error": "Generate the Topic Plan and concept Notes first."},
                         review_status="error")
        return
    recs, missing = [], []
    for c in concepts:
        row = _concept_row(db, topic_id, c.get("concept_id"), "student_notes")
        if row.get("content") and row.get("status") == "ready":
            recs.append({"unit_ref": c.get("concept_id"), **row["content"]})
        else:
            missing.append(c.get("concept_name") or c.get("concept_id") or "?")
    if missing:
        detail = (f"{len(missing)} of {len(concepts)} subtopics still need Notes: "
                  + ", ".join(missing))
        _upsert_artifact(db, job_id, topic_id, artifact_type,
                         {"error": detail}, review_status="error")
        return
    notes = assemble_notes(recs, plan, ctx)

    from app.services import generation_prompts as p
    builders = {"summary": p.build_summary_prompt, "assignment": p.build_assignment_prompt,
                "faculty_diagnostic": p.build_faculty_diagnostic_prompt,
                "flashcards": p.build_flashcards_prompt}
    meter_reset()
    # Every topic artifact has a strict schema — the summary's tagged panel
    # union especially, but also the assignment/diagnostic/interview shapes the
    # renderers rely on.
    from app.schemas import notes_json_schemas as njs  # lazy
    schemas = {"summary": njs.CHEATSHEET_SCHEMA, "assignment": njs.ASSIGNMENT_SCHEMA,
               "faculty_diagnostic": njs.FACULTY_DIAGNOSTIC_SCHEMA,
               "flashcards": njs.FLASHCARDS_SCHEMA}
    content = _chat_json(client, *builders[artifact_type](ctx, plan, notes),
                         temperature=0.5, schema=schemas.get(artifact_type),
                         schema_name=f"topic_{artifact_type}")
    if artifact_type == "assignment":
        av = validate_and_fix_assignment(content, plan)
        log_check_outcomes(job_id, "assignment", av, db=db)
        content["validation"] = {"all_pass": av.all_pass,
                                 "failures": [c.model_dump() for c in av.failures]}
    content["prompt_version"] = PROMPT_VERSION
    p_tok, c_tok, cost = meter_read()
    _upsert_artifact(db, job_id, topic_id, artifact_type, content,
                     gate_type="review", review_status="ready",
                     derived_from_version=notes["topic_header"]["notes_version"],
                     derived_from_hash=notes["topic_header"]["content_hash"],
                     token_count=p_tok + c_tok, cost_usd=cost)
    _add_job_cost(db, job_id, p_tok + c_tok, cost)


_TOPIC_CONTENT_TYPES = ("summary", "assignment", "faculty_diagnostic", "flashcards")
_RUNNING_JOB = ("queued", "running")


def faculty_dashboard(db, user: dict) -> dict:
    """One-call real aggregate for the WinTeach dashboard: generation rollups,
    cost, approval gaps, live jobs, student engagement, and recent courses —
    computed with a handful of batched queries over the caller's courses."""
    role = user.get("role")
    q = db.table("courses").select(
        "id,name,code,status,semester,created_at,units(id,topics(id,title))")
    if role == "faculty":
        q = q.or_(f"faculty_id.eq.{user['id']},faculty_id.is.null")
    elif role == "admin":
        q = q.eq("institute_id", user.get("institute_id"))
    courses = q.order("created_at", desc=True).execute().data or []

    topics_of = {c["id"]: [t for u in (c.get("units") or []) for t in (u.get("topics") or [])]
                 for c in courses}
    all_tids = [t["id"] for ts in topics_of.values() for t in ts]

    plan_total: dict[str, int] = {}
    ca_by_topic: dict[str, list] = {}
    ta_ready: dict[str, int] = {}
    job_by_topic: dict[str, dict] = {}
    prog: list[dict] = []
    if all_tids:
        for a in (db.table("artifacts").select("topic_id,content")
                  .eq("type", "topic_plan").in_("topic_id", all_tids).execute().data or []):
            plan_total[a["topic_id"]] = len((a.get("content") or {}).get("concept_inventory") or [])
        for a in (db.table("artifacts").select("topic_id,review_status")
                  .in_("type", list(_TOPIC_CONTENT_TYPES)).in_("topic_id", all_tids).execute().data or []):
            if a["review_status"] == "ready":
                ta_ready[a["topic_id"]] = ta_ready.get(a["topic_id"], 0) + 1
        for c in (db.table("concept_artifacts").select("topic_id,artifact_type,status,approval_status")
                  .in_("topic_id", all_tids).execute().data or []):
            ca_by_topic.setdefault(c["topic_id"], []).append(c)
        for j in (db.table("generation_jobs").select("topic_id,status,cost_usd,created_at")
                  .in_("topic_id", all_tids).order("created_at", desc=True).execute().data or []):
            job_by_topic.setdefault(j["topic_id"], j)  # first seen = latest
        try:
            prog = (db.table("student_progress").select("user_id,artifact_type,status,quiz_score,quiz_total")
                    .in_("topic_id", all_tids).execute().data or [])
        except Exception:
            prog = []

    def topic_roll(tid: str) -> dict:
        ct = plan_total.get(tid, 0)
        cas = ca_by_topic.get(tid, [])
        ready = sum(1 for c in cas if c["status"] == "ready") + ta_ready.get(tid, 0)
        total = ct * 3 + len(_TOPIC_CONTENT_TYPES) if ct else 0
        job = job_by_topic.get(tid, {})
        return {"ct": ct, "ready": ready, "total": total,
                "job_status": job.get("status"), "cost": float(job.get("cost_usd") or 0),
                "pending_approval": sum(1 for c in cas
                                        if c["status"] == "ready" and c["approval_status"] != "approved")}

    art_ready = art_total = cost = pending_approval = 0
    t_complete = t_progress = t_notstarted = 0
    running = failed = 0
    recent = []
    # Deep-link targets for the "needs attention" actions (first match wins),
    # plus the first draft course — the studio is where retry + approve live.
    failed_target = approval_target = draft_target = None
    for c in courses:
        c_ready = c_total = c_complete = 0
        if c.get("status") == "draft" and draft_target is None:
            draft_target = {"course_id": c["id"]}
        for t in topics_of[c["id"]]:
            r = topic_roll(t["id"])
            art_ready += r["ready"]; art_total += r["total"]; cost += r["cost"]
            pending_approval += r["pending_approval"]
            c_ready += r["ready"]; c_total += r["total"]
            if r["pending_approval"] > 0 and approval_target is None:
                approval_target = {"course_id": c["id"], "topic_id": t["id"]}
            if r["job_status"] in _RUNNING_JOB:
                running += 1
            if r["job_status"] == "failed":
                failed += 1
                if failed_target is None:
                    failed_target = {"course_id": c["id"], "topic_id": t["id"]}
            if r["total"] > 0 and r["ready"] >= r["total"]:
                t_complete += 1; c_complete += 1
            elif r["ready"] > 0 or r["ct"] > 0:
                t_progress += 1
            else:
                t_notstarted += 1
        recent.append({
            "id": c["id"], "code": c.get("code"), "name": c["name"], "status": c.get("status"),
            "semester": c.get("semester"),
            "artifact_ready": c_ready, "artifact_total": c_total,
            "pct": round(c_ready / c_total * 100) if c_total else 0,
            "topics_complete": c_complete, "topics_total": len(topics_of[c["id"]]),
        })

    notes = [p for p in prog if p["artifact_type"] == "student_notes"]
    quiz = [p for p in prog if p["artifact_type"] == "quiz" and p.get("quiz_total")]
    published = sum(1 for cas in ca_by_topic.values() for c in cas
                    if c["artifact_type"] == "student_notes" and c["approval_status"] == "approved")

    return {
        "courses": {"total": len(courses),
                    "active": sum(1 for c in courses if c.get("status") == "active"),
                    "draft": sum(1 for c in courses if c.get("status") == "draft")},
        "topics": {"total": len(all_tids), "complete": t_complete,
                   "in_progress": t_progress, "not_started": t_notstarted},
        "artifacts": {"ready": art_ready, "total": art_total,
                      "pct": round(art_ready / art_total * 100) if art_total else 0},
        "pending_approval": pending_approval,
        "running": running, "failed": failed,
        "cost_usd": round(cost, 2),
        "targets": {"failed": failed_target, "approval": approval_target, "draft": draft_target},
        "students": {
            "published_lessons": published,
            "learners": len({p["user_id"] for p in prog}),
            "lessons_read": len(notes),
            "quiz_attempts": len(quiz),
            "avg_quiz_pct": round(sum(p["quiz_score"] / p["quiz_total"] for p in quiz) / len(quiz) * 100)
            if quiz else 0,
        },
        "recent_courses": recent[:5],
    }


def course_progress(db, course_id: str) -> list[dict]:
    """Real per-topic generation progress for the course board: latest job phase,
    plan status, per-concept notes counts, and cost. One call for the whole course."""
    units = db.table("units").select("id").eq("course_id", course_id).execute().data or []
    unit_ids = [u["id"] for u in units]
    if not unit_ids:
        return []
    topics = (db.table("topics").select("id,title,unit_id")
              .in_("unit_id", unit_ids).execute().data or [])
    out = []
    for t in topics:
        tid = t["id"]
        job = (db.table("generation_jobs").select("phase,status,cost_usd,est_cost_usd")
               .eq("topic_id", tid).order("created_at", desc=True).limit(1).execute().data)
        job = job[0] if job else None
        plan = _topic_plan_content(db, tid)
        concept_total = len(plan.get("concept_inventory", []) or [])
        cas = (db.table("concept_artifacts").select("artifact_type,status,approval_status")
               .eq("topic_id", tid).execute().data or [])
        notes = [c for c in cas if c["artifact_type"] == "student_notes"]
        notes_ready = sum(1 for c in notes if c["status"] == "ready")
        notes_approved = sum(1 for c in notes if c["approval_status"] == "approved")
        # Artifact-level rollup. Per planned topic: concepts × 3 concept
        # artifacts (notes/slides/quiz) + the 4 topic-level artifacts
        # (summary/assignment/faculty_diagnostic/flashcards). topic_plan is the
        # blueprint, not a counted deliverable.
        topic_arts = (db.table("artifacts").select("type,review_status")
                      .eq("topic_id", tid).execute().data or [])
        topic_ready = sum(1 for a in topic_arts
                          if a["type"] in _TOPIC_CONTENT_TYPES and a["review_status"] == "ready")
        artifact_total = (concept_total * 3 + len(_TOPIC_CONTENT_TYPES)) if concept_total else 0
        artifact_ready = sum(1 for c in cas if c["status"] == "ready") + topic_ready
        out.append({
            "topic_id": tid,
            "phase": (job or {}).get("phase"),
            "status": (job or {}).get("status"),
            "has_plan": bool(concept_total),
            "concept_total": concept_total,
            "notes_ready": notes_ready,
            "notes_approved": notes_approved,
            "artifact_total": artifact_total,
            "artifact_ready": artifact_ready,
            "cost_usd": (job or {}).get("cost_usd") or 0,
            "est_cost_usd": (job or {}).get("est_cost_usd"),
        })
    return out
