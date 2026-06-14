from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class FolderImportRequest(BaseModel):
    folder_path: str


class FieldConfigRequest(BaseModel):
    fields: dict[str, dict[str, Any]] = Field(default_factory=dict)


class CellPatch(BaseModel):
    field_code: str
    value: Any


class SaveSessionRequest(BaseModel):
    file_path: str
