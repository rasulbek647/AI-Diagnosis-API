from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DiseaseCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(default="", max_length=4000)
    treatment: str = Field(default="", max_length=4000)
    keywords: list[str] = Field(default_factory=list)
    category: str = Field(default="general", max_length=32)
    translations: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class DiseaseUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    treatment: str | None = Field(default=None, max_length=4000)
    keywords: list[str] | None = None
    category: str | None = Field(default=None, max_length=32)
    translations: dict[str, Any] | None = None
    is_active: bool | None = None


class DiseaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    treatment: str
    keywords: list[str]
    category: str = "general"
    translations: dict[str, Any] = Field(default_factory=dict)
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @field_validator("category", mode="before")
    @classmethod
    def category_fallback(cls, v: Any) -> str:
        return v if isinstance(v, str) and v.strip() else "general"

    @field_validator("translations", mode="before")
    @classmethod
    def translations_fallback(cls, v: Any) -> dict[str, Any]:
        return v if isinstance(v, dict) else {}
