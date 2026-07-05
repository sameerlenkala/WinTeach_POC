"""Reference-material schemas (Phase 1 grounding). Upload itself is multipart;
these cover the read/list shapes and the JSON bodies."""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel


class MaterialOut(BaseModel):
    id: str
    course_id: str
    filename: str
    file_type: Literal["pdf", "docx"]
    status: Literal["processing", "ready", "error"]
    is_course_wide: bool = False
    page_count: int | None = None
    chunk_count: int | None = None
    error_message: str | None = None
    created_at: str | None = None
    # 'topic' when explicitly linked to the requested topic, 'course' when it
    # reaches the topic via the course-wide pool. Only set on topic listings.
    tier: Literal["topic", "course"] | None = None


class MaterialUpdate(BaseModel):
    is_course_wide: bool
