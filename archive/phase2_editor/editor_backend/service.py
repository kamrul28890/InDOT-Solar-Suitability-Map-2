from __future__ import annotations

"""Core application services for the local INDOT shapefile editor.

The editor deliberately keeps imported GeoJSON snapshots immutable and stores
user changes as per-cell deltas in a JSON session. Preview and export operations
materialize those deltas into new files, so the original project shapefiles are
never modified by an editing session.
"""

import json
import shutil
import sys
import uuid
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from tempfile import gettempdir
from typing import Any

import geopandas as gpd
import pandas as pd
from fastapi import HTTPException
from shapely.geometry import mapping

from .config import (
    DATASETS,
    DERIVED_FIELDS,
    DISPLAY_FIELDS,
    IDENTITY_FIELDS,
    LAND_COVER_FIELDS,
    OUTPUTS_DIR,
    PROJECT,
    REQUIRED_SHAPEFILE_EXTENSIONS,
    ROOT,
    SCORE_FIELDS,
    SESSIONS_DIR,
)


SESSION_FILE = "session.json"
ORIGINAL_FILE = "original.geojson"
PREVIEW_DIR = OUTPUTS_DIR / "_preview"
EXPORTS_DIR = OUTPUTS_DIR / "exports"
MAP_APP_DIST = ROOT / "map_app" / "dist"
AUTOSAVE_PATH = Path(gettempdir()) / "indot_editor_autosave.json"
FORMAT_VERSION = "1.0"
EXPORTED_MAP_PORT = 8125

LABELS = {
    "SPR_ID": "SPR ID",
    "Site_typ": "Site Type",
    "Unit_Site": "Unit or Site",
    "layer": "District",
    "Volt_Class": "Voltage Class",
    "Flood_Zone": "Flood Zone",
    "SlopeMean": "Mean Slope",
    "Solar_Mean": "Mean Solar Potential",
    "NTran_DIST": "Nearest Transmission Distance",
    "Shape_Area": "Shape Area",
    "sol_s": "Solar Score",
    "slp_s": "Slope Score",
    "trn_s": "Transportation Score",
    "evp_s": "Environmental Score",
    "dem_s": "Demand Score",
    "fld_s": "Flood Score",
    "lc_s": "Land Cover Score",
}


@dataclass(frozen=True)
class SessionPaths:
    """Filesystem locations owned by one editor session."""

    root: Path
    original: Path


def now_iso() -> str:
    """Return a local, second-precision timestamp suitable for session metadata."""

    return datetime.now().isoformat(timespec="seconds")


def clean_value(value: Any) -> Any:
    """Convert pandas/NumPy values into JSON-serializable Python primitives."""

    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def safe_feature_id(index: int) -> str:
    """Create a stable, display-friendly identifier for an imported row."""

    return f"{index:04d}"


def session_paths(session_id: str) -> SessionPaths:
    """Resolve the session root and immutable-layer snapshot directory."""

    root = SESSIONS_DIR / session_id
    return SessionPaths(root=root, original=root / "original")


def session_file(session_id: str) -> Path:
    """Return the JSON state file for a session."""

    return session_paths(session_id).root / SESSION_FILE


def ensure_session(session_id: str) -> dict[str, Any]:
    """Load a session or return a consistent API-level not-found response."""

    path = session_file(session_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Unknown session: {session_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_session(state: dict[str, Any]) -> None:
    """Persist session state and refresh the single recoverable autosave copy."""

    state["last_saved_at"] = now_iso()
    paths = session_paths(state["session_id"])
    paths.root.mkdir(parents=True, exist_ok=True)
    session_file(state["session_id"]).write_text(json.dumps(state, indent=2), encoding="utf-8")
    AUTOSAVE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def original_layer_path(session_id: str, layer_name: str) -> Path:
    """Resolve an imported layer snapshot after validating the configured name."""

    if layer_name not in DATASETS:
        raise HTTPException(status_code=404, detail=f"Unknown layer: {layer_name}")
    return session_paths(session_id).original / layer_name / ORIGINAL_FILE


def read_original_layer(session_id: str, layer_name: str) -> gpd.GeoDataFrame:
    """Read the immutable normalized snapshot used as the edit baseline."""

    path = original_layer_path(session_id, layer_name)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Missing original layer: {layer_name}")
    return gpd.read_file(path)


def write_original_layer(session_id: str, layer_name: str, gdf: gpd.GeoDataFrame) -> None:
    """Write a normalized import snapshot into session-owned storage."""

    path = original_layer_path(session_id, layer_name)
    path.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(path, driver="GeoJSON")


def field_kind(field: str, series: pd.Series | None = None) -> str:
    """Classify a field for editing, validation, and UI presentation."""

    # Semantic project fields take precedence over inferred pandas dtypes.
    if field in DERIVED_FIELDS:
        return "derived"
    if field in SCORE_FIELDS:
        return "score"
    if field in IDENTITY_FIELDS:
        return "required_identity"
    if series is not None and pd.api.types.is_bool_dtype(series):
        return "boolean"
    if series is not None and pd.api.types.is_numeric_dtype(series):
        return "numeric"
    return "text"


def default_label(field: str) -> str:
    """Return the curated display label or a readable fallback."""

    return LABELS.get(field, field.replace("_", " ").strip().title())


def default_field_config(gdf: gpd.GeoDataFrame) -> dict[str, dict[str, Any]]:
    """Build initial visibility, ordering, and validation metadata for a layer."""

    default_visible = [field for field in DISPLAY_FIELDS + SCORE_FIELDS + LAND_COVER_FIELDS if field in gdf.columns]
    config: dict[str, dict[str, Any]] = {}
    order = 0
    for column in gdf.columns:
        # Geometry and the editor's synthetic row key are operational fields,
        # not user-configurable popup attributes.
        if column == gdf.geometry.name or column == "feature_id":
            continue
        kind = field_kind(column, gdf[column])
        visible = column in default_visible and kind != "derived"
        config[column] = {
            "visible": visible,
            "label": default_label(column) if visible else "(internal)" if kind == "derived" else default_label(column),
            "order": order if visible else 10_000 + order,
            "type": kind,
            "required": column in IDENTITY_FIELDS,
            "internal": kind == "derived",
        }
        order += 1
    return config


def shapefile_components_by_stem(files: list[Path]) -> dict[str, set[str]]:
    """Group shapefile sidecars by stem for completeness validation."""

    components: dict[str, set[str]] = {}
    for file_path in files:
        suffix = file_path.suffix.lower()
        if suffix in REQUIRED_SHAPEFILE_EXTENSIONS or suffix == ".cpg":
            components.setdefault(file_path.stem, set()).add(suffix)
    return components


def find_dataset_shapefile(source_folder: Path, dataset_name: str) -> tuple[Path | None, list[str], list[str]]:
    """Locate one configured dataset and verify its required sidecar files."""

    expected_stem = DATASETS[dataset_name]["source_stem"].lower()
    all_files = [path for path in source_folder.rglob("*") if path.is_file()]
    components = shapefile_components_by_stem(all_files)
    warnings: list[str] = []
    errors: list[str] = []

    # Match exact configured stems instead of accepting similarly named files;
    # this prevents silently importing the wrong engineering dataset.
    for stem, exts in components.items():
        if stem.lower() == expected_stem:
            missing = sorted(REQUIRED_SHAPEFILE_EXTENSIONS - exts)
            if missing:
                errors.append(f"Missing required shapefile component(s): {', '.join(missing)}")
                return None, warnings, errors
            shp = next(path for path in all_files if path.stem == stem and path.suffix.lower() == ".shp")
            return shp, warnings, errors

    errors.append(f"Could not find expected shapefile stem '{DATASETS[dataset_name]['source_stem']}'.")
    return None, warnings, errors


def folder_has_expected_stems(folder: Path) -> bool:
    """Return whether a folder tree contains all configured source datasets."""

    if not folder.exists():
        return False
    stems = {
        path.stem.lower()
        for path in folder.rglob("*.shp")
        if path.is_file()
    }
    return all(dataset["source_stem"].lower() in stems for dataset in DATASETS.values())


def resolve_source_folder(selected_folder: Path) -> tuple[Path, list[str]]:
    """Accept either the project root or one child shapefile directory.

    Maintainers commonly select ``All_Candidate_Sites`` itself in the native
    picker. When its parent contains all required datasets, the editor promotes
    the selection to that parent and records the decision for the UI.
    """

    selected_folder = selected_folder.resolve()
    notes: list[str] = []
    if folder_has_expected_stems(selected_folder):
        return selected_folder, notes

    parent = selected_folder.parent
    if parent != selected_folder and folder_has_expected_stems(parent):
        notes.append(
            f"Selected '{selected_folder.name}', so the editor used parent folder '{parent}' because it contains all three required shapefile sets."
        )
        return parent, notes

    return selected_folder, notes


def derive_centers(gdf: gpd.GeoDataFrame) -> pd.DataFrame:
    """Calculate robust WGS84 label/map points inside polygon geometries."""

    # representative_point() remains inside a polygon, unlike a centroid that
    # can fall outside concave parcels or inside holes.
    projected_points = gdf.geometry.representative_point()
    points_4326 = gpd.GeoSeries(projected_points, crs=gdf.crs).to_crs("EPSG:4326")
    return pd.DataFrame({"center_longitude": points_4326.x, "center_latitude": points_4326.y})


def normalize_import_layer(raw: gpd.GeoDataFrame, layer_name: str) -> gpd.GeoDataFrame:
    """Validate and normalize a source layer into the editor's data contract."""

    if raw.crs is None:
        raise HTTPException(status_code=400, detail=f"{DATASETS[layer_name]['title']} has no CRS.")
    unsupported = sorted(set(raw.geometry.geom_type.dropna().unique()) - {"Polygon", "MultiPolygon"})
    if unsupported:
        raise HTTPException(
            status_code=400,
            detail=f"{DATASETS[layer_name]['title']} has unsupported geometry type(s): {', '.join(unsupported)}",
        )

    gdf = raw.copy()
    # Preserve source validity for reporting before repairing geometries. All
    # downstream map and export work uses the repaired WGS84 representation.
    gdf["source_geometry_valid"] = gdf.geometry.is_valid
    gdf.geometry = gdf.geometry.make_valid()
    gdf = gdf.to_crs("EPSG:4326")

    dataset = DATASETS[layer_name]
    gdf["feature_id"] = [safe_feature_id(index) for index in range(len(gdf))]
    gdf["dataset"] = layer_name
    gdf["layer_title"] = dataset["title"]
    gdf["layer_type"] = dataset["layer_type"]
    if "Lat" in gdf.columns:
        gdf["source_latitude"] = gdf["Lat"]
    if "Long" in gdf.columns:
        gdf["source_longitude"] = gdf["Long"]
    centers = derive_centers(gdf)
    gdf["center_longitude"] = centers["center_longitude"].values
    gdf["center_latitude"] = centers["center_latitude"].values
    present_land_cover = [field for field in LAND_COVER_FIELDS if field in gdf.columns]
    if present_land_cover:
        gdf["land_cover_sum"] = gdf[present_land_cover].sum(axis=1, skipna=True)

    # GeoPandas columns may contain NumPy scalars and NaN values that Python's
    # standard JSON serializer cannot represent consistently.
    for column in gdf.columns:
        if column != gdf.geometry.name:
            gdf[column] = gdf[column].map(clean_value)
    return gdf


def import_from_directory(source_folder: Path, session_id: str | None = None) -> dict[str, Any]:
    """Import all required datasets and initialize a clean delta-edit session."""

    source_folder = Path(source_folder).resolve()
    if not source_folder.exists():
        raise HTTPException(status_code=400, detail=f"Folder does not exist: {source_folder}")
    source_folder, source_folder_notes = resolve_source_folder(source_folder)

    session_id = session_id or uuid.uuid4().hex
    paths = session_paths(session_id)
    # Reusing an explicit session ID is treated as a fresh import. Removing the
    # old directory prevents stale layer snapshots from leaking into the session.
    if paths.root.exists():
        shutil.rmtree(paths.root)
    paths.original.mkdir(parents=True, exist_ok=True)

    layers = []
    field_config: dict[str, dict[str, dict[str, Any]]] = {}
    blocking_errors: list[str] = []
    import_notes: list[str] = list(source_folder_notes)
    for layer_name, dataset in DATASETS.items():
        # Collect all layer failures so the user receives one complete import
        # report instead of repeatedly fixing and retrying one dataset at a time.
        shp, warnings, errors = find_dataset_shapefile(source_folder, layer_name)
        if errors or shp is None:
            blocking_errors.extend([f"{dataset['title']}: {error}" for error in errors])
            layers.append(
                {
                    "name": layer_name,
                    "title": dataset["title"],
                    "status": "error",
                    "source_file": str(shp) if shp else "",
                    "records": 0,
                    "crs": "",
                    "geometry_types": [],
                    "valid_geometries": 0,
                    "invalid_geometries": 0,
                "warnings": warnings,
                "errors": errors,
            }
            )
            continue

        raw = gpd.read_file(shp)
        normalized = normalize_import_layer(raw, layer_name)
        write_original_layer(session_id, layer_name, normalized)
        raw_fields = [column for column in raw.columns if column != raw.geometry.name]
        invalid_count = int((~raw.geometry.is_valid).sum())
        field_config[layer_name] = default_field_config(normalized)
        layers.append(
            {
                "name": layer_name,
                "title": dataset["title"],
                "status": "warning" if invalid_count else "ready",
                "source_file": str(shp),
                "records": int(len(raw)),
                "raw_attribute_count": len(raw_fields),
                "crs": str(raw.crs),
                "geometry_types": sorted(raw.geometry.geom_type.dropna().unique().tolist()),
                "valid_geometries": int(raw.geometry.is_valid.sum()),
                "invalid_geometries": invalid_count,
                "warnings": warnings + ([f"{invalid_count} invalid geometries will be repaired during output."] if invalid_count else []),
                "errors": [],
            }
        )

    if blocking_errors:
        raise HTTPException(status_code=400, detail=blocking_errors)

    state = {
        "format_version": FORMAT_VERSION,
        "session_id": session_id,
        "created_at": now_iso(),
        "last_saved_at": now_iso(),
        "source_folder": str(source_folder),
        "field_config": field_config,
        # Deltas are keyed layer -> feature -> field. Keeping them separate from
        # snapshots makes revert, undo, audit, and non-destructive export simple.
        "edits": {layer_name: {} for layer_name in DATASETS},
        "validation_acknowledged_warnings": [],
        "undo_stack": [],
        "redo_stack": [],
        "layers": layers,
        "import_notes": import_notes,
    }
    save_session(state)
    return session_summary(state)


def import_folder(folder_path: str) -> dict[str, Any]:
    """API-friendly wrapper around the pathlib-based import routine."""

    return import_from_directory(Path(folder_path))


def has_autosave() -> dict[str, Any]:
    """Return recoverable autosave metadata without loading a full session."""

    if not AUTOSAVE_PATH.exists():
        return {"available": False}
    try:
        state = json.loads(AUTOSAVE_PATH.read_text(encoding="utf-8"))
        return {
            "available": True,
            "session_id": state.get("session_id"),
            "source_folder": state.get("source_folder"),
            "last_saved_at": state.get("last_saved_at"),
        }
    except json.JSONDecodeError:
        return {"available": False}


def resume_autosave() -> dict[str, Any]:
    """Restore the most recent autosave as the active persisted session."""

    if not AUTOSAVE_PATH.exists():
        raise HTTPException(status_code=404, detail="No autosave session is available.")
    state = json.loads(AUTOSAVE_PATH.read_text(encoding="utf-8"))
    save_session(state)
    return session_summary(state)


def session_summary(state: dict[str, Any]) -> dict[str, Any]:
    """Return UI-facing session metadata without exposing internal edit state."""

    edit_count = sum(len(fields) for layer in state["edits"].values() for fields in layer.values())
    return {
        "session_id": state["session_id"],
        "format_version": state["format_version"],
        "source_folder": state["source_folder"],
        "created_at": state["created_at"],
        "last_saved_at": state["last_saved_at"],
        "layers": state["layers"],
        "import_notes": state.get("import_notes", []),
        "edited_cells": edit_count,
        "autosave_path": str(AUTOSAVE_PATH),
    }


def get_session(session_id: str) -> dict[str, Any]:
    """Load and summarize one persisted session."""

    return session_summary(ensure_session(session_id))


def field_config_for_session(session_id: str) -> dict[str, Any]:
    """Return all layer field configurations for the Fields stage."""

    state = ensure_session(session_id)
    return {"session_id": session_id, "field_config": state["field_config"]}


def update_layer_field_config(session_id: str, layer_name: str, config: dict[str, Any]) -> dict[str, Any]:
    """Apply user-controlled field display settings while preserving invariants."""

    state = ensure_session(session_id)
    if layer_name not in state["field_config"]:
        raise HTTPException(status_code=404, detail=f"Unknown layer: {layer_name}")
    original = state["field_config"][layer_name]
    cleaned: dict[str, dict[str, Any]] = {}
    for field, existing in original.items():
        # Only presentation properties are accepted from the client. Type,
        # required, and internal flags remain server-owned validation metadata.
        incoming = config.get(field, existing)
        cleaned[field] = {
            **existing,
            "visible": bool(incoming.get("visible", existing["visible"])) and not existing.get("internal", False),
            "label": str(incoming.get("label") or existing["label"]),
            "order": int(incoming.get("order", existing["order"])),
        }
    state["field_config"][layer_name] = cleaned
    save_session(state)
    return {"layer": layer_name, "fields": cleaned}


def reset_field_config(session_id: str) -> dict[str, Any]:
    """Rebuild field settings from each immutable imported layer."""

    state = ensure_session(session_id)
    new_config = {}
    for layer_name in DATASETS:
        new_config[layer_name] = default_field_config(read_original_layer(session_id, layer_name))
    state["field_config"] = new_config
    save_session(state)
    return field_config_for_session(session_id)


def visible_fields(state: dict[str, Any], layer_name: str) -> list[str]:
    """Return export/UI fields in the maintainer-defined display order."""

    fields = state["field_config"][layer_name]
    return [
        field
        for field, cfg in sorted(fields.items(), key=lambda item: item[1].get("order", 0))
        if cfg.get("visible") and not cfg.get("internal")
    ]


def feature_edits(state: dict[str, Any], layer_name: str, feature_id: str) -> dict[str, Any]:
    """Read the stored cell deltas for a feature, returning an empty mapping."""

    return state["edits"].get(layer_name, {}).get(feature_id, {})


def merged_properties(state: dict[str, Any], layer_name: str, row: pd.Series) -> dict[str, Any]:
    """Overlay a feature's deltas on its immutable source properties."""

    props = {field: clean_value(row[field]) for field in row.index if field != "geometry"}
    for field, edit in feature_edits(state, layer_name, props["feature_id"]).items():
        props[field] = edit["edited"]
    return props


def validate_value(field: str, value: Any, cfg: dict[str, Any]) -> tuple[Any, str | None]:
    """Coerce one submitted value and report any field-level validation error."""

    kind = cfg.get("type", "text")
    if cfg.get("required") and (value is None or str(value).strip() == ""):
        return value, f"{cfg.get('label', field)} is required."
    if value is None or value == "":
        return None, None
    if kind in {"numeric", "score"}:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return value, f"{cfg.get('label', field)} must be numeric."
        if kind == "score" and not 0 <= number <= 1:
            return number, f"{cfg.get('label', field)} must be between 0 and 1."
        return number, None
    if kind == "boolean":
        if isinstance(value, bool):
            return value, None
        text = str(value).strip().lower()
        if text in {"true", "1", "yes"}:
            return True, None
        if text in {"false", "0", "no"}:
            return False, None
        return value, f"{cfg.get('label', field)} must be true or false."
    return str(value), None


def validate_feature(state: dict[str, Any], layer_name: str, props: dict[str, Any]) -> dict[str, Any]:
    """Validate all editable fields and flag suspicious zero score values."""

    errors: dict[str, str] = {}
    warnings: dict[str, str] = {}
    for field, cfg in state["field_config"][layer_name].items():
        if cfg.get("internal"):
            continue
        value = props.get(field)
        _, error = validate_value(field, value, cfg)
        if error:
            errors[field] = error
        elif cfg.get("type") == "score" and value not in {None, ""}:
            try:
                if float(value) == 0.0:
                    warnings[field] = f"{cfg.get('label', field)} is exactly 0.0; verify this is intentional."
            except (TypeError, ValueError):
                pass
    return {"errors": errors, "warnings": warnings}


def get_layer_records(
    session_id: str,
    layer_name: str,
    query: str = "",
    edited_only: bool = False,
    errors_only: bool = False,
) -> dict[str, Any]:
    """Build filtered table records with merged values, geometry, and validation."""

    state = ensure_session(session_id)
    gdf = read_original_layer(session_id, layer_name)
    fields = visible_fields(state, layer_name)
    query_lower = query.casefold().strip()
    records = []
    for _, row in gdf.iterrows():
        # Filters operate on the merged view so searches and issue counts reflect
        # unsaved-to-output edits rather than only the imported baseline.
        props = merged_properties(state, layer_name, row)
        validation = validate_feature(state, layer_name, props)
        edits = feature_edits(state, layer_name, props["feature_id"])
        row_values = {field: props.get(field) for field in fields}
        if query_lower:
            blob = " ".join(str(value) for value in row_values.values()).casefold()
            if query_lower not in blob:
                continue
        if edited_only and not edits:
            continue
        if errors_only and not validation["errors"]:
            continue
        records.append(
            {
                "feature_id": props["feature_id"],
                "values": row_values,
                "original_values": {field: clean_value(row[field]) for field in fields if field in row.index},
                "edits": edits,
                "validation": validation,
                "geometry": mapping(row.geometry),
            }
        )
    return {
        "layer": layer_name,
        "title": DATASETS[layer_name]["title"],
        "fields": [{"code": field, **state["field_config"][layer_name][field]} for field in fields],
        "records": records,
        "total": len(records),
        "edited_cells": sum(len(record["edits"]) for record in records),
        "error_count": sum(len(record["validation"]["errors"]) for record in records),
    }


def update_cell(session_id: str, layer_name: str, feature_id: str, field_code: str, value: Any) -> dict[str, Any]:
    """Validate and persist one cell delta without mutating source data."""

    state = ensure_session(session_id)
    cfg = state["field_config"].get(layer_name, {}).get(field_code)
    if not cfg or cfg.get("internal"):
        raise HTTPException(status_code=400, detail=f"{field_code} is not editable.")
    coerced, error = validate_value(field_code, value, cfg)
    gdf = read_original_layer(session_id, layer_name)
    match = gdf[gdf["feature_id"] == feature_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Unknown feature: {feature_id}")
    original = clean_value(match.iloc[0][field_code])
    old_edit = state["edits"].get(layer_name, {}).get(feature_id, {}).get(field_code)
    # Store the previous delta, not merely the previous displayed value, so undo
    # can accurately restore either an earlier edit or the unedited state.
    state["undo_stack"].append(
        {"action": "edit", "layer": layer_name, "feature_id": feature_id, "field": field_code, "previous": old_edit}
    )
    state["redo_stack"] = []
    if coerced == original:
        # Values equal to the source are not retained as edits; this keeps edit
        # counts meaningful and naturally implements a manual revert.
        state["edits"].setdefault(layer_name, {}).setdefault(feature_id, {}).pop(field_code, None)
        if not state["edits"][layer_name][feature_id]:
            state["edits"][layer_name].pop(feature_id, None)
    else:
        state["edits"].setdefault(layer_name, {}).setdefault(feature_id, {})[field_code] = {
            "original": original,
            "edited": coerced,
            "timestamp": now_iso(),
        }
    save_session(state)
    return {
        "field_code": field_code,
        "feature_id": feature_id,
        "value": coerced,
        "original": original,
        "validation": {"severity": "error", "message": error} if error else {"severity": "ok", "message": ""},
        "edited_cells": session_summary(state)["edited_cells"],
    }


def revert_field(session_id: str, layer_name: str, feature_id: str, field_code: str) -> dict[str, Any]:
    """Remove one field delta while preserving enough state for undo."""

    state = ensure_session(session_id)
    old_edit = state["edits"].get(layer_name, {}).get(feature_id, {}).get(field_code)
    state["undo_stack"].append({"action": "edit", "layer": layer_name, "feature_id": feature_id, "field": field_code, "previous": old_edit})
    state["edits"].get(layer_name, {}).get(feature_id, {}).pop(field_code, None)
    if feature_id in state["edits"].get(layer_name, {}) and not state["edits"][layer_name][feature_id]:
        state["edits"][layer_name].pop(feature_id, None)
    save_session(state)
    return {"status": "reverted", "feature_id": feature_id, "field_code": field_code}


def revert_feature(session_id: str, layer_name: str, feature_id: str) -> dict[str, Any]:
    """Remove every delta for one feature as a single undoable action."""

    state = ensure_session(session_id)
    previous = state["edits"].get(layer_name, {}).get(feature_id, {})
    state["undo_stack"].append({"action": "row_revert", "layer": layer_name, "feature_id": feature_id, "previous": previous})
    state["edits"].get(layer_name, {}).pop(feature_id, None)
    save_session(state)
    return {"status": "reverted", "feature_id": feature_id}


def undo(session_id: str) -> dict[str, Any]:
    """Reverse the most recent cell edit or row revert."""

    state = ensure_session(session_id)
    if not state["undo_stack"]:
        return {"status": "noop"}
    action = state["undo_stack"].pop()
    state["redo_stack"].append(action)
    layer = action["layer"]
    feature_id = action["feature_id"]
    if action["action"] == "edit":
        field = action["field"]
        if action["previous"] is None:
            state["edits"].get(layer, {}).get(feature_id, {}).pop(field, None)
        else:
            state["edits"].setdefault(layer, {}).setdefault(feature_id, {})[field] = action["previous"]
    elif action["action"] == "row_revert":
        state["edits"].setdefault(layer, {})[feature_id] = action["previous"]
    save_session(state)
    return {"status": "undone"}


def validate_session(session_id: str) -> dict[str, Any]:
    """Validate the fully merged state of every feature in every layer."""

    state = ensure_session(session_id)
    issues = []
    for layer_name in DATASETS:
        gdf = read_original_layer(session_id, layer_name)
        for _, row in gdf.iterrows():
            # Validation must run against materialized properties because a
            # source-valid row can become invalid after a user edit.
            props = merged_properties(state, layer_name, row)
            validation = validate_feature(state, layer_name, props)
            for field, message in validation["errors"].items():
                issues.append({"layer": layer_name, "feature_id": props["feature_id"], "field": field, "issue": message, "severity": "error"})
            for field, message in validation["warnings"].items():
                issues.append({"layer": layer_name, "feature_id": props["feature_id"], "field": field, "issue": message, "severity": "warning"})
    return {
        "valid": not any(issue["severity"] == "error" for issue in issues),
        "issues": issues,
        "errors": [issue for issue in issues if issue["severity"] == "error"],
        "warnings": [issue for issue in issues if issue["severity"] == "warning"],
        "edited_cells": session_summary(state)["edited_cells"],
    }


def materialize_layer(state: dict[str, Any], layer_name: str, popup_labels: bool = False) -> gpd.GeoDataFrame:
    """Create an exportable layer by applying deltas and output field settings."""

    gdf = read_original_layer(state["session_id"], layer_name).copy()
    # Apply deltas only to this in-memory copy. The session's original GeoJSON
    # remains an immutable baseline for later edits and reverts.
    for index, row in gdf.iterrows():
        edits = feature_edits(state, layer_name, row["feature_id"])
        for field, edit in edits.items():
            if field in gdf.columns:
                gdf.at[index, field] = edit["edited"]

    # Re-run geometry repair and derived coordinates at materialization time so
    # previews and exports share one deterministic output pipeline.
    gdf.geometry = gdf.geometry.make_valid()
    gdf = gdf.to_crs("EPSG:4326")
    centers = derive_centers(gdf)
    gdf["center_longitude"] = centers["center_longitude"].values
    gdf["center_latitude"] = centers["center_latitude"].values
    present_land_cover = [field for field in LAND_COVER_FIELDS if field in gdf.columns]
    if present_land_cover:
        gdf["land_cover_sum"] = gdf[present_land_cover].sum(axis=1, skipna=True)

    required_internal = ["dataset", "layer_title", "layer_type", "center_latitude", "center_longitude", "source_geometry_valid"]
    visible = visible_fields(state, layer_name)
    keep = [field for field in visible + required_internal if field in gdf.columns]
    output = gdf[keep + [gdf.geometry.name]].copy()
    if popup_labels:
        rename = {
            field: state["field_config"][layer_name][field]["label"]
            for field in visible
            if field in output.columns
        }
        output = output.rename(columns=rename)
    return output


def write_static_map(output_dir: Path, data_base: str = "./data") -> None:
    """Copy the built map viewer into an output and configure its data location."""

    output_dir.mkdir(parents=True, exist_ok=True)
    map_app_dist = MAP_APP_DIST
    # PyInstaller extracts bundled resources below _MEIPASS; source runs use the
    # repository path. Supporting both keeps preview/export behavior identical.
    if not map_app_dist.exists() and getattr(sys, "frozen", False):
        map_app_dist = Path(getattr(sys, "_MEIPASS")) / "map_app" / "dist"
    if map_app_dist.exists():
        for item in map_app_dist.iterdir():
            target = output_dir / item.name
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
            if item.is_dir():
                shutil.copytree(item, target)
            else:
                shutil.copy2(item, target)
        index_path = output_dir / "index.html"
        index_html = index_path.read_text(encoding="utf-8")
        # Vite emits root-relative asset URLs. Exported packages can be hosted in
        # arbitrary subfolders, so assets and data must be package-relative.
        index_html = index_html.replace('src="/assets/', 'src="./assets/')
        index_html = index_html.replace('href="/assets/', 'href="./assets/')
        data_base_script = f'<script>window.INDOT_DATA_BASE = "{data_base}";</script>\n    '
        index_html = index_html.replace("<title>INDOT Solar Suitability Map</title>", f"<title>INDOT Solar Suitability Map</title>\n    {data_base_script}")
        index_path.write_text(index_html, encoding="utf-8")
    else:
        (output_dir / "index.html").write_text(VIEWER_HTML.replace("__DATA_BASE__", data_base), encoding="utf-8")
    write_exported_map_launchers(output_dir)


def write_exported_map_launchers(output_dir: Path) -> None:
    """Add Windows start/stop scripts and end-user instructions to an export."""

    server_dir = output_dir / "server"
    server_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "Run_Exported_Map.bat").write_text(RUN_EXPORTED_MAP_BAT, encoding="utf-8")
    (output_dir / "Stop_Exported_Map.bat").write_text(STOP_EXPORTED_MAP_BAT, encoding="utf-8")
    (server_dir / "serve_exported_map.ps1").write_text(SERVE_EXPORTED_MAP_PS1, encoding="utf-8")
    (output_dir / "README.txt").write_text(EXPORTED_MAP_README, encoding="utf-8")


def generate_processed_output(session_id: str, output_dir: Path, popup_labels: bool = False) -> dict[str, Any]:
    """Validate and write all deployment GeoJSON plus the shared manifest."""

    state = ensure_session(session_id)
    validation = validate_session(session_id)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation)
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    layers = []
    for layer_name, dataset in DATASETS.items():
        # Every output layer is generated from the same materialization path used
        # by preview, preventing differences between reviewed and exported data.
        gdf = materialize_layer(state, layer_name, popup_labels=popup_labels)
        output_path = data_dir / dataset["output"]
        gdf.to_file(output_path, driver="GeoJSON")
        bounds = gdf.total_bounds.tolist()
        layers.append(
            {
                "name": layer_name,
                "title": dataset["title"],
                "layer_type": dataset["layer_type"],
                "records": int(len(gdf)),
                "bounds": [round(float(value), 6) for value in bounds],
                "source_valid_geometries": int(gdf["source_geometry_valid"].sum()) if "source_geometry_valid" in gdf.columns else 0,
                "fixed_geometries": int((~gdf.geometry.is_valid).sum()),
                "score_fields": [field for field in SCORE_FIELDS if field in gdf.columns],
            }
        )
    manifest = {"project": PROJECT, "generated_at": now_iso(), "layers": layers}
    (data_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def generate_preview(session_id: str) -> dict[str, Any]:
    """Replace the shared preview directory with the current session output."""

    if PREVIEW_DIR.exists():
        shutil.rmtree(PREVIEW_DIR)
    manifest = generate_processed_output(session_id, PREVIEW_DIR, popup_labels=False)
    write_static_map(PREVIEW_DIR, data_base="./data")
    return {
        "status": "ready",
        "preview_url": "/preview/",
        "feature_count": sum(layer["records"] for layer in manifest["layers"]),
        "manifest": manifest,
    }


def export_zip(session_id: str) -> dict[str, Any]:
    """Build a timestamped self-contained static map and ZIP archive."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = OUTPUTS_DIR / f"INDOT_Solar_Map_{timestamp}"
    if output_dir.exists():
        shutil.rmtree(output_dir)
    manifest = generate_processed_output(session_id, output_dir, popup_labels=False)
    write_static_map(output_dir, data_base="./data")
    zip_path = EXPORTS_DIR / f"INDOT_Solar_Map_{timestamp}.zip"
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    # Archive paths are relative to the generated package root so extraction
    # yields a directly runnable map rather than an absolute directory tree.
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in output_dir.rglob("*"):
            archive.write(path, path.relative_to(output_dir))
    state = ensure_session(session_id)
    return {
        "status": "exported",
        "download_token": zip_path.name,
        "download_url": f"/api/export/download/{zip_path.name}",
        "zip_path": str(zip_path),
        "feature_count": sum(layer["records"] for layer in manifest["layers"]),
        "edited_cells": session_summary(state)["edited_cells"],
    }


def export_file_for_token(token: str) -> Path:
    """Resolve a generated ZIP token and reject missing or non-ZIP paths."""

    path = EXPORTS_DIR / token
    if not path.exists() or path.suffix.lower() != ".zip":
        raise HTTPException(status_code=404, detail="Unknown export package.")
    return path


def browse_folder() -> dict[str, str]:
    """Open the native Windows folder picker used by the local-only editor."""

    try:
        import tkinter as tk
        from tkinter import filedialog
    except Exception as exc:  # pragma: no cover - platform-specific fallback
        raise HTTPException(status_code=500, detail=f"Native folder picker is unavailable: {exc}") from exc
    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    folder = filedialog.askdirectory(title="Select the INDOT shapefile parent folder")
    root.destroy()
    return {"folder_path": folder}


RUN_EXPORTED_MAP_BAT = f"""@echo off
setlocal
cd /d "%~dp0"

set PORT={EXPORTED_MAP_PORT}
set ROOT_DIR=%CD%
set PID_FILE=%ROOT_DIR%\\.indot_exported_map.pid

echo Starting INDOT exported map on http://127.0.0.1:%PORT% ...
start "INDOT Exported Map Server" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%\\server\\serve_exported_map.ps1" -Root "%ROOT_DIR%" -Port %PORT% -PidFile "%PID_FILE%"

echo Waiting for map server...
for /l %%i in (1,1,30) do (
  powershell -NoProfile -Command "try {{ $r = Invoke-WebRequest 'http://127.0.0.1:%PORT%/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) {{ exit 0 }} }} catch {{ exit 1 }}"
  if not errorlevel 1 goto ready
  timeout /t 1 /nobreak >nul
)

echo The exported map server did not become ready.
echo If another exported map is already running, use Stop_Exported_Map.bat and try again.
pause
exit /b 1

:ready
start "" "http://127.0.0.1:%PORT%/"
echo Exported map is running at http://127.0.0.1:%PORT%/
echo Use Stop_Exported_Map.bat when finished.
pause
"""


STOP_EXPORTED_MAP_BAT = """@echo off
setlocal
cd /d "%~dp0"

set ROOT_DIR=%CD%
set PID_FILE=%ROOT_DIR%\\.indot_exported_map.pid

if exist "%PID_FILE%" (
  for /f %%p in ('type "%PID_FILE%"') do (
    powershell -NoProfile -Command "Stop-Process -Id %%p -Force -ErrorAction SilentlyContinue"
  )
  del "%PID_FILE%" >nul 2>&1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=(Resolve-Path '.').Path; Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -notlike '* -Command *' -and $_.CommandLine -like '*-File *serve_exported_map.ps1*' -and $_.CommandLine -like ('*' + $root + '*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo INDOT exported map server stopped if it was running.
pause
"""


SERVE_EXPORTED_MAP_PS1 = """param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$Port = 8125,
  [string]$PidFile = ""
)

$ErrorActionPreference = "Stop"
$rootPath = (Resolve-Path -LiteralPath $Root).Path

if ($PidFile) {
  Set-Content -LiteralPath $PidFile -Value $PID -Encoding ASCII
}

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".geojson" = "application/geo+json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
  ".txt" = "text/plain; charset=utf-8"
}

# Write the complete HTTP response manually because exported packages must run
# on Windows without requiring Python, Node.js, IIS, or administrator access.
function Write-HttpResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$HeadOnly = $false
  )

  $reason = @{
    200 = "OK"
    403 = "Forbidden"
    404 = "Not Found"
    405 = "Method Not Allowed"
    500 = "Internal Server Error"
  }[$Status]
  if (-not $reason) { $reason = "OK" }

  $headers = "HTTP/1.1 $Status $reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $HeadOnly -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Write-TextResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$Message,
    [bool]$HeadOnly = $false
  )
  $body = [System.Text.Encoding]::UTF8.GetBytes($Message)
  Write-HttpResponse -Stream $Stream -Status $Status -ContentType "text/plain; charset=utf-8" -Body $body -HeadOnly $HeadOnly
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()

try {
  while ($true) {
    # Serve one short-lived request per connection. The map only needs static
    # GET/HEAD support, so a compact synchronous loop is sufficient.
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()
      while ($true) {
        $header = $reader.ReadLine()
        if ($null -eq $header -or $header -eq "") { break }
      }

      if (-not $requestLine) {
        continue
      }

      $parts = $requestLine.Split(" ")
      if ($parts.Length -lt 2) {
        Write-TextResponse -Stream $stream -Status 500 -Message "Bad request"
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      $urlPath = ($parts[1] -split "\\?")[0]
      $headOnly = $method -eq "HEAD"
      if ($method -ne "GET" -and -not $headOnly) {
        Write-TextResponse -Stream $stream -Status 405 -Message "Method not allowed"
        continue
      }

      $path = [System.Uri]::UnescapeDataString($urlPath)
      if ($path -eq "/" -or $path -eq "") {
        $path = "/index.html"
      }

      $relative = $path.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
      $filePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relative))
      # Reject traversal attempts after canonicalizing the requested path.
      if (-not $filePath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-TextResponse -Stream $stream -Status 403 -Message "Forbidden" -HeadOnly $headOnly
        continue
      }

      if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        Write-TextResponse -Stream $stream -Status 404 -Message "Not found" -HeadOnly $headOnly
        continue
      }

      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if (-not $contentType) {
        $contentType = "application/octet-stream"
      }

      $body = [System.IO.File]::ReadAllBytes($filePath)
      Write-HttpResponse -Stream $stream -Status 200 -ContentType $contentType -Body $body -HeadOnly $headOnly
    } catch {
      try {
        $message = [System.Text.Encoding]::UTF8.GetBytes("Server error")
        Write-HttpResponse -Stream $stream -Status 500 -ContentType "text/plain; charset=utf-8" -Body $message
      } catch {
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
  if ($PidFile -and (Test-Path -LiteralPath $PidFile)) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
  }
}
"""


EXPORTED_MAP_README = """INDOT Solar Suitability Map

This folder contains an exported static map package.

To run it on Windows:

1. Extract the ZIP package first.
2. Open the extracted folder.
3. Double-click Run_Exported_Map.bat.
4. The map should open automatically in your browser.
5. When finished, double-click Stop_Exported_Map.bat.

Do not open index.html directly from the file system. Browser security rules can block the map data files when opened with file://. The Run_Exported_Map.bat launcher starts a small local Windows server so the map behaves like the Phase 1 standalone package.

For web deployment:

Upload all files in this folder to the target public web server folder, then open the deployed URL.
"""


VIEWER_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>INDOT Solar Suitability Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #17202a; }
    .shell { display: grid; grid-template-columns: 360px 1fr; min-height: 100vh; }
    aside { padding: 20px; background: #f8faf9; border-right: 1px solid #d5ddd9; overflow: auto; }
    h1 { margin: 0 0 10px; font-size: 24px; line-height: 1.1; }
    .muted { color: #60706b; font-size: 13px; }
    .layer { display: grid; grid-template-columns: 16px 1fr auto; gap: 10px; align-items: center; margin: 10px 0; }
    .swatch { width: 14px; height: 14px; border-radius: 3px; }
    #map { width: 100%; height: 100vh; }
    .stat { padding: 10px; border: 1px solid #dce3e0; border-radius: 6px; margin: 8px 0; background: white; }
    .popup { display: grid; gap: 4px; min-width: 250px; }
    .popup-row { display: grid; grid-template-columns: 120px 1fr; gap: 8px; border-top: 1px solid #edf2f0; padding-top: 3px; }
    @media (max-width: 800px) { .shell { grid-template-columns: 1fr; } #map { height: 70vh; } }
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <p class="muted">Deployment-ready output</p>
      <h1>INDOT Solar Suitability Map</h1>
      <div id="stats"></div>
      <h2>Layers</h2>
      <div id="layers"></div>
      <input id="search" placeholder="Search all properties" style="width:100%;height:38px;margin-top:14px;padding:0 10px" />
    </aside>
    <main id="map"></main>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    window.INDOT_DATA_BASE = "__DATA_BASE__";
    const colors = { all_candidate_sites: '#0f8b8d', facility_scored: '#6b8f2a', row_scored: '#c7792b' };
    const map = L.map('map').setView([39.76, -86.16], 7);
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
    L.control.layers({ Streets: streets, Satellite: satellite }, {}).addTo(map);
    const groups = {};
    const sourceData = {};
    function popup(feature) {
      const p = feature.properties || {};
      const rows = Object.entries(p).filter(([, value]) => value !== null && typeof value !== 'object').map(([key, value]) => `<div class="popup-row"><strong>${key}</strong><span>${value}</span></div>`).join('');
      return `<div class="popup">${rows}</div>`;
    }
    function matches(feature, query) {
      if (!query) return true;
      return Object.entries(feature.properties || {}).some(([key, value]) => `${key} ${value}`.toLowerCase().includes(query));
    }
    function renderLayers(query = '') {
      Object.values(groups).forEach(group => map.removeLayer(group));
      for (const [name, data] of Object.entries(sourceData)) {
        const filtered = { ...data, features: data.features.filter(feature => matches(feature, query)) };
        groups[name] = L.geoJSON(filtered, {
          style: { color: colors[name] || '#263a33', weight: 2, fillOpacity: 0.24 },
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 7 }),
          onEachFeature: (feature, item) => item.bindPopup(popup(feature))
        }).addTo(map);
      }
    }
    Promise.all([fetch(`${window.INDOT_DATA_BASE}/manifest.json`).then(r => r.json())]).then(async ([manifest]) => {
      document.getElementById('stats').innerHTML = manifest.layers.map(layer =>
        `<div class="stat"><strong>${layer.records}</strong><br><span class="muted">${layer.title}</span></div>`
      ).join('');
      for (const layer of manifest.layers) {
        sourceData[layer.name] = await fetch(`${window.INDOT_DATA_BASE}/${layer.name}.geojson`).then(r => r.json());
        document.getElementById('layers').innerHTML +=
          `<label class="layer"><span class="swatch" style="background:${colors[layer.name] || '#263a33'}"></span><span>${layer.title}</span></label>`;
      }
      renderLayers();
      const all = Object.values(groups).reduce((bounds, group) => bounds.extend(group.getBounds()), L.latLngBounds());
      if (all.isValid()) map.fitBounds(all.pad(0.08));
      document.getElementById('search').addEventListener('input', event => renderLayers(event.target.value.toLowerCase()));
    });
  </script>
</body>
</html>
"""
