from __future__ import annotations

import json
import tempfile
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd

from .import_service import EditorDatasetConfig, dataset_configs, inspect_import_folder, load_config


FORMAT_VERSION = "1.0"
INTERNAL_FIELDS = {
    "dataset",
    "layer_title",
    "layer_type",
    "feature_id",
    "center_longitude",
    "center_latitude",
    "source_geometry_valid",
    "source_latitude",
    "source_longitude",
    "land_cover_sum",
}


@dataclass
class LayerState:
    config: EditorDatasetConfig
    gdf: gpd.GeoDataFrame
    original_records: dict[str, dict[str, Any]]
    geometry_column: str


@dataclass
class EditorSession:
    session_id: str
    created_at: str
    last_saved_at: str
    source_folder: str
    import_summary: dict[str, Any]
    field_config: dict[str, dict[str, dict[str, Any]]]
    edits: dict[str, dict[str, dict[str, dict[str, Any]]]]
    validation_acknowledged_warnings: list[dict[str, str]] = field(default_factory=list)


class SessionStore:
    def __init__(self, config_path: Path, autosave_dir: Path | None = None) -> None:
        self.config_path = config_path
        self.config = load_config(config_path)
        self.datasets = dataset_configs(self.config)
        self.autosave_dir = autosave_dir or Path(tempfile.gettempdir()) / "indot_solar_editor"
        self.autosave_dir.mkdir(parents=True, exist_ok=True)
        self.session: EditorSession | None = None
        self.layers: dict[str, LayerState] = {}
        self.autosave_path: Path | None = None

    def import_project(self, selected_path: Path) -> dict[str, Any]:
        summary = inspect_import_folder(selected_path, self.config_path)
        if not summary["valid"]:
            missing = ", ".join(summary["missing_layers"])
            raise ValueError(f"Cannot import project; missing required layers: {missing}")

        project_folder = Path(summary["project_folder"])
        self.layers = {}
        for dataset in self.datasets:
            self.layers[dataset.name] = self._load_layer(project_folder, dataset)

        now = utc_now()
        session = EditorSession(
            session_id=str(uuid.uuid4()),
            created_at=now,
            last_saved_at=now,
            source_folder=str(project_folder),
            import_summary=summary,
            field_config=self.default_field_config(),
            edits={dataset.name: {} for dataset in self.datasets},
        )
        self.session = session
        self.autosave_path = self.autosave_dir / f"{session.session_id}.autosave.json"
        self.autosave()
        return self.summary()

    def get_session(self) -> dict[str, Any]:
        self.require_session()
        return self.to_json(include_records=False)

    def reset(self) -> dict[str, Any]:
        session = self.require_session()
        session.field_config = self.default_field_config()
        session.edits = {dataset.name: {} for dataset in self.datasets}
        session.validation_acknowledged_warnings = []
        session.last_saved_at = utc_now()
        self.autosave()
        return self.summary()

    def save(self, file_path: Path) -> dict[str, Any]:
        self.require_session()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        payload = self.to_json(include_records=False)
        payload["last_saved_at"] = utc_now()
        with file_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        assert self.session is not None
        self.session.last_saved_at = payload["last_saved_at"]
        self.autosave()
        return {"saved": True, "file_path": str(file_path), "session": self.summary()}

    def load(self, file_path: Path) -> dict[str, Any]:
        with file_path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        if payload.get("format_version") != FORMAT_VERSION:
            raise ValueError("Unsupported session file format.")

        source_folder = Path(payload["source_folder"])
        summary = inspect_import_folder(source_folder, self.config_path)
        if not summary["valid"]:
            raise ValueError("Session source folder no longer contains all required layers.")

        self.layers = {}
        for dataset in self.datasets:
            self.layers[dataset.name] = self._load_layer(source_folder, dataset)

        self.session = EditorSession(
            session_id=payload["session_id"],
            created_at=payload["created_at"],
            last_saved_at=utc_now(),
            source_folder=str(source_folder.resolve()),
            import_summary=summary,
            field_config=payload.get("field_config") or self.default_field_config(),
            edits=payload.get("edits") or {dataset.name: {} for dataset in self.datasets},
            validation_acknowledged_warnings=payload.get("validation_acknowledged_warnings", []),
        )
        self.autosave_path = self.autosave_dir / f"{self.session.session_id}.autosave.json"
        self.autosave()
        return self.summary()

    def default_field_config(self) -> dict[str, dict[str, dict[str, Any]]]:
        display_fields = list(self.config.get("display_fields", []))
        score_fields = list(self.config.get("score_fields", []))
        land_cover_fields = list(self.config.get("land_cover_fields", []))
        visible_order = display_fields + [field for field in score_fields if field not in display_fields]
        known_fields = visible_order + [field for field in land_cover_fields if field not in visible_order]
        defaults: dict[str, dict[str, dict[str, Any]]] = {}

        for dataset in self.datasets:
            layer_fields: dict[str, dict[str, Any]] = {}
            columns = list(self.layers.get(dataset.name).original_records.values())[0].keys() if dataset.name in self.layers else known_fields
            ordered_columns = list(dict.fromkeys(known_fields + [field for field in columns if field not in known_fields]))
            for index, field_name in enumerate(ordered_columns):
                layer_fields[field_name] = {
                    "visible": field_name in visible_order,
                    "label": label_for_field(field_name),
                    "order": index,
                    "required": field_name in self.config.get("identity_fields", []),
                    "editable": field_name not in INTERNAL_FIELDS,
                }
            defaults[dataset.name] = layer_fields
        return defaults

    def get_field_config(self, layer_name: str) -> dict[str, dict[str, Any]]:
        session = self.require_session()
        self.require_layer(layer_name)
        return session.field_config[layer_name]

    def set_field_config(self, layer_name: str, field_config: dict[str, dict[str, Any]]) -> dict[str, Any]:
        session = self.require_session()
        self.require_layer(layer_name)
        for field_name, raw in field_config.items():
            if not isinstance(raw.get("label", ""), str) or not raw.get("label", "").strip():
                raise ValueError(f"Field {field_name} must have a non-empty label.")
            raw["visible"] = bool(raw.get("visible", False))
            raw["order"] = int(raw.get("order", 0))
            raw["required"] = bool(raw.get("required", False))
            raw["editable"] = bool(raw.get("editable", field_name not in INTERNAL_FIELDS))
        session.field_config[layer_name] = field_config
        session.last_saved_at = utc_now()
        self.autosave()
        return {"layer_name": layer_name, "fields": session.field_config[layer_name]}

    def reset_fields(self) -> dict[str, Any]:
        session = self.require_session()
        session.field_config = self.default_field_config()
        session.last_saved_at = utc_now()
        self.autosave()
        return {"field_config": session.field_config}

    def list_layer_features(self, layer_name: str) -> dict[str, Any]:
        layer = self.require_layer(layer_name)
        features = [self.materialized_record(layer_name, feature_id) for feature_id in layer.original_records]
        return {"layer_name": layer_name, "features": features}

    def materialized_record(self, layer_name: str, feature_id: str) -> dict[str, Any]:
        session = self.require_session()
        layer = self.require_layer(layer_name)
        if feature_id not in layer.original_records:
            raise KeyError(f"Unknown feature {feature_id}")
        record = dict(layer.original_records[feature_id])
        for field_name, edit in session.edits.get(layer_name, {}).get(feature_id, {}).items():
            record[field_name] = edit["edited"]
        record["_edited_fields"] = sorted(session.edits.get(layer_name, {}).get(feature_id, {}).keys())
        return record

    def apply_edit(self, layer_name: str, feature_id: str, field_code: str, value: Any) -> dict[str, Any]:
        session = self.require_session()
        layer = self.require_layer(layer_name)
        if feature_id not in layer.original_records:
            raise KeyError(f"Unknown feature {feature_id}")
        if field_code not in layer.original_records[feature_id]:
            raise KeyError(f"Unknown field {field_code}")
        if field_code in INTERNAL_FIELDS:
            raise ValueError(f"Field {field_code} is internal and cannot be edited.")

        original = layer.original_records[feature_id][field_code]
        layer_edits = session.edits.setdefault(layer_name, {})
        feature_edits = layer_edits.setdefault(feature_id, {})
        if value == original:
            feature_edits.pop(field_code, None)
        else:
            feature_edits[field_code] = {"original": original, "edited": value, "timestamp": utc_now()}
        if not feature_edits:
            layer_edits.pop(feature_id, None)

        session.last_saved_at = utc_now()
        self.autosave()
        return {
            "layer_name": layer_name,
            "feature_id": feature_id,
            "field_code": field_code,
            "value": value,
            "original": original,
            "edited_fields": sorted(session.edits.get(layer_name, {}).get(feature_id, {}).keys()),
            "edit_count": self.edit_count(),
        }

    def revert_feature(self, layer_name: str, feature_id: str) -> dict[str, Any]:
        session = self.require_session()
        self.require_layer(layer_name)
        session.edits.get(layer_name, {}).pop(feature_id, None)
        session.last_saved_at = utc_now()
        self.autosave()
        return {"layer_name": layer_name, "feature_id": feature_id, "edit_count": self.edit_count()}

    def revert_field(self, layer_name: str, feature_id: str, field_code: str) -> dict[str, Any]:
        session = self.require_session()
        self.require_layer(layer_name)
        session.edits.get(layer_name, {}).get(feature_id, {}).pop(field_code, None)
        if not session.edits.get(layer_name, {}).get(feature_id, {}):
            session.edits.get(layer_name, {}).pop(feature_id, None)
        session.last_saved_at = utc_now()
        self.autosave()
        return {"layer_name": layer_name, "feature_id": feature_id, "field_code": field_code, "edit_count": self.edit_count()}

    def edit_count(self) -> int:
        session = self.require_session()
        return sum(len(fields) for features in session.edits.values() for fields in features.values())

    def summary(self) -> dict[str, Any]:
        session = self.require_session()
        return {
            "session_id": session.session_id,
            "source_folder": session.source_folder,
            "created_at": session.created_at,
            "last_saved_at": session.last_saved_at,
            "autosave_path": str(self.autosave_path) if self.autosave_path else None,
            "layer_count": len(self.layers),
            "edit_count": self.edit_count(),
            "layers": session.import_summary["layers"],
        }

    def to_json(self, include_records: bool = False) -> dict[str, Any]:
        session = self.require_session()
        payload: dict[str, Any] = {
            "format_version": FORMAT_VERSION,
            "session_id": session.session_id,
            "created_at": session.created_at,
            "last_saved_at": session.last_saved_at,
            "source_folder": session.source_folder,
            "field_config": session.field_config,
            "edits": session.edits,
            "validation_acknowledged_warnings": session.validation_acknowledged_warnings,
            "import_summary": session.import_summary,
            "autosave_path": str(self.autosave_path) if self.autosave_path else None,
        }
        if include_records:
            payload["original_records"] = {name: state.original_records for name, state in self.layers.items()}
        return payload

    def autosave(self) -> None:
        if not self.autosave_path:
            return
        with self.autosave_path.open("w", encoding="utf-8") as handle:
            json.dump(self.to_json(include_records=False), handle, indent=2)

    def require_session(self) -> EditorSession:
        if self.session is None:
            raise RuntimeError("No editor session is loaded.")
        return self.session

    def require_layer(self, layer_name: str) -> LayerState:
        self.require_session()
        if layer_name not in self.layers:
            raise KeyError(f"Unknown layer: {layer_name}")
        return self.layers[layer_name]

    def _load_layer(self, project_folder: Path, dataset: EditorDatasetConfig) -> LayerState:
        source = project_folder / dataset.source_relative_path
        gdf = gpd.read_file(source)
        if gdf.crs is None:
            raise ValueError(f"{dataset.name} has no CRS; cannot safely import for web mapping.")
        gdf = gdf.copy()
        gdf["source_geometry_valid"] = gdf.geometry.is_valid
        gdf["feature_id"] = feature_ids_for(gdf, dataset.name)
        gdf["dataset"] = dataset.name
        gdf["layer_title"] = dataset.title
        gdf["layer_type"] = dataset.layer_type

        records: dict[str, dict[str, Any]] = {}
        for _, row in gdf.drop(columns=[gdf.geometry.name]).iterrows():
            record = {str(column): clean_value(value) for column, value in row.items()}
            records[str(record["feature_id"])] = record
        return LayerState(config=dataset, gdf=gdf, original_records=records, geometry_column=gdf.geometry.name)


def feature_ids_for(gdf: gpd.GeoDataFrame, layer_name: str) -> list[str]:
    if "SPR_ID" in gdf.columns and gdf["SPR_ID"].notna().all() and gdf["SPR_ID"].astype(str).is_unique:
        return [str(value) for value in gdf["SPR_ID"]]
    return [f"{layer_name}-{index + 1:05d}" for index in range(len(gdf))]


def clean_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def label_for_field(field_name: str) -> str:
    return field_name.replace("_", " ").strip().title()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

