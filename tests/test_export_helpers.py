import math
from pathlib import Path

import pytest
pytest.importorskip("geopandas")

import geopandas as gpd
from shapely.geometry import Polygon

from scripts.export_app_data import (
    DatasetConfig,
    derive_centers,
    normalize_properties,
    build_stats,
)


def make_gdf(geometries, props=None, crs="EPSG:4326"):
    props = props or {}
    gdf = gpd.GeoDataFrame(props, geometry=geometries, crs=crs)
    return gdf


def test_derive_centers_simple_polygon():
    poly = Polygon([(0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)])
    gdf = make_gdf([poly])
    centers = derive_centers(gdf)
    rep = poly.representative_point()
    assert math.isclose(centers.loc[0, "center_longitude"], rep.x, rel_tol=1e-9)
    assert math.isclose(centers.loc[0, "center_latitude"], rep.y, rel_tol=1e-9)


def test_normalize_properties_scores_and_centers():
    poly = Polygon([(10.0, 10.0), (11.0, 10.0), (11.0, 11.0), (10.0, 11.0)])
    props = {"sol_s": [1.0], "slp_s": [0.5], "Lat": [0.0], "Long": [0.0]}
    gdf = make_gdf([poly], props=props)

    dataset = DatasetConfig(name="test", title="Test", source=Path("."), output="out", public=True, layer_type="unit")
    config = {"display_fields": [], "score_fields": ["sol_s", "slp_s"], "land_cover_fields": []}

    normalized = normalize_properties(gdf, dataset, config)

    assert "score_mean" not in normalized.columns
    assert normalized.loc[0, "dataset"] == "test"
    assert "center_longitude" in normalized.columns and "center_latitude" in normalized.columns


def test_build_stats_counts_and_fixed_geometries():
    polys = [
        Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),
        Polygon([(2, 0), (3, 0), (3, 1), (2, 1)]),
        Polygon([(4, 0), (5, 0), (5, 1), (4, 1)]),
    ]
    gdf = make_gdf(polys, props={"sol_s": [0.2, 0.4, 0.6]})
    # simulate source validity column used by exporter
    gdf["source_geometry_valid"] = [True, False, True]

    dataset = DatasetConfig(name="test2", title="Test2", source=Path("."), output="out", public=True, layer_type="unit")
    config = {"score_fields": ["sol_s"]}

    stats = build_stats(gdf, dataset, config)

    assert stats["records"] == 3
    assert stats["source_valid_geometries"] == 2
    assert stats["fixed_geometries"] == 1
    assert "score_mean_min" not in stats
    assert "score_mean_max" not in stats
