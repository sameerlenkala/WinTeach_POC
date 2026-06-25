from pydantic import BaseModel
from typing import Literal

UserRole = Literal["student", "faculty", "admin", "superadmin"]

ROLE_REDIRECT: dict[str, str] = {
    "student": "/home",
    "faculty": "/winteach",
    "admin": "/admin",
    "superadmin": "/superadmin",
}
