from __future__ import annotations

from pathlib import Path
import re

from fastapi.testclient import TestClient

from editor_backend import main, service


INDOT_ROOT = Path(__file__).resolve().parents[2] / "phase1_map"


def patch_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "SESSIONS_DIR", tmp_path / "sessions")
    monkeypatch.setattr(service, "OUTPUTS_DIR", tmp_path / "outputs")
    monkeypatch.setattr(service, "PREVIEW_DIR", tmp_path / "outputs" / "_preview")
    monkeypatch.setattr(service, "EXPORTS_DIR", tmp_path / "outputs" / "exports")
    monkeypatch.setattr(service, "AUTOSAVE_PATH", tmp_path / "autosave.json")
    monkeypatch.setattr(main, "PREVIEW_DIR", service.PREVIEW_DIR)


def test_editor_api_import_edit_validate_preview_export(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    client = TestClient(main.app)

    assert client.get("/health").json()["status"] == "ok"

    imported = client.post("/api/import", json={"folder_path": str(INDOT_ROOT)}).json()
    session_id = imported["session_id"]
    assert {layer["records"] for layer in imported["layers"]} == {104, 58, 45}

    fields = client.get(f"/api/fields/{session_id}").json()
    assert fields["field_config"]["facility_scored"]["sol_s"]["type"] == "score"

    records = client.get(f"/api/layers/{session_id}/facility_scored").json()
    feature_id = records["records"][0]["feature_id"]
    edit = client.patch(
        f"/api/layers/{session_id}/facility_scored/{feature_id}",
        json={"field_code": "Unit_Site", "value": "API Edited Facility"},
    ).json()
    assert edit["validation"]["severity"] == "ok"

    validation = client.post(f"/api/validate/{session_id}").json()
    assert validation["valid"] is True

    preview = client.post(f"/api/preview/generate/{session_id}").json()
    assert preview["feature_count"] == 207
    preview_index = client.get("/preview/")
    assert preview_index.status_code == 200
    asset_match = re.search(r'src="\./(assets/[^"]+\.js)"', preview_index.text)
    assert asset_match
    assert client.get(f"/preview/{asset_match.group(1)}").status_code == 200

    exported = client.post(f"/api/export/{session_id}").json()
    assert exported["download_url"].endswith(".zip")
    assert client.get(exported["download_url"]).status_code == 200
