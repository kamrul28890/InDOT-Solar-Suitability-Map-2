from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient


EDITOR_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = EDITOR_ROOT.parent
BACKEND_ROOT = EDITOR_ROOT / "backend"
PHASE1_ROOT = REPO_ROOT / "phase1_map"
sys.path.insert(0, str(BACKEND_ROOT))

from editor_api.main import app  # noqa: E402


def test_validate_reports_geometry_warnings_for_clean_import() -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})

    response = client.post("/api/validate")

    assert response.status_code == 200
    payload = response.json()
    assert payload["valid"] is True
    assert payload["error_count"] == 0
    assert payload["warning_count"] == 2


def test_validate_blocks_invalid_score_edit() -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})
    layer = client.get("/api/layers/facility_scored").json()
    feature_id = layer["features"][0]["feature_id"]

    client.patch(
        f"/api/layers/facility_scored/{feature_id}",
        json={"field_code": "sol_s", "value": 99},
    )
    response = client.post("/api/validate")

    assert response.status_code == 200
    payload = response.json()
    assert payload["valid"] is False
    assert payload["error_count"] == 1
    error = next(issue for issue in payload["issues"] if issue["severity"] == "error")
    assert error["field"] == "sol_s"
