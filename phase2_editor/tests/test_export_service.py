from __future__ import annotations

import json
import sys
from pathlib import Path
from zipfile import ZipFile

from fastapi.testclient import TestClient


EDITOR_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = EDITOR_ROOT.parent
BACKEND_ROOT = EDITOR_ROOT / "backend"
PHASE1_ROOT = REPO_ROOT / "phase1_map"
sys.path.insert(0, str(BACKEND_ROOT))

from editor_api.main import app  # noqa: E402


def test_preview_generates_manifest_and_edited_geojson() -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})
    layer = client.get("/api/layers/facility_scored").json()
    feature_id = layer["features"][0]["feature_id"]
    edited_name = "Edited Facility For Preview"
    client.patch(
        f"/api/layers/facility_scored/{feature_id}",
        json={"field_code": "Unit_Site", "value": edited_name},
    )

    preview_response = client.post("/api/preview/generate")
    manifest_response = client.get("/preview/data/manifest.json")
    geojson_response = client.get("/preview/data/facility_scored.geojson")

    assert preview_response.status_code == 200
    assert preview_response.json()["manifest"]["feature_count"] == 207
    assert manifest_response.status_code == 200
    assert geojson_response.status_code == 200
    geojson = geojson_response.json()
    properties = [feature["properties"] for feature in geojson["features"]]
    assert any(item.get("Unit_Site") == edited_name for item in properties)


def test_export_creates_downloadable_zip() -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})

    response = client.post("/api/export")

    assert response.status_code == 200
    payload = response.json()
    zip_path = Path(payload["zip_path"])
    assert zip_path.exists()
    with ZipFile(zip_path) as archive:
        names = set(archive.namelist())
        assert "index.html" in names
        assert "README.txt" in names
        assert "data/manifest.json" in names
        manifest = json.loads(archive.read("data/manifest.json"))
        assert manifest["feature_count"] == 207

