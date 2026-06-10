from __future__ import annotations

import json
import pytest

pytest.importorskip("geopandas")

from scripts.export_app_data import DEFAULT_CONFIG, export_app_data


def test_export_app_data_writes_expected_layers(tmp_path):
    manifest = export_app_data(DEFAULT_CONFIG, tmp_path)

    assert len(manifest["layers"]) == 3
    assert {layer["name"] for layer in manifest["layers"]} == {
        "all_candidate_sites",
        "facility_scored",
        "row_scored",
    }

    for layer in manifest["layers"]:
        geojson_path = tmp_path / f"{layer['name']}.geojson"
        assert geojson_path.exists()
        data = json.loads(geojson_path.read_text(encoding="utf-8"))
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) == layer["records"]
        assert data["features"][0]["geometry"]["type"] in {"Polygon", "MultiPolygon"}
        assert "center_latitude" in data["features"][0]["properties"]
        assert "center_longitude" in data["features"][0]["properties"]

    assert (tmp_path / "manifest.json").exists()


def test_export_fixes_known_invalid_geometries(tmp_path):
    manifest = export_app_data(DEFAULT_CONFIG, tmp_path)
    fixed = {layer["name"]: layer["fixed_geometries"] for layer in manifest["layers"]}

    assert fixed["all_candidate_sites"] == 1
    assert fixed["facility_scored"] == 0
    assert fixed["row_scored"] == 1
