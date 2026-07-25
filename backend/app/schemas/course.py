from pydantic import BaseModel, Field
from typing import Literal


CourseStatus = Literal["draft", "active", "archived"]


class TopicIn(BaseModel):
    title: str
    # 1-based CO number the create wizard mapped this topic to; resolved to the
    # created CO's id at insert time so the mapping survives past creation.
    co_number: int | None = None
    bloom_level: str | None = None


class UnitIn(BaseModel):
    title: str
    unit_number: int
    hours: float = 0   # lecture hours; float — wizard allows half-hour steps
    topics: list[str | TopicIn] = []


class COIn(BaseModel):
    text: str
    bloom: str = ""
    # Industry outcome (wizard "IO" cards) — kept distinct from regular COs so
    # every surface can label them IOn instead of absorbing them into COn.
    is_industry: bool = False


class CourseCreate(BaseModel):
    name: str
    code: str
    credits: int = 3
    semester: str = ""
    regulation: str = ""
    status: CourseStatus = "draft"
    units: list[UnitIn] = []
    course_outcomes: list[str | COIn] = []


class CourseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    credits: int | None = None
    semester: str | None = None
    status: CourseStatus | None = None


class CourseStatusPatch(BaseModel):
    status: CourseStatus


class UnitUpdate(BaseModel):
    # hours 0 means "reset to estimated" — the UI shows the safety-net default
    # and generation derives the value.
    hours: float | None = Field(default=None, ge=0, le=20)
    title: str | None = None


class COCreate(BaseModel):
    text: str
    bloom: str = "L3"


class COUpdate(BaseModel):
    text: str | None = None
    bloom: str | None = None


class COMappingEntry(BaseModel):
    co_id: str
    po_codes: list[str] = []
    pso_codes: list[str] = []
    levels: dict[str, int] = {}   # e.g. {"PO1": 3, "PSO1": 2}


class COMappingUpdate(BaseModel):
    mappings: list[COMappingEntry]
