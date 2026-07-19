from pydantic import BaseModel, field_validator
from typing import Literal


class CommitCO(BaseModel):
    text: str
    bloom: str = "L3"


class CommitUnit(BaseModel):
    unit_index: int   # 0-based; stored as unit_number = unit_index + 1
    title: str
    hours: int = 0


class CommitTopic(BaseModel):
    unit_index: int
    title: str
    subtopics: list[str] = []
    co_text: str = ""
    bloom: str = "L3"
    # 1-based CO number from the create wizard's mapping — resolved to the
    # course's CO id at commit time (the commit replaces topics, so it must
    # carry the mapping or the create-step co_id is lost).
    co_number: int | None = None


class UploadCommit(BaseModel):
    course_id: str
    cos: list[CommitCO] = []
    units: list[CommitUnit] = []
    topics: list[CommitTopic] = []
    replace_cos: bool = False
    replace_topics: bool = False


class ExtractionStatus(BaseModel):
    upload_id: str
    status: Literal["processing", "done", "failed"]
    extraction: dict | None = None
    ai_extraction: dict | None = None
    error: str | None = None


class ReextractPayload(BaseModel):
    field_name: Literal["cos", "hours", "books", "assessment", "modules"]
    selected_text: str
    attempt: int = 1  # 1 or 2; after 2 attempts the endpoint returns manual_entry flag

    @field_validator("selected_text")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("selected_text must not be empty")
        return v
