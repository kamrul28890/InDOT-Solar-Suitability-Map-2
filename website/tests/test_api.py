from __future__ import annotations

import pytest
pytest.importorskip("geopandas")

from fastapi.testclient import TestClient

from app.api.main import app
from scripts.export_app_data import export_app_data


client = TestClient(app)


def setup_module() -> None:
    export_app_data()
    client.post("/api/cache/clear")


def test_health_reports_layers():
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "facility_scored" in body["layers"]


def test_manifest_and_stats_are_consistent():
    manifest = client.get("/api/manifest").json()
    stats = client.get("/api/stats").json()

    assert len(manifest["layers"]) == stats["layer_count"]
    assert stats["feature_count"] == 207
    assert stats["fixed_geometries"] == 2


def test_layer_endpoint_returns_geojson():
    response = client.get("/api/layers/facility_scored")

    assert response.status_code == 200
    body = response.json()
    assert body["type"] == "FeatureCollection"
    assert len(body["features"]) == 58


def test_unknown_layer_returns_404():
    response = client.get("/api/layers/not_a_layer")

    assert response.status_code == 404
