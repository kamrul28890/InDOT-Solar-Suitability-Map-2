from __future__ import annotations

import shutil
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .config import ROOT
from .schemas import CellPatch, FieldConfigRequest, FolderImportRequest, SaveSessionRequest
from .service import (
    PREVIEW_DIR,
    browse_folder,
    export_file_for_token,
    export_zip,
    field_config_for_session,
    generate_preview,
    get_layer_records,
    get_session,
    has_autosave,
    import_folder,
    reset_field_config,
    resume_autosave,
    revert_feature,
    revert_field,
    session_file,
    update_cell,
    update_layer_field_config,
    undo,
    validate_session,
)


app = FastAPI(
    title="INDOT Solar Editor API",
    description="Local Phase 2 editor for importing INDOT shapefiles, editing attributes, validating data, previewing, and exporting a static map ZIP.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5174", "http://localhost:5174"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/browse-folder")
def api_browse_folder():
    return browse_folder()


@app.get("/api/autosave")
def api_has_autosave():
    return has_autosave()


@app.post("/api/autosave/resume")
def api_resume_autosave():
    return resume_autosave()


@app.post("/api/import")
def api_import(payload: FolderImportRequest):
    return import_folder(payload.folder_path)


@app.get("/api/session/{session_id}")
def api_get_session(session_id: str):
    return get_session(session_id)


@app.post("/api/session/{session_id}/save")
def api_save_session(session_id: str, payload: SaveSessionRequest):
    target = Path(payload.file_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(session_file(session_id), target)
    return {"status": "saved", "file_path": str(target)}


@app.get("/api/fields/{session_id}")
def api_get_fields(session_id: str):
    return field_config_for_session(session_id)


@app.put("/api/fields/{session_id}/{layer_name}")
def api_put_fields(session_id: str, layer_name: str, payload: FieldConfigRequest):
    return update_layer_field_config(session_id, layer_name, payload.fields)


@app.post("/api/fields/{session_id}/reset")
def api_reset_fields(session_id: str):
    return reset_field_config(session_id)


@app.get("/api/layers/{session_id}/{layer_name}")
def api_get_layer_records(
    session_id: str,
    layer_name: str,
    query: str = "",
    edited_only: bool = False,
    errors_only: bool = False,
):
    return get_layer_records(session_id, layer_name, query=query, edited_only=edited_only, errors_only=errors_only)


@app.patch("/api/layers/{session_id}/{layer_name}/{feature_id}")
def api_patch_cell(session_id: str, layer_name: str, feature_id: str, payload: CellPatch):
    return update_cell(session_id, layer_name, feature_id, payload.field_code, payload.value)


@app.delete("/api/layers/{session_id}/{layer_name}/{feature_id}/edits")
def api_revert_feature(session_id: str, layer_name: str, feature_id: str):
    return revert_feature(session_id, layer_name, feature_id)


@app.delete("/api/layers/{session_id}/{layer_name}/{feature_id}/edits/{field_code}")
def api_revert_field(session_id: str, layer_name: str, feature_id: str, field_code: str):
    return revert_field(session_id, layer_name, feature_id, field_code)


@app.post("/api/session/{session_id}/undo")
def api_undo(session_id: str):
    return undo(session_id)


@app.post("/api/validate/{session_id}")
def api_validate(session_id: str):
    return validate_session(session_id)


@app.post("/api/preview/generate/{session_id}")
def api_preview(session_id: str):
    return generate_preview(session_id)


@app.get("/preview/")
def preview_index():
    path = PREVIEW_DIR / "index.html"
    if not path.exists():
        return HTMLResponse("<h1>Preview has not been generated yet.</h1>", status_code=404)
    return FileResponse(path)


@app.get("/preview/data/{filename}")
def preview_data(filename: str):
    return FileResponse(PREVIEW_DIR / "data" / filename)


@app.get("/preview/{file_path:path}")
def preview_asset(file_path: str):
    path = (PREVIEW_DIR / file_path).resolve()
    preview_root = PREVIEW_DIR.resolve()
    if preview_root not in path.parents and path != preview_root:
        return HTMLResponse("<h1>Preview asset is outside the preview directory.</h1>", status_code=404)
    if not path.exists() or path.is_dir():
        return HTMLResponse("<h1>Preview asset not found.</h1>", status_code=404)
    return FileResponse(path)


@app.post("/api/export/{session_id}")
def api_export(session_id: str):
    return export_zip(session_id)


@app.get("/api/export/download/{token}")
def api_download(token: str):
    return FileResponse(export_file_for_token(token), filename=token, media_type="application/zip")


dist_dir = ROOT / "dist"
if not dist_dir.exists() and getattr(sys, "frozen", False):
    dist_dir = Path(getattr(sys, "_MEIPASS")) / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="editor_frontend")
