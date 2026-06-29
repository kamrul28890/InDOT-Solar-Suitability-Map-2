from __future__ import annotations

"""Convert source INDOT shapefiles into the public map's stable data contract."""

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "field_mapping.json"
DEFAULT_OUTPUT = ROOT / "data" / "processed"


@dataclass(frozen=True)
class DatasetConfig:
    """Resolved configuration for one exported public-map layer."""

    name: str
    title: str
    source: Path
    output: str
    public: bool
    layer_type: str


def load_config(path: Path) -> dict[str, Any]:
    """Read the field and dataset mapping that controls the export."""

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def dataset_configs(config: dict[str, Any]) -> list[DatasetConfig]:
    """Resolve raw dataset entries into typed, repository-relative settings."""

    datasets = []
    for name, raw in config["datasets"].items():
        datasets.append(
            DatasetConfig(
                name=name,
                title=raw["title"],
                source=ROOT / raw["source"],
                output=raw["output"],
                public=bool(raw.get("public", True)),
                layer_type=raw["layer_type"],
            )
        )
    return datasets


def derive_centers(gdf: gpd.GeoDataFrame) -> pd.DataFrame:
    """Derive WGS84 points guaranteed to lie inside polygon features."""

    # Representative points stay inside polygons, which makes popups and search
    # pins more reliable than using centroids for irregular right-of-way parcels.
    projected_points = gdf.geometry.representative_point()
    points_4326 = gpd.GeoSeries(projected_points, crs=gdf.crs).to_crs("EPSG:4326")
    return pd.DataFrame(
        {
            "center_longitude": points_4326.x,
            "center_latitude": points_4326.y,
        }
    )


def clean_value(value: Any) -> Any:
    """Convert pandas/NumPy nulls and scalars to JSON-safe Python values."""

    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def normalize_properties(gdf: gpd.GeoDataFrame, dataset: DatasetConfig, config: dict[str, Any]) -> gpd.GeoDataFrame:
    """Project a repaired source layer into the documented browser schema."""

    display_fields = config["display_fields"]
    score_fields = config["score_fields"]
    land_cover_fields = config["land_cover_fields"]
    provenance_fields = ["source_geometry_valid"]
    keep_fields = [
        field
        for field in display_fields + score_fields + land_cover_fields + provenance_fields
        if field in gdf.columns
    ]

    # Export only approved public fields plus provenance. This avoids leaking
    # incidental source columns and keeps browser payloads predictable.
    normalized = gdf[keep_fields + [gdf.geometry.name]].copy()
    normalized["dataset"] = dataset.name
    normalized["layer_title"] = dataset.title
    normalized["layer_type"] = dataset.layer_type

    centers = derive_centers(gdf)
    normalized["center_longitude"] = centers["center_longitude"].values
    normalized["center_latitude"] = centers["center_latitude"].values

    if "Lat" in gdf.columns:
        normalized["source_latitude"] = gdf["Lat"]
    if "Long" in gdf.columns:
        normalized["source_longitude"] = gdf["Long"]

    present_land_cover = [field for field in land_cover_fields if field in normalized.columns]
    if present_land_cover:
        normalized["land_cover_sum"] = normalized[present_land_cover].sum(axis=1, skipna=True)

    # Fiona/GeoJSON serialization is more reliable after normalizing pandas and
    # NumPy values to standard Python primitives.
    for column in normalized.columns:
        if column != normalized.geometry.name:
            normalized[column] = normalized[column].map(clean_value)

    return normalized


def load_dataset(dataset: DatasetConfig) -> gpd.GeoDataFrame:
    """Read one source shapefile and repair geometry on an in-memory copy."""

    if not dataset.source.exists():
        raise FileNotFoundError(f"Missing source shapefile for {dataset.name}: {dataset.source}")

    gdf = gpd.read_file(dataset.source)
    if gdf.crs is None:
        raise ValueError(f"{dataset.name} has no CRS; cannot safely export for web mapping.")

    # The source has at least one self-intersection. make_valid preserves usable
    # geometry for web rendering while retaining the original source shapefiles.
    gdf = gdf.copy()
    gdf["source_geometry_valid"] = gdf.geometry.is_valid
    gdf.geometry = gdf.geometry.make_valid()
    return gdf


def write_geojson(gdf: gpd.GeoDataFrame, output_path: Path) -> None:
    """Write a browser-ready WGS84 GeoJSON layer."""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    web_gdf = gdf.to_crs("EPSG:4326")
    web_gdf.to_file(output_path, driver="GeoJSON")


def build_stats(gdf: gpd.GeoDataFrame, dataset: DatasetConfig, config: dict[str, Any]) -> dict[str, Any]:
    """Build manifest metadata used for display, popups, counts, and bounds."""

    score_fields = [field for field in config.get("score_fields", []) if field in gdf.columns]
    popup_label_map = {
        "SPR_ID": "SPR ID",
        "Site_typ": "Type",
        "layer": "District",
        "Solar_Mean": "Solar mean",
    }
    score_label_map = {
        "sol_s": "Solar score",
        "slp_s": "Slope score",
        "trn_s": "Access score",
        "evp_s": "Evapotranspiration score",
        "dem_s": "Terrain / elevation score",
        "fld_s": "Flood score",
        "lc_s": "Land-cover score",
    }
    popup_fields = [
        {
            "field": field,
            "label": popup_label_map[field],
            "type": "number" if field == "Solar_Mean" else "text",
            **({"precision": 0} if field == "Solar_Mean" else {}),
        }
        for field in popup_label_map
        if field in gdf.columns
    ]
    bounds = gdf.to_crs("EPSG:4326").total_bounds.tolist()
    stats: dict[str, Any] = {
        "name": dataset.name,
        "title": dataset.title,
        "layer_type": dataset.layer_type,
        "records": int(len(gdf)),
        "bounds": [round(float(value), 6) for value in bounds],
        "source_valid_geometries": int(gdf["source_geometry_valid"].sum()),
        "fixed_geometries": int((~gdf["source_geometry_valid"]).sum()),
        "geometry_type": gdf.geometry.geom_type.dropna().mode().iloc[0].lower() if not gdf.empty else "polygon",
        "color": {
            "all_candidate_sites": "#59636f",
            "facility_scored": "#0f8b8d",
            "row_scored": "#b45309",
        }.get(dataset.name, "#2563eb"),
        "label_field": "Unit_Site" if "Unit_Site" in gdf.columns else "",
        "subgroup_field": "layer" if "layer" in gdf.columns else "",
        "popup_fields": popup_fields,
        "score_fields": [{"field": field, "label": score_label_map.get(field, field.replace("_", " ").strip().title())} for field in score_fields],
        "score_color_field": None,
    }
    return stats


def export_app_data(config_path: Path = DEFAULT_CONFIG, output_dir: Path = DEFAULT_OUTPUT) -> dict[str, Any]:
    """Export every configured layer and write their shared manifest."""

    config = load_config(config_path)
    layer_stats = []

    for dataset in dataset_configs(config):
        # All layers follow one read -> normalize -> write -> describe pipeline,
        # keeping the manifest synchronized with the actual GeoJSON outputs.
        raw_gdf = load_dataset(dataset)
        normalized = normalize_properties(raw_gdf, dataset, config)
        write_geojson(normalized, output_dir / dataset.output)
        layer_stats.append(build_stats(normalized, dataset, config))

    manifest = {
        "project": config["project"],
        "layers": layer_stats,
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)

    return manifest


def parse_args() -> argparse.Namespace:
    """Parse optional configuration and output overrides for automation."""

    parser = argparse.ArgumentParser(description="Export INDOT shapefiles to app-ready GeoJSON layers.")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> None:
    """Run the exporter and print a concise build result."""

    args = parse_args()
    manifest = export_app_data(args.config, args.output)
    print(f"Wrote {len(manifest['layers'])} layers to {args.output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
