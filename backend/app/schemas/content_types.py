"""
WinTeach Content-Type taxonomy + flag derivation + budget lookup — the single,
canonical contract (pipeline doc §4).

Defined ONCE here and imported by every generation node. Never redefined per
artifact. Two projections of one classification:
  - the Content Type (P1–P5) travels to every fan-out artifact,
  - the derived generation flags travel into Student Notes generation.

Also holds the Bloom band + verb-bank helpers used by the code validators
(pipeline doc §10.3 "Verb check").
"""

from __future__ import annotations

from enum import Enum


# ── Content Type taxonomy (§4.1) ──────────────────────────────────────────────

class ContentType(str, Enum):
    P1 = "P1"  # Conceptual        — "What is it and why does it work?"
    P2 = "P2"  # Code / Impl       — "How is it built and how does it run?"
    P3 = "P3"  # Mathematical/Proof— "Why is this provably true / how derived?"
    P4 = "P4"  # Systems / Visual  — "How are the parts arranged & interacting?"
    P5 = "P5"  # Lab / Practical   — "How do I set it up, run it, and debug it?"


CONTENT_TYPE_LABELS: dict[ContentType, str] = {
    ContentType.P1: "Conceptual",
    ContentType.P2: "Code/Implementation",
    ContentType.P3: "Mathematical/Proof",
    ContentType.P4: "Systems/Visual",
    ContentType.P5: "Lab/Practical",
}

# The five per-concept generation flags the Notes prompts consume.
FLAG_NAMES = (
    "requires_code",
    "needs_execution_trace",
    "needs_worked_example",
    "needs_analysis",
    "needs_comparison",
)


# ── Content Type → generation-flag derivation (§4.2, deterministic defaults) ──
#
# The Topic Plan records these per concept; overrides are permitted only where
# the material demands it and every override is part of the plan (and therefore
# scope-substantive to change later). `needs_execution_trace` for P4 is
# "true if stateful" — non-derivable, so the deterministic default is False and
# the plan flips it on via a recorded override.
_FLAG_DERIVATION: dict[ContentType, dict[str, bool]] = {
    ContentType.P1: {
        "requires_code": False,
        "needs_execution_trace": False,
        "needs_worked_example": True,
        "needs_analysis": False,
        "needs_comparison": False,
    },
    ContentType.P2: {
        "requires_code": True,
        "needs_execution_trace": True,
        "needs_worked_example": True,
        "needs_analysis": True,
        "needs_comparison": False,
    },
    ContentType.P3: {
        "requires_code": True,   # formal_math
        "needs_execution_trace": False,
        "needs_worked_example": True,
        "needs_analysis": True,
        "needs_comparison": False,
    },
    ContentType.P4: {
        "requires_code": False,
        "needs_execution_trace": False,  # → True if stateful (recorded override)
        "needs_worked_example": True,
        "needs_analysis": True,
        "needs_comparison": True,
    },
    ContentType.P5: {
        "requires_code": True,   # code
        "needs_execution_trace": True,   # procedure trace
        "needs_worked_example": True,
        "needs_analysis": False,
        "needs_comparison": False,
    },
}

# Mandatory-visual expectation per Content Type (§4.2 last row); advisory to the
# prompts, checked structurally by the diagram-compile validator.
MANDATORY_VISUAL: dict[ContentType, str] = {
    ContentType.P1: "optional",
    ContentType.P2: "trace_table",
    ContentType.P3: "optional",
    ContentType.P4: "renderable_diagram+reading_guide",
    ContentType.P5: "expected_output_table",
}


def derive_flags(
    content_type: ContentType | str,
    overrides: dict[str, bool] | None = None,
    comparison_target: str | None = None,
) -> dict:
    """Return the canonical flag dict for a Content Type, applying recorded
    overrides. `comparison_target` is carried alongside the flags (set it and
    `needs_comparison` together)."""
    ct = ContentType(content_type)
    flags = dict(_FLAG_DERIVATION[ct])
    if overrides:
        for k, v in overrides.items():
            if k in FLAG_NAMES:
                flags[k] = bool(v)
    flags["comparison_target"] = comparison_target
    return flags


def flag_deviations(content_type: ContentType | str, flags: dict) -> list[str]:
    """Names of flags in `flags` that deviate from the canonical derivation for
    the Content Type. The flag-conformance validator (§10.3) treats each of
    these as an override that must be recorded in the concept."""
    ct = ContentType(content_type)
    canonical = _FLAG_DERIVATION[ct]
    out: list[str] = []
    for name in FLAG_NAMES:
        if name in flags and bool(flags[name]) != canonical[name]:
            out.append(name)
    return out


# ── Word-count minimums (Notes Prompt Spec §"Word-count minimums") ────────────
#
# Authoritative per-field, per-tier minimums enforced by the Notes word-minimum
# validator; a shortfall fires the expansion prompt. This single table also
# feeds the Topic Plan's per-concept budgets (§7.1) — one source of truth.

COMPLEXITY_TIERS = ("simple", "moderate", "complex")

_WORD_MINIMUMS: dict[str, dict[str, int]] = {
    "simple": {
        "formal_definition": 150,
        "architecture_and_mechanism": 180,
        "code_explanation": 180,
        "execution_trace": 150,
        "worked_example": 150,
    },
    "moderate": {
        "formal_definition": 220,
        "architecture_and_mechanism": 280,
        "code_explanation": 280,
        "execution_trace": 200,
        "worked_example": 200,
    },
    "complex": {
        "formal_definition": 300,
        "architecture_and_mechanism": 380,
        "code_explanation": 380,
        "execution_trace": 260,
        "worked_example": 260,
    },
}

_READING_WORDS_PER_MIN = 200


def notes_word_minimums(complexity_tier: str) -> dict[str, int]:
    """The authoritative per-field word minimums for a complexity tier."""
    tier = complexity_tier if complexity_tier in _WORD_MINIMUMS else "moderate"
    return dict(_WORD_MINIMUMS[tier])


def resolve_budgets(time_minutes: int, complexity_tier: str) -> dict:
    """Resolve per-concept budgets from the canonical lookup by allotted minutes
    and complexity tier. Never model-invented — the Topic Plan echoes these."""
    word_minimums = notes_word_minimums(complexity_tier)
    total_min_words = sum(word_minimums.values())
    # Reading time: the larger of the words-implied minutes and a fraction of
    # the allotted teaching minutes, floored at 3.
    words_reading = round(total_min_words / _READING_WORDS_PER_MIN)
    reading_time_minutes = max(3, words_reading, round((time_minutes or 0) * 0.4))
    return {
        "reading_time_minutes": reading_time_minutes,
        "word_minimums": word_minimums,
    }


# ── Coding-subject override (Notes Prompt Spec §"Coding-subject override") ─────
#
# For these subject-type labels, a syntax/code example is still required even
# when the Topic Plan sets requires_code = false. Derived from the subject-type
# configuration, never hardcoded per discipline.
_CODING_SUBJECT_MARKERS = (
    "algorithmic", "applied", "software", "database", "security",
    "networks", "web",
)


def is_coding_subject(subject_type_label: str | None) -> bool:
    """True when the subject type demands students see/write real code."""
    label = (subject_type_label or "").lower()
    return any(marker in label for marker in _CODING_SUBJECT_MARKERS)


# ── Cost model (gpt-4o) ───────────────────────────────────────────────────────
#
# Approximate pricing in USD per 1M tokens; update if OpenAI rates change.
GPT4O_INPUT_PER_1M = 2.50
GPT4O_OUTPUT_PER_1M = 10.00


def usd_cost(prompt_tokens: int, completion_tokens: int) -> float:
    """USD cost for a token spend at the configured gpt-4o rates."""
    return round((prompt_tokens or 0) / 1e6 * GPT4O_INPUT_PER_1M
                 + (completion_tokens or 0) / 1e6 * GPT4O_OUTPUT_PER_1M, 4)


# Rough (input, output) token estimates per generation call — for the upfront
# cost estimate only (actuals come from resp.usage). student_notes covers the
# three per-unit calls combined.
ARTIFACT_TOKEN_ESTIMATE: dict[str, tuple[int, int]] = {
    "topic_plan":         (4000, 3000),
    "student_notes":      (9000, 7000),
    "slides":             (3500, 2500),
    "quiz":               (2500, 1800),
    "summary":            (4000, 2500),
    "assignment":         (3500, 2500),
    "faculty_diagnostic": (3500, 2500),
    "flashcards":         (2500, 1500),
}


def estimate_artifact_cost(artifact_type: str) -> float:
    ins, outs = ARTIFACT_TOKEN_ESTIMATE.get(artifact_type, (3000, 2000))
    return usd_cost(ins, outs)


# ── Bloom band + verb bank (§10.3 Verb check, §7.0 invariant 3) ───────────────

BLOOM_ORDER = ("L1", "L2", "L3", "L4", "L5", "L6")
BLOOM_FLOOR = "L2"

BLOOM_NAME_TO_CODE: dict[str, str] = {
    "remember": "L1",
    "understand": "L2",
    "apply": "L3",
    "analyze": "L4",
    "analyse": "L4",
    "evaluate": "L5",
    "create": "L6",
}

# Banned outcome verbs — never appear as an outcome verb at any level.
BANNED_VERBS = (
    "understand", "know", "learn", "be familiar with", "be aware of",
    "appreciate", "study", "grasp", "comprehend", "realize", "realise",
    "be exposed to",
)

# Approved verb bank by Bloom level (companion: blooms-verb-bank.md). Verbs are
# stored in lemma form; the verb check lemmatizes the leading verb before match.
APPROVED_VERBS: dict[str, set[str]] = {
    "L1": {"define", "list", "state", "name", "recall", "identify", "label",
           "recognize", "cite", "record", "match", "describe"},
    # L2 (Understand) legitimately spans many common teaching verbs — including
    # define/identify/list/compare — since students name, describe and contrast
    # concepts while building understanding.
    "L2": {"explain", "describe", "summarize", "classify", "interpret",
           "paraphrase", "illustrate", "distinguish", "discuss", "restate",
           "outline", "represent", "define", "identify", "list", "compare",
           "differentiate", "recognize", "characterize", "categorize", "relate"},
    "L3": {"apply", "implement", "solve", "compute", "demonstrate", "construct",
           "use", "execute", "calculate", "model", "modify", "operate",
           "produce", "predict", "illustrate", "organize"},
    "L4": {"analyze", "compare", "examine", "investigate", "differentiate",
           "contrast", "categorize", "deconstruct", "diagnose", "correlate",
           "trace", "test"},
    "L5": {"evaluate", "justify", "critique", "assess", "judge", "defend",
           "validate", "recommend", "prioritize", "appraise", "verify"},
    "L6": {"design", "create", "formulate", "synthesize", "develop", "compose",
           "generate", "devise", "construct", "build", "plan"},
}

# Flat lookup: lemma → set of levels it is approved at.
_VERB_LEVELS: dict[str, set[str]] = {}
for _lvl, _verbs in APPROVED_VERBS.items():
    for _v in _verbs:
        _VERB_LEVELS.setdefault(_v, set()).add(_lvl)


def normalize_bloom(raw: str | None) -> str:
    """Normalise any Bloom representation (name/L-code/mixed case) to an L-code.
    Unknown → the floor (L2)."""
    if not raw:
        return BLOOM_FLOOR
    s = raw.strip().lower()
    if s in BLOOM_NAME_TO_CODE:
        return BLOOM_NAME_TO_CODE[s]
    if s.upper() in BLOOM_ORDER:
        return s.upper()
    return BLOOM_FLOOR


def bloom_rank(code: str) -> int:
    """1..6 rank for an L-code; unknown → floor rank."""
    code = normalize_bloom(code)
    return BLOOM_ORDER.index(code) + 1


def lemmatize_verb(word: str) -> str:
    """Lightweight, dependency-free lemmatizer sufficient for the verb gate:
    lowercase, strip a handful of inflectional suffixes to a base form.
    (The pipeline defers full NLI/lemmatization to post-POC — §10.3.)"""
    w = word.strip().lower()
    if not w:
        return w
    for suffix, cut in (("ies", "y"), ("sses", "ss")):
        if w.endswith(suffix) and len(w) > len(suffix) + 1:
            return w[: -len(suffix)] + cut
    if w.endswith("ing") and len(w) > 5:
        base = w[:-3]
        return base + "e" if base + "e" in _VERB_LEVELS else base
    if w.endswith("ed") and len(w) > 4:
        base = w[:-2]
        return base + "e" if base + "e" in _VERB_LEVELS else base
    if w.endswith("es") and len(w) > 4:
        base = w[:-2]
        return base if base in _VERB_LEVELS else w[:-1]
    if w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        return w[:-1]
    return w


def leading_verb(statement: str) -> str:
    """Lemma of the first word of an outcome statement."""
    tokens = statement.strip().split()
    return lemmatize_verb(tokens[0]) if tokens else ""


def is_banned_verb(statement: str) -> bool:
    """True if the statement leads with (or is) a banned outcome verb."""
    s = statement.strip().lower()
    for phrase in BANNED_VERBS:
        if s == phrase or s.startswith(phrase + " "):
            return True
    return lemmatize_verb(s.split()[0]) in {"understand", "know", "learn",
                                            "appreciate", "study", "grasp",
                                            "comprehend", "realize", "realise"} if s else False


def verb_allowed_at(statement: str, bloom_level: str) -> bool:
    """Verb-bank check (§10.3): leading verb lemmatized → exact-match the
    approved bank for the declared level. No substring matching."""
    if is_banned_verb(statement):
        return False
    verb = leading_verb(statement)
    level = normalize_bloom(bloom_level)
    return level in _VERB_LEVELS.get(verb, set())
