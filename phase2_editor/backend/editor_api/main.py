from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .export_service import ExportManager
from .import_service import inspect_import_folder
from .session_store import SessionStore
from .validation_service import validate_store

EDITOR_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = EDITOR_ROOT.parent
PHASE1_MAP_ROOT = REPO_ROOT / "phase1_map"
DEFAULT_CONFIG = PHASE1_MAP_ROOT / "config" / "field_mapping.json"
if not DEFAULT_CONFIG.exists():
    DEFAULT_CONFIG = EDITOR_ROOT / "phase1_config" / "field_mapping.json"
STORE = SessionStore(DEFAULT_CONFIG)
EXPORTS = ExportManager(EDITOR_ROOT, PHASE1_MAP_ROOT)
FRONTEND_DIST = EDITOR_ROOT / "frontend_dist"

app = FastAPI(
    title="INDOT Solar Editor API",
    description="Local API for importing, editing, validating, previewing, and exporting INDOT solar map data.",
    version="0.1.0",
)

if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="editor_assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "app": "indot-phase2-editor",
        "editor_root": str(EDITOR_ROOT),
        "phase1_map_available": PHASE1_MAP_ROOT.exists(),
    }


@app.get("/preview/")
def preview_index() -> FileResponse:
    try:
        path = EXPORTS.preview_file("index.html")
    except RuntimeError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if not path.exists():
        raise HTTPException(status_code=404, detail="Preview index is missing.")
    return FileResponse(path)


@app.get("/preview/data/{filename}")
def preview_data(filename: str) -> FileResponse:
    try:
        path = EXPORTS.preview_file(f"data/{filename}")
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if not path.exists():
        raise HTTPException(status_code=404, detail="Preview data file is missing.")
    return FileResponse(path)


@app.get("/")
def editor_index():
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return HTMLResponse("<!doctype html><title>INDOT Editor</title><main id=\"root\">INDOT Editor API is running.</main>")


class ImportRequest(BaseModel):
    path: str


class SessionFileRequest(BaseModel):
    file_path: str


class FeatureEditRequest(BaseModel):
    field_code: str
    value: Any


@app.post("/api/import/inspect")
def inspect_import(request: ImportRequest) -> dict[str, Any]:
    try:
        summary = inspect_import_folder(Path(request.path), DEFAULT_CONFIG)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    app.state.last_import_summary = summary
    return summary


@app.post("/api/import")
def import_project(request: ImportRequest) -> dict[str, Any]:
    try:
        return STORE.import_project(Path(request.path))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/session")
def get_session() -> dict[str, Any]:
    try:
        return STORE.get_session()
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/session/save")
def save_session(request: SessionFileRequest) -> dict[str, Any]:
    try:
        return STORE.save(Path(request.file_path))
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/session/load")
def load_session(request: SessionFileRequest) -> dict[str, Any]:
    try:
        return STORE.load(Path(request.file_path))
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/session/reset")
def reset_session() -> dict[str, Any]:
    try:
        return STORE.reset()
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/fields/{layer_name}")
def get_fields(layer_name: str) -> dict[str, Any]:
    try:
        return {"layer_name": layer_name, "fields": STORE.get_field_config(layer_name)}
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.put("/api/fields/{layer_name}")
def put_fields(layer_name: str, field_config: dict[str, dict[str, Any]]) -> dict[str, Any]:
    try:
        return STORE.set_field_config(layer_name, field_config)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/fields/reset")
def reset_fields() -> dict[str, Any]:
    try:
        return STORE.reset_fields()
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/layers/{layer_name}")
def get_layer_records(layer_name: str) -> dict[str, Any]:
    try:
        return STORE.list_layer_features(layer_name)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.patch("/api/layers/{layer_name}/{feature_id}")
def patch_feature(layer_name: str, feature_id: str, request: FeatureEditRequest) -> dict[str, Any]:
    try:
        return STORE.apply_edit(layer_name, feature_id, request.field_code, request.value)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/layers/{layer_name}/{feature_id}/edits")
def delete_feature_edits(layer_name: str, feature_id: str) -> dict[str, Any]:
    try:
        return STORE.revert_feature(layer_name, feature_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.delete("/api/layers/{layer_name}/{feature_id}/edits/{field_code}")
def delete_feature_field_edit(layer_name: str, feature_id: str, field_code: str) -> dict[str, Any]:
    try:
        return STORE.revert_field(layer_name, feature_id, field_code)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/validate")
def validate_session() -> dict[str, Any]:
    try:
        return validate_store(STORE)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/preview/generate")
def generate_preview() -> dict[str, Any]:
    try:
        return EXPORTS.generate_preview(STORE)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/export")
def export_zip() -> dict[str, Any]:
    try:
        return EXPORTS.export_zip(STORE)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/export/download/{token}")
def download_export(token: str) -> FileResponse:
    try:
        path = EXPORTS.export_path(token)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(path, filename=path.name, media_type="application/zip")


@app.post("/api/browse-folder")
def browse_folder() -> dict[str, str | None]:
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="Native folder picker is unavailable.") from exc

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    try:
        selected = filedialog.askdirectory(title="Select INDOT shapefile project folder")
    finally:
        root.destroy()

    return {"path": selected or None}
