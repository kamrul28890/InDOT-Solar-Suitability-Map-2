from __future__ import annotations

import json
import zipfile
from pathlib import Path

import pytest
from fastapi import HTTPException

from editor_backend import service


INDOT_ROOT = Path(__file__).resolve().parents[2] / "InDOT"


def patch_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "SESSIONS_DIR", tmp_path / "sessions")
    monkeypatch.setattr(service, "OUTPUTS_DIR", tmp_path / "outputs")
    monkeypatch.setattr(service, "PREVIEW_DIR", tmp_path / "outputs" / "_preview")
    monkeypatch.setattr(service, "EXPORTS_DIR", tmp_path / "outputs" / "exports")
    monkeypatch.setattr(service, "AUTOSAVE_PATH", tmp_path / "autosave.json")


def test_import_current_indot_shapefiles_creates_delta_session(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    result = service.import_from_directory(INDOT_ROOT, session_id="test-import")

    counts = {layer["name"]: layer["records"] for layer in result["layers"]}
    assert counts == {
        "all_candidate_sites": 104,
        "facility_scored": 58,
        "row_scored": 45,
    }
    assert result["edited_cells"] == 0
    assert service.AUTOSAVE_PATH.exists()

    fields = service.field_config_for_session("test-import")["field_config"]["facility_scored"]
    assert fields["sol_s"]["type"] == "score"
    assert fields["sol_s"]["visible"] is True
    assert fields["center_latitude"]["internal"] is True


def test_import_from_child_shapefile_folder_uses_parent_when_siblings_exist(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    result = service.import_from_directory(INDOT_ROOT / "All_Candidate_Sites", session_id="test-child-folder")

    assert result["source_folder"] == str(INDOT_ROOT.resolve())
    assert result["import_notes"]
    counts = {layer["name"]: layer["records"] for layer in result["layers"]}
    assert counts["facility_scored"] == 58
    assert counts["row_scored"] == 45


def test_cell_edit_is_delta_and_can_revert(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    service.import_from_directory(INDOT_ROOT, session_id="test-edit")
    records = service.get_layer_records("test-edit", "facility_scored")
    feature_id = records["records"][0]["feature_id"]
    original = records["records"][0]["values"]["Solar_Mean"]

    response = service.update_cell("test-edit", "facility_scored", feature_id, "Solar_Mean", "12345")
    assert response["validation"]["severity"] == "ok"
    edited = service.get_layer_records("test-edit", "facility_scored")["records"][0]
    assert edited["values"]["Solar_Mean"] == 12345.0
    assert edited["original_values"]["Solar_Mean"] == original

    service.revert_field("test-edit", "facility_scored", feature_id, "Solar_Mean")
    reverted = service.get_layer_records("test-edit", "facility_scored")["records"][0]
    assert reverted["values"]["Solar_Mean"] == original


def test_score_validation_blocks_export(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    service.import_from_directory(INDOT_ROOT, session_id="test-score")
    feature_id = service.get_layer_records("test-score", "facility_scored")["records"][0]["feature_id"]
    service.update_cell("test-score", "facility_scored", feature_id, "sol_s", "2.5")

    validation = service.validate_session("test-score")
    assert validation["valid"] is False
    assert any("between 0 and 1" in issue["issue"] for issue in validation["errors"])
    with pytest.raises(HTTPException):
        service.export_zip("test-score")


def test_preview_and_export_zip(tmp_path, monkeypatch):
    patch_storage(tmp_path, monkeypatch)
    service.import_from_directory(INDOT_ROOT, session_id="test-export")
    feature_id = service.get_layer_records("test-export", "facility_scored")["records"][0]["feature_id"]
    service.update_cell("test-export", "facility_scored", feature_id, "Unit_Site", "Edited Test Facility")

    preview = service.generate_preview("test-export")
    assert preview["feature_count"] == 207
    assert (service.PREVIEW_DIR / "index.html").exists()
    assert (service.PREVIEW_DIR / "data" / "facility_scored.geojson").exists()

    exported = service.export_zip("test-export")
    zip_path = Path(exported["zip_path"])
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as archive:
        names = set(archive.namelist())
        assert "index.html" in names
        assert "data/manifest.json" in names
        assert "data/facility_scored.geojson" in names
        facility = json.loads(archive.read("data/facility_scored.geojson").decode("utf-8"))
        assert any(
            feature["properties"].get("Unit or Site") == "Edited Test Facility"
            for feature in facility["features"]
        )
