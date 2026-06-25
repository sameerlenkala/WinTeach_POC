from pydantic import BaseModel


class SettingUpsert(BaseModel):
    key: str
    value: str
    scope: str = "institute"   # "institute" | "global"
