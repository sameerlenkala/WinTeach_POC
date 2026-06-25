from pydantic import BaseModel, field_validator
from typing import Literal

Confidence = Literal["High", "Low", "Missing"]

VALID_BLOOM = {"Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"}


class ExtractedField(BaseModel):
    value: str | list | None
    confidence: Confidence


# ── Structured AI extraction output ──────────────────────────────────────────

class ExtractedSubtopic(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        return v.strip()


class ExtractedTopic(BaseModel):
    title: str
    bloom_level: str = "Understand"
    subtopics: list[ExtractedSubtopic] = []

    @field_validator("bloom_level")
    @classmethod
    def validate_bloom(cls, v: str) -> str:
        normalized = v.strip().capitalize()
        return normalized if normalized in VALID_BLOOM else "Understand"


class ExtractedUnit(BaseModel):
    unit_number: int
    title: str
    hours: int = 0
    topics: list[ExtractedTopic] = []


class ExtractedCO(BaseModel):
    co_number: int
    text: str
    bloom_level: str = "Understand"

    @field_validator("bloom_level")
    @classmethod
    def validate_bloom(cls, v: str) -> str:
        normalized = v.strip().capitalize()
        return normalized if normalized in VALID_BLOOM else "Understand"

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()


class AIExtraction(BaseModel):
    """Structured output from GPT-4o-mini — validated by Pydantic before DB write."""
    course_name: str = ""
    course_code: str = ""
    credits: int = 0
    semester: str = ""
    regulation: str = ""
    total_hours: int = 0
    lab_flag: bool = False
    course_outcomes: list[ExtractedCO] = []
    units: list[ExtractedUnit] = []
    reference_books: list[str] = []


# ── Legacy flat extraction (kept for backwards compat + regex fallback) ───────

class SyllabusExtraction(BaseModel):
    course_name: ExtractedField
    course_code: ExtractedField
    credits: ExtractedField
    semester: ExtractedField
    course_outcomes: ExtractedField
    modules: ExtractedField
    total_hours: ExtractedField
    reference_books: ExtractedField
    lab_flag: ExtractedField
    assessment_scheme: ExtractedField
    # AI-structured fields (populated when GPT succeeds)
    ai_extraction: AIExtraction | None = None


class SyllabusUploadResponse(BaseModel):
    upload_id: str
    filename: str
    extraction: SyllabusExtraction
