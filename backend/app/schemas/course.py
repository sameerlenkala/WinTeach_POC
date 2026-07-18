from pydantic import BaseModel
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
    hours: int = 0
    topics: list[str | TopicIn] = []


class COIn(BaseModel):
    text: str
    bloom: str = ""


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
