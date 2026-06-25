from pydantic import BaseModel


class InstituteCreate(BaseModel):
    name: str
    short_name: str
    city: str
    state: str
    country: str = "India"
    regulation: str = ""
    affiliation: str = ""
    contact_email: str = ""


class InstituteUpdate(BaseModel):
    name: str | None = None
    short_name: str | None = None
    city: str | None = None
    state: str | None = None
    regulation: str | None = None
    affiliation: str | None = None
    contact_email: str | None = None


class POCreate(BaseModel):
    code: str
    text: str


class PSOCreate(BaseModel):
    code: str
    text: str
    scope: str = "common"   # "common" | "major"
    major: str | None = None
