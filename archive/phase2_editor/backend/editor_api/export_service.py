from __future__ import annotations

import json
import shutil
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any
from zipfile import ZIP_DEFLATED, ZipFile

import geopandas as gpd
import pandas as pd

from .session_store import INTERNAL_FIELDS, SessionStore, clean_value


class ExportManager:
    def __init__(self, editor_root: Path, phase1_root: Path) -> None:
        self.editor_root = editor_root
        self.phase1_root = phase1_root
        self.work_root = Path(tempfile.gettempdir()) / "indot_solar_editor_exports"
        self.work_root.mkdir(parents=True, exist_ok=True)
        self.preview_dir: Path | None = None
        self.exports: dict[str, Path] = {}

    def generate_preview(self, store: SessionStore) -> dict[str, Any]:
        store.require_session()
        output_dir = self.work_root / f"preview_{uuid.uuid4().hex}"
        if output_dir.exists():
            shutil.rmtree(output_dir)
        output_dir.mkdir(parents=True)
        self._assemble_static_app(output_dir)
        data_dir = output_dir / "data"
        manifest = materialize_data(store, data_dir)
        self.preview_dir = output_dir
        return {
            "preview_ready": True,
            "preview_dir": str(output_dir),
            "preview_url": "/preview/",
            "data_url": "/preview/data/manifest.json",
            "manifest": manifest,
        }

    def export_zip(self, store: SessionStore) -> dict[str, Any]:
        preview = self.generate_preview(store)
        assert self.preview_dir is not None
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_path = self.work_root / f"INDOT_Solar_Map_{timestamp}.zip"
        with ZipFile(zip_path, "w", compression=ZIP_DEFLATED) as archive:
            for path in self.preview_dir.rglob("*"):
                if path.is_file():
                    archive.write(path, path.relative_to(self.preview_dir))
        token = uuid.uuid4().hex
        self.exports[token] = zip_path
        return {
            "token": token,
            "zip_path": str(zip_path),
            "download_url": f"/api/export/download/{token}",
            "preview": preview,
        }

    def export_path(self, token: str) -> Path:
        if token not in self.exports:
            raise KeyError("Unknown export token.")
        return self.exports[token]

    def preview_file(self, relative_path: str) -> Path:
        if self.preview_dir is None:
            raise RuntimeError("Preview has not been generated.")
        path = (self.preview_dir / relative_path).resolve()
        if not path.is_relative_to(self.preview_dir.resolve()):
            raise ValueError("Invalid preview path.")
        return path

    def _assemble_static_app(self, output_dir: Path) -> None:
        map_dist = self.editor_root / "map_app" / "dist"
        source_dist = map_dist if map_dist.exists() else self.phase1_root / "dist"
        if source_dist.exists():
            for item in source_dist.iterdir():
                destination = output_dir / item.name
                if item.is_dir():
                    shutil.copytree(item, destination)
                else:
                    shutil.copy2(item, destination)
        else:
            (output_dir / "index.html").write_text("<!doctype html><title>INDOT Solar Map</title><div id=\"root\"></div>", encoding="utf-8")
        _inject_data_base(output_dir / "index.html")
        (output_dir / "README.txt").write_text(
            "Upload all files in this folder to a static web server. Open index.html through that server, not directly from a ZIP file.\n",
            encoding="utf-8",
        )


def materialize_data(store: SessionStore, data_dir: Path) -> dict[str, Any]:
    session = store.require_session()
    data_dir.mkdir(parents=True, exist_ok=True)
    layers = []
    total_features = 0

    for layer_name, layer_state in store.layers.items():
        web_gdf = layer_state.gdf.copy()
        web_gdf.geometry = web_gdf.geometry.make_valid()
        web_gdf = web_gdf.to_crs("EPSG:4326")

        records = []
        for feature_id in layer_state.original_records:
            record = store.materialized_record(layer_name, feature_id)
            record.pop("_edited_fields", None)
            records.append(record)
        properties = pd.DataFrame(records)

        centers = web_gdf.geometry.representative_point()
        properties["center_longitude"] = centers.x
        properties["center_latitude"] = centers.y
        properties["dataset"] = layer_name
        properties["layer_title"] = layer_state.config.title
        properties["layer_type"] = layer_state.config.layer_type

        visible_fields = visible_field_names(session.field_config[layer_name])
        requested_fields = list(dict.fromkeys(visible_fields + [field for field in INTERNAL_FIELDS if field in properties.columns]))
        keep_fields = [field for field in requested_fields if field in properties.columns]
        output_gdf = gpd.GeoDataFrame(properties[keep_fields], geometry=web_gdf.geometry, crs="EPSG:4326")
        for column in output_gdf.columns:
            if column != output_gdf.geometry.name:
                output_gdf[column] = output_gdf[column].map(clean_value)

        output_name = layer_state.config.shapefile_name.replace(".shp", ".geojson")
        configured_output = next(
            (raw["output"] for name, raw in store.config["datasets"].items() if name == layer_name),
            output_name,
        )
        output_gdf.to_file(data_dir / configured_output, driver="GeoJSON")

        source_valid = int(layer_state.gdf["source_geometry_valid"].sum())
        fixed = int((~layer_state.gdf["source_geometry_valid"]).sum())
        count = int(len(output_gdf))
        total_features += count
        layers.append(
            {
                "name": layer_name,
                "title": layer_state.config.title,
                "layer_type": layer_state.config.layer_type,
                "records": count,
                "bounds": [round(float(value), 6) for value in output_gdf.total_bounds.tolist()],
                "source_valid_geometries": source_valid,
                "fixed_geometries": fixed,
                "score_fields": [field for field in store.config.get("score_fields", []) if field in output_gdf.columns],
                "output": configured_output,
            }
        )

    manifest = {
        "project": store.config["project"],
        "generated_at": datetime.now().isoformat(),
        "feature_count": total_features,
        "layers": layers,
    }
    with (data_dir / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    return manifest


def visible_field_names(field_config: dict[str, dict[str, Any]]) -> list[str]:
    return [
        field_name
        for field_name, _ in sorted(field_config.items(), key=lambda item: int(item[1].get("order", 0)))
        if _.get("visible", False)
    ]


def _inject_data_base(index_path: Path) -> None:
    if not index_path.exists():
        return
    html = index_path.read_text(encoding="utf-8")
    marker = '<script>window.INDOT_DATA_BASE="./data";</script>'
    if "window.INDOT_DATA_BASE" in html:
        return
    html = html.replace("<head>", f"<head>{marker}", 1) if "<head>" in html else marker + html
    index_path.write_text(html, encoding="utf-8")
