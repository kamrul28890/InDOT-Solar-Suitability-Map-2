from __future__ import annotations

import json
import shutil
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
    SCORE_FIELDS,
    SESSIONS_DIR,
)


SESSION_FILE = "session.json"
ORIGINAL_FILE = "original.geojson"
PREVIEW_DIR = OUTPUTS_DIR / "_preview"
EXPORTS_DIR = OUTPUTS_DIR / "exports"
AUTOSAVE_PATH = Path(gettempdir()) / "indot_editor_autosave.json"
FORMAT_VERSION = "1.0"

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
    root: Path
    original: Path


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def clean_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def safe_feature_id(index: int) -> str:
    return f"{index:04d}"


def session_paths(session_id: str) -> SessionPaths:
    root = SESSIONS_DIR / session_id
    return SessionPaths(root=root, original=root / "original")


def session_file(session_id: str) -> Path:
    return session_paths(session_id).root / SESSION_FILE


def ensure_session(session_id: str) -> dict[str, Any]:
    path = session_file(session_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Unknown session: {session_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_session(state: dict[str, Any]) -> None:
    state["last_saved_at"] = now_iso()
    paths = session_paths(state["session_id"])
    paths.root.mkdir(parents=True, exist_ok=True)
    session_file(state["session_id"]).write_text(json.dumps(state, indent=2), encoding="utf-8")
    AUTOSAVE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def original_layer_path(session_id: str, layer_name: str) -> Path:
    if layer_name not in DATASETS:
        raise HTTPException(status_code=404, detail=f"Unknown layer: {layer_name}")
    return session_paths(session_id).original / layer_name / ORIGINAL_FILE


def read_original_layer(session_id: str, layer_name: str) -> gpd.GeoDataFrame:
    path = original_layer_path(session_id, layer_name)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Missing original layer: {layer_name}")
    return gpd.read_file(path)


def write_original_layer(session_id: str, layer_name: str, gdf: gpd.GeoDataFrame) -> None:
    path = original_layer_path(session_id, layer_name)
    path.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(path, driver="GeoJSON")


def field_kind(field: str, series: pd.Series | None = None) -> str:
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
    return LABELS.get(field, field.replace("_", " ").strip().title())


def default_field_config(gdf: gpd.GeoDataFrame) -> dict[str, dict[str, Any]]:
    default_visible = [field for field in DISPLAY_FIELDS + SCORE_FIELDS + LAND_COVER_FIELDS if field in gdf.columns]
    config: dict[str, dict[str, Any]] = {}
    order = 0
    for column in gdf.columns:
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
    components: dict[str, set[str]] = {}
    for file_path in files:
        suffix = file_path.suffix.lower()
        if suffix in REQUIRED_SHAPEFILE_EXTENSIONS or suffix == ".cpg":
            components.setdefault(file_path.stem, set()).add(suffix)
    return components


def find_dataset_shapefile(source_folder: Path, dataset_name: str) -> tuple[Path | None, list[str], list[str]]:
    expected_stem = DATASETS[dataset_name]["source_stem"].lower()
    all_files = [path for path in source_folder.rglob("*") if path.is_file()]
    components = shapefile_components_by_stem(all_files)
    warnings: list[str] = []
    errors: list[str] = []

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
    if not folder.exists():
        return False
    stems = {
        path.stem.lower()
        for path in folder.rglob("*.shp")
        if path.is_file()
    }
    return all(dataset["source_stem"].lower() in stems for dataset in DATASETS.values())


def resolve_source_folder(selected_folder: Path) -> tuple[Path, list[str]]:
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
    projected_points = gdf.geometry.representative_point()
    points_4326 = gpd.GeoSeries(projected_points, crs=gdf.crs).to_crs("EPSG:4326")
    return pd.DataFrame({"center_longitude": points_4326.x, "center_latitude": points_4326.y})


def normalize_import_layer(raw: gpd.GeoDataFrame, layer_name: str) -> gpd.GeoDataFrame:
    if raw.crs is None:
        raise HTTPException(status_code=400, detail=f"{DATASETS[layer_name]['title']} has no CRS.")
    unsupported = sorted(set(raw.geometry.geom_type.dropna().unique()) - {"Polygon", "MultiPolygon"})
    if unsupported:
        raise HTTPException(
            status_code=400,
            detail=f"{DATASETS[layer_name]['title']} has unsupported geometry type(s): {', '.join(unsupported)}",
        )

    gdf = raw.copy()
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

    for column in gdf.columns:
        if column != gdf.geometry.name:
            gdf[column] = gdf[column].map(clean_value)
    return gdf


def import_from_directory(source_folder: Path, session_id: str | None = None) -> dict[str, Any]:
    source_folder = Path(source_folder).resolve()
    if not source_folder.exists():
        raise HTTPException(status_code=400, detail=f"Folder does not exist: {source_folder}")
    source_folder, source_folder_notes = resolve_source_folder(source_folder)

    session_id = session_id or uuid.uuid4().hex
    paths = session_paths(session_id)
    if paths.root.exists():
        shutil.rmtree(paths.root)
    paths.original.mkdir(parents=True, exist_ok=True)

    layers = []
    field_config: dict[str, dict[str, dict[str, Any]]] = {}
    blocking_errors: list[str] = []
    import_notes: list[str] = list(source_folder_notes)
    for layer_name, dataset in DATASETS.items():
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
    return import_from_directory(Path(folder_path))


def has_autosave() -> dict[str, Any]:
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
    if not AUTOSAVE_PATH.exists():
        raise HTTPException(status_code=404, detail="No autosave session is available.")
    state = json.loads(AUTOSAVE_PATH.read_text(encoding="utf-8"))
    save_session(state)
    return session_summary(state)


def session_summary(state: dict[str, Any]) -> dict[str, Any]:
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
    return session_summary(ensure_session(session_id))


def field_config_for_session(session_id: str) -> dict[str, Any]:
    state = ensure_session(session_id)
    return {"session_id": session_id, "field_config": state["field_config"]}


def update_layer_field_config(session_id: str, layer_name: str, config: dict[str, Any]) -> dict[str, Any]:
    state = ensure_session(session_id)
    if layer_name not in state["field_config"]:
        raise HTTPException(status_code=404, detail=f"Unknown layer: {layer_name}")
    original = state["field_config"][layer_name]
    cleaned: dict[str, dict[str, Any]] = {}
    for field, existing in original.items():
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
    state = ensure_session(session_id)
    new_config = {}
    for layer_name in DATASETS:
        new_config[layer_name] = default_field_config(read_original_layer(session_id, layer_name))
    state["field_config"] = new_config
    save_session(state)
    return field_config_for_session(session_id)


def visible_fields(state: dict[str, Any], layer_name: str) -> list[str]:
    fields = state["field_config"][layer_name]
    return [
        field
        for field, cfg in sorted(fields.items(), key=lambda item: item[1].get("order", 0))
        if cfg.get("visible") and not cfg.get("internal")
    ]


def feature_edits(state: dict[str, Any], layer_name: str, feature_id: str) -> dict[str, Any]:
    return state["edits"].get(layer_name, {}).get(feature_id, {})


def merged_properties(state: dict[str, Any], layer_name: str, row: pd.Series) -> dict[str, Any]:
    props = {field: clean_value(row[field]) for field in row.index if field != "geometry"}
    for field, edit in feature_edits(state, layer_name, props["feature_id"]).items():
        props[field] = edit["edited"]
    return props


def validate_value(field: str, value: Any, cfg: dict[str, Any]) -> tuple[Any, str | None]:
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
    state = ensure_session(session_id)
    gdf = read_original_layer(session_id, layer_name)
    fields = visible_fields(state, layer_name)
    query_lower = query.casefold().strip()
    records = []
    for _, row in gdf.iterrows():
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
    state["undo_stack"].append(
        {"action": "edit", "layer": layer_name, "feature_id": feature_id, "field": field_code, "previous": old_edit}
    )
    state["redo_stack"] = []
    if coerced == original:
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
    state = ensure_session(session_id)
    old_edit = state["edits"].get(layer_name, {}).get(feature_id, {}).get(field_code)
    state["undo_stack"].append({"action": "edit", "layer": layer_name, "feature_id": feature_id, "field": field_code, "previous": old_edit})
    state["edits"].get(layer_name, {}).get(feature_id, {}).pop(field_code, None)
    if feature_id in state["edits"].get(layer_name, {}) and not state["edits"][layer_name][feature_id]:
        state["edits"][layer_name].pop(feature_id, None)
    save_session(state)
    return {"status": "reverted", "feature_id": feature_id, "field_code": field_code}


def revert_feature(session_id: str, layer_name: str, feature_id: str) -> dict[str, Any]:
    state = ensure_session(session_id)
    previous = state["edits"].get(layer_name, {}).get(feature_id, {})
    state["undo_stack"].append({"action": "row_revert", "layer": layer_name, "feature_id": feature_id, "previous": previous})
    state["edits"].get(layer_name, {}).pop(feature_id, None)
    save_session(state)
    return {"status": "reverted", "feature_id": feature_id}


def undo(session_id: str) -> dict[str, Any]:
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
    state = ensure_session(session_id)
    issues = []
    for layer_name in DATASETS:
        gdf = read_original_layer(session_id, layer_name)
        for _, row in gdf.iterrows():
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
    gdf = read_original_layer(state["session_id"], layer_name).copy()
    for index, row in gdf.iterrows():
        edits = feature_edits(state, layer_name, row["feature_id"])
        for field, edit in edits.items():
            if field in gdf.columns:
                gdf.at[index, field] = edit["edited"]

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
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "index.html").write_text(VIEWER_HTML.replace("__DATA_BASE__", data_base), encoding="utf-8")
    (output_dir / "README.txt").write_text(
        "INDOT Solar Suitability Map\n\nUnzip this package and upload all files to your public web server folder. Open index.html or the deployed URL to verify the map.\n",
        encoding="utf-8",
    )


def generate_processed_output(session_id: str, output_dir: Path, popup_labels: bool = False) -> dict[str, Any]:
    state = ensure_session(session_id)
    validation = validate_session(session_id)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation)
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    layers = []
    for layer_name, dataset in DATASETS.items():
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
    if PREVIEW_DIR.exists():
        shutil.rmtree(PREVIEW_DIR)
    manifest = generate_processed_output(session_id, PREVIEW_DIR, popup_labels=True)
    write_static_map(PREVIEW_DIR, data_base="./data")
    return {
        "status": "ready",
        "preview_url": "/preview/",
        "feature_count": sum(layer["records"] for layer in manifest["layers"]),
        "manifest": manifest,
    }


def export_zip(session_id: str) -> dict[str, Any]:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = OUTPUTS_DIR / f"INDOT_Solar_Map_{timestamp}"
    if output_dir.exists():
        shutil.rmtree(output_dir)
    manifest = generate_processed_output(session_id, output_dir, popup_labels=True)
    write_static_map(output_dir, data_base="./data")
    zip_path = EXPORTS_DIR / f"INDOT_Solar_Map_{timestamp}.zip"
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
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
    path = EXPORTS_DIR / token
    if not path.exists() or path.suffix.lower() != ".zip":
        raise HTTPException(status_code=404, detail="Unknown export package.")
    return path


def browse_folder() -> dict[str, str]:
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
