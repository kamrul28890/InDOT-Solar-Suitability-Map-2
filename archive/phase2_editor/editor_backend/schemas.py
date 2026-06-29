from __future__ import annotations

"""Validated request bodies accepted by the active editor API."""

from typing import Any

from pydantic import BaseModel, Field


class FolderImportRequest(BaseModel):
    """Folder selected for project-level shapefile discovery."""

    folder_path: str


class FieldConfigRequest(BaseModel):
    """Per-field presentation settings submitted by the Fields stage."""

    fields: dict[str, dict[str, Any]] = Field(default_factory=dict)


class CellPatch(BaseModel):
    """One attribute edit; semantic validation occurs in service.py."""

    field_code: str
    value: Any


class SaveSessionRequest(BaseModel):
    """Destination for an explicit JSON session backup."""

    file_path: str
