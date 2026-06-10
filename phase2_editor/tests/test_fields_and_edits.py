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


def imported_client() -> TestClient:
    client = TestClient(app)
    response = client.post("/api/import", json={"path": str(PHASE1_ROOT)})
    assert response.status_code == 200
    return client


def test_field_config_can_be_replaced_and_reset() -> None:
    client = imported_client()

    fields_response = client.get("/api/fields/all_candidate_sites")
    fields = fields_response.json()["fields"]
    fields["SPR_ID"]["label"] = "SPR Identifier"
    fields["SPR_ID"]["order"] = 99

    put_response = client.put("/api/fields/all_candidate_sites", json=fields)
    reset_response = client.post("/api/fields/reset")

    assert fields_response.status_code == 200
    assert put_response.status_code == 200
    assert put_response.json()["fields"]["SPR_ID"]["label"] == "SPR Identifier"
    assert reset_response.status_code == 200
    assert reset_response.json()["field_config"]["all_candidate_sites"]["SPR_ID"]["label"] == "Spr Id"


def test_layer_records_edit_and_revert_flow() -> None:
    client = imported_client()
    layer = client.get("/api/layers/facility_scored").json()
    feature = layer["features"][0]
    feature_id = feature["feature_id"]
    original_value = feature["Unit_Site"]
    edited_value = f"{original_value} Edited"

    edit_response = client.patch(
        f"/api/layers/facility_scored/{feature_id}",
        json={"field_code": "Unit_Site", "value": edited_value},
    )
    edited_layer = client.get("/api/layers/facility_scored").json()
    edited_feature = next(item for item in edited_layer["features"] if item["feature_id"] == feature_id)
    revert_response = client.delete(f"/api/layers/facility_scored/{feature_id}/edits/Unit_Site")
    reverted_layer = client.get("/api/layers/facility_scored").json()
    reverted_feature = next(item for item in reverted_layer["features"] if item["feature_id"] == feature_id)

    assert edit_response.status_code == 200
    assert edit_response.json()["edit_count"] == 1
    assert edited_feature["Unit_Site"] == edited_value
    assert edited_feature["_edited_fields"] == ["Unit_Site"]
    assert revert_response.status_code == 200
    assert revert_response.json()["edit_count"] == 0
    assert reverted_feature["Unit_Site"] == original_value
    assert reverted_feature["_edited_fields"] == []

