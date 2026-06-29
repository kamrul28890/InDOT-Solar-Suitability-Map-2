from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import geopandas as gpd


REQUIRED_SIDECARS = (".shp", ".dbf", ".shx", ".prj")


@dataclass(frozen=True)
class EditorDatasetConfig:
    name: str
    title: str
    folder: str
    shapefile_name: str
    layer_type: str

    @property
    def source_relative_path(self) -> Path:
        return Path(self.folder) / self.shapefile_name


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def dataset_configs(config: dict[str, Any]) -> list[EditorDatasetConfig]:
    datasets: list[EditorDatasetConfig] = []
    for name, raw in config["datasets"].items():
        source = Path(raw["source"])
        datasets.append(
            EditorDatasetConfig(
                name=name,
                title=raw["title"],
                folder=source.parent.as_posix(),
                shapefile_name=source.name,
                layer_type=raw["layer_type"],
            )
        )
    return datasets


def resolve_project_folder(selected_path: Path, datasets: list[EditorDatasetConfig]) -> Path:
    selected = selected_path.expanduser().resolve()
    if selected.is_file():
        selected = selected.parent

    if _contains_all_dataset_folders(selected, datasets):
        return selected

    if selected.name in {dataset.folder for dataset in datasets}:
        parent = selected.parent
        if _contains_all_dataset_folders(parent, datasets):
            return parent

    return selected


def inspect_import_folder(selected_path: Path, config_path: Path) -> dict[str, Any]:
    config = load_config(config_path)
    datasets = dataset_configs(config)
    project_folder = resolve_project_folder(selected_path, datasets)

    layers = []
    missing_layers = []
    for dataset in datasets:
        layer_result = inspect_dataset(project_folder, dataset)
        layers.append(layer_result)
        if not layer_result["exists"]:
            missing_layers.append(dataset.name)

    return {
        "selected_path": str(selected_path),
        "project_folder": str(project_folder),
        "valid": not missing_layers,
        "missing_layers": missing_layers,
        "layers": layers,
    }


def inspect_dataset(project_folder: Path, dataset: EditorDatasetConfig) -> dict[str, Any]:
    source = project_folder / dataset.source_relative_path
    sidecars = _sidecar_status(source)
    exists = all(sidecars.values())

    result: dict[str, Any] = {
        "name": dataset.name,
        "title": dataset.title,
        "layer_type": dataset.layer_type,
        "source_path": str(source),
        "exists": exists,
        "sidecars": sidecars,
    }

    if not exists:
        result.update(
            {
                "records": 0,
                "crs": None,
                "geometry_types": [],
                "columns": [],
                "source_valid_geometries": 0,
                "fixed_geometries": 0,
                "bounds": None,
            }
        )
        return result

    gdf = gpd.read_file(source)
    if gdf.crs is None:
        raise ValueError(f"{dataset.name} has no CRS; cannot safely import for web mapping.")

    geometry_valid = gdf.geometry.is_valid
    fixed_geometry_count = int((~geometry_valid).sum())
    web_gdf = gdf.copy()
    web_gdf.geometry = web_gdf.geometry.make_valid()
    web_gdf = web_gdf.to_crs("EPSG:4326")
    bounds = [round(float(value), 6) for value in web_gdf.total_bounds.tolist()]

    result.update(
        {
            "records": int(len(gdf)),
            "crs": str(gdf.crs),
            "geometry_types": sorted(str(value) for value in gdf.geometry.geom_type.dropna().unique()),
            "columns": [str(column) for column in gdf.columns if column != gdf.geometry.name],
            "source_valid_geometries": int(geometry_valid.sum()),
            "fixed_geometries": fixed_geometry_count,
            "bounds": bounds,
        }
    )
    return result


def _contains_all_dataset_folders(path: Path, datasets: list[EditorDatasetConfig]) -> bool:
    return all((path / dataset.folder).is_dir() for dataset in datasets)


def _sidecar_status(shapefile_path: Path) -> dict[str, bool]:
    stem = shapefile_path.with_suffix("")
    return {suffix: stem.with_suffix(suffix).exists() for suffix in REQUIRED_SIDECARS}

