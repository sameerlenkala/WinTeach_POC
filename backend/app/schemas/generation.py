"""
Generation request/response models + strict-mode artifact output schemas
(pipeline doc §7.5, §9).

Three artifact templates are finalized here (Topic Plan, Student Notes assembly
shape, Slides); the other five fan-out artifacts carry placeholder shapes until
their JIT templates are authored (§7.4). Every artifact carries orchestrator-
filled stamp fields (version / hash / derived_from) that the model leaves null.
"""

from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


# ══════════════════════════════════════════════════════════════════════════════
# Request / response models (match winnify/src/api/generation.ts)
# ══════════════════════════════════════════════════════════════════════════════

class ComplexityRequest(BaseModel):
    topic: str
    subtopics: list[str] = []
    bloom_level: str | None = None
    hours: float | None = None


class ComplexityResponse(BaseModel):
    topic: str
    score: float
    label: Literal["Low", "Medium", "High"]
    signals: dict[str, float]


class COGenerateRequest(BaseModel):
    course_id: str
    unit_titles: list[str] = []
    bloom_target: str = "L3"
    count: int = 3


class COGenerateResponse(BaseModel):
    course_outcomes: list[str]
    bloom_level: str


# ── The eight POC artifact types (byte-identical to the enum + frontend) ──────
ArtifactType = Literal[
    "topic_plan", "student_notes", "slides", "summary",
    "quiz", "assignment", "faculty_diagnostic", "flashcards",
]


class JobCreateRequest(BaseModel):
    course_id: str
    topic_id: str
    artifact_types: list[ArtifactType] = []


class HoursAllocateTopic(BaseModel):
    title: str
    complexity_score: float | None = None
    co_importance: str | None = None


class HoursAllocateRequest(BaseModel):
    unit_total_hours: float
    topics: list[HoursAllocateTopic] = []


class GranularityTopic(BaseModel):
    title: str
    hours: float | None = None


class GranularityRequest(BaseModel):
    unit_total_hours: float
    topics: list[GranularityTopic] = []


class FinalizeRequest(BaseModel):
    """Drives the gates (§9). decision ∈ {approve, revise, ship, release}.
    For student_notes, unit_id is required (approval is per-unit)."""
    decision: Literal["approve", "revise", "ship", "release"]
    unit_id: str | None = None
    patch: list[dict] | dict | None = None      # JSON-patch style structured edit
    instruction: str | None = None              # revise guidance


class ScopePatchRequest(BaseModel):
    """Trigger write-back (§3.7): the only path that may mutate an active course,
    limited to whitelisted trigger-editable paths."""
    topic_id: str
    patch: list[dict] | dict


# ══════════════════════════════════════════════════════════════════════════════
# Topic Plan — strict output schema (Node A, §7.1 / §7.5)
# ══════════════════════════════════════════════════════════════════════════════
#
# Stamp fields (topic_plan_version / validated_at / scope_hash, all *_id) are
# orchestrator-filled — the model emits null / leaves ids unset.

class TopicPlanFrontMatter(BaseModel):
    topic: str
    course: str
    subject_domain: str
    audience_level: Literal["UG", "PG", "ProfCert"]
    topic_duration_hours: float
    topic_plan_version: str | None = None
    validated_at: str | None = None
    scope_hash: str | None = None


class COMappingItem(BaseModel):
    co_id: str
    co_statement: str
    bloom_level: str
    source: str = "Faculty-finalized"
    topic_weight_pct: float


class TLOItem(BaseModel):
    tlo_id: str | None = None            # orchestrator-filled
    statement: str
    parent_co: str
    bloom_level: str
    served_by_concepts: list[str] = []


class ConceptFlags(BaseModel):
    requires_code: bool = False
    needs_execution_trace: bool = False
    needs_worked_example: bool = True
    needs_analysis: bool = False
    needs_comparison: bool = False
    comparison_target: str | None = None


class ConceptBudgets(BaseModel):
    reading_time_minutes: int = 0
    word_minimums: dict[str, int] = {}


class ConceptItem(BaseModel):
    concept_id: str | None = None        # orchestrator-assigned (C1..Cn, plan order)
    concept_name: str
    serves_tlos: list[str] = []
    primary_content_type: Literal["P1", "P2", "P3", "P4", "P5"]
    secondary_blocks: list[str] = []
    flags: ConceptFlags
    flag_overrides: list[str] = []       # flags deliberately deviating from derivation
    complexity_tier: Literal["simple", "moderate", "complex"]
    proficiency_target: str
    scope_in: list[str] = []
    scope_out: list[str] = []
    bloom_ceiling: str
    time_minutes: int
    relative_weight_pct: float
    budgets: ConceptBudgets | None = None
    ct_low_confidence: bool = False


class SessionPlanItem(BaseModel):
    session_no: int
    minutes: int
    concepts_covered: list[str] = []
    tlos_advanced: list[str] = []


class AssessmentBlueprint(BaseModel):
    bloom_co_matrix: list[dict] = []
    quiz_bloom_range: str = ""
    assignment_skew: str = ""
    co_weighting: list[dict] = []
    must_assess_concepts: list[str] = []


class PrerequisiteItem(BaseModel):
    knowledge: str
    taught_in_topic: str | None = None
    prereq_gap: bool = False


class TopicPlan(BaseModel):
    front_matter: TopicPlanFrontMatter
    co_mapping: list[COMappingItem]
    tlo_set: list[TLOItem]
    concept_inventory: list[ConceptItem]
    session_plan: list[SessionPlanItem]
    assessment_blueprint: AssessmentBlueprint
    prerequisite_boundary: list[PrerequisiteItem] = []


# ══════════════════════════════════════════════════════════════════════════════
# Validation result (code-validator output stored on the artifact row, §9)
# ══════════════════════════════════════════════════════════════════════════════

class CheckResult(BaseModel):
    name: str
    passed: bool
    detail: str = ""
    blocking: bool = True


class ValidationResult(BaseModel):
    all_pass: bool
    checks: list[CheckResult] = []

    @property
    def failures(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed]

    @property
    def short_fields(self) -> list[str]:
        """Word-minimum shortfalls that fire the expansion prompt (Notes gate)."""
        out: list[str] = []
        for c in self.checks:
            if c.name.startswith("word_minimum:") and not c.passed:
                out.append(c.name.split(":", 1)[1])
        return out


# ══════════════════════════════════════════════════════════════════════════════
# Fan-out artifact shapes — Slides finalized; D–H placeholder pending JIT
# templates (§7.3 / §7.4 / §7.5)
# ══════════════════════════════════════════════════════════════════════════════

class DeckMeta(BaseModel):
    topic: str
    slides_version: str | None = None
    derived_from_notes_version: str | None = None
    derived_from_content_hash: str | None = None


class Slide(BaseModel):
    slide_no: int | None = None
    role: str
    title: str
    body_blocks: list[str] = []
    visual: str | None = None
    build_steps: list[str] = []
    speaker_notes: str = ""
    source_ref: str | None = None        # REQUIRED for content slides (validator-checked)


class ConceptSequence(BaseModel):
    unit_ref: str
    inherited_content_type: Literal["P1", "P2", "P3", "P4", "P5"]
    slides: list[Slide] = []


class SlidesModel(BaseModel):
    deck_meta: DeckMeta
    opening: dict[str, Any] = {}
    concept_sequences: list[ConceptSequence] = []
    applied_sequence: dict[str, Any] = {}
    synthesis_sequence: dict[str, Any] = {}
    closing_sequence: dict[str, Any] = {}


class PlaceholderArtifact(BaseModel):
    """Shape for the five JIT fan-out artifacts before their templates are
    authored (§7.4). Ships clearly flagged; excluded from stakeholder demos."""
    placeholder: bool = True
    artifact_type: ArtifactType
    version: str | None = None
    derived_from_notes_version: str | None = None
    derived_from_content_hash: str | None = None
    note: str = "Template not yet authored (JIT). Excluded from demos."
    content: dict[str, Any] = Field(default_factory=dict)
