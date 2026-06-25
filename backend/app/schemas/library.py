from pydantic import BaseModel
from typing import Literal


class LibrarySourceCreate(BaseModel):
    title: str
    authors: list[str] = []
    source_type: Literal["textbook", "paper", "video", "website", "other"] = "textbook"
    url: str = ""
    description: str = ""
    tags: list[str] = []


class COLibraryEntry(BaseModel):
    description: str
    bloom_level: str
    domain: str = ""
    tags: list[str] = []
